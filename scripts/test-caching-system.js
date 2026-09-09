const assert = require('assert');

console.log('--- RUNNING CACHING & SERVER SYNC SYSTEM TEST SUITE ---');

// Mock localStorage / sessionStorage implementation
class MockStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

const CACHE_KEY = 'trillium_global_stock_market_v2';
const TIMESTAMP_KEY = 'trillium_global_stock_market_time_v2';
const CLIENT_CACHE_MAX_AGE_MS = 60 * 60 * 1000;

function getMarketDateString(ts) {
  try {
    return new Date(ts).toLocaleDateString('en-US', { timeZone: 'America/New_York' });
  } catch {
    return new Date(ts).toISOString().split('T')[0];
  }
}

function evaluateClientCache(localStorageMock, sessionStorageMock, BASE_STOCKS) {
  const lastTimeStr = localStorageMock.getItem(TIMESTAMP_KEY) || sessionStorageMock.getItem(TIMESTAMP_KEY);
  const lastTime = lastTimeStr ? parseInt(lastTimeStr, 10) : 0;
  const now = Date.now();

  const isExpiredByTime = !lastTime || (now - lastTime > CLIENT_CACHE_MAX_AGE_MS);
  const isExpiredByDate = lastTime > 0 && (getMarketDateString(lastTime) !== getMarketDateString(now));

  if (isExpiredByTime || isExpiredByDate) {
    localStorageMock.removeItem(CACHE_KEY);
    localStorageMock.removeItem(TIMESTAMP_KEY);
    sessionStorageMock.removeItem(CACHE_KEY);
    sessionStorageMock.removeItem(TIMESTAMP_KEY);
    return { status: 'PURGED', data: BASE_STOCKS };
  }

  const cached = localStorageMock.getItem(CACHE_KEY) || sessionStorageMock.getItem(CACHE_KEY);
  if (cached) {
    return { status: 'VALID', data: JSON.parse(cached) };
  }
  return { status: 'EMPTY', data: BASE_STOCKS };
}

// TEST 1: Fresh Cache Valid
{
  const ls = new MockStorage();
  const ss = new MockStorage();
  const base = [{ ticker: 'AAPL', price: 180 }];
  const cachedData = [{ ticker: 'AAPL', price: 185 }];
  
  ls.setItem(CACHE_KEY, JSON.stringify(cachedData));
  ls.setItem(TIMESTAMP_KEY, (Date.now() - 5 * 60 * 1000).toString()); // 5 mins ago

  const result = evaluateClientCache(ls, ss, base);
  assert.strictEqual(result.status, 'VALID');
  assert.strictEqual(result.data[0].price, 185);
  console.log('✓ TEST 1 PASSED: Fresh client cache (< 1hr) preserved successfully.');
}

// TEST 2: Stale Cache (> 1 hour old) Purged
{
  const ls = new MockStorage();
  const ss = new MockStorage();
  const base = [{ ticker: 'AAPL', price: 180 }];
  const staleData = [{ ticker: 'AAPL', price: 150 }];
  
  ls.setItem(CACHE_KEY, JSON.stringify(staleData));
  ls.setItem(TIMESTAMP_KEY, (Date.now() - 65 * 60 * 1000).toString()); // 65 mins ago

  const result = evaluateClientCache(ls, ss, base);
  assert.strictEqual(result.status, 'PURGED');
  assert.strictEqual(ls.getItem(CACHE_KEY), null);
  assert.strictEqual(ls.getItem(TIMESTAMP_KEY), null);
  assert.strictEqual(result.data[0].price, 180);
  console.log('✓ TEST 2 PASSED: Stale client cache (> 1hr) purged immediately on load.');
}

// TEST 3: Stale Cache (US Eastern Market Timezone Invalidation) Purged
{
  const ls = new MockStorage();
  const ss = new MockStorage();
  const base = [{ ticker: 'AAPL', price: 180 }];
  const yesterdayData = [{ ticker: 'AAPL', price: 175 }];
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(15, 0, 0, 0); // 3pm yesterday

  ls.setItem(CACHE_KEY, JSON.stringify(yesterdayData));
  ls.setItem(TIMESTAMP_KEY, yesterday.getTime().toString());

  const result = evaluateClientCache(ls, ss, base);
  assert.strictEqual(result.status, 'PURGED');
  assert.strictEqual(ls.getItem(CACHE_KEY), null);
  assert.strictEqual(result.data[0].price, 180);
  console.log('✓ TEST 3 PASSED: Yesterday client cache (America/New_York standardized) purged immediately on load.');
}

// TEST 4: Single-Flight Request Coalescing & Exception Cleanup Simulation
{
  const inFlightPromises = new Map();
  let fetchCounter = 0;

  async function simulatedResolver(symbol, shouldFail = false) {
    if (inFlightPromises.has(symbol)) {
      return await inFlightPromises.get(symbol);
    }

    const promise = (async () => {
      try {
        fetchCounter++;
        await new Promise(r => setTimeout(r, 50));
        if (shouldFail) {
          throw new Error('Simulated network timeout');
        }
        return { symbol, price: 200, count: fetchCounter };
      } finally {
        inFlightPromises.delete(symbol);
      }
    })();

    inFlightPromises.set(symbol, promise);
    try {
      return await promise;
    } catch (err) {
      inFlightPromises.delete(symbol);
      return { symbol, price: 150, count: fetchCounter, fallback: true };
    }
  }

  // 4a. Coalescing 4 parallel requests
  Promise.all([
    simulatedResolver('AAPL'),
    simulatedResolver('AAPL'),
    simulatedResolver('AAPL'),
    simulatedResolver('AAPL')
  ]).then(async results => {
    assert.strictEqual(fetchCounter, 1);
    assert.strictEqual(results[0].count, 1);
    assert.strictEqual(results[3].count, 1);
    assert.strictEqual(inFlightPromises.has('AAPL'), false);

    // 4b. Exception handling and cleanup check
    const failResult = await simulatedResolver('MSFT', true);
    assert.strictEqual(failResult.fallback, true);
    assert.strictEqual(inFlightPromises.has('MSFT'), false);

    console.log('✓ TEST 4 PASSED: Single-flight request coalescing and exception map cleanup verified successfully.');
    console.log('--- ALL CACHING & SERVER SYNC TESTS PASSED SUCCESSFULLY ---');
  }).catch(err => {
    console.error('FAILED TEST:', err);
    process.exit(1);
  });
}
