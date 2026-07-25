'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { useSettings } from '@/context/SettingsContext';
import { 
  BookOpen, 
  CheckCircle, 
  ChevronRight, 
  X, 
  Lock, 
  Flame, 
  Star, 
  Trophy, 
  Sparkles, 
  RefreshCw, 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft, 
  Award, 
  PlayCircle, 
  RotateCcw, 
  ShieldCheck, 
  Zap,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart2,
  Percent,
  Sliders,
  AlertCircle
} from 'lucide-react';
import { 
  getUserLessonAndStreakData, 
  completeLessonAction, 
  selectStreakCommitment, 
  claimStreakCapitalReward,
  STREAK_REWARDS 
} from '@/app/actions/lessons';
import { UNITS_DATA } from './unitsData';

interface TermProps {
  word: string;
  definition: string;
}

function FinancialTerm({ word, definition }: TermProps) {
  return (
    <span className="relative group cursor-pointer inline-block mx-0.5">
      <span className="underline decoration-dotted decoration-blue-500 hover:decoration-blue-400 font-bold text-blue-600 dark:text-blue-400 transition-colors">
        {word}
      </span>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-xl bg-slate-900/95 dark:bg-slate-800/95 text-white border border-slate-700/50 shadow-2xl text-xs font-medium opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-300 transform scale-95 group-hover:scale-100 z-50 text-center backdrop-blur-sm">
        <span className="font-extrabold text-blue-400 block mb-1">{word}</span>
        {definition}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900/95 dark:border-t-slate-800/95" />
      </span>
    </span>
  );
}

export interface Lesson {
  id: number;
  unitId: number;
  title: string;
  subtitle: string;
  icon: string;
  xp: number;
  trilliums: number;
  externalLink?: string;
  slides: {
    title: string;
    content: string;
    keyTakeaway: string;
  }[];
  toolType: string;
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface Unit {
  id: number;
  title: string;
  subtitle: string;
  color: string;
  badgeIcon: string;
  lessons: Lesson[];
}

const UNITS: Unit[] = UNITS_DATA;

// ----------------------------------------------------
// Main Component
// ----------------------------------------------------
export default function LessonsPage() {
  const { textFont, numberFont, trilliums, setTrilliums } = useSettings();
  const { fetchAchievementsAndStreak, fetchPortfolio, streakCount } = usePortfolioStore();

  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Streak Commitment State
  const [activeCommitment, setActiveCommitment] = useState<number>(7);
  const [claimedRewards, setClaimedRewards] = useState<number[]>([]);
  const [showCommitmentModal, setShowCommitmentModal] = useState<boolean>(false);
  const [rewardClaiming, setRewardClaiming] = useState<boolean>(false);
  const [rewardSuccessMsg, setRewardSuccessMsg] = useState<string | null>(null);

  // Lesson Runner State
  const [currentStep, setCurrentStep] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<number, boolean>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    fetchAchievementsAndStreak();
    async function syncUserData() {
      try {
        const data = await getUserLessonAndStreakData();
        setCompletedLessonIds(data.completedLessonIds);
        setActiveCommitment(data.activeCommitment || 7);
        setClaimedRewards(data.claimedCommitmentRewards || []);

        if (typeof window !== 'undefined') {
          localStorage.setItem('trillium_completed_lessons', JSON.stringify(data.completedLessonIds));
        }
      } catch (e) {
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('trillium_completed_lessons');
          if (saved) {
            try { setCompletedLessonIds(JSON.parse(saved)); } catch (err) { setCompletedLessonIds([1]); }
          } else {
            setCompletedLessonIds([1]);
          }
        }
      }
    }
    syncUserData();
  }, [fetchAchievementsAndStreak]);

  const markLessonComplete = async (lesson: Lesson) => {
    if (!completedLessonIds.includes(lesson.id)) {
      const updated = [...completedLessonIds, lesson.id];
      setCompletedLessonIds(updated);
      setTrilliums(trilliums + lesson.trilliums);

      if (typeof window !== 'undefined') {
        localStorage.setItem('trillium_completed_lessons', JSON.stringify(updated));
        localStorage.setItem(`lesson_${lesson.id}_completed_at`, Date.now().toString());
      }

      try {
        await completeLessonAction(lesson.id, lesson.xp, lesson.trilliums);
      } catch (e) {
        console.error('Error saving lesson completion to Firestore:', e);
      }
    }
    setIsCompleted(true);
  };

  const handleSelectCommitment = async (days: number) => {
    setActiveCommitment(days);
    try {
      await selectStreakCommitment(days);
    } catch (e) {
      console.error(e);
    }
  };

  const handleClaimCapitalReward = async (days: number) => {
    setRewardClaiming(true);
    setRewardSuccessMsg(null);
    try {
      const res = await claimStreakCapitalReward(days);
      if (res.success) {
        setClaimedRewards(prev => [...prev, days]);
        setRewardSuccessMsg(`🎉 Outstanding commitment! $${res.rewardCash} in fresh capital deposited into your portfolio cash! (+${res.rewardTrilliums} 💎)`);
        await fetchPortfolio();
        await fetchAchievementsAndStreak();
      }
    } catch (e: any) {
      alert(e.message || 'Could not claim reward');
    } finally {
      setRewardClaiming(false);
    }
  };

  const handleStartLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setCurrentStep(0);
    setSlideIndex(0);
    setSelectedAnswers({});
    setQuizSubmitted({});
    setIsCompleted(false);
  };

  const totalLessons = 50;
  const completedCount = completedLessonIds.length;
  const courseProgressPct = Math.round((completedCount / totalLessons) * 100);

  return (
    <div className={`space-y-8 max-w-5xl mx-auto font-txt-${textFont} pb-16`}>
      {/* Top Duolingo-Style Header Dashboard Stats */}
      <div className="rounded-3xl bg-white dark:bg-[#121622]/90 border border-slate-200 dark:border-slate-800/80 p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shrink-0">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Financial Education Path 🎓
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Master 50 interactive lessons across 10 units & earn cash rewards!
              </p>
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end overflow-x-auto pb-1 md:pb-0">
            {/* Streak Commitment Button */}
            <button
              onClick={() => setShowCommitmentModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 shadow-sm shrink-0 hover:scale-105 transition-all text-left"
            >
              <Flame className="h-5 w-5 text-amber-500 animate-bounce" />
              <div>
                <div className="text-[9px] font-black uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <span>Streak Target</span>
                  <span className="bg-amber-500 text-white px-1 rounded text-[8px] font-bold">{activeCommitment}D</span>
                </div>
                <div className={`text-xs font-black text-slate-800 dark:text-slate-100 font-num-${numberFont}`}>
                  {streakCount} / {activeCommitment} Days
                </div>
              </div>
            </button>

            {/* Completed */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 shadow-sm shrink-0">
              <Trophy className="h-5 w-5 text-emerald-500" />
              <div>
                <div className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400">Completed</div>
                <div className={`text-xs font-black text-slate-800 dark:text-slate-100 font-num-${numberFont}`}>
                  {completedCount} / {totalLessons}
                </div>
              </div>
            </div>

            {/* Level XP */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 shadow-sm shrink-0">
              <Star className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-[9px] font-black uppercase text-blue-600 dark:text-blue-400">Total XP</div>
                <div className={`text-xs font-black text-slate-800 dark:text-slate-100 font-num-${numberFont}`}>
                  {completedCount * 75} XP
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800/60">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
            <span>Overall Course Progress ({completedCount}/50 Lessons)</span>
            <span className="text-blue-600 dark:text-blue-400 font-extrabold">{courseProgressPct}% Complete</span>
          </div>
          <div className="h-3 w-full bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-800">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-600 via-teal-400 to-emerald-500 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.6)]"
              initial={{ width: 0 }}
              animate={{ width: `${courseProgressPct}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>
      </div>

      {/* Streak Commitment & Capital Rewards Callout Card */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/30 p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shrink-0">
              <Flame className="h-8 w-8 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  Duolingo-Style Streak Commitment
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                Commit to Daily Lessons & Earn Capital Rewards 💵
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5 max-w-xl">
                Pledge to do a lesson every day. Complete 7 days for $50 cash capital, 14 days for $150, 30 days for $350, or 60 days for $1,000!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch md:self-auto">
            {streakCount >= activeCommitment && !claimedRewards.includes(activeCommitment) ? (
              <button
                disabled={rewardClaiming}
                onClick={() => handleClaimCapitalReward(activeCommitment)}
                className="w-full md:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs shadow-lg uppercase tracking-wider animate-bounce"
              >
                {rewardClaiming ? 'Claiming Cash...' : `Claim $${STREAK_REWARDS[activeCommitment]?.cash} Reward! 🎉`}
              </button>
            ) : (
              <button
                onClick={() => setShowCommitmentModal(true)}
                className="w-full md:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-black text-xs shadow-lg uppercase tracking-wider transition-all hover:scale-105"
              >
                Change Streak Commitment →
              </button>
            )}
          </div>
        </div>

        {rewardSuccessMsg && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold text-center animate-in fade-in">
            {rewardSuccessMsg}
          </div>
        )}
      </div>

      {/* Streak Commitment Selector Modal */}
      <AnimatePresence>
        {showCommitmentModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#161c2e] border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 sm:p-8 w-full max-w-xl shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Flame className="h-6 w-6 text-amber-500" />
                    Commit to Your Streak Goal
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Higher streak commitments yield bigger simulator cash rewards deposited to your portfolio!
                  </p>
                </div>
                <button
                  onClick={() => setShowCommitmentModal(false)}
                  className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[7, 14, 30, 60].map((days) => {
                  const rw = STREAK_REWARDS[days];
                  const isSelected = activeCommitment === days;
                  const isClaimed = claimedRewards.includes(days);
                  const isReached = streakCount >= days;

                  return (
                    <div
                      key={days}
                      onClick={() => handleSelectCommitment(days)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10 shadow-lg scale-102'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:border-amber-500/50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1">
                          ⚡ {days} Days Target
                        </span>
                        {isClaimed ? (
                          <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">Claimed ✓</span>
                        ) : isReached ? (
                          <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full">Ready!</span>
                        ) : null}
                      </div>
                      <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                        +${rw.cash} Cash
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                        +{rw.trilliums} Trilliums • +{rw.xp} XP
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setShowCommitmentModal(false)}
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider shadow-lg"
              >
                Confirm Commitment & Return to Path
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Duolingo Style Skill Tree Path */}
      <div className="space-y-12">
        {UNITS.map((unit) => {
          const unitCompletedCount = unit.lessons.filter(l => completedLessonIds.includes(l.id)).length;
          const isUnitUnlocked = unit.id === 1 || completedLessonIds.some(id => unit.lessons.some(l => l.id === id || l.id === id + 1));

          return (
            <div key={unit.id} className="space-y-8 relative">
              {/* Unit Banner Header */}
              <div className={`rounded-3xl p-6 shadow-xl border backdrop-blur-md ${
                unit.color === 'emerald'
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white border-emerald-500/30'
                  : unit.color === 'blue'
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white border-blue-500/30'
                  : unit.color === 'purple'
                  ? 'bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 text-white border-purple-500/30'
                  : 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white border-amber-500/30'
              }`}>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <span className="text-3xl p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner">
                      {unit.badgeIcon}
                    </span>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/80 bg-white/10 px-2.5 py-0.5 rounded-full">
                        {unit.title.split(':')[0]}
                      </span>
                      <h2 className="text-lg md:text-xl font-black text-white tracking-wide mt-0.5">
                        {unit.title.split(':')[1]}
                      </h2>
                      <p className="text-xs text-white/80 font-medium mt-1 max-w-xl">
                        {unit.subtitle}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end md:self-center bg-black/20 px-3.5 py-1.5 rounded-2xl border border-white/10 text-xs font-extrabold whitespace-nowrap">
                    <span>{unitCompletedCount} / {unit.lessons.length} Completed</span>
                  </div>
                </div>
              </div>

              {/* Lesson Path Nodes (Duolingo Staggered Layout) */}
              <div className="relative flex flex-col items-center py-4 space-y-10">
                {/* Curved connecting line behind nodes */}
                <div className="absolute top-8 bottom-8 left-1/2 -translate-x-1/2 w-1.5 bg-slate-200 dark:bg-slate-800/80 rounded-full -z-0 border-t border-b border-dotted" />

                {unit.lessons.map((lesson, idx) => {
                  const isDone = completedLessonIds.includes(lesson.id);
                  // Unlocked if previous lesson is done or if it's the very first lesson
                  const isUnlocked = lesson.id === 1 || completedLessonIds.includes(lesson.id - 1) || isDone;

                  // Horizontal offset for Duolingo staggered path: center, left, center, right, center
                  const offsets = ['translate-x-0', '-translate-x-12 sm:-translate-x-20', 'translate-x-0', 'translate-x-12 sm:translate-x-20'];
                  const offsetClass = offsets[idx % offsets.length];

                  return (
                    <div 
                      key={lesson.id} 
                      className={`relative z-10 flex flex-col items-center group transition-all duration-300 ${offsetClass}`}
                    >
                      {/* Node Button */}
                      <button
                        onClick={() => isUnlocked && handleStartLesson(lesson)}
                        disabled={!isUnlocked}
                        className={`relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full transition-all duration-300 transform active:scale-95 ${
                          isDone
                            ? 'bg-gradient-to-b from-emerald-400 to-emerald-600 text-white shadow-[0_6px_0_0_#047857] hover:brightness-110'
                            : isUnlocked
                            ? 'bg-gradient-to-b from-blue-500 to-blue-700 text-white shadow-[0_6px_0_0_#1d4ed8] hover:scale-105 animate-pulse hover:animate-none ring-4 ring-blue-400/40'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 shadow-[0_6px_0_0_#94a3b8] dark:shadow-[0_6px_0_0_#1e293b] cursor-not-allowed'
                        }`}
                      >
                        {/* Status Icon */}
                        <div className="flex flex-col items-center justify-center space-y-0.5">
                          {isDone ? (
                            <>
                              <CheckCircle className="h-8 w-8 text-white drop-shadow-md" />
                              <div className="flex gap-0.5 text-amber-300 text-[10px]">
                                ★★★
                              </div>
                            </>
                          ) : isUnlocked ? (
                            <>
                              <span className="text-2xl sm:text-3xl">{lesson.icon}</span>
                              <span className="text-[9px] font-black uppercase tracking-wider bg-white/20 px-1.5 rounded-full">
                                START
                              </span>
                            </>
                          ) : (
                            <Lock className="h-7 w-7 text-slate-400 dark:text-slate-600" />
                          )}
                        </div>
                      </button>

                      {/* Lesson Label Badge */}
                      <div className={`mt-3 max-w-[220px] text-center p-2.5 rounded-2xl border shadow-lg backdrop-blur-md transition-all ${
                        isDone 
                          ? 'bg-white/95 dark:bg-[#1a2133]/95 border-emerald-200 dark:border-emerald-800/40 text-slate-800 dark:text-slate-200' 
                          : isUnlocked 
                          ? 'bg-white dark:bg-[#1a2133] border-blue-300 dark:border-blue-800 text-slate-900 dark:text-white font-bold' 
                          : 'bg-slate-100/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                      }`}>
                        <div className="text-[11px] font-black line-clamp-1">
                          {lesson.title}
                        </div>
                        <div className="text-[9px] text-slate-500 dark:text-slate-400 font-medium line-clamp-1 mt-0.5">
                          +{lesson.xp} XP • +{lesson.trilliums} 💎
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Duolingo Lesson Modal */}
      <AnimatePresence>
        {activeLesson && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white dark:bg-[#161c2e] border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl relative my-auto space-y-6"
            >
              {/* Header: Lesson Title & Progress Bar */}
              <div className="space-y-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{activeLesson.icon}</span>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">{activeLesson.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{activeLesson.subtitle}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveLesson(null)}
                    className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Step Progress Bar */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-300"
                      style={{ 
                        width: `${((currentStep + 1) / (1 + 1 + activeLesson.quiz.length)) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-extrabold text-blue-500 uppercase tracking-widest whitespace-nowrap">
                    Step {currentStep + 1} of {1 + 1 + activeLesson.quiz.length}
                  </span>
                </div>
              </div>

              {/* Completion Screen */}
              {isCompleted ? (
                <div className="py-8 text-center space-y-6">
                  <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-2xl shadow-emerald-500/40 animate-bounce">
                    <Trophy className="h-10 w-10" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Lesson Completed! 🎉</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium">
                      Great job! You have mastered {activeLesson.title} and unlocked your rewards.
                    </p>
                  </div>

                  {/* Reward Card */}
                  <div className="flex items-center justify-center gap-6 max-w-xs mx-auto p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-amber-500" />
                      <span className="text-sm font-black text-slate-800 dark:text-white">+{activeLesson.xp} XP</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">💎</span>
                      <span className="text-sm font-black text-slate-800 dark:text-white">+{activeLesson.trilliums} Trilliums</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveLesson(null)}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl shadow-[0_4px_0_0_#047857] active:translate-y-[2px] transition-all text-sm uppercase tracking-wider"
                  >
                    Continue Path →
                  </button>
                </div>
              ) : (
                /* Step Content (Slides -> Tool -> Quiz Questions) */
                <div className="space-y-6">
                  {/* Step 0: Slide Content */}
                  {currentStep === 0 && (
                    <div className="space-y-6">
                      <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 space-y-3">
                        <h4 className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
                          {activeLesson.slides[slideIndex]?.title || "Key Concept"}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                          {activeLesson.slides[slideIndex]?.content}
                        </p>
                      </div>

                      {/* Key Takeaway Callout */}
                      <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-start gap-3">
                        <Sparkles className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-extrabold block text-[10px] uppercase tracking-wider mb-0.5">Key Takeaway</span>
                          {activeLesson.slides[slideIndex]?.keyTakeaway}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        {slideIndex > 0 ? (
                          <button
                            onClick={() => setSlideIndex(slideIndex - 1)}
                            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold"
                          >
                            ← Back
                          </button>
                        ) : <div />}

                        {slideIndex < activeLesson.slides.length - 1 ? (
                          <button
                            onClick={() => setSlideIndex(slideIndex + 1)}
                            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-extrabold shadow-md hover:bg-blue-500"
                          >
                            Next Slide →
                          </button>
                        ) : (
                          <button
                            onClick={() => setCurrentStep(1)}
                            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-extrabold shadow-md hover:bg-emerald-500"
                          >
                            Try Interactive Tool →
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 1: Interactive Tool Simulator */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold uppercase text-blue-500 tracking-wider">Interactive Hands-On Tool</span>
                        {activeLesson.externalLink && (
                          <Link 
                            href={activeLesson.externalLink}
                            className="text-xs text-blue-600 dark:text-blue-400 font-bold underline flex items-center gap-1 hover:text-blue-500"
                          >
                            Open Full Simulator <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                        )}
                      </div>

                      <LessonInteractiveTool toolType={activeLesson.toolType} />

                      <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800">
                        <button
                          onClick={() => setCurrentStep(0)}
                          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold"
                        >
                          ← Review Slides
                        </button>
                        <button
                          onClick={() => setCurrentStep(2)}
                          className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-extrabold shadow-md hover:bg-blue-500"
                        >
                          Start Knowledge Quiz →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2+: Quiz Question Step */}
                  {currentStep >= 2 && (
                    <div className="space-y-6">
                      {(() => {
                        const qIndex = currentStep - 2;
                        const q = activeLesson.quiz[qIndex];
                        if (!q) return null;

                        const isSubmitted = quizSubmitted[qIndex] || false;
                        const selected = selectedAnswers[qIndex];
                        const isCorrect = selected === q.correctIndex;

                        return (
                          <div className="space-y-5">
                            <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-purple-500 tracking-wider">
                              <HelpCircle className="h-4 w-4" />
                              <span>Question {qIndex + 1} of {activeLesson.quiz.length}</span>
                            </div>

                            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                              {q.question}
                            </h4>

                            <div className="space-y-2.5">
                              {q.options.map((opt, optIdx) => {
                                let btnStyle = "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800";
                                if (isSubmitted) {
                                  if (optIdx === q.correctIndex) {
                                    btnStyle = "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold ring-2 ring-emerald-500";
                                  } else if (optIdx === selected) {
                                    btnStyle = "bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-700 dark:text-rose-300 font-bold";
                                  }
                                } else if (selected === optIdx) {
                                  btnStyle = "bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-700 dark:text-blue-300 font-bold ring-2 ring-blue-500";
                                }

                                return (
                                  <button
                                    key={optIdx}
                                    disabled={isSubmitted}
                                    onClick={() => setSelectedAnswers({ ...selectedAnswers, [qIndex]: optIdx })}
                                    className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition-all duration-200 flex items-center justify-between ${btnStyle}`}
                                  >
                                    <span>{opt}</span>
                                    {isSubmitted && optIdx === q.correctIndex && (
                                      <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 ml-2" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Instant Feedback Explanation Box */}
                            {isSubmitted && (
                              <div className={`p-4 rounded-2xl border text-xs font-medium space-y-1 ${
                                isCorrect 
                                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300' 
                                  : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/40 text-rose-800 dark:text-rose-300'
                              }`}>
                                <div className="font-extrabold text-xs uppercase tracking-wider">
                                  {isCorrect ? 'Correct! 🎉' : 'Incorrect 💡'}
                                </div>
                                <p>{q.explanation}</p>
                              </div>
                            )}

                            {/* Bottom Action Controls */}
                            <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800">
                              <button
                                onClick={() => setCurrentStep(currentStep - 1)}
                                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold"
                              >
                                ← Back
                              </button>

                              {!isSubmitted ? (
                                <button
                                  disabled={selected === undefined}
                                  onClick={() => setQuizSubmitted({ ...quizSubmitted, [qIndex]: true })}
                                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-extrabold shadow-md hover:bg-blue-500 disabled:opacity-50"
                                >
                                  Submit Answer
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    if (qIndex < activeLesson.quiz.length - 1) {
                                      setCurrentStep(currentStep + 1);
                                    } else {
                                      markLessonComplete(activeLesson);
                                    }
                                  }}
                                  className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-extrabold shadow-md hover:bg-emerald-500"
                                >
                                  {qIndex < activeLesson.quiz.length - 1 ? 'Next Question →' : 'Complete Lesson 🎉'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ----------------------------------------------------
// Helper Interactive Tool Component
// ----------------------------------------------------
function LessonInteractiveTool({ toolType }: { toolType: string }) {
  const [val1, setVal1] = useState(5);
  const [val2, setVal2] = useState(100);

  if (toolType === 'inflation_calc') {
    const years = val1;
    const rate = 3.5;
    const futureValue = Math.round(100 / Math.pow(1 + rate / 100, years));
    return (
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 space-y-4">
        <div className="text-xs font-extrabold uppercase text-slate-400">Inflation Purchasing Power Simulator</div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Time Horizon: {years} Years</span>
          <span className="text-xs font-extrabold text-rose-500">$100 today buys ${futureValue} of goods in {years} yrs</span>
        </div>
        <input 
          type="range" min="1" max="30" value={years} onChange={(e) => setVal1(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
        />
      </div>
    );
  }

  if (toolType === 'compound_calc') {
    const years = val1;
    const monthly = 200;
    const rate = 0.08;
    const months = years * 12;
    const totalInvested = monthly * months;
    const futureWealth = Math.round(monthly * ((Math.pow(1 + rate / 12, months) - 1) / (rate / 12)));
    return (
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 space-y-4">
        <div className="text-xs font-extrabold uppercase text-slate-400">Compound Growth Calculator ($200/mo @ 8%)</div>
        <div className="flex items-center justify-between text-xs font-bold">
          <span>Investment Duration: {years} Years</span>
          <span className="text-emerald-500 font-black text-sm">${futureWealth.toLocaleString()} Total Portfolio</span>
        </div>
        <input 
          type="range" min="1" max="40" value={years} onChange={(e) => setVal1(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
        <div className="text-[10px] text-slate-500 flex justify-between">
          <span>Total Cash Saved: ${totalInvested.toLocaleString()}</span>
          <span>Compound Interest Profit: ${(futureWealth - totalInvested).toLocaleString()}</span>
        </div>
      </div>
    );
  }

  if (toolType === 'pe_eval') {
    const price = val2;
    const eps = 5;
    const pe = (price / eps).toFixed(1);
    const valuation = Number(pe) > 25 ? 'Overvalued / High Growth' : Number(pe) < 15 ? 'Bargain / Undervalued' : 'Fair Valuation';
    return (
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 space-y-4">
        <div className="text-xs font-extrabold uppercase text-slate-400">P/E Ratio Valuation Scanner</div>
        <div className="flex justify-between items-center text-xs font-bold">
          <span>Stock Price: ${price} | EPS: ${eps}</span>
          <span className="text-blue-500 font-black text-sm">P/E Ratio: {pe} ({valuation})</span>
        </div>
        <input 
          type="range" min="20" max="250" step="5" value={price} onChange={(e) => setVal2(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>
    );
  }

  // Default interactive preview widget for all other tools
  return (
    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 space-y-3 text-center">
      <div className="text-xs font-extrabold uppercase text-blue-500">Interactive Concept Evaluator</div>
      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
        Adjust parameters to simulate live financial scenarios in real time.
      </p>
      <div className="flex justify-center items-center gap-4 pt-2">
        <span className="px-3 py-1 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-extrabold text-xs">
          Simulated Yield: +8.4%
        </span>
        <span className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
          Risk Grade: Low (A+)
        </span>
      </div>
    </div>
  );
}
