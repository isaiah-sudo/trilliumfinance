'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Cpu, Coins, Globe, Landmark, TrendingUp } from 'lucide-react';
import { getCompanyProfile, CompanyProfile } from '@/app/actions/stockDetails';
import { Spinner } from './Spinner';

interface StockInfoDrawerProps {
  symbol: string;
  isOpen: boolean;
  onClose: () => void;
}

export const StockInfoDrawer: React.FC<StockInfoDrawerProps> = ({
  symbol,
  isOpen,
  onClose,
}) => {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Trigger loader whenever drawer opens or symbol changes
  useEffect(() => {
    if (!isOpen || !symbol) return;

    let active = true;
    setLoading(true);
    setError(null);
    setProfile(null);

    getCompanyProfile(symbol)
      .then((data) => {
        if (active) {
          setProfile(data);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || 'Failed to load corporate profile.');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [isOpen, symbol]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const formatMarketCap = (val: number) => {
    if (!val) return 'N/A';
    // Finnhub market cap is in millions, divide by 1000 to cleanly scale to billions
    const inBillions = val / 1000;
    return `$${inBillions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}B`;
  };

  const formatOutstandingShares = (val: number) => {
    if (!val) return 'N/A';
    return `${val.toLocaleString(undefined, { maximumFractionDigits: 2 })}M`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Atmospheric Backdrop Blur Mask */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-[#030712]/80 backdrop-blur-[6px] cursor-pointer"
          />

          {/* Premium Right Slide-Over Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 210 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md md:max-w-lg bg-[#0e121f]/95 border-l border-slate-800/80 shadow-[0_0_50px_rgba(0,0,0,0.6)] backdrop-blur-xl flex flex-col"
          >
            {/* Elegant Background Visual Accents */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-blue-600/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-500/5 blur-[120px] pointer-events-none" />

            {/* Header Block */}
            <div className="relative flex items-center justify-between p-6 border-b border-slate-800/60 z-10">
              <div>
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Asset Details</span>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
                  Overview <span className="font-mono text-xs px-2.5 py-0.5 bg-blue-500/15 text-blue-400 border border-blue-500/10 rounded-md uppercase">{symbol}</span>
                </h2>
              </div>
              <button
                onClick={onClose}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-800/40 text-slate-400 hover:text-white border border-slate-850 hover:border-slate-700 transition-all active:scale-95"
                aria-label="Close details"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Main Content Viewport */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10">
              {loading && (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <Spinner className="h-10 w-10 text-blue-500" />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">
                    Retrieving corporate metrics...
                  </p>
                </div>
              )}

              {error && (
                <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold text-center">
                  {error}
                </div>
              )}

              {!loading && !error && profile && (
                <div className="space-y-8">
                  {/* Premium branding header card */}
                  <div className="flex items-center gap-4 bg-[#141925]/80 border border-slate-800/60 p-5 rounded-3xl shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl pointer-events-none" />
                    
                    <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/15 p-2.5 flex items-center justify-center shadow-inner shrink-0 overflow-hidden relative">
                      <img 
                        src={profile.logo || `https://logo.clearbit.com/${(profile.weburl || symbol).replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}`} 
                        alt={profile.name} 
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling;
                          if (fallback) fallback.classList.remove('hidden');
                        }}
                        className="w-full h-full object-contain filter drop-shadow"
                      />
                      <div className="hidden absolute inset-0 flex items-center justify-center text-2xl font-black text-white bg-gradient-to-br from-blue-500/30 to-teal-500/30 uppercase">
                        {profile.name[0] || symbol[0]}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-black text-white tracking-tight truncate leading-snug">{profile.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                          {profile.ticker}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Landmark className="h-3 w-3 text-slate-500" /> {profile.exchange}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Company Profile paragraph */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Company Profile</h4>
                    <p className="text-sm text-slate-300 leading-relaxed font-medium bg-[#141925]/60 border border-slate-800/60 p-5 rounded-3xl shadow-inner">
                      {profile.description}
                    </p>
                  </div>

                  {/* Metric Card Matrix */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Market Metrics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      
                      {/* Sector Card */}
                      <div className="bg-[#141925]/80 border border-slate-800/70 p-4 rounded-2xl flex flex-col gap-2.5 shadow-sm hover:border-slate-700 transition-colors">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sector</span>
                        <div className="flex items-center gap-2.5 text-white font-extrabold text-sm truncate">
                          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
                            <Cpu className="h-4 w-4" />
                          </div>
                          <span className="truncate">{profile.finnhubIndustry || 'N/A'}</span>
                        </div>
                      </div>

                      {/* Market Cap Card */}
                      <div className="bg-[#141925]/80 border border-slate-800/70 p-4 rounded-2xl flex flex-col gap-2.5 shadow-sm hover:border-slate-700 transition-colors">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Market Cap</span>
                        <div className="flex items-center gap-2.5 text-white font-extrabold text-sm truncate">
                          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 shrink-0">
                            <TrendingUp className="h-4 w-4" />
                          </div>
                          <span className="truncate">{formatMarketCap(profile.marketCapitalization)}</span>
                        </div>
                      </div>

                      {/* Outstanding Shares Card */}
                      <div className="bg-[#141925]/80 border border-slate-800/70 p-4 rounded-2xl flex flex-col gap-2.5 shadow-sm hover:border-slate-700 transition-colors">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Outstanding Shares</span>
                        <div className="flex items-center gap-2.5 text-white font-extrabold text-sm truncate">
                          <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-400 shrink-0">
                            <Coins className="h-4 w-4" />
                          </div>
                          <span className="truncate">{formatOutstandingShares(profile.shareOutstanding)}</span>
                        </div>
                      </div>

                      {/* Website Card */}
                      <div className="bg-[#141925]/80 border border-slate-800/70 p-4 rounded-2xl flex flex-col gap-2.5 shadow-sm hover:border-slate-700 transition-colors">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Website</span>
                        <div className="flex items-center gap-2.5 text-white font-extrabold text-sm truncate">
                          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
                            <Globe className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            {profile.weburl ? (
                              <a
                                href={profile.weburl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors group/link truncate max-w-full"
                              >
                                <span className="truncate">{profile.weburl.replace(/^https?:\/\/(www\.)?/, '')}</span>
                                <ExternalLink className="h-3 w-3 shrink-0 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                              </a>
                            ) : (
                              <span className="text-xs font-bold text-slate-500">N/A</span>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Action Footer */}
            <div className="p-6 border-t border-slate-800/60 bg-[#0e121f]/90 backdrop-blur-md relative z-10 flex gap-4">
              <button
                onClick={onClose}
                className="w-full bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white font-bold py-3.5 rounded-2xl transition-all border border-slate-800 hover:border-slate-700 active:scale-95 text-xs uppercase tracking-wider"
              >
                Close View
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
