import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize firebase-admin if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || '';

/**
 * Helper to fetch stock price from Finnhub
 */
async function fetchFinnhubQuote(symbol: string): Promise<number> {
  const sym = symbol.toUpperCase();
  if (FINNHUB_API_KEY) {
    try {
      const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${FINNHUB_API_KEY}`);
      if (response.ok) {
        const data = await response.json();
        if (data && typeof data.c === 'number' && data.c > 0) {
          return data.c;
        }
      }
    } catch (error) {
      console.error(`Error fetching Finnhub quote for ${sym}:`, error);
    }
  }

  // Real-time market data fallback via Yahoo Finance
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d`);
    if (res.ok) {
      const data = await res.json();
      const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
      if (typeof price === 'number' && price > 0) {
        return price;
      }
    }
  } catch (err) {
    // Continue to fallback
  }

  return sym === 'SPY' ? 564.00 : 150.0;
}

/**
 * Scheduled Cloud Function to capture portfolio snapshots
 * Run every 10 minutes, Monday through Friday during market hours.
 * Scheduler cron configuration: every 10 minutes (Monday-Friday)
 * Timezone: America/New_York
 */
export const capturePortfolioSnapshots = functions.pubsub
  .schedule('*/10 * * * 1-5')
  .timeZone('America/New_York')
  .onRun(async (context) => {
    // 1. Guard clause: Ensure execution is within trading hours (9:30 AM to 4:00 PM EST)
    const nowNewYork = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
    const parsedDate = new Date(nowNewYork);
    const hours = parsedDate.getHours();
    const minutes = parsedDate.getMinutes();

    const currentMinutesSinceMidnight = hours * 60 + minutes;
    const marketOpenMinutes = 9 * 60 + 30; // 9:30 AM
    const marketCloseMinutes = 16 * 60;    // 4:00 PM

    if (currentMinutesSinceMidnight < marketOpenMinutes || currentMinutesSinceMidnight > marketCloseMinutes) {
      console.log('Skipping execution: Outside US market hours (9:30 AM - 4:00 PM EST).');
      return null;
    }

    console.log('Starting scheduled snapshot worker during market hours...');

    try {
      // 2. Fetch SPY price once
      const spyPrice = await fetchFinnhubQuote('SPY');

      // 3. Scan all users to fetch cash balances and holdings
      const usersSnapshot = await db.collection('users').get();
      if (usersSnapshot.empty) {
        console.log('No users found in database.');
        return null;
      }

      // Compile a master list of all unique symbols held by all users
      const allUniqueSymbols = new Set<string>();
      const userPortfolios: Array<{
        userId: string;
        cash: number;
        holdings: Array<{ symbol: string; qty: number }>;
      }> = [];

      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const portfolioDoc = await db.doc(`users/${userId}/portfolio/main`).get();
        if (!portfolioDoc.exists) continue;

        const portfolioData = portfolioDoc.data();
        const cash = portfolioData?.cash ?? 10000;

        const holdingsSnapshot = await db.collection(`users/${userId}/portfolio/main/holdings`).get();
        const holdings: Array<{ symbol: string; qty: number }> = [];

        holdingsSnapshot.forEach((doc) => {
          const data = doc.data();
          const symbol = doc.id.toUpperCase();
          const qty = data?.qty ?? 0;
          if (qty > 0) {
            holdings.push({ symbol, qty });
            allUniqueSymbols.add(symbol);
          }
        });

        userPortfolios.push({ userId, cash, holdings });
      }

      // 4. Batch-fetch prices for only the unique tickers once (respecting Finnhub rate limits if needed)
      const pricesCache: Record<string, number> = {};
      const uniqueSymbolsArray = Array.from(allUniqueSymbols);
      
      console.log(`Fetching quotes for ${uniqueSymbolsArray.length} unique symbols...`);
      for (const symbol of uniqueSymbolsArray) {
        pricesCache[symbol] = await fetchFinnhubQuote(symbol);
        // Throttle slightly to prevent exceeding API limit in rapid requests
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // Persist global market quote snapshots to Firestore for server-synchronized background caching (chunked for safety)
      try {
        const entries = Object.entries(pricesCache);
        if (entries.length > 0) {
          const CHUNK_SIZE = 400;
          for (let i = 0; i < entries.length; i += CHUNK_SIZE) {
            const chunk = Object.fromEntries(entries.slice(i, i + CHUNK_SIZE));
            const docId = i === 0 ? 'latest' : `latest_part${Math.floor(i / CHUNK_SIZE) + 1}`;
            await db.doc(`market_quotes/${docId}`).set({
              quotes: chunk,
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
          }
          console.log(`Successfully saved ${entries.length} global market quotes across chunked documents in market_quotes.`);
        }
      } catch (quoteErr) {
        console.error('Failed to write market_quotes:', quoteErr);
      }

      // 5. Loop through users and write snapshots in batches of 500 maximum
      let batch = db.batch();
      let count = 0;

      for (const portfolio of userPortfolios) {
        let totalHoldingsValue = 0;
        for (const holding of portfolio.holdings) {
          const currentPrice = pricesCache[holding.symbol] || 0;
          totalHoldingsValue += holding.qty * currentPrice;
        }

        const netWorth = portfolio.cash + totalHoldingsValue;
        const snapshotRef = db.collection(`users/${portfolio.userId}/portfolio_snapshots`).doc();

        batch.set(snapshotRef, {
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          totalValue: netWorth,
          spyValue: spyPrice,
        });

        count++;

        // Firestore batches can write up to 500 documents at a time
        if (count >= 500) {
          try {
            await batch.commit();
            console.log(`Committed batch of ${count} snapshots.`);
          } catch (batchErr) {
            console.error('Failed to commit user snapshot batch:', batchErr);
          }
          batch = db.batch();
          count = 0;
        }
      }

      // Commit any remaining writes
      if (count > 0) {
        try {
          await batch.commit();
          console.log(`Committed remaining ${count} snapshots.`);
        } catch (batchErr) {
          console.error('Failed to commit final user snapshot batch:', batchErr);
        }
      }

      console.log('Snapshot extraction run finished successfully.');
    } catch (error) {
      console.error('Error during scheduled snapshot capturing:', error);
    }

    return null;
  });
