'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ExternalLink,
  Globe,
  Clock,
  Newspaper,
  CheckCircle2,
  BookOpen,
  ChevronRight,
  Share2
} from 'lucide-react';
import { NewsArticle, MOCK_NEWS, getMacroNewsCatalog } from '@/app/actions/news';

function formatDate(timestamp?: number): string {
  if (!timestamp) return 'Recent';
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function estimateReadingTime(text?: string): string {
  if (!text) return '2 min read';
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${Math.max(1, minutes)} min read`;
}

export default function ArticleReaderPage() {
  const params = useParams();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const routeId = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : '';
    const pathParts = typeof window !== 'undefined' ? window.location.pathname.split('/') : [];
    const fallbackId = pathParts[pathParts.length - 1] || '';
    const idFromPath = routeId || fallbackId;

    if (!idFromPath) return;

    let mounted = true;
    setLoading(true);

    // 1. Try local mock match first for instantaneous loading
    const localMatch = MOCK_NEWS.find(m => String(m.id) === String(idFromPath));
    if (localMatch) {
      setArticle(localMatch);
      setLoading(false);
    }

    // 2. Fetch full extraction from API route if available
    fetch('/api/news/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: idFromPath })
    })
      .then(res => res.json())
      .then(data => {
        if (mounted && data.article) {
          setArticle(data.article);
        } else if (!localMatch) {
          const fallback = MOCK_NEWS[0];
          setArticle(fallback);
        }
      })
      .catch(err => {
        console.error('Article reader fetch error:', err);
        if (!localMatch && mounted) {
          setArticle(MOCK_NEWS[0]);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    // 3. Fetch related catalog stories for footer
    getMacroNewsCatalog()
      .then(catalog => {
        if (mounted) {
          const others = catalog.filter(c => String(c.id) !== String(idFromPath)).slice(0, 3);
          setRelatedArticles(others);
        }
      })
      .catch(() => {});

    return () => { mounted = false; };
  }, [params]);

  const takeaways = article?.keyTakeaways || article?.executiveSummary || [];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 relative pb-16">
      {/* Ambient Glow */}
      <div className="absolute top-[-5%] right-[10%] w-[350px] h-[350px] rounded-full bg-blue-500/5 blur-[110px] pointer-events-none" />
      <div className="absolute top-[30%] left-[5%] w-[400px] h-[400px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      {/* Top Header / Breadcrumb Bar */}
      <nav className="flex items-center justify-between gap-3 text-xs font-bold text-slate-400">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />
          <Link href="/dashboard/news" className="hover:text-white transition-colors">News</Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />
          <Link href="/dashboard/news/catalog" className="hover:text-white transition-colors">Catalog</Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />
          <span className="text-blue-400 truncate max-w-[200px] sm:max-w-xs font-extrabold">
            {article?.headline || 'Story'}
          </span>
        </div>

        <Link
          href="/dashboard/news/catalog"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all text-xs font-bold shrink-0"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Catalog
        </Link>
      </nav>

      {/* Article Content Container */}
      {loading ? (
        <div className="space-y-6 animate-pulse">
          <div className="h-10 bg-slate-800/80 rounded-2xl w-3/4" />
          <div className="h-72 bg-slate-800/80 rounded-3xl w-full" />
          <div className="h-40 bg-slate-800/80 rounded-2xl w-full" />
        </div>
      ) : !article ? (
        <div className="text-center py-20 bg-[#1a2133]/60 rounded-3xl border border-dashed border-slate-700/60 space-y-4">
          <Newspaper className="h-12 w-12 text-slate-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">Story Not Found</h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            The requested article could not be located in the catalog.
          </p>
          <Link
            href="/dashboard/news/catalog"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md mt-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Return to Catalog
          </Link>
        </div>
      ) : (
        <motion.article
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-8"
        >
          {/* Tags & Metadata Header */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {article.tags?.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-xl text-xs font-black bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider"
                >
                  {tag.replace('#', '')}
                </span>
              ))}
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              {article.headline}
            </h1>

            {/* Author / Source / Time Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#161c2e]/90 border border-slate-700/60 text-xs font-semibold text-slate-400">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1.5 text-white font-bold uppercase tracking-wider">
                  <Globe className="h-4 w-4 text-blue-400" /> {article.source}
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="h-4 w-4 text-slate-500" /> {formatDate(article.datetime)}
                </span>
                <span className="text-slate-500 hidden sm:inline">•</span>
                <span className="text-slate-400 hidden sm:inline">
                  {estimateReadingTime(article.content || article.summary)}
                </span>
              </div>

              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 transition-colors ml-auto sm:ml-0"
              >
                Original Source <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Lead Hero Image */}
          {article.image && (
            <div className="rounded-3xl overflow-hidden border border-slate-700/60 shadow-2xl max-h-[480px] relative bg-slate-900">
              <img
                src={article.image}
                alt={article.headline}
                className="w-full h-full object-cover max-h-[480px]"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60';
                }}
              />
            </div>
          )}

          {/* Key Takeaways Card */}
          {takeaways.length > 0 && (
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-950/40 via-[#161c2e] to-[#0f1422] border border-blue-500/30 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-xs font-black text-blue-400 uppercase tracking-widest">
                <BookOpen className="h-4 w-4 text-blue-400" /> Key Takeaways
              </div>
              <ul className="space-y-3">
                {takeaways.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                    <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Clean Editorial Body Content */}
          <div className="p-6 sm:p-10 rounded-3xl bg-[#161c2e]/80 border border-slate-700/60 shadow-2xl space-y-6 text-sm sm:text-base md:text-lg text-slate-200 leading-relaxed font-normal">
            {article.content ? (
              article.content.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="leading-relaxed">
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="leading-relaxed">{article.summary}</p>
            )}
          </div>

          {/* Publisher Source Attribution Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#131929]/90 border border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div>
              <h4 className="text-white font-extrabold text-base sm:text-lg">Read on {article.source}</h4>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Access the original publication and complete editorial reporting directly on the publisher&apos;s website.
              </p>
            </div>

            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.35)] flex items-center justify-center gap-2 shrink-0 active:scale-95"
            >
              Open Original Publication <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          {/* Related Stories in a 3-column row */}
          {relatedArticles.length > 0 && (
            <div className="pt-8 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">More from News Catalog</h3>
                <Link
                  href="/dashboard/news/catalog"
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  View All <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full items-stretch">
                {relatedArticles.map((item) => (
                  <div
                    key={item.id}
                    className="group rounded-2xl bg-[#161c2e]/90 border border-slate-700/60 overflow-hidden hover:border-blue-500/40 transition-all flex flex-col justify-between"
                  >
                    <div className="h-36 w-full relative overflow-hidden bg-slate-900">
                      <img
                        src={item.image}
                        alt={item.headline}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60';
                        }}
                      />
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[9px] font-extrabold bg-slate-950/80 backdrop-blur-md text-slate-300 border border-white/10 uppercase">
                        {item.source}
                      </div>
                    </div>

                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <h4 className="text-xs sm:text-sm font-black text-white leading-snug group-hover:text-blue-400 transition-colors line-clamp-2">
                        {item.headline}
                      </h4>

                      <Link
                        href={`/dashboard/news/${item.id}`}
                        className="w-full mt-3 py-2 rounded-xl bg-white/5 hover:bg-blue-600 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-white/10 hover:border-transparent"
                      >
                        Read Story <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.article>
      )}
    </div>
  );
}
