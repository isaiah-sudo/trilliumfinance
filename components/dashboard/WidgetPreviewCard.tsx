'use client';

import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Table, 
  PieChart as PieIcon, 
  Clock, 
  Trophy, 
  Award, 
  Zap, 
  Flame, 
  Target, 
  Newspaper 
} from 'lucide-react';

interface WidgetPreviewCardProps {
  widgetId: string;
}

export default function WidgetPreviewCard({ widgetId }: WidgetPreviewCardProps) {
  switch (widgetId) {
    case 'portfolio-graph':
      return (
        <div className="w-full h-28 rounded-xl bg-slate-900/90 border border-slate-700/60 p-2.5 flex flex-col justify-between select-none overflow-hidden relative">
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white font-mono">$104,820</span>
              <span className="text-[9px] font-bold text-teal-400 bg-teal-500/20 px-1 py-0.5 rounded flex items-center gap-0.5">
                <TrendingUp className="h-2.5 w-2.5" /> +8.4%
              </span>
            </div>
            <div className="flex items-center gap-1 text-[8px] font-bold text-slate-400">
              <span className="px-1 py-0.5 rounded bg-blue-600 text-white">1D</span>
              <span className="px-1 py-0.5 rounded bg-slate-800">1W</span>
              <span className="px-1 py-0.5 rounded bg-slate-800">1M</span>
            </div>
          </div>
          {/* Realistic SVG sparkline chart */}
          <div className="h-14 w-full relative -mb-1">
            <svg viewBox="0 0 200 60" className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Benchmark comparison dashed line */}
              <path
                d="M 0,42 Q 50,38 100,32 T 200,24"
                fill="none"
                stroke="#64748b"
                strokeWidth="1.2"
                strokeDasharray="2,2"
                opacity="0.6"
              />
              {/* Shaded area */}
              <path
                d="M 0,48 Q 40,52 80,30 T 140,22 T 200,10 L 200,60 L 0,60 Z"
                fill="url(#chartGlow)"
              />
              {/* Main glowing line */}
              <path
                d="M 0,48 Q 40,52 80,30 T 140,22 T 200,10"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="200" cy="10" r="2.5" fill="#38bdf8" />
            </svg>
          </div>
        </div>
      );

    case 'watchlist':
      return (
        <div className="w-full h-28 rounded-xl bg-slate-900/90 border border-slate-700/60 p-2 select-none overflow-hidden flex flex-col justify-between">
          <div className="grid grid-cols-4 text-[8px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1">
            <span>Symbol</span>
            <span className="text-right">Shares</span>
            <span className="text-right">Day P/L</span>
            <span className="text-right">Total</span>
          </div>
          <div className="space-y-1 my-auto">
            <div className="grid grid-cols-4 items-center text-[9px] font-bold">
              <div className="flex items-center gap-1">
                <span className="h-3.5 w-3.5 rounded-full bg-slate-800 flex items-center justify-center text-[7px] text-blue-400">🍎</span>
                <span className="text-white">AAPL</span>
              </div>
              <span className="text-right text-slate-300 font-mono">10</span>
              <span className="text-right text-teal-400 font-mono leading-tight">+1.4%</span>
              <span className="text-right text-teal-400 font-mono leading-tight">+$312</span>
            </div>
            <div className="grid grid-cols-4 items-center text-[9px] font-bold">
              <div className="flex items-center gap-1">
                <span className="h-3.5 w-3.5 rounded-full bg-slate-800 flex items-center justify-center text-[7px] text-emerald-400">⚡</span>
                <span className="text-white">NVDA</span>
              </div>
              <span className="text-right text-slate-300 font-mono">15</span>
              <span className="text-right text-teal-400 font-mono leading-tight">+3.2%</span>
              <span className="text-right text-teal-400 font-mono leading-tight">+$740</span>
            </div>
          </div>
          <div className="text-[8px] font-bold text-blue-400 text-center pt-0.5 border-t border-slate-800/80">
            + Live real-time portfolio pricing
          </div>
        </div>
      );

    case 'account-summary':
      return (
        <div className="w-full h-28 rounded-xl bg-slate-900/90 border border-slate-700/60 p-2 select-none overflow-hidden flex items-center justify-between">
          {/* Mini Donut Chart SVG */}
          <div className="h-20 w-20 relative flex items-center justify-center shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              {/* Background ring */}
              <circle cx="18" cy="18" r="13" fill="none" stroke="#1e293b" strokeWidth="4.5" />
              {/* Stocks arc (blue 68%) */}
              <circle
                cx="18"
                cy="18"
                r="13"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="4.5"
                strokeDasharray="55 100"
                strokeLinecap="round"
              />
              {/* Cash arc (teal 32%) */}
              <circle
                cx="18"
                cy="18"
                r="13"
                fill="none"
                stroke="#2dd4bf"
                strokeWidth="4.5"
                strokeDasharray="24 100"
                strokeDashoffset="-58"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[7px] font-extrabold uppercase text-slate-400">Stocks</span>
              <span className="text-[9px] font-black text-white font-mono">68%</span>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-1.5 pl-2 flex-1">
            <div className="flex items-center justify-between text-[9px] font-bold">
              <span className="flex items-center gap-1 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Stocks
              </span>
              <span className="text-white font-mono">$71,280</span>
            </div>
            <div className="flex items-center justify-between text-[9px] font-bold">
              <span className="flex items-center gap-1 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-teal-400" /> Cash
              </span>
              <span className="text-white font-mono">$33,540</span>
            </div>
            <span className="text-[8px] font-bold text-slate-500 text-right">Scales to full card size</span>
          </div>
        </div>
      );

    case 'recent-trades':
      return (
        <div className="w-full h-28 rounded-xl bg-slate-900/90 border border-slate-700/60 p-2 select-none overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-center text-[8px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1">
            <span>Execution Log</span>
            <span>Recent</span>
          </div>
          <div className="space-y-1 my-auto">
            <div className="flex items-center justify-between text-[9px] font-bold">
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase">BUY</span>
              <span className="text-white font-semibold">AAPL</span>
              <span className="text-slate-400 font-mono">10 @ $185.20</span>
              <span className="text-[8px] text-slate-500">2m ago</span>
            </div>
            <div className="flex items-center justify-between text-[9px] font-bold">
              <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[8px] font-black uppercase">SELL</span>
              <span className="text-white font-semibold">TSLA</span>
              <span className="text-slate-400 font-mono">5 @ $242.10</span>
              <span className="text-[8px] text-slate-500">1h ago</span>
            </div>
          </div>
          <div className="text-[8px] text-slate-400 flex items-center justify-between pt-0.5 border-t border-slate-800">
            <span>Audit trail</span>
            <span className="text-emerald-400 font-bold">Filled Orders</span>
          </div>
        </div>
      );

    case 'leaderboard-rankings':
      return (
        <div className="w-full h-28 rounded-xl bg-slate-900/90 border border-slate-700/60 p-2 select-none overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-center text-[8px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1">
            <span>Global Leaderboard</span>
            <span className="text-amber-400 font-bold">Top Traders</span>
          </div>
          <div className="space-y-1 my-auto">
            <div className="flex items-center justify-between text-[9px] font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
              <span className="text-amber-400">🥇 1. ApexBull</span>
              <span className="text-white font-mono">$184,200</span>
            </div>
            <div className="flex items-center justify-between text-[9px] font-bold px-1.5 py-0.5">
              <span className="text-slate-300">🥈 2. QuantNinja</span>
              <span className="text-slate-300 font-mono">$159,800</span>
            </div>
            <div className="flex items-center justify-between text-[9px] font-bold px-1.5 py-0.5">
              <span className="text-blue-400">🥉 3. You</span>
              <span className="text-blue-400 font-mono">$104,820</span>
            </div>
          </div>
        </div>
      );

    case 'achievements-tracker':
      return (
        <div className="w-full h-28 rounded-xl bg-slate-900/90 border border-slate-700/60 p-2 select-none overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-center text-[8px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1">
            <span>Trophies & XP</span>
            <span className="text-emerald-400 font-bold">Level 4</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 my-auto">
            <div className="p-1 rounded-lg bg-slate-800/80 border border-amber-500/30 flex flex-col items-center text-center">
              <span className="text-xs">🐋</span>
              <span className="text-[7px] font-bold text-amber-300">Whale</span>
              <span className="text-[6px] text-emerald-400 font-bold">+500 XP</span>
            </div>
            <div className="p-1 rounded-lg bg-slate-800/80 border border-blue-500/30 flex flex-col items-center text-center">
              <span className="text-xs">💎</span>
              <span className="text-[7px] font-bold text-blue-300">Diamond</span>
              <span className="text-[6px] text-emerald-400 font-bold">+300 XP</span>
            </div>
            <div className="p-1 rounded-lg bg-slate-800/80 border border-teal-500/30 flex flex-col items-center text-center">
              <span className="text-xs">⚡</span>
              <span className="text-[7px] font-bold text-teal-300">First Trade</span>
              <span className="text-[6px] text-emerald-400 font-bold">+100 XP</span>
            </div>
          </div>
        </div>
      );

    case 'quick-trade':
      return (
        <div className="w-full h-28 rounded-xl bg-slate-900/90 border border-slate-700/60 p-2 select-none overflow-hidden flex flex-col justify-between">
          <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg text-[8px] font-bold">
            <span className="flex-1 text-center py-0.5 rounded bg-emerald-600 text-white font-black">BUY</span>
            <span className="flex-1 text-center py-0.5 rounded text-slate-400">SELL</span>
          </div>
          <div className="flex items-center gap-1.5 my-auto">
            <div className="flex-1 bg-slate-800/90 rounded px-1.5 py-1 text-[9px] font-bold text-white border border-slate-700">
              NVDA
            </div>
            <div className="w-12 bg-slate-800/90 rounded px-1.5 py-1 text-[9px] font-bold text-white text-right border border-slate-700 font-mono">
              10
            </div>
          </div>
          <button className="w-full py-1 rounded bg-blue-600 text-white text-[8px] font-black uppercase tracking-wider shadow-sm">
            Execute Order
          </button>
        </div>
      );

    case 'market-movers':
      return (
        <div className="w-full h-28 rounded-xl bg-slate-900/90 border border-slate-700/60 p-2 select-none overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-center text-[8px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1">
            <span>Market Movers</span>
            <span className="text-teal-400 font-bold">Trending</span>
          </div>
          <div className="space-y-1 my-auto">
            <div className="flex items-center justify-between text-[9px] font-bold">
              <span className="text-white">NVDA</span>
              <span className="text-slate-300 font-mono">$122.40</span>
              <span className="px-1 py-0.5 rounded bg-teal-500/20 text-teal-400 text-[8px] font-mono">+5.8%</span>
            </div>
            <div className="flex items-center justify-between text-[9px] font-bold">
              <span className="text-white">TSLA</span>
              <span className="text-slate-300 font-mono">$242.00</span>
              <span className="px-1 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[8px] font-mono">-3.1%</span>
            </div>
          </div>
          <div className="text-[8px] text-slate-500 text-right">Updated 10s ago</div>
        </div>
      );

    case 'portfolio-goals':
      return (
        <div className="w-full h-28 rounded-xl bg-slate-900/90 border border-slate-700/60 p-2 select-none overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-center text-[8px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1">
            <span>Milestone Goal</span>
            <span className="text-amber-400 font-bold">Target</span>
          </div>
          <div className="my-auto space-y-1.5">
            <div className="flex justify-between text-[9px] font-bold">
              <span className="text-white">$150,000 Portfolio</span>
              <span className="text-teal-400 font-mono">70% Complete</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 via-teal-400 to-emerald-400 rounded-full w-[70%]" />
            </div>
            <div className="flex justify-between text-[7px] text-slate-400 font-semibold">
              <span>$104,820 saved</span>
              <span>$45,180 to go</span>
            </div>
          </div>
        </div>
      );

    case 'financial-news':
      return (
        <div className="w-full h-28 rounded-xl bg-slate-900/90 border border-slate-700/60 p-2 select-none overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-center text-[8px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1">
            <span>Market Wire</span>
            <span className="text-blue-400 font-bold">Live Feed</span>
          </div>
          <div className="space-y-1.5 my-auto">
            <div className="border-l-2 border-blue-500 pl-1.5">
              <p className="text-[8px] font-bold text-white line-clamp-1">Fed holds interest rates as tech continues surge</p>
              <span className="text-[7px] text-slate-400">Bloomberg · 1h ago</span>
            </div>
            <div className="border-l-2 border-slate-700 pl-1.5">
              <p className="text-[8px] font-bold text-slate-300 line-clamp-1">Chip manufacturers report record quarterly demands</p>
              <span className="text-[7px] text-slate-400">Reuters · 3h ago</span>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="w-full h-28 rounded-xl bg-slate-900/90 border border-slate-700/60 p-2.5 flex items-center justify-center text-slate-500 text-xs font-bold">
          Widget Preview
        </div>
      );
  }
}
