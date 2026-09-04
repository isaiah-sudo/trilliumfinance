import { NextRequest, NextResponse } from 'next/server';

interface MarketNewsItem {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  image: string;
  datetime: number;
}

let cachedNews: { data: MarketNewsItem[]; timestamp: number } | null = null;
const NEWS_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const now = Date.now();
    if (cachedNews && (now - cachedNews.timestamp < NEWS_CACHE_TTL_MS)) {
      return NextResponse.json(
        { articles: cachedNews.data },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
          }
        }
      );
    }

    const token = process.env.FINNHUB_API_KEY || process.env.NEXT_PUBLIC_FINNHUB_API_KEY || '';
    if (token) {
      try {
        const res = await fetch(`https://finnhub.io/api/v1/news?category=general&token=${token}`, {
          signal: AbortSignal.timeout(4000)
        });
        if (res.ok) {
          const rawData = await res.json();
          if (Array.isArray(rawData) && rawData.length > 0) {
            const articles: MarketNewsItem[] = rawData.slice(0, 15).map((article: any, index: number) => ({
              id: article.id ? `news-${article.id}` : `news-gen-${index}`,
              headline: article.headline || 'Macro Market Update',
              summary: article.summary || 'Market financial analysis and macroeconomic overview.',
              source: article.source || 'Financial News',
              url: article.url || 'https://finnhub.io',
              image: article.image && article.image.startsWith('http')
                ? article.image
                : 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60',
              datetime: article.datetime || Math.floor(Date.now() / 1000)
            }));

            cachedNews = { data: articles, timestamp: now };
            return NextResponse.json(
              { articles },
              {
                headers: {
                  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
                }
              }
            );
          }
        }
      } catch {
        // Fallback
      }
    }

    // Return empty array if not fetched; client will use MOCK_NEWS fallback
    return NextResponse.json({ articles: [] }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ articles: [] }, { status: 200 });
  }
}
