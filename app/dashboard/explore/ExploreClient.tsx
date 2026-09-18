'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  X,
  Clock,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  SlidersHorizontal,
  Wallet,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { handleTrade } from '@/app/actions/trading';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { StockInfoDrawer } from '@/components/ui/StockInfoDrawer';
import { AnimatedNumber } from '@/components/ui';
import { useStockMarket, StockQuote } from '@/context/StockMarketContext';
import { getStockLogo } from '@/lib/stockUtils';
import { StockCardSparkline, CandlePoint } from '@/components/dashboard/StockCardSparkline';

const CATEGORIES = ['All', 'Technology', 'Healthcare', 'Energy', 'Finance', 'Consumer', 'Index'] as const;
type CategoryType = typeof CATEGORIES[number];
type SortOption = 'default' | 'gainers' | 'losers' | 'price-high' | 'price-low' | 'ticker';

interface StockCardProps {
  stock: StockQuote;
  onTrade: (stock: StockQuote) => void;
  onOpenDetails: (ticker: string) => void;
}

const StockCard: React.FC<StockCardProps> = React.memo(({ stock, onTrade, onOpenDetails }) => {
  const [hoveredPoint, setHoveredPoint] = useState<CandlePoint | null>(null);
  const [dailyRange, setDailyRange] = useState<{ high: number; low: number } | null>(null);

  const displayPrice = hoveredPoint ? hoveredPoint.price : stock.price;
  const isHovered = hoveredPoint !== null;
  const isPositive = stock.change >= 0;

  // Calculate delta when hovering relative to open price
  const openPrice = stock.change !== 0 ? stock.price / (1 + stock.change / 100) : stock.price;
  const scrubDiff = displayPrice - openPrice;
  const scrubPct = openPrice > 0 ? (scrubDiff / openPrice) * 100 : 0;
  const activeChangePct = isHovered ? scrubPct : stock.change;
  const activeIsPositive = activeChangePct >= 0;

  return (
    <div className="group relative bg-[#0b0f17] border border-slate-800/80 hover:border-slate-700/90 rounded-xl p-4 flex flex-col justify-between transition-all duration-150 shadow-sm hover:shadow-md">
      <div>
        {/* Top Bar: Logo, Ticker, Company Name & Category (Clean - no redundant circular icon) */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 p-1 flex items-center justify-center shrink-0 overflow-hidden relative">
              <img
                src={stock.logo || getStockLogo(stock.ticker)}
                alt={stock.name}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling;
                  if (fallback) fallback.classList.remove('hidden');
                }}
                className="w-full h-full object-contain filter"
              />
              <div className="hidden absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-300 bg-slate-800 uppercase">
                {stock.ticker[0]}
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-white font-bold text-sm tracking-tight">{stock.ticker}</span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[130px] font-medium leading-none mt-0.5">
                {stock.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="px-2 py-0.5 rounded border border-slate-800 bg-slate-900/80 text-slate-400 font-mono text-[10px] font-semibold">
              {stock.category}
            </span>
          </div>
        </div>

        {/* Integrated Price & Graph Block */}
        <div className="pt-1 pb-2">
          {/* Price & Delta Header directly on top of graph */}
          <div className="flex items-baseline justify-between gap-2 mb-1.5">
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-white font-mono tabular-nums tracking-tight">
                <AnimatedNumber
                  value={displayPrice}
                  gradient={activeIsPositive ? 'up' : 'down'}
                  formatter={(val) =>
                    `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  }
                />
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 text-xs font-bold font-mono px-1.5 py-0.5 rounded ${
                  activeIsPositive
                    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                    : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                }`}
              >
                {activeIsPositive ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                <span>
                  <AnimatedNumber
                    value={activeChangePct}
                    formatter={(val) => `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`}
                  />
                </span>
              </span>

              {isHovered && (
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
                  {hoveredPoint?.timeLabel}
                </span>
              )}
            </div>
          </div>

          {/* Sparkline Canvas */}
          <StockCardSparkline
            ticker={stock.ticker}
            currentPrice={stock.price}
            change={stock.change}
            onHoverPoint={setHoveredPoint}
            onRangeCalculated={setDailyRange}
            height={76}
            className="my-1"
          />

          {/* Subtle High / Low Bar */}
          {dailyRange && (
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1.5 px-0.5">
              <span>L: ${dailyRange.low.toFixed(2)}</span>
              <span className="text-slate-600">·</span>
              <span>H: ${dailyRange.high.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Action Buttons: Trade & Clean 'Info' button (no eyeball icon) */}
      <div className="flex items-center gap-2 pt-3 mt-2 border-t border-slate-800/60">
        <button
          type="button"
          onClick={() => onTrade(stock)}
          className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-1.5 px-3 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer shadow-sm"
        >
          <ShoppingCart className="h-3.5 w-3.5" /> Trade
        </button>
        <button
          type="button"
          onClick={() => onOpenDetails(stock.ticker)}
          className="py-1.5 px-3 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          title="Open corporate overview and financial details"
        >
          <FileText className="h-3.5 w-3.5 text-slate-400" />
          <span>Info</span>
        </button>
      </div>
    </div>
  );
});
StockCard.displayName = 'StockCard';

export default function MarketExplorer() {
  const { user } = useAuth();
  const { stocks, getStock } = useStockMarket();
  const { portfolio, fetchPortfolio, executeTrade } = usePortfolioStore();

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('All');
  const [sortOption, setSortOption] = useState<SortOption>('default');

  // Trade Modal State
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockQuote | null>(null);
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const [tradeQty, setTradeQty] = useState(1);
  const [tradeLoading, setTradeLoading] = useState(false);
  const [tradeError, setTradeError] = useState('');
  const [tradeSuccess, setTradeSuccess] = useState(false);
  const [modalHoveredPoint, setModalHoveredPoint] = useState<CandlePoint | null>(null);
  const [modalDailyRange, setModalDailyRange] = useState<{ high: number; low: number } | null>(null);
  const [lastExecutedTrade, setLastExecutedTrade] = useState<{
    id: string;
    timestamp: string;
    ticker: string;
    name: string;
    type: 'BUY' | 'SELL';
    qty: number;
    price: number;
    total: number;
  } | null>(null);

  // Stock Details Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerSymbol, setDrawerSymbol] = useState('');

  const openDrawer = useCallback((symbol: string) => {
    setDrawerSymbol(symbol);
    setDrawerOpen(true);
  }, []);

  const openTradeModal = useCallback((stock: StockQuote) => {
    const freshStock = getStock(stock.ticker) || stock;
    setSelectedStock(freshStock);
    setTradeModalOpen(true);
    setTradeError('');
    setTradeSuccess(false);
    setLastExecutedTrade(null);
    setOrderType('BUY');
    setTradeQty(1);
    setModalHoveredPoint(null);
    setModalDailyRange(null);
    fetchPortfolio();
  }, [getStock, fetchPortfolio]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: stocks.length };
    CATEGORIES.forEach((cat) => {
      if (cat !== 'All') {
        counts[cat] = stocks.filter((s) => s.category === cat).length;
      }
    });
    return counts;
  }, [stocks]);

  // Market overview stats
  const marketStats = useMemo(() => {
    const gainers = stocks.filter((s) => s.change >= 0).length;
    const losers = stocks.filter((s) => s.change < 0).length;
    return { gainers, losers, total: stocks.length };
  }, [stocks]);

  // Filtered & Sorted stocks
  const filteredStocks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let list = stocks.filter((stock) => {
      const matchesSearch =
        query === '' ||
        stock.ticker.toLowerCase().includes(query) ||
        stock.name.toLowerCase().includes(query);
      const matchesCategory = selectedCategory === 'All' || stock.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    if (sortOption === 'gainers') {
      list = [...list].sort((a, b) => b.change - a.change);
    } else if (sortOption === 'losers') {
      list = [...list].sort((a, b) => a.change - b.change);
    } else if (sortOption === 'price-high') {
      list = [...list].sort((a, b) => b.price - a.price);
    } else if (sortOption === 'price-low') {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortOption === 'ticker') {
      list = [...list].sort((a, b) => a.ticker.localeCompare(b.ticker));
    }

    return list;
  }, [stocks, searchQuery, selectedCategory, sortOption]);

  // Live modal metrics and financial calculations
  const livePrice = selectedStock ? (getStock(selectedStock.ticker)?.price || selectedStock.price) : 0;
  const userCash = portfolio?.cash ?? 10000;
  const userHolding = portfolio?.holdings?.find(
    (h: any) => (h.symbol || h.ticker)?.toUpperCase() === selectedStock?.ticker?.toUpperCase()
  );
  const ownedShares = userHolding ? Number(userHolding.qty) : 0;
  const orderTotal = livePrice * tradeQty;

  const maxBuyQty = livePrice > 0 ? Math.floor(userCash / livePrice) : 0;
  const canAffordBuy = userCash >= orderTotal;
  const hasEnoughSharesToSell = ownedShares >= tradeQty;

  const remainingCash = orderType === 'BUY'
    ? userCash - orderTotal
    : userCash + orderTotal;

  const modalDisplayPrice = modalHoveredPoint ? modalHoveredPoint.price : livePrice;
  const openPrice = selectedStock && selectedStock.change !== 0
    ? selectedStock.price / (1 + selectedStock.change / 100)
    : selectedStock ? selectedStock.price : 0;
  const scrubDiff = modalDisplayPrice - openPrice;
  const scrubPct = openPrice > 0 ? (scrubDiff / openPrice) * 100 : 0;
  const modalActiveChangePct = modalHoveredPoint ? scrubPct : (selectedStock?.change || 0);
  const modalActiveIsPositive = modalActiveChangePct >= 0;

  const executeTradeSubmit = async (type: 'BUY' | 'SELL') => {
    if (!selectedStock) return;
    setTradeLoading(true);
    setTradeError('');
    const currentLivePrice = getStock(selectedStock.ticker)?.price || selectedStock.price;
    const orderQty = Number(tradeQty);
    const calculatedTotal = currentLivePrice * orderQty;

    // Financial validation checks
    if (type === 'BUY' && calculatedTotal > userCash) {
      setTradeError(`Insufficient cash balance. You have $${userCash.toFixed(2)}, but this order requires $${calculatedTotal.toFixed(2)}.`);
      setTradeLoading(false);
      return;
    }

    if (type === 'SELL' && orderQty > ownedShares) {
      setTradeError(`You cannot sell ${orderQty} shares. You currently own ${ownedShares} shares.`);
      setTradeLoading(false);
      return;
    }

    try {
      await executeTrade(selectedStock.ticker, orderQty, type);

      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([30, 40, 30]);
        } catch {
          // ignore
        }
      }

      setLastExecutedTrade({
        id: `TRX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        ticker: selectedStock.ticker,
        name: selectedStock.name,
        type,
        qty: orderQty,
        price: currentLivePrice,
        total: calculatedTotal,
      });
      setTradeSuccess(true);
      fetchPortfolio();
    } catch (err: any) {
      setTradeError(err.message || 'Trade failed. Ensure you have sufficient funds/shares.');
    } finally {
      setTradeLoading(false);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 pb-12">
      {/* Sleek Minimalist Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Market Explorer</h1>
          </div>
          <p className="text-xs text-slate-400 font-normal mt-0.5">
            Browse available stocks, view charts, and practice trading with your paper portfolio.
          </p>
        </div>

        {/* Quick Market Sentiment Badges */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-[#0b0f17] border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-emerald-400 font-bold">{marketStats.gainers}</span>
            <span className="text-slate-500 text-[11px]">Advancing</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#0b0f17] border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
            <TrendingDown className="h-3.5 w-3.5 text-rose-400" />
            <span className="text-rose-400 font-bold">{marketStats.losers}</span>
            <span className="text-slate-500 text-[11px]">Declining</span>
          </div>
        </div>
      </div>

      {/* Category Tabs & Control Bar */}
      <div className="space-y-3">
        {/* Horizontal Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((category) => {
            const count = categoryCounts[category] || 0;
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-100 text-slate-950 shadow-sm font-bold'
                    : 'bg-[#0b0f17] text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>{category}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? 'bg-slate-300/80 text-slate-900 font-bold'
                      : 'bg-slate-800/80 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar & Sort Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ticker, company name (e.g. AAPL, Tesla)..."
              className="w-full bg-[#0b0f17] border border-slate-800 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-2 placeholder:text-slate-600 focus:outline-none focus:border-slate-700 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <span className="text-[11px] text-slate-500">Sort:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-slate-700 cursor-pointer font-medium"
            >
              <option value="default">Default</option>
              <option value="gainers">Top Gainers (+%)</option>
              <option value="losers">Top Losers (-%)</option>
              <option value="price-high">Price (High to Low)</option>
              <option value="price-low">Price (Low to High)</option>
              <option value="ticker">Ticker (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stock Cards Grid: 1 col on mobile, 2 on tablet, 3 on desktop, max 4 on ultra-wide */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
        {filteredStocks.map((stock) => (
          <StockCard
            key={stock.ticker}
            stock={stock}
            onTrade={openTradeModal}
            onOpenDetails={openDrawer}
          />
        ))}
      </div>

      {filteredStocks.length === 0 && (
        <div className="text-center py-16 bg-[#0b0f17] rounded-xl border border-slate-800">
          <Search className="h-8 w-8 text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-300">No assets match your search</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting the filter or search query.</p>
        </div>
      )}

      {/* Expanded, In-Depth Trading Cockpit Modal with Big Interactive Graph & Financial Clarity */}
      <AnimatePresence>
        {tradeModalOpen && selectedStock && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="bg-[#0b0f17] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92dvh] overflow-y-auto shadow-2xl relative flex flex-col"
            >
              {/* Modal Top Bar */}
              <div className="flex justify-between items-center px-5 sm:px-6 py-4 border-b border-slate-800/80 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 p-1.5 flex items-center justify-center overflow-hidden shrink-0 relative shadow-inner">
                    <img
                      src={selectedStock.logo || getStockLogo(selectedStock.ticker)}
                      alt={selectedStock.name}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling;
                        if (fallback) fallback.classList.remove('hidden');
                      }}
                      className="w-full h-full object-contain filter"
                    />
                    <div className="hidden absolute inset-0 flex items-center justify-center text-sm font-bold text-white bg-slate-800 uppercase">
                      {selectedStock.ticker[0]}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-extrabold text-lg sm:text-xl tracking-tight truncate">
                        {selectedStock.ticker}
                      </h3>
                      <span className="px-2 py-0.5 rounded border border-slate-800 bg-slate-900 text-slate-400 font-mono text-[10px] font-bold">
                        {selectedStock.category}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs font-medium truncate">{selectedStock.name}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setTradeModalOpen(false)}
                  className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-800/60 hover:bg-slate-700/80 text-slate-400 hover:text-white transition-colors shrink-0 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {tradeSuccess && lastExecutedTrade ? (
                /* Executed Order Receipt View */
                <div className="p-6 max-w-lg mx-auto w-full space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-xs font-bold font-mono uppercase tracking-wider text-emerald-400">
                        Order Executed Successfully
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{lastExecutedTrade.timestamp}</span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-[#080b11] border border-slate-800 p-5 space-y-3 font-mono text-xs shadow-inner">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Receipt className="w-3.5 h-3.5 text-slate-500" />
                        <span>{lastExecutedTrade.id}</span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          lastExecutedTrade.type === 'BUY'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {lastExecutedTrade.type}
                      </span>
                    </div>

                    <div className="py-2.5 border-y border-dashed border-slate-800 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-sans">Asset</span>
                        <span className="text-white font-bold">{lastExecutedTrade.ticker} ({lastExecutedTrade.name})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-sans">Quantity</span>
                        <span className="text-white">{lastExecutedTrade.qty} shares</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-sans">Execution Price</span>
                        <span className="text-white">${lastExecutedTrade.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-sans">Updated Cash Balance</span>
                        <span className="text-emerald-400 font-bold">${(portfolio?.cash ?? userCash).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <span className="text-slate-400 font-sans font-medium">Total Transaction Value</span>
                      <span className="text-lg font-bold text-white">
                        ${lastExecutedTrade.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTradeSuccess(false);
                        setLastExecutedTrade(null);
                        setTradeQty(1);
                      }}
                      className="flex-1 py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Trade Again
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTradeModalOpen(false);
                        setTradeSuccess(false);
                        setLastExecutedTrade(null);
                      }}
                      className="flex-1 py-2.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer shadow-md"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                /* Main 2-Column Trading Cockpit */
                <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Big Interactive Graph & Market Context */}
                  <div className="lg:col-span-7 flex flex-col space-y-4">
                    {/* Live Price Header */}
                    <div className="flex items-baseline justify-between gap-3">
                      <div>
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Market Price
                        </div>
                        <div className="flex items-baseline gap-2.5 mt-0.5">
                          <span className="text-2xl sm:text-3xl font-black text-white font-mono tabular-nums tracking-tight">
                            <AnimatedNumber
                              value={modalDisplayPrice}
                              gradient={modalActiveIsPositive ? 'up' : 'down'}
                              formatter={(val) =>
                                `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                              }
                            />
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-bold font-mono px-2 py-0.5 rounded-md ${
                              modalActiveIsPositive
                                ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                                : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                            }`}
                          >
                            {modalActiveIsPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                            <span>
                              <AnimatedNumber
                                value={modalActiveChangePct}
                                formatter={(val) => `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`}
                              />
                            </span>
                          </span>
                        </div>
                      </div>

                      {modalHoveredPoint && (
                        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <span>{modalHoveredPoint.timeLabel}</span>
                        </div>
                      )}
                    </div>

                    {/* Large High-Fidelity Graph Container */}
                    <div className="bg-[#070a10] border border-slate-800/80 rounded-xl p-3 sm:p-4 relative shadow-inner">
                      <StockCardSparkline
                        ticker={selectedStock.ticker}
                        currentPrice={livePrice}
                        change={selectedStock.change}
                        onHoverPoint={setModalHoveredPoint}
                        onRangeCalculated={setModalDailyRange}
                        height={240}
                        className="w-full"
                      />
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mt-2 px-1 border-t border-slate-800/60 pt-2.5">
                        <span>Low: ${modalDailyRange?.low.toFixed(2) || (livePrice * 0.985).toFixed(2)}</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-slate-400 font-semibold flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                          Intraday 1D
                        </span>
                        <span className="text-slate-600">·</span>
                        <span>High: ${modalDailyRange?.high.toFixed(2) || (livePrice * 1.015).toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Quick Metric Tiles */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-0.5">
                      <div className="bg-[#080c14] border border-slate-800/80 rounded-lg p-2.5 text-center">
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Category</span>
                        <span className="text-xs font-semibold text-slate-300 mt-0.5 block truncate">{selectedStock.category}</span>
                      </div>
                      <div className="bg-[#080c14] border border-slate-800/80 rounded-lg p-2.5 text-center">
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Opening</span>
                        <span className="text-xs font-mono font-semibold text-slate-300 mt-0.5 block">
                          ${openPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="bg-[#080c14] border border-slate-800/80 rounded-lg p-2.5 text-center">
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Owned Shares</span>
                        <span className="text-xs font-mono font-bold text-white mt-0.5 block">
                          {ownedShares} shs
                        </span>
                      </div>
                      <div className="bg-[#080c14] border border-slate-800/80 rounded-lg p-2.5 text-center">
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Position Value</span>
                        <span className="text-xs font-mono font-bold text-emerald-400 mt-0.5 block">
                          ${(ownedShares * livePrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: In-Depth Trade Controls & Financial Breakdown */}
                  <div className="lg:col-span-5 flex flex-col space-y-4 bg-[#080c14] border border-slate-800/90 rounded-xl p-4 sm:p-5">
                    {/* Segmented Buy / Sell Tab Switch */}
                    <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setOrderType('BUY');
                          setTradeError('');
                        }}
                        className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                          orderType === 'BUY'
                            ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Buy {selectedStock.ticker}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOrderType('SELL');
                          setTradeError('');
                        }}
                        className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                          orderType === 'SELL'
                            ? 'bg-rose-600 text-white shadow-md font-extrabold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Sell {selectedStock.ticker}
                      </button>
                    </div>

                    {/* Financial Capacity Card (Buying Power & Owned Shares) */}
                    <div className="rounded-lg bg-slate-900/80 border border-slate-800 p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                          <Wallet className="h-3.5 w-3.5 text-emerald-400" />
                          Available Cash:
                        </span>
                        <span className="font-mono font-bold text-white text-sm">
                          <AnimatedNumber
                            value={userCash}
                            formatter={(val) =>
                              `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            }
                          />
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60">
                        <span className="text-slate-400 font-medium">Shares Currently Owned:</span>
                        <span className="font-mono font-bold text-slate-200">
                          {ownedShares} shares
                        </span>
                      </div>
                    </div>

                    {/* Shares Input Stepper */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-medium">
                        <label className="text-slate-300 font-semibold">Number of Shares</label>
                        {orderType === 'BUY' ? (
                          <span className="text-slate-500 text-[11px] font-mono">
                            Max Buyable: <span className="text-slate-300 font-bold">{maxBuyQty}</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px] font-mono">
                            Available to Sell: <span className="text-slate-300 font-bold">{ownedShares}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 bg-[#05080f] border border-slate-800 rounded-lg p-1">
                        <button
                          type="button"
                          onClick={() => setTradeQty(Math.max(1, tradeQty - 1))}
                          className="h-9 w-9 rounded-md bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg flex items-center justify-center transition-colors cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={orderType === 'SELL' ? ownedShares || 1 : undefined}
                          value={tradeQty}
                          onChange={(e) => setTradeQty(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full bg-transparent text-center text-xl font-bold font-mono text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          onClick={() => setTradeQty(tradeQty + 1)}
                          className="h-9 w-9 rounded-md bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg flex items-center justify-center transition-colors cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      {/* Quick Percentage / Quantity Chips */}
                      <div className="flex gap-1.5 pt-0.5">
                        {orderType === 'BUY' ? (
                          <>
                            {[1, 5, 10, 25].map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => setTradeQty(preset)}
                                className={`flex-1 py-1 rounded text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                                  tradeQty === preset
                                    ? 'bg-emerald-500 text-slate-950 font-black'
                                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                                }`}
                              >
                                +{preset}
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => setTradeQty(Math.max(1, maxBuyQty))}
                              className="flex-1 py-1 rounded text-[11px] font-mono font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors cursor-pointer"
                              title={`Buy max possible shares (${maxBuyQty})`}
                            >
                              MAX
                            </button>
                          </>
                        ) : (
                          <>
                            {[
                              { label: '25%', qty: Math.max(1, Math.floor(ownedShares * 0.25)) },
                              { label: '50%', qty: Math.max(1, Math.floor(ownedShares * 0.50)) },
                              { label: '75%', qty: Math.max(1, Math.floor(ownedShares * 0.75)) },
                            ].map((p) => (
                              <button
                                key={p.label}
                                type="button"
                                onClick={() => setTradeQty(p.qty)}
                                disabled={ownedShares === 0}
                                className={`flex-1 py-1 rounded text-[11px] font-mono font-bold transition-colors cursor-pointer disabled:opacity-30 ${
                                  tradeQty === p.qty
                                    ? 'bg-rose-600 text-white font-black'
                                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                                }`}
                              >
                                {p.label}
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => setTradeQty(Math.max(1, ownedShares))}
                              disabled={ownedShares === 0}
                              className="flex-1 py-1 rounded text-[11px] font-mono font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer disabled:opacity-30"
                              title={`Sell all owned shares (${ownedShares})`}
                            >
                              ALL
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Detailed Financial Breakdown */}
                    <div className="rounded-lg bg-[#05080f] border border-slate-800/80 p-3.5 space-y-2 text-xs font-mono">
                      <div className="flex justify-between items-center text-slate-400">
                        <span className="font-sans">Market Price / Share</span>
                        <span className="text-slate-200 font-bold">${livePrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400">
                        <span className="font-sans">{orderType === 'BUY' ? 'Total Order Cost' : 'Total Net Proceeds'}</span>
                        <span className={`font-bold text-sm ${orderType === 'BUY' ? 'text-white' : 'text-emerald-400'}`}>
                          <AnimatedNumber
                            value={orderTotal}
                            formatter={(val) =>
                              `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            }
                          />
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-800/60 text-slate-400">
                        <span className="font-sans">Cash Balance After Order</span>
                        <span
                          className={`font-bold ${
                            remainingCash < 0 ? 'text-rose-400' : 'text-slate-200'
                          }`}
                        >
                          ${Math.max(0, remainingCash).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Validation Warnings */}
                    {orderType === 'BUY' && !canAffordBuy && (
                      <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium text-center">
                        Insufficient cash: You need an additional ${(orderTotal - userCash).toFixed(2)}
                      </div>
                    )}

                    {orderType === 'SELL' && ownedShares === 0 && (
                      <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium text-center">
                        You do not own any shares of {selectedStock.ticker} to sell.
                      </div>
                    )}

                    {orderType === 'SELL' && ownedShares > 0 && !hasEnoughSharesToSell && (
                      <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium text-center">
                        Cannot sell {tradeQty} shares: You only own {ownedShares}.
                      </div>
                    )}

                    {tradeError && (
                      <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium text-center">
                        {tradeError}
                      </div>
                    )}

                    {/* Primary Action Submit Button */}
                    <button
                      type="button"
                      onClick={() => executeTradeSubmit(orderType)}
                      disabled={
                        tradeLoading ||
                        (orderType === 'BUY' && !canAffordBuy) ||
                        (orderType === 'SELL' && (!hasEnoughSharesToSell || ownedShares === 0))
                      }
                      className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                        orderType === 'BUY'
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 active:scale-[0.99]'
                          : 'bg-rose-600 hover:bg-rose-500 text-white active:scale-[0.99]'
                      }`}
                    >
                      {tradeLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                          Submitting Order...
                        </span>
                      ) : orderType === 'BUY' ? (
                        `Buy ${tradeQty} ${selectedStock.ticker} · $${orderTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      ) : (
                        `Sell ${tradeQty} ${selectedStock.ticker} · $${orderTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Stock Info slide-over drawer */}
      <StockInfoDrawer
        symbol={drawerSymbol}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
