'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Globe, Clock, Tag, ShieldCheck, Newspaper, Sparkles, CheckCircle2, Share2, BookOpen } from 'lucide-react';
import { NewsArticle, MOCK_NEWS } from '@/app/actions/news';

export default function ArticleReaderPage() {
  const params = useParams();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [articleId, setArticleId] = useState<string>('');

  useEffect(() => {
    const routeId = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : '';
    const pathParts = typeof window !== 'undefined' ? window.location.pathname.split('/') : [];
    const fallbackId = pathParts[pathParts.length - 1] || '';
    const idFromPath = routeId || fallbackId;

    if (!idFromPath) return;
    setArticleId(idFromPath);

    let mounted = true;
    setLoading(true);

    // Call extraction API route
    fetch('/api/news/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: idFromPath })
    })
      .then(res => res.json())
      .then(data => {
        if (mounted && data.article) {
          setArticle(data.article);
        } else {
          // Fallback to mock item if API response is empty
          const mockMatch = MOCK_NEWS.find(m => String(m.id) === String(idFromPath)) || MOCK_NEWS[0];
          if (mounted) setArticle(mockMatch);
        }
      })
      .catch(err => {
        console.error('Article reader fetch error:', err);
        const mockMatch = MOCK_NEWS.find(m => String(m.id) === String(idFromPath)) || MOCK_NEWS[0];
        if (mounted) setArticle(mockMatch);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Recent';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#070a14] text-slate-100 font-sans selection:bg-blue-500/30 selection:text-white pb-20">
      {/* Header Navigation */}
      <header className="border-b border-slate-800/80 bg-[#0d1222]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link
            href="/news-catalog"
            className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-2 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Catalog
          </Link>

          <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping" />
            <span className="font-bold text-slate-300">news.trilliumfinance.net</span>
          </div>
        </div>
      </header>

      {/* Main Article Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-10">
        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-10 bg-slate-800 rounded-xl w-3/4" />
            <div className="h-64 bg-slate-800 rounded-3xl w-full" />
            <div className="h-32 bg-slate-800 rounded-2xl w-full" />
          </div>
        ) : !article ? (
          <div className="text-center py-20 bg-[#121726]/40 rounded-3xl border border-dashed border-slate-800">
            <Newspaper className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white">Article Not Found</h2>
            <Link href="/news-catalog" className="inline-block mt-4 text-xs font-bold text-blue-400 hover:underline">
              Return to Catalog
            </Link>
          </div>
        ) : (
          <motion.article
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Article Topic Tags */}
            <div className="flex flex-wrap gap-2">
              {article.tags?.map(tag => (
                <span key={tag} className="px-3 py-1 rounded-lg text-xs font-black bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                  {tag}
                </span>
              ))}
              {article.isRestricted && (
                <span className="px-3 py-1 rounded-lg text-xs font-black bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" /> Executive Briefing
                </span>
              )}
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              {article.headline}
            </h1>

            {/* Metadata Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#121726] border border-slate-800/80 text-xs font-semibold text-slate-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-white font-bold uppercase tracking-wider">
                  <Globe className="h-4 w-4 text-blue-400" /> {article.source}
                </span>
                <span className="flex items-center gap-1.5 font-mono text-slate-400">
                  <Clock className="h-4 w-4 text-slate-500" /> {formatDate(article.datetime)}
                </span>
              </div>

              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 transition-colors"
              >
                Original Link <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Lead Image Header */}
            {article.image && (
              <div className="rounded-3xl overflow-hidden border border-slate-800 shadow-2xl max-h-[450px] relative bg-slate-900">
                <img
                  src={article.image}
                  alt={article.headline}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60';
                  }}
                />
              </div>
            )}

            {/* Executive Summary Card (if paywalled or structured summary exists) */}
            {article.executiveSummary && article.executiveSummary.length > 0 && (
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-950/40 via-[#121726] to-[#0d1222] border border-blue-500/30 shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-xs font-black text-blue-400 uppercase tracking-widest">
                  <Sparkles className="h-4 w-4" /> Executive Summary & Key Takeaways
                </div>
                <ul className="space-y-3">
                  {article.executiveSummary.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-200 font-medium leading-relaxed">
                      <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Main Clean Body Content */}
            <div className="p-8 sm:p-10 rounded-3xl bg-[#121726]/80 border border-slate-800/80 shadow-2xl space-y-6 text-base sm:text-lg text-slate-200 leading-relaxed font-normal">
              {article.content ? (
                article.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="leading-relaxed">
                    {paragraph}
                  </p>
                ))
              ) : (
                <p>{article.summary}</p>
              )}
            </div>

            {/* Bottom Action Footer - "Read Raw Article" Button */}
            <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-6 bg-[#0d1222]/80 p-8 rounded-3xl border border-slate-800">
              <div>
                <h4 className="text-white font-extrabold text-lg">Want to view the raw source publication?</h4>
                <p className="text-slate-400 text-xs font-medium mt-1">Open the raw article on {article.source} in a new window.</p>
              </div>

              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-black transition-all shadow-[0_0_25px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 active:scale-95 shrink-0 uppercase tracking-wider"
              >
                <BookOpen className="h-4 w-4" /> Read Raw Article <ExternalLink className="h-4 w-4 ml-1" />
              </a>
            </div>
          </motion.article>
        )}
      </main>
    </div>
  );
}
