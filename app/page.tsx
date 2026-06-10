'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui';
import {
  TrendingUp,
  GraduationCap,
  Trophy,
  Flame,
  Plus,
  Minus,
  Sparkles,
  TreePine,
  ArrowRight,
  Shield,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function LandingPage() {
  // Fidget 1: Trading Simulator State
  const [shareCount, setShareCount] = useState(10);
  const sharePrice = 182.50;
  const initialCash = 100000;
  const totalCost = shareCount * sharePrice;
  const remainingCash = initialCash - totalCost;

  // Fidget 2: Streak State
  const [streakCount, setStreakCount] = useState(3);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [xp, setXp] = useState(1250);
  const [xpNotes, setXpNotes] = useState<string[]>([]);

  const handleCheckIn = () => {
    if (hasCheckedIn) return;
    setHasCheckedIn(true);
    setStreakCount((prev) => prev + 1);
    setXp((prev) => prev + 150);
    setXpNotes((prev) => [...prev, '+150 Streak XP!']);
    setTimeout(() => {
      setXpNotes((prev) => prev.slice(1));
    }, 2500);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 font-sans text-slate-100 select-none">
      
      {/* Dynamic Glassmorphic Ambient Glows */}
      <div className="absolute top-[-10%] left-[-15%] w-[55%] h-[55%] rounded-full bg-emerald-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[5%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[140px] pointer-events-none" />
      <div className="absolute top-[35%] left-[30%] w-[35%] h-[35%] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

      {/* Floating Glass Header */}
      <header className="relative z-50 max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <TreePine className="h-5 w-5 text-slate-950" />
          </div>
          <span className="text-xl font-black text-white tracking-wide">
            Trillium <span className="text-emerald-400">Finance</span>
          </span>
        </Link>
        
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/signup">
            <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-black transition-all shadow-[0_4px_20px_rgba(16,185,129,0.35)] active:scale-95">
              Get Started
            </button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-10 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* Left Side: Context & Call to Action */}
        <div className="lg:col-span-6 flex flex-col items-start text-left space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 backdrop-blur-md"
          >
            <Sparkles className="h-4 w-4 text-emerald-400" /> Virtual Portfolio Simulator & Quests
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.1]"
          >
            Master the Markets with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500">Zero Risk</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-400 text-base sm:text-lg font-medium leading-relaxed max-w-xl"
          >
            Trillium Finance matches live market asset feeds with gamified financial literacy challenges. Grow your virtual wealth, protect your streak, unlock achievement badges, and trade Apple, Microsoft, or ETFs in a complete sandbox.
          </motion.p>

          {/* Quick Context Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-2 gap-4 w-full max-w-md pt-2"
          >
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <Shield className="h-5 w-5 text-emerald-400 mb-1.5" />
              <div className="text-xs font-bold text-slate-200">100% Risk Free</div>
              <div className="text-[10px] text-slate-400 mt-0.5">$100k starting paper cash.</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <Layers className="h-5 w-5 text-blue-400 mb-1.5" />
              <div className="text-xs font-bold text-slate-200">Interactive Lessons</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Learn finance, earn legendary badges.</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap gap-4 items-center pt-4"
          >
            <Link href="/signup">
              <button className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black transition-all shadow-[0_4px_25px_rgba(16,185,129,0.3)] active:scale-95">
                Start Trading Simulator <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </motion.div>
        </div>

        {/* Right Side: Interactive Glassmorphism Fidgets/Widgets */}
        <div className="lg:col-span-6 flex flex-col space-y-6 relative">
          
          {/* Glass Card Widget 1: Mock Trading Transaction Fidget */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="w-full p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl relative"
          >
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">
                  SIMULATOR WIDGET
                </span>
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <span className="text-xs text-slate-400 font-bold">Try Buying AAPL</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-slate-950/40 border border-white/5 rounded-2xl">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Estimated Cost</div>
                <div className="text-xl font-black text-white mt-1">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <div className="p-3 bg-slate-950/40 border border-white/5 rounded-2xl">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Virtual Cash Bal</div>
                <div className="text-xl font-black text-emerald-400 mt-1">${remainingCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
            </div>

            {/* Slider control */}
            <div className="space-y-2.5 mt-2 bg-slate-950/20 p-4 border border-white/5 rounded-2xl">
              <div className="flex justify-between text-xs font-bold text-slate-300">
                <span>Shares: {shareCount}</span>
                <span className="text-slate-400">AAPL Price: ${sharePrice}</span>
              </div>
              
              <input
                type="range"
                min="1"
                max="100"
                value={shareCount}
                onChange={(e) => setShareCount(parseInt(e.target.value))}
                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-800 accent-emerald-400 focus:outline-none"
              />

              <div className="flex gap-2.5 pt-2.5">
                <button
                  onClick={() => setShareCount((prev) => Math.max(1, prev - 1))}
                  className="flex-1 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex justify-center items-center font-black"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShareCount((prev) => Math.min(100, prev + 1))}
                  className="flex-1 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex justify-center items-center font-black"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Glass Card Widget 2: Interactive Streak Counter Fidget */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden"
          >
            {/* Notification alert floating */}
            <AnimatePresence>
              {xpNotes.map((note, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: -20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute top-4 right-4 bg-emerald-500 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-xl shadow-xl z-30"
                >
                  {note}
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500 fill-orange-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-200">Daily Quest Fidget</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Claim Streak</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Total Account XP</div>
                <div className="text-2xl font-black tracking-tight text-white mt-0.5">
                  {xp} <span className="text-xs font-medium text-slate-500">XP</span>
                </div>
              </div>

              <button
                onClick={handleCheckIn}
                disabled={hasCheckedIn}
                className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all ${
                  hasCheckedIn
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-default'
                    : 'bg-orange-500 hover:bg-orange-400 text-slate-950 shadow-[0_4px_15px_rgba(249,115,22,0.3)] hover:scale-105 active:scale-95'
                }`}
              >
                {hasCheckedIn ? 'Checked In ✓' : 'Claim Daily Check-In'}
              </button>
            </div>

            {/* Streak row indicator */}
            <div className="flex gap-2.5 mt-5">
              {[...Array(7)].map((_, i) => {
                const dayNum = i + 1;
                const isClaimed = dayNum <= streakCount;
                return (
                  <div
                    key={i}
                    className={`flex-1 h-9 rounded-xl flex flex-col justify-center items-center text-[10px] font-black border transition-all duration-300 ${
                      isClaimed
                        ? 'bg-gradient-to-br from-orange-500 to-amber-600 border-orange-500 text-slate-950 scale-105'
                        : 'bg-slate-950/40 border-white/10 text-slate-500'
                    }`}
                  >
                    <span>D{dayNum}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

        </div>
      </main>

      {/* Pillars Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-white/5 bg-slate-950/40 backdrop-blur-sm">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-xs font-black uppercase text-emerald-400 tracking-widest mb-3">
            ALL IN ONE EDUCATION
          </h2>
          <p className="text-3xl font-black text-white tracking-tight">
            Learn Financial Principles By Doing
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:-translate-y-1.5 transition-all duration-300">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 inline-block mb-5">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight mb-2">
              Virtual Trading Feed
            </h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed mb-4">
              Practice trading AAPL, MSFT, and other popular ticker instruments with realtime prices using secure virtual currency.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:-translate-y-1.5 transition-all duration-300">
            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 inline-block mb-5">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight mb-2">
              Gamified Quizzes
            </h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed mb-4">
              Complete structured lessons on compounding interest, stock indices, and macroeconomics. Build streaks to gain rewards.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:-translate-y-1.5 transition-all duration-300">
            <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 inline-block mb-5">
              <Trophy className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight mb-2">
              Badges & Achievements
            </h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed mb-4">
              Level up your rank by making profitable trades, completing quizzes, and achieving top rankings in global leaderboard.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-10 border-t border-white/5 bg-slate-950 text-center text-xs text-slate-500 font-bold">
        <p>© 2026 Trillium Finance. Safe sandbox environment for education purposes only.</p>
      </footer>

    </div>
  );
}
