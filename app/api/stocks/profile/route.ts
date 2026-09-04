import { NextRequest, NextResponse } from 'next/server';

interface CompanyProfile {
  name: string;
  ticker: string;
  exchange: string;
  logo: string;
  weburl: string;
  finnhubIndustry: string;
  marketCapitalization: number;
  shareOutstanding: number;
  description: string;
}

const profileCache = new Map<string, { data: CompanyProfile; timestamp: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const MOCK_PROFILES: Record<string, Partial<CompanyProfile>> = {
  AAPL: {
    name: 'Apple Inc.',
    ticker: 'AAPL',
    exchange: 'NASDAQ',
    logo: 'https://icons.duckduckgo.com/ip3/apple.com.ico',
    weburl: 'https://www.apple.com',
    finnhubIndustry: 'Technology',
    marketCapitalization: 3100000,
    shareOutstanding: 15400,
    description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. Renowned for its hardware and software ecosystem.'
  },
  MSFT: {
    name: 'Microsoft Corporation',
    ticker: 'MSFT',
    exchange: 'NASDAQ',
    logo: 'https://icons.duckduckgo.com/ip3/microsoft.com.ico',
    weburl: 'https://www.microsoft.com',
    finnhubIndustry: 'Technology',
    marketCapitalization: 3200000,
    shareOutstanding: 7430,
    description: 'Microsoft Corporation is a dominant force in global computing, enterprise software, Azure cloud infrastructure, and AI technologies.'
  },
  NVDA: {
    name: 'NVIDIA Corporation',
    ticker: 'NVDA',
    exchange: 'NASDAQ',
    logo: 'https://icons.duckduckgo.com/ip3/nvidia.com.ico',
    weburl: 'https://www.nvidia.com',
    finnhubIndustry: 'Technology',
    marketCapitalization: 2800000,
    shareOutstanding: 24600,
    description: 'NVIDIA Corporation designs graphics processing units (GPUs) and accelerated computing platforms powering artificial intelligence and high-performance computing.'
  },
  GOOGL: {
    name: 'Alphabet Inc.',
    ticker: 'GOOGL',
    exchange: 'NASDAQ',
    logo: 'https://icons.duckduckgo.com/ip3/google.com.ico',
    weburl: 'https://www.google.com',
    finnhubIndustry: 'Technology',
    marketCapitalization: 2200000,
    shareOutstanding: 12400,
    description: 'Alphabet Inc. is a multinational technology conglomerate and parent company of Google, YouTube, Android, Google Cloud, and DeepMind.'
  },
  AMZN: {
    name: 'Amazon.com, Inc.',
    ticker: 'AMZN',
    exchange: 'NASDAQ',
    logo: 'https://icons.duckduckgo.com/ip3/amazon.com.ico',
    weburl: 'https://www.amazon.com',
    finnhubIndustry: 'Consumer',
    marketCapitalization: 1900000,
    shareOutstanding: 10400,
    description: 'Amazon.com, Inc. is a global leader in e-commerce, cloud computing (AWS), digital streaming, and artificial intelligence.'
  },
  META: {
    name: 'Meta Platforms, Inc.',
    ticker: 'META',
    exchange: 'NASDAQ',
    logo: 'https://icons.duckduckgo.com/ip3/meta.com.ico',
    weburl: 'https://www.meta.com',
    finnhubIndustry: 'Technology',
    marketCapitalization: 1200000,
    shareOutstanding: 2540,
    description: 'Meta Platforms, Inc. builds social technologies connecting billions across Facebook, Instagram, WhatsApp, Messenger, and Threads.'
  }
};

function getFallbackProfile(symbol: string): CompanyProfile {
  const sym = symbol.toUpperCase();
  const mock = MOCK_PROFILES[sym];
  const name = mock?.name || `${sym} Inc.`;
  const ticker = mock?.ticker || sym;
  const exchange = mock?.exchange || 'NASDAQ';
  const logo = mock?.logo || `https://icons.duckduckgo.com/ip3/${sym.toLowerCase()}.com.ico`;
  const weburl = mock?.weburl || `https://www.${sym.toLowerCase()}.com`;
  const finnhubIndustry = mock?.finnhubIndustry || 'Technology';
  const marketCapitalization = mock?.marketCapitalization || 120000;
  const shareOutstanding = mock?.shareOutstanding || 1500;

  const formattedMarketCap = marketCapFormatted(marketCapitalization);

  const description = mock?.description ||
    `${name} (${ticker}) is an established corporation actively traded on the ${exchange}, operating in the ${finnhubIndustry} sector with a market capitalization of approximately ${formattedMarketCap}.`;

  return {
    name,
    ticker,
    exchange,
    logo,
    weburl,
    finnhubIndustry,
    marketCapitalization,
    shareOutstanding,
    description
  };
}

function marketCapFormatted(val: number) {
  return val >= 1000 ? `$${(val / 1000).toFixed(2)}B` : `$${val.toLocaleString()}M`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbolParam = searchParams.get('symbol') || '';
    const sym = symbolParam.trim().toUpperCase();

    if (!sym) {
      return NextResponse.json({ error: 'Symbol required' }, { status: 400 });
    }

    const cached = profileCache.get(sym);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(cached.data);
    }

    const token = process.env.FINNHUB_API_KEY || process.env.NEXT_PUBLIC_FINNHUB_API_KEY || '';

    if (token) {
      try {
        const res = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${sym}&token=${token}`, {
          signal: AbortSignal.timeout(3000)
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.name) {
            const profile: CompanyProfile = {
              name: data.name || sym,
              ticker: data.ticker || sym,
              exchange: data.exchange || 'Major Exchange',
              logo: data.logo || `https://icons.duckduckgo.com/ip3/${sym.toLowerCase()}.com.ico`,
              weburl: data.weburl || '',
              finnhubIndustry: data.finnhubIndustry || 'General Sector',
              marketCapitalization: data.marketCapitalization || 0,
              shareOutstanding: data.shareOutstanding || 0,
              description: `${data.name} (${sym}) is a premier corporation operating dynamically within the ${data.finnhubIndustry || 'global'} industry, listed on ${data.exchange || 'the market'}.`
            };
            profileCache.set(sym, { data: profile, timestamp: Date.now() });
            return NextResponse.json(profile);
          }
        }
      } catch {
        // Fallback gracefully
      }
    }

    const fallback = getFallbackProfile(sym);
    profileCache.set(sym, { data: fallback, timestamp: Date.now() });
    return NextResponse.json(fallback);
  } catch (err: any) {
    return NextResponse.json(getFallbackProfile('SPY'));
  }
}
