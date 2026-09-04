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
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=apple.com',
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
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=microsoft.com',
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
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=nvidia.com',
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
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=google.com',
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
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=amazon.com',
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
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=meta.com',
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
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=tsmc.com',
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
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=jpmorganchase.com',
    weburl: 'https://www.jpmorganchase.com',
    finnhubIndustry: 'Finance',
    marketCapitalization: 570000,
    shareOutstanding: 2870,
    description: 'JPMorgan Chase & Co. is a preeminent global financial services firm and the largest banking institution in the United States. It provides consumer banking, investment banking, commercial banking, financial transaction processing, and asset management services across global markets.'
  }
};

/**
 * Action to fetch stock profile details via server proxy and cache.
 */
export async function getCompanyProfile(symbol: string): Promise<CompanyProfile> {
  const upperSymbol = symbol.toUpperCase();

  try {
    if (typeof window !== 'undefined') {
      const res = await fetch(`/api/stocks/profile?symbol=${encodeURIComponent(upperSymbol)}`, {
        cache: 'default'
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.name) {
          return data as CompanyProfile;
        }
      }
    }
  } catch {
    // Graceful fallback
  }

  return getFallbackProfile(upperSymbol);
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
