'use client';

import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid
} from 'recharts';

interface ChartPoint {
  time: number;
  value: number;
  achievements?: any[];
}

interface PortfolioChartProps {
  data: { portfolio: ChartPoint[]; benchmark: ChartPoint[] };
  timeRange: '1D' | '1W' | '1M' | '1Y';
  onTimeRangeChange: (range: '1D' | '1W' | '1M' | '1Y') => void;
  onHover?: (data: { portfolio: number; spy: number; time: number; achievements?: any[] } | null) => void;
  onLookAchievement?: (achievementId: string) => void;
}

export default function PortfolioChart({
  data,
  timeRange,
  onTimeRangeChange,
  onHover,
  onLookAchievement
}: PortfolioChartProps) {
  const [isHovering, setIsHovering] = useState(false);

  // Combine portfolio and benchmark data for Recharts, ensuring exactly 78 points
  const chartData = useMemo(() => {
    const portfolio = Array.isArray(data?.portfolio) ? data.portfolio : [];
    const benchmark = Array.isArray(data?.benchmark) ? data.benchmark : [];
    
    const pointsCount = Math.max(portfolio.length, benchmark.length);
    if (pointsCount === 0) return [];

    const startPortfolioVal = portfolio[0]?.value ?? 0;
    const startBenchmarkVal = benchmark[0]?.value ?? 0;

    const combined = [];
    for (let i = 0; i < pointsCount; i++) {
      const portPt = portfolio[i];
      const benchPt = benchmark[i];
      const time = portPt?.time || benchPt?.time || 0;
      const rawSpy = benchPt?.value ?? 0;

      // Scale SPY performance to start at the exact same dollar value as the portfolio
      const spyValue = startBenchmarkVal > 0 
        ? startPortfolioVal * (rawSpy / startBenchmarkVal)
        : rawSpy;

      combined.push({
        index: i,
        time,
        portfolioValue: portPt?.value ?? 0,
        spyValue,
        // formatted date for tooltip/XAxis
        dateStr: new Date(time * 1000).toLocaleDateString('en-US', {
          timeZone: 'America/New_York',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        achievements: portPt?.achievements || []
      });
    }

    // Truncate post-market data points for 1D chart to prevent flatlines
    if (timeRange === '1D') {
      return combined.filter(pt => {
        const date = new Date(pt.time * 1000);
        const estDateStr = date.toLocaleString('en-US', { timeZone: 'America/New_York', hour12: false });
        const parts = estDateStr.split(', ');
        if (!parts[1]) return true;
        const timeParts = parts[1].split(':');
        const estHour = parseInt(timeParts[0]);
        const estMin = parseInt(timeParts[1]);
        const minutesSinceMidnight = estHour * 60 + estMin;
        
        // Hide points after 4:00 PM EST (960 minutes)
        return minutesSinceMidnight <= 16 * 60;
      });
    }

    return combined;
  }, [data, timeRange]);

  // Determine if the return is positive over the selected timeframe
  const isPositive = useMemo(() => {
    if (chartData.length < 2) return true;
    const startValue = chartData[0].portfolioValue;
    const endValue = chartData[chartData.length - 1].portfolioValue;
    return endValue >= startValue;
  }, [chartData]);

  // Color scheme: Emerald Green if positive, Rose Red if negative
  const primaryColor = isPositive ? '#10b981' : '#f43f5e';
  const secondaryColor = '#64748b'; // Slate gray

  const handleMouseMove = (state: any) => {
    if (state && state.activePayload && state.activePayload.length > 0) {
      const activePoint = state.activePayload[0].payload;
      setIsHovering(true);
      if (onHover) {
        onHover({
          portfolio: activePoint.portfolioValue,
          spy: activePoint.spyValue,
          time: activePoint.time,
          achievements: activePoint.achievements
        });
      }
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (onHover) {
      onHover(null);
    }
  };

  const formatXAxisTick = (time: number) => {
    if (!time) return '';
    const date = new Date(time * 1000);
    if (timeRange === '1D') {
      return date.toLocaleTimeString('en-US', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }
    return date.toLocaleDateString('en-US', {
      timeZone: 'America/New_York',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderCustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.achievements && payload.achievements.length > 0) {
      return (
        <g key={`milestone-dot-${payload.time}`} className="cursor-pointer">
          <circle
            cx={cx}
            cy={cy}
            r={7}
            fill="#f59e0b" // Amber/gold
            stroke="#0f172a"
            strokeWidth={2}
          />
          <circle
            cx={cx}
            cy={cy}
            r={3}
            fill="#fff"
            className="animate-ping"
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
        </g>
      );
    }
    return null;
  };

  return (
    <div className="w-full flex flex-col">
      {/* Chart Controls */}
      <div className="flex justify-end gap-2 mb-4">
        {(['1D', '1W', '1M', '1Y'] as const).map((range) => (
          <button
            key={range}
            onClick={() => onTimeRangeChange(range)}
            className={`px-4 py-1.5 rounded-xl text-xs font-extrabold tracking-wider transition-all duration-200 border ${
              timeRange === range
                ? 'bg-teal-500/10 text-teal-400 border-teal-500/30 shadow-[0_0_15px_rgba(20,184,166,0.15)]'
                : 'bg-[#0f111a]/40 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Chart Container */}
      <div className="w-full h-[320px] relative select-none">
        {chartData.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm italic">
            No chart data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              margin={{ top: 10, right: 5, left: 5, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={primaryColor} stopOpacity={0.25}/>
                  <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#334155"
                opacity={0.15}
              />

              <XAxis
                dataKey="time"
                stroke="#475569"
                fontSize={10}
                fontWeight="bold"
                tickLine={false}
                axisLine={false}
                tickFormatter={formatXAxisTick}
                dy={10}
                minTickGap={25}
              />

              <YAxis
                orientation="right"
                domain={['auto', 'auto']}
                stroke="#475569"
                fontSize={10}
                fontWeight="bold"
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `$${val.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
                dx={5}
              />
              
              <Tooltip
                trigger="hover"
                wrapperStyle={{ pointerEvents: 'auto' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#0f111a]/95 backdrop-blur-md border border-slate-800/80 p-3.5 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.5)] flex flex-col gap-2 text-xs pointer-events-auto">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest border-b border-slate-800/80 pb-1.5 mb-0.5">
                          {data.dateStr} EST
                        </p>
                        <div className="flex items-center justify-between gap-6">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(45,212,191,0.6)]" style={{ backgroundColor: primaryColor }} />
                            <span className="font-extrabold text-slate-300">Portfolio</span>
                          </div>
                          <span className="font-black" style={{ color: primaryColor }}>
                            ${data.portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-6">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                            <span className="font-extrabold text-slate-400">SPY (S&P 500)</span>
                          </div>
                          <span className="font-bold text-slate-300">
                            ${data.spyValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        {data.achievements && data.achievements.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-col gap-1.5 pointer-events-auto">
                            <p className="text-amber-400 font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                              🏆 Earned {data.achievements[0].title}
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                if (onLookAchievement) {
                                  onLookAchievement(data.achievements[0].id);
                                }
                              }}
                              className="w-full py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#0f111a] font-extrabold transition-all duration-150 uppercase tracking-wider text-[9px] pointer-events-auto cursor-pointer flex items-center justify-center"
                            >
                              Look
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
                cursor={{
                  stroke: '#475569',
                  strokeWidth: 1.5,
                  strokeDasharray: '4 4'
                }}
              />

              {chartData.length > 0 && (
                <ReferenceLine
                  y={chartData[0].portfolioValue}
                  stroke="#475569"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                  opacity={0.35}
                />
              )}

              {/* SPY Benchmark Line */}
              <Line
                type="monotone"
                dataKey="spyValue"
                stroke={secondaryColor}
                strokeWidth={1}
                strokeDasharray="4 4"
                dot={false}
                activeDot={false}
                opacity={0.4}
              />

              {/* Portfolio Value Area */}
              <Area
                type="monotone"
                dataKey="portfolioValue"
                stroke={primaryColor}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorPortfolio)"
                dot={renderCustomDot}
                activeDot={
                  isHovering
                    ? {
                        r: 6,
                        stroke: primaryColor,
                        strokeWidth: 2,
                        fill: '#0f172a'
                      }
                    : false
                }
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
