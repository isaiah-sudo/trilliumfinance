'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Globe,
  Clock,
  ExternalLink,
  ArrowLeft,
  Newspaper,
  Filter,
  BookOpen,
  ChevronRight,
  TrendingUp,
  X,
  RotateCcw
} from 'lucide-react';
import { getMacroNewsCatalog, NewsArticle } from '@/app/actions/news';
import NewsTagGroup from '@/components/dashboard/NewsTagGroup';

const CATEGORY_TAGS = [
  'All',
  '#FederalReserve',
  '#Inflation',
  '#MarketTrends',
  '#MacroEconomy',
  '#Technology',
  '#Earnings',
  '#Energy',
  '#Markets'
];

function formatTimeAgo(unixTimestamp: number): string {
  if (!unixTimestamp) return 'Recent';
  const seconds = Math.floor(Date.now() / 1000 - unixTimestamp);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

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
      .catch(err => console.error('Failed to load news catalog:', err))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  const filteredArticles = useMemo(() => {
    return articles.filter(art => {
      const matchesTag = selectedTag === 'All' || (art.tags && art.tags.includes(selectedTag));
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query ||
        art.headline.toLowerCase().includes(query) ||
        art.summary.toLowerCase().includes(query) ||
        art.source.toLowerCase().includes(query) ||
        (art.tags && art.tags.some(t => t.toLowerCase().includes(query)));
      return matchesTag && matchesSearch;
    });
  }, [articles, selectedTag, searchQuery]);

  return (
    <div className="w-full space-y-8 relative pb-12">
      {/* Curved Background Ambient Glow */}
      <div className="absolute top-[-5%] right-[15%] w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] left-[5%] w-[450px] h-[450px] rounded-full bg-indigo-500/5 blur-[130px] pointer-events-none" />

      {/* Breadcrumb Navigation Bar */}
      <nav className="flex items-center justify-between gap-3 text-xs font-bold text-slate-400">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />
          <Link href="/dashboard/news" className="hover:text-white transition-colors">News</Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />
          <span className="text-blue-400 font-extrabold">Catalog</span>
        </div>

        <Link
          href="/dashboard/news"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all text-xs font-bold shrink-0"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Daily Briefing
        </Link>
      </nav>

      {/* Editorial Header Banner */}
      <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#1a2133]/90 via-[#131b2e]/95 to-[#101726]/90 border border-slate-700/50 p-6 sm:p-8 md:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-blue-500/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400 shadow-sm">
            <Newspaper className="h-3.5 w-3.5 text-blue-400" />
            Financial News Catalog
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Market News & Economic Coverage
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed">
            Curated reporting on central bank monetary policy, inflation trends, corporate earnings, and sector movements from leading global financial publications.
          </p>

          {/* Search Input Bar */}
          <div className="pt-2 relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search stories by headline, topic, or publication..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#161c2e]/90 border border-slate-700/60 rounded-2xl py-3 sm:py-3.5 pl-11 pr-10 text-white placeholder-slate-400 text-xs sm:text-sm font-semibold focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-xl"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Filter Pills & Results Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-black text-slate-400 uppercase tracking-wider mr-1">
            <Filter className="h-3.5 w-3.5 text-blue-400" /> Filter:
          </div>
          {CATEGORY_TAGS.map(tag => {
            const isSelected = selectedTag === tag;
            const label = tag === 'All' ? 'All Stories' : tag.replace('#', '');
            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.35)] -translate-y-0.5'
                    : 'bg-[#161c2e]/80 text-slate-400 border border-slate-700/60 hover:bg-[#1f2840] hover:text-white'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="text-xs font-bold text-slate-400 whitespace-nowrap">
          Showing <span className="text-white font-black">{filteredArticles.length}</span> {filteredArticles.length === 1 ? 'story' : 'stories'}
        </div>
      </div>

      {/* Strict 3-Column Article Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full items-stretch">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-96 rounded-2xl sm:rounded-3xl bg-slate-900/60 border border-slate-800 animate-pulse p-6 space-y-4" />
          ))}
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-16 bg-[#1a2133]/60 rounded-3xl border border-dashed border-slate-700/60 space-y-3">
          <Newspaper className="h-10 w-10 text-slate-500 mx-auto" />
          <h3 className="text-base sm:text-lg font-black text-white">No articles matched your criteria</h3>
          <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto">
            Try adjusting your search terms or select another category filter to explore more stories.
          </p>
          <button
            type="button"
            onClick={() => { setSelectedTag('All'); setSearchQuery(''); }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md mt-2 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full items-stretch">
          <AnimatePresence mode="popLayout">
            {filteredArticles.map((article: NewsArticle, index: number) => (
              <motion.div
                key={article.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: (index % 3) * 0.05 }}
                className="group relative w-full flex flex-col justify-between overflow-visible rounded-2xl sm:rounded-3xl bg-[#1a2133]/90 backdrop-blur-md border border-slate-700/50 hover:border-blue-500/40 hover:shadow-[0_0_30px_rgba(59,130,246,0.12)] transition-all duration-300 min-h-[440px] lg:aspect-[1/1.05] h-full z-10 hover:z-40 focus-within:z-40"
              >
                {/* Top Section: Photo Thumbnail */}
                <div className="relative h-48 sm:h-52 lg:h-[50%] w-full overflow-hidden rounded-t-2xl sm:rounded-t-3xl bg-slate-900 shrink-0">
                  <img
                    src={article.image}
                    alt={article.headline}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a2133] via-transparent to-transparent opacity-90" />
                  
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-20 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-slate-900/90 text-xs sm:text-sm font-extrabold text-blue-400 border border-slate-700/50 shadow-md backdrop-blur-sm">
                    {index < 9 ? `0${index + 1}` : index + 1}
                  </div>

                  <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-20 rounded-lg bg-slate-900/90 px-2.5 py-1 text-[10px] font-extrabold text-slate-300 border border-slate-700/50 shadow-md backdrop-blur-sm uppercase tracking-wider flex items-center gap-1">
                    <Globe className="h-3 w-3 text-blue-400" /> {article.source}
                  </div>
                </div>

                {/* Bottom Section: Headline, Summary & Buttons */}
                <div className="flex-1 p-4 sm:p-5 md:p-6 flex flex-col justify-between overflow-visible">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-bold gap-2 flex-wrap">
                      <span className="flex items-center gap-1 shrink-0 text-[11px]">
                        <Clock className="h-3 w-3 text-slate-500" />
                        {formatTimeAgo(article.datetime)}
                      </span>
                      
                      <NewsTagGroup tags={article.tags?.slice(0, 3)} />
                    </div>

                    <div className="space-y-1 sm:space-y-1.5">
                      <h3 className="text-sm sm:text-base md:text-lg font-black text-white leading-snug tracking-tight group-hover:text-blue-400 transition-colors duration-300 line-clamp-2">
                        {article.headline}
                      </h3>
                      <p className="text-slate-400 text-xs sm:text-sm leading-relaxed line-clamp-3">
                        {article.summary}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 flex gap-2 sm:gap-2.5 shrink-0">
                    <Link
                      href={`/dashboard/news/${article.id}`}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                    >
                      <BookOpen className="h-3.5 w-3.5" /> Read Story
                    </Link>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 sm:px-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 active:scale-95"
                      title="Read Original Publication"
                    >
                      Source <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
