'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { Spinner } from './Spinner';

interface CandlePoint {
  time: number;
  timeLabel: string;
  price: number;
}

interface StockChartData {
  symbol: string;
  range: string;
  currentPrice: number;
  previousClose: number;
  periodChange: number;
  periodChangePercent: number;
  high: number;
  low: number;
  points: CandlePoint[];
}

interface StockPriceChartProps {
  symbol: string;
  className?: string;
}

type TimeRange = '1D' | '1W' | '1M' | '1Y';

export const StockPriceChart: React.FC<StockPriceChartProps> = ({ symbol, className = '' }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('1D');
  const [data, setData] = useState<StockChartData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<CandlePoint | null>(null);

  useEffect(() => {
    if (!symbol) return;
    let active = true;
    setLoading(true);
    setError(null);
    setHoveredPoint(null);

    fetch(`/api/stocks/candles?symbol=${encodeURIComponent(symbol)}&range=${timeRange}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load chart');
        return res.json();
      })
      .then((resData: StockChartData) => {
        if (active) {
          setData(resData);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || 'Error loading price history');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [symbol, timeRange]);

  // Determine starting price of the timeframe
  const startPrice = useMemo(() => {
    if (!data || !data.points || data.points.length === 0) return 0;
    return data.points[0].price;
  }, [data]);

  // Active displayed price (hovered point or current price)
  const displayPrice = useMemo(() => {
    if (hoveredPoint) return hoveredPoint.price;
    if (data?.currentPrice) return data.currentPrice;
    if (data?.points && data.points.length > 0) return data.points[data.points.length - 1].price;
    return 0;
  }, [hoveredPoint, data]);

  // Calculated delta from start of period
  const { diffUSD, diffPct, isPositive } = useMemo(() => {
    if (!startPrice || !displayPrice) {
      return { diffUSD: 0, diffPct: 0, isPositive: true };
    }
    const diffUSD = displayPrice - startPrice;
    const diffPct = (diffUSD / startPrice) * 100;
    return {
      diffUSD,
      diffPct,
      isPositive: diffUSD >= 0,
    };
  }, [startPrice, displayPrice]);

  const strokeColor = isPositive ? '#10B981' : '#F43F5E';
  const gradientId = `stockChartGrad_${symbol}_${isPositive ? 'gain' : 'loss'}`;

  // Y-axis bounds with safety padding
  const yDomain = useMemo(() => {
    if (!data?.points || data.points.length === 0) return ['auto', 'auto'];
    const prices = data.points.map((p) => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.08 || min * 0.02 || 2;
    return [Math.max(0, Math.floor(min - padding)), Math.ceil(max + padding)];
  }, [data]);

  return (
    <div className={`bg-[#141925]/90 border border-slate-800/80 rounded-3xl p-5 relative overflow-hidden shadow-xl ${className}`}>
      {/* Background aesthetic glow */}
      <div
        className={`absolute top-0 right-0 w-48 h-48 blur-[100px] pointer-events-none transition-colors duration-500 ${
          isPositive ? 'bg-emerald-500/10' : 'bg-rose-500/10'
        }`}
      />

      {/* Chart Top Bar: Price + Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Activity className="h-3 w-3 text-blue-400" /> Trillium Chart
            </span>
            {hoveredPoint && (
              <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded">
                {hoveredPoint.timeLabel}
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2.5">
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
              ${displayPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div
              className={`flex items-center gap-0.5 text-xs font-bold font-mono px-2 py-0.5 rounded-lg ${
                isPositive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
              }`}
            >
              {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              <span>
                {diffUSD >= 0 ? '+' : ''}${diffUSD.toFixed(2)} ({diffPct >= 0 ? '+' : ''}{diffPct.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Timeframe Button Controls */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          {(['1D', '1W', '1M', '1Y'] as const).map((range) => {
            const isActive = timeRange === range;
            return (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                  isActive
                    ? isPositive
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {range}
              </button>
            );
          })}
        </div>
      </div>

      {/* High / Low summary pills */}
      {data && !loading && (
        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 mb-3 pb-3 border-b border-slate-800/60 relative z-10">
          <div>
            <span className="text-slate-500 mr-1 font-sans text-[10px] uppercase font-bold">High</span>
            <span className="text-slate-200 font-bold">${data.high.toFixed(2)}</span>
          </div>
          <div className="h-3 w-px bg-slate-800" />
          <div>
            <span className="text-slate-500 mr-1 font-sans text-[10px] uppercase font-bold">Low</span>
            <span className="text-slate-200 font-bold">${data.low.toFixed(2)}</span>
          </div>
          <div className="h-3 w-px bg-slate-800" />
          <div>
            <span className="text-slate-500 mr-1 font-sans text-[10px] uppercase font-bold">Timeframe</span>
            <span className="text-blue-400 font-bold">{timeRange}</span>
          </div>
        </div>
      )}

      {/* Chart Canvas */}
      <div className="h-48 w-full relative">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/40 backdrop-blur-xs rounded-2xl z-20 space-y-2">
            <Spinner className="h-6 w-6 text-blue-500" />
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Syncing candles...</span>
          </div>
        )}

        {error && (
          <div className="h-full flex items-center justify-center text-xs text-rose-400 font-bold">
            {error}
          </div>
        )}

        {data && data.points.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data.points}
              margin={{ top: 8, right: 4, left: 4, bottom: 0 }}
              onMouseMove={(state: any) => {
                if (state && state.activePayload && state.activePayload.length > 0) {
                  const point = state.activePayload[0].payload as CandlePoint;
                  setHoveredPoint(point);
                }
              }}
              onMouseLeave={() => {
                setHoveredPoint(null);
              }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={strokeColor} stopOpacity={0.35} />
                  <stop offset="70%" stopColor={strokeColor} stopOpacity={0.05} />
                  <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#1e293b"
                opacity={0.5}
              />

              <XAxis dataKey="timeLabel" hide={true} />
              <YAxis domain={yDomain} hide={true} />

              <Tooltip content={() => null} />

              <Area
                type="monotone"
                dataKey="price"
                stroke={strokeColor}
                strokeWidth={2.2}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{
                  r: 5,
                  fill: strokeColor,
                  stroke: '#0e121f',
                  strokeWidth: 2,
                }}
                isAnimationActive={true}
                animationDuration={500}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
