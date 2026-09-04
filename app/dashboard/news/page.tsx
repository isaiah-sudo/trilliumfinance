import Link from 'next/link';
import { getDailyThreeNews, NewsArticle } from '@/app/actions/news';
import { Newspaper, ExternalLink, Sparkles, TrendingUp, Clock, Globe, BookOpen, ChevronRight, Tag } from 'lucide-react';

export const dynamic = 'force-dynamic';

function formatTimeAgo(unixTimestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - unixTimestamp);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default async function NewsPage() {
  const articles = await getDailyThreeNews();

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-8 relative">
      {/* Curved Background Ambient Glow */}
      <div className="absolute top-[-10%] right-[10%] w-[300px] h-[300px] rounded-full bg-emerald-500/5 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[5%] w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />

      {/* Premium Header / Curation Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a2133]/90 via-[#131b2e]/95 to-[#101726]/90 border border-slate-700/50 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 shadow-sm">
              <Sparkles className="h-3 w-3 animate-pulse" />
              Macro Economic Engine
            </div>
            
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Newspaper className="h-7 w-7 text-emerald-400" />
              Macro Market Signal
            </h1>
            
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
              Curated, noise-filtered macro-economic briefings covering central bank policies, inflation statistics, and market-wide sentiment cleansed of paywalls and ads.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end justify-center gap-3">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Today's Edition</div>
            <div className="text-lg font-extrabold text-white tracking-tight">{todayFormatted}</div>
            
            <Link
              href="/news-catalog"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] flex items-center gap-1.5"
            >
              news.trilliumfinance.net Catalog <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Grid Layout of Curated Articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        {articles.map((article: NewsArticle, index: number) => (
          <div
            key={article.id}
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-[#1a2133]/90 backdrop-blur-md border border-slate-700/50 hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] transition-all duration-500"
          >
            <div>
              {/* Index & Source Header */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
                <img
                  src={article.image}
                  alt={article.headline}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a2133] via-transparent to-transparent opacity-90" />
                
                <div className="absolute top-4 left-4 z-20 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900/90 text-sm font-extrabold text-emerald-400 border border-slate-700/50 shadow-md backdrop-blur-sm">
                  0{index + 1}
                </div>

                <div className="absolute top-4 right-4 z-20 rounded-lg bg-slate-900/90 px-2.5 py-1 text-[10px] font-extrabold text-slate-300 border border-slate-700/50 shadow-md backdrop-blur-sm uppercase tracking-wider flex items-center gap-1">
                  <Globe className="h-3 w-3 text-emerald-400" /> {article.source}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-500" />
                    {formatTimeAgo(article.datetime)}
                  </span>
                  
                  <div className="flex gap-1">
                    {article.tags?.slice(0, 2).map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-extrabold text-white leading-snug tracking-tight group-hover:text-emerald-400 transition-colors duration-300">
                    {article.headline}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
                    {article.summary}
                  </p>
                </div>
              </div>
            </div>

            {/* Dual Action Buttons: Read Clean vs Read Raw */}
            <div className="p-5 pt-0 space-y-2">
              <div className="flex gap-2">
                <Link
                  href={`/news-catalog/${article.id}`}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                >
                  <BookOpen className="h-3.5 w-3.5" /> Read Clean
                </Link>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 active:scale-95"
                  title="Read Raw Article Source"
                >
                  Raw <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Focus Architecture Callout */}
      <div className="rounded-3xl border border-slate-700/30 bg-slate-900/40 p-5 flex flex-col md:flex-row items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <TrendingUp className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Macro Trading Signal</h4>
          <p className="text-slate-400 text-xs leading-relaxed">
            Macro-economic market shifts driven by Federal Reserve statements and inflation statistics dictate multi-week trends. Read cleansed executive briefings, minimize noise, and trade intentionally.
          </p>
        </div>
      </div>
    </div>
  );
}
