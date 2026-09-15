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
  ReferenceLine,
} from 'recharts';
import {
  RawSnapshot,
  ChartPoint26,
  TimeRange,
  transformPortfolioData,
  getESTDateInfo,
} from '@/lib/portfolioTransformation';

function getMarketStatus(): { isOpen: boolean; label: string } {
  const est = getESTDateInfo(new Date());

  const currentTotalSeconds = est.hours * 3600 + est.minutes * 60 + est.seconds;
  const marketOpenSec = 9 * 3600 + 30 * 60; // 9:30 AM EST
  const marketCloseSec = 16 * 3600;         // 4:00 PM EST

  const isWeekday = !est.isWeekend;
  const isOpen = isWeekday && currentTotalSeconds >= marketOpenSec && currentTotalSeconds < marketCloseSec;

  if (isOpen) {
    const remainingSec = marketCloseSec - currentTotalSeconds;
    const h = Math.floor(remainingSec / 3600);
    const m = Math.floor((remainingSec % 3600) / 60);
    const timeStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
    return { isOpen: true, label: `Closes in ${timeStr}` };
  } else {
    let daysUntilOpen = 1;
    if (isWeekday && currentTotalSeconds < marketOpenSec) {
      daysUntilOpen = 0;
    } else if (est.weekday === 'Fri' && currentTotalSeconds >= marketCloseSec) {
      daysUntilOpen = 3;
    } else if (est.weekday === 'Sat') {
      daysUntilOpen = 2;
    } else if (est.weekday === 'Sun') {
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
  portfolio?: any;
  data: { portfolio: RawSnapshot[]; benchmark: RawSnapshot[] };
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  onHover?: (data: { portfolio: number; spy: number; time: number; achievements?: any[] } | null) => void;
  onLookAchievement?: (achievementId: string) => void;
  showBenchmark?: boolean;
  numberFont?: string;
}

export default function PortfolioGraph({
  portfolio,
  data,
  timeRange,
  onTimeRangeChange,
  onHover,
  onLookAchievement,
  showBenchmark = true,
  numberFont = 'sans',
}: PortfolioGraphProps) {
  const [selectedBenchmark, setSelectedBenchmark] = useState<'SPY' | 'DJI' | 'NASDAQ'>('SPY');
  const [isBenchmarkMenuOpen, setIsBenchmarkMenuOpen] = useState(false);
  const [marketStatus, setMarketStatus] = useState<{ isOpen: boolean; label: string }>({ isOpen: false, label: '' });
  const [isMounted, setIsMounted] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<ChartPoint26 | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const updateStatus = () => {
      setMarketStatus(getMarketStatus());
    };
    updateStatus();
    const interval = setInterval(updateStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  // Transform raw snapshots into 26-slot dataset
  const chartData = useMemo(() => {
    return transformPortfolioData(data, timeRange);
  }, [data, timeRange]);

  // Valid non-null data points
  const activePoints = useMemo(() => {
    return chartData.filter((p) => p.portfolioValue !== null) as (ChartPoint26 & { portfolioValue: number })[];
  }, [chartData]);

  // Baseline starting values
  const startPortVal = useMemo(() => {
    if (activePoints.length > 0) return activePoints[0].portfolioValue;
    if (portfolio?.totalValue !== undefined && portfolio?.dayPerformanceUSD !== undefined) {
      return portfolio.totalValue - portfolio.dayPerformanceUSD;
    }
    return 10000;
  }, [activePoints, portfolio]);

  const currentPortVal = useMemo(() => {
    if (portfolio?.totalValue !== undefined) return portfolio.totalValue;
    if (portfolio?.netWorth !== undefined) return portfolio.netWorth;
    if (activePoints.length > 0) return activePoints[activePoints.length - 1].portfolioValue;
    return 10000;
  }, [portfolio, activePoints]);

  const startSpyVal = useMemo(() => {
    return activePoints[0]?.spyValue ?? 510;
  }, [activePoints]);

  const currentSpyVal = useMemo(() => {
    return activePoints[activePoints.length - 1]?.spyValue ?? startSpyVal;
  }, [activePoints, startSpyVal]);

  // Determine performance change & display metrics
  const { displayValue, displayDiff, displayPercent, displayTimeLabel, benchReturn, isPositive } = useMemo(() => {
    if (hoveredPoint && hoveredPoint.portfolioValue !== null) {
      const hVal = hoveredPoint.portfolioValue;
      const hDiff = hVal - startPortVal;
      const hPct = startPortVal > 0 ? (hDiff / startPortVal) * 100 : 0;
      
      let tLabel = hoveredPoint.timeLabel;
      if (hoveredPoint.time) {
        const d = new Date(hoveredPoint.time * 1000);
        if (timeRange === '1D') {
          tLabel = d.toLocaleTimeString('en-US', {
            timeZone: 'America/New_York',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          });
        } else {
          tLabel = d.toLocaleDateString('en-US', {
            timeZone: 'America/New_York',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          });
        }
      }

      let bRet = 0;
      if (hoveredPoint.spyValue !== null && startSpyVal > 0) {
        bRet = ((hoveredPoint.spyValue - startSpyVal) / startSpyVal) * 100;
      }

      return {
        displayValue: hVal,
        displayDiff: hDiff,
        displayPercent: hPct,
        displayTimeLabel: tLabel,
        benchReturn: bRet,
        isPositive: hDiff >= 0,
      };
    }

    // Default (unhovered) metrics: prioritize accurate values from portfolio store
    let diff = currentPortVal - startPortVal;
    let pct = startPortVal > 0 ? (diff / startPortVal) * 100 : 0;
    let tLabel = 'Today';

    if (timeRange === '1D') {
      if (portfolio?.dayPerformanceUSD !== undefined) {
        diff = portfolio.dayPerformanceUSD;
        pct = portfolio.dayPerformancePercent ?? (startPortVal > 0 ? (diff / startPortVal) * 100 : 0);
      }
      tLabel = 'Today';
    } else if (timeRange === 'ALL') {
      if (portfolio?.totalPerformanceUSD !== undefined) {
        diff = portfolio.totalPerformanceUSD;
        pct = portfolio.totalPerformancePercent ?? ((diff / 10000) * 100);
      }
      tLabel = 'All Time';
    } else if (timeRange === '1W') {
      tLabel = 'Past Week';
    } else if (timeRange === '1M') {
      tLabel = 'Past Month';
    } else if (timeRange === '1Y') {
      tLabel = 'Past Year';
    }

    let bRet = 0;
    if (startSpyVal > 0 && currentSpyVal > 0) {
      bRet = ((currentSpyVal - startSpyVal) / startSpyVal) * 100;
    }

    return {
      displayValue: currentPortVal,
      displayDiff: diff,
      displayPercent: pct,
      displayTimeLabel: tLabel,
      benchReturn: bRet,
      isPositive: diff >= 0,
    };
  }, [hoveredPoint, startPortVal, currentPortVal, startSpyVal, currentSpyVal, timeRange, portfolio]);

  // Chart styling colors
  const strokeColor = isPositive ? '#10B981' : '#F43F5E';
  const gradientId = isPositive ? 'robinhoodGainGradient' : 'robinhoodLossGradient';
  const spyColor = '#38BDF8'; // Sky blue for benchmark line

  // Interactive mouse scrubbing
  const handleMouseMove = (state: any) => {
    if (state && state.activePayload && state.activePayload.length > 0) {
      const activePoint = state.activePayload[0].payload as ChartPoint26;
      if (activePoint.portfolioValue !== null) {
        setHoveredPoint(activePoint);
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
    setHoveredPoint(null);
    if (onHover) {
      onHover(null);
    }
  };

  // Milestone dot renderer for unlocked achievements
  const renderCustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload && payload.achievements && payload.achievements.length > 0) {
      return (
        <g
          key={`achievement-dot-${payload.slotIndex}`}
          className="cursor-pointer"
          onClick={() => onLookAchievement && onLookAchievement(payload.achievements[0].id)}
        >
          <circle
            cx={cx}
            cy={cy}
            r={6}
            fill="#F59E0B"
            stroke="#0F172A"
            strokeWidth={2}
            className="hover:scale-125 transition-transform"
          />
          <circle
            cx={cx}
            cy={cy}
            r={2.5}
            fill="#FFFFFF"
            className="animate-ping"
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
        </g>
      );
    }
    return null;
  };

  // Y-Axis domain with padding
  const yDomain = useMemo(() => {
    if (activePoints.length === 0) return ['auto', 'auto'];
    const values = activePoints.flatMap((p) => [
      p.portfolioValue,
      showBenchmark && p.spyValue !== null ? p.spyValue : p.portfolioValue,
    ]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = Math.max((max - min) * 0.12, 10);
    return [Math.max(0, Math.floor(min - padding)), Math.ceil(max + padding)];
  }, [activePoints, showBenchmark]);

  return (
    <div className="w-full h-full flex flex-col justify-between font-sans select-none">
      {/* Top Header Section (Robinhood Aesthetic) */}
      <div className="flex flex-col gap-1.5 mb-2">
        {/* Row 1: Subtitle & Controls */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Investing
          </span>

          <div className="flex items-center gap-2">
            {/* Market Countdown Status */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 text-[11px] font-semibold">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${marketStatus.isOpen ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${marketStatus.isOpen ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              </span>
              <span className={marketStatus.isOpen ? 'text-emerald-500 dark:text-emerald-400' : 'text-amber-500 dark:text-amber-400'}>
                {marketStatus.label}
              </span>
            </div>

            {/* Benchmark Selector */}
            <div className="relative">
              <button
                onClick={() => setIsBenchmarkMenuOpen(!isBenchmarkMenuOpen)}
                className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-lg bg-slate-100 dark:bg-[#161B26] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer shadow-sm"
              >
                <span>{selectedBenchmark}</span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {isBenchmarkMenuOpen && (
                <div className="absolute right-0 mt-1 w-28 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-30 font-sans">
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

        {/* Row 2: Large Net Worth Display (Dynamically scrubs on hover) */}
        <div className={`text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white font-num-${numberFont}`}>
          ${displayValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>

        {/* Row 3: Primary Portfolio Change & Timestamp */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`flex items-center gap-1 text-xs sm:text-sm font-bold ${isPositive ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
            <span>{isPositive ? '▲' : '▼'}</span>
            <span>
              ${Math.abs(displayDiff).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span>
              ({Math.abs(displayPercent).toFixed(2)}%)
            </span>
          </div>

          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
            {displayTimeLabel}
          </span>
        </div>

        {/* Row 4: Benchmark Return Indicator (Sky Blue) */}
        {showBenchmark && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-500 dark:text-sky-400 mt-0.5">
            <span>{benchReturn >= 0 ? '▲' : '▼'}</span>
            <span>{Math.abs(benchReturn).toFixed(2)}%</span>
            <span className="uppercase tracking-wider">{selectedBenchmark}</span>
          </div>
        )}
      </div>

      {/* Chart Canvas Area */}
      <div className="w-full flex-1 h-full min-h-[220px] relative mt-1">
        {!isMounted ? (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm font-medium">
            Loading chart...
          </div>
        ) : activePoints.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm font-medium">
            Awaiting live portfolio snapshots...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={220} debounce={50}>
            <AreaChart
              data={chartData}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              margin={{ top: 10, right: 4, left: 4, bottom: 2 }}
            >
              <defs>
                {/* Emerald Gain Gradient */}
                <linearGradient id="robinhoodGainGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.18} />
                  <stop offset="60%" stopColor="#10B981" stopOpacity={0.03} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>

                {/* Crimson Loss Gradient */}
                <linearGradient id="robinhoodLossGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F43F5E" stopOpacity={0.18} />
                  <stop offset="60%" stopColor="#F43F5E" stopOpacity={0.03} />
                  <stop offset="100%" stopColor="#F43F5E" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              {/* Horizontal Reference Line at starting baseline */}
              {startPortVal > 0 && (
                <ReferenceLine
                  y={startPortVal}
                  stroke="#475569"
                  strokeDasharray="3 3"
                  strokeOpacity={0.4}
                />
              )}

              {/* Clean invisible axes for pure minimalist aesthetic */}
              <XAxis dataKey="timeLabel" hide={true} />
              <YAxis domain={yDomain} hide={true} />

              {/* Crosshair cursor - header smoothly handles value readouts */}
              <Tooltip
                cursor={{
                  stroke: strokeColor,
                  strokeWidth: 1.5,
                  strokeDasharray: '3 3',
                  strokeOpacity: 0.7,
                }}
                content={() => null}
              />

              {/* Benchmark Line (Sky Blue) */}
              {showBenchmark && (
                <Line
                  type="monotone"
                  dataKey="spyValue"
                  stroke={spyColor}
                  strokeWidth={1.75}
                  dot={false}
                  activeDot={false}
                  connectNulls={false}
                  isAnimationActive={false}
                />
              )}

              {/* Primary Portfolio Performance Curve & Fill */}
              <Area
                type="monotone"
                dataKey="portfolioValue"
                stroke={strokeColor}
                strokeWidth={2.25}
                fill={`url(#${gradientId})`}
                dot={renderCustomDot}
                activeDot={{
                  r: 5,
                  fill: strokeColor,
                  stroke: '#0F172A',
                  strokeWidth: 2,
                }}
                connectNulls={false}
                isAnimationActive={true}
                animationDuration={500}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Bottom Timeframe Selector Bar (Matching Reference Photo 2) */}
      <div className="pt-2.5 pb-1 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {(['1D', '1W', '1M', '1Y', 'ALL'] as const).map((range) => {
            const isActive = timeRange === range;
            return (
              <button
                key={range}
                onClick={() => onTimeRangeChange(range)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all duration-150 cursor-pointer ${
                  isActive
                    ? (isPositive
                        ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                        : 'bg-rose-500 text-white shadow-sm shadow-rose-500/30')
                    : 'text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                {range}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
