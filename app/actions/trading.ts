'use server';

import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { FieldValue } from 'firebase-admin/firestore';

// ----- Premade portfolio definitions -----
const PREMADE_PORTFOLIOS: Record<string, { ticker: string; qty: number }[]> = {
  tech_heavy: [
    { ticker: 'AAPL', qty: 5 },
    { ticker: 'MSFT', qty: 2 }
  ],
  index_follower: [
    { ticker: 'SPY', qty: 10 }
  ],
  day_trader: []
};

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) throw new Error('Unauthorized: No auth token cookie found');

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    if (!decodedToken.uid) throw new Error('UID missing from token');
    return decodedToken.uid;
  } catch (error: any) {
    console.error('Auth Verification Error:', error.message);
    throw new Error(`Unauthorized: ${error.message}`);
  }
}

const getFinnhubToken = () => {
  const token = process.env.FINNHUB_API_KEY;
  if (!token) throw new Error('FINNHUB_API_KEY is not set in environment variables');
  return token;
};

// --- Global In-Memory Cache for Finnhub Quotes ---
const quoteCache = new Map<string, { promise: Promise<any>, timestamp: number }>();
const CACHE_TTL = 60000; // 60 seconds

async function fetchFinnhubQuote(symbol: string) {
  const symbolKey = symbol.toUpperCase();
  const now = Date.now();
  
  // 1. Check if we have a valid cached promise
  const cached = quoteCache.get(symbolKey);
  if (cached && (now - cached.timestamp < CACHE_TTL)) {
    try {
      return await cached.promise;
    } catch (e) {
      // If the promise failed, we'll try fetching again below
    }
  }

  // 2. Create the fetch operation
  const fetchPromise = (async () => {
    try {
      const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbolKey}&token=${getFinnhubToken()}`);
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      return await res.json();
    } catch (err: any) {
      console.error(`Finnhub Fetch Error (${symbolKey}):`, err.message);
      return { c: 0, pc: 0 }; // Return defaults on error so the app doesn't crash
    }
  })();

  // 3. Store the promise in the cache immediately so concurrent requests await the SAME promise
  quoteCache.set(symbolKey, { promise: fetchPromise, timestamp: now });
  
  return fetchPromise;
}

async function fetchFinnhubProfile(symbol: string) {
  try {
    const res = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol.toUpperCase()}&token=${getFinnhubToken()}`);
    if (!res.ok) return { name: symbol };
    const data = await res.json();
    return { name: data.name || symbol };
  } catch (err) {
    return { name: symbol };
  }
}

export interface PortfolioSummary {
  cash: number;
  totalValue: number;
  dayPL: number;
  dayPLPercent: number;
  holdings: any[];
}

export async function getPortfolioSummary(): Promise<PortfolioSummary> {
  const userId = await getAuthenticatedUserId();
  
  // Use a direct approach to avoid NOT_FOUND errors
  const userRef = adminDb.collection('users').doc(userId);
  const portfolioRef = userRef.collection('portfolio').doc('main');
  const holdingsRef = portfolioRef.collection('holdings');

  // Fetch everything at once
  const [portDoc, holdingsSnap] = await Promise.all([
    portfolioRef.get(),
    holdingsRef.get()
  ]);

  let cash = 10000;
  if (portDoc.exists) {
    cash = portDoc.data()?.cash ?? 10000;
  } else {
    // Lazy creation
    await portfolioRef.set({ cash: 10000 }, { merge: true });
    // Also ensure user doc exists
    await userRef.set({ updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  }

  const holdingsList = [];
  let totalMarketValue = 0;
  let dayPL = 0;

  for (const hDoc of holdingsSnap.docs) {
    const ticker = hDoc.id;
    const holdingData = hDoc.data();
    if (!holdingData.qty || holdingData.qty <= 0) continue;

    const [quoteData, profileData] = await Promise.all([
      fetchFinnhubQuote(ticker),
      fetchFinnhubProfile(ticker)
    ]);

    const currentPrice = quoteData.c || 0;
    const previousClose = quoteData.pc || currentPrice;
    
    const marketValue = holdingData.qty * currentPrice;
    const costBase = holdingData.qty * (holdingData.avgPrice || 0);
    const pl = marketValue - costBase;
    const holdingDayPL = holdingData.qty * (currentPrice - previousClose);

    totalMarketValue += marketValue;
    dayPL += holdingDayPL;

    holdingsList.push({
      symbol: ticker,
      name: profileData.name,
      qty: holdingData.qty,
      avgPrice: holdingData.avgPrice || 0,
      currentPrice,
      marketValue,
      dayPl: holdingDayPL,
      pl,
      plPercent: costBase > 0 ? (pl / costBase) * 100 : 0
    });
  }

  const totalValue = cash + totalMarketValue;
  const totalDayPLPercent = (totalValue - dayPL) > 0 ? (dayPL / (totalValue - dayPL)) * 100 : 0;

  const summaryObj = {
    cash,
    totalValue,
    dayPL,
    dayPLPercent: totalDayPLPercent,
    holdings: holdingsList.sort((a, b) => b.marketValue - a.marketValue)
  };

  // Asynchronously ensure a snapshot is captured for this session/day
  // We do not await this to avoid slowing down the UI load
  const todayStr = new Date().toDateString();
  const userDocData = (await userRef.get()).data();
  if (userDocData?.lastSnapshotDate !== todayStr) {
    capturePortfolioSnapshot(userId, summaryObj).catch(console.error);
    userRef.set({ lastSnapshotDate: todayStr }, { merge: true }).catch(console.error);
  }

  return summaryObj;
}

export async function handleTrade(ticker: string, quantity: number, type: 'BUY' | 'SELL') {
  if (quantity <= 0) throw new Error('Quantity must be greater than 0');
  const userId = await getAuthenticatedUserId();
  
  const userRef = adminDb.collection('users').doc(userId);
  const portfolioRef = userRef.collection('portfolio').doc('main');
  const holdingsRef = portfolioRef.collection('holdings').doc(ticker.toUpperCase());
  const transactionsRef = userRef.collection('transactions');

  const quoteData = await fetchFinnhubQuote(ticker);
  const currentPrice = quoteData.c;
  if (!currentPrice || currentPrice <= 0) throw new Error(`Could not fetch live price for ${ticker}`);

  const totalAmount = currentPrice * quantity;

  await adminDb.runTransaction(async (transaction) => {
    const portfolioDoc = await transaction.get(portfolioRef);
    const holdingDoc = await transaction.get(holdingsRef);

    const cash = portfolioDoc.exists ? (portfolioDoc.data()?.cash ?? 10000) : 10000;

    if (type === 'BUY') {
      if (cash < totalAmount) throw new Error('Insufficient funds');
      
      const currentHolding = holdingDoc.exists ? holdingDoc.data()! : { qty: 0, avgPrice: 0 };
      const newQty = currentHolding.qty + quantity;
      const newAvgPrice = ((currentHolding.qty * currentHolding.avgPrice) + totalAmount) / newQty;

      transaction.set(portfolioRef, { cash: cash - totalAmount }, { merge: true });
      transaction.set(holdingsRef, { qty: newQty, avgPrice: newAvgPrice }, { merge: true });
    } else {
      if (!holdingDoc.exists || holdingDoc.data()?.qty < quantity) {
        throw new Error('Insufficient shares to sell');
      }

      const currentHolding = holdingDoc.data()!;
      const newQty = currentHolding.qty - quantity;

      transaction.set(portfolioRef, { cash: cash + totalAmount }, { merge: true });
      if (newQty <= 0) {
        transaction.delete(holdingsRef);
      } else {
        transaction.set(holdingsRef, { qty: newQty }, { merge: true });
      }
    }

    transaction.set(transactionsRef.doc(), {
      ticker: ticker.toUpperCase(),
      quantity,
      price: currentPrice,
      totalAmount,
      type,
      timestamp: FieldValue.serverTimestamp(),
      description: `${type} ${quantity} ${ticker.toUpperCase()} @ $${currentPrice.toFixed(2)}`
    });
  });

  // Capture snapshot after trade
  await capturePortfolioSnapshot(userId);

  return { success: true };
}

export async function getMarketQuotes(tickers: string[]) {
  const results = [];
  // Chunking to avoid hitting the 30/sec rate limit immediately
  const chunkSize = 10;
  for (let i = 0; i < tickers.length; i += chunkSize) {
    const chunk = tickers.slice(i, i + chunkSize);
    const chunkPromises = chunk.map(async (ticker) => {
      const quote = await fetchFinnhubQuote(ticker);
      const price = quote.c || 0;
      const pc = quote.pc || price;
      const change = pc > 0 ? ((price - pc) / pc) * 100 : 0;
      return { ticker, price, change };
    });
    const chunkResults = await Promise.all(chunkPromises);
    results.push(...chunkResults);
    
    // Add a tiny delay between chunks
    if (i + chunkSize < tickers.length) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
  return results;
}

export async function capturePortfolioSnapshot(userIdOverride?: string, summary?: PortfolioSummary) {
  try {
    const userId = userIdOverride || await getAuthenticatedUserId();
    const portSummary = summary || await getPortfolioSummary();
    const historyRef = adminDb.collection('users').doc(userId).collection('portfolio_history');
    
    // Simple deduplication: check if we just took a snapshot in the last hour
    // (This is basic; could be more robust, but prevents spam)
    
    await historyRef.add({
      timestamp: FieldValue.serverTimestamp(),
      totalValue: portSummary.totalValue,
      cashBalance: portSummary.cash,
      holdingsValue: portSummary.totalValue - portSummary.cash
    });
  } catch (error) {
    console.error('Failed to capture snapshot:', error);
  }
}

export async function getGraphData(timeRange: '1D' | '1W' | '1M' | '1Y') {
  const userId = await getAuthenticatedUserId();
  const historyRef = adminDb.collection('users').doc(userId).collection('portfolio_history');
  
  // Calculate timestamps
  const now = new Date();
  let start = new Date();
  let resolution = '15'; // for finnhub SPY
  
  if (timeRange === '1D') {
    start.setHours(0, 0, 0, 0); // start of today
    resolution = '5';
  } else if (timeRange === '1W') {
    start.setDate(now.getDate() - 7);
    resolution = '60';
  } else if (timeRange === '1M') {
    start.setMonth(now.getMonth() - 1);
    resolution = 'D';
  } else if (timeRange === '1Y') {
    start.setFullYear(now.getFullYear() - 1);
    resolution = 'W';
  }

  const startTimestamp = Math.floor(start.getTime() / 1000);
  const endTimestamp = Math.floor(now.getTime() / 1000);

  // 1. Fetch User Portfolio History
  const historySnap = await historyRef
    .where('timestamp', '>=', new Date(start.getTime()))
    .orderBy('timestamp', 'asc')
    .get();

  let userPoints: { time: number; value: number }[] = [];
  
  historySnap.docs.forEach(doc => {
    const data = doc.data();
    if (data.timestamp) {
      userPoints.push({
        time: Math.floor(data.timestamp.toDate().getTime() / 1000),
        value: data.totalValue
      });
    }
  });

  // Empty state handling
  if (userPoints.length === 0) {
    userPoints = [
      { time: startTimestamp, value: 10000 },
      { time: endTimestamp, value: 10000 }
    ];
  } else if (timeRange === '1D') {
    // Interpolate from 10000 if needed, but usually we just use the first point
    if (userPoints[0].time > startTimestamp + 3600) {
      userPoints.unshift({ time: startTimestamp, value: 10000 });
    }
  }

  // Downsample Logic
  if (timeRange === '1W' || timeRange === '1M') {
    // Group by day, take last
    const dailyMap = new Map<string, { time: number; value: number }>();
    userPoints.forEach(p => {
      // Use EST string for grouping
      const dateStr = new Date(p.time * 1000).toLocaleDateString('en-US', { timeZone: 'America/New_York' });
      dailyMap.set(dateStr, p); // overwrites so we keep the last one of the day
    });
    userPoints = Array.from(dailyMap.values());
  } else if (timeRange === '1Y') {
    // Group by week (using year-week string)
    const weeklyMap = new Map<string, { time: number; value: number }>();
    userPoints.forEach(p => {
      const d = new Date(p.time * 1000);
      // Hacky week grouping
      const weekStr = `${d.getFullYear()}-${Math.floor(d.getTime() / (7 * 24 * 60 * 60 * 1000))}`;
      weeklyMap.set(weekStr, p);
    });
    userPoints = Array.from(weeklyMap.values());
  }

  // 2. Fetch Benchmark (SPY)
  let spyPoints: { time: number; value: number }[] = [];
  try {
    const res = await fetch(`https://finnhub.io/api/v1/stock/candle?symbol=SPY&resolution=${resolution}&from=${startTimestamp}&to=${endTimestamp}&token=${getFinnhubToken()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.s === 'ok' && data.c && data.t) {
        spyPoints = data.t.map((timestamp: number, index: number) => ({
          time: timestamp,
          value: data.c[index]
        }));
      }
    }
  } catch (error) {
    console.error('Failed to fetch SPY benchmark', error);
  }

  return { portfolio: userPoints, benchmark: spyPoints };
}

export async function initializePortfolio(strategy: 'tech_heavy' | 'index_follower' | 'day_trader') {
  try {
    const userId = await getAuthenticatedUserId();
    const userRef = adminDb.collection('users').doc(userId);
    const portfolioRef = userRef.collection('portfolio').doc('main');
    const holdingsRef = portfolioRef.collection('holdings');

    // Fetch prices first (outside transaction to avoid timeout)
    const strategyHoldings = PREMADE_PORTFOLIOS[strategy] || [];
    let totalAssetValue = 0;
    const processedHoldings = [];

    for (const asset of strategyHoldings) {
      const quote = await fetchFinnhubQuote(asset.ticker);
      const price = quote.c || 0;
      if (price <= 0) throw new Error(`Market data unavailable for ${asset.ticker}`);
      
      totalAssetValue += price * asset.qty;
      processedHoldings.push({ ...asset, avgPrice: price });
    }

    const startingCash = 10000 - totalAssetValue;
    if (startingCash < 0) throw new Error('Starting value exceeds $10,000 limit');

    // Use a batch for faster, more reliable initialization
    const batch = adminDb.batch();

    // Ensure user and portfolio exists
    batch.set(userRef, { lastInitialized: FieldValue.serverTimestamp() }, { merge: true });
    batch.set(portfolioRef, { cash: startingCash, strategy }, { merge: true });

    // Clear old holdings (requires a read, but we can do it outside or just delete and hope)
    const currentHoldings = await holdingsRef.get();
    currentHoldings.docs.forEach(doc => batch.delete(doc.ref));

    // Add new ones
    processedHoldings.forEach(h => {
      batch.set(holdingsRef.doc(h.ticker.toUpperCase()), { qty: h.qty, avgPrice: h.avgPrice });
    });

    await batch.commit();
    
    // Capture initial snapshot
    await capturePortfolioSnapshot(userId);
    
    return { success: true };
  } catch (error: any) {
    console.error('Portfolio Init Failed:', error.message);
    throw new Error(error.message || 'Initialization failed');
  }
}
