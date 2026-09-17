'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronDown, Check, ArrowUpRight, ArrowDownRight, Award } from 'lucide-react';
import {
  RawSnapshot,
  ChartPoint26,
  TimeRange,
  transformPortfolioData,
  getESTDateInfo,
  generateOrganicMarketFluctuation,
} from '@/lib/portfolioTransformation';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';

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
      const secondsUntilMidnight = 24 * 3600 - currentTotalSeconds;
      remainingSec = secondsUntilMidnight + (daysUntilOpen - 1) * 24 * 3600 + marketOpenSec;
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

function getSplineSvgPath(coords: [number, number][]): string {
  if (coords.length === 0) return '';
  if (coords.length === 1) return `M ${coords[0][0].toFixed(1)} ${coords[0][1].toFixed(1)}`;

  let d = `M ${coords[0][0].toFixed(1)} ${coords[0][1].toFixed(1)}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[Math.max(i - 1, 0)];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[Math.min(i + 2, coords.length - 1)];

    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedBenchmark, setSelectedBenchmark] = useState<'SPY' | 'DJI' | 'NASDAQ'>('SPY');
  const [isBenchmarkMenuOpen, setIsBenchmarkMenuOpen] = useState(false);
  const [marketStatus, setMarketStatus] = useState<{ isOpen: boolean; label: string }>({ isOpen: false, label: '' });
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

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
    const filtered = chartData.filter((p) => p.portfolioValue !== null) as (ChartPoint26 & { portfolioValue: number })[];
    if (filtered.length >= 2) return filtered;

    // Graceful fallback for brand new accounts with no snapshots
    const curVal = portfolio?.totalValue ?? portfolio?.netWorth ?? 10000;
    const baseVal = portfolio?.dayPerformanceUSD !== undefined ? curVal - portfolio.dayPerformanceUSD : curVal;
    const diff = curVal - baseVal;
    const dateSeed = 42;

    return Array.from({ length: 26 }, (_, i) => {
      const t = i / 25;
      const portWave = generateOrganicMarketFluctuation(t, baseVal, diff, dateSeed, 1.0);
      const portVal = baseVal + t * diff + portWave;
      const spyWave = generateOrganicMarketFluctuation(t, 510, 2.5, dateSeed + 37, 0.6);
      const spyVal = 510 + t * 2.5 + spyWave;
      const hour = 9 + Math.floor((30 + i * 15) / 60);
      const min = (30 + i * 15) % 60;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour;

      return {
        slotIndex: i,
        timeLabel: timeRange === '1D' ? `${displayHour}:${String(min).padStart(2, '0')} ${ampm}` : `Slot ${i}`,
        time: Math.floor(Date.now() / 1000) - (25 - i) * 900,
        portfolioValue: Number(portVal.toFixed(2)),
        spyValue: Number(spyVal.toFixed(2)),
        achievements: [],
        isFuture: false,
      };
    });
  }, [chartData, portfolio, timeRange]);

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

  const hoveredPoint = hoverIndex !== null && activePoints[hoverIndex] ? activePoints[hoverIndex] : null;

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

    // Default metrics when not hovering
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
        pct = portfolio.totalPerformancePercent ?? (diff / 10000) * 100;
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

  const strokeColor = isPositive ? '#10B981' : '#F43F5E';
  const gradientId = `portfolioGrad_${isPositive ? 'gain' : 'loss'}`;
  const spyColor = '#38BDF8';

  // SVG Coordinates
  const W = 600;
  const H = 220;
  const padY = 16;
  const usableH = H - padY * 2;

  const {
    portfolioCoords,
    portfolioLinePath,
    portfolioAreaPath,
    benchCoords,
    benchLinePath,
    baselineY,
  } = useMemo(() => {
    if (activePoints.length === 0) {
      return {
        portfolioCoords: [],
        portfolioLinePath: '',
        portfolioAreaPath: '',
        benchCoords: [],
        benchLinePath: '',
        baselineY: H / 2,
      };
    }

    const portValues = activePoints.map((p) => p.portfolioValue);
    const benchScaledValues = activePoints.map((p) => {
      if (p.spyValue !== null && startSpyVal > 0) {
        return startPortVal * (p.spyValue / startSpyVal);
      }
      return p.portfolioValue;
    });

    const allValues = [...portValues, ...(showBenchmark ? benchScaledValues : [])];
    const rawMin = Math.min(...allValues);
    const rawMax = Math.max(...allValues);
    const padding = Math.max((rawMax - rawMin) * 0.12, rawMin * 0.005 || 5);

    const min = Math.max(0, rawMin - padding);
    const max = rawMax + padding;
    const range = max - min || 1;

    const pCoords: [number, number][] = activePoints.map((p, i) => {
      const x = (i / (activePoints.length - 1)) * W;
      const y = H - padY - ((p.portfolioValue - min) / range) * usableH;
      return [x, y];
    });

    const bCoords: [number, number][] = activePoints.map((p, i) => {
      const scaledVal = p.spyValue !== null && startSpyVal > 0
        ? startPortVal * (p.spyValue / startSpyVal)
        : p.portfolioValue;
      const x = (i / (activePoints.length - 1)) * W;
      const y = H - padY - ((scaledVal - min) / range) * usableH;
      return [x, y];
    });

    const lPath = getSplineSvgPath(pCoords);
    const aPath = pCoords.length > 0
      ? `${lPath} L ${pCoords[pCoords.length - 1][0].toFixed(1)} ${H} L ${pCoords[0][0].toFixed(1)} ${H} Z`
      : '';

    const bPath = showBenchmark ? getSplineSvgPath(bCoords) : '';
    const baseY = H - padY - ((startPortVal - min) / range) * usableH;

    return {
      portfolioCoords: pCoords,
      portfolioLinePath: lPath,
      portfolioAreaPath: aPath,
      benchCoords: bCoords,
      benchLinePath: bPath,
      baselineY: baseY,
    };
  }, [activePoints, startPortVal, startSpyVal, showBenchmark, W, H, usableH]);

  // Pointer scrubbing
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el || activePoints.length === 0) return;
    const rect = el.getBoundingClientRect();
    const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const idx = Math.min(activePoints.length - 1, Math.max(0, Math.round(frac * (activePoints.length - 1))));
    setHoverIndex(idx);

    if (onHover && activePoints[idx]) {
      const p = activePoints[idx];
      onHover({
        portfolio: p.portfolioValue,
        spy: p.spyValue ?? p.portfolioValue,
        time: p.time ?? 0,
        achievements: p.achievements,
      });
    }
  };

  const handlePointerLeave = () => {
    setHoverIndex(null);
    if (onHover) onHover(null);
  };

  const activePortCoord = hoverIndex !== null && portfolioCoords[hoverIndex] ? portfolioCoords[hoverIndex] : null;
  const activeBenchCoord = hoverIndex !== null && benchCoords[hoverIndex] ? benchCoords[hoverIndex] : null;

  return (
    <div className="w-full h-full flex flex-col justify-between font-sans select-none">
      {/* Top Header Section */}
      <div className="flex flex-col gap-1.5 mb-2">
        {/* Row 1: Subtitle & Controls */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Investing
          </span>

          <div className="flex items-center gap-2">
            {/* Market Countdown Status (Green until it opens, Red until it closes) */}
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-900/80 border border-slate-800 text-[11px] font-mono font-medium">
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    !marketStatus.isOpen ? 'bg-emerald-400' : 'bg-rose-400'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    !marketStatus.isOpen ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                />
              </span>
              <span className={!marketStatus.isOpen ? 'text-emerald-400' : 'text-rose-400'}>
                {marketStatus.label}
              </span>
            </div>

            {/* Benchmark Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsBenchmarkMenuOpen(!isBenchmarkMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-mono font-bold rounded-md bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer shadow-xs"
              >
                <span>{selectedBenchmark}</span>
                <ChevronDown className="h-3 w-3 text-slate-500" />
              </button>

              {isBenchmarkMenuOpen && (
                <div className="absolute right-0 mt-1 w-28 rounded-lg bg-[#0b0e17] border border-slate-800 shadow-xl py-1 z-30 font-sans">
                  {(['SPY', 'DJI', 'NASDAQ'] as const).map((bm) => (
                    <button
                      key={bm}
                      type="button"
                      onClick={() => {
                        setSelectedBenchmark(bm);
                        setIsBenchmarkMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-semibold flex items-center justify-between hover:bg-slate-800/60 transition-colors cursor-pointer ${
                        selectedBenchmark === bm ? 'text-emerald-400' : 'text-slate-300'
                      }`}
                    >
                      <span>{bm}</span>
                      {selectedBenchmark === bm && <Check className="h-3 w-3 text-emerald-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Large Net Worth Display (Dynamically scrubs on hover with AnimatedNumber) */}
        <div className={`text-3xl sm:text-4xl font-black tracking-tight text-white font-mono tabular-nums`}>
          <AnimatedNumber
            value={displayValue}
            formatter={(val) => `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          />
        </div>

        {/* Row 3: Primary Portfolio Change & Timestamp */}
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className={`inline-flex items-center gap-1 text-xs sm:text-sm font-bold font-mono px-2 py-0.5 rounded-md ${
              isPositive
                ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
            }`}
          >
            {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            <span>
              <AnimatedNumber
                value={displayDiff}
                formatter={(val) => `${val >= 0 ? '+' : '-'}$${Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              />
            </span>
            <span>
              (<AnimatedNumber
                value={displayPercent}
                formatter={(val) => `${val >= 0 ? '+' : '-'}${Math.abs(val).toFixed(2)}%`}
              />)
            </span>
          </div>

          <span className="text-xs font-mono font-medium text-slate-400">
            {displayTimeLabel}
          </span>

          {/* Row 4: Benchmark Return Indicator (Selected benchmark on left, arrow + % on right, green if up, red if down) */}
          {showBenchmark && (
            <span
              className={`inline-flex items-center gap-1 text-xs font-mono font-semibold ml-1 ${
                benchReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              <span className="uppercase tracking-wider text-[10px] opacity-80">{selectedBenchmark}</span>
              <span>{benchReturn >= 0 ? '▲' : '▼'}</span>
              <AnimatedNumber
                value={Math.abs(benchReturn)}
                formatter={(val) => `${val.toFixed(2)}%`}
              />
            </span>
          )}
        </div>
      </div>

      {/* Pure SVG Fluent Chart Canvas */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="w-full flex-1 h-full min-h-[200px] sm:min-h-[220px] relative mt-1 select-none cursor-crosshair touch-none overflow-hidden"
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.22" />
              <stop offset="70%" stopColor={strokeColor} stopOpacity="0.03" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Subtle Horizontal Reference Line at Baseline Starting Value */}
          <line
            x1="0"
            y1={baselineY}
            x2={W}
            y2={baselineY}
            stroke="#334155"
            strokeDasharray="3 3"
            strokeWidth="1"
            strokeOpacity="0.4"
            vectorEffect="non-scaling-stroke"
          />

          {/* Benchmark Line (Sky Blue) */}
          {showBenchmark && benchLinePath && (
            <path
              d={benchLinePath}
              fill="none"
              stroke={spyColor}
              strokeWidth="1.6"
              strokeDasharray="4 2"
              strokeOpacity="0.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          )}

          {/* Portfolio Area Gradient Fill */}
          {portfolioAreaPath && (
            <path
              d={portfolioAreaPath}
              fill={`url(#${gradientId})`}
              className="transition-opacity duration-300"
            />
          )}

          {/* Primary Portfolio Performance Curve */}
          {portfolioLinePath && (
            <path
              d={portfolioLinePath}
              fill="none"
              stroke={strokeColor}
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          )}

          {/* Achievement Milestone Pins */}
          {activePoints.map((point, idx) => {
            if (point.achievements && point.achievements.length > 0 && portfolioCoords[idx]) {
              const [cx, cy] = portfolioCoords[idx];
              return (
                <g
                  key={`ach-milestone-${idx}`}
                  className="cursor-pointer group"
                  onClick={() => onLookAchievement?.(point.achievements![0].id)}
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
                  />
                </g>
              );
            }
            return null;
          })}

          {/* Interactive Scrubbing Vertical Hairline Guide */}
          {activePortCoord && (
            <line
              x1={activePortCoord[0]}
              y1="0"
              x2={activePortCoord[0]}
              y2={H}
              stroke="rgba(255, 255, 255, 0.25)"
              strokeDasharray="2 2"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>

        {/* Clean, circular, non-distorting hover dots (HTML overlay avoids SVG preserveAspectRatio non-uniform warping) */}
        {showBenchmark && activeBenchCoord && (
          <div
            className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full z-10"
            style={{
              left: `${(activeBenchCoord[0] / W) * 100}%`,
              top: `${(activeBenchCoord[1] / H) * 100}%`,
              width: '6px',
              height: '6px',
              backgroundColor: spyColor,
              boxShadow: '0 0 0 1.5px #0b0f17',
            }}
          />
        )}
        {activePortCoord && (
          <div
            className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full z-10"
            style={{
              left: `${(activePortCoord[0] / W) * 100}%`,
              top: `${(activePortCoord[1] / H) * 100}%`,
              width: '7px',
              height: '7px',
              backgroundColor: strokeColor,
              boxShadow: `0 0 0 1.5px #0b0f17, 0 0 6px ${strokeColor}99`,
            }}
          />
        )}

        {/* Floating Price Tooltip above Hover Point */}
        {activePortCoord && (
          <div
            className="absolute pointer-events-none z-20 flex flex-col items-center transition-all duration-75"
            style={{
              left: `${(activePortCoord[0] / W) * 100}%`,
              top: `${(activePortCoord[1] / H) * 100}%`,
              transform: activePortCoord[1] < 45
                ? 'translate(-50%, 12px)'
                : 'translate(-50%, calc(-100% - 10px))',
            }}
          >
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#070a12]/95 backdrop-blur-md border border-slate-700/80 shadow-2xl shadow-black/80 whitespace-nowrap text-center">
              <span className="text-xs font-black text-white font-mono tracking-tight tabular-nums">
                ${displayValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-medium">
                · {displayTimeLabel}
              </span>
            </div>
            {/* Downward / Upward Caret Pointer */}
            <div
              className={`w-0 h-0 border-x-4 border-x-transparent ${
                activePortCoord[1] < 45
                  ? 'border-b-4 border-b-slate-700/80 -order-1 mb-[-1px]'
                  : 'border-t-4 border-t-slate-700/80 mt-[-1px]'
              }`}
            />
          </div>
        )}
      </div>

      {/* Bottom Timeframe Selector Bar */}
      <div className="pt-2.5 pb-1 border-t border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {(['1D', '1W', '1M', '1Y', 'ALL'] as const).map((range) => {
            const isActive = timeRange === range;
            return (
              <button
                key={range}
                type="button"
                onClick={() => onTimeRangeChange(range)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? isPositive
                      ? 'bg-emerald-500 text-slate-950 shadow-xs'
                      : 'bg-rose-500 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
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
