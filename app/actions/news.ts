import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, query, orderBy, limit } from 'firebase/firestore';

export interface NewsArticle {
  id: string | number;
  headline: string;
  summary: string;
  source: string;
  url: string;
  image: string;
  datetime: number;
  tags: string[];
  isRestricted?: boolean;
  executiveSummary?: string[];
  content?: string;
  convertedAt?: number;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60';

// Premium initial macro market articles catalog
export const MOCK_NEWS: NewsArticle[] = [
  {
    id: 'news-101',
    headline: 'Federal Reserve Signals Rate Caution as Inflation and Job Metrics Stabilize',
    summary: 'Federal Reserve officials emphasized a data-dependent stance during their latest policy session, highlighting balanced risks between inflation control and labor market strength.',
    source: 'Wall Street Journal / Reuters',
    url: 'https://www.cnbc.com/finance/',
    image: 'https://images.unsplash.com/photo-1624996379697-f01d168b1a52?w=800&auto=format&fit=crop&q=60',
    datetime: Math.floor(Date.now() / 1000) - 3600 * 2,
    tags: ['#FederalReserve', '#Inflation', '#MarketTrends'],
    isRestricted: true,
    executiveSummary: [
      'Fed officials agree on maintaining current policy rates while monitoring quarterly inflation targets.',
      'Treasury yields eased 8 basis points following the release of favorable labor cost indices.',
      'S&P 500 futures rallied 0.4% as equity investors priced in higher probability of an economic soft landing.'
    ],
    content: `Federal Reserve policymakers signaled a measured approach to upcoming interest rate decisions, underscoring that inflation continues to trend toward their 2% benchmark objective despite stubborn services sector price data.

    Speaking at the financial policy symposium, committee members noted that balanced labor dynamics have significantly alleviated underlying economic pressures. "We are in a favorable position to evaluate incoming macroeconomic indicators prior to making adjustments," noted senior central bank strategists.

    Financial markets responded positively to the announcements, with broad equity indexes recording gain distributions across technology, energy, and financial sectors. Economists anticipate key upcoming CPI and PCE reports will dictate the pace of monetary adjustments over the remaining quarters.`
  },
  {
    id: 'news-102',
    headline: 'Global Treasury Yields Retrench as Macro Inflation Pressure Drops',
    summary: 'Benchmark 10-year Treasury yields pulled back from multi-month highs as consumer price index reports pointed toward cooling global inflation rates.',
    source: 'Bloomberg Markets',
    url: 'https://www.bloomberg.com/markets',
    image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=60',
    datetime: Math.floor(Date.now() / 1000) - 3600 * 5,
    tags: ['#Inflation', '#Markets', '#MarketTrends'],
    isRestricted: false,
    content: `Global bond yields retreated sharply today as updated international trade and inflation readings registered lower-than-anticipated consumer cost surges.

    The 10-year U.S. Treasury note yield decreased to 4.12%, while European peripheral sovereign debt yields followed a similar downward trajectory. Analysts attribute the shift to decelerating wholesale manufacturing input prices and stabilized global supply chain logistics.

    Lower sovereign borrowing costs provided immediate momentum to equity markets, propelling benchmark indexes higher led by growth equity assets.`
  },
  {
    id: 'news-103',
    headline: 'S&P 500 & Nasdaq Extend Gains Amid Tech Sector Capital Inflows',
    summary: 'U.S. benchmark equity indices surged to new local highs today as corporate earnings revisions and strong macro momentum drove institutional capital inflows.',
    source: 'Financial Times',
    url: 'https://www.ft.com/markets',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60',
    datetime: Math.floor(Date.now() / 1000) - 3600 * 8,
    tags: ['#MarketTrends', '#Markets', '#FederalReserve'],
    isRestricted: true,
    executiveSummary: [
      'Broad-based market momentum was driven by mega-cap technology balance sheet strength.',
      'Institutional fund managers increased equity allocation weightings to 18-month highs.',
      'Volatility index (VIX) contracted below 14, signaling calm risk sentiment across global trading desks.'
    ],
    content: `U.S. stock indices continued their upward expansion today as strong institutional buying lifted major benchmarks. The S&P 500 advanced 0.9%, while the Nasdaq Composite gained 1.2%.

    Market strategists highlighted that favorable macroeconomic liquidity conditions combined with strong corporate profitability metrics have created a supportive environment for equity valuations.

    Sector broad rotations showed robust demand in semiconductors, industrial automation, and enterprise cloud infrastructure software.`
  }
];

/**
 * Derives macro topic tags based on headline and summary text content
 */
export function determineMacroTags(headline: string, summary: string): string[] {
  const text = `${headline} ${summary}`.toLowerCase();
  const tags: string[] = [];

  if (text.includes('fed') || text.includes('reserve') || text.includes('powell') || text.includes('rate') || text.includes('fomc') || text.includes('yield')) {
    tags.push('#FederalReserve');
  }
  if (text.includes('inflation') || text.includes('cpi') || text.includes('ppi') || text.includes('price') || text.includes('cost')) {
    tags.push('#Inflation');
  }
  if (text.includes('market') || text.includes('s&p') || text.includes('nasdaq') || text.includes('dow') || text.includes('stock') || text.includes('rally') || text.includes('trend')) {
    tags.push('#MarketTrends');
  }
  if (text.includes('gdp') || text.includes('economy') || text.includes('macro') || text.includes('job') || text.includes('employment') || text.includes('trade')) {
    tags.push('#MacroEconomy');
  }

  if (tags.length === 0) {
    tags.push('#Markets');
  }

  return tags;
}

/**
 * Client-side action to fetch general market news from Finnhub & macro catalog.
 */
export async function getDailyThreeNews(): Promise<NewsArticle[]> {
  const token = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

  if (!token) {
    return MOCK_NEWS;
  }

  try {
    const res = await fetch(`https://finnhub.io/api/v1/news?category=general&token=${token}`, {
      cache: 'force-cache',
    });

    if (!res.ok) {
      return MOCK_NEWS;
    }

    const rawData = await res.json();

    if (!Array.isArray(rawData) || rawData.length === 0) {
      return MOCK_NEWS;
    }

    const mappedArticles: NewsArticle[] = rawData
      .slice(0, 10)
      .map((article: any, index: number) => {
        const headline = article.headline || 'Macro Market Update';
        const summary = article.summary || 'Follow the link to read the full report on current macroeconomic developments.';
        const tags = determineMacroTags(headline, summary);
        
        // Detect restricted/paywalled sources (CNBC, Bloomberg, WSJ, SeekingAlpha, etc.)
        const sourceStr = (article.source || '').toLowerCase();
        const urlStr = (article.url || '').toLowerCase();
        const isRestricted = sourceStr.includes('cnbc') || sourceStr.includes('bloomberg') || sourceStr.includes('wsj') || urlStr.includes('cnbc') || urlStr.includes('bloomberg');

        return {
          id: article.id ? `news-${article.id}` : `news-gen-${index}`,
          headline,
          summary,
          source: article.source || 'Financial News',
          url: article.url || 'https://finnhub.io',
          image: article.image && article.image.startsWith('http') ? article.image : FALLBACK_IMAGE,
          datetime: article.datetime || Math.floor(Date.now() / 1000),
          tags,
          isRestricted,
          executiveSummary: isRestricted ? [
            `Key analysis regarding ${headline.slice(0, 50)}...`,
            'Market impact evaluated across major index sectors and bond yield spreads.',
            'Click below to process and read the cleansed executive briefing.'
          ] : undefined
        };
      });

    return mappedArticles.length >= 3 ? mappedArticles : MOCK_NEWS;
  } catch (error) {
    console.error('[News Action] Error fetching news:', error);
    return MOCK_NEWS;
  }
}

/**
 * Returns full converted news catalog sorted chronologically for news.trilliumfinance.net
 */
export async function getMacroNewsCatalog(): Promise<NewsArticle[]> {
  try {
    // Try reading from Firestore news_articles collection
    const newsRef = collection(db, 'news_articles');
    const q = query(newsRef, orderBy('datetime', 'desc'), limit(50));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const articles: NewsArticle[] = [];
      snap.forEach(docSnap => {
        articles.push({ id: docSnap.id, ...docSnap.data() } as NewsArticle);
      });
      return articles;
    }
  } catch (e) {
    console.warn('[News Catalog] Firestore read fallback:', e);
  }

  // Fallback to fresh macro news items
  return getDailyThreeNews();
}
