'use client';

import React, { useState, useMemo } from 'react';
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

  // Transform raw data into the exact 26-point dataset
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
  const strokeColor = isPositive ? '#10B981' : '#F43F5E'; // Emerald Green / Crimson Rose
  const gradientId = isPositive ? 'portfolioGainGradient' : 'portfolioLossGradient';
  const spyColor = '#64748B'; // Slate Gray for Benchmark

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
        {/* Header Stats & Disclaimer */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-baseline gap-1.5">
            <span className={`text-xl font-extrabold tracking-tight ${usdDiff >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
              {usdDiff >= 0 ? '+' : ''}${usdDiff.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`text-xs font-bold ${usdDiff >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
              ({percentDiff >= 0 ? '+' : ''}{percentDiff.toFixed(2)}%)
            </span>
          </div>

          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium sm:border-l border-slate-300 dark:border-slate-800 sm:pl-3">
            Gray dashed line indicates SPY benchmark performance
          </span>
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
                tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }}
                dy={6}
              />
              <YAxis
                domain={yDomain}
                hide={true}
              />

              {/* TradingView Tooltip Overlay */}
              <Tooltip
                content={<CustomTooltip timeRange={timeRange} startPortVal={startPortVal} startSpyVal={startSpyVal} />}
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
function CustomTooltip({ active, payload, startPortVal, startSpyVal }: any) {
  if (!active || !payload || !payload.length) return null;

  const data: ChartPoint26 = payload[0].payload;
  if (data.portfolioValue === null) return null;

  const portVal = data.portfolioValue;
  const portDiff = portVal - (startPortVal || portVal);
  const portPct = startPortVal > 0 ? (portDiff / startPortVal) * 100 : 0;

  const spyVal = data.spyValue;
  const spyDiff = spyVal !== null ? spyVal - (startSpyVal || spyVal) : 0;
  const spyPct = startSpyVal > 0 ? (spyDiff / startSpyVal) * 100 : 0;

  return (
    <div className="rounded-xl bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-3 shadow-xl text-xs font-sans">
      <div className="text-slate-400 font-medium mb-1.5">{data.timeLabel}</div>
      
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

      {/* SPY Benchmark Value + Percentage */}
      {spyVal !== null && (
        <div className="flex items-center gap-2 mt-1.5">
          <span className="w-2 h-2 rounded-full bg-slate-400" />
          <span className="text-slate-600 dark:text-slate-400 font-medium">SPY Benchmark:</span>
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
