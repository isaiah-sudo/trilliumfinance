import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { determineMacroTags, MOCK_NEWS, NewsArticle } from '@/app/actions/news';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { url, id } = body;

    // 1. If an ID is passed, check mock list first or Firestore
    if (id) {
      const mockItem = MOCK_NEWS.find(n => String(n.id) === String(id));
      if (mockItem) {
        return NextResponse.json({ success: true, article: mockItem });
      }

      try {
        const docRef = doc(db, 'news_articles', String(id));
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return NextResponse.json({ success: true, article: { id: docSnap.id, ...docSnap.data() } });
        }
      } catch (e) {
        console.warn('[Extract API] Firestore lookup error:', e);
      }
    }

    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      return NextResponse.json({ error: 'Valid URL parameter is required' }, { status: 400 });
    }

    // 2. Fetch raw HTML from source URL with realistic browser headers
    let rawHtml = '';
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        cache: 'no-store',
      });

      if (res.ok) {
        rawHtml = await res.text();
      }
    } catch (err: any) {
      console.warn(`[Extract API] Fetch failed for ${url}:`, err.message);
    }

    // 3. Extract OpenGraph & HTML Metadata
    const getMetaContent = (prop: string) => {
      const match = rawHtml.match(new RegExp(`<meta[^>]*property=["']${prop}["'][^>]*content=["']([^"']+)["']`, 'i')) ||
                    rawHtml.match(new RegExp(`<meta[^>]*name=["']${prop}["'][^>]*content=["']([^"']+)["']`, 'i'));
      return match ? match[1] : '';
    };

    const titleMatch = rawHtml.match(/<title[^>]*>([^<]+)<\/title>/i);
    const headline = getMetaContent('og:title') || getMetaContent('twitter:title') || (titleMatch ? titleMatch[1].trim() : 'Market Briefing');
    const summary = getMetaContent('og:description') || getMetaContent('description') || getMetaContent('twitter:description') || 'Macro-economic financial intelligence report.';
    const image = getMetaContent('og:image') || getMetaContent('twitter:image') || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60';
    const siteName = getMetaContent('og:site_name') || new URL(url).hostname.replace(/^www\./, '');

    // 4. Detect Paywalls / Restricted Subscribe Walls (CNBC Club, WSJ, Bloomberg, etc.)
    const isPaywalled = /cnbc club|subscribe to read|become a member|paywall|join the club|sign in to read|premium article|subscriber-only/i.test(rawHtml) ||
                        url.includes('cnbc.com/club') || url.includes('wsj.com') || url.includes('bloomberg.com');

    // 5. Cleanse Body Paragraphs
    let parsedParagraphs: string[] = [];
    if (rawHtml) {
      // Remove scripts, styles, head, headers, footers, navs, overlays
      const cleanBody = rawHtml
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '')
        .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '')
        .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
        .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '');

      // Extract all <p> text content
      const pMatches = cleanBody.match(/<p[^>]*>(.*?)<\/p>/gi);
      if (pMatches) {
        parsedParagraphs = pMatches
          .map(p => p.replace(/<[^>]+>/g, '').trim())
          .filter(text => text.length > 50 && !/sign in|copyright|cookies|all rights reserved|privacy policy|terms of service/i.test(text));
      }
    }

    // 6. Construct Cleaned Article Object
    const articleId = `art-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const tags = determineMacroTags(headline, summary);

    let executiveSummary: string[] | undefined = undefined;
    if (isPaywalled || parsedParagraphs.length < 2) {
      executiveSummary = [
        `Executive briefing on ${headline}.`,
        summary,
        `Key Macro Drivers: Extracted from ${siteName} covering monetary policy, market indices, and treasury bond dynamics.`
      ];
    }

    const processedContent = parsedParagraphs.slice(0, 8).join('\n\n') || summary;

    const processedArticle: NewsArticle = {
      id: articleId,
      headline,
      summary,
      source: siteName.toUpperCase(),
      url,
      image,
      datetime: Math.floor(Date.now() / 1000),
      tags,
      isRestricted: isPaywalled,
      executiveSummary,
      content: processedContent,
      convertedAt: Date.now(),
    };

    // 7. Save to Firestore `news_articles` catalog for subdomain index
    try {
      await setDoc(doc(db, 'news_articles', articleId), processedArticle, { merge: true });
    } catch (dbErr) {
      console.warn('[Extract API] Firestore save error:', dbErr);
    }

    return NextResponse.json({ success: true, article: processedArticle });
  } catch (error: any) {
    console.error('[Extract API] Fatal Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to extract article content' }, { status: 500 });
  }
}
