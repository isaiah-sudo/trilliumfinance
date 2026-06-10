'use client';

import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine
} from 'recharts';

interface ChartPoint {
  time: number;
  value: number;
}

interface PortfolioChartProps {
  data: { portfolio: ChartPoint[]; benchmark: ChartPoint[] };
  timeRange: '1D' | '1W' | '1M' | '1Y';
  onTimeRangeChange: (range: '1D' | '1W' | '1M' | '1Y') => void;
  onHover?: (data: { portfolio: number; spy: number; time: number } | null) => void;
}

export default function PortfolioChart({
  data,
  timeRange,
  onTimeRangeChange,
  onHover
}: PortfolioChartProps) {
  const [isHovering, setIsHovering] = useState(false);

  // Combine portfolio and benchmark data for Recharts, ensuring exactly 78 points
  const chartData = useMemo(() => {
    const portfolio = Array.isArray(data?.portfolio) ? data.portfolio : [];
    const benchmark = Array.isArray(data?.benchmark) ? data.benchmark : [];
    
    const pointsCount = Math.max(portfolio.length, benchmark.length);
    if (pointsCount === 0) return [];

    const combined = [];
    for (let i = 0; i < pointsCount; i++) {
      const portPt = portfolio[i];
      const benchPt = benchmark[i];
      const time = portPt?.time || benchPt?.time || 0;

      combined.push({
        index: i,
        time,
        portfolioValue: portPt?.value ?? 0,
        spyValue: benchPt?.value ?? 0,
        // formatted date for tooltip/XAxis
        dateStr: new Date(time * 1000).toLocaleDateString('en-US', {
          timeZone: 'America/New_York',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
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
          time: activePoint.time
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
            <LineChart
              data={chartData}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              margin={{ top: 10, right: 5, left: 5, bottom: 5 }}
            >
              <XAxis dataKey="index" hide />
              <YAxis domain={['auto', 'auto']} hide />
              
              <Tooltip
                trigger="hover"
                content={() => null} // Hide default tooltip card
                cursor={{
                  stroke: '#475569',
                  strokeWidth: 1.5,
                  strokeDasharray: '4 4'
                }}
              />

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

              {/* Portfolio Value Line */}
              <Line
                type="monotone"
                dataKey="portfolioValue"
                stroke={primaryColor}
                strokeWidth={2.5}
                dot={false}
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
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
