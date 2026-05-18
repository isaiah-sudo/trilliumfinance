'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Lock, Heart, TreePine, X } from 'lucide-react';
import PortfolioChart from '@/components/PortfolioChart';
import { getGraphData } from '@/app/actions/trading';
import { usePortfolioStore } from '@/store/usePortfolioStore';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [showDetails, setShowDetails] = useState(true);
  
  const { portfolio, loading: storeLoading, error: storeError, fetchPortfolio, executeTrade } = usePortfolioStore();
  const [chartData, setChartData] = useState<{ portfolio: any[], benchmark: any[] } | null>(null);
  const [timeRange, setTimeRange] = useState<'1D' | '1W' | '1M' | '1Y'>('1D');

  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [tradeTicker, setTradeTicker] = useState('');
  const [tradeQty, setTradeQty] = useState(1);
  const [tradeLoading, setTradeLoading] = useState(false);
  const [tradeError, setTradeError] = useState('');

  const loadData = async () => {
    await fetchPortfolio();
  };

  useEffect(() => {
    if (!user) return;
    const loadGraph = async () => {
      try {
        const data = await getGraphData(timeRange);
        setChartData(data);
      } catch (err) {
        console.error('Failed to load graph data', err);
      }
    };
    loadGraph();
  }, [user, timeRange]);

  useEffect(() => {
    if (!authLoading && user) {
      loadData();
    }
  }, [user, authLoading]);

  const executeTradeSubmit = async (type: 'BUY' | 'SELL') => {
    if (!tradeTicker) return;
    setTradeLoading(true);
    setTradeError('');
    try {
      await executeTrade(tradeTicker.toUpperCase(), Number(tradeQty), type);
      setTradeModalOpen(false);
      setTradeTicker('');
      setTradeQty(1);
    } catch (err: any) {
      setTradeError(err.message || 'Trade failed');
    } finally {
      setTradeLoading(false);
    }
  };

  const formatCurrency = (val: number) => val.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  const formatPercent = (val: number) => val.toFixed(2) + '%';

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-white text-center mt-20 p-8 rounded-3xl bg-[#1a2133]/90 border border-slate-700/50">
        <Lock className="h-12 w-12 text-slate-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-slate-400 mb-6">Please log in to view your portfolio.</p>
        <a href="/login" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-colors inline-block">
          Go to Login
        </a>
      </div>
    );
  }

  if (storeLoading && !portfolio) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        <p className="font-medium animate-pulse">Syncing with markets...</p>
      </div>
    );
  }

  if (storeError) {
    return (
      <div className="text-white text-center mt-20 p-8 rounded-3xl bg-rose-500/10 border border-rose-500/50">
        <X className="h-12 w-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
        <p className="text-slate-400 mb-6">{storeError}</p>
        <button onClick={loadData} className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 py-3 rounded-xl transition-colors">
          Try Again
        </button>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="text-white text-center mt-20 flex flex-col items-center gap-4">
        <h2 className="text-2xl font-bold">Welcome to Trillium Finance</h2>
        <p className="text-slate-400">Your portfolio is currently empty or failed to load. Start by exploring the market!</p>
        <button 
          onClick={() => setTradeModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-[0_0_15px_rgba(37,99,235,0.4)]"
        >
          Make Your First Trade
        </button>
      </div>
    );
  }

  const marketValue = portfolio.totalMarketValue;

  return (
    <div className="space-y-6 relative">
      {/* Financial Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl bg-[#1a2133]/90 backdrop-blur-md border border-slate-700/50 p-6 shadow-2xl"
      >
        <h2 className="text-teal-400 text-[15px] font-semibold mb-6">Financial Summary</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <div className="col-span-2 md:col-span-1">
            <div className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider mb-2">Net Worth</div>
            <div className="text-3xl font-extrabold text-white tracking-tight">{formatCurrency(portfolio.totalValue)}</div>
          </div>
          
          <div>
            <div className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider mb-2">Market Value</div>
            <div className="text-xl font-bold text-white tracking-tight">{formatCurrency(marketValue)}</div>
          </div>
          
          <div>
            <div className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider mb-2">Total Performance</div>
            <div className={`text-xl font-bold tracking-tight ${portfolio.totalPerformanceUSD >= 0 ? 'text-teal-400' : 'text-rose-500'}`}>
              {portfolio.totalPerformanceUSD >= 0 ? '+' : ''}{formatCurrency(portfolio.totalPerformanceUSD)}
            </div>
            <div className="text-[11px] font-semibold text-slate-500 mt-1">{portfolio.totalPerformanceUSD >= 0 ? '+' : ''}{formatPercent(portfolio.totalPerformancePercent)}</div>
          </div>
          
          <div>
            <div className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider mb-2">Day Performance</div>
            <div className={`text-xl font-bold tracking-tight ${portfolio.dayPerformanceUSD >= 0 ? 'text-teal-400' : 'text-rose-500'}`}>
              {portfolio.dayPerformanceUSD >= 0 ? '+' : ''}{formatCurrency(portfolio.dayPerformanceUSD)}
            </div>
            <div className="text-[11px] font-semibold text-slate-500 mt-1">{portfolio.dayPerformanceUSD >= 0 ? '+' : ''}{formatPercent(portfolio.dayPerformancePercent)}</div>
          </div>
          
          <div>
            <div className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider mb-2">Available Cash</div>
            <div className="text-xl font-bold text-white tracking-tight">{formatCurrency(portfolio.cash)}</div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-700/50 flex justify-center">
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-slate-200 tracking-widest uppercase transition-colors"
          >
            {showDetails ? 'Hide Details' : 'Show XP & Trophies'} 
            {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 p-6 rounded-2xl bg-[#1e293b]/50 border border-slate-700/50 flex flex-col md:flex-row gap-8 overflow-hidden"
            >
              {/* Left Side: Experience */}
              <div className="flex-1">
                <h3 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-4">Your Experience</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-blue-500">10</span>
                  <span className="text-sm font-bold text-slate-400">XP</span>
                </div>
                
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-2">
                  <div className="flex items-center gap-1.5"><TreePine className="h-4 w-4 text-green-500" /> Novice</div>
                  <div className="text-slate-500">Next: Rookie</div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                   <div className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" style={{ width: '10%' }} />
                </div>
              </div>

              {/* Right Side: Top Trophies */}
              <div className="flex-[2] md:pl-8 md:border-l border-slate-700/50 mt-8 md:mt-0">
                <h3 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-4 text-center md:text-left">Top Trophies</h3>
                
                <div className="flex gap-4 justify-center md:justify-start">
                  <div className="w-[140px] h-[100px] rounded-2xl border border-yellow-500/50 bg-yellow-500/5 flex flex-col items-center justify-center gap-2 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                    <Heart className="h-6 w-6 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
                    <span className="text-[10px] font-bold text-slate-300 text-center mt-1">First Trade</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Market Value Card with Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-3xl bg-[#1a2133]/90 backdrop-blur-md border border-slate-700/50 p-6 shadow-2xl"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-slate-400 text-[11px] font-bold tracking-widest uppercase">Market Value</h2>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#0f111a] border border-slate-700/50 text-[10px] font-bold text-slate-300 shadow-inner">
                <Lock className="h-3 w-3" /> Live Market
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#0f111a] border border-slate-700/50 text-[10px] font-bold text-slate-300 shadow-inner">
                vs SPY
              </span>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-baseline gap-3">
            <div className="text-3xl font-extrabold text-white tracking-tight">{formatCurrency(marketValue)}</div>
            <div className={`text-[13px] font-bold ${portfolio.dayPerformanceUSD >= 0 ? 'text-teal-400' : 'text-rose-500'}`}>
              {portfolio.dayPerformanceUSD >= 0 ? '+' : ''}{formatCurrency(portfolio.dayPerformanceUSD)} ({portfolio.dayPerformanceUSD >= 0 ? '+' : ''}{formatPercent(portfolio.dayPerformancePercent)})
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3 text-[11px] font-semibold">
            <div className="flex items-center gap-2 text-teal-400">
              <div className="w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)]" /> Portfolio
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <div className="w-2 h-2 rounded-full bg-slate-400" /> SPY
            </div>
          </div>
        </div>

        <div className="w-full mt-4">
          <PortfolioChart data={chartData || { portfolio: [], benchmark: [] }} timeRange={timeRange} onTimeRangeChange={setTimeRange} />
        </div>
      </motion.div>

      {/* Holdings Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-3xl bg-[#1a2133]/90 backdrop-blur-md border border-slate-700/50 p-6 shadow-2xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-lg font-bold tracking-tight">Holdings Breakdown</h2>
          <button 
            onClick={() => setTradeModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-[0_0_15px_rgba(37,99,235,0.4)]"
          >
            + Buy Stocks
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold whitespace-nowrap">
            <thead className="text-slate-500 border-b border-slate-700/50">
              <tr>
                <th className="pb-3 pr-4 font-semibold uppercase tracking-wider text-[10px]">Symbol</th>
                <th className="pb-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Name</th>
                <th className="pb-3 px-4 font-semibold uppercase tracking-wider text-[10px] text-right">Qty</th>
                <th className="pb-3 px-4 font-semibold uppercase tracking-wider text-[10px] text-right">Avg Price</th>
                <th className="pb-3 px-4 font-semibold uppercase tracking-wider text-[10px] text-right">Market Value</th>
                <th className="pb-3 px-4 font-semibold uppercase tracking-wider text-[10px] text-right">Day P/L</th>
                <th className="pb-3 px-4 font-semibold uppercase tracking-wider text-[10px] text-right">P/L %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30 text-slate-300">
              {!Array.isArray(portfolio.holdings) || portfolio.holdings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">No holdings yet. Start trading!</td>
                </tr>
              ) : portfolio.holdings.map((h: any) => (
                <tr key={h.symbol} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 pr-4 text-blue-400 font-bold">{h.symbol}</td>
                  <td className="py-4 px-4">{h.name}</td>
                  <td className="py-4 px-4 text-right">{h.qty}</td>
                  <td className="py-4 px-4 text-right">{formatCurrency(h.avgPrice)}</td>
                  <td className="py-4 px-4 text-right text-white font-bold">{formatCurrency(h.marketValue)}</td>
                  <td className={`py-4 px-4 text-right ${h.dayPl >= 0 ? 'text-teal-400' : 'text-rose-500'}`}>
                    {h.dayPl >= 0 ? '+' : ''}{formatCurrency(h.dayPl)}
                  </td>
                  <td className={`py-4 px-4 text-right ${h.plPercent >= 0 ? 'text-teal-400' : 'text-rose-500'}`}>
                    {h.plPercent >= 0 ? '+' : ''}{formatPercent(h.plPercent)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Trade Modal */}
      <AnimatePresence>
        {tradeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1a2133] border border-slate-700 rounded-3xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-bold text-lg">Trade Stock</h3>
                <button onClick={() => setTradeModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Ticker Symbol</label>
                  <input 
                    type="text" 
                    value={tradeTicker}
                    onChange={(e) => setTradeTicker(e.target.value)}
                    placeholder="AAPL, TSLA, SPY..."
                    className="w-full bg-[#0f111a] border border-slate-700 rounded-xl px-4 py-3 text-white font-bold placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors uppercase"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Quantity</label>
                  <input 
                    type="number" 
                    min="1"
                    value={tradeQty}
                    onChange={(e) => setTradeQty(Number(e.target.value))}
                    className="w-full bg-[#0f111a] border border-slate-700 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                
                {tradeError && <div className="text-rose-500 text-xs font-bold">{tradeError}</div>}
                
                <div className="flex gap-4 pt-2">
                  <button 
                    onClick={() => executeTradeSubmit('BUY')}
                    disabled={tradeLoading || !tradeTicker}
                    className="flex-1 bg-teal-500 hover:bg-teal-400 text-white font-bold py-3 rounded-xl transition-colors shadow-[0_0_15px_rgba(20,184,166,0.3)] disabled:opacity-50"
                  >
                    {tradeLoading ? 'Processing...' : 'Buy'}
                  </button>
                  <button 
                    onClick={() => executeTradeSubmit('SELL')}
                    disabled={tradeLoading || !tradeTicker}
                    className="flex-1 bg-rose-500 hover:bg-rose-400 text-white font-bold py-3 rounded-xl transition-colors shadow-[0_0_15px_rgba(244,63,94,0.3)] disabled:opacity-50"
                  >
                    {tradeLoading ? 'Processing...' : 'Sell'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
