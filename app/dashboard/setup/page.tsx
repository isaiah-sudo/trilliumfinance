'use client';

import { useState } from 'react';
import { initializePortfolio } from '@/app/actions/trading';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Zap, BarChart, Check, Loader2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const OPTIONS = [
  {
    id: 'tech_heavy',
    title: 'The Tech Heavy',
    description: 'High-growth potential with industry leaders.',
    assets: ['5x AAPL', '2x MSFT'],
    icon: Cpu,
    color: 'blue',
    gradient: 'from-blue-500/20 to-indigo-500/20',
    borderColor: 'border-blue-500/30'
  },
  {
    id: 'index_follower',
    title: 'The Index Follower',
    description: 'Diversified exposure tracking the S&P 500.',
    assets: ['10x SPY'],
    icon: BarChart,
    color: 'teal',
    gradient: 'from-teal-500/20 to-emerald-500/20',
    borderColor: 'border-teal-500/30'
  },
  {
    id: 'day_trader',
    title: 'The Day Trader',
    description: 'Maximum flexibility. You decide every move.',
    assets: ['100% Cash'],
    icon: Zap,
    color: 'amber',
    gradient: 'from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-500/30'
  }
];

export default function PortfolioSetup() {
  const [strategy, setStrategy] = useState<string>('index_follower');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const router = useRouter();

  const handleInitialize = async () => {
    setLoading(true);
    setStatus(null);
    try {
      await initializePortfolio(strategy as any);
      setStatus('Success! Redirecting...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (e) {
      setStatus('Error: ' + (e as any).message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full text-center space-y-4 mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
          Choose Your <span className="text-blue-500">Starting Edge</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
          Every new account starts with exactly <span className="text-white font-bold">$10,000</span>. 
          Pick a strategy to distribute your initial capital.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl 2xl:max-w-7xl">
        {OPTIONS.map((opt, idx) => (
          <motion.div
            key={opt.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => setStrategy(opt.id)}
            className={`relative group cursor-pointer rounded-[2.5rem] p-8 border-2 transition-all duration-500 overflow-hidden ${
              strategy === opt.id 
                ? `${opt.borderColor} bg-[#1a2133] shadow-[0_0_40px_rgba(37,99,235,0.15)] scale-105` 
                : 'border-slate-800 bg-[#0f111a] hover:border-slate-700 opacity-60 hover:opacity-100'
            }`}
          >
            {/* Background Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${opt.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className={`w-14 h-14 rounded-2xl bg-[#0f111a] border border-slate-700/50 flex items-center justify-center mb-6 shadow-inner ${
                strategy === opt.id ? 'border-blue-500/50' : ''
              }`}>
                <opt.icon className={`h-7 w-7 ${
                  strategy === opt.id ? 'text-blue-400' : 'text-slate-500'
                }`} />
              </div>

              <h3 className="text-xl font-bold text-white mb-2">{opt.title}</h3>
              <p className="text-slate-500 text-sm font-medium mb-6 leading-relaxed">{opt.description}</p>

              <div className="mt-auto pt-6 border-t border-slate-800/50">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Initial Assets</div>
                <div className="flex flex-wrap gap-2">
                  {opt.assets.map(asset => (
                    <span key={asset} className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300">
                      {asset}
                    </span>
                  ))}
                </div>
              </div>

              {strategy === opt.id && (
                <motion.div 
                  layoutId="check"
                  className="absolute top-6 right-6 h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                >
                  <Check className="h-4 w-4 text-white" />
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-16 w-full max-w-md"
      >
        <button
          onClick={handleInitialize}
          disabled={loading}
          className="w-full group relative flex items-center justify-center gap-3 py-5 bg-white text-black font-black text-lg rounded-[2rem] hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
        >
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              Deploy Portfolio <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        <AnimatePresence>
          {status && (
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mt-6 text-center font-bold text-sm ${
                status.startsWith('Error') ? 'text-rose-500' : 'text-teal-400'
              }`}
            >
              {status}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
