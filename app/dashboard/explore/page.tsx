'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, Cpu, Zap, Leaf, Bitcoin, Eye, ShoppingCart, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { handleTrade, getMarketQuotes } from '@/app/actions/trading';

const BASE_STOCKS = [
  // Technology
  { ticker: 'AAPL', name: 'Apple Inc.', category: 'Technology' },
  { ticker: 'MSFT', name: 'Microsoft Corp.', category: 'Technology' },
  { ticker: 'NVDA', name: 'NVIDIA Corp.', category: 'Technology' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', category: 'Technology' },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', category: 'Technology' },
  { ticker: 'META', name: 'Meta Platforms Inc.', category: 'Technology' },
  { ticker: 'TSM', name: 'Taiwan Semiconductor', category: 'Technology' },
  { ticker: 'AVGO', name: 'Broadcom Inc.', category: 'Technology' },
  { ticker: 'ASML', name: 'ASML Holding', category: 'Technology' },
  { ticker: 'ORCL', name: 'Oracle Corp.', category: 'Technology' },
  { ticker: 'AMD', name: 'Advanced Micro Devices', category: 'Technology' },
  { ticker: 'CRM', name: 'Salesforce Inc.', category: 'Technology' },
  { ticker: 'ADBE', name: 'Adobe Inc.', category: 'Technology' },
  { ticker: 'NFLX', name: 'Netflix Inc.', category: 'Technology' },
  { ticker: 'INTC', name: 'Intel Corporation', category: 'Technology' },
  
  // Healthcare
  { ticker: 'UNH', name: 'UnitedHealth Group', category: 'Healthcare' },
  { ticker: 'LLY', name: 'Eli Lilly & Co.', category: 'Healthcare' },
  { ticker: 'JNJ', name: 'Johnson & Johnson', category: 'Healthcare' },
  { ticker: 'MRK', name: 'Merck & Co.', category: 'Healthcare' },
  { ticker: 'ABBV', name: 'AbbVie Inc.', category: 'Healthcare' },
  { ticker: 'PFE', name: 'Pfizer Inc.', category: 'Healthcare' },
  { ticker: 'TMO', name: 'Thermo Fisher', category: 'Healthcare' },
  { ticker: 'DHR', name: 'Danaher Corp.', category: 'Healthcare' },
  { ticker: 'ABT', name: 'Abbott Labs', category: 'Healthcare' },
  { ticker: 'AMGN', name: 'Amgen Inc.', category: 'Healthcare' },

  // Energy
  { ticker: 'XOM', name: 'Exxon Mobil Corp.', category: 'Energy' },
  { ticker: 'CVX', name: 'Chevron Corp.', category: 'Energy' },
  { ticker: 'COP', name: 'ConocoPhillips', category: 'Energy' },
  { ticker: 'SLB', name: 'Schlumberger N.V.', category: 'Energy' },
  { ticker: 'EOG', name: 'EOG Resources', category: 'Energy' },
  { ticker: 'PXD', name: 'Pioneer Natural', category: 'Energy' },
  { ticker: 'MPC', name: 'Marathon Petroleum', category: 'Energy' },
  { ticker: 'PSX', name: 'Phillips 66', category: 'Energy' },
  { ticker: 'VLO', name: 'Valero Energy', category: 'Energy' },
  { ticker: 'OXY', name: 'Occidental Petroleum', category: 'Energy' },

  // Finance
  { ticker: 'JPM', name: 'JPMorgan Chase', category: 'Finance' },
  { ticker: 'V', name: 'Visa Inc.', category: 'Finance' },
  { ticker: 'MA', name: 'Mastercard Inc.', category: 'Finance' },
  { ticker: 'BAC', name: 'Bank of America', category: 'Finance' },
  { ticker: 'WFC', name: 'Wells Fargo', category: 'Finance' },
  { ticker: 'GS', name: 'Goldman Sachs', category: 'Finance' },
  { ticker: 'MS', name: 'Morgan Stanley', category: 'Finance' },
  { ticker: 'AXP', name: 'American Express', category: 'Finance' },
  { ticker: 'C', name: 'Citigroup Inc.', category: 'Finance' },
  { ticker: 'BLK', name: 'BlackRock Inc.', category: 'Finance' },

  // Consumer
  { ticker: 'WMT', name: 'Walmart Inc.', category: 'Consumer' },
  { ticker: 'PG', name: 'Procter & Gamble', category: 'Consumer' },
  { ticker: 'HD', name: 'Home Depot', category: 'Consumer' },
  { ticker: 'COST', name: 'Costco Wholesale', category: 'Consumer' },
  { ticker: 'KO', name: 'Coca-Cola Co.', category: 'Consumer' },
];

const CATEGORIES = ['All', 'Technology', 'Healthcare', 'Energy', 'Finance', 'Consumer'];

export default function MarketExplorer() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Real-time stock state
  const [stocks, setStocks] = useState(
    BASE_STOCKS.map(s => ({ ...s, price: 0, change: 0, loading: true }))
  );
  
  // Trade Modal State
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [tradeQty, setTradeQty] = useState(1);
  const [tradeLoading, setTradeLoading] = useState(false);
  const [tradeError, setTradeError] = useState('');
  const [tradeSuccess, setTradeSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchPrices = async () => {
      try {
        const tickers = BASE_STOCKS.map(s => s.ticker);
        const quotes = await getMarketQuotes(tickers);
        
        if (mounted && quotes.length > 0) {
          setStocks(prev => prev.map(stock => {
            const quote = quotes.find(q => q.ticker === stock.ticker);
            if (quote) {
              return { 
                ...stock, 
                price: quote.price, 
                change: quote.change, 
                loading: false 
              };
            }
            return stock;
          }));
        }
      } catch (err) {
        console.error('Failed to fetch live quotes', err);
      }
    };

    // Initial fetch
    fetchPrices();

    // Set interval for every 60 seconds to respect API rate limits (60 req/min)
    const interval = setInterval(fetchPrices, 60000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const filteredStocks = stocks.filter(stock => {
    const matchesSearch = stock.ticker.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         stock.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || stock.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openTradeModal = (stock: any) => {
    setSelectedStock(stock);
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
          <p className="text-slate-400 font-medium">Discover and trade your favorite assets instantly. Prices update every 60s.</p>
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
              transition={{ delay: (idx % 10) * 0.05 }} // modulo so it doesn't take forever to render 50 items
              className="group rounded-3xl bg-[#1a2133]/90 backdrop-blur-md border border-slate-700/50 p-6 shadow-xl hover:border-blue-500/30 transition-all hover:shadow-2xl hover:shadow-blue-500/5"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-teal-500/20 border border-white/5 flex items-center justify-center text-xl font-bold text-white shadow-inner">
                    {stock.ticker[0]}
                  </div>
                  <div>
                    <h3 className="text-white font-bold tracking-tight">{stock.ticker}</h3>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{stock.name}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
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
                  {stock.loading ? (
                    <div className="h-8 w-24 bg-slate-800 animate-pulse rounded"></div>
                  ) : (
                    `$${stock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  )}
                </div>
                <div className={`text-xs font-bold flex items-center gap-1 ${stock.change >= 0 ? 'text-teal-400' : 'text-rose-500'}`}>
                  {stock.loading ? (
                    <div className="h-4 w-16 bg-slate-800 animate-pulse rounded"></div>
                  ) : (
                    <>
                      {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}% 
                      <TrendingUp className={`h-3 w-3 ${stock.change < 0 ? 'rotate-180' : ''}`} />
                      <span className="text-slate-500 text-[10px] ml-1 font-semibold">PAST 24H</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => openTradeModal(stock)}
                  disabled={stock.loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-3 rounded-2xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <ShoppingCart className="h-3.5 w-3.5" /> Buy
                </button>
                <button className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white transition-all hover:bg-slate-700/50">
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
        {tradeModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#1a2133] border border-slate-700/50 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[60px] pointer-events-none" />
              
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-white font-black text-2xl tracking-tight">Trade {selectedStock?.ticker}</h3>
                  <p className="text-slate-400 text-sm font-medium">{selectedStock?.name}</p>
                </div>
                <button onClick={() => setTradeModalOpen(false)} className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-800/50 text-slate-400 hover:text-white transition-colors">
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
                <div className="space-y-8">
                  <div className="p-6 rounded-3xl bg-[#0f111a] border border-slate-700/50">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Market Price</span>
                      <span className="text-xl font-black text-white">${selectedStock?.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Number of Shares</label>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => setTradeQty(Math.max(1, tradeQty - 1))}
                          className="h-12 w-12 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-xl hover:bg-slate-700 transition-colors"
                        >
                          -
                        </button>
                        <input 
                          type="number" 
                          min="1"
                          value={tradeQty}
                          onChange={(e) => setTradeQty(Number(e.target.value))}
                          className="flex-1 bg-transparent border-b-2 border-slate-700 focus:border-blue-500 text-center text-3xl font-black text-white py-2 focus:outline-none transition-colors"
                        />
                        <button 
                          onClick={() => setTradeQty(tradeQty + 1)}
                          className="h-12 w-12 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-xl hover:bg-slate-700 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Cost</span>
                      <span className="text-2xl font-black text-blue-400">${(selectedStock?.price * tradeQty).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                  
                  {tradeError && (
                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold text-center">
                      {tradeError}
                    </div>
                  )}
                  
                  <div className="flex gap-4">
                    <button 
                      onClick={() => executeTradeSubmit('BUY')}
                      disabled={tradeLoading}
                      className="flex-1 bg-teal-500 hover:bg-teal-400 text-white font-black py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)] disabled:opacity-50 active:scale-95"
                    >
                      {tradeLoading ? 'Confirming...' : 'Confirm Buy'}
                    </button>
                    <button 
                      onClick={() => executeTradeSubmit('SELL')}
                      disabled={tradeLoading}
                      className="flex-1 bg-rose-500 hover:bg-rose-400 text-white font-black py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(244,63,94,0.3)] disabled:opacity-50 active:scale-95"
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
    </div>
  );
}
