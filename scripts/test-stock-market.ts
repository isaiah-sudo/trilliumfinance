import assert from 'assert';
import { KNOWN_STOCKS_DATA, getStockMetadata } from '../lib/stockUtils';
import { resolveStockQuote, getMockPrice } from '../lib/stockQuoteResolver';
import { getFallbackProfile } from '../app/actions/stockDetails';

async function runStockMarketTests() {
  console.log('=== RUNNING STOCK MARKET SUITE TESTS ===\n');

  // Test 1: Verify Google stock deduplication
  console.log('[Test 1] Testing Stock Deduplication...');
  const tickers = Object.keys(KNOWN_STOCKS_DATA);
  const alphabetEntries = tickers.filter(t => KNOWN_STOCKS_DATA[t].name.includes('Alphabet'));
  assert.strictEqual(alphabetEntries.length, 1, `Expected exactly 1 Alphabet entry, found: ${alphabetEntries.join(', ')}`);
  assert.strictEqual(alphabetEntries[0], 'GOOGL', 'Expected Alphabet entry to be GOOGL');
  assert.strictEqual(tickers.includes('GOOG'), false, 'GOOG should be removed from KNOWN_STOCKS_DATA');
  console.log('✔ Test 1 Passed: Single Alphabet Inc. (GOOGL) stock present.\n');

  // Test 2: Check all base stock tickers metadata validity
  console.log('[Test 2] Validating Base Stock Metadata...');
  for (const ticker of tickers) {
    const meta = KNOWN_STOCKS_DATA[ticker];
    assert.ok(meta.basePrice > 0, `Base price for ${ticker} must be positive`);
    assert.ok(meta.domain && meta.domain.length > 0, `Domain for ${ticker} must exist`);
    assert.ok(meta.category, `Category for ${ticker} must exist`);
  }
  console.log(`✔ Test 2 Passed: All ${tickers.length} base stock metadata entries valid.\n`);

  // Test 3: Test resolveStockQuote price resolution (mock & fallback tier)
  console.log('[Test 3] Testing resolveStockQuote for top tickers...');
  const sampleTickers = ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'SPY'];
  for (const sym of sampleTickers) {
    const quote = await resolveStockQuote(sym);
    assert.strictEqual(quote.ticker, sym, `Quote ticker should match ${sym}`);
    assert.ok(quote.price > 0, `Price for ${sym} must be positive, got ${quote.price}`);
    assert.ok(typeof quote.change === 'number', `Change for ${sym} must be a number`);
  }
  console.log(`✔ Test 3 Passed: Quote resolution verified for ${sampleTickers.join(', ')}.\n`);

  // Test 4: Verify Fallback Company Profiles
  console.log('[Test 4] Testing getFallbackProfile corporate details...');
  for (const sym of ['AAPL', 'GOOGL', 'NVDA', 'UNKNOWN_TICKER']) {
    const profile = getFallbackProfile(sym);
    assert.ok(profile.name && profile.name.length > 0, `Profile name required for ${sym}`);
    assert.ok(profile.description && profile.description.length > 0, `Profile description required for ${sym}`);
    assert.ok(profile.marketCapitalization > 0, `Market cap required for ${sym}`);
  }
  console.log('✔ Test 4 Passed: Company profile fallbacks operating cleanly.\n');

  // Test 5: Verify getMockPrice deterministic micro-walk bounds
  console.log('[Test 5] Validating getMockPrice micro-walk safety bounds...');
  const mockAapl = getMockPrice('AAPL');
  const aaplMeta = getStockMetadata('AAPL');
  const priceRatio = mockAapl.c / aaplMeta.basePrice;
  assert.ok(priceRatio >= 0.8 && priceRatio <= 1.2, `Mock price ${mockAapl.c} deviates too much from base ${aaplMeta.basePrice}`);
  console.log('✔ Test 5 Passed: Micro-walk bounded within safe limits.\n');

  console.log('=== ALL STOCK MARKET TESTS PASSED SUCCESSFULLY! ===');
}

runStockMarketTests().catch(err => {
  console.error('❌ STOCK MARKET TEST SUITE FAILED:', err);
  process.exit(1);
});
