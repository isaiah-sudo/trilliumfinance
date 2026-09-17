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
  keyTakeaways?: string[];
  content?: string;
  convertedAt?: number;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60';

// Professional financial market articles catalog (12 articles across core macro & sector themes)
export const MOCK_NEWS: NewsArticle[] = [
  {
    id: 'news-101',
    headline: 'Federal Reserve Signals Rate Caution as Inflation and Job Metrics Stabilize',
    summary: 'Federal Reserve officials emphasized a data-dependent stance during their latest policy session, highlighting balanced risks between inflation control and labor market strength.',
    source: 'Wall Street Journal',
    url: 'https://www.wsj.com',
    image: 'https://images.unsplash.com/photo-1624996379697-f01d168b1a52?w=800&auto=format&fit=crop&q=60',
    datetime: Math.floor(Date.now() / 1000) - 3600 * 2,
    tags: ['#FederalReserve', '#Inflation', '#MarketTrends'],
    keyTakeaways: [
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
    source: 'Bloomberg',
    url: 'https://www.bloomberg.com/markets',
    image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=60',
    datetime: Math.floor(Date.now() / 1000) - 3600 * 4,
    tags: ['#Inflation', '#Markets', '#MarketTrends'],
    keyTakeaways: [
      'The 10-year U.S. Treasury note yield retreated to 4.12%, easing overall borrowing costs.',
      'European peripheral sovereign debt yields followed a similar downward trajectory.',
      'Lower yields provided immediate momentum to equity markets, led by growth equities.'
    ],
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
    datetime: Math.floor(Date.now() / 1000) - 3600 * 6,
    tags: ['#MarketTrends', '#Markets', '#Technology'],
    keyTakeaways: [
      'Broad-based market momentum was driven by mega-cap technology balance sheet strength.',
      'Institutional fund managers increased equity allocation weightings to 18-month highs.',
      'Volatility index (VIX) contracted below 14, signaling calm risk sentiment across global trading desks.'
    ],
    content: `U.S. stock indices continued their upward expansion today as strong institutional buying lifted major benchmarks. The S&P 500 advanced 0.9%, while the Nasdaq Composite gained 1.2%.

Market strategists highlighted that favorable macroeconomic liquidity conditions combined with strong corporate profitability metrics have created a supportive environment for equity valuations.

Sector broad rotations showed robust demand in semiconductors, industrial automation, and enterprise cloud infrastructure software.`
  },
  {
    id: 'news-104',
    headline: 'Retail Sales Beat Estimates as Consumer Demand Defies High Borrowing Costs',
    summary: 'Department of Commerce figures showed core retail sales rose 0.7% month-over-month, beating Wall Street consensus forecasts and highlighting household spending durability.',
    source: 'Reuters',
    url: 'https://www.reuters.com',
    image: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=800&auto=format&fit=crop&q=60',
    datetime: Math.floor(Date.now() / 1000) - 3600 * 9,
    tags: ['#MacroEconomy', '#MarketTrends'],
    keyTakeaways: [
      'Core retail sales jumped 0.7%, well ahead of median economist projections of 0.3%.',
      'Discretionary spending, dining, and online commerce drove the majority of the monthly expansion.',
      'Strong retail numbers reduce near-term recession odds while giving central banks flexibility.'
    ],
    content: `Consumer spending delivered another upside surprise in the latest Commerce Department report, demonstrating persistent resilience across broad economic segments despite elevated benchmark interest rates.

Purchases increased across nine of thirteen retail categories, led by non-store retailers, dining establishments, and sporting goods. Economists note that solid wage growth and high employment levels continue to support purchasing power.

Equity traders responded by bidding up retail and consumer discretionary shares, with sector ETFs advancing over 1.4% during trading.`
  },
  {
    id: 'news-105',
    headline: 'Semiconductor Leaders Rally on Sustained Cloud Infrastructure Spending',
    summary: 'Global chipmakers experienced strong upside following upward capital expenditure revisions by top hyperscalers and data center operators.',
    source: 'Bloomberg',
    url: 'https://www.bloomberg.com',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60',
    datetime: Math.floor(Date.now() / 1000) - 3600 * 12,
    tags: ['#Technology', '#Markets', '#MarketTrends'],
    keyTakeaways: [
      'Hyperscaler capex projections for infrastructure hardware expanded by an additional $14 billion.',
      'Leading fabrication facilities reported order backlog visibility extending into next fiscal year.',
      'Philadelphia Semiconductor Index (SOX) climbed 2.3% on heavy volume.'
    ],
    content: `The semiconductor sector led broader markets higher as major cloud computing providers announced aggressive capital investment roadmaps for next-generation hardware and network switches.

Foundry utilization rates have tightened above 92%, signaling robust hardware delivery schedules and pricing power for component suppliers.

Analysts at major investment banks reaffirmed overweight ratings across top tier equipment and foundry manufacturers, noting multi-year visibility in order books.`
  },
  {
    id: 'news-106',
    headline: 'Crude Oil Prices Ease Following Upward Global Production Revisions',
    summary: 'West Texas Intermediate fell below $78 a barrel as energy watchdog groups forecast expanded non-OPEC output and stable international inventories.',
    source: 'Wall Street Journal',
    url: 'https://www.wsj.com',
    image: 'https://images.unsplash.com/photo-1518600506278-4e8ef466b810?w=800&auto=format&fit=crop&q=60',
    datetime: Math.floor(Date.now() / 1000) - 3600 * 15,
    tags: ['#Energy', '#MacroEconomy', '#Inflation'],
    keyTakeaways: [
      'WTI crude dropped 1.8% to settle at $77.40 per barrel on expanding North American output.',
      'Lower energy input costs are expected to ease headline CPI pressures in upcoming prints.',
      'Transportation and airline equities posted solid gains following fuel cost relief.'
    ],
    content: `Crude futures slid to weekly lows following data from the International Energy Agency projecting steady non-OPEC crude supplies throughout the coming quarters.

Increased drilling efficiency in the Permian basin alongside expanded Atlantic basin exports has kept domestic inventories well supplied against seasonal demands.

The retreat in fuel prices represents a welcome tailwind for central bankers combating inflation, helping temper transportation and manufacturing overhead across industries.`
  },
  {
    id: 'news-107',
    headline: 'European Central Bank Holds Rates Steady While Monitoring Services Inflation',
    summary: 'The ECB maintained its benchmark deposit facility rate at current levels, noting steady progress toward headline price targets but lingering pressures in wage negotiations.',
    source: 'Financial Times',
    url: 'https://www.ft.com',
    image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&auto=format&fit=crop&q=60',
    datetime: Math.floor(Date.now() / 1000) - 3600 * 18,
    tags: ['#FederalReserve', '#Inflation', '#MacroEconomy'],
    keyTakeaways: [
      'The ECB kept key deposit rates unchanged in line with consensus expectations.',
      'President Christine Lagarde noted that inflation has moderated significantly from prior peaks.',
      'Eurozone sovereign bond yields traded flat with minimal volatility following the policy release.'
    ],
    content: `European Central Bank officials opted to leave benchmark policy rates unchanged today, emphasizing patience as earlier rate adjustments continue to permeate commercial banking credit channels.

While core goods inflation has subsided noticeably, monetary policy committee members cited services sector inflation and collective wage agreements as indicators requiring continued vigilance.

The euro remained stable against the U.S. dollar, hovering around 1.0850 as investors recalibrated expectations for synchronized central bank policy adjustments later in the year.`
  },
  {
    id: 'news-108',
    headline: 'Financial Sector Earnings Beat Estimates on Resilient Net Interest Margins',
    summary: 'Major diversified lenders reported higher-than-forecast quarterly earnings, bolstered by resilient credit quality and active advisory underwriting.',
    source: 'CNBC',
    url: 'https://www.cnbc.com',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=60',
    datetime: Math.floor(Date.now() / 1000) - 3600 * 22,
    tags: ['#Earnings', '#Markets', '#MarketTrends'],
    keyTakeaways: [
      'Top tier commercial banks reported average return on equity (ROE) exceeding 13.5%.',
      'Net interest margins remained steady despite shifting depositor yield expectations.',
      'Debt capital markets activity and M&A underwriting fees showed significant rebound.'
    ],
    content: `Large commercial banking institutions kicked off the earnings season with stronger-than-expected net interest income and healthy balance sheet performance.

Executives reported that credit loss provisions remained contained well within historical norms, reflecting strong consumer debt servicing capacity and low unemployment metrics.

The financial sector index closed up 1.6%, helping support broader benchmark indices throughout the trading day.`
  },
  {
    id: 'news-109',
    headline: 'Ten-Year Treasury Auction Draws Resilient Demand From Institutional Buyers',
    summary: 'The U.S. Treasury completed its latest debt auction with strong bid-to-cover ratios, reflecting healthy international appetite for long-duration sovereign paper.',
    source: 'Reuters',
    url: 'https://www.reuters.com',
    image: 'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?w=800&auto=format&fit=crop&q=60',
    datetime: Math.floor(Date.now() / 1000) - 3600 * 26,
    tags: ['#FederalReserve', '#MarketTrends', '#Markets'],
    keyTakeaways: [
      'Auction bid-to-cover ratio reached 2.58x, well above recent historical averages.',
      'Indirect bidders, including foreign central banks, took down 68% of the total allocation.',
      'Yields dipped 4 basis points post-auction as primary dealers retained smaller inventory.'
    ],
    content: `The Department of the Treasury successfully placed its benchmark 10-year note offering today, meeting robust domestic and international demand.

The offering cleared with a high yield of 4.14%, stopping through primary dealer expectations and signaling deep liquidity in government debt markets.

Fixed income managers noted that high absolute yield levels continue to attract institutional pension and insurance capital looking to lock in attractive real returns.`
  },
  {
    id: 'news-110',
    headline: 'Housing Starts Rebound as Mortgage Rates Retreat to Multi-Month Lows',
    summary: 'Residential construction jumped 4.2% as homebuilders benefited from easing financing rates and persistent demand for single-family inventory.',
    source: 'Associated Press',
    url: 'https://apnews.com',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=60',
    datetime: Math.floor(Date.now() / 1000) - 3600 * 30,
    tags: ['#MacroEconomy', '#Inflation', '#MarketTrends'],
    keyTakeaways: [
      'Privately owned housing starts rose to an annualized rate of 1.42 million units.',
      'Building permits for single-family residences expanded 3.1%, indicating pipeline strength.',
      'Homebuilder confidence indices advanced for the third consecutive monthly reading.'
    ],
    content: `U.S. homebuilders broke ground on more homes than anticipated last month as the average 30-year fixed mortgage rate edged down from recent peaks.

Homebuilders have continued to capitalize on historically low existing home supply by offering targeted rate buydowns and streamlined floorplans to prospective buyers.

The data suggests the residential real estate sector is finding solid footing following the adjustment period precipitated by rapid central bank rate increases.`
  },
  {
    id: 'news-111',
    headline: 'Corporate Credit Spreads Tighten as Balance Sheet Health Remains Solid',
    summary: 'Investment-grade and high-yield credit spreads narrowed to the tightest levels of the year as investors rewarded strong liquidity cushions across blue-chip issuers.',
    source: 'Bloomberg',
    url: 'https://www.bloomberg.com',
    image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=60',
    datetime: Math.floor(Date.now() / 1000) - 3600 * 34,
    tags: ['#Markets', '#MarketTrends', '#Earnings'],
    keyTakeaways: [
      'Investment-grade OAS (option-adjusted spread) tightened 6 basis points to 92 bps.',
      'Corporate refinancing activity was met with heavy oversubscription from global funds.',
      'Default rates among non-financial corporate issuers remain below 1.5%.'
    ],
    content: `Credit spreads on U.S. corporate debt tightened toward historical lows this week, underscoring strong confidence in corporate balance sheets and operating cash flows.

Syndicated debt offerings from industrial, healthcare, and technology companies saw significant investor demand, enabling issuers to refinance near-term maturities on competitive terms.

Credit analysts noted that conservative capital management over recent years has left corporate America in an advantageous position to service debt obligations.`
  },
  {
    id: 'news-112',
    headline: 'Renewable Energy Capital Spending Accelerates Amid Grid Modernization',
    summary: 'Utilities and private infrastructure funds committed record capital toward grid reliability, battery storage, and transmission line expansions.',
    source: 'Financial Times',
    url: 'https://www.ft.com',
    image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&auto=format&fit=crop&q=60',
    datetime: Math.floor(Date.now() / 1000) - 3600 * 38,
    tags: ['#Energy', '#MarketTrends', '#MacroEconomy'],
    keyTakeaways: [
      'Global clean energy and grid infrastructure investments exceeded $400 billion year-to-date.',
      'Battery energy storage system (BESS) capacity grew by 48% year-over-year in North America.',
      'Utility providers expanded multi-year capital plans to accommodate industrial electrification.'
    ],
    content: `Global investment in electric grid infrastructure and renewable generation facilities reached new quarterly milestones as utilities ramped up capacity additions.

Power demand forecasts have been revised upward across major metropolitan areas, driven by data centers, domestic manufacturing facilities, and electric vehicle adoption.

Equipment providers and specialized engineering contractors have reported record backlogs, propelling industrial sector gains on major financial exchanges.`
  }
];

/**
 * Derives macro topic tags based on headline and summary text content
 */
export function determineMacroTags(headline: string, summary: string): string[] {
  const text = `${headline} ${summary}`.toLowerCase();
  const tags: string[] = [];

  if (text.includes('fed') || text.includes('reserve') || text.includes('powell') || text.includes('rate') || text.includes('fomc') || text.includes('yield') || text.includes('treasury')) {
    tags.push('#FederalReserve');
  }
  if (text.includes('inflation') || text.includes('cpi') || text.includes('ppi') || text.includes('price') || text.includes('cost')) {
    tags.push('#Inflation');
  }
  if (text.includes('market') || text.includes('s&p') || text.includes('nasdaq') || text.includes('dow') || text.includes('stock') || text.includes('rally') || text.includes('trend')) {
    tags.push('#MarketTrends');
  }
  if (text.includes('gdp') || text.includes('economy') || text.includes('macro') || text.includes('job') || text.includes('employment') || text.includes('retail') || text.includes('trade')) {
    tags.push('#MacroEconomy');
  }
  if (text.includes('tech') || text.includes('chip') || text.includes('semiconductor') || text.includes('cloud') || text.includes('ai') || text.includes('software')) {
    tags.push('#Technology');
  }
  if (text.includes('earning') || text.includes('profit') || text.includes('revenue') || text.includes('quarterly') || text.includes('margin')) {
    tags.push('#Earnings');
  }
  if (text.includes('oil') || text.includes('energy') || text.includes('crude') || text.includes('gas') || text.includes('grid')) {
    tags.push('#Energy');
  }

  if (tags.length === 0) {
    tags.push('#Markets');
  }

  return tags;
}

/**
 * Action to fetch general market news via server proxy and cache.
 */
export async function getDailyThreeNews(): Promise<NewsArticle[]> {
  try {
    if (typeof window !== 'undefined') {
      const res = await fetch('/api/news/market', {
        cache: 'default',
      });

      if (res.ok) {
        const data = await res.json();
        const rawData = data?.articles;

        if (Array.isArray(rawData) && rawData.length > 0) {
          const mappedArticles: NewsArticle[] = rawData
            .slice(0, 15)
            .map((article: any, index: number) => {
              const headline = article.headline || 'Market Update';
              const summary = article.summary || 'Market financial analysis and economic developments.';
              const tags = determineMacroTags(headline, summary);

              return {
                id: article.id ? `news-${article.id}` : `news-gen-${index}`,
                headline,
                summary,
                source: article.source || 'Financial News',
                url: article.url || 'https://finnhub.io',
                image: article.image && article.image.startsWith('http') ? article.image : FALLBACK_IMAGE,
                datetime: article.datetime || Math.floor(Date.now() / 1000),
                tags,
                keyTakeaways: [
                  `Market developments regarding ${headline.slice(0, 60)}.`,
                  summary,
                  'Coverage reflects latest trading session data and analyst reports.'
                ]
              };
            });

          if (mappedArticles.length >= 3) {
            return mappedArticles;
          }
        }
      }
    }
  } catch {
    // Graceful fallback to mock news
  }

  return MOCK_NEWS;
}

/**
 * Returns full news catalog sorted chronologically for the news catalog page
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
        const data = docSnap.data();
        articles.push({
          id: docSnap.id,
          ...data,
          keyTakeaways: data.keyTakeaways || data.executiveSummary
        } as NewsArticle);
      });
      if (articles.length >= 6) {
        return articles;
      }
    }
  } catch (e) {
    console.warn('[News Catalog] Firestore read fallback:', e);
  }

  // Fallback to rich mock news items (all 12 articles)
  try {
    const liveArticles = await getDailyThreeNews();
    if (liveArticles && liveArticles.length >= 9) {
      return liveArticles;
    }
    // Combine live and mock if fewer than 9
    const existingIds = new Set(liveArticles.map(a => String(a.id)));
    const combined = [...liveArticles];
    for (const mock of MOCK_NEWS) {
      if (!existingIds.has(String(mock.id))) {
        combined.push(mock);
      }
    }
    return combined;
  } catch {
    return MOCK_NEWS;
  }
}

