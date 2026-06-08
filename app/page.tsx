'use client';

import Link from 'next/link';
import { Button } from '@/components/ui';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  TrendingUp, 
  BookOpen, 
  Trophy, 
  Shield, 
  GraduationCap, 
  Zap, 
  ChevronRight,
  Sparkles,
  TreePine,
  LineChart
} from 'lucide-react';
import { useState } from 'react';

export default function LandingPage() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const features = [
    {
      icon: <TrendingUp className="h-6 w-6 text-blue-500" />,
      title: "Realtime Market Simulation",
      description: "Trade top companies using virtual cash. Track performance against real indices without financial risk.",
      color: "from-blue-500/10 to-cyan-500/10",
      borderColor: "group-hover:border-blue-500/50"
    },
    {
      icon: <GraduationCap className="h-6 w-6 text-emerald-500" />,
      title: "Gamified Education",
      description: "Learn financial fundamentals, complete structured quizzes, and unlock achievements along your journey.",
      color: "from-emerald-500/10 to-teal-500/10",
      borderColor: "group-hover:border-emerald-500/50"
    },
    {
      icon: <Trophy className="h-6 w-6 text-amber-500" />,
      title: "Achievements & Leaderboards",
      description: "Collect legendary trophy badges, build login streaks, level up your portfolio, and top the global charts.",
      color: "from-amber-500/10 to-orange-500/10",
      borderColor: "group-hover:border-amber-500/50"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f111a] text-slate-800 dark:text-slate-200 relative overflow-hidden font-sans">
      
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-[-10%] left-[-20%] w-[60%] h-[60%] rounded-full bg-blue-900/15 dark:bg-blue-900/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-900/10 dark:bg-emerald-900/5 blur-[130px] pointer-events-none" />
      <div className="absolute top-[40%] left-[40%] w-[40%] h-[40%] rounded-full bg-fuchsia-900/5 dark:bg-fuchsia-900/5 blur-[120px] pointer-events-none" />

      {/* Floating Header */}
      <header className="relative z-50 w-full md:max-w-[90%] lg:max-w-[80%] mx-auto px-4 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            <TreePine className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-black text-slate-900 dark:text-white tracking-wide">
            Trillium <span className="text-blue-500">Finance</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/signup">
            <button className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:translate-y-[2px] active:shadow-inner text-white text-xs font-bold transition-all shadow-[0_4px_12px_rgba(59,130,246,0.25)]">
              Get Started
            </button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 w-full md:max-w-[90%] lg:max-w-[80%] mx-auto px-4 pt-16 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side: Call to Action */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-black uppercase tracking-wider mb-6 border border-blue-500/20"
          >
            <Sparkles className="h-3 w-3 animate-spin [animation-duration:10s]" /> Virtual Trading & Learning Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]"
          >
            Empowering the Next Generation of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 dark:to-emerald-300">Investors</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-xl"
          >
            Trillium Finance blends virtual stock trading, real-time analytics, and gamified finance lessons. Build a portfolio, complete challenges, win interactive trophy badges, and test your knowledge safely.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-4 items-center"
          >
            <Link href="/signup">
              <button className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 active:translate-y-[2px] active:shadow-inner text-white font-bold transition-all shadow-[0_5px_0_0_#2563eb] dark:shadow-[0_5px_0_0_#1d4ed8] border border-blue-500">
                Create Free Account <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
            
            <Link href="/edu/auth">
              <button className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-white dark:bg-[#1a2133] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition-all shadow-[0_5px_0_0_#e2e8f0] dark:shadow-[0_5px_0_0_#111622] active:translate-y-[2px]">
                Education Portal <GraduationCap className="h-4 w-4 text-emerald-500" />
              </button>
            </Link>
          </motion.div>
        </div>

        {/* Right Side: Interactive Mock Dashboard Preview */}
        <div className="lg:col-span-5 relative flex justify-center items-center">
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-md p-6 rounded-3xl bg-white/95 dark:bg-[#1a2133]/95 border border-slate-200 dark:border-slate-700/60 shadow-[0_8px_0_0_#cbd5e1] dark:shadow-[0_8px_0_0_#121622] relative overflow-hidden group/card transition-all duration-300 hover:-translate-y-1"
          >
            {/* Header info */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-500 text-[10px] font-black tracking-wider uppercase">
                  Mock Portfolio
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <span className="text-[10px] font-bold text-slate-400">DEMO PANEL</span>
            </div>

            {/* Main Stats */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0f111a]/40 border border-slate-200/50 dark:border-slate-800/30 shadow-[0_4px_0_0_#e2e8f0] dark:shadow-[0_4px_0_0_#0f111a]">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Net Worth</div>
                <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">$102,480.00</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0f111a]/40 border border-slate-200/50 dark:border-slate-800/30 shadow-[0_4px_0_0_#e2e8f0] dark:shadow-[0_4px_0_0_#0f111a]">
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Available Cash</div>
                  <div className="text-base font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">$50,000.00</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0f111a]/40 border border-slate-200/50 dark:border-slate-800/30 shadow-[0_4px_0_0_#e2e8f0] dark:shadow-[0_4px_0_0_#0f111a]">
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Performance</div>
                  <div className="text-base font-extrabold text-emerald-500 mt-0.5">+4.8%</div>
                </div>
              </div>
            </div>

            {/* Interactive mini asset tickers */}
            <div className="mt-6 space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800/60">
              <div className="flex justify-between items-center p-2 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 font-extrabold flex items-center justify-center text-xs">AAPL</div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Apple Inc.</span>
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white">$182.40</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-green-500/10 text-green-500 font-extrabold flex items-center justify-center text-xs">MSFT</div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Microsoft</span>
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white">$415.50</span>
              </div>
            </div>

            {/* Ambient inner card gradients */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl pointer-events-none group-hover/card:bg-blue-500/10 transition-colors duration-300" />
          </motion.div>
        </div>

      </section>

      {/* Dynamic Interactive Features Grid */}
      <section className="relative z-10 w-full md:max-w-[90%] lg:max-w-[80%] mx-auto px-4 py-12">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-xs font-black uppercase text-blue-500 tracking-widest mb-3">All In One Workspace</h2>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Everything you need to master financial literacy</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              onMouseEnter={() => setHoveredCard(idx)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`p-6 rounded-3xl bg-white dark:bg-[#1a2133] border border-slate-200 dark:border-slate-800 shadow-[0_5px_0_0_#e2e8f0] dark:shadow-[0_5px_0_0_#111622] transition-all duration-300 hover:-translate-y-1.5 flex flex-col items-start text-left relative overflow-hidden group`}
            >
              <div className={`p-3 rounded-2xl bg-gradient-to-r ${feature.color} mb-5 border border-slate-100 dark:border-slate-700/30 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-2 group-hover:text-blue-500 transition-colors duration-200">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-4">
                {feature.description}
              </p>
              
              <div className="mt-auto flex items-center gap-1 text-xs font-bold text-blue-500 tracking-wide cursor-pointer opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200">
                Explore tab <ChevronRight className="h-3 w-3" />
              </div>
              
              {/* Highlight background lines */}
              <div className="absolute right-0 bottom-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer Info */}
      <footer className="relative z-10 py-12 border-t border-slate-200 dark:border-slate-800/80 mt-12 bg-white/40 dark:bg-[#1a2133]/20 backdrop-blur-sm text-center text-xs font-semibold text-slate-400 dark:text-slate-500">
        <div className="w-full md:max-w-[90%] lg:max-w-[80%] mx-auto px-4">
          <p>© 2026 Trillium Finance. Made for interactive education and trading simulation.</p>
        </div>
      </footer>

    </div>
  );
}
