// Comprehensive test script for API keys defined in .env / .env.example
const https = require('https');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envFiles = ['.env.local', '.env', '.env.example'];
  const env = {};

  for (const file of envFiles) {
    const fullPath = path.join(__dirname, '..', file);
    if (fs.existsSync(fullPath)) {
      console.log(`[Config] Loading environment from: ${file}`);
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx !== -1) {
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
            if (!env[key]) {
              env[key] = val;
            }
          }
        }
      }
    }
  }
  return env;
}

function request(url, options = {}, body = null) {
  return new Promise((resolve) => {
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', (err) => resolve({ error: err.message, status: null }));
    if (body) req.write(body);
    req.end();
  });
}

async function runTests() {
  const env = loadEnv();

  console.log('\n========================================');
  console.log('       TRILLIUM FINANCE API AUDIT       ');
  console.log('========================================\n');

  // 1. FINNHUB API
  const finnhubKey = env.NEXT_PUBLIC_FINNHUB_API_KEY || env.FINNHUB_API_KEY;
  console.log('1. FINNHUB STOCK MARKET API:');
  if (!finnhubKey) {
    console.log('   ❌ No Finnhub API key found in env files.');
  } else {
    console.log(`   Key: ${finnhubKey.slice(0, 6)}...${finnhubKey.slice(-4)}`);
    // Quote
    const quoteRes = await request(`https://finnhub.io/api/v1/quote?symbol=AAPL&token=${finnhubKey}`);
    if (quoteRes.status === 200) {
      const q = JSON.parse(quoteRes.data);
      console.log(`   ✔ Quote ($AAPL): HTTP 200 OK | Price: $${q.c} (Change: ${q.dp}%)`);
    } else {
      console.log(`   ❌ Quote ($AAPL) Failed: HTTP ${quoteRes.status} - ${quoteRes.data}`);
    }

    // Company Profile
    const profRes = await request(`https://finnhub.io/api/v1/stock/profile2?symbol=AAPL&token=${finnhubKey}`);
    if (profRes.status === 200) {
      const p = JSON.parse(profRes.data);
      console.log(`   ✔ Company Profile ($AAPL): HTTP 200 OK | ${p.name || 'AAPL'} (${p.finnhubIndustry || 'Tech'})`);
    } else {
      console.log(`   ❌ Company Profile Failed: HTTP ${profRes.status} - ${profRes.data}`);
    }

    // Market News
    const newsRes = await request(`https://finnhub.io/api/v1/news?category=general&token=${finnhubKey}`);
    if (newsRes.status === 200) {
      const articles = JSON.parse(newsRes.data || '[]');
      console.log(`   ✔ General Market News: HTTP 200 OK | Retrieved ${articles.length} live articles`);
    } else {
      console.log(`   ❌ Market News Failed: HTTP ${newsRes.status} - ${newsRes.data}`);
    }
  }

  // 2. OPENROUTER AI API
  const openRouterKey = env.OPENROUTER_API_KEY;
  console.log('\n2. OPENROUTER AI CHAT API:');
  if (!openRouterKey) {
    console.log('   ❌ No OpenRouter API key found in env files.');
  } else {
    console.log(`   Key: ${openRouterKey.slice(0, 10)}...${openRouterKey.slice(-4)}`);
    const orRes = await request('https://openrouter.ai/api/v1/auth/key', {
      headers: { 'Authorization': `Bearer ${openRouterKey}` }
    });

    if (orRes.status === 200) {
      console.log(`   ✔ OpenRouter Auth: HTTP 200 OK | Key is active`);
    } else {
      console.log(`   ❌ OpenRouter Auth Failed: HTTP ${orRes.status} - ${orRes.data.trim()}`);
      console.log('      Note: Key rejected ("User not found"). Chatbot will automatically use internal financial analyst fallback.');
    }
  }

  // 3. FIREBASE CLIENT CONFIGURATION
  const fbKey = env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  console.log('\n3. FIREBASE SERVICES:');
  if (!fbKey || !projectId) {
    console.log('   ❌ Missing Firebase API key or Project ID in env files.');
  } else {
    console.log(`   Project ID: ${projectId}`);
    console.log(`   Web API Key: ${fbKey.slice(0, 8)}...${fbKey.slice(-4)}`);

    // Identity Toolkit
    const authRes = await request(`https://identitytoolkit.googleapis.com/v1/accounts:createAuthUri?key=${fbKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify({ identifier: 'test@example.com', continueUri: 'http://localhost' }));

    if (authRes.status === 200) {
      console.log(`   ✔ Firebase Auth (Identity Platform): HTTP 200 OK | API key is valid and connected`);
    } else {
      console.log(`   ❌ Firebase Auth: HTTP ${authRes.status} - ${authRes.data}`);
    }

    // Firestore Database
    const fsRes = await request(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users?key=${fbKey}`);
    if (fsRes.status === 403) {
      console.log(`   ✔ Firestore Database: HTTP 403 Forbidden (Expected: protected by Firestore security rules, DB exists & responsive)`);
    } else if (fsRes.status === 200) {
      console.log(`   ✔ Firestore Database: HTTP 200 OK (Public collection readable)`);
    } else {
      console.log(`   ❌ Firestore Database: HTTP ${fsRes.status} - ${fsRes.data}`);
    }
  }

  console.log('\n========================================\n');
}

runTests();
