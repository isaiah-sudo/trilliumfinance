'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';

export interface CandlePoint {
  time: number;
  timeLabel: string;
  price: number;
}

interface StockCardSparklineProps {
  ticker: string;
  currentPrice: number;
  change: number;
  onHoverPoint?: (point: CandlePoint | null) => void;
  onRangeCalculated?: (range: { high: number; low: number }) => void;
  height?: number;
  className?: string;
}

const candleCache = new Map<string, { points: CandlePoint[]; high: number; low: number }>();
const activeFetches = new Map<string, Promise<{ points: CandlePoint[]; high: number; low: number } | null>>();

function generateIntradayPoints(
  ticker: string,
  currentPrice: number,
  changePercent: number
): { points: CandlePoint[]; high: number; low: number } {
  const count = 24;
  const startPrice = changePercent !== 0 ? currentPrice / (1 + changePercent / 100) : currentPrice * 0.99;

  let seed = 0;
  for (let i = 0; i < ticker.length; i++) {
    seed = (seed << 5) - seed + ticker.charCodeAt(i);
  }

  const points: CandlePoint[] = [];
  let min = Math.min(startPrice, currentPrice);
  let max = Math.max(startPrice, currentPrice);

  for (let i = 0; i < count; i++) {
    const progress = i / (count - 1);
    const baseInterp = startPrice + (currentPrice - startPrice) * progress;
    const arc = Math.sin(progress * Math.PI);
    const wave1 = Math.sin(seed + i * 0.8) * 0.008;
    const wave2 = Math.cos(seed * 0.5 + i * 1.3) * 0.005;
    const fluctuation = (wave1 + wave2) * arc * currentPrice;

    const price = Number((baseInterp + fluctuation).toFixed(2));
    if (price < min) min = price;
    if (price > max) max = price;

    const hour = 9 + Math.floor((30 + i * 16) / 60);
    const minute = (30 + i * 16) % 60;
    const timeLabel = `${hour > 12 ? hour - 12 : hour}:${minute < 10 ? '0' : ''}${minute} ${hour >= 12 ? 'PM' : 'AM'}`;

    points.push({
      time: i,
      timeLabel,
      price: i === count - 1 ? currentPrice : i === 0 ? Number(startPrice.toFixed(2)) : price,
    });
  }

  return { points, high: max, low: min };
}

function getSplineSvgPath(coords: [number, number][]): string {
  if (coords.length === 0) return '';
  if (coords.length === 1) return `M ${coords[0][0]} ${coords[0][1]}`;

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

export const StockCardSparkline: React.FC<StockCardSparklineProps> = ({
  ticker,
  currentPrice,
  change,
  onHoverPoint,
  onRangeCalculated,
  height = 76,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Initial fallback data for instant zero-latency paint
  const [chartData, setChartData] = useState<{ points: CandlePoint[]; high: number; low: number }>(() => {
    if (candleCache.has(ticker)) {
      return candleCache.get(ticker)!;
    }
    return generateIntradayPoints(ticker, currentPrice, change);
  });

  // Fetch real candles with deduplication & caching
  useEffect(() => {
    if (candleCache.has(ticker)) {
      const cached = candleCache.get(ticker)!;
      setChartData(cached);
      onRangeCalculated?.({ high: cached.high, low: cached.low });
      return;
    }

    let active = true;
    let fetchPromise = activeFetches.get(ticker);

    if (!fetchPromise) {
      fetchPromise = fetch(`/api/stocks/candles?symbol=${encodeURIComponent(ticker)}&range=1D`)
        .then((res) => {
          if (!res.ok) throw new Error('Network error');
          return res.json();
        })
        .then((json) => {
          if (Array.isArray(json?.points) && json.points.length >= 2) {
            const data = {
              points: json.points as CandlePoint[],
              high: Number(json.high) || currentPrice,
              low: Number(json.low) || currentPrice,
            };
            candleCache.set(ticker, data);
            return data;
          }
          return null;
        })
        .catch(() => null)
        .finally(() => {
          activeFetches.delete(ticker);
        });

      activeFetches.set(ticker, fetchPromise);
    }

    fetchPromise.then((data) => {
      if (active && data) {
        setChartData(data);
        onRangeCalculated?.({ high: data.high, low: data.low });
      }
    });

    return () => {
      active = false;
    };
  }, [ticker, currentPrice, onRangeCalculated]);

  // Coordinate mapping for SVG
  const W = 300;
  const H = height;
  const padY = 7;
  const usableH = H - padY * 2;

  const points = chartData.points;
  const isPositive = change >= 0;

  const strokeColor = isPositive ? '#10b981' : '#f43f5e';
  const gradientId = `sparkGrad_${ticker}_${isPositive ? 'up' : 'down'}`;

  const { linePath, areaPath, coords, minPrice, maxPrice } = useMemo(() => {
    if (!points || points.length === 0) {
      return { linePath: '', areaPath: '', coords: [], minPrice: currentPrice, maxPrice: currentPrice };
    }

    const prices = points.map((p) => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || min * 0.01 || 1;

    const mappedCoords: [number, number][] = points.map((p, i) => {
      const x = (i / (points.length - 1)) * W;
      const y = H - padY - ((p.price - min) / range) * usableH;
      return [x, y];
    });

    const lPath = getSplineSvgPath(mappedCoords);
    const aPath = mappedCoords.length > 0
      ? `${lPath} L ${mappedCoords[mappedCoords.length - 1][0].toFixed(1)} ${H} L ${mappedCoords[0][0].toFixed(1)} ${H} Z`
      : '';

    return {
      linePath: lPath,
      areaPath: aPath,
      coords: mappedCoords,
      minPrice: min,
      maxPrice: max,
    };
  }, [points, currentPrice, W, H, usableH]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el || points.length === 0) return;
    const rect = el.getBoundingClientRect();
    const clientX = e.clientX;
    const frac = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const idx = Math.min(points.length - 1, Math.max(0, Math.round(frac * (points.length - 1))));
    setHoverIndex(idx);
    onHoverPoint?.(points[idx]);
  };

  const handlePointerLeave = () => {
    setHoverIndex(null);
    onHoverPoint?.(null);
  };

  const activePointCoord = hoverIndex !== null && coords[hoverIndex] ? coords[hoverIndex] : null;

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`relative w-full select-none cursor-crosshair overflow-hidden touch-none ${className}`}
      style={{ height }}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="w-full h-full overflow-visible"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.28" />
            <stop offset="70%" stopColor={strokeColor} stopOpacity="0.05" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Area Gradient Fill */}
        {areaPath && (
          <path
            d={areaPath}
            fill={`url(#${gradientId})`}
            className="transition-opacity duration-300"
          />
        )}

        {/* Stroke Line */}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke={strokeColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        )}

        {/* Hover Scrubbing Vertical Line */}
        {activePointCoord && (
          <line
            x1={activePointCoord[0]}
            y1="0"
            x2={activePointCoord[0]}
            y2={H}
            stroke="rgba(255, 255, 255, 0.25)"
            strokeDasharray="2 2"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>

      {/* Clean, circular, non-distorting hover dot */}
      {activePointCoord && (
        <div
          className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full z-10"
          style={{
            left: `${(activePointCoord[0] / W) * 100}%`,
            top: `${(activePointCoord[1] / H) * 100}%`,
            width: '6.5px',
            height: '6.5px',
            backgroundColor: strokeColor,
            boxShadow: `0 0 0 1.5px #0b0f17, 0 0 4px ${strokeColor}80`,
          }}
        />
      )}
    </div>
  );
};
