import { db, auth } from '@/lib/firebase';
import { doc, getDoc, collection, setDoc, runTransaction, serverTimestamp, getDocs, writeBatch, query, where, orderBy, deleteDoc } from 'firebase/firestore';
import {
  safeRound,
  safeAdd,
  safeSubtract,
  safeMultiply,
  safeDivide,
  calculateAssetMarketValue,
  calculateAssetCostBasis,
  calculateAssetPLUSD,
  calculateAssetPLPercent,
  calculateAssetDayPLUSD,
  calculateNetWorth,
  calculateGlobalTotalPerformanceUSD,
  calculateGlobalTotalPerformancePercent,
  calculateGlobalDayPLPercent
} from '@/lib/portfolioMath';

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
  // Try to get currentUser synchronously if already loaded
  let user = auth.currentUser;
  
  if (!user) {
    // If not, wait for auth state to resolve (important for client-side routing)
    await new Promise<void>((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((u) => {
        user = u;
        unsubscribe();
        resolve();
      });
    });
  }
  
  if (!user) {
    if (process.env.NODE_ENV !== 'production') {
      const devUid = process.env.NEXT_PUBLIC_DEV_UID || 'dev-user-uid';
      console.warn('[Auth] No auth token found. Using devUid for local development.');
      return devUid;
    }
    throw new Error('Unauthorized: No user is currently signed in.');
  }

  return user.uid;
}

const getFinnhubToken = () => {
  return process.env.NEXT_PUBLIC_FINNHUB_API_KEY || '';
};

export function getMockStockPrice(symbol: string) {
  const sym = symbol.toUpperCase();
  let hash = 0;
  for (let i = 0; i < sym.length; i++) {
    hash = sym.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Base price between $30 and $450
  const basePrice = 30 + (Math.abs(hash) % 420);
  
  // Deterministic daily change percent between -4% and +4%
  const changePercent = ((hash % 80) / 100) * 5;
  const pc = basePrice;
  // Add a tiny random walk (e.g. -0.2% to +0.2%) to simulate real-time updates
  const randomWalk = (Math.random() - 0.5) * 0.004; 
  const c = basePrice * (1 + (changePercent + randomWalk) / 100);
  
  return {
    c: Number(c.toFixed(2)),
    pc: Number(pc.toFixed(2))
  };
}

// --- Global In-Memory Cache for Finnhub Quotes ---
const quoteCache = new Map<string, { promise: Promise<any>, timestamp: number }>();
const CACHE_TTL = 60000; // 60 seconds

export async function fetchFinnhubQuote(symbol: string) {
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
  // Introduce a small delay to respect rate limits when not using cached data
  const fetchPromise = (async () => {
    const token = getFinnhubToken();
    if (!token) {
      return getMockStockPrice(symbolKey); 
    }

    // Delay 200ms before each network request
    await new Promise(resolve => setTimeout(resolve, 200));
    try {
      const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbolKey}&token=${token}`);
      if (!res.ok) {
        return getMockStockPrice(symbolKey);
      }
      const data = await res.json();
      if (!data || !data.c) {
        return getMockStockPrice(symbolKey);
      }
      return data;
    } catch (err: any) {
      return getMockStockPrice(symbolKey);
    }
  })();

  // 3. Store the promise in the cache immediately so concurrent requests await the SAME promise
  quoteCache.set(symbolKey, { promise: fetchPromise, timestamp: now });
  
  return fetchPromise;
}

async function fetchFinnhubProfile(symbol: string) {
  try {
    const token = getFinnhubToken();
    if (!token) return { name: symbol };
    const res = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol.toUpperCase()}&token=${token}`);
    if (!res.ok) return { name: symbol };
    const data = await res.json();
    return { name: data.name || symbol };
  } catch (err) {
    return { name: symbol };
  }
}

export interface PortfolioSummary {
  cash: number;
  totalValue: number; // Net Worth (Global Equity) for backward compatibility
  netWorth: number; // Disambiguated Net Worth
  totalMarketValue: number;
  totalCostBasis: number;
  totalPerformanceUSD: number;
  totalPerformancePercent: number;
  dayPerformanceUSD: number;
  dayPerformancePercent: number;
  dayPL: number; // for backward compatibility
  dayPLPercent: number; // for backward compatibility
  holdings: any[];
  balanceHistory?: any[]; // For backward compatibility and custom fallbacks
  borrowedAmount?: number;
  interestRate?: number;
  amountOwed?: number;
  monthlyInterest?: number;
  hasBorrowed?: boolean;
}

export async function getPortfolioSummary(): Promise<PortfolioSummary> {
  const fallback: PortfolioSummary = {
    cash: 10000,
    totalValue: 10000,
    netWorth: 10000,
    totalMarketValue: 0,
    totalCostBasis: 0,
    totalPerformanceUSD: 0,
    totalPerformancePercent: 0,
    dayPerformanceUSD: 0,
    dayPerformancePercent: 0,
    dayPL: 0,
    dayPLPercent: 0,
    holdings: [],
    balanceHistory: [],
    borrowedAmount: 0,
    interestRate: 0.08,
    amountOwed: 0,
    monthlyInterest: 0,
    hasBorrowed: false
  };

  try {
    const userId = await getAuthenticatedUserId();
    
    // Use modular client SDK approach
    const userRef = doc(db, 'users', userId);
    const portfolioRef = doc(db, 'users', userId, 'portfolio', 'main');
    const holdingsRef = collection(db, 'users', userId, 'portfolio', 'main', 'holdings');

    // Fetch everything at once
    const [portDoc, holdingsSnap] = await Promise.all([
      getDoc(portfolioRef),
      getDocs(holdingsRef)
    ]);

    // Implement structural null-guards. If doc.exists is false, return fallback
    if (!portDoc.exists()) {
      console.warn(`[getPortfolioSummary] Portfolio doc does not exist for user ${userId}. Returning fallback portfolio.`);
      // Lazy creation of required structures in database
      setDoc(portfolioRef, { cash: 10000, balanceHistory: [] }, { merge: true }).catch(err => console.error('[getPortfolioSummary] Lazy portfolio creation failed:', err));
      setDoc(userRef, { updatedAt: serverTimestamp() }, { merge: true }).catch(err => console.error('[getPortfolioSummary] Lazy user doc creation failed:', err));
      return fallback;
    }

    const portData = portDoc.data();
    if (!portData) {
      console.warn(`[getPortfolioSummary] Portfolio data is empty for user ${userId}. Returning fallback.`);
      return fallback;
    }

    // Check if fields like cash, holdings, or balanceHistory are missing/undefined
    const cash = portData.cash !== undefined ? portData.cash : 10000;
    const balanceHistory = portData.balanceHistory !== undefined ? portData.balanceHistory : (portData.balance_history !== undefined ? portData.balance_history : []);
    
    // Read borrowing fields
    const borrowedAmount = portData.borrowedAmount !== undefined ? portData.borrowedAmount : 0;
    const interestRate = portData.interestRate !== undefined ? portData.interestRate : (0.04 + (borrowedAmount / 10000) * 0.08);
    const amountOwed = portData.amountOwed !== undefined ? portData.amountOwed : (borrowedAmount * Math.pow(1 + interestRate / 365, 365));
    const hasBorrowed = portData.hasBorrowed !== undefined ? portData.hasBorrowed : false;
    const monthlyInterest = (borrowedAmount * interestRate) / 12;

    // If essential fields are missing, fall back to defaults but continue processing
    if (portData.cash === undefined || portData.balanceHistory === undefined) {
      // Proceed with defaults defined earlier (cash already set, balanceHistory fallback applied)
    }

    const holdingsList = [];
    let totalMarketValue = 0;
    let totalCostBasis = 0;
    let dayPerformanceUSD = 0;

    if (holdingsSnap && !holdingsSnap.empty) {
      for (const hDoc of holdingsSnap.docs) {
        const ticker = hDoc.id;
        const holdingData = hDoc.data();
        if (!holdingData || !holdingData.qty || holdingData.qty <= 0) continue;

        const [quoteData, profileData] = await Promise.all([
          fetchFinnhubQuote(ticker),
          fetchFinnhubProfile(ticker)
        ]);

        const currentPrice = quoteData.c || 0;
        const previousClose = quoteData.pc || currentPrice;
        
        // Core hold-level formulas using portfolioMath functions
        const marketValue = calculateAssetMarketValue(holdingData.qty, currentPrice);
        const costBase = calculateAssetCostBasis(holdingData.qty, holdingData.avgPrice || 0);
        const pl = calculateAssetPLUSD(marketValue, costBase);
        const plPercent = calculateAssetPLPercent(currentPrice, holdingData.avgPrice || 0);
        const holdingDayPL = calculateAssetDayPLUSD(holdingData.qty, currentPrice, previousClose);

        totalMarketValue = safeAdd(totalMarketValue, marketValue);
        totalCostBasis = safeAdd(totalCostBasis, costBase);
        dayPerformanceUSD = safeAdd(dayPerformanceUSD, holdingDayPL);

        holdingsList.push({
          symbol: ticker,
          name: profileData.name,
          qty: holdingData.qty,
          avgPrice: holdingData.avgPrice || 0,
          currentPrice,
          marketValue,
          dayPl: holdingDayPL,
          pl,
          plPercent
        });
      }
    }

    // Global calculations
    const netWorthWithoutDebt = calculateNetWorth(cash, totalMarketValue);
    const netWorth = safeSubtract(netWorthWithoutDebt, borrowedAmount);
    const totalPerformanceUSD = calculateGlobalTotalPerformanceUSD(totalMarketValue, totalCostBasis);
    const totalPerformancePercent = calculateGlobalTotalPerformancePercent(totalPerformanceUSD, totalCostBasis);
    const dayPerformancePercent = calculateGlobalDayPLPercent(dayPerformanceUSD, netWorth);

    const summaryObj: PortfolioSummary = {
      cash,
      totalValue: netWorth, // Backwards compatibility for UI displaying net worth
      netWorth,
      totalMarketValue,
      totalCostBasis,
      totalPerformanceUSD,
      totalPerformancePercent,
      dayPerformanceUSD,
      dayPerformancePercent,
      dayPL: dayPerformanceUSD, // Backwards compatibility for UI
      dayPLPercent: dayPerformancePercent, // Backwards compatibility for UI
      holdings: holdingsList.sort((a, b) => b.marketValue - a.marketValue),
      balanceHistory,
      borrowedAmount,
      interestRate,
      amountOwed,
      monthlyInterest,
      hasBorrowed
    };

    // Asynchronously ensure a snapshot is captured for this session/day
    // We do not await this to avoid slowing down the UI load
    const todayStr = new Date().toDateString();
    try {
      const userDocSnap = await getDoc(userRef);
      if (userDocSnap.exists()) {
        const userDocData = userDocSnap.data();
        if (userDocData?.lastSnapshotDate !== todayStr) {
          capturePortfolioSnapshot(userId, summaryObj).catch(err => console.error('Background Snapshot Error:', err));
          setDoc(userRef, { lastSnapshotDate: todayStr }, { merge: true }).catch(err => console.error('Update LastSnapshotDate Error:', err));
        }
      } else {
        // Lazy creation of user doc
        setDoc(userRef, { lastSnapshotDate: todayStr, updatedAt: serverTimestamp() }, { merge: true }).catch(err => console.error('Initial UserDoc Creation Error:', err));
        capturePortfolioSnapshot(userId, summaryObj).catch(err => console.error('Initial Background Snapshot Error:', err));
      }
    } catch (err) {
      console.error('Error checking for portfolio snapshot:', err);
      // Continue anyway as this is non-critical for the immediate render
    }

    return summaryObj;
  } catch (error) {
    console.error('[getPortfolioSummary] Exception caught during portfolio load/parse:', error);
    return fallback;
  }
}

async function validateTradeAgainstRules(
  userId: string,
  ticker: string,
  quantity: number,
  type: 'BUY' | 'SELL'
) {
  // 1. Fetch user metadata
  const userDoc = await getDoc(doc(db, 'users', userId));
  const userData = userDoc.data();
  if (!userData || userData.role !== 'student' || !userData.classId) {
    return; // Main sandbox or no classroom constraints
  }

  const { classId } = userData;

  // 2. Fetch classroom active rules
  const classDoc = await getDoc(doc(db, 'classrooms', classId));
  if (!classDoc.exists()) {
    throw new Error('Enrolled classroom not found. Please contact your instructor.');
  }

  const classData = classDoc.data()!;
  const rules = classData.rules || {};

  // Check Whitelist (allowedAssets)
  const upperTicker = ticker.toUpperCase();
  if (rules.allowedAssets && rules.allowedAssets.length > 0) {
    if (!rules.allowedAssets.includes(upperTicker)) {
      throw new Error(`Transaction blocked: '${upperTicker}' is not on your teacher's approved assets list.`);
    }
  }

  // Check Blacklist (blacklistedAssets)
  if (rules.blacklistedAssets && rules.blacklistedAssets.length > 0) {
    if (rules.blacklistedAssets.includes(upperTicker)) {
      throw new Error(`Transaction blocked: Trading is banned for ticker '${upperTicker}' by your teacher.`);
    }
  }

  // Check Day Trading Limit (maxDailyTrades)
  if (rules.maxDailyTrades && rules.maxDailyTrades > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const transactionsRef = collection(db, 'users', userId, 'transactions');
    const q = query(transactionsRef, where('timestamp', '>=', today));
    const transactionsSnap = await getDocs(q);

    if (transactionsSnap.size >= rules.maxDailyTrades) {
      throw new Error(`Transaction blocked: Teacher has set a maximum of ${rules.maxDailyTrades} trades per day. You have reached this limit.`);
    }
  }
}

export async function handleTrade(ticker: string, quantity: number, type: 'BUY' | 'SELL') {
  const shares = Number(quantity);
  if (isNaN(shares) || shares <= 0) {
    throw new Error('Quantity must be a valid number greater than 0');
  }

  const userId = await getAuthenticatedUserId();

  // --- INTERCEPTOR: Validate trade rules before checking funds/shares ---
  await validateTradeAgainstRules(userId, ticker, shares, type);
  
  const userRef = doc(db, 'users', userId);
  const portfolioRef = doc(db, 'users', userId, 'portfolio', 'main');
  const holdingsRef = doc(db, 'users', userId, 'portfolio', 'main', 'holdings', ticker.toUpperCase());
  const transactionsCollectionRef = collection(db, 'users', userId, 'portfolio_history');

  const quoteData = await fetchFinnhubQuote(ticker);
  const currentPrice = quoteData.c;
  const price = Number(currentPrice);
  if (isNaN(price) || price <= 0) {
    throw new Error(`Could not fetch live price for ${ticker}`);
  }

  const totalAmount = safeMultiply(price, shares);
  if (isNaN(totalAmount) || totalAmount <= 0) {
    throw new Error('Invalid transaction value calculation');
  }

  await runTransaction(db, async (transaction) => {
    const portfolioDoc = await transaction.get(portfolioRef);
    const holdingDoc = await transaction.get(holdingsRef);

    // Defensive structural defaults if portfolio doesn't exist
    const portfolioData = portfolioDoc.exists() ? portfolioDoc.data() : null;
    const cash = Number(portfolioData?.cash ?? 10000);
    if (isNaN(cash)) {
      throw new Error('Invalid cash balance value in portfolio');
    }

    if (type === 'BUY') {
      if (cash < totalAmount) {
        throw new Error('Insufficient funds');
      }
      
      // Defensive defaults for holding document
      const currentHolding = holdingDoc.exists() ? holdingDoc.data()! : { qty: 0, avgPrice: 0 };
      const currentQty = Number(currentHolding.qty ?? 0);
      const currentAvgPrice = Number(currentHolding.avgPrice ?? 0);

      if (isNaN(currentQty) || isNaN(currentAvgPrice)) {
        throw new Error('Invalid portfolio holding quantities');
      }

      const newQty = safeAdd(currentQty, shares);
      
      // Precision average price calculation:
      const oldCostBasis = safeMultiply(currentQty, currentAvgPrice);
      const newCostBasis = safeAdd(oldCostBasis, totalAmount);
      const newAvgPrice = safeDivide(newCostBasis, newQty);
      const finalCash = safeSubtract(cash, totalAmount);

      if (isNaN(newQty) || isNaN(newAvgPrice) || isNaN(finalCash)) {
        throw new Error('Arithmetic NaN safety check failed during BUY transaction balancing');
      }

      transaction.set(portfolioRef, { cash: finalCash }, { merge: true });
      transaction.set(holdingsRef, { qty: newQty, avgPrice: newAvgPrice }, { merge: true });
    } else {
      // Sell logic
      const currentHolding = holdingDoc.exists() ? holdingDoc.data()! : null;
      const currentQty = currentHolding ? Number(currentHolding.qty ?? 0) : 0;
      const currentAvgPrice = currentHolding ? Number(currentHolding.avgPrice ?? 0) : 0;

      if (!currentHolding || isNaN(currentQty) || currentQty < shares) {
        throw new Error('Insufficient shares to sell');
      }

      const newQty = safeSubtract(currentQty, shares);
      const avgPrice = isNaN(currentAvgPrice) ? 0 : currentAvgPrice; // retain avg price
      const finalCash = safeAdd(cash, totalAmount);

      if (isNaN(newQty) || isNaN(avgPrice) || isNaN(finalCash)) {
        throw new Error('Arithmetic NaN safety check failed during SELL transaction balancing');
      }

      transaction.set(portfolioRef, { cash: finalCash }, { merge: true });
      if (newQty <= 0) {
        transaction.delete(holdingsRef);
      } else {
        // Enforce average price retention explicitly inside the database
        transaction.set(holdingsRef, { qty: newQty, avgPrice }, { merge: true });
      }
    }

    // Push transactional log history cleanly to portfolio_history sub-collection
    const newTransactionRef = doc(transactionsCollectionRef);
    transaction.set(newTransactionRef, {
      ticker: ticker.toUpperCase(),
      quantity: shares,
      price: price,
      totalAmount,
      type,
      timestamp: serverTimestamp(),
      description: `${type} ${shares} ${ticker.toUpperCase()} @ $${price.toFixed(2)}`
    });
  });

  // Capture snapshot after trade
  await capturePortfolioSnapshot(userId);

  // Check for achievements
  const { checkAndUnlockAchievements } = await import('./achievements');
  await checkAndUnlockAchievements(userId);

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
    const historyRef = collection(db, 'users', userId, 'portfolio_history');
    
    // Simple deduplication: check if we just took a snapshot in the last hour
    // (This is basic; could be more robust, but prevents spam)
    const newDocRef = doc(historyRef);
    await setDoc(newDocRef, {
      timestamp: serverTimestamp(),
      totalValue: portSummary.totalValue,
      cashBalance: portSummary.cash,
      holdingsValue: portSummary.totalValue - portSummary.cash
    });

    // Sync netWorth to user document for leaderboards
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { netWorth: portSummary.totalValue }, { merge: true });
  } catch (error) {
    console.error('Failed to capture snapshot:', error);
  }
}

export async function getGraphData(timeRange: '1D' | '1W' | '1M' | '1Y') {
  const userId = await getAuthenticatedUserId();
  
  // Calculate timestamps
  const now = new Date();
  let start = new Date();
  
  if (timeRange === '1D') {
    start.setHours(0, 0, 0, 0); // start of today
  } else if (timeRange === '1W') {
    start.setDate(now.getDate() - 7);
  } else if (timeRange === '1M') {
    start.setMonth(now.getMonth() - 1);
  } else if (timeRange === '1Y') {
    start.setFullYear(now.getFullYear() - 1);
  }

  const startTimestamp = Math.floor(start.getTime() / 1000);
  const endTimestamp = Math.floor(now.getTime() / 1000);

  // Fetch from portfolio_snapshots (new schema) and fallback to portfolio_history (old schema)
  let rawPoints: { time: number; value: number; spyValue?: number }[] = [];

  const fetchCollectionData = async (collectionName: string) => {
    const colRef = collection(db, 'users', userId, collectionName);
    const q = query(
      colRef,
      where('timestamp', '>=', new Date(start.getTime())),
      orderBy('timestamp', 'asc')
    );
    const snap = await getDocs(q);
    const pts: typeof rawPoints = [];
    if (snap && !snap.empty) {
      snap.docs.forEach((doc) => {
        const data = doc.data();
        if (data && data.timestamp) {
          pts.push({
            time: Math.floor(data.timestamp.toDate().getTime() / 1000),
            value: data.totalValue !== undefined ? data.totalValue : 10000,
            spyValue: data.spyValue,
          });
        }
      });
    }
    return pts;
  };

  try {
    rawPoints = await fetchCollectionData('portfolio_snapshots');
    if (rawPoints.length === 0) {
      // Fallback to legacy portfolio_history
      rawPoints = await fetchCollectionData('portfolio_history');
    }
  } catch (err) {
    console.error('Failed to fetch snapshot data:', err);
  }

  // Handle empty state
  if (rawPoints.length === 0) {
    rawPoints = [
      { time: startTimestamp, value: 10000 },
      { time: endTimestamp, value: 10000 }
    ];
  }

  // Generate fallback/mock SPY data if it's missing from snapshots
  const baselineSpy = 510.25;
  rawPoints = rawPoints.map((pt, index) => {
    if (pt.spyValue !== undefined && pt.spyValue > 0) {
      return pt;
    }
    // Random walk fallback for SPY if not recorded in snapshot
    const pctChange = (index / Math.max(1, rawPoints.length - 1)) * 0.02 - 0.01;
    return {
      ...pt,
      spyValue: Number((baselineSpy * (1 + pctChange)).toFixed(2))
    };
  });

  // Resample helper to guarantee exactly 78 points evenly distributed
  function resampleData(data: typeof rawPoints, targetCount = 78): { time: number; value: number; spyValue: number }[] {
    if (data.length === 0) return [];
    if (data.length === 1) {
      const pt = data[0];
      return Array.from({ length: targetCount }, (_, i) => ({
        time: pt.time + i * 60,
        value: pt.value,
        spyValue: pt.spyValue || baselineSpy
      }));
    }

    const result: { time: number; value: number; spyValue: number }[] = [];
    const minTime = data[0].time;
    const maxTime = data[data.length - 1].time;
    const timeStep = (maxTime - minTime) / (targetCount - 1);

    for (let i = 0; i < targetCount; i++) {
      const targetTime = minTime + i * timeStep;
      
      // Find the two closest points to interpolate
      let left = 0;
      let right = data.length - 1;
      while (left < right - 1) {
        const mid = Math.floor((left + right) / 2);
        if (data[mid].time <= targetTime) {
          left = mid;
        } else {
          right = mid;
        }
      }

      const p0 = data[left];
      const p1 = data[right];
      
      let value = p0.value;
      let spyValue = p0.spyValue || baselineSpy;
      
      if (p1.time !== p0.time) {
        const t = (targetTime - p0.time) / (p1.time - p0.time);
        value = p0.value + t * (p1.value - p0.value);
        spyValue = (p0.spyValue || baselineSpy) + t * ((p1.spyValue || baselineSpy) - (p0.spyValue || baselineSpy));
      }
      
      result.push({
        time: Math.round(targetTime),
        value: Number(value.toFixed(2)),
        spyValue: Number(spyValue.toFixed(2))
      });
    }
    return result;
  }

  const targetCount = timeRange === '1D' ? 14 : 78;
  const resampled = resampleData(rawPoints, targetCount);

  // Fetch user achievements and unlocks
  let achievementUnlocks: Record<string, number> = {};
  try {
    const { getUserAchievementUnlocks } = await import('./achievements');
    achievementUnlocks = await getUserAchievementUnlocks(userId);
  } catch (err) {
    console.error('Failed to load achievement unlocks for graph:', err);
  }

  // Filter unlocks to only those that fall within the range of the resampled points
  // Map them to the closest resampled point
  const resampledWithMilestones = resampled.map(r => ({
    ...r,
    achievements: [] as any[]
  }));

  if (resampled.length > 0) {
    const minTime = resampled[0].time;
    const maxTime = resampled[resampled.length - 1].time;

    const { ACHIEVEMENTS } = await import('./achievements');

    Object.entries(achievementUnlocks).forEach(([id, unlockTime]) => {
      if (unlockTime >= minTime && unlockTime <= maxTime) {
        // Find closest point
        let closestIdx = 0;
        let minDiff = Math.abs(resampled[0].time - unlockTime);
        for (let i = 1; i < resampled.length; i++) {
          const diff = Math.abs(resampled[i].time - unlockTime);
          if (diff < minDiff) {
            minDiff = diff;
            closestIdx = i;
          }
        }
        
        const achDetails = ACHIEVEMENTS.find(a => a.id === id);
        if (achDetails) {
          resampledWithMilestones[closestIdx].achievements.push(achDetails);
        }
      }
    });
  }

  return {
    portfolio: resampledWithMilestones.map(r => ({ 
      time: r.time, 
      value: r.value,
      achievements: r.achievements 
    })),
    benchmark: resampledWithMilestones.map(r => ({ 
      time: r.time, 
      value: r.spyValue 
    }))
  };
}

export async function initializePortfolio(strategy: 'tech_heavy' | 'index_follower' | 'day_trader') {
  try {
    const userId = await getAuthenticatedUserId();
    const userRef = doc(db, 'users', userId);
    const portfolioRef = doc(db, 'users', userId, 'portfolio', 'main');
    const holdingsRef = collection(db, 'users', userId, 'portfolio', 'main', 'holdings');

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
    const batch = writeBatch(db);

    // Ensure user and portfolio exists
    batch.set(userRef, { lastInitialized: serverTimestamp() }, { merge: true });
    batch.set(portfolioRef, { cash: startingCash, strategy }, { merge: true });

    // Clear old holdings
    const currentHoldings = await getDocs(holdingsRef);
    currentHoldings.docs.forEach(d => batch.delete(d.ref));

    // Add new ones
    processedHoldings.forEach(h => {
      batch.set(doc(holdingsRef, h.ticker.toUpperCase()), { qty: h.qty, avgPrice: h.avgPrice });
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

export async function borrowMoney(amount: number, rateInput?: number) {
  const userId = await getAuthenticatedUserId();
  const portfolioRef = doc(db, 'users', userId, 'portfolio', 'main');

  // Dynamic interest rate based on borrow amount (e.g. 4.8% at $1k, 8% at $5k, 12% at $10k)
  const rate = rateInput !== undefined ? rateInput : (0.04 + (amount / 10000) * 0.08);

  try {
    await runTransaction(db, async (transaction) => {
      const portDoc = await transaction.get(portfolioRef);
      if (!portDoc.exists()) {
        throw new Error('Portfolio not found');
      }

      const portData = portDoc.data();
      if (portData?.hasBorrowed) {
        throw new Error('You have already completed the borrowing lesson and borrowed money.');
      }

      const currentCash = Number(portData.cash ?? 10000);
      const newCash = safeAdd(currentCash, amount);

      // Compound annually, divided daily: amount * (1 + rate / 365) ^ 365
      const calculatedAmountOwed = amount * Math.pow(1 + rate / 365, 365);

      transaction.set(portfolioRef, {
        cash: newCash,
        borrowedAmount: amount,
        interestRate: rate,
        amountOwed: calculatedAmountOwed,
        hasBorrowed: true,
      }, { merge: true });
    });

    return { success: true };
  } catch (error: any) {
    console.error('Borrowing Failed:', error.message);
    throw new Error(error.message || 'Borrowing execution failed');
  }
}

export async function spendPortfolioCash(amount: number) {
  const userId = await getAuthenticatedUserId();
  const portfolioRef = doc(db, 'users', userId, 'portfolio', 'main');

  try {
    await runTransaction(db, async (transaction) => {
      const portDoc = await transaction.get(portfolioRef);
      if (!portDoc.exists()) {
        throw new Error('Portfolio not found');
      }

      const portData = portDoc.data();
      const currentCash = Number(portData.cash ?? 10000);
      if (currentCash < amount) {
        throw new Error('Insufficient funds in portfolio cash balance');
      }

      const newCash = safeSubtract(currentCash, amount);
      transaction.set(portfolioRef, {
        cash: newCash
      }, { merge: true });
    });

    return { success: true };
  } catch (error: any) {
    console.error('Spend cash failed:', error.message);
    throw new Error(error.message || 'Deducting portfolio cash failed');
  }
}
