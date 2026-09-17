import Link from 'next/link';
import { getDailyThreeNews, NewsArticle } from '@/app/actions/news';
import { Newspaper, ExternalLink, Clock, Globe, BookOpen, ChevronRight } from 'lucide-react';
import NewsTagGroup from '@/components/dashboard/NewsTagGroup';

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
    <div className="w-full space-y-6 relative">
      {/* Curved Background Ambient Glow */}
      <div className="absolute top-[-10%] right-[10%] w-[350px] h-[350px] rounded-full bg-blue-500/5 blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[5%] w-[450px] h-[450px] rounded-full bg-indigo-500/5 blur-[110px] pointer-events-none" />

      {/* Editorial Header Banner - Spans full width */}
      <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#1a2133]/90 via-[#131b2e]/95 to-[#101726]/90 border border-slate-700/50 p-4 sm:p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-blue-500/5 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400 shadow-sm">
              <Newspaper className="h-3.5 w-3.5 text-blue-400" />
              Market News
            </div>
            
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Daily Market Briefing
            </h1>
            
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Essential economic indicators, corporate developments, and macro trends shaping today&apos;s financial markets.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end justify-center gap-2 sm:gap-3">
            <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest">Today&apos;s Edition</div>
            <div className="text-base sm:text-lg font-extrabold text-white tracking-tight">{todayFormatted}</div>
            
            <Link
              href="/dashboard/news/catalog"
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] flex items-center gap-1.5"
            >
              Browse News Catalog <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* The 3 news cards combined */}
      <div className="w-full max-w-full mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full items-stretch">
          {articles.map((article: NewsArticle, index: number) => (
            <div
              key={article.id}
              className="group relative w-full flex flex-col justify-between overflow-visible rounded-2xl sm:rounded-3xl bg-[#1a2133]/90 backdrop-blur-md border border-slate-700/50 hover:border-blue-500/40 hover:shadow-[0_0_30px_rgba(59,130,246,0.12)] transition-all duration-300 min-h-[440px] lg:aspect-[1/1.05] h-full z-10 hover:z-40 focus-within:z-40"
            >
              {/* Top Section: Photo Header */}
              <div className="relative h-48 sm:h-52 lg:h-[50%] w-full overflow-hidden rounded-t-2xl sm:rounded-t-3xl bg-slate-900 shrink-0">
                <img
                  src={article.image}
                  alt={article.headline}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a2133] via-transparent to-transparent opacity-90" />
                
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-20 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-slate-900/90 text-xs sm:text-sm font-extrabold text-blue-400 border border-slate-700/50 shadow-md backdrop-blur-sm">
                  0{index + 1}
                </div>

                <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-20 rounded-lg bg-slate-900/90 px-2.5 py-1 text-[10px] font-extrabold text-slate-300 border border-slate-700/50 shadow-md backdrop-blur-sm uppercase tracking-wider flex items-center gap-1">
                  <Globe className="h-3 w-3 text-blue-400" /> {article.source}
                </div>
              </div>

              {/* Bottom Section: headline, summary & buttons */}
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
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95"
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
