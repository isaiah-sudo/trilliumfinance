const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Read stockUtils.ts source to test deduplication and metadata assertions statically
const stockUtilsContent = fs.readFileSync(path.join(__dirname, '../lib/stockUtils.ts'), 'utf8');

console.log('=== RUNNING STOCK MARKET INTEGRITY & DEDUPLICATION TESTS ===\n');

// Test 1: Deduplication Check for GOOG
console.log('[Test 1] Testing Stock Deduplication...');
const googMatches = stockUtilsContent.match(/GOOG:\s*\{/g);
const googlMatches = stockUtilsContent.match(/GOOGL:\s*\{/g);

assert.strictEqual(googMatches, null, 'GOOG ticker should be removed from KNOWN_STOCKS_DATA');
assert.notStrictEqual(googlMatches, null, 'GOOGL ticker should be present in KNOWN_STOCKS_DATA');
console.log('✔ Test 1 Passed: GOOG duplicate stock removed successfully.\n');

// Test 2: Check StockMarketContext TIMESTAMP separation
console.log('[Test 2] Validating StockMarketContext cache TTL separation...');
const contextContent = fs.readFileSync(path.join(__dirname, '../context/StockMarketContext.tsx'), 'utf8');
assert.ok(contextContent.includes('isNetworkFetch'), 'saveToCache must accept isNetworkFetch parameter');
assert.ok(contextContent.includes('saveToCache(updated, true)'), 'refreshCacheIfStale must pass isNetworkFetch = true');
console.log('✔ Test 2 Passed: Stock market context network cache refresh timestamp disambiguated.\n');

// Test 3: Check DashboardSettingsContext snapshot listener error handling
console.log('[Test 3] Validating DashboardSettingsContext snapshot error callback...');
const dashboardContextContent = fs.readFileSync(path.join(__dirname, '../context/DashboardSettingsContext.tsx'), 'utf8');
assert.ok(dashboardContextContent.includes("console.warn('Error fetching classroom settings snapshot:', err)"), 'classRef snapshot listener must contain error callback');
console.log('✔ Test 3 Passed: Classroom snapshot listener includes error handling callback.\n');

// Test 4: Check firestore.rules rules structure
console.log('[Test 4] Validating firestore.rules security structure...');
const rulesContent = fs.readFileSync(path.join(__dirname, '../firestore.rules'), 'utf8');
assert.ok(rulesContent.includes('match /classrooms/{classId}'), 'firestore.rules must explicitly define classroom match');
assert.ok(rulesContent.includes('match /news_articles/{articleId}'), 'firestore.rules must allow news articles read');
console.log('✔ Test 4 Passed: Firestore rules contain explicit collection rules.\n');

console.log('=== ALL STOCK MARKET INTEGRITY TESTS PASSED SUCCESSFULLY! ===');
