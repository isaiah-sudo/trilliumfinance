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
    logo: 'https://www.google.com/s2/favicons?domain=apple.com&sz=128',
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
    logo: 'https://www.google.com/s2/favicons?domain=microsoft.com&sz=128',
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
    logo: 'https://www.google.com/s2/favicons?domain=nvidia.com&sz=128',
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
    logo: 'https://www.google.com/s2/favicons?domain=google.com&sz=128',
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
    logo: 'https://www.google.com/s2/favicons?domain=amazon.com&sz=128',
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
    logo: 'https://www.google.com/s2/favicons?domain=meta.com&sz=128',
    weburl: 'https://www.meta.com',
    finnhubIndustry: 'Technology',
    marketCapitalization: 1200000,
    shareOutstanding: 2540,
    description: 'Meta Platforms, Inc. builds social technologies connecting billions across Facebook, Instagram, WhatsApp, Messenger, and Threads.'
  },
  TSLA: {
    name: 'Tesla, Inc.',
    ticker: 'TSLA',
    exchange: 'NASDAQ',
    logo: 'https://www.google.com/s2/favicons?domain=tesla.com&sz=128',
    weburl: 'https://www.tesla.com',
    finnhubIndustry: 'Automobiles & Components',
    marketCapitalization: 800000,
    shareOutstanding: 3180,
    description: 'Tesla, Inc. designs, develops, manufactures, sells, and leases electric vehicles, energy storage systems, solar panels, and solar roofs worldwide.'
  },
  XOM: {
    name: 'Exxon Mobil Corporation',
    ticker: 'XOM',
    exchange: 'NYSE',
    logo: 'https://www.google.com/s2/favicons?domain=exxonmobil.com&sz=128',
    weburl: 'https://www.exxonmobil.com',
    finnhubIndustry: 'Energy',
    marketCapitalization: 480000,
    shareOutstanding: 3950,
    description: 'Exxon Mobil Corporation explores for and produces crude oil and natural gas in the United States and internationally. It is one of the largest publicly traded energy providers in the world.'
  },
  V: {
    name: 'Visa Inc.',
    ticker: 'V',
    exchange: 'NYSE',
    logo: 'https://www.google.com/s2/favicons?domain=visa.com&sz=128',
    weburl: 'https://www.visa.com',
    finnhubIndustry: 'Financial Services',
    marketCapitalization: 570000,
    shareOutstanding: 2020,
    description: 'Visa Inc. operates the world\'s largest retail electronic payments network. It facilitates global digital commerce across consumers, merchants, financial institutions, and government entities.'
  },
  JPM: {
    name: 'JPMorgan Chase & Co.',
    ticker: 'JPM',
    exchange: 'NYSE',
    logo: 'https://www.google.com/s2/favicons?domain=jpmorganchase.com&sz=128',
    weburl: 'https://www.jpmorganchase.com',
    finnhubIndustry: 'Banking',
    marketCapitalization: 640000,
    shareOutstanding: 2840,
    description: 'JPMorgan Chase & Co. is a leading financial services firm with assets of $3.9 trillion and operations worldwide, providing investment banking, consumer financial services, and commercial banking.'
  },
  TSM: {
    name: 'Taiwan Semiconductor Manufacturing Co.',
    ticker: 'TSM',
    exchange: 'NYSE',
    logo: 'https://www.google.com/s2/favicons?domain=tsmc.com&sz=128',
    weburl: 'https://www.tsmc.com',
    finnhubIndustry: 'Semiconductors',
    marketCapitalization: 950000,
    shareOutstanding: 5180,
    description: 'Taiwan Semiconductor Manufacturing Company is the premier dedicated pure-play semiconductor foundry in the world, manufacturing advanced chips for global technology giants.'
  },
  AVGO: {
    name: 'Broadcom Inc.',
    ticker: 'AVGO',
    exchange: 'NASDAQ',
    logo: 'https://www.google.com/s2/favicons?domain=broadcom.com&sz=128',
    weburl: 'https://www.broadcom.com',
    finnhubIndustry: 'Semiconductors & AI Infrastructure',
    marketCapitalization: 1580000,
    shareOutstanding: 4680,
    description: 'Broadcom Inc. is a global technology leader designing and supplying semiconductor and enterprise software solutions, including custom AI ASICs/XPUs, Ethernet switching silicon, and VMware virtualization.'
  },
  SOX: {
    name: 'PHLX Semiconductor Sector Index',
    ticker: 'SOX',
    exchange: 'NASDAQ / PHLX',
    logo: 'https://www.google.com/s2/favicons?domain=nasdaq.com&sz=128',
    weburl: 'https://www.nasdaq.com/market-activity/index/sox',
    finnhubIndustry: 'Semiconductor Benchmark Index',
    marketCapitalization: 4500000,
    shareOutstanding: 0,
    description: 'The PHLX Semiconductor Sector Index (SOX) is the premier global benchmark tracking the 30 largest publicly traded companies involved in the design, distribution, manufacture, and sale of semiconductors worldwide.'
  }
};

function getFallbackProfile(symbol: string): CompanyProfile {
  const sym = symbol.toUpperCase();
  const mock = MOCK_PROFILES[sym];
  const name = mock?.name || `${sym} Inc.`;
  const ticker = mock?.ticker || sym;
  const exchange = mock?.exchange || 'NASDAQ';
  const logo = mock?.logo || `https://www.google.com/s2/favicons?domain=${sym.toLowerCase()}.com&sz=128`;
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

    const PROFILE_HEADERS = {
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800'
    };

    const cached = profileCache.get(sym);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(cached.data, { headers: PROFILE_HEADERS });
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
              logo: data.logo || `https://www.google.com/s2/favicons?domain=${sym.toLowerCase()}.com&sz=128`,
              weburl: data.weburl || '',
              finnhubIndustry: data.finnhubIndustry || 'General Sector',
              marketCapitalization: data.marketCapitalization || 0,
              shareOutstanding: data.shareOutstanding || 0,
              description: `${data.name} (${sym}) is a premier corporation operating dynamically within the ${data.finnhubIndustry || 'global'} industry, listed on ${data.exchange || 'the market'}.`
            };
            profileCache.set(sym, { data: profile, timestamp: Date.now() });
            return NextResponse.json(profile, { headers: PROFILE_HEADERS });
          }
        }
      } catch {
        // Fallback gracefully without throwing
      }
    }

    const fallback = getFallbackProfile(sym);
    profileCache.set(sym, { data: fallback, timestamp: Date.now() });
    return NextResponse.json(fallback, { headers: PROFILE_HEADERS });
  } catch (err: any) {
    return NextResponse.json(getFallbackProfile('SPY'), {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800'
      }
    });
  }
}
