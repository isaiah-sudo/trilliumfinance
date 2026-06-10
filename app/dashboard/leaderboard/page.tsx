'use client';

import { useEffect, useState } from 'react';
import { Trophy, Medal, Star, Award, TrendingUp } from 'lucide-react';
import { getLeaderboard, LeaderboardEntry } from '@/app/actions/leaderboard';

export const dynamic = 'force-dynamic';


export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getLeaderboard();
        setLeaders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 border border-slate-700/50 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 text-blue-500/10">
          <Trophy className="h-64 w-64" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-400 mb-4 ring-1 ring-inset ring-blue-500/20">
            <Star className="h-4 w-4" /> Global Rankings
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-4">
            Trader Leaderboard
          </h1>
          <p className="text-slate-400 text-lg">
            Compete with the best. Climb the ranks by building your portfolio value and master the market.
          </p>
        </div>
      </div>

      {/* Top 3 Podium */}
      {leaders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 pb-4 items-end">
          {/* Rank 2 (Silver) */}
          {leaders.length >= 2 ? (
            <div className="order-2 md:order-1 transform transition-all hover:-translate-y-1">
              <div className="rounded-2xl bg-slate-800/80 border border-slate-700/50 p-6 flex flex-col items-center text-center shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-300 to-gray-400" />
                <div className="h-16 w-16 rounded-full bg-slate-700 flex items-center justify-center mb-4 ring-4 ring-gray-400/20">
                  <Medal className="h-8 w-8 text-gray-400" />
                </div>
                <span className="text-xs font-bold text-gray-400 mb-1 tracking-widest uppercase">Rank 2</span>
                <h3 className="text-xl font-bold text-white mb-2">{leaders[1].displayName}</h3>
                <p className="text-blue-400 font-semibold">{formatCurrency(leaders[1].netWorth)}</p>
              </div>
            </div>
          ) : <div className="order-2 md:order-1 hidden md:block"></div>}
          
          {/* Rank 1 (Gold) */}
          {leaders.length >= 1 ? (
            <div className="order-1 md:order-2 transform transition-all hover:-translate-y-2 relative z-10 md:-mt-8">
              <div className="rounded-2xl bg-gradient-to-b from-amber-500/10 to-slate-800/80 border border-amber-500/30 p-8 flex flex-col items-center text-center shadow-[0_0_30px_rgba(245,158,11,0.15)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
                <div className="absolute -top-10 -right-10 text-amber-500/10 blur-xl">
                  <Trophy className="h-32 w-32" />
                </div>
                <div className="h-20 w-20 rounded-full bg-amber-500/20 flex items-center justify-center mb-4 ring-4 ring-amber-500/30 relative z-10">
                  <Trophy className="h-10 w-10 text-amber-400" />
                </div>
                <span className="text-xs font-bold text-amber-400 mb-1 tracking-widest uppercase">Rank 1</span>
                <h3 className="text-2xl font-bold text-white mb-2">{leaders[0].displayName}</h3>
                <p className="text-amber-400 font-bold text-xl">{formatCurrency(leaders[0].netWorth)}</p>
              </div>
            </div>
          ) : <div className="order-1 md:order-2"></div>}

          {/* Rank 3 (Bronze) */}
          {leaders.length >= 3 ? (
            <div className="order-3 md:order-3 transform transition-all hover:-translate-y-1">
              <div className="rounded-2xl bg-slate-800/80 border border-slate-700/50 p-6 flex flex-col items-center text-center shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-700 to-amber-800" />
                <div className="h-16 w-16 rounded-full bg-slate-700 flex items-center justify-center mb-4 ring-4 ring-amber-700/20">
                  <Award className="h-8 w-8 text-amber-600" />
                </div>
                <span className="text-xs font-bold text-amber-600 mb-1 tracking-widest uppercase">Rank 3</span>
                <h3 className="text-xl font-bold text-white mb-2">{leaders[2].displayName}</h3>
                <p className="text-blue-400 font-semibold">{formatCurrency(leaders[2].netWorth)}</p>
              </div>
            </div>
          ) : <div className="order-3 md:order-3 hidden md:block"></div>}
        </div>
      )}

      {/* Rest of Leaderboard */}
      <div className="rounded-2xl border border-slate-700/50 bg-[#1a2133]/50 backdrop-blur-xl overflow-hidden shadow-xl">
        <div className="px-6 py-5 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/50">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-400" /> Global Rankings
          </h2>
        </div>
        <div className="divide-y divide-slate-700/50">
          {leaders.slice(3).map((leader, index) => (
            <div 
              key={leader.id} 
              className="flex items-center justify-between px-6 py-4 hover:bg-slate-700/20 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-sm font-bold text-slate-400 group-hover:border-blue-500/30 group-hover:text-blue-400 transition-colors">
                  {leader.rank}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200">{leader.displayName}</h4>
                  <p className="text-xs text-slate-500">Trader</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-200 font-mono tracking-tight">
                  {formatCurrency(leader.netWorth)}
                </div>
              </div>
            </div>
          ))}
          {leaders.length === 0 && (
            <div className="px-6 py-8 text-center text-slate-500">
              No traders found. Make a trade or visit your portfolio to be added!
            </div>
          )}
          {leaders.length > 0 && leaders.length <= 3 && (
            <div className="px-6 py-8 text-center text-slate-500">
              More traders needed to expand the leaderboard. Invite friends to compete!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
