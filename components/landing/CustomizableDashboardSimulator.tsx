'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  GripVertical,
  Maximize2,
  Minimize2,
  Plus,
  X,
  TrendingUp,
  LineChart,
  PieChart,
  Trophy,
  Flame,
  Newspaper,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Sliders,
  Palette
} from 'lucide-react';

export type ThemeKey = 'emerald' | 'sapphire' | 'violet' | 'gold';
export type WidgetSize = 'S' | 'M' | 'L';

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'watchlist' | 'allocation' | 'leaderboard' | 'quests' | 'news' | 'risk';
  title: string;
  size: WidgetSize;
}

const ALL_AVAILABLE_WIDGETS: Array<{
  type: DashboardWidget['type'];
  title: string;
  description: string;
  defaultSize: WidgetSize;
  icon: any;
}> = [
  {
    type: 'chart',
    title: 'Portfolio Performance Chart',
    description: 'Interactive real-time equity growth curve with multi-timeframe filters.',
    defaultSize: 'M',
    icon: LineChart
  },
  {
    type: 'watchlist',
    title: 'Live Stock & Crypto Watchlist',
    description: 'Real-time equity quotes with 24h gainers and company logo badges.',
    defaultSize: 'S',
    icon: TrendingUp
  },
  {
    type: 'allocation',
    title: 'Asset Allocation Breakdown',
    description: 'Interactive donut breakdown across Equities, Fixed Income, and Cash.',
    defaultSize: 'S',
    icon: PieChart
  },
  {
    type: 'leaderboard',
    title: 'Classroom Trader Leaderboard',
    description: 'Ranked podium showcasing top performers, win rates, and XP.',
    defaultSize: 'S',
    icon: Trophy
  },
  {
    type: 'quests',
    title: 'Daily Streak & Quest Log',
    description: 'Interactive gamified financial literacy quests with XP claims.',
    defaultSize: 'S',
    icon: Flame
  },
  {
    type: 'news',
    title: 'Finnhub AI Market Pulse',
    description: 'Live sentiment index and real-time financial headlines.',
    defaultSize: 'M',
    icon: Newspaper
  },
  {
    type: 'risk',
    title: 'Risk & Volatility Radar',
    description: 'Sharpe ratio, portfolio beta, and drawdown risk assessment meter.',
    defaultSize: 'S',
    icon: ShieldCheck
  }
];

const PRESET_LAYOUTS: Record<string, DashboardWidget[]> = {
  trader: [
    { id: 'w-chart', type: 'chart', title: 'Portfolio Performance Chart', size: 'M' },
    { id: 'w-watch', type: 'watchlist', title: 'Live Stock & Crypto Watchlist', size: 'S' },
    { id: 'w-news', type: 'news', title: 'Finnhub AI Market Pulse', size: 'M' },
    { id: 'w-risk', type: 'risk', title: 'Risk & Volatility Radar', size: 'S' }
  ],
  investor: [
    { id: 'w-chart', type: 'chart', title: 'Portfolio Performance Chart', size: 'M' },
    { id: 'w-alloc', type: 'allocation', title: 'Asset Allocation Breakdown', size: 'S' },
    { id: 'w-risk', type: 'risk', title: 'Risk & Volatility Radar', size: 'S' },
    { id: 'w-watch', type: 'watchlist', title: 'Live Stock & Crypto Watchlist', size: 'M' }
  ],
  gamified: [
    { id: 'w-quests', type: 'quests', title: 'Daily Streak & Quest Log', size: 'S' },
    { id: 'w-lead', type: 'leaderboard', title: 'Classroom Trader Leaderboard', size: 'S' },
    { id: 'w-chart', type: 'chart', title: 'Portfolio Performance Chart', size: 'M' },
    { id: 'w-watch', type: 'watchlist', title: 'Live Stock & Crypto Watchlist', size: 'S' }
  ]
};

const THEME_CONFIG: Record<
  ThemeKey,
  {
    label: string;
    border: string;
    glow: string;
    accent: string;
    badgeBg: string;
    activeTab: string;
    gradient: string;
  }
> = {
  emerald: {
    label: 'Emerald Neon',
    border: 'border-emerald-500/40 hover:border-emerald-400',
    glow: 'shadow-[0_0_30px_rgba(16,185,129,0.2)]',
    accent: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
    activeTab: 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]',
    gradient: 'from-emerald-500/20 to-teal-500/10'
  },
  sapphire: {
    label: 'Cyber Sapphire',
    border: 'border-blue-500/40 hover:border-blue-400',
    glow: 'shadow-[0_0_30px_rgba(59,130,246,0.2)]',
    accent: 'text-blue-400',
    badgeBg: 'bg-blue-500/15 border-blue-500/30 text-blue-300',
    activeTab: 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]',
    gradient: 'from-blue-500/20 to-cyan-500/10'
  },
  violet: {
    label: 'Ultra Amethyst',
    border: 'border-purple-500/40 hover:border-purple-400',
    glow: 'shadow-[0_0_30px_rgba(168,85,247,0.2)]',
    accent: 'text-purple-400',
    badgeBg: 'bg-purple-500/15 border-purple-500/30 text-purple-300',
    activeTab: 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]',
    gradient: 'from-purple-500/20 to-fuchsia-500/10'
  },
  gold: {
    label: 'Sunset Gold',
    border: 'border-amber-500/40 hover:border-amber-400',
    glow: 'shadow-[0_0_30px_rgba(245,158,11,0.2)]',
    accent: 'text-amber-400',
    badgeBg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
    activeTab: 'bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]',
    gradient: 'from-amber-500/20 to-orange-500/10'
  }
};

export default function CustomizableDashboardSimulator() {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(PRESET_LAYOUTS.trader);
  const [theme, setTheme] = useState<ThemeKey>('emerald');
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [questCompleted, setQuestCompleted] = useState<Record<string, boolean>>({ q1: true, q2: false, q3: false });
  const [chartTimeframe, setChartTimeframe] = useState<'1W' | '1M' | '1Y'>('1M');
  const [activeAllocSlice, setActiveAllocSlice] = useState<string | null>(null);

  const currentTheme = THEME_CONFIG[theme];

  // Available widgets that can still be added
  const availableToAdd = useMemo(() => {
    return ALL_AVAILABLE_WIDGETS.filter((w) => !widgets.some((active) => active.type === w.type));
  }, [widgets]);

  const handleAddWidget = (type: DashboardWidget['type']) => {
    const info = ALL_AVAILABLE_WIDGETS.find((w) => w.type === type);
    if (!info) return;
    const newWidget: DashboardWidget = {
      id: `w-${type}-${Date.now()}`,
      type: info.type,
      title: info.title,
      size: info.defaultSize
    };
    setWidgets((prev) => [...prev, newWidget]);
    setIsAddMenuOpen(false);
  };

  const handleRemoveWidget = (id: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
  };

  const handleToggleSize = (id: string, newSize: WidgetSize) => {
    setWidgets((prev) => prev.map((w) => (w.id === id ? { ...w, size: newSize } : w)));
  };

  const handleLoadPreset = (presetKey: string) => {
    if (PRESET_LAYOUTS[presetKey]) {
      setWidgets([...PRESET_LAYOUTS[presetKey]]);
    }
  };

  // Render Mini-Widget Content Preview
  const renderWidgetContent = (widget: DashboardWidget) => {
    switch (widget.type) {
      case 'chart': {
        const chartPoints =
          chartTimeframe === '1W'
            ? [12100, 12250, 12180, 12380, 12450.8]
            : chartTimeframe === '1M'
            ? [11400, 11650, 11520, 11900, 12150, 12050, 12450.8]
            : [9800, 10400, 10900, 11200, 11800, 12450.8];
        const minP = Math.min(...chartPoints) * 0.99;
        const maxP = Math.max(...chartPoints) * 1.01;
        const rangeP = maxP - minP || 1;
        const pts = chartPoints.map((val, idx) => {
          const x = (idx / (chartPoints.length - 1)) * 360;
          const y = 85 - ((val - minP) / rangeP) * 60;
          return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ');

        return (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xl font-black text-white font-mono">$12,450.80</span>
                <span className="text-xs font-bold text-emerald-400 ml-2">+$1,450.80 (+13.2%)</span>
              </div>
              <div className="flex bg-slate-950/80 rounded-lg p-0.5 border border-white/10 text-[10px]">
                {(['1W', '1M', '1Y'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setChartTimeframe(tf)}
                    className={`px-2 py-0.5 rounded font-black transition-all ${
                      chartTimeframe === tf ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-24 w-full relative overflow-hidden rounded-xl bg-slate-950/40 p-1 border border-white/5">
              <svg viewBox="0 0 360 85" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="widget-chart-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d={`${pts} L 360 85 L 0 85 Z`} fill="url(#widget-chart-grad)" />
                <path d={pts} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        );
      }

      case 'watchlist': {
        const miniQuotes = [
          { sym: 'NVDA', name: 'Nvidia', price: 124.5, chg: 5.4 },
          { sym: 'AAPL', name: 'Apple', price: 189.45, chg: 3.82 },
          { sym: 'TSLA', name: 'Tesla', price: 248.2, chg: -1.65 }
        ];

        return (
          <div className="space-y-1.5">
            {miniQuotes.map((q) => (
              <div
                key={q.sym}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-950/40 border border-white/5 hover:border-white/15 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-white/10 flex items-center justify-center font-black text-[10px] text-white">
                    {q.sym.slice(0, 2)}
                  </div>
                  <div>
                    <div className="text-xs font-black text-white leading-none">{q.sym}</div>
                    <div className="text-[9px] text-slate-400">{q.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold font-mono text-white">${q.price.toFixed(2)}</div>
                  <div className={`text-[10px] font-bold ${q.chg >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {q.chg >= 0 ? '+' : ''}
                    {q.chg}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      }

      case 'allocation': {
        const slices = [
          { name: 'Equities', pct: 60, color: '#10b981' },
          { name: 'Fixed Income', pct: 25, color: '#3b82f6' },
          { name: 'Cash', pct: 15, color: '#a855f7' }
        ];

        return (
          <div className="flex items-center justify-between gap-3">
            {/* Mini SVG Donut Chart */}
            <div className="relative h-20 w-20 shrink-0">
              <svg viewBox="0 0 40 40" className="w-full h-full -rotate-90">
                <circle cx="20" cy="20" r="15.915" fill="none" stroke="#a855f7" strokeWidth="6" strokeDasharray="15 85" strokeDashoffset="0" />
                <circle cx="20" cy="20" r="15.915" fill="none" stroke="#3b82f6" strokeWidth="6" strokeDasharray="25 75" strokeDashoffset="-15" />
                <circle cx="20" cy="20" r="15.915" fill="none" stroke="#10b981" strokeWidth="6" strokeDasharray="60 40" strokeDashoffset="-40" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white font-mono">
                100%
              </div>
            </div>

            <div className="flex-1 space-y-1 text-xs">
              {slices.map((s) => (
                <div
                  key={s.name}
                  onMouseEnter={() => setActiveAllocSlice(s.name)}
                  onMouseLeave={() => setActiveAllocSlice(null)}
                  className="flex items-center justify-between p-1 rounded-md hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-slate-300 text-[11px] font-medium">{s.name}</span>
                  </div>
                  <span className="text-white font-mono font-bold text-[11px]">{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'leaderboard': {
        const leaders = [
          { rank: 1, user: 'Alex_V', roi: '+42.8%', streak: '14d', color: 'text-amber-300 bg-amber-400/15 border-amber-400/30' },
          { rank: 2, user: 'Sarah_Trader', roi: '+31.4%', streak: '9d', color: 'text-slate-200 bg-slate-300/15 border-slate-300/30' },
          { rank: 3, user: 'CryptoKai', roi: '+26.2%', streak: '7d', color: 'text-amber-500 bg-amber-600/15 border-amber-600/30' }
        ];

        return (
          <div className="space-y-1.5">
            {leaders.map((l) => (
              <div
                key={l.user}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-950/40 border border-white/5 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md border font-mono ${l.color}`}>
                    #{l.rank}
                  </span>
                  <span className="font-bold text-white text-xs">{l.user}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-amber-400 font-bold bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 flex items-center gap-1">
                    <Flame className="h-3 w-3 text-amber-400" />
                    {l.streak}
                  </span>
                  <span className="font-mono font-black text-emerald-400 text-xs">{l.roi}</span>
                </div>
              </div>
            ))}
          </div>
        );
      }

      case 'quests': {
        const questList = [
          { id: 'q1', text: 'Execute 1st Virtual Trade', xp: 50 },
          { id: 'q2', text: 'Read Finnhub AI Sentiment', xp: 25 },
          { id: 'q3', text: 'Hold AAPL through Market Close', xp: 75 }
        ];

        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-white/5">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-amber-400" />
                7-Day Active Streak
              </span>
              <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Level 4
              </span>
            </div>

            <div className="space-y-1.5">
              {questList.map((q) => {
                const isDone = questCompleted[q.id];
                return (
                  <button
                    key={q.id}
                    onClick={() => setQuestCompleted((prev) => ({ ...prev, [q.id]: !prev[q.id] }))}
                    className={`w-full flex items-center justify-between p-2 rounded-xl border text-xs font-medium transition-all text-left cursor-pointer ${
                      isDone
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-slate-950/40 border-white/5 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        className={`h-3.5 w-3.5 shrink-0 ${isDone ? 'text-emerald-400' : 'text-slate-600'}`}
                      />
                      <span className={`text-[11px] ${isDone ? 'line-through opacity-80' : ''}`}>{q.text}</span>
                    </div>
                    <span className="text-[10px] font-black text-amber-400 font-mono">+{q.xp} XP</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'news': {
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-white/5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Sentiment: <strong className="text-emerald-400 font-black">Bullish (82%)</strong>
              </div>
              <span className="text-[10px] text-slate-500">Updated 2m ago</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/50 border border-white/5 space-y-1">
              <div className="text-[10px] font-black text-blue-400 uppercase tracking-wider">Fed Rate Expectations</div>
              <p className="text-xs font-semibold text-slate-200 leading-snug">
                Markets rally as consumer confidence surges past expectations; tech sector leads equities.
              </p>
            </div>
          </div>
        );
      }

      case 'risk': {
        return (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-medium">Portfolio Volatility Score</span>
              <span className="text-xs font-black text-emerald-400 font-mono">Low (0.78 Beta)</span>
            </div>

            {/* Risk Gauge Bar */}
            <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden relative border border-white/10">
              <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-rose-500 w-full" />
              <div className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_8px_#fff]" style={{ left: '32%' }} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-1.5 rounded-lg bg-slate-950/40 border border-white/5">
                <span className="text-[9px] text-slate-400 font-bold block">SHARPE RATIO</span>
                <span className="text-white font-mono font-black">2.41 (Excellent)</span>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-950/40 border border-white/5">
                <span className="text-[9px] text-slate-400 font-bold block">MAX DRAWDOWN</span>
                <span className="text-emerald-400 font-mono font-black">-4.8%</span>
              </div>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="w-full relative rounded-3xl p-5 sm:p-7 md:p-8 glass-card-premium border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.6)] overflow-hidden">
      {/* Dynamic Ambient Theme Glow */}
      <div
        className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[120px] pointer-events-none transition-all duration-700 ${
          theme === 'emerald'
            ? 'bg-emerald-500/15'
            : theme === 'sapphire'
            ? 'bg-blue-500/15'
            : theme === 'violet'
            ? 'bg-purple-500/15'
            : 'bg-amber-500/15'
        }`}
      />

      {/* Header Bar with Studio Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-400 text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            Interactive Workspace Studio
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Customizable Dashboard Simulator
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Fluid drag reordering, resizable modular glass panels, and instant 1-click presets.
          </p>
        </div>

        {/* Studio Theme Switcher & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Theme Selector */}
          <div className="flex items-center bg-slate-950/70 p-1 rounded-xl border border-white/10">
            {(['emerald', 'sapphire', 'violet', 'gold'] as ThemeKey[]).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  theme === t
                    ? THEME_CONFIG[t].activeTab
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Reset Button */}
          <button
            onClick={() => setWidgets(PRESET_LAYOUTS.trader)}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Reset Dashboard Layout"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Control Bar: Layout Presets & Add Widget Pill Tray */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-4 border-b border-white/5 relative z-10">
        {/* Preset Tabs */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 hidden xs:inline">
            Presets:
          </span>
          <div className="flex items-center gap-1.5 bg-slate-950/50 p-1 rounded-xl border border-white/10">
            {[
              { id: 'trader', label: 'Day Trader' },
              { id: 'investor', label: 'Balanced Growth' },
              { id: 'gamified', label: 'Quest Hunter' }
            ].map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleLoadPreset(preset.id)}
                className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Add Widget Button */}
        <div className="relative">
          <button
            onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
            disabled={availableToAdd.length === 0}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
              availableToAdd.length === 0
                ? 'bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-105'
            }`}
          >
            <Plus className="h-3.5 w-3.5 stroke-[3]" />
            Add Widget ({availableToAdd.length})
          </button>

          {/* Add Widget Dropdown Popover */}
          <AnimatePresence>
            {isAddMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute right-0 top-10 w-72 p-3 rounded-2xl bg-slate-900/95 border border-white/20 shadow-2xl backdrop-blur-2xl z-50 space-y-1.5"
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-xs font-bold text-white">Select Widget to Insert</span>
                  <button
                    onClick={() => setIsAddMenuOpen(false)}
                    className="text-slate-400 hover:text-white p-0.5 rounded"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                  {availableToAdd.map((w) => {
                    const Icon = w.icon;
                    return (
                      <button
                        key={w.type}
                        onClick={() => handleAddWidget(w.type)}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-white/10 transition-colors flex items-start gap-2.5 cursor-pointer group"
                      >
                        <div className="h-7 w-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-emerald-300">
                            {w.title}
                          </div>
                          <div className="text-[10px] text-slate-400 leading-tight line-clamp-1">
                            {w.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Smooth Drag-and-Drop Grid Workspace */}
      <div className="pt-5 relative z-10">
        <Reorder.Group
          axis="y"
          values={widgets}
          onReorder={setWidgets}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence>
            {widgets.map((widget) => {
              const spanClass =
                widget.size === 'L'
                  ? 'col-span-1 md:col-span-2 lg:col-span-3'
                  : widget.size === 'M'
                  ? 'col-span-1 md:col-span-2'
                  : 'col-span-1';

              return (
                <Reorder.Item
                  key={widget.id}
                  value={widget}
                  className={`${spanClass}`}
                  whileDrag={{
                    scale: 1.03,
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                    zIndex: 50
                  }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                >
                  <div
                    className={`h-full p-4 sm:p-5 rounded-2xl bg-slate-900/80 border ${currentTheme.border} ${currentTheme.glow} backdrop-blur-xl shadow-lg transition-all duration-300 flex flex-col justify-between group/card`}
                  >
                    {/* Widget Header Bar */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3 gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                          title="Drag to reorder widget"
                        >
                          <GripVertical className="h-4 w-4" />
                        </div>
                        <h4 className="text-xs font-black text-white truncate tracking-tight">
                          {widget.title}
                        </h4>
                      </div>

                      {/* Size Buttons & Remove Action */}
                      <div className="flex items-center gap-1 shrink-0">
                        <div className="flex items-center bg-slate-950/80 rounded-lg p-0.5 border border-white/10 text-[9px] font-black">
                          {(['S', 'M', 'L'] as WidgetSize[]).map((sz) => (
                            <button
                              key={sz}
                              onClick={() => handleToggleSize(widget.id, sz)}
                              className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                                widget.size === sz
                                  ? 'bg-emerald-500 text-slate-950 font-black'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() => handleRemoveWidget(widget.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Remove Widget"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Widget Core Body */}
                    <div className="flex-1 py-1">{renderWidgetContent(widget)}</div>
                  </div>
                </Reorder.Item>
              );
            })}
          </AnimatePresence>
        </Reorder.Group>

        {widgets.length === 0 && (
          <div className="py-16 text-center rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-6 space-y-3">
            <Layers className="h-8 w-8 text-slate-500 mx-auto" />
            <div className="text-sm font-bold text-slate-300">All widgets removed from canvas</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click "+ Add Widget" above or select a preset layout to restore your customizable workstation.
            </p>
            <button
              onClick={() => setWidgets(PRESET_LAYOUTS.trader)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer"
            >
              Restore Default Workspace
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
