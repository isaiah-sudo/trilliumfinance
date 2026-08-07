'use client';

import React, { useEffect, useState, useMemo } from 'react';
import PortfolioChart from '@/components/PortfolioChart';
import { Trophy, Rocket, Gem, Crown, PieChart as PieIcon, Zap, Medal, Lock, CheckCircle2, ShieldAlert, ArrowUpRight, ArrowDownRight, RefreshCw, Flame, Award, LineChart, Wallet, BookOpen, User, DollarSign, Activity, Percent, Sparkles, TrendingUp, Newspaper, Target, Layers, Plus, X } from 'lucide-react';
import { getLeaderboard, LeaderboardEntry } from '@/app/actions/leaderboard';
import { ACHIEVEMENTS, getUserAchievements, RarityType } from '@/app/actions/achievements';
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
                    <td className={`py-2.5 px-3 text-right font-extrabold text-slate-900 dark:text-white font-num-${numberFont}`}>{h.qty}</td>
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
  const [viewMode, setViewMode] = useState<'portfolio' | 'positions'>('portfolio');
  const [displayUnit, setDisplayUnit] = useState<'currency' | 'percent'>('currency');
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

  // Data for Positions mode (Only user positions, excluding cash)
  const positionsData = useMemo(() => {
    const items = holdings.map((h: any, idx: number) => ({
      name: h.symbol || `Stock ${idx + 1}`,
      value: Math.max(0, h.marketValue || 0),
      color: HOLDING_COLOR_PALETTE[idx % HOLDING_COLOR_PALETTE.length],
    }));
    return items.length > 0 ? items : [{ name: 'No Positions', value: 0, color: '#64748b' }];
  }, [holdings]);

  const activeData = viewMode === 'portfolio' ? portfolioData : positionsData;
  const activeTotalValue = viewMode === 'portfolio' ? totalPortfolioValue : (totalMarketValue || 1);

  return (
    <div className="h-full w-full flex flex-col justify-between space-y-2 min-h-0 select-none">
      {/* Top Bar with Unit Toggle ($ / %) & Mode Toggle */}
      <div className="flex items-center justify-between shrink-0 pb-1 border-b border-slate-200/50 dark:border-slate-800/50">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
          {viewMode === 'portfolio' ? 'Asset Breakdown' : 'Positions Breakdown'}
        </span>

        <div className="flex items-center gap-2">
          {/* Unit Toggle: $ and % */}
          <div className="flex items-center bg-slate-200/70 dark:bg-slate-800/90 rounded-lg p-0.5 border border-slate-300 dark:border-slate-700">
            <button
              onClick={() => setDisplayUnit('currency')}
              className={`px-2 py-0.5 rounded-md text-[10px] font-black transition-all cursor-pointer ${
                displayUnit === 'currency'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
              title="Display values in USD ($)"
            >
              $
            </button>
            <button
              onClick={() => setDisplayUnit('percent')}
              className={`px-2 py-0.5 rounded-md text-[10px] font-black transition-all cursor-pointer ${
                displayUnit === 'percent'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
              title="Display values in Percentages (%)"
            >
              %
            </button>
          </div>

          {/* Mode Toggle: Portfolio vs Positions */}
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
              onClick={() => { setViewMode('positions'); setActiveIndex(null); }}
              className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold transition-all cursor-pointer ${
                viewMode === 'positions'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Positions
            </button>
          </div>
        </div>
      </div>

      {/* Prominent Bolder Market Value Header Above Pie Chart */}
      <div className="text-center pt-1 shrink-0">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {viewMode === 'portfolio' ? 'Total Portfolio Market Value' : 'Total Positions Value'}
        </div>
        <div className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white font-num-sans">
          ${(viewMode === 'portfolio' ? totalPortfolioValue : totalMarketValue).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
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
                displayUnit === 'percent'
                  ? `${((Number(val || 0) / activeTotalValue) * 100).toFixed(2)}%`
                  : `$${Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
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
        {activeData.map((item: { name: string; value: number; color: string }) => {
          const displayVal = displayUnit === 'percent'
            ? `${((item.value / activeTotalValue) * 100).toFixed(1)}%`
            : `$${item.value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

          return (
            <span key={`legend-${item.name}`} className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-slate-700 dark:text-slate-300 font-semibold">{item.name}</span>
              <span className="text-slate-400">({displayVal})</span>
            </span>
          );
        })}
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
      <div className="h-full flex items-center justify-center text-slate-400">
        <RefreshCw className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3, 7);

  return (
    <div className="h-full flex flex-col justify-between space-y-4 overflow-y-auto pr-1">
      {/* Top 3 Podium Cards */}
      {top3.length > 0 && (
        <div className="grid grid-cols-3 gap-2 items-end pt-2">
          {/* Rank 2 (Silver) */}
          {top3.length >= 2 ? (
            <div className="order-1 flex flex-col items-center">
              <div className="w-full rounded-xl bg-slate-800/80 border border-slate-700/60 p-2.5 flex flex-col items-center text-center shadow-md relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-300 to-gray-400" />
                <div className="h-9 w-9 rounded-full bg-slate-700 flex items-center justify-center mb-1.5 ring-2 ring-gray-400/30">
                  <Medal className="h-4 w-4 text-gray-300" />
                </div>
                <span className="text-[9px] font-extrabold text-gray-400 uppercase">Rank 2</span>
                <h5 className="text-xs font-bold text-white truncate max-w-full">{top3[1].displayName}</h5>
                <p className="text-[10px] text-blue-400 font-extrabold font-num-sans">
                  ${top3[1].netWorth.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          ) : <div className="order-1" />}

          {/* Rank 1 (Gold) */}
          {top3.length >= 1 ? (
            <div className="order-2 flex flex-col items-center -mt-2">
              <div className="w-full rounded-xl bg-gradient-to-b from-amber-500/15 to-slate-800/90 border border-amber-500/40 p-3 flex flex-col items-center text-center shadow-[0_0_15px_rgba(245,158,11,0.2)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
                <div className="h-11 w-11 rounded-full bg-amber-500/20 flex items-center justify-center mb-1.5 ring-2 ring-amber-500/40">
                  <Trophy className="h-5 w-5 text-amber-400" />
                </div>
                <span className="text-[9px] font-extrabold text-amber-400 uppercase">Rank 1</span>
                <h5 className="text-xs font-extrabold text-white truncate max-w-full">{top3[0].displayName}</h5>
                <p className="text-xs text-amber-400 font-black font-num-sans">
                  ${top3[0].netWorth.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          ) : <div className="order-2" />}

          {/* Rank 3 (Bronze) */}
          {top3.length >= 3 ? (
            <div className="order-3 flex flex-col items-center">
              <div className="w-full rounded-xl bg-slate-800/80 border border-slate-700/60 p-2.5 flex flex-col items-center text-center shadow-md relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-700 to-amber-800" />
                <div className="h-9 w-9 rounded-full bg-slate-700 flex items-center justify-center mb-1.5 ring-2 ring-amber-700/30">
                  <Award className="h-4 w-4 text-amber-600" />
                </div>
                <span className="text-[9px] font-extrabold text-amber-600 uppercase">Rank 3</span>
                <h5 className="text-xs font-bold text-white truncate max-w-full">{top3[2].displayName}</h5>
                <p className="text-[10px] text-blue-400 font-extrabold font-num-sans">
                  ${top3[2].netWorth.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          ) : <div className="order-3" />}
        </div>
      )}

      {/* Rest of Rankings List */}
      <div className="space-y-1.5">
        {rest.map((leader) => (
          <div
            key={leader.id || leader.rank}
            className="flex items-center justify-between p-2 rounded-xl bg-slate-50/50 dark:bg-[#0f111a]/40 border border-slate-200 dark:border-slate-800/50 text-xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-5 h-5 rounded-lg bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
                {leader.rank}
              </span>
              <span className="font-bold text-slate-900 dark:text-white truncate">{leader.displayName}</span>
            </div>
            <span className={`font-black text-slate-700 dark:text-slate-300 font-num-${numberFont} shrink-0 text-[11px]`}>
              ${leader.netWorth.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper icon resolver for trophy modal
function renderAchievementIcon(iconType: string, isUnlocked: boolean) {
  const className = `h-6 w-6 ${isUnlocked ? 'text-amber-400' : 'text-slate-500'}`;
  switch (iconType) {
    case 'Rocket': return <Rocket className={className} />;
    case 'Gem': return <Gem className={className} />;
    case 'Crown': return <Crown className={className} />;
    case 'PieChart': return <PieIcon className={className} />;
    case 'Zap': return <Zap className={className} />;
    case 'Trophy': return <Trophy className={className} />;
    default: return <Award className={className} />;
  }
}

// Rarity style helper
function getRarityStyle(rarity: RarityType = 'Bronze', isUnlocked: boolean) {
  if (!isUnlocked) {
    return {
      border: 'border-slate-800/80',
      bg: 'bg-slate-900/40',
      text: 'text-slate-500',
      badgeBg: 'bg-slate-800 text-slate-500',
      glow: 'shadow-none',
      iconColor: 'text-slate-600',
    };
  }

  switch (rarity) {
    case 'Purple':
      return {
        border: 'border-purple-500/60',
        bg: 'bg-gradient-to-b from-purple-600/20 via-purple-950/30 to-slate-900/90',
        text: 'text-purple-300',
        badgeBg: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
        glow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]',
        iconColor: 'text-purple-400',
      };
    case 'Gold':
      return {
        border: 'border-amber-500/60',
        bg: 'bg-gradient-to-b from-amber-500/20 via-amber-950/30 to-slate-900/90',
        text: 'text-amber-300',
        badgeBg: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
        glow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]',
        iconColor: 'text-amber-400',
      };
    case 'Silver':
      return {
        border: 'border-slate-300/60',
        bg: 'bg-gradient-to-b from-slate-300/15 via-slate-800/40 to-slate-900/90',
        text: 'text-slate-200',
        badgeBg: 'bg-slate-300/20 text-slate-200 border border-slate-300/30',
        glow: 'shadow-[0_0_15px_rgba(203,213,225,0.2)]',
        iconColor: 'text-slate-300',
      };
    case 'Bronze':
    default:
      return {
        border: 'border-amber-700/60',
        bg: 'bg-gradient-to-b from-amber-800/20 via-slate-800/40 to-slate-900/90',
        text: 'text-amber-200',
        badgeBg: 'bg-amber-800/20 text-amber-200 border border-amber-700/30',
        glow: 'shadow-[0_0_15px_rgba(180,83,9,0.2)]',
        iconColor: 'text-amber-600',
      };
  }
}

// 6. Achievements & Milestones Tracker Widget (Square 1:1 Floating Containers + Cursor Tracking Tilt + Screen Blur Popup Modal)
export function AchievementsTrackerWidget() {
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  // Default to blank slate (null for all 3 slots)
  const [slotSelections, setSlotSelections] = useState<(string | null)[]>([null, null, null]);

  // Cursor tracking tilt state for each slot
  const [tilt, setTilt] = useState<{ [key: number]: { rx: number; ry: number } }>({
    0: { rx: 0, ry: 0 },
    1: { rx: 0, ry: 0 },
    2: { rx: 0, ry: 0 },
  });

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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, slotIdx: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Calculate 3D tilt "looking" angle towards cursor
    const rx = -(y / (rect.height / 2)) * 14;
    const ry = (x / (rect.width / 2)) * 14;
    setTilt((prev) => ({ ...prev, [slotIdx]: { rx, ry } }));
  };

  const handleMouseLeave = (slotIdx: number) => {
    setTilt((prev) => ({ ...prev, [slotIdx]: { rx: 0, ry: 0 } }));
  };

  const handleOpenSlot = (slotIdx: number) => {
    setSelectedSlot(slotIdx);
    setModalOpen(true);
  };

  const handleSelectTrophy = (achievementId: string) => {
    if (selectedSlot !== null) {
      const updated = [...slotSelections];
      updated[selectedSlot] = achievementId;
      setSlotSelections(updated);
    }
    setModalOpen(false);
    setSelectedSlot(null);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400">
        <RefreshCw className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  const unlockedList = ACHIEVEMENTS.filter((a) => unlockedIds.includes(a.id));
  const lockedList = ACHIEVEMENTS.filter((a) => !unlockedIds.includes(a.id));
  const slotData = slotSelections.map((id) => ACHIEVEMENTS.find((a) => a.id === id));

  return (
    <div className="h-full w-full flex items-center justify-center p-2 sm:p-4 relative select-none">
      {/* Three Square Floating Containers Scaling Proportionately with Parent Container */}
      <div className="flex items-center justify-center gap-3 sm:gap-6 w-full h-full my-auto">
        {[0, 1, 2].map((slotIdx) => {
          const ach = slotData[slotIdx];
          const isUnlocked = ach ? unlockedIds.includes(ach.id) : false;
          const isMiddle = slotIdx === 1;
          const style = ach ? getRarityStyle(ach.rarity, isUnlocked) : null;
          const currentTilt = tilt[slotIdx] || { rx: 0, ry: 0 };

          return (
            <div
              key={`slot-${slotIdx}`}
              className="flex-1 h-full max-h-[85%] max-w-[30%] flex justify-center items-center"
              style={{ perspective: 600 }}
            >
              <div
                onMouseMove={(e) => handleMouseMove(e, slotIdx)}
                onMouseLeave={() => handleMouseLeave(slotIdx)}
                style={{
                  transform: `rotateX(${currentTilt.rx}deg) rotateY(${currentTilt.ry}deg)`,
                  transition: currentTilt.rx === 0 && currentTilt.ry === 0 ? 'transform 0.4s ease-out' : 'none',
                  transformStyle: 'preserve-3d',
                }}
                className={`aspect-square w-full h-auto max-h-full rounded-2xl sm:rounded-3xl border-2 flex flex-col items-center justify-center p-3 sm:p-4 text-center relative group transition-all shadow-xl ${
                  isMiddle ? 'scale-105 z-10' : 'z-0'
                } ${
                  ach
                    ? `${style?.bg} ${style?.border} ${style?.glow}`
                    : 'bg-slate-950/40 border-dashed border-slate-700/60 hover:border-blue-500/50'
                }`}
              >
                {ach ? (
                  <div className="flex flex-col items-center justify-center h-full w-full relative" style={{ transform: 'translateZ(12px)' }}>
                    <div className="mb-1.5 p-2 sm:p-3 rounded-2xl bg-slate-900/60 border border-slate-700/50 shadow-inner">
                      {renderAchievementIcon(ach.iconType, isUnlocked)}
                    </div>
                    <span className={`text-xs sm:text-sm font-black truncate max-w-full px-1 ${style?.text}`}>
                      {ach.title}
                    </span>
                    <span className={`text-[9px] sm:text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full mt-1.5 ${style?.badgeBg}`}>
                      {ach.rarity}
                    </span>

                    <button
                      onClick={() => handleOpenSlot(slotIdx)}
                      className="absolute top-1 right-1 sm:top-2 sm:right-2 p-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white transition-all cursor-pointer shadow-md"
                      title="Change Trophy"
                    >
                      <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                ) : (
                  // Blank Slate with Plus button scaling proportionately
                  <div className="flex flex-col items-center justify-center gap-2" style={{ transform: 'translateZ(8px)' }}>
                    <button
                      onClick={() => handleOpenSlot(slotIdx)}
                      className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-blue-600/20 hover:bg-blue-600 border border-blue-500/40 text-blue-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-110"
                      title="Add Trophy to Showcase"
                    >
                      <Plus className="h-5 w-5 sm:h-7 sm:w-7" />
                    </button>
                    <span className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest">EMPTY</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Screen-Wide Centered Modal with Full Screen Backdrop Blur & Close X */}
      {modalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#101420]/95 border border-slate-700/80 rounded-3xl p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] space-y-6 max-h-[85vh] flex flex-col relative">
            {/* Top Right Close Button X */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/80 hover:bg-rose-600 text-slate-400 hover:text-white border border-slate-700 transition-all cursor-pointer shadow-lg"
              title="Close Popup"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800/80 shrink-0 pr-10">
              <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Trophy Case Showcase</h3>
                <p className="text-xs font-semibold text-slate-400">Select a trophy to feature in your 3D showcase slot.</p>
              </div>
            </div>

            {/* Modal Content with Rarity Tags & Sorted Rows */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              {/* Row 1: Unlocked Trophies */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Unlocked Trophies ({unlockedList.length})
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {unlockedList.map((ach) => {
                    const style = getRarityStyle(ach.rarity, true);
                    return (
                      <div
                        key={ach.id}
                        onClick={() => handleSelectTrophy(ach.id)}
                        className={`p-3.5 rounded-2xl border ${style.bg} ${style.border} hover:border-blue-400 cursor-pointer transition-all hover:scale-[1.02] shadow-md flex items-center gap-3 group`}
                      >
                        <div className={`p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 ${style.iconColor} group-hover:scale-110 transition-transform`}>
                          {renderAchievementIcon(ach.iconType, true)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-sm font-extrabold text-white group-hover:text-amber-300 transition-colors truncate">
                              {ach.title}
                            </span>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${style.badgeBg}`}>
                              {ach.rarity}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 line-clamp-2 mt-0.5">{ach.description}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Row 2: Locked Trophies */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Lock className="h-4 w-4" /> Locked Trophies ({lockedList.length})
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {lockedList.map((ach) => (
                    <div
                      key={ach.id}
                      onClick={() => handleSelectTrophy(ach.id)}
                      className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/60 hover:border-slate-700 opacity-60 hover:opacity-100 cursor-pointer transition-all hover:scale-[1.01] flex items-center gap-3 group"
                    >
                      <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-500">
                        {renderAchievementIcon(ach.iconType, false)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-sm font-bold text-slate-300 truncate">{ach.title}</span>
                          <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-500 border border-slate-700 shrink-0">
                            {ach.rarity}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 line-clamp-2 mt-0.5">{ach.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
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
    title: 'Pie Chart',
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
