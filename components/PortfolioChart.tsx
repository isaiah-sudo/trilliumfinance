'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, LineSeries } from 'lightweight-charts';
import { motion } from 'framer-motion';

interface PortfolioChartProps {
  data: { portfolio: any[]; benchmark: any[] };
  timeRange: '1D' | '1W' | '1M' | '1Y';
  onTimeRangeChange: (range: '1D' | '1W' | '1M' | '1Y') => void;
}

export default function PortfolioChart({ data, timeRange, onTimeRangeChange }: PortfolioChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const benchmarkSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const [hoverPrice, setHoverPrice] = useState<number | null>(null);
  const [isMarketClosed, setIsMarketClosed] = useState(false);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create Chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#64748b',
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: 'rgba(51, 65, 85, 0.3)' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderVisible: false,
      },
      rightPriceScale: {
        borderVisible: false,
        mode: 2, // PriceScaleMode.Percentage
        autoScale: true,
        alignLabels: true,
      },
      crosshair: {
        vertLine: {
          color: 'rgba(45, 212, 191, 0.4)',
          width: 1,
          style: 3,
          labelBackgroundColor: '#2dd4bf',
        },
        horzLine: {
          color: 'rgba(45, 212, 191, 0.4)',
          width: 1,
          style: 3,
          labelBackgroundColor: '#2dd4bf',
        },
      },
    });

    // Add Portfolio Line
    const mainSeries = chart.addSeries(LineSeries, {
      color: '#2dd4bf',
      lineWidth: 2,
      crosshairMarkerVisible: true,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    // Add Benchmark Line
    const benchmarkSeries = chart.addSeries(LineSeries, {
      color: '#64748b',
      lineWidth: 1,
      lineStyle: 2, // Dashed
      crosshairMarkerVisible: true,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    chartRef.current = chart;
    seriesRef.current = mainSeries;
    benchmarkSeriesRef.current = benchmarkSeries;

    // Handle Resize
    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };
    window.addEventListener('resize', handleResize);

    // Crosshair move event for Market Timer
    chart.subscribeCrosshairMove((param) => {
      if (param.time && param.point && mainSeries) {
        const price = param.seriesData.get(mainSeries) as any;
        setHoverPrice(price?.value ?? null);
        
        // EST Logic check (simple approximation: market open 9:30 AM to 4:00 PM EST)
        // If the timestamp hour (converted to EST) is outside this, we can flag it.
        const date = new Date((param.time as number) * 1000);
        const estDateStr = date.toLocaleString('en-US', { timeZone: 'America/New_York', hour12: false });
        const estHour = parseInt(estDateStr.split(', ')[1].split(':')[0]);
        const estMin = parseInt(estDateStr.split(', ')[1].split(':')[1]);
        
        const isClosed = estHour < 9 || (estHour === 9 && estMin < 30) || estHour >= 16;
        
        if (timeRange === '1D') {
          setIsMarketClosed(isClosed);
        } else {
          setIsMarketClosed(false);
        }

      } else {
        setHoverPrice(null);
        setIsMarketClosed(false);
      }
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [timeRange]);

  // Update Data when prop changes
  useEffect(() => {
    if (!seriesRef.current || !benchmarkSeriesRef.current || !data) return;
    
    const portfolioData = Array.isArray(data.portfolio) ? data.portfolio : [];
    const benchmarkData = Array.isArray(data.benchmark) ? data.benchmark : [];
    
    seriesRef.current.setData(portfolioData);
    benchmarkSeriesRef.current.setData(benchmarkData);
    chartRef.current?.timeScale().fitContent();
  }, [data]);

  return (
    <div className="relative w-full h-[300px]">
      {/* Chart Controls */}
      <div className="absolute top-0 right-0 z-10 flex gap-2">
        {['1D', '1W', '1M', '1Y'].map(range => (
          <button
            key={range}
            onClick={() => onTimeRangeChange(range as any)}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
              timeRange === range ? 'bg-teal-500/20 text-teal-400' : 'bg-slate-800/50 text-slate-400 hover:text-slate-200'
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Dynamic Hover Tooltip / Status */}
      <div className="absolute top-0 left-0 z-10 pointer-events-none">
        {hoverPrice !== null && (
          <div className="flex items-baseline gap-2">
            {!isMarketClosed ? (
              <span className="text-2xl font-bold text-white">${hoverPrice.toFixed(2)}</span>
            ) : (
              <span className="text-sm font-bold text-slate-400 bg-slate-800/80 px-2 py-1 rounded">Market Closed</span>
            )}
          </div>
        )}
      </div>

      <div ref={chartContainerRef} className="w-full h-full mt-8" />
    </div>
  );
}
