'use client';

import React, { useEffect, useState, useMemo } from 'react';
import PortfolioChart from '@/components/PortfolioChart';
import { Trophy, Rocket, Gem, Crown, PieChart as PieIcon, Zap, Medal, Lock, CheckCircle2, ShieldAlert, ArrowUpRight, ArrowDownRight, RefreshCw, Flame, Award, LineChart, Wallet, BookOpen, User, DollarSign, Activity, Percent, Sparkles, TrendingUp, Newspaper, Target, Layers } from 'lucide-react';
import { getLeaderboard, LeaderboardEntry } from '@/app/actions/leaderboard';
import { ACHIEVEMENTS, getUserAchievements } from '@/app/actions/achievements';
import { AnimatedNumber } from '@/components/ui';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export interface WidgetComponentProps {
  portfolio: any;
  chartData: { portfolio: any[]; benchmark: any[] } | null;
  timeRange: '1D' | '1W' | '1M' | '1Y';
  setTimeRange: (tr: '1D' | '1W' | '1M' | '1Y') => void;
  hoveredData: any;
  setHoveredData: (d: any) => void;
  handleLookAchievement: (id: string) => void;
  numberFont: string;
  onOpenTradeModal: () => void;
  borrowedAmountJustNow: number;
}

// 1. Portfolio Performance Graph Widget
export function PortfolioGraphWidget({
  chartData,
  timeRange,
  setTimeRange,
  setHoveredData,
  handleLookAchievement,
}: WidgetComponentProps) {
  return (
    <div className="h-full flex flex-col justify-between">
      <PortfolioChart
        data={chartData || { portfolio: [], benchmark: [] }}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        onHover={setHoveredData}
        onLookAchievement={handleLookAchievement}
      />
    </div>
  );
}

// 2. Live Stock Watchlist / Holdings Widget
export function WatchlistWidget({ portfolio, numberFont, onOpenTradeModal }: WidgetComponentProps) {
  const holdings = portfolio?.holdings || [];

  return (
    <div className="h-full flex flex-col justify-between space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-semibold whitespace-nowrap">
          <thead className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="pb-2 pr-3 font-bold uppercase tracking-wider text-[10px]">Symbol</th>
              <th className={`pb-2 px-3 font-bold uppercase tracking-wider text-[10px] text-right font-num-${numberFont}`}>Shares</th>
              <th className={`pb-2 px-3 font-bold uppercase tracking-wider text-[10px] text-right font-num-${numberFont}`}>Cur. Price</th>
              <th className={`pb-2 px-3 font-bold uppercase tracking-wider text-[10px] text-right font-num-${numberFont}`}>Value</th>
              <th className={`pb-2 px-3 font-bold uppercase tracking-wider text-[10px] text-right font-num-${numberFont}`}>Day P/L</th>
              <th className={`pb-2 pl-3 font-bold uppercase tracking-wider text-[10px] text-right font-num-${numberFont}`}>Total P/L</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-slate-700 dark:text-slate-350">
            {holdings.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-400 dark:text-slate-500 italic text-xs">
                  No active holdings in watchlist
                </td>
              </tr>
            ) : (
              holdings.map((h: any) => {
                const totalPl = h.pl ?? (h.marketValue - (h.qty * (h.avgPrice || 0)));
                const totalPlPercent = h.plPercent ?? (h.avgPrice ? ((h.currentPrice - h.avgPrice) / h.avgPrice) * 100 : 0);

                return (
                  <tr key={h.symbol} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 pr-3 font-bold text-blue-600 dark:text-blue-400">
                      <div>{h.symbol}</div>
                      {h.name && <div className="text-[9px] text-slate-400 font-normal truncate max-w-[100px]">{h.name}</div>}
                    </td>
                    <td className={`py-2.5 px-3 text-right font-num-${numberFont}`}>{h.qty}</td>
                    <td className={`py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white font-num-${numberFont}`}>
                      ${(h.currentPrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className={`py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white font-num-${numberFont}`}>
                      ${(h.marketValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className={`py-2.5 px-3 text-right font-bold font-num-${numberFont} ${(h.dayPl || 0) >= 0 ? 'text-teal-500' : 'text-rose-500'}`}>
                      {(h.dayPl || 0) >= 0 ? '+' : ''}${(h.dayPl || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className={`py-2.5 pl-3 text-right font-bold font-num-${numberFont} ${totalPl >= 0 ? 'text-teal-500' : 'text-rose-500'}`}>
                      <div>{totalPl >= 0 ? '+' : ''}${totalPl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      <div className="text-[10px]">{totalPlPercent >= 0 ? '+' : ''}{totalPlPercent.toFixed(2)}%</div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <button
        onClick={onOpenTradeModal}
        className="w-full py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 border border-blue-500/30 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
      >
        + Trade Stock / Options
      </button>
    </div>
  );
}

// Distinct color palette pool with 50 unique accessible hex colors for holdings
const HOLDING_COLOR_PALETTE = [
  '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#6366f1',
  '#14b8a6', '#a855f7', '#ef4444', '#84cc16', '#38bdf8', '#fb7185', '#4ade80', '#facc15',
  '#c084fc', '#22d3ee', '#fb923c', '#818cf8', '#34d399', '#f43f5e', '#a3e635', '#60a5fa',
  '#e879f9', '#2dd4bf', '#ff8c00', '#7c3aed', '#db2777', '#0284c7', '#ea580c', '#4f46e5',
  '#059669', '#9333ea', '#dc2626', '#65a30d', '#0284c7', '#e11d48', '#16a34a', '#d97706',
  '#7e22ce', '#0891b2', '#c2410c', '#4338ca', '#047857', '#7e22ce', '#b91c1c', '#4d7c0f',
  '#1d4ed8', '#be185d'
];

// 3. Account Summary & Overview Widget
export function AccountSummaryWidget({ portfolio, numberFont, borrowedAmountJustNow }: WidgetComponentProps) {
  const [viewMode, setViewMode] = useState<'portfolio' | 'holdings'>('portfolio');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const cash = Math.max(0, portfolio?.cash || 0);
  const holdings = portfolio?.holdings || [];
  const totalMarketValue = Math.max(0, portfolio?.totalMarketValue || 0);
  const totalPortfolioValue = Math.max(1, cash + totalMarketValue);

  // Data for Portfolio mode (Stocks vs Cash)
  const portfolioData = [
    { name: 'Stocks', value: totalMarketValue, color: '#3b82f6' },
    { name: 'Cash', value: cash, color: '#2dd4bf' },
  ];

  // Data for Holdings mode (Individual stock holdings with unique assigned colors + Cash if any)
  const holdingsData = useMemo(() => {
    const items = holdings.map((h: any, idx: number) => ({
      name: h.symbol || `Stock ${idx + 1}`,
      value: Math.max(0, h.marketValue || 0),
      color: HOLDING_COLOR_PALETTE[idx % HOLDING_COLOR_PALETTE.length],
    }));
    if (cash > 0) {
      items.push({
        name: 'Cash',
        value: cash,
        color: '#2dd4bf',
      });
    }
    return items.length > 0 ? items : [{ name: 'Cash', value: cash || 1000, color: '#2dd4bf' }];
  }, [holdings, cash]);

  const activeData = viewMode === 'portfolio' ? portfolioData : holdingsData;

  return (
    <div className="h-full w-full flex flex-col justify-between space-y-2 min-h-0 select-none">
      {/* Top Bar with Mode Toggle */}
      <div className="flex items-center justify-between shrink-0 pb-1 border-b border-slate-200/50 dark:border-slate-800/50">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
          {viewMode === 'portfolio' ? 'Asset Breakdown' : 'Holdings Breakdown'}
        </span>

        <div className="flex items-center bg-slate-200/70 dark:bg-slate-800/90 rounded-lg p-0.5 border border-slate-300 dark:border-slate-700">
          <button
            onClick={() => { setViewMode('portfolio'); setActiveIndex(null); }}
            className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold transition-all cursor-pointer ${
              viewMode === 'portfolio'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Portfolio
          </button>
          <button
            onClick={() => { setViewMode('holdings'); setActiveIndex(null); }}
            className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold transition-all cursor-pointer ${
              viewMode === 'holdings'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Holdings
          </button>
        </div>
      </div>

      {/* Pie Chart Canvas filling main empty container space */}
      <div className="flex-1 w-full min-h-[140px] relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%" minWidth={120} minHeight={120}>
          <PieChart>
            <Pie
              data={activeData}
              cx="50%"
              cy="50%"
              innerRadius="46%"
              outerRadius="78%"
              paddingAngle={activeData.length > 1 ? 3 : 0}
              dataKey="value"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {activeData.map((entry: { name: string; value: number; color: string }, index: number) => (
                <Cell
                  key={`cell-${entry.name}-${index}`}
                  fill={entry.color}
                  stroke="none"
                  style={{
                    transform: activeIndex === index ? 'scale(1.07)' : 'scale(1)',
                    transformOrigin: 'center center',
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    filter: activeIndex === index ? 'drop-shadow(0px 6px 12px rgba(0,0,0,0.35))' : 'none',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </Pie>
            <Tooltip
              offset={18}
              formatter={(val: any, name: any) => [
                `$${Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                `${name}:`
              ]}
              contentStyle={{
                backgroundColor: '#0f111a',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                fontSize: '12px',
                color: '#fff',
                fontWeight: 700,
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Dynamic Color Identifiers Legend at bottom */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[10px] font-bold text-slate-500 shrink-0 max-h-[60px] overflow-y-auto pt-1">
        {activeData.map((item: { name: string; value: number; color: string }) => (
          <span key={`legend-${item.name}`} className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-slate-700 dark:text-slate-300 font-semibold">{item.name}</span>
            <span className="text-slate-400">(${item.value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })})</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// 4. Recent Trades Widget
export function RecentTradesWidget({ portfolio, numberFont }: WidgetComponentProps) {
  const history = portfolio?.tradeHistory || [];

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-semibold whitespace-nowrap">
          <thead className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="pb-2 pr-2 font-bold uppercase tracking-wider text-[10px]">Type</th>
              <th className="pb-2 px-2 font-bold uppercase tracking-wider text-[10px]">Symbol</th>
              <th className={`pb-2 px-2 font-bold uppercase tracking-wider text-[10px] text-right font-num-${numberFont}`}>Qty</th>
              <th className={`pb-2 pl-2 font-bold uppercase tracking-wider text-[10px] text-right font-num-${numberFont}`}>Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-slate-700 dark:text-slate-350">
            {history.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-slate-400 dark:text-slate-500 italic text-xs">
                  No executed trade history yet
                </td>
              </tr>
            ) : (
              history.map((trade: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 pr-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${trade.type === 'BUY' ? 'bg-teal-500/20 text-teal-400' : 'bg-rose-500/20 text-rose-400'}`}>
                      {trade.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 font-bold text-slate-900 dark:text-white">{trade.ticker || trade.symbol}</td>
                  <td className={`py-2.5 px-2 text-right font-num-${numberFont}`}>{trade.qty}</td>
                  <td className={`py-2.5 pl-2 text-right font-bold text-slate-900 dark:text-white font-num-${numberFont}`}>
                    ${trade.price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 5. Leaderboard Standings Widget
export function LeaderboardRankingsWidget({ numberFont }: WidgetComponentProps) {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getLeaderboard();
        setLeaders(data.slice(0, 5));
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
      <div className="h-full flex items-center justify-center text-slate-400">
        <RefreshCw className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col justify-between space-y-3">
      <div className="space-y-2">
        {leaders.map((leader, idx) => (
          <div
            key={leader.id || idx}
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/50 dark:bg-[#0f111a]/40 border border-slate-200 dark:border-slate-800/50 text-xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                idx === 0 ? 'bg-amber-500 text-[#0f111a]' : idx === 1 ? 'bg-slate-300 text-slate-900' : idx === 2 ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {idx + 1}
              </span>
              <span className="font-bold text-slate-900 dark:text-white truncate">{leader.displayName}</span>
            </div>
            <span className={`font-black text-blue-500 font-num-${numberFont} shrink-0`}>
              ${leader.netWorth.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 6. Achievements Tracker Widget
export function AchievementsTrackerWidget() {
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

  const total = ACHIEVEMENTS.length;
  const unlocked = unlockedIds.length;
  const percent = Math.round((unlocked / total) * 100);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400">
        <RefreshCw className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-purple-400" />
          <span className="text-xs font-bold text-slate-900 dark:text-white">Overall Milestone Progress</span>
        </div>
        <span className="text-xs font-black text-purple-400">{unlocked} / {total} Unlocked ({percent}%)</span>
      </div>

      <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-500 transition-all duration-500" style={{ width: `${percent}%` }} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {ACHIEVEMENTS.slice(0, 6).map((ach) => {
          const isUnlocked = unlockedIds.includes(ach.id);
          return (
            <div
              key={ach.id}
              className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs transition-colors ${
                isUnlocked
                  ? 'bg-purple-950/20 border-purple-500/30 text-purple-200'
                  : 'bg-slate-900/30 border-slate-800/40 text-slate-500 opacity-60'
              }`}
            >
              <Award className={`h-4 w-4 shrink-0 ${isUnlocked ? 'text-purple-400' : 'text-slate-600'}`} />
              <span className="font-bold truncate">{ach.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 7. Quick Order / Fast Trade Widget
export function QuickTradeWidget({ onOpenTradeModal }: WidgetComponentProps) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center text-center p-3 sm:p-4 space-y-2.5 sm:space-y-3.5 bg-gradient-to-br from-blue-600/10 via-indigo-600/5 to-teal-500/10 rounded-xl border border-blue-500/20 overflow-hidden">
      <div className="p-2 sm:p-3 bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/30 shrink-0">
        <Zap className="h-5 w-5 sm:h-7 sm:w-7" />
      </div>
      <div className="px-1 shrink min-h-0 overflow-hidden">
        <h4 className="text-slate-900 dark:text-white font-extrabold text-xs sm:text-sm truncate">Quick Order Execution</h4>
        <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs mt-0.5 line-clamp-2 leading-tight">Execute instant stock or option paper orders directly to your portfolio.</p>
      </div>
      <button
        onClick={onOpenTradeModal}
        className="w-full max-w-[200px] py-2 sm:py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] cursor-pointer shrink-0 truncate"
      >
        Open Order Ticket
      </button>
    </div>
  );
}

// 8. Market Movers / Top Sparkline Widget
export function MarketMoversWidget() {
  const movers = [
    { ticker: 'AAPL', name: 'Apple Inc.', price: '$224.23', change: '+2.4%', positive: true },
    { ticker: 'NVDA', name: 'NVIDIA Corp.', price: '$128.50', change: '+4.8%', positive: true },
    { ticker: 'TSLA', name: 'Tesla Inc.', price: '$219.80', change: '-1.5%', positive: false },
    { ticker: 'AMZN', name: 'Amazon.com', price: '$186.10', change: '+1.1%', positive: true },
  ];

  return (
    <div className="h-full flex flex-col justify-between space-y-2">
      {movers.map((m) => (
        <div key={m.ticker} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/50 dark:bg-[#0f111a]/40 border border-slate-200 dark:border-slate-800/50 text-xs">
          <div>
            <div className="font-extrabold text-slate-900 dark:text-white">{m.ticker}</div>
            <div className="text-[10px] text-slate-500">{m.name}</div>
          </div>
          <div className="text-right">
            <div className="font-bold text-slate-900 dark:text-white">{m.price}</div>
            <div className={`text-[10px] font-black ${m.positive ? 'text-teal-400' : 'text-rose-400'}`}>{m.change}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// 9. Financial Goals / Target Sparkline Widget
export function PortfolioGoalsWidget({ portfolio }: WidgetComponentProps) {
  const target = 25000;
  const current = portfolio?.totalValue || 10000;
  const progress = Math.min(100, Math.round((current / target) * 100));

  return (
    <div className="h-full flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-emerald-400" />
          <span className="text-xs font-bold text-slate-900 dark:text-white">$25,000 Portfolio Goal</span>
        </div>
        <span className="text-xs font-black text-emerald-400">{progress}% Reached</span>
      </div>

      <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex justify-between items-center">
        <span>Current Net Worth: <strong>${current.toLocaleString('en-US', { maximumFractionDigits: 0 })}</strong></span>
        <span>Target: <strong>$25,000</strong></span>
      </div>
    </div>
  );
}

// 10. Financial News Feed Widget
export function FinancialNewsWidget() {
  const newsItems = [
    { title: 'Fed Signals Potential Rate Cut in Upcoming Meeting', source: 'MarketWatch', time: '10m ago' },
    { title: 'Tech Rally Continues Led by AI Hardware Growth', source: 'Bloomberg', time: '25m ago' },
    { title: 'Retail Trading Volume Hits New Quarter High', source: 'Reuters', time: '1h ago' },
  ];

  return (
    <div className="h-full flex flex-col justify-between space-y-3">
      {newsItems.map((item, idx) => (
        <div key={idx} className="p-2.5 rounded-xl bg-slate-50/50 dark:bg-[#0f111a]/40 border border-slate-200 dark:border-slate-800/50 space-y-1">
          <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-snug hover:text-blue-400 transition-colors cursor-pointer">{item.title}</h5>
          <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
            <span>{item.source}</span>
            <span>{item.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Widget Meta & Component Registry Definition
export interface WidgetDefinition {
  id: string;
  title: string;
  component: React.ComponentType<WidgetComponentProps>;
  description: string;
  defaultCategory: 'starter' | 'extra';
}

export const WIDGET_REGISTRY: Record<string, WidgetDefinition> = {
  'portfolio-graph': {
    id: 'portfolio-graph',
    title: 'Portfolio Performance Graph',
    component: PortfolioGraphWidget,
    description: 'Interactive portfolio value sparkline vs SPY benchmark',
    defaultCategory: 'starter',
  },
  'watchlist': {
    id: 'watchlist',
    title: 'Holdings',
    component: WatchlistWidget,
    description: 'Real-time performance tracking of held assets',
    defaultCategory: 'starter',
  },
  'account-summary': {
    id: 'account-summary',
    title: 'Account Summary & Overview',
    component: AccountSummaryWidget,
    description: 'Buying power, available cash, and asset allocation',
    defaultCategory: 'starter',
  },
  'recent-trades': {
    id: 'recent-trades',
    title: 'Recent Executed Orders',
    component: RecentTradesWidget,
    description: 'Log of recent buy/sell trades and order prices',
    defaultCategory: 'extra',
  },
  'leaderboard-rankings': {
    id: 'leaderboard-rankings',
    title: 'Top Trader Rankings',
    component: LeaderboardRankingsWidget,
    description: 'Global leaderboard standings and competitor net worth',
    defaultCategory: 'extra',
  },
  'achievements-tracker': {
    id: 'achievements-tracker',
    title: 'Achievements & Milestones',
    component: AchievementsTrackerWidget,
    description: 'User trophies, level badges, and milestone completion',
    defaultCategory: 'extra',
  },
  'quick-trade': {
    id: 'quick-trade',
    title: 'Quick Order Execution',
    component: QuickTradeWidget,
    description: 'Instant paper order execution ticket button',
    defaultCategory: 'extra',
  },
  'market-movers': {
    id: 'market-movers',
    title: 'Top Market Movers',
    component: MarketMoversWidget,
    description: 'Live trending stocks and percentage price changes',
    defaultCategory: 'extra',
  },
  'portfolio-goals': {
    id: 'portfolio-goals',
    title: 'Portfolio Milestone Goals',
    component: PortfolioGoalsWidget,
    description: 'Net worth milestone target tracker',
    defaultCategory: 'extra',
  },
  'financial-news': {
    id: 'financial-news',
    title: 'Financial News Feed',
    component: FinancialNewsWidget,
    description: 'Breaking financial news headlines and market updates',
    defaultCategory: 'extra',
  },
};
