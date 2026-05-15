'use server';

import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { FieldValue } from 'firebase-admin/firestore';

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    throw new Error('Unauthorized');
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    throw new Error('Unauthorized');
  }
}

const getFinnhubToken = () => {
  const token = process.env.FINNHUB_API_KEY;
  if (!token) throw new Error('FINNHUB_API_KEY is not set in environment variables');
  return token;
};

async function fetchFinnhubQuote(symbol: string) {
  const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${getFinnhubToken()}`);
  if (!res.ok) throw new Error(`Failed to fetch quote for ${symbol}`);
  return res.json();
}

async function fetchFinnhubProfile(symbol: string) {
  const res = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${getFinnhubToken()}`);
  if (!res.ok) return { name: symbol };
  const data = await res.json();
  return { name: data.name || symbol };
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
  const userRef = adminDb.collection('users').doc(userId);
  const portfolioRef = userRef.collection('portfolio').doc('main');
  
  const doc = await portfolioRef.get();
  
  let cash = 10000;
  let holdings: Record<string, { qty: number, avgPrice: number }> = {};
  
  if (!doc.exists) {
    await portfolioRef.set({ cash: 10000, holdings: {} });
  } else {
    const data = doc.data()!;
    cash = data.cash || 10000;
    holdings = data.holdings || {};
  }

  let totalMarketValue = 0;
  let dayPL = 0;
  let totalCostBase = 0;

  const holdingsList = [];

  for (const [ticker, holdingData] of Object.entries(holdings)) {
    if (holdingData.qty <= 0) continue;

    try {
      const [quoteData, profileData] = await Promise.all([
        fetchFinnhubQuote(ticker),
        fetchFinnhubProfile(ticker)
      ]);

      const currentPrice = quoteData.c || 0;
      const previousClose = quoteData.pc || currentPrice;
      const change = currentPrice - previousClose;
      
      const marketValue = holdingData.qty * currentPrice;
      const costBase = holdingData.qty * holdingData.avgPrice;
      const pl = marketValue - costBase;
      const plPercent = costBase > 0 ? (pl / costBase) * 100 : 0;
      const holdingDayPL = holdingData.qty * change;

      totalMarketValue += marketValue;
      dayPL += holdingDayPL;
      totalCostBase += costBase;

      holdingsList.push({
        symbol: ticker,
        name: profileData.name,
        qty: holdingData.qty,
        avgPrice: holdingData.avgPrice,
        currentPrice,
        marketValue,
        dayPl: holdingDayPL,
        pl,
        plPercent
      });
    } catch (error) {
      console.error(`Failed to fetch quote for ${ticker}`, error);
    }
  }

  const totalValue = cash + totalMarketValue;
  const enrichedHoldingsList = holdingsList.map(h => ({
    ...h,
    alloc: totalValue > 0 ? (h.marketValue / totalValue) * 100 : 0,
    returnContrib: totalValue > 0 ? (h.pl / totalValue) * 100 : 0
  }));

  const totalDayPLPercent = (totalMarketValue + cash) > 0 ? (dayPL / (totalMarketValue + cash - dayPL)) * 100 : 0;

  return {
    cash,
    totalValue,
    dayPL,
    dayPLPercent: totalDayPLPercent,
    holdings: enrichedHoldingsList.sort((a, b) => b.marketValue - a.marketValue)
  };
}

export async function executeTrade(ticker: string, quantity: number, type: 'BUY' | 'SELL') {
  if (quantity <= 0) throw new Error('Quantity must be greater than 0');
  
  const userId = await getAuthenticatedUserId();
  const userRef = adminDb.collection('users').doc(userId);
  const portfolioRef = userRef.collection('portfolio').doc('main');
  const transactionsRef = userRef.collection('transactions');

  const quoteData = await fetchFinnhubQuote(ticker);
  const currentPrice = quoteData.c;
  if (!currentPrice || currentPrice === 0) throw new Error('Could not fetch valid current price for ' + ticker);

  const totalAmount = currentPrice * quantity;

  await adminDb.runTransaction(async (transaction) => {
    const doc = await transaction.get(portfolioRef);
    let cash = 10000;
    let holdings: Record<string, { qty: number, avgPrice: number }> = {};
    
    if (doc.exists) {
      const data = doc.data()!;
      cash = data.cash || 10000;
      holdings = data.holdings || {};
    }

    if (type === 'BUY') {
      if (cash < totalAmount) {
        throw new Error('Insufficient funds');
      }
      cash -= totalAmount;
      
      const currentHolding = holdings[ticker] || { qty: 0, avgPrice: 0 };
      const newQty = currentHolding.qty + quantity;
      const newAvgPrice = ((currentHolding.qty * currentHolding.avgPrice) + totalAmount) / newQty;
      
      holdings[ticker] = { qty: newQty, avgPrice: newAvgPrice };
    } else if (type === 'SELL') {
      const currentHolding = holdings[ticker] || { qty: 0, avgPrice: 0 };
      if (currentHolding.qty < quantity) {
        throw new Error('Insufficient shares to sell');
      }
      cash += totalAmount;
      
      const newQty = currentHolding.qty - quantity;
      if (newQty === 0) {
        delete holdings[ticker];
      } else {
        holdings[ticker] = { qty: newQty, avgPrice: currentHolding.avgPrice };
      }
    }

    transaction.set(portfolioRef, { cash, holdings }, { merge: true });
    
    const newTxRef = transactionsRef.doc();
    transaction.set(newTxRef, {
      ticker,
      quantity,
      price: currentPrice,
      totalAmount,
      type,
      timestamp: FieldValue.serverTimestamp(),
      description: `${type} ${quantity} ${ticker} @ $${currentPrice.toFixed(2)}`
    });
  });

  return { success: true };
}

export async function getChartData(ticker: string = 'SPY') {
  const end = Math.floor(Date.now() / 1000);
  const start = end - (7 * 24 * 60 * 60);
  
  try {
    const res = await fetch(`https://finnhub.io/api/v1/stock/candle?symbol=${ticker}&resolution=15&from=${start}&to=${end}&token=${getFinnhubToken()}`);
    if (!res.ok) return [];
    
    const data = await res.json();
    
    if (data.s !== 'ok' || !data.c || !data.t) {
      return [];
    }

    return data.t.map((timestamp: number, index: number) => ({
      time: new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      price: data.c[index]
    }));
  } catch (error) {
    console.error('Failed to fetch chart data', error);
    return [];
  }
}
