'use client';

import React from 'react';
import { Card } from '@/components/ui';
import { AlertCircle, ShieldCheck, ShieldAlert, TrendingUp, Calendar, Coins } from 'lucide-react';

interface StudentRulesBannerProps {
  className?: string;
  rules: {
    maxDailyTrades?: number;
    startingCash?: number;
    allowedAssets?: string[];
    blacklistedAssets?: string[];
  };
  tradesToday: number;
  classNameInfo: string;
}

export default function StudentRulesBanner({ className, rules, tradesToday, classNameInfo }: StudentRulesBannerProps) {
  const maxTrades = rules.maxDailyTrades ?? 0;
  const remainingTrades = Math.max(0, maxTrades - tradesToday);
  const percentUsed = maxTrades > 0 ? (tradesToday / maxTrades) * 100 : 0;
  
  const hasAllowedAssets = rules.allowedAssets && rules.allowedAssets.length > 0;
  const hasBlacklistedAssets = rules.blacklistedAssets && rules.blacklistedAssets.length > 0;

  return (
    <Card className={`bg-gradient-to-r from-blue-950/40 to-slate-900/60 backdrop-blur-md border-slate-700/50 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden ${className || ''}`}>
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Left Section: Class Details & Status */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-extrabold uppercase tracking-widest">
            <Calendar className="h-3 w-3" /> Classroom Active Rules
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">{classNameInfo}</h2>
          <p className="text-xs text-slate-400">
            Your portfolio performance is governed by rules enforced by your teacher.
          </p>
        </div>

        {/* Center Section: Trade Counter */}
        {maxTrades > 0 ? (
          <div className="bg-[#0f111a]/40 p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
            <div className="relative flex items-center justify-center h-12 w-12 rounded-full border border-slate-800 bg-slate-900 shadow-inner">
              <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="2.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={`${remainingTrades === 0 ? 'text-rose-500' : 'text-teal-400'}`}
                  strokeWidth="2.5"
                  strokeDasharray={`${percentUsed}, 100`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="z-10 text-[11px] font-extrabold text-white">
                {remainingTrades}
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between text-[11px] font-bold text-slate-400">
                <span>Daily Day-Trading Limit</span>
                <span className="text-white">{tradesToday} / {maxTrades} Trades</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${remainingTrades === 0 ? 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)]'}`}
                  style={{ width: `${percentUsed}%` }}
                />
              </div>
              {remainingTrades === 0 && (
                <div className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3 animate-pulse" /> Limit reached! Sales & Buys are locked.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-[#0f111a]/40 p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
            <Coins className="h-10 w-10 text-teal-400 bg-teal-500/10 p-2 rounded-xl" />
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Trading Frequency</span>
              <span className="text-sm font-extrabold text-white block">Unlimited Trades Allowed</span>
            </div>
          </div>
        )}

        {/* Right Section: Approved Tickers or starting Capital */}
        <div className="space-y-3 bg-[#0f111a]/20 p-4 rounded-2xl border border-slate-800/40">
          {/* Starting Capital */}
          <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5 text-blue-500" /> Start Capital</span>
            <span className="text-white font-extrabold">${(rules.startingCash ?? 50000).toLocaleString()}</span>
          </div>

          {/* Approved Assets */}
          <div className="space-y-1.5">
            {hasAllowedAssets ? (
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-teal-400" /> Approved Whitelist</span>
                <div className="flex flex-wrap gap-1 max-h-[35px] overflow-y-auto">
                  {rules.allowedAssets?.map(symbol => (
                    <span key={symbol} className="text-[8px] font-extrabold bg-teal-500/15 text-teal-400 px-1.5 py-0.5 rounded-md border border-teal-500/10">
                      {symbol}
                    </span>
                  ))}
                </div>
              </div>
            ) : hasBlacklistedAssets ? (
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><ShieldAlert className="h-3 w-3 text-rose-500" /> Blacklisted Stocks</span>
                <div className="flex flex-wrap gap-1 max-h-[35px] overflow-y-auto">
                  {rules.blacklistedAssets?.map(symbol => (
                    <span key={symbol} className="text-[8px] font-extrabold bg-rose-500/15 text-rose-400 px-1.5 py-0.5 rounded-md border border-rose-500/10">
                      {symbol}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> All Market Assets Approved
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
