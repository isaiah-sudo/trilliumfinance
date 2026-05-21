'use client';

import { useEffect, useState } from 'react';
import { Trophy, Rocket, Gem, Crown, PieChart, Zap, CheckCircle2, Lock } from 'lucide-react';
import { ACHIEVEMENTS, getUserAchievements, Achievement } from '@/app/actions/achievements';

const iconMap: Record<string, any> = {
  Rocket,
  Gem,
  Crown,
  PieChart,
  Zap
};

export default function AchievementsPage() {
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const ids = await getUserAchievements();
        setUnlockedIds(ids);
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const unlockedCount = unlockedIds.length;
  const totalCount = ACHIEVEMENTS.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1c2e] to-[#2d1b36] p-8 border border-purple-900/50 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 text-purple-500/10">
          <Trophy className="h-64 w-64" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/20 px-3 py-1 text-sm font-medium text-purple-300 mb-4 ring-1 ring-inset ring-purple-500/30">
            <Trophy className="h-4 w-4" /> Achievements
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-4">
            Your Trophy Room
          </h1>
          <p className="text-purple-200/70 text-lg mb-6">
            Unlock badges and showcase your trading mastery. Complete challenges to earn your spot among the elite.
          </p>
          
          {/* Progress Bar */}
          <div className="w-full max-w-md">
            <div className="flex justify-between text-sm font-semibold text-purple-300 mb-2">
              <span>Completion Progress</span>
              <span>{unlockedCount} / {totalCount} ({progressPercent}%)</span>
            </div>
            <div className="h-3 w-full bg-slate-900/50 rounded-full overflow-hidden border border-purple-900/30">
              <div 
                className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-500 shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ACHIEVEMENTS.map((achievement) => {
          const isUnlocked = unlockedIds.includes(achievement.id);
          const IconComponent = iconMap[achievement.iconType] || Trophy;

          return (
            <div 
              key={achievement.id}
              className={`relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 ${
                isUnlocked 
                  ? 'bg-slate-800/80 border-purple-500/30 shadow-[0_4px_20px_rgba(168,85,247,0.1)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(168,85,247,0.2)]'
                  : 'bg-slate-900/50 border-slate-800/50 opacity-70 grayscale-[0.5]'
              }`}
            >
              {/* Background Glow for Unlocked */}
              {isUnlocked && (
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 blur-2xl rounded-full" />
              )}
              
              <div className="relative z-10 flex items-start gap-4">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border ${
                  isUnlocked 
                    ? 'bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 border-purple-500/30 text-purple-400 shadow-inner'
                    : 'bg-slate-800 border-slate-700 text-slate-600'
                }`}>
                  <IconComponent className="h-7 w-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-lg mb-1 truncate ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                    {achievement.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {achievement.description}
                  </p>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="mt-5 pt-4 border-t border-slate-700/30 flex items-center justify-between">
                {isUnlocked ? (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Unlocked
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-800/80 px-2 py-1 rounded-md">
                    <Lock className="h-3.5 w-3.5" /> Locked
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
