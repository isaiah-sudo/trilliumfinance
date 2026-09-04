'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  Zap,
  BarChart3,
  Layers,
  Sparkles
} from 'lucide-react';

interface AssetData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  high24h: number;
  low24h: number;
  volume: string;
  category: 'Stock' | 'Crypto';
  sparkline: number[];
}

interface Holding {
  symbol: string;
  name: string;
  shares: number;
  avgPrice: number;
}

const INITIAL_ASSETS: AssetData[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 327.30,
    change: 0.73,
    high24h: 330.80,
    low24h: 324.10,
    volume: '54.2M',
    category: 'Stock',
    sparkline: [322, 323.5, 324.8, 326.5, 325.0, 326.4, 327.1, 326.9, 327.30]
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corp.',
    price: 230.20,
    change: 2.56,
    high24h: 232.40,
    low24h: 224.50,
    volume: '88.6M',
    category: 'Stock',
    sparkline: [224, 225.5, 226.2, 225.4, 228.8, 227.9, 229.5, 230.20]
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    price: 382.70,
    change: 7.19,
    high24h: 385.00,
    low24h: 360.50,
    volume: '42.1M',
    category: 'Stock',
    sparkline: [360, 364, 368.5, 372, 370, 375.8, 379.2, 382.70]
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    price: 514.90,
    change: 3.64,
    high24h: 518.00,
    low24h: 498.30,
    volume: '22.8M',
    category: 'Stock',
    sparkline: [500, 502.5, 506, 505.8, 510.2, 512.9, 514.90]
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 64250.00,
    change: 4.15,
    high24h: 65100.00,
    low24h: 62800.00,
    volume: '$31.4B',
    category: 'Crypto',
    sparkline: [62000, 62800, 62400, 63500, 63100, 64250]
  }
];

export default function LiveTradingSimulator() {
  const [assets, setAssets] = useState<AssetData[]>(INITIAL_ASSETS);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('AAPL');
  const [orderSide, setOrderSide] = useState<'BUY' | 'SELL'>('BUY');
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '1Y'>('1D');
  const [shareCount, setShareCount] = useState<number>(5);
  const [virtualCash, setVirtualCash] = useState<number>(10000.00);
  const [holdings, setHoldings] = useState<Holding[]>([
    { symbol: 'AAPL', name: 'Apple Inc.', shares: 10, avgPrice: 182.30 }
  ]);
  const [priceFlash, setPriceFlash] = useState<'up' | 'down' | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{ index: number; value: number; x: number; y: number } | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const activeAsset = useMemo(
    () => assets.find((a) => a.symbol === selectedSymbol) || assets[0],
    [assets, selectedSymbol]
  );

  const currentHolding = useMemo(
    () => holdings.find((h) => h.symbol === activeAsset.symbol),
    [holdings, activeAsset.symbol]
  );

  // Live Micro-Tick Engine to simulate authentic market pulsation
  useEffect(() => {
    const tickInterval = setInterval(() => {
      setAssets((prev) =>
        prev.map((asset) => {
          if (Math.random() > 0.4) {
            const variancePercent = (Math.random() * 0.4 - 0.19) / 100;
            const delta = asset.price * variancePercent;
            const newPrice = Math.max(1, +(asset.price + delta).toFixed(2));
            const newChange = +(asset.change + variancePercent * 10).toFixed(2);
            const newSparkline = [...asset.sparkline.slice(1), newPrice];

            if (asset.symbol === selectedSymbol) {
              setPriceFlash(delta >= 0 ? 'up' : 'down');
              setTimeout(() => setPriceFlash(null), 800);
            }

            return {
              ...asset,
              price: newPrice,
              change: newChange,
              sparkline: newSparkline
            };
          }
          return asset;
        })
      );
    }, 2800);

    return () => clearInterval(tickInterval);
  }, [selectedSymbol]);

  // Order Calculations
  const maxBuyShares = Math.max(0, Math.floor(virtualCash / activeAsset.price));
  const maxSellShares = currentHolding ? currentHolding.shares : 0;
  const maxSharesForAction = orderSide === 'BUY' ? maxBuyShares : maxSellShares;
  const orderTotal = shareCount * activeAsset.price;
  const canExecute =
    orderSide === 'BUY'
      ? shareCount > 0 && orderTotal <= virtualCash
      : shareCount > 0 && !!currentHolding && shareCount <= currentHolding.shares;

  const showToast = (text: string, type: 'success' | 'error') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExecuteOrder = () => {
    if (!canExecute) {
      if (orderSide === 'BUY' && orderTotal > virtualCash) {
        showToast('Insufficient virtual cash balance for this order.', 'error');
      } else if (orderSide === 'SELL' && (!currentHolding || shareCount > currentHolding.shares)) {
        showToast('You do not own enough shares to sell.', 'error');
      }
      return;
    }

    if (orderSide === 'BUY') {
      setVirtualCash((prev) => +(prev - orderTotal).toFixed(2));
      setHoldings((prev) => {
        const existing = prev.find((h) => h.symbol === activeAsset.symbol);
        if (existing) {
          const totalExistingVal = existing.shares * existing.avgPrice;
          const newTotalShares = existing.shares + shareCount;
          const newAvg = (totalExistingVal + orderTotal) / newTotalShares;
          return prev.map((h) =>
            h.symbol === activeAsset.symbol
              ? { ...h, shares: newTotalShares, avgPrice: +newAvg.toFixed(2) }
              : h
          );
        }
        return [
          ...prev,
          {
            symbol: activeAsset.symbol,
            name: activeAsset.name,
            shares: shareCount,
            avgPrice: activeAsset.price
          }
        ];
      });
      showToast(
        `Executed: Bought ${shareCount} share${shareCount > 1 ? 's' : ''} of ${activeAsset.symbol} @ $${activeAsset.price.toFixed(2)}`,
        'success'
      );
    } else {
      // SELL
      setVirtualCash((prev) => +(prev + orderTotal).toFixed(2));
      setHoldings((prev) => {
        return prev
          .map((h) => {
            if (h.symbol === activeAsset.symbol) {
              const remaining = h.shares - shareCount;
              return { ...h, shares: remaining };
            }
            return h;
          })
          .filter((h) => h.shares > 0);
      });
      showToast(
        `Executed: Sold ${shareCount} share${shareCount > 1 ? 's' : ''} of ${activeAsset.symbol} @ $${activeAsset.price.toFixed(2)}`,
        'success'
      );
    }
  };

  const handleSetPercentage = (pct: number) => {
    if (orderSide === 'BUY') {
      const budget = virtualCash * pct;
      const shares = Math.max(1, Math.floor(budget / activeAsset.price));
      setShareCount(Math.min(shares, maxBuyShares));
    } else {
      if (!currentHolding) return;
      const shares = Math.max(1, Math.floor(currentHolding.shares * pct));
      setShareCount(shares);
    }
  };

  // Sparkline Chart SVG Math
  const sparklineData = activeAsset.sparkline;
  const minPrice = Math.min(...sparklineData) * 0.998;
  const maxPrice = Math.max(...sparklineData) * 1.002;
  const range = maxPrice - minPrice || 1;
  const chartHeight = 160;
  const chartWidth = 500;

  const points = sparklineData.map((val, idx) => {
    const x = (idx / (sparklineData.length - 1)) * chartWidth;
    const y = chartHeight - ((val - minPrice) / range) * (chartHeight - 30) - 15;
    return { x, y, val };
  });

  const pathD = points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '');
  const areaD = `${pathD} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;
  const isPositive = activeAsset.change >= 0;

  // Calculate Net Portfolio Value in Simulator
  const totalHoldingsValue = holdings.reduce((sum, h) => {
    const asset = assets.find((a) => a.symbol === h.symbol);
    const price = asset ? asset.price : h.avgPrice;
    return sum + h.shares * price;
  }, 0);
  const totalNetEquity = virtualCash + totalHoldingsValue;
  const totalReturn = totalNetEquity - 10000;
  const totalReturnPercent = (totalReturn / 10000) * 100;

  return (
    <div className="w-full relative rounded-3xl p-5 sm:p-7 md:p-8 glass-card-premium border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.6)] overflow-hidden">
      {/* Subtle Ambient Backlight */}
      <div
        className={`absolute -top-24 -right-24 w-80 h-80 rounded-full blur-[100px] pointer-events-none transition-colors duration-700 ${
          isPositive ? 'bg-emerald-500/15' : 'bg-rose-500/15'
        }`}
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold mb-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Market Simulator & Terminal
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Paper Trading Terminal
            <span className="text-xs px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-400 font-bold font-mono">
              REAL-TIME FEED
            </span>
          </h3>
        </div>

        {/* Global Simulator Portfolio Stats Badge */}
        <div className="flex items-center gap-3 bg-slate-950/60 p-2.5 sm:px-4 sm:py-2 rounded-2xl border border-white/10 backdrop-blur-md">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Simulated Net Equity</div>
            <div className="text-base font-black text-white">
              ${totalNetEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="h-7 w-px bg-white/10" />
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total ROI</div>
            <div className={`text-xs font-black ${totalReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalReturn >= 0 ? '+' : ''}${totalReturn.toFixed(2)} ({totalReturnPercent.toFixed(2)}%)
            </div>
          </div>
        </div>
      </div>

      {/* Asset Switcher Ribbon */}
      <div className="flex items-center gap-2 py-4 overflow-x-auto no-scrollbar relative z-10">
        {assets.map((asset) => {
          const isSelected = selectedSymbol === asset.symbol;
          const isUp = asset.change >= 0;
          return (
            <button
              key={asset.symbol}
              onClick={() => {
                setSelectedSymbol(asset.symbol);
                setShareCount(5);
              }}
              className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isSelected
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-400/60 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                  : 'bg-slate-900/50 hover:bg-slate-900/80 border-white/10 text-slate-400 hover:text-slate-200'
              } border backdrop-blur-md`}
            >
              <div
                className={`h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-black ${
                  isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-white/10 text-slate-300'
                }`}
              >
                {asset.symbol.slice(0, 2)}
              </div>
              <div className="text-left">
                <div className="text-white font-extrabold leading-none">{asset.symbol}</div>
                <div className="text-[10px] text-slate-400 font-medium">{asset.name.split(' ')[0]}</div>
              </div>
              <div className="text-right pl-2 border-l border-white/10">
                <div className="text-white font-mono font-bold leading-none">${asset.price.toFixed(2)}</div>
                <div className={`text-[10px] font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isUp ? '+' : ''}
                  {asset.change.toFixed(2)}%
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Terminal Grid: 2 Columns on Medium/Large Screens */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 pt-2">
        {/* Left Column: Interactive Glass Chart & Asset Info (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/40 border border-white/10 backdrop-blur-md relative overflow-hidden flex flex-col justify-between h-full min-h-[340px]">
            {/* Asset Headline & Price Tick Flash */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-2xl font-black text-white tracking-tight">{activeAsset.symbol}</h4>
                  <span className="text-xs text-slate-400 font-medium">{activeAsset.name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                    {activeAsset.category}
                  </span>
                </div>
                <div className="flex items-baseline gap-3 mt-1">
                  <span
                    className={`text-3xl font-black font-mono transition-colors duration-300 ${
                      priceFlash === 'up'
                        ? 'text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]'
                        : priceFlash === 'down'
                        ? 'text-rose-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.8)]'
                        : 'text-white'
                    }`}
                  >
                    ${activeAsset.price.toFixed(2)}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                      isPositive
                        ? 'text-emerald-400 bg-emerald-500/15 border border-emerald-500/30'
                        : 'text-rose-400 bg-rose-500/15 border border-rose-500/30'
                    }`}
                  >
                    {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                    {isPositive ? '+' : ''}
                    {activeAsset.change.toFixed(2)}% Today
                  </span>
                </div>
              </div>

              {/* Timeframe Tabs */}
              <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-white/10">
                {(['1D', '1W', '1M', '1Y'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      timeframe === tf
                        ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive SVG Sparkline Chart */}
            <div className="relative w-full h-44 my-2 flex items-center justify-center">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
                onMouseLeave={() => setHoveredPoint(null)}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const mouseX = e.clientX - rect.left;
                  const ratio = Math.max(0, Math.min(1, mouseX / rect.width));
                  const index = Math.min(
                    sparklineData.length - 1,
                    Math.max(0, Math.round(ratio * (sparklineData.length - 1)))
                  );
                  const pt = points[index];
                  setHoveredPoint({ index, value: pt.val, x: (pt.x / chartWidth) * rect.width, y: pt.y });
                }}
              >
                <defs>
                  <linearGradient id={`chart-grad-${selectedSymbol}`} x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={isPositive ? '#10b981' : '#f43f5e'}
                      stopOpacity={isPositive ? 0.35 : 0.25}
                    />
                    <stop
                      offset="100%"
                      stopColor={isPositive ? '#10b981' : '#f43f5e'}
                      stopOpacity={0.0}
                    />
                  </linearGradient>
                </defs>

                {/* Grid guidelines */}
                <line x1="0" y1="40" x2={chartWidth} y2="40" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                <line x1="0" y1="80" x2={chartWidth} y2="80" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                <line x1="0" y1="120" x2={chartWidth} y2="120" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />

                {/* Area Gradient Fill */}
                <motion.path
                  d={areaD}
                  fill={`url(#chart-grad-${selectedSymbol})`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />

                {/* Main Stroke Line */}
                <motion.path
                  d={pathD}
                  fill="none"
                  stroke={isPositive ? '#10b981' : '#f43f5e'}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />

                {/* Active Price Pulse Point at the end */}
                {points.length > 0 && (
                  <g transform={`translate(${points[points.length - 1].x}, ${points[points.length - 1].y})`}>
                    <circle r="6" fill={isPositive ? '#10b981' : '#f43f5e'} opacity="0.3">
                      <animate attributeName="r" values="4;10;4" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle r="4" fill={isPositive ? '#10b981' : '#f43f5e'} stroke="#fff" strokeWidth="1.5" />
                  </g>
                )}
              </svg>

              {/* Hover Tooltip Overlay */}
              {hoveredPoint && (
                <div
                  className="absolute pointer-events-none -top-1 transform -translate-x-1/2 bg-slate-900/90 border border-white/20 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-xl backdrop-blur-md z-20 font-mono"
                  style={{ left: hoveredPoint.x }}
                >
                  ${hoveredPoint.value.toFixed(2)}
                </div>
              )}
            </div>

            {/* Market Micro Indicators */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-xs">
              <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] text-slate-400 font-bold block">24H HIGH</span>
                <span className="text-white font-mono font-bold">${activeAsset.high24h.toFixed(2)}</span>
              </div>
              <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] text-slate-400 font-bold block">24H LOW</span>
                <span className="text-white font-mono font-bold">${activeAsset.low24h.toFixed(2)}</span>
              </div>
              <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] text-slate-400 font-bold block">VOLUME</span>
                <span className="text-white font-mono font-bold">{activeAsset.volume}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Execution Console & Session Holdings (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-white/10 backdrop-blur-md space-y-4 flex-1 flex flex-col justify-between">
            {/* Buy / Sell Tab Switcher */}
            <div className="grid grid-cols-2 p-1 bg-slate-900/90 rounded-xl border border-white/10 gap-1">
              <button
                onClick={() => setOrderSide('BUY')}
                className={`py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  orderSide === 'BUY'
                    ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.35)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Buy {activeAsset.symbol}
              </button>
              <button
                onClick={() => setOrderSide('SELL')}
                className={`py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  orderSide === 'SELL'
                    ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.35)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sell {activeAsset.symbol}
              </button>
            </div>

            {/* Order Configuration Panel */}
            <div className="space-y-3">
              {/* Share Count Stepper */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span>Number of Shares</span>
                  <span className="text-slate-400 font-normal">
                    {orderSide === 'BUY' ? `Max Buy: ${maxBuyShares}` : `Owned: ${maxSellShares}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShareCount((prev) => Math.max(1, prev - 1))}
                    className="h-10 w-10 rounded-xl bg-slate-900 border border-white/10 text-white flex items-center justify-center hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={maxSharesForAction || 100}
                    value={shareCount}
                    onChange={(e) => setShareCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 h-10 bg-slate-900/80 border border-white/10 rounded-xl text-center text-white font-mono font-black text-sm focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={() => setShareCount((prev) => prev + 1)}
                    className="h-10 w-10 rounded-xl bg-slate-900 border border-white/10 text-white flex items-center justify-center hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Quick % Pills */}
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: '25%', val: 0.25 },
                  { label: '50%', val: 0.5 },
                  { label: '75%', val: 0.75 },
                  { label: 'MAX', val: 1.0 }
                ].map((pill) => (
                  <button
                    key={pill.label}
                    onClick={() => handleSetPercentage(pill.val)}
                    className="py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-[10px] font-black tracking-wider transition-all cursor-pointer"
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              {/* Order Cost Breakdown Card */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Market Price</span>
                  <span className="text-white font-mono font-bold">${activeAsset.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Virtual Buying Power</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    ${virtualCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="h-px bg-white/10" />
                <div className="flex justify-between items-center text-sm font-black">
                  <span className="text-white">Estimated Value</span>
                  <span className="text-emerald-400 font-mono text-base">
                    ${orderTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Execute Order CTA */}
            <div className="relative pt-1">
              <button
                onClick={handleExecuteOrder}
                disabled={!canExecute}
                className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-lg flex items-center justify-center gap-2 ${
                  canExecute
                    ? orderSide === 'BUY'
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:scale-[1.02] active:scale-95'
                      : 'bg-rose-500 hover:bg-rose-400 text-white shadow-[0_0_25px_rgba(244,63,94,0.4)] hover:scale-[1.02] active:scale-95'
                    : 'bg-slate-800/80 text-slate-500 border border-white/5 cursor-not-allowed'
                }`}
              >
                <Zap className="h-4 w-4" />
                Execute {orderSide} Order
              </button>

              {/* Toast Feedback */}
              <AnimatePresence>
                {toastMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-xs font-black shadow-2xl border backdrop-blur-xl whitespace-nowrap z-30 flex items-center gap-1.5 ${
                      toastMessage.type === 'success'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                        : 'bg-rose-500 text-white border-rose-300'
                    }`}
                  >
                    {toastMessage.type === 'success' ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    {toastMessage.text}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Active Holdings & Open Positions Ledger */}
      <div className="mt-6 pt-5 border-t border-white/10 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <h5 className="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-2">
            <Layers className="h-4 w-4 text-emerald-400" />
            Active Virtual Positions ({holdings.length})
          </h5>
          <span className="text-[10px] text-slate-400 font-medium">Auto-updates with simulated market feed</span>
        </div>

        {holdings.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-950/40 border border-white/5 text-center text-xs text-slate-400 italic">
            No active positions yet. Select a stock above and click "Execute BUY Order" to practice!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {holdings.map((h) => {
              const liveAsset = assets.find((a) => a.symbol === h.symbol);
              const curPrice = liveAsset ? liveAsset.price : h.avgPrice;
              const marketVal = h.shares * curPrice;
              const costBasis = h.shares * h.avgPrice;
              const pl = marketVal - costBasis;
              const plPct = costBasis > 0 ? (pl / costBasis) * 100 : 0;
              const isProfit = pl >= 0;

              return (
                <div
                  key={h.symbol}
                  className="p-3 rounded-xl bg-slate-950/50 border border-white/10 hover:border-emerald-500/30 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-black text-xs flex items-center justify-center">
                      {h.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-xs font-black text-white">{h.symbol}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {h.shares} shs @ ${h.avgPrice.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-black text-white font-mono">${marketVal.toFixed(2)}</div>
                    <div className={`text-[10px] font-black font-mono ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isProfit ? '+' : ''}${pl.toFixed(2)} ({plPct.toFixed(1)}%)
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
