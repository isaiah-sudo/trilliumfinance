'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Globe, Tag, Clock, ExternalLink, ArrowRight, ShieldCheck, Newspaper, Sparkles, Filter, ChevronRight } from 'lucide-react';
import { getMacroNewsCatalog, NewsArticle } from '@/app/actions/news';

const MACRO_TAGS = ['All', '#FederalReserve', '#Inflation', '#MarketTrends', '#MacroEconomy', '#Markets'];

export default function NewsCatalogPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let mounted = true;
    getMacroNewsCatalog()
      .then(data => {
        if (mounted) {
          setArticles(data);
        }
      })
      .catch(err => console.error('Catalog fetch error:', err))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  const filteredArticles = articles.filter(art => {
    const matchesTag = selectedTag === 'All' || (art.tags && art.tags.includes(selectedTag));
    const matchesSearch = art.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          art.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'Recent';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#070a14] text-slate-100 font-sans selection:bg-blue-500/30 selection:text-white">
      {/* Subdomain Header Banner */}
      <header className="border-b border-slate-800/80 bg-[#0d1222]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="w-full max-w-[2560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-400 p-0.5 shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-[#0d1222] rounded-[14px] flex items-center justify-center">
                <Newspaper className="h-5 w-5 text-blue-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-white font-mono">news.trilliumfinance.net</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-500/10 text-teal-400 border border-teal-500/20 uppercase tracking-wider">
                  Live Engine
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-400">Macroeconomic Intelligence & Reader Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="https://trilliumfinance.net/dashboard"
              className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center gap-1.5 shadow-sm"
            >
              Main Dashboard <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Catalog Viewport */}
      <main className="w-full max-w-[2560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 py-10 space-y-10">
        {/* Hero Section */}
        <div className="relative rounded-3xl bg-gradient-to-br from-[#12182b] via-[#0d1222] to-[#070a14] border border-slate-800/80 p-8 sm:p-12 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/5 blur-[120px] pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5" /> Article Processing Engine
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Macro Market Intelligence & Executive Briefings
            </h2>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-medium">
              Curated coverage of central bank monetary policy, inflation metrics, treasury bond yields, and global index moves cleansed into distraction-free executive reader views.
            </p>

            {/* Search Input Bar */}
            <div className="pt-4 relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 h-5 w-5" />
              <input
                type="text"
                placeholder="Search catalog by topic, headline, or source..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#161c2e]/90 border border-slate-700/60 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-500 font-semibold focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-xl"
              />
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest mr-2">
            <Filter className="h-3.5 w-3.5" /> Filter Topics:
          </div>
          {MACRO_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all duration-300 ${
                selectedTag === tag
                  ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] translate-y-[-1px]'
                  : 'bg-[#141926] text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Article Catalog Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-96 rounded-3xl bg-slate-900/60 border border-slate-800 animate-pulse p-6 space-y-4" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredArticles.map((article, idx) => (
                <motion.div
                  key={article.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: (idx % 6) * 0.05 }}
                  className="group rounded-3xl bg-[#121726]/90 border border-slate-800/80 overflow-hidden shadow-xl hover:border-blue-500/40 transition-all hover:shadow-2xl hover:shadow-blue-500/5 flex flex-col justify-between"
                >
                  <div>
                    {/* Cover Thumbnail */}
                    <div className="h-48 w-full relative overflow-hidden bg-slate-800">
                      <img
                        src={article.image}
                        alt={article.headline}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60';
                        }}
                      />
                      <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
                        {article.tags?.slice(0, 2).map(tag => (
                          <span key={tag} className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-slate-950/80 backdrop-blur-md text-blue-400 border border-white/10 uppercase tracking-widest">
                            {tag}
                          </span>
                        ))}
                      </div>
                      {article.isRestricted && (
                        <div className="absolute top-4 right-4 px-2.5 py-1 rounded-lg text-[10px] font-black bg-amber-500/90 text-slate-950 uppercase tracking-widest shadow-md">
                          Executive Brief
                        </div>
                      )}
                    </div>

                    {/* Content Body */}
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                        <span className="flex items-center gap-1 uppercase tracking-wider text-slate-300">
                          <Globe className="h-3 w-3 text-blue-400" /> {article.source}
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="h-3 w-3 text-slate-500" /> {formatDate(article.datetime)}
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-white tracking-tight leading-snug group-hover:text-blue-400 transition-colors line-clamp-2">
                        {article.headline}
                      </h3>

                      <p className="text-slate-300 text-xs font-medium leading-relaxed line-clamp-3">
                        {article.summary}
                      </p>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="p-6 pt-0">
                    <Link
                      href={`/news-catalog/${article.id}`}
                      className="w-full bg-slate-800/80 hover:bg-blue-600 text-white text-xs font-bold py-3.5 rounded-2xl transition-all border border-slate-700/80 flex items-center justify-center gap-2 group-hover:border-blue-500/50 shadow-md"
                    >
                      Read Clean Article <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {!loading && filteredArticles.length === 0 && (
          <div className="text-center py-20 bg-[#121726]/40 rounded-3xl border border-dashed border-slate-800">
            <Newspaper className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-400">No articles matched your criteria</h3>
            <p className="text-slate-500 text-sm mt-1">Try clearing your topic tags or search query.</p>
          </div>
        )}
      </main>
    </div>
  );
}
