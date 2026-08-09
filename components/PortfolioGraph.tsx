'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  RawSnapshot,
  ChartPoint26,
  TimeRange,
  transformPortfolioData,
} from '@/lib/portfolioTransformation';

function getMarketStatus(): { isOpen: boolean; label: string } {
  const now = new Date();
  const estStr = now.toLocaleString('en-US', { timeZone: 'America/New_York' });
  const estDate = new Date(estStr);
  const estDay = estDate.getDay(); // 0 = Sun, 6 = Sat

  const hours = estDate.getHours();
  const minutes = estDate.getMinutes();
  const seconds = estDate.getSeconds();
  const currentTotalSeconds = hours * 3600 + minutes * 60 + seconds;

  const marketOpenSec = 9 * 3600 + 30 * 60; // 9:30 AM EST
  const marketCloseSec = 16 * 3600;         // 4:00 PM EST

  const isWeekday = estDay >= 1 && estDay <= 5;
  const isOpen = isWeekday && currentTotalSeconds >= marketOpenSec && currentTotalSeconds < marketCloseSec;

  if (isOpen) {
    const remainingSec = marketCloseSec - currentTotalSeconds;
    const h = Math.floor(remainingSec / 3600);
    const m = Math.floor((remainingSec % 3600) / 60);
    const timeStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
    return { isOpen: true, label: `Closes in ${timeStr}` };
  } else {
    let daysUntilOpen = 0;
    if (isWeekday && currentTotalSeconds < marketOpenSec) {
      daysUntilOpen = 0;
    } else if (estDay === 5 && currentTotalSeconds >= marketCloseSec) {
      daysUntilOpen = 3;
    } else if (estDay === 6) {
      daysUntilOpen = 2;
    } else if (estDay === 0) {
      daysUntilOpen = 1;
    } else {
      daysUntilOpen = 1;
    }

    let remainingSec = 0;
    if (daysUntilOpen === 0) {
      remainingSec = marketOpenSec - currentTotalSeconds;
    } else {
      const secondsUntilMidnight = (24 * 3600) - currentTotalSeconds;
      remainingSec = secondsUntilMidnight + ((daysUntilOpen - 1) * 24 * 3600) + marketOpenSec;
    }

    const totalHours = Math.floor(remainingSec / 3600);
    const m = Math.floor((remainingSec % 3600) / 60);

    if (totalHours >= 24) {
      const d = Math.floor(totalHours / 24);
      const h = totalHours % 24;
      return { isOpen: false, label: `Opens in ${d}d ${h}h` };
    }
    return { isOpen: false, label: `Opens in ${totalHours}h ${m}m` };
  }
}

export interface PortfolioGraphProps {
  data: { portfolio: RawSnapshot[]; benchmark: RawSnapshot[] };
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  onHover?: (data: { portfolio: number; spy: number; time: number; achievements?: any[] } | null) => void;
  onLookAchievement?: (achievementId: string) => void;
  showBenchmark?: boolean;
}

export default function PortfolioGraph({
  data,
  timeRange,
  onTimeRangeChange,
  onHover,
  onLookAchievement,
  showBenchmark = true,
}: PortfolioGraphProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [selectedBenchmark, setSelectedBenchmark] = useState<'SPY' | 'DJI' | 'NASDAQ'>('SPY');
  const [isBenchmarkMenuOpen, setIsBenchmarkMenuOpen] = useState(false);
  const [marketStatus, setMarketStatus] = useState<{ isOpen: boolean; label: string }>({ isOpen: false, label: '' });

  useEffect(() => {
    const updateStatus = () => {
      setMarketStatus(getMarketStatus());
    };
    updateStatus();
    const interval = setInterval(updateStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  // Transform raw data into dataset
  const chartData = useMemo(() => {
    return transformPortfolioData(data, timeRange);
  }, [data, timeRange]);

  // Valid non-null data points for calculation
  const activePoints = useMemo(() => {
    return chartData.filter((p) => p.portfolioValue !== null) as (ChartPoint26 & { portfolioValue: number })[];
  }, [chartData]);

  // Positive vs Negative performance determination
  const isPositive = useMemo(() => {
    if (activePoints.length < 2) return true;
    const startVal = activePoints[0].portfolioValue;
    const endVal = activePoints[activePoints.length - 1].portfolioValue;
    return endVal >= startVal;
  }, [activePoints]);

  // Modern Robinhood / TradingView aesthetic palette
  const strokeColor = isPositive ? '#10B981' : '#F43F5E';
  const gradientId = isPositive ? 'portfolioGainGradient' : 'portfolioLossGradient';
  const spyColor = '#64748B';

  // Custom Mouse Move Handler for smooth tooltips and parent callbacks
  const handleMouseMove = (state: any) => {
    if (state && state.activePayload && state.activePayload.length > 0) {
      const activePoint = state.activePayload[0].payload as ChartPoint26;
      if (activePoint.portfolioValue !== null) {
        setIsHovering(true);
        if (onHover) {
          onHover({
            portfolio: activePoint.portfolioValue,
            spy: activePoint.spyValue ?? activePoint.portfolioValue,
            time: activePoint.time ?? 0,
            achievements: activePoint.achievements,
          });
        }
      }
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (onHover) {
      onHover(null);
    }
  };

  // Milestone dot custom renderer for unlocked achievements
  const renderCustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload && payload.achievements && payload.achievements.length > 0) {
      return (
        <g key={`achievement-dot-${payload.slotIndex}`} className="cursor-pointer">
          <circle
            cx={cx}
            cy={cy}
            r={7}
            fill="#F59E0B"
            stroke="#0F172A"
            strokeWidth={2}
            className="hover:scale-125 transition-transform"
          />
          <circle
            cx={cx}
            cy={cy}
            r={3}
            fill="#FFFFFF"
            className="animate-ping"
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
        </g>
      );
    }
    return null;
  };

  // Y-Axis domain padding computation
  const yDomain = useMemo(() => {
    if (activePoints.length === 0) return ['auto', 'auto'];
    const values = activePoints.flatMap((p) => [
      p.portfolioValue,
      showBenchmark && p.spyValue !== null ? p.spyValue : p.portfolioValue,
    ]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.08 || min * 0.02 || 10;
    return [Math.max(0, Math.floor(min - padding)), Math.ceil(max + padding)];
  }, [activePoints, showBenchmark]);

  // Starting & Current values for header & percentage calculation
  const startPortVal = activePoints[0]?.portfolioValue ?? 0;
  const currentPortVal = activePoints[activePoints.length - 1]?.portfolioValue ?? 0;
  const usdDiff = currentPortVal - startPortVal;
  const percentDiff = startPortVal > 0 ? (usdDiff / startPortVal) * 100 : 0;

  const startSpyVal = activePoints[0]?.spyValue ?? 0;

  return (
    <div className="w-full h-full flex flex-col justify-between font-sans select-none">
      {/* Performance Header & Timeframe Control Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
        {/* Header Stats & Benchmark Dropdown */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-baseline gap-1.5">
            <span className={`text-xl font-extrabold tracking-tight ${usdDiff >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
              {usdDiff >= 0 ? '+' : ''}${usdDiff.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`text-xs font-bold ${usdDiff >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
              ({percentDiff >= 0 ? '+' : ''}{percentDiff.toFixed(2)}%)
            </span>
          </div>

          <div className="flex items-center gap-2.5 sm:border-l border-slate-300 dark:border-slate-800 sm:pl-3">
            {/* Market Countdown Timer */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${marketStatus.isOpen ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${marketStatus.isOpen ? 'bg-rose-500' : 'bg-emerald-500'}`} />
              </span>
              <span className={`font-bold ${marketStatus.isOpen ? 'text-rose-500 dark:text-rose-400' : 'text-emerald-500 dark:text-emerald-400'}`}>
                {marketStatus.label}
              </span>
            </div>

            {/* Benchmark Selector Button */}
            <div className="relative">
              <button
                onClick={() => setIsBenchmarkMenuOpen(!isBenchmarkMenuOpen)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 dark:bg-[#161B26] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer shadow-sm"
              >
                <span>{selectedBenchmark}</span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {isBenchmarkMenuOpen && (
                <div className="absolute left-0 mt-1 w-28 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-30 font-sans">
                  {(['SPY', 'DJI', 'NASDAQ'] as const).map((bm) => (
                    <button
                      key={bm}
                      onClick={() => {
                        setSelectedBenchmark(bm);
                        setIsBenchmarkMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-bold flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors ${
                        selectedBenchmark === bm ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <span>{bm}</span>
                      {selectedBenchmark === bm && <Check className="h-3 w-3 text-emerald-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Timeframe Control Tabs */}
        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
          {(['1D', '1W', '1M', '1Y'] as const).map((range) => {
            const isActive = timeRange === range;
            return (
              <button
                key={range}
                onClick={() => onTimeRangeChange(range)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)] dark:bg-emerald-500/15'
                    : 'bg-slate-100 dark:bg-[#161B26]/60 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800/80 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {range}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="w-full flex-1 h-full min-h-[220px] relative">
        {activePoints.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm font-medium">
            Awaiting live portfolio snapshots...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <defs>
                {/* Emerald Gain Gradient */}
                <linearGradient id="portfolioGainGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.35} />
                  <stop offset="60%" stopColor="#10B981" stopOpacity={0.05} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>

                {/* Crimson Loss Gradient */}
                <linearGradient id="portfolioLossGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F43F5E" stopOpacity={0.35} />
                  <stop offset="60%" stopColor="#F43F5E" stopOpacity={0.05} />
                  <stop offset="100%" stopColor="#F43F5E" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              {/* Minimalist Background Grid */}
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="currentColor"
                className="text-slate-200/40 dark:text-slate-800/40"
              />

              {/* X & Y Axes */}
              <XAxis
                dataKey="timeLabel"
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                tickFormatter={(value: string, index: number) => {
                  if (!chartData || index === undefined) return value;
                  if (timeRange === '1W' || timeRange === '1M' || timeRange === '1Y') {
                    if (index > 0 && chartData[index - 1]?.timeLabel === value) {
                      return '';
                    }
                  }
                  return value;
                }}
                tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }}
                dy={6}
              />
              <YAxis
                domain={yDomain}
                hide={true}
              />

              {/* TradingView Tooltip Overlay */}
              <Tooltip
                content={<CustomTooltip timeRange={timeRange} selectedBenchmark={selectedBenchmark} startPortVal={startPortVal} startSpyVal={startSpyVal} />}
                cursor={{
                  stroke: strokeColor,
                  strokeWidth: 1,
                  strokeDasharray: '4 4',
                  strokeOpacity: 0.6,
                }}
              />

              {/* Benchmark Line (SPY) */}
              {showBenchmark && (
                <Line
                  type="monotone"
                  dataKey="spyValue"
                  stroke={spyColor}
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  activeDot={false}
                  connectNulls={false}
                  isAnimationActive={false}
                />
              )}

              {/* Primary Portfolio Performance Line & Fill */}
              <Area
                type="monotone"
                dataKey="portfolioValue"
                stroke={strokeColor}
                strokeWidth={2.5}
                fill={`url(#${gradientId})`}
                dot={renderCustomDot}
                activeDot={{
                  r: 6,
                  fill: strokeColor,
                  stroke: '#0F172A',
                  strokeWidth: 2.5,
                }}
                connectNulls={false}
                isAnimationActive={true}
                animationDuration={600}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

/**
 * Custom Floating Tooltip with Values & Percentage Changes
 */
function CustomTooltip({ active, payload, timeRange, selectedBenchmark = 'SPY', startPortVal, startSpyVal }: any) {
  if (!active || !payload || !payload.length) return null;

  const data: ChartPoint26 = payload[0].payload;
  if (data.portfolioValue === null) return null;

  const portVal = data.portfolioValue;
  const portDiff = portVal - (startPortVal || portVal);
  const portPct = startPortVal > 0 ? (portDiff / startPortVal) * 100 : 0;

  const spyVal = data.spyValue;
  const spyDiff = spyVal !== null ? spyVal - (startSpyVal || spyVal) : 0;
  const spyPct = startSpyVal > 0 ? (spyDiff / startSpyVal) * 100 : 0;

  let displayTime = data.timeLabel;
  if (data.time && (timeRange === '1W' || timeRange === '1M' || timeRange === '1Y')) {
    const d = new Date(data.time * 1000);
    displayTime = d.toLocaleDateString('en-US', {
      timeZone: 'America/New_York',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  return (
    <div className="rounded-xl bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-3 shadow-xl text-xs font-sans">
      <div className="text-slate-400 font-medium mb-1.5">{displayTime}</div>
      
      {/* Portfolio Value + Percentage */}
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="text-slate-600 dark:text-slate-300 font-semibold">Portfolio:</span>
        <div className="ml-auto flex items-baseline gap-1">
          <span className="text-slate-900 dark:text-white font-bold">
            ${portVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className={`text-[10px] font-bold ${portPct >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
            ({portPct >= 0 ? '+' : ''}{portPct.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* SPY / Benchmark Value + Percentage */}
      {spyVal !== null && (
        <div className="flex items-center gap-2 mt-1.5">
          <span className="w-2 h-2 rounded-full bg-slate-400" />
          <span className="text-slate-600 dark:text-slate-400 font-medium">{selectedBenchmark} Benchmark:</span>
          <div className="ml-auto flex items-baseline gap-1">
            <span className="text-slate-700 dark:text-slate-300 font-semibold">
              ${spyVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`text-[10px] font-bold ${spyPct >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
              ({spyPct >= 0 ? '+' : ''}{spyPct.toFixed(2)}%)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
