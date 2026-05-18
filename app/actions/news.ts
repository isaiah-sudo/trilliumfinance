'use server';

export interface NewsArticle {
  id: number;
  headline: string;
  summary: string;
  source: string;
  url: string;
  image: string;
  datetime: number;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60';

// Premium mock articles in case of API failure, rate limits, or missing keys
const MOCK_NEWS: NewsArticle[] = [
  {
    id: 101,
    headline: 'Trillium Finance Rolls Out New Curator-Style Daily Briefing Features',
    summary: 'Trillium Finance has officially launched its curated Daily Briefing feature, delivering highly focused market intelligence to retail paper traders worldwide with a minimalist exactly-three-article design.',
    source: 'Trillium Editorial',
    url: 'https://trillium.finance',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60',
    datetime: Math.floor(Date.now() / 1000) - 3600 * 2, // 2 hours ago
  },
  {
    id: 102,
    headline: 'Global Tech Stocks Rebound as Inflation Fears and Treasury Yields Ease',
    summary: 'Major indices marked a significant recovery today as treasury yields eased, sparking a massive rally across tech heavyweights and high-growth sectors, leading to gains across the S&P 500.',
    source: 'Bloomberg Finance',
    url: 'https://bloomberg.com',
    image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=60',
    datetime: Math.floor(Date.now() / 1000) - 3600 * 5, // 5 hours ago
  },
  {
    id: 103,
    headline: 'Federal Reserve Hints at Potential Rate Pause in Upcoming Policy Session',
    summary: 'Market strategists are pricing in a high probability of a pause in interest rate hikes, following the release of recent consumer spending reports and favorable macro data points.',
    source: 'Reuters Markets',
    url: 'https://reuters.com',
    image: 'https://images.unsplash.com/photo-1624996379697-f01d168b1a52?w=800&auto=format&fit=crop&q=60',
    datetime: Math.floor(Date.now() / 1000) - 3600 * 8, // 8 hours ago
  },
];

/**
 * Server Action to fetch general market news from Finnhub, cached for 1 hour.
 * Always returns exactly three high-quality news articles.
 */
export async function getDailyThreeNews(): Promise<NewsArticle[]> {
  const token = process.env.FINNHUB_API_KEY;

  if (!token) {
    console.warn('[News Action] FINNHUB_API_KEY is not set. Falling back to premium mock news.');
    return MOCK_NEWS;
  }

  try {
    const res = await fetch(`https://finnhub.io/api/v1/news?category=general&token=${token}`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.warn(`[News Action] Finnhub API returned status ${res.status}. Falling back to mock news.`);
      return MOCK_NEWS;
    }

    const rawData = await res.json();

    if (!Array.isArray(rawData) || rawData.length === 0) {
      console.warn('[News Action] Empty or invalid response from Finnhub. Falling back to mock news.');
      return MOCK_NEWS;
    }

    const now = Math.floor(Date.now() / 1000);
    const oneDayAgo = now - 24 * 60 * 60; // 24 hours ago

    // Safe filter for articles published in the last 24 hours
    let filteredNews = rawData.filter((article: any) => article && typeof article.datetime === 'number' && article.datetime >= oneDayAgo);

    // Fallback: If less than 3 articles are found in the last 24 hours, fall back to the raw list to fill up spaces
    if (filteredNews.length < 3) {
      const remainingNeeded = 3 - filteredNews.length;
      const extraArticles = rawData.filter(
        (article: any) => article && !filteredNews.some((f) => f.id === article.id)
      );
      filteredNews = [...filteredNews, ...extraArticles.slice(0, remainingNeeded)];
    }

    // Map and sanitize to ensure strict type compliance and fallback strings
    const mappedArticles: NewsArticle[] = filteredNews
      .slice(0, 3)
      .map((article: any) => ({
        id: typeof article.id === 'number' ? article.id : Math.floor(Math.random() * 1000000),
        headline: typeof article.headline === 'string' && article.headline.trim() !== '' 
          ? article.headline 
          : 'Market Update',
        summary: typeof article.summary === 'string' && article.summary.trim() !== '' 
          ? article.summary 
          : 'No summary available for this briefing. Follow the link to read the full report.',
        source: typeof article.source === 'string' && article.source.trim() !== '' 
          ? article.source 
          : 'Financial News',
        url: typeof article.url === 'string' && article.url.trim() !== '' 
          ? article.url 
          : 'https://finnhub.io',
        image: typeof article.image === 'string' && article.image.startsWith('http') 
          ? article.image 
          : FALLBACK_IMAGE,
        datetime: typeof article.datetime === 'number' ? article.datetime : Math.floor(Date.now() / 1000),
      }));

    // If mapping resulted in less than 3 articles, fill up with mocks
    if (mappedArticles.length < 3) {
      const fillCount = 3 - mappedArticles.length;
      mappedArticles.push(...MOCK_NEWS.slice(0, fillCount));
    }

    return mappedArticles;
  } catch (error) {
    console.error('[News Action] Error fetching news:', error);
    return MOCK_NEWS;
  }
}
