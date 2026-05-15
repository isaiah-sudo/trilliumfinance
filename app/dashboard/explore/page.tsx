'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, Cpu, Zap, Globe, DollarSign, Loader2 } from 'lucide-react';
import { executeTrade } from '@/app/actions/trading';

const CATEGORIES = [
  { id: 'all', name: 'All Stocks', icon: Globe },
  { id: 'tech', name: 'Technology', icon: Cpu },
  { id: 'energy', name: 'Energy', icon: Zap },
  { id: 'index', name: 'Indices', icon: TrendingUp },
];

const PREDEFINED_STOCKS = [
  { ticker: 'AAPL', name: 'Apple Inc.', category: 'tech' },
  { ticker: 'MSFT', name: 'Microsoft Corp.', category: 'tech' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', category: 'tech' },
  { ticker: 'TSLA', name: 'Tesla, Inc.', category: 'tech' },
  { ticker: 'NVDA', name: 'NVIDIA Corporation', category: 'tech' },
  { ticker: 'XOM', name: 'Exxon Mobil Corp.', category: 'energy' },
  { ticker: 'CVX', name: 'Chevron Corp.', category: 'energy' },
  { ticker: 'SPY', name: 'S&P 500 ETF', category: 'index' },
  { ticker: 'QQQ', name: 'Nasdaq 100 ETF', category: 'index' },
];

export default function MarketExplorerPage() {
  const { user, loading: authLoading } = useAuth();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [tradeQty, setTradeQty] = useState(1);
  const [tradeLoading, setTradeLoading] = useState(false);
  const [tradeError, setTradeError] = useState('');
  const [tradeSuccess, setTradeSuccess] = useState(false);

  const filteredStocks = PREDEFINED_STOCKS.filter(stock => {
    const matchesSearch = stock.ticker.toLowerCase().includes(search.toLowerCase()) || 
                          stock.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || stock.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const openTradeModal = (stock: any) => {
    setSelectedStock(stock);
    setTradeModalOpen(true);
    setTradeError('');
    setTradeSuccess(false);
  };

  const handleTrade = async (type: 'BUY' | 'SELL') => {
    if (!selectedStock) return;
    setTradeLoading(true);
    setTradeError('');
    setTradeSuccess(false);
    try {
      await executeTrade(selectedStock.ticker, Number(tradeQty), type);
      setTradeSuccess(true);
      setTimeout(() => {
        setTradeModalOpen(false);
        setTradeSuccess(false);
      }, 2000);
    } catch (err: any) {
      setTradeError(err.message || 'Trade failed');
    } finally {
      setTradeLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Search Section */}
      <section className="text-center space-y-6 pt-4">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-extrabold text-white tracking-tight"
        >
          Explore the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">Market</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-slate-400 text-lg max-w-2xl mx-auto"
        >
          Discover new opportunities, track performance, and grow your paper portfolio with real-time market insights.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-xl mx-auto relative"
        >
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-500" />
          </div>
          <input 
            type="text"
            placeholder="Search by ticker or company name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1a2133]/90 border border-slate-700/50 rounded-2xl pl-12 pr-4 py-4 text-white font-medium focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all backdrop-blur-md"
          />
        </motion.div>
      </section>

      {/* Categories Section */}
      <div className="flex flex-wrap justify-center gap-3">
        {CATEGORIES.map((cat, idx) => (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + (idx * 0.05) }}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
              activeCategory === cat.id 
                ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' 
                : 'bg-[#1a2133] text-slate-400 hover:text-white border border-slate-700/50 hover:border-slate-600'
            }`}
          >
            <cat.icon className="h-4 w-4" />
            {cat.name}
          </motion.button>
        ))}
      </div>

      {/* Stock Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
        <AnimatePresence mode="popLayout">
          {filteredStocks.map((stock, idx) => (
            <motion.div
              layout
              key={stock.ticker}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
              className="group rounded-3xl bg-[#1a2133]/90 border border-slate-700/50 p-6 hover:border-blue-500/50 transition-all hover:shadow-[0_0_30px_rgba(37,99,235,0.1)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <TrendingUp className="h-24 w-24 text-blue-500" />
              </div>

              <div className="flex justify-between items-start relative z-10">
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tighter">{stock.ticker}</h3>
                  <p className="text-slate-400 text-sm font-semibold truncate max-w-[150px]">{stock.name}</p>
                </div>
                <div className="px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                  {stock.category}
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between relative z-10">
                <div className="text-teal-400 font-bold flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  +2.45%
                </div>
                <button 
                  onClick={() => openTradeModal(stock)}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-[0_4px_15px_rgba(37,99,235,0.3)] hover:translate-y-[-2px]"
                >
                  Buy Stock
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredStocks.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 space-y-4"
        >
          <Search className="h-12 w-12 text-slate-700 mx-auto" />
          <p className="text-slate-500 font-bold">No stocks found matching "{search}"</p>
        </motion.div>
      )}

      {/* Trade Modal */}
      <AnimatePresence>
        {tradeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#1a2133] border border-slate-700 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-teal-500" />
              
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-white font-black text-3xl tracking-tighter">{selectedStock?.ticker}</h3>
                  <p className="text-slate-400 font-bold text-sm">{selectedStock?.name}</p>
                </div>
                <button onClick={() => setTradeModalOpen(false)} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Purchase Quantity</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="number" 
                      min="1"
                      value={tradeQty}
                      onChange={(e) => setTradeQty(Number(e.target.value))}
                      className="flex-1 bg-[#0f111a] border border-slate-700/50 rounded-2xl px-6 py-4 text-white text-xl font-bold focus:outline-none focus:border-blue-500 transition-all shadow-inner"
                    />
                    <div className="text-slate-400 font-bold">Shares</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 font-bold">Estimated Price</span>
                    <span className="text-white font-bold">$189.42</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="text-slate-400 font-bold">Total Cost</span>
                    <span className="text-teal-400 font-black">${(tradeQty * 189.42).toLocaleString()}</span>
                  </div>
                </div>
                
                {tradeError && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-rose-500 text-sm font-bold bg-rose-500/10 p-3 rounded-xl border border-rose-500/20"
                  >
                    {tradeError}
                  </motion.div>
                )}

                {tradeSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-teal-400 text-center text-lg font-bold py-4 bg-teal-400/10 rounded-2xl border border-teal-400/20"
                  >
                    Trade Executed Successfully!
                  </motion.div>
                )}
                
                <div className="flex gap-4 pt-4">
                  {!tradeSuccess && (
                    <>
                      <button 
                        onClick={() => handleTrade('BUY')}
                        disabled={tradeLoading}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black py-4 rounded-2xl transition-all shadow-[0_8px_20px_rgba(37,99,235,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {tradeLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <DollarSign className="h-5 w-5" />}
                        Confirm Buy
                      </button>
                    </>
                  )}
                </div>
                
                <p className="text-[10px] text-center text-slate-500 font-bold uppercase tracking-widest">
                  This is a paper trade simulation. No real funds are used.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
