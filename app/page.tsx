'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
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

  // Interactive FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const faqs = [
    {
      q: "How does the paper trading simulator work?",
      a: "Trillium Finance matches live market feeds with $100,000 in virtual starting cash. Invest in AAPL, MSFT, and popular indices with absolutely zero financial risk."
    },
    {
      q: "Do I need to pay or link a credit card?",
      a: "No! Trillium Finance is 100% free and educational. We do not support real-money trading, deposit features, or credit card linkages."
    },
    {
      q: "How do streaks and XP rewards benefit me?",
      a: "Completing daily check-ins and financial quests earns you XP. Build your streak to unlock achievements, climb the rankings leaderboard, and showcase your trading mastery to the community."
    }
  ];



  // Seamless gently rolling Stock Market wave coordinates (less jarring curves)
  const staticPoints = [
    150, 153, 158, 162, 165, 163, 158, 152, 146, 142, 145, 150, 156, 163, 170,
    175, 182, 188, 192, 190, 185, 178, 170, 162, 155, 150, 148, 152, 158, 165,
    172, 180, 188, 195, 202, 210, 215, 222, 228, 232, 230, 225, 218, 210, 202,
    195, 188, 180, 172, 165, 158, 152, 148, 145, 142, 146, 152, 158, 163, 165,
    162, 158, 153, 150
  ];

  const minVal = Math.min(...staticPoints);
  const maxVal = Math.max(...staticPoints);
  const range = maxVal - minVal || 1;

  const xs = staticPoints.map((_, index) => (index / (staticPoints.length - 1)) * 1000);
  const ys = staticPoints.map((val) => 400 - ((val - minVal) / range) * 260 - 70);

  const pathD = staticPoints
    .map((val, index) => `${index === 0 ? 'M' : 'L'} ${xs[index]} ${ys[index]}`)
    .join(' ');

  const areaD = `${pathD} L 1000 400 L 0 400 Z`;

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
    <div className="relative min-h-screen overflow-x-hidden bg-slate-950 font-sans text-slate-100 select-none">
      
      {/* Dynamic Glassmorphic Ambient Glows */}
      <div className="absolute top-[-10%] left-[-15%] w-[55%] h-[55%] rounded-full bg-emerald-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[5%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[140px] pointer-events-none" />
      <div className="absolute top-[35%] left-[30%] w-[35%] h-[35%] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

      {/* Floating Glass Header */}
      <header className="relative z-50 max-w-[1700px] mx-auto px-6 py-5 flex items-center justify-between">
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

      {/* Infinite Horizontal Asset Ticker Bar */}
      <div className="w-full bg-slate-950/60 border-y border-white/5 backdrop-blur-md py-2.5 overflow-hidden relative z-40">
        <style>{`
          @keyframes ticker {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
        <div 
          className="flex gap-12 w-[200%] animate-[ticker_35s_linear_infinite]"
          style={{ animation: "ticker 35s linear infinite" }}
        >
          {/* Duplicate sets for seamless loop */}
          {[1, 2].map((setIndex) => (
            <div key={setIndex} className="flex justify-around items-center w-1/2 gap-8 text-xs font-bold text-slate-400">
              <span className="flex items-center gap-2">
                AAPL <span className="text-emerald-400 font-black">$182.50</span> <span className="text-[10px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">+1.24%</span>
              </span>
              <span className="flex items-center gap-2">
                MSFT <span className="text-emerald-400 font-black">$415.60</span> <span className="text-[10px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">+0.85%</span>
              </span>
              <span className="flex items-center gap-2">
                TSLA <span className="text-red-400 font-black">$177.40</span> <span className="text-[10px] text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-md">-2.10%</span>
              </span>
              <span className="flex items-center gap-2">
                BTC <span className="text-emerald-400 font-black">$69,420</span> <span className="text-[10px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">+4.55%</span>
              </span>
              <span className="flex items-center gap-2">
                ETH <span className="text-emerald-400 font-black">$3,812</span> <span className="text-[10px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">+3.12%</span>
              </span>
              <span className="flex items-center gap-2">
                AMZN <span className="text-red-400 font-black">$180.10</span> <span className="text-[10px] text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-md">-0.45%</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <main className="relative z-10 max-w-[1700px] mx-auto px-6 pt-10 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
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

        {/* Right Side: Centered Interactive Sandbox & Education Pillars Backdrop */}
        <div className="lg:col-span-6 flex items-center justify-center relative min-h-[580px] w-full">
          {/* Expanded Box containing the 3 containers, positioned behind the Simulator widgets */}
          <div className="absolute inset-0 grid grid-cols-3 gap-4 opacity-20 pointer-events-none md:opacity-30">
            {/* Card 1: Virtual Trading Feed */}
            <div className="flex flex-col justify-between p-5 rounded-[24px] bg-slate-900/60 border border-emerald-500/10 shadow-xl">
              <div className="flex flex-col items-center text-center my-auto">
                <TrendingUp className="h-6 w-6 text-emerald-400 mb-2" />
                <h3 className="text-[10px] font-black text-white uppercase tracking-wider mb-1">Trading Feed</h3>
                <p className="text-[9px] text-slate-400 font-medium leading-normal hidden md:block">
                  Risk-free simulated portfolio with live market tickers.
                </p>
              </div>
            </div>

            {/* Card 2: Gamified Quizzes */}
            <div className="flex flex-col justify-between p-5 rounded-[24px] bg-slate-900/60 border border-blue-500/10 shadow-xl">
              <div className="flex flex-col items-center text-center my-auto">
                <GraduationCap className="h-6 w-6 text-blue-400 mb-2" />
                <h3 className="text-[10px] font-black text-white uppercase tracking-wider mb-1">Quizzes</h3>
                <p className="text-[9px] text-slate-400 font-medium leading-normal hidden md:block">
                  Compounding interest and financial literacy quests.
                </p>
              </div>
            </div>

            {/* Card 3: Badges & Achievements */}
            <div className="flex flex-col justify-between p-5 rounded-[24px] bg-slate-900/60 border border-purple-500/10 shadow-xl">
              <div className="flex flex-col items-center text-center my-auto">
                <Trophy className="h-6 w-6 text-purple-400 mb-2" />
                <h3 className="text-[10px] font-black text-white uppercase tracking-wider mb-1">Achievements</h3>
                <p className="text-[9px] text-slate-400 font-medium leading-normal hidden md:block">
                  Unlock trophies and climb global rankings.
                </p>
              </div>
            </div>
          </div>

          {/* Foreground Simulator Widget, fully centered */}
          <div className="relative z-10 w-full max-w-[500px] p-6 md:p-8 rounded-[40px] bg-slate-900/85 border border-white/10 backdrop-blur-xl shadow-2xl space-y-6 flex flex-col items-stretch">
            {/* Ambient Background Glow inside the panel */}
            <div className="absolute -inset-px bg-gradient-to-r from-emerald-500/10 via-blue-500/15 to-purple-500/10 rounded-[40px] opacity-100 blur-xl pointer-events-none" />

            <div className="text-center pb-2 border-b border-white/5 relative z-10">
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                Interactive Sandbox Preview
              </span>
            </div>

            {/* Glass Card Widget 1: Mock Trading Transaction Fidget */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg relative z-10"
            >
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black tracking-widest text-emerald-400 uppercase">
                    SIMULATOR WIDGET
                  </span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <span className="text-xs text-slate-400 font-bold">Try Buying AAPL</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-slate-950/40 border border-white/5 rounded-2xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Estimated Cost</div>
                  <div className="text-lg font-black text-white mt-1">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div className="p-3 bg-slate-950/40 border border-white/5 rounded-2xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Virtual Cash Bal</div>
                  <div className="text-lg font-black text-emerald-400 mt-1">${remainingCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
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
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg relative overflow-hidden z-10"
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
                  <div className="text-xl font-black tracking-tight text-white mt-0.5">
                    {xp} <span className="text-xs font-medium text-slate-500">XP</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckIn}
                  disabled={hasCheckedIn}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    hasCheckedIn
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-default'
                      : 'bg-orange-500 hover:bg-orange-400 text-slate-950 shadow-[0_4px_15px_rgba(249,115,22,0.3)] hover:scale-105 active:scale-95'
                  }`}
                >
                  {hasCheckedIn ? 'Checked In ✓' : 'Daily Check-In'}
                </button>
              </div>

              {/* Streak row indicator */}
              <div className="flex gap-1.5 mt-4">
                {[...Array(7)].map((_, i) => {
                  const dayNum = i + 1;
                  const isClaimed = dayNum <= streakCount;
                  return (
                    <div
                      key={i}
                      className={`flex-1 h-8 rounded-lg flex flex-col justify-center items-center text-[9px] font-black border transition-all duration-300 ${
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
        </div>
      </main>

      {/* Stock Market Graph Container (Seamless smooth scrolling ticker with zero empty scroll space) */}
      <div className="relative w-full max-w-[1700px] mx-auto px-6 mb-24 mt-8">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="relative w-full min-h-[60vh] p-8 md:p-16 rounded-[40px] bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/20 backdrop-blur-xl overflow-hidden shadow-[0_0_80px_rgba(16,185,129,0.2)] group flex flex-col justify-between"
        >
          {/* Container background glow */}
          <div className="absolute -inset-px bg-gradient-to-r from-emerald-500/10 via-teal-500/15 to-blue-500/10 rounded-[40px] opacity-100 group-hover:opacity-150 blur-2xl transition-all duration-500 pointer-events-none" />
          
          {/* Seamless Automatic Stock Chart in Background (Hardware-accelerated sliding divs) */}
          <div className="absolute inset-0 z-0 opacity-45 group-hover:opacity-65 transition-opacity duration-500 pointer-events-none overflow-hidden">
            {/* Inject CSS rule for smooth sliding keyframes */}
            <style>{`
              @keyframes slideChart {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
            `}</style>
            
            <div 
              className="flex w-[200%] h-full"
              style={{
                animation: "slideChart 65s linear infinite"
              }}
            >
              {/* First Half */}
              <svg className="w-1/2 h-full" viewBox="0 0 1000 400" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="50%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
                
                {/* Area Gradient Fill */}
                <path d={areaD} fill="url(#chartGrad)" />
                
                {/* Smooth stock wave path */}
                <path 
                  d={pathD} 
                  fill="none" 
                  stroke="url(#lineGrad)" 
                  strokeWidth="4.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />

                {/* Decorative pulsing nodes */}
                <g>
                  <circle cx={xs[14]} cy={ys[14]} r="8" fill="#10b981" className="animate-ping" style={{ transformOrigin: `${xs[14]}px ${ys[14]}px` }} />
                  <circle cx={xs[14]} cy={ys[14]} r="5" fill="#3b82f6" />

                  <circle cx={xs[38]} cy={ys[38]} r="8" fill="#10b981" className="animate-ping" style={{ transformOrigin: `${xs[38]}px ${ys[38]}px` }} />
                  <circle cx={xs[38]} cy={ys[38]} r="5" fill="#3b82f6" />
                </g>
              </svg>

              {/* Second Half (Exact duplicate for seamless looping transition) */}
              <svg className="w-1/2 h-full" viewBox="0 0 1000 400" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradDup" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="lineGradDup" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="50%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
                
                {/* Area Gradient Fill */}
                <path d={areaD} fill="url(#chartGradDup)" />
                
                {/* Smooth stock wave path */}
                <path 
                  d={pathD} 
                  fill="none" 
                  stroke="url(#lineGradDup)" 
                  strokeWidth="4.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />

                {/* Decorative pulsing nodes */}
                <g>
                  <circle cx={xs[14]} cy={ys[14]} r="8" fill="#10b981" className="animate-ping" style={{ transformOrigin: `${xs[14]}px ${ys[14]}px` }} />
                  <circle cx={xs[14]} cy={ys[14]} r="5" fill="#3b82f6" />

                  <circle cx={xs[38]} cy={ys[38]} r="8" fill="#10b981" className="animate-ping" style={{ transformOrigin: `${xs[38]}px ${ys[38]}px` }} />
                  <circle cx={xs[38]} cy={ys[38]} r="5" fill="#3b82f6" />
                </g>
              </svg>
            </div>
          </div>

          {/* Foreground content */}
          <div className="relative z-10 flex flex-col items-center text-center justify-center my-auto max-w-3xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-4.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-bold border border-emerald-500/20 backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" /> Interactive Ecosystem
            </div>
            
            <h2 className="text-5xl md:text-7xl font-black tracking-tight text-white">
              Trillium <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500">Finance</span>
            </h2>
            
            <p className="text-slate-200 text-xl md:text-3xl font-extrabold leading-relaxed tracking-wide">
              Gamified Financial literacy for all ages, where you have fun while learning
            </p>

              <div className="flex gap-4 items-center pt-4">
                <Link href="/signup">
                  <Button className="px-8 py-3.5 text-base rounded-2xl bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-400 hover:to-blue-400 text-slate-950 font-black transition-all shadow-lg active:scale-95">
                    Join Now <ChevronRight className="h-5 w-5 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* FAQ Accordion Section (Interactive element that makes it look more professional) */}
        <section className="relative z-10 max-w-[1200px] mx-auto px-6 py-20 border-t border-white/5 bg-slate-950/40 backdrop-blur-sm [perspective:1200px]">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-xs font-black uppercase text-blue-400 tracking-widest mb-3">
              QUESTIONS & ANSWERS
            </h2>
            <p className="text-3xl font-black text-white tracking-tight">
              Frequently Asked Questions
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div 
                  key={index}
                  className={`rounded-2xl border-2 border-white/10 bg-[#0b0f19]/80 backdrop-blur-md overflow-hidden transition-all duration-300 ${
                    isOpen 
                      ? 'shadow-[2px_2px_0px_rgba(16,185,129,0.3)] translate-x-[2px] translate-y-[2px] border-emerald-500/30' 
                      : 'shadow-[6px_6px_0px_rgba(255,255,255,0.06)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[8px_8px_0px_rgba(16,185,129,0.2)] hover:border-emerald-500/20'
                  }`}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex justify-between items-center p-6 text-left font-bold text-white hover:bg-white/5 transition-colors"
                  >
                    <span className="text-base font-black tracking-tight">{faq.q}</span>
                    <span className={`text-xs text-emerald-400 font-black px-3 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 transform transition-all duration-300 ${isOpen ? 'rotate-180 bg-emerald-500 text-slate-950 border-emerald-500' : ''}`}>
                      ▼
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0, rotateX: -90 }}
                        animate={{ height: "auto", opacity: 1, rotateX: 0 }}
                        exit={{ height: 0, opacity: 0, rotateX: -90 }}
                        transition={{ 
                          height: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                          opacity: { duration: 0.2 },
                          rotateX: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
                        }}
                        style={{ transformOrigin: "top", transformStyle: "preserve-3d" }}
                      >
                        <div className="p-6 pt-2 text-sm text-slate-400 border-t border-white/5 bg-slate-950/45 leading-relaxed font-medium">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 py-10 border-t border-white/5 bg-slate-950 text-center text-xs text-slate-500 font-bold">
          <p>© 2026 Trillium Finance. Safe sandbox environment for education purposes only.</p>
        </footer>

    </div>
  );
}
