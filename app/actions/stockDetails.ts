'use server';

export interface CompanyProfile {
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

// Hand-crafted premium fallback company profiles for the explore view tickers
const MOCK_PROFILES: Record<string, Partial<CompanyProfile>> = {
  AAPL: {
    name: 'Apple Inc.',
    ticker: 'AAPL',
    exchange: 'NASDAQ',
    logo: 'https://logo.clearbit.com/apple.com',
    weburl: 'https://www.apple.com',
    finnhubIndustry: 'Technology',
    marketCapitalization: 3100000,
    shareOutstanding: 15400,
    description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company is renowned for its consumer-centric hardware, robust ecosystem integration, and expanding digital services portfolio, including iOS, iCloud, Apple Music, and Apple Pay.'
  },
  MSFT: {
    name: 'Microsoft Corporation',
    ticker: 'MSFT',
    exchange: 'NASDAQ',
    logo: 'https://logo.clearbit.com/microsoft.com',
    weburl: 'https://www.microsoft.com',
    finnhubIndustry: 'Technology',
    marketCapitalization: 3200000,
    shareOutstanding: 7430,
    description: 'Microsoft Corporation is a dominant force in global computing and productivity. Key segments include Intelligent Cloud (Azure), Productivity and Business Processes (Office 365, Teams, LinkedIn), and More Personal Computing (Windows, Xbox gaming, and Surface hardware devices).'
  },
  NVDA: {
    name: 'NVIDIA Corporation',
    ticker: 'NVDA',
    exchange: 'NASDAQ',
    logo: 'https://logo.clearbit.com/nvidia.com',
    weburl: 'https://www.nvidia.com',
    finnhubIndustry: 'Technology',
    marketCapitalization: 2800000,
    shareOutstanding: 24600,
    description: 'NVIDIA Corporation designs graphics processing units (GPUs) for the gaming and professional visualization markets, alongside high-performance systems-on-chips for automotive and robotics industries. NVIDIA is the leading architectural backbone for modern artificial intelligence, deep learning, and advanced supercomputing networks.'
  },
  GOOGL: {
    name: 'Alphabet Inc.',
    ticker: 'GOOGL',
    exchange: 'NASDAQ',
    logo: 'https://logo.clearbit.com/google.com',
    weburl: 'https://www.google.com',
    finnhubIndustry: 'Technology',
    marketCapitalization: 2200000,
    shareOutstanding: 12400,
    description: 'Alphabet Inc. is a multinational technology holding company and the parent entity of Google. Alphabet dominates worldwide search engine systems, online video hosting (YouTube), mobile systems software (Android), cloud server infrastructure (Google Cloud), and leading AI research through Google DeepMind.'
  },
  AMZN: {
    name: 'Amazon.com, Inc.',
    ticker: 'AMZN',
    exchange: 'NASDAQ',
    logo: 'https://logo.clearbit.com/amazon.com',
    weburl: 'https://www.amazon.com',
    finnhubIndustry: 'Consumer',
    marketCapitalization: 1900000,
    shareOutstanding: 10400,
    description: 'Amazon.com, Inc. is a pioneer in e-commerce, cloud computing, online streaming, and digital distribution. Its AWS segment is the largest provider of infrastructure-as-a-service globally. Additionally, Amazon develops consumer hardware such as Kindle, Echo devices, and Ring security products.'
  },
  META: {
    name: 'Meta Platforms, Inc.',
    ticker: 'META',
    exchange: 'NASDAQ',
    logo: 'https://logo.clearbit.com/meta.com',
    weburl: 'https://www.meta.com',
    finnhubIndustry: 'Technology',
    marketCapitalization: 1200000,
    shareOutstanding: 2540,
    description: 'Meta Platforms, Inc. builds technologies that help people connect, find communities, and grow businesses. Its major social application offerings include Facebook, Instagram, WhatsApp, Messenger, and Threads, alongside advanced investments in virtual reality (Quest) and metaverse infrastructure.'
  },
  TSM: {
    name: 'Taiwan Semiconductor Manufacturing Co.',
    ticker: 'TSM',
    exchange: 'NYSE',
    logo: 'https://logo.clearbit.com/tsmc.com',
    weburl: 'https://www.tsmc.com',
    finnhubIndustry: 'Technology',
    marketCapitalization: 850000,
    shareOutstanding: 5180,
    description: 'Taiwan Semiconductor Manufacturing Company (TSMC) is the world\'s largest dedicated independent semiconductor foundry. TSMC manufactures advanced microchips for industry leaders such as Apple, NVIDIA, and AMD, serving as the foundational manufacturer for cutting-edge computing global supply chains.'
  },
  JPM: {
    name: 'JPMorgan Chase & Co.',
    ticker: 'JPM',
    exchange: 'NYSE',
    logo: 'https://logo.clearbit.com/jpmorganchase.com',
    weburl: 'https://www.jpmorganchase.com',
    finnhubIndustry: 'Finance',
    marketCapitalization: 570000,
    shareOutstanding: 2870,
    description: 'JPMorgan Chase & Co. is a preeminent global financial services firm and the largest banking institution in the United States. It provides consumer banking, investment banking, commercial banking, financial transaction processing, and asset management services across global markets.'
  }
};

/**
 * Server Action to fetch stock profile details from Finnhub, cached for 24 hours.
 * Uses native Next.js 15 fetch caching with 86400 seconds revalidation.
 */
export async function getCompanyProfile(symbol: string): Promise<CompanyProfile> {
  const token = process.env.FINNHUB_API_KEY;
  const upperSymbol = symbol.toUpperCase();

  if (!token) {
    console.warn('[StockDetails Action] FINNHUB_API_KEY not set. Serving rich mock fallback.');
    return getFallbackProfile(upperSymbol);
  }

  try {
    const res = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${upperSymbol}&token=${token}`, {
      next: { revalidate: 86400 }, // 24-hour data revalidation
    });

    if (!res.ok) {
      console.warn(`[StockDetails Action] Finnhub returned status ${res.status}. Falling back.`);
      return getFallbackProfile(upperSymbol);
    }

    const data = await res.json();

    // Finnhub returns empty object if symbol is invalid/not found
    if (!data || Object.keys(data).length === 0 || !data.name) {
      console.warn(`[StockDetails Action] Empty profile response for ${upperSymbol}. Falling back.`);
      return getFallbackProfile(upperSymbol);
    }

    // Build the fallback description since profile2 does not feature full descriptive text
    const name = data.name || upperSymbol;
    const exchange = data.exchange || 'Major Financial Exchange';
    const industry = data.finnhubIndustry || 'Global Economy';
    const outstandingShares = data.shareOutstanding || 0;
    const marketCap = data.marketCapitalization || 0;

    const formattedMarketCap = marketCap >= 1000 
      ? `$${(marketCap / 1000).toFixed(2)} billion` 
      : `$${marketCap.toLocaleString()} million`;

    const description = `${name} (${upperSymbol}) is a premier corporation operating dynamically within the ${industry} industry. Listed and actively traded on the ${exchange}, the company commands a notable market footprint with a capitalization of approximately ${formattedMarketCap} and ${outstandingShares.toLocaleString(undefined, { maximumFractionDigits: 2 })} million outstanding shares. ${name} is dedicated to pioneering innovation, operational excellence, and delivering robust long-term value to its investors globally.`;

    return {
      name: data.name || upperSymbol,
      ticker: data.ticker || upperSymbol,
      exchange: data.exchange || 'Unknown Exchange',
      logo: data.logo || '',
      weburl: data.weburl || '',
      finnhubIndustry: data.finnhubIndustry || 'General Sector',
      marketCapitalization: data.marketCapitalization || 0,
      shareOutstanding: data.shareOutstanding || 0,
      description,
    };
  } catch (error) {
    console.error(`[StockDetails Action] Error fetching profile for ${upperSymbol}:`, error);
    return getFallbackProfile(upperSymbol);
  }
}

/**
 * Returns a high-fidelity preset or dynamically compiled fallback profile if API fails/missing
 */
function getFallbackProfile(symbol: string): CompanyProfile {
  const mock = MOCK_PROFILES[symbol];

  const name = mock?.name || `${symbol} Inc.`;
  const ticker = mock?.ticker || symbol;
  const exchange = mock?.exchange || 'NASDAQ';
  const logo = mock?.logo || '';
  const weburl = mock?.weburl || `https://www.${symbol.toLowerCase()}.com`;
  const finnhubIndustry = mock?.finnhubIndustry || 'Global Commerce';
  const marketCapitalization = mock?.marketCapitalization || 120000;
  const shareOutstanding = mock?.shareOutstanding || 1500;

  const formattedMarketCap = marketCapitalization >= 1000 
    ? `$${(marketCapitalization / 1000).toFixed(2)} billion` 
    : `$${marketCapitalization.toLocaleString()} million`;

  const description = mock?.description || 
    `${name} (${ticker}) is a major enterprise leading operations in the ${finnhubIndustry} sector. Under active asset tracking on the Trillium Finance Market Explorer, the company represents high-caliber equity trading. Listed on the ${exchange}, it manages an approximate market capitalization of ${formattedMarketCap} backed by ${shareOutstanding.toLocaleString()} million active outstanding shares.`;

  return {
    name,
    ticker,
    exchange,
    logo,
    weburl,
    finnhubIndustry,
    marketCapitalization,
    shareOutstanding,
    description,
  };
}
