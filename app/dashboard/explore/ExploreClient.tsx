'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, Zap, Eye, ShoppingCart, X, Info } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { handleTrade } from '@/app/actions/trading';
import { StockInfoDrawer } from '@/components/ui/StockInfoDrawer';
import { useStockMarket, StockQuote } from '@/context/StockMarketContext';

const CATEGORIES = ['All', 'Technology', 'Healthcare', 'Energy', 'Finance', 'Consumer'];

export default function MarketExplorer() {
  const { user } = useAuth();
  const { stocks, getStock } = useStockMarket();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Trade Modal State
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockQuote | null>(null);
  const [tradeQty, setTradeQty] = useState(1);
  const [tradeLoading, setTradeLoading] = useState(false);
  const [tradeError, setTradeError] = useState('');
  const [tradeSuccess, setTradeSuccess] = useState(false);

  // Stock Details Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerSymbol, setDrawerSymbol] = useState('');

  const openDrawer = (symbol: string) => {
    setDrawerSymbol(symbol);
    setDrawerOpen(true);
  };

  const filteredStocks = stocks.filter(stock => {
    const matchesSearch = stock.ticker.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         stock.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || stock.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openTradeModal = (stock: StockQuote) => {
    // Get latest synchronized quote
    const freshStock = getStock(stock.ticker) || stock;
    setSelectedStock(freshStock);
    setTradeModalOpen(true);
    setTradeError('');
    setTradeSuccess(false);
    setTradeQty(1);
  };

  const executeTradeSubmit = async (type: 'BUY' | 'SELL') => {
    if (!selectedStock) return;
    setTradeLoading(true);
    setTradeError('');
    try {
      await handleTrade(selectedStock.ticker, Number(tradeQty), type);
      setTradeSuccess(true);
      setTimeout(() => {
        setTradeModalOpen(false);
        setTradeSuccess(false);
      }, 1500);
    } catch (err: any) {
      setTradeError(err.message || 'Trade failed. Ensure you have sufficient funds/shares.');
    } finally {
      setTradeLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Market Explorer</h1>
          <p className="text-slate-400 font-medium">Discover and trade your favorite assets instantly. Prices update synchronously in real time.</p>
        </div>
        
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text"
            placeholder="Search by ticker or company name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1a2133]/90 backdrop-blur-md border border-slate-700/50 rounded-2xl py-3.5 pl-12 pr-4 text-white font-semibold placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-xl"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              selectedCategory === cat 
                ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] translate-y-[-2px]' 
                : 'bg-[#1a2133]/60 text-slate-400 border border-slate-700/50 hover:bg-[#1a2133] hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Stock Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode='popLayout'>
          {filteredStocks.map((stock, idx) => (
            <motion.div
              key={stock.ticker}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: (idx % 10) * 0.03 }}
              className="group rounded-3xl bg-[#1a2133]/90 backdrop-blur-md border border-slate-700/50 p-6 shadow-xl hover:border-blue-500/30 transition-all hover:shadow-2xl hover:shadow-blue-500/5 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-2 flex items-center justify-center shadow-inner shrink-0 overflow-hidden relative">
                      <img 
                        src={stock.logo || `https://logo.clearbit.com/${stock.ticker.toLowerCase()}.com`} 
                        alt={stock.name} 
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling;
                          if (fallback) fallback.classList.remove('hidden');
                        }}
                        className="w-full h-full object-contain filter drop-shadow"
                      />
                      <div className="hidden absolute inset-0 flex items-center justify-center text-xl font-black text-white bg-gradient-to-br from-blue-500/30 to-teal-500/30 uppercase">
                        {stock.ticker[0]}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-white font-bold tracking-tight truncate">{stock.ticker}</h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDrawer(stock.ticker);
                          }}
                          className="p-1 rounded-lg bg-slate-800/40 border border-slate-700/50 text-slate-400 hover:text-blue-400 hover:border-blue-500/30 transition-all hover:bg-slate-750/30 shrink-0"
                          title="View corporate details and metrics"
                        >
                          <Info className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">{stock.name}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shrink-0 ${
                    stock.category === 'Technology' ? 'bg-blue-500/10 text-blue-400' :
                    stock.category === 'Finance' ? 'bg-indigo-500/10 text-indigo-400' :
                    stock.category === 'Consumer' ? 'bg-orange-500/10 text-orange-400' :
                    stock.category === 'Energy' ? 'bg-yellow-500/10 text-yellow-400' :
                    'bg-teal-500/10 text-teal-400'
                  }`}>
                    {stock.category}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-2xl font-black text-white mb-1">
                    ${stock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className={`text-xs font-bold flex items-center gap-1 ${stock.change >= 0 ? 'text-teal-400' : 'text-rose-500'}`}>
                    {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}% 
                    <TrendingUp className={`h-3 w-3 ${stock.change < 0 ? 'rotate-180' : ''}`} />
                    <span className="text-slate-400 text-[10px] ml-1 font-semibold">PAST 24H</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => openTradeModal(stock)}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-3 rounded-2xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2 active:scale-95"
                >
                  <ShoppingCart className="h-3.5 w-3.5" /> Buy / Trade
                </button>
                <button 
                  onClick={() => openDrawer(stock.ticker)}
                  className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white transition-all hover:bg-slate-700/50"
                  title="View Details"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredStocks.length === 0 && (
        <div className="text-center py-20 bg-[#1a2133]/40 rounded-3xl border border-dashed border-slate-700/50">
          <Search className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-400">No stocks found</h3>
          <p className="text-slate-500">Try adjusting your search or category filter.</p>
        </div>
      )}

      {/* Trade Modal */}
      <AnimatePresence>
        {tradeModalOpen && selectedStock && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#1a2133] border border-slate-700/50 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[60px] pointer-events-none" />
              
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 p-2 flex items-center justify-center overflow-hidden shrink-0 relative">
                    <img 
                      src={selectedStock.logo || `https://logo.clearbit.com/${selectedStock.ticker.toLowerCase()}.com`} 
                      alt={selectedStock.name} 
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling;
                        if (fallback) fallback.classList.remove('hidden');
                      }}
                      className="w-full h-full object-contain filter drop-shadow"
                    />
                    <div className="hidden absolute inset-0 flex items-center justify-center text-lg font-black text-white bg-gradient-to-br from-blue-500/30 to-teal-500/30 uppercase">
                      {selectedStock.ticker[0]}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white font-black text-2xl tracking-tight truncate">Trade {selectedStock.ticker}</h3>
                    <p className="text-slate-400 text-xs font-semibold truncate">{selectedStock.name}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setTradeModalOpen(false)} 
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-800/50 text-slate-400 hover:text-white transition-colors shrink-0"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {tradeSuccess ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <Zap className="h-10 w-10 text-teal-400 fill-teal-400" />
                  </div>
                  <h4 className="text-2xl font-bold text-white">Order Executed!</h4>
                  <p className="text-slate-400">Your portfolio has been updated.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-6 rounded-3xl bg-[#0f111a] border border-slate-700/60 shadow-inner space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                      <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Market Price</span>
                      <span className="text-2xl font-black text-white">${(getStock(selectedStock.ticker)?.price || selectedStock.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Shares Quantity</label>
                        <div className="flex gap-1.5">
                          {[1, 5, 10, 50].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setTradeQty(preset)}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white border border-slate-700 transition-all"
                            >
                              +{preset}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 bg-[#151926] border border-slate-700/70 rounded-2xl p-2">
                        <button 
                          type="button"
                          onClick={() => setTradeQty(Math.max(1, tradeQty - 1))}
                          className="h-11 w-11 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 text-white font-black text-xl flex items-center justify-center transition-all shadow"
                        >
                          -
                        </button>
                        <input 
                          type="number" 
                          min="1"
                          value={tradeQty}
                          onChange={(e) => setTradeQty(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full bg-transparent text-center text-3xl font-black text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button 
                          type="button"
                          onClick={() => setTradeQty(tradeQty + 1)}
                          className="h-11 w-11 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 text-white font-black text-xl flex items-center justify-center transition-all shadow"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                      <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Total Cost</span>
                      <span className="text-2xl font-black text-blue-400">${(((getStock(selectedStock.ticker)?.price || selectedStock.price)) * tradeQty).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                  
                  {tradeError && (
                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold text-center">
                      {tradeError}
                    </div>
                  )}
                  
                  <div className="flex gap-4">
                    <button 
                      onClick={() => executeTradeSubmit('BUY')}
                      disabled={tradeLoading}
                      className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-black py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)] disabled:opacity-50 active:scale-95 text-sm uppercase tracking-wider"
                    >
                      {tradeLoading ? 'Confirming...' : 'Confirm Buy'}
                    </button>
                    <button 
                      onClick={() => executeTradeSubmit('SELL')}
                      disabled={tradeLoading}
                      className="flex-1 bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-black py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(244,63,94,0.3)] disabled:opacity-50 active:scale-95 text-sm uppercase tracking-wider"
                    >
                      {tradeLoading ? 'Confirming...' : 'Confirm Sell'}
                    </button>
                  </div>
                  
                  <p className="text-[10px] text-center text-slate-500 font-bold uppercase tracking-widest px-4">
                    By confirming, you agree to execute this trade at the current market price using your paper balance.
                  </p>
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
