import { NextRequest, NextResponse } from 'next/server';
import dns from 'dns/promises';
import { getAdminDb } from '@/lib/firebase-admin';
import { determineMacroTags, MOCK_NEWS, NewsArticle } from '@/app/actions/news';

function isPrivateIp(ip: string): boolean {
  // IPv4 checks
  const parts = ip.split('.').map(Number);
  if (parts.length === 4 && parts.every(p => !isNaN(p) && p >= 0 && p <= 255)) {
    const [a, b] = parts;
    if (a === 0) return true; // 0.0.0.0/8
    if (a === 10) return true; // 10.0.0.0/8
    if (a === 127) return true; // 127.0.0.0/8
    if (a === 169 && b === 254) return true; // 169.254.0.0/16 Link-local & cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12 Private
    if (a === 192 && b === 168) return true; // 192.168.0.0/16 Private
    if (a >= 224) return true; // Multicast & reserved
  }

  // IPv6 checks
  const lower = ip.toLowerCase();
  if (
    lower === '::1' || 
    lower === '::' || 
    lower.startsWith('fe80:') || 
    lower.startsWith('fc00:') || 
    lower.startsWith('fd00:') ||
    lower.startsWith('::ffff:127.') ||
    lower.startsWith('::ffff:10.') ||
    lower.startsWith('::ffff:169.254.') ||
    lower.startsWith('::ffff:192.168.')
  ) {
    return true;
  }

  return false;
}

async function isSafePublicUrl(urlString: string): Promise<boolean> {
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();
    
    // Check known dangerous hostnames
    if (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname === 'metadata.google.internal' ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.local')
    ) {
      return false;
    }

    // Check if direct IP
    if (isPrivateIp(hostname)) {
      return false;
    }

    // Resolve DNS to verify target IP is public
    const addresses = await dns.lookup(hostname, { all: true });
    for (const record of addresses) {
      if (isPrivateIp(record.address)) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

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
        const adminDb = getAdminDb();
        if (adminDb) {
          const docSnap = await adminDb.doc(`news_articles/${String(id)}`).get();
          if (docSnap.exists) {
            return NextResponse.json({ success: true, article: { id: docSnap.id, ...docSnap.data() } });
          }
        }
      } catch (e) {
        console.warn('[Extract API] Firestore lookup error:', e);
      }
    }

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Valid URL parameter is required' }, { status: 400 });
    }

    // Validate URL against SSRF
    const isSafe = await isSafePublicUrl(url);
    if (!isSafe) {
      return NextResponse.json({ error: 'Invalid or restricted destination URL' }, { status: 400 });
    }

    // 2. Fetch raw HTML from source URL with timeout
    let rawHtml = '';
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        // Read text and cap to 2MB to prevent memory exhaustion
        const text = await res.text();
        rawHtml = text.slice(0, 2 * 1024 * 1024);
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

    let keyTakeaways: string[] | undefined = undefined;
    if (isPaywalled || parsedParagraphs.length < 2) {
      keyTakeaways = [
        `Reporting overview for ${headline}.`,
        summary,
        `Coverage reported by ${siteName} on financial markets and macroeconomic trends.`
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
      executiveSummary: keyTakeaways,
      keyTakeaways,
      content: processedContent,
      convertedAt: Date.now(),
    };

    // 7. Save to Firestore `news_articles` catalog via Admin SDK
    try {
      const adminDb = getAdminDb();
      if (adminDb) {
        await adminDb.doc(`news_articles/${articleId}`).set(processedArticle, { merge: true });
      }
    } catch (dbErr) {
      console.warn('[Extract API] Firestore save error:', dbErr);
    }

    return NextResponse.json({ success: true, article: processedArticle });
  } catch (error: any) {
    console.error('[Extract API] Fatal Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to extract article content' }, { status: 500 });
  }
}
