'use client';

import React, { useEffect, useState } from 'react';
import PortfolioChart from '@/components/PortfolioChart';
import { Trophy, Rocket, Gem, Crown, PieChart, Zap, Medal, Lock, CheckCircle2, ShieldAlert, ArrowUpRight, ArrowDownRight, RefreshCw, Flame, Award } from 'lucide-react';
import { getLeaderboard, LeaderboardEntry } from '@/app/actions/leaderboard';
import { ACHIEVEMENTS, getUserAchievements } from '@/app/actions/achievements';
import { AnimatedNumber } from '@/components/ui';

interface WidgetComponentProps {
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

// 2. Live Stock Watchlist Widget
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
              <th className={`pb-2 px-3 font-bold uppercase tracking-wider text-[10px] text-right font-num-${numberFont}`}>Value</th>
              <th className={`pb-2 pl-3 font-bold uppercase tracking-wider text-[10px] text-right font-num-${numberFont}`}>Day P/L</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-slate-700 dark:text-slate-350">
            {holdings.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-slate-400 dark:text-slate-500 italic text-xs">
                  No active holdings in watchlist
                </td>
              </tr>
            ) : (
              holdings.slice(0, 5).map((h: any) => (
                <tr key={h.symbol} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 pr-3 font-bold text-blue-600 dark:text-blue-400">{h.symbol}</td>
                  <td className={`py-2.5 px-3 text-right font-num-${numberFont}`}>{h.qty}</td>
                  <td className={`py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white font-num-${numberFont}`}>
                    ${h.marketValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className={`py-2.5 pl-3 text-right font-bold font-num-${numberFont} ${h.dayPl >= 0 ? 'text-teal-500' : 'text-rose-500'}`}>
                    {h.dayPl >= 0 ? '+' : ''}${h.dayPl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))
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

// 3. Account Summary Widget (Cash, Buying Power, Asset Allocation)
export function AccountSummaryWidget({ portfolio, numberFont, borrowedAmountJustNow }: WidgetComponentProps) {
  const totalValue = portfolio?.totalValue || 0;
  const cash = portfolio?.cash || 0;
  const marketValue = portfolio?.totalMarketValue || 0;
  const cashPercent = totalValue > 0 ? Math.round((cash / totalValue) * 100) : 0;
  const stocksPercent = 100 - cashPercent;

  return (
    <div className="h-full flex flex-col justify-between space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-50/50 dark:bg-[#0f111a]/40 border border-slate-200 dark:border-slate-800/50">
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">
            Buying Power / Cash
          </div>
          <div className={`text-xl font-black text-slate-900 dark:text-white font-num-${numberFont}`}>
            <AnimatedNumber value={cash} formatter={(v) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} startOffset={borrowedAmountJustNow} />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50/50 dark:bg-[#0f111a]/40 border border-slate-200 dark:border-slate-800/50">
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">
            Total Market Value
          </div>
          <div className={`text-xl font-black text-slate-900 dark:text-white font-num-${numberFont}`}>
            <AnimatedNumber value={marketValue} formatter={(v) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
          </div>
        </div>
      </div>

      {/* Asset Allocation bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
          <span>Asset Allocation</span>
          <span>{stocksPercent}% Stocks / {cashPercent}% Cash</span>
        </div>
        <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
          <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${stocksPercent}%` }} title={`Stocks: ${stocksPercent}%`} />
          <div className="h-full bg-teal-400 transition-all duration-500" style={{ width: `${cashPercent}%` }} title={`Cash: ${cashPercent}%`} />
        </div>
        <div className="flex gap-4 text-[10px] font-bold text-slate-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Stocks (${marketValue.toLocaleString()})</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-400" /> Cash (${cash.toLocaleString()})</span>
        </div>
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
              history.slice(0, 5).map((trade: any, idx: number) => (
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

// Widget Meta & Component Registry Definition
export interface WidgetDefinition {
  id: string;
  title: string;
  component: React.ComponentType<WidgetComponentProps>;
  description: string;
}

export const WIDGET_REGISTRY: Record<string, WidgetDefinition> = {
  'portfolio-graph': {
    id: 'portfolio-graph',
    title: 'Portfolio Performance Graph',
    component: PortfolioGraphWidget,
    description: 'Interactive portfolio value sparkline vs SPY benchmark',
  },
  'watchlist': {
    id: 'watchlist',
    title: 'Live Stock Watchlist',
    component: WatchlistWidget,
    description: 'Real-time performance tracking of held assets',
  },
  'account-summary': {
    id: 'account-summary',
    title: 'Account Summary & Cash',
    component: AccountSummaryWidget,
    description: 'Buying power, available cash, and asset allocation',
  },
  'recent-trades': {
    id: 'recent-trades',
    title: 'Recent Executed Orders',
    component: RecentTradesWidget,
    description: 'Log of recent buy/sell trades and order prices',
  },
  'leaderboard-rankings': {
    id: 'leaderboard-rankings',
    title: 'Top Trader Rankings',
    component: LeaderboardRankingsWidget,
    description: 'Global leaderboard standings and competitor net worth',
  },
  'achievements-tracker': {
    id: 'achievements-tracker',
    title: 'Achievements & Milestones',
    component: AchievementsTrackerWidget,
    description: 'User trophies, level badges, and milestone completion',
  },
};
