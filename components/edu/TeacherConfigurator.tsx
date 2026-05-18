'use client';

import React, { useState } from 'react';
import { Button, Card, Input, Spinner } from '@/components/ui';
import { ToggleLeft, ToggleRight, DollarSign, ListPlus, ShieldCheck, ShieldAlert, Trash2 } from 'lucide-react';
import { updateClassroomRules } from '@/app/actions/edu';

interface TeacherConfiguratorProps {
  initialRules: {
    maxDailyTrades: number;
    startingCash: number;
    allowedAssets: string[];
    blacklistedAssets: string[];
  };
  onSaveSuccess?: () => void;
}

export default function TeacherConfigurator({ initialRules, onSaveSuccess }: TeacherConfiguratorProps) {
  const [maxDailyTrades, setMaxDailyTrades] = useState(initialRules.maxDailyTrades);
  const [startingCash, setStartingCash] = useState(initialRules.startingCash);
  const [allowedAssets, setAllowedAssets] = useState<string[]>(initialRules.allowedAssets || []);
  const [blacklistedAssets, setBlacklistedAssets] = useState<string[]>(initialRules.blacklistedAssets || []);

  const [tradeLimitEnabled, setTradeLimitEnabled] = useState(initialRules.maxDailyTrades > 0);

  // Symbol whitelisting input
  const [allowedInput, setAllowedInput] = useState('');
  // Symbol blacklisting input
  const [blacklistedInput, setBlacklistedInput] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAddAllowed = () => {
    const symbol = allowedInput.toUpperCase().trim();
    if (symbol && !allowedAssets.includes(symbol)) {
      setAllowedAssets([...allowedAssets, symbol]);
      // Remove from blacklist if present to avoid logic conflict
      setBlacklistedAssets(blacklistedAssets.filter(item => item !== symbol));
    }
    setAllowedInput('');
  };

  const handleAddBlacklisted = () => {
    const symbol = blacklistedInput.toUpperCase().trim();
    if (symbol && !blacklistedAssets.includes(symbol)) {
      setBlacklistedAssets([...blacklistedAssets, symbol]);
      // Remove from whitelist if present to avoid logic conflict
      setAllowedAssets(allowedAssets.filter(item => item !== symbol));
    }
    setBlacklistedInput('');
  };

  const handleRemoveAllowed = (symbol: string) => {
    setAllowedAssets(allowedAssets.filter(item => item !== symbol));
  };

  const handleRemoveBlacklisted = (symbol: string) => {
    setBlacklistedAssets(blacklistedAssets.filter(item => item !== symbol));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccessMsg('');
    try {
      await updateClassroomRules({
        maxDailyTrades: tradeLimitEnabled ? maxDailyTrades : 0,
        startingCash: Number(startingCash),
        allowedAssets,
        blacklistedAssets
      });
      setSuccessMsg('Classroom trading constraints updated successfully!');
      if (onSaveSuccess) onSaveSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save classroom constraints.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a2133]/90 border-slate-700/50 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl" />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-700/30 pb-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Trading Rules & Constraints Configurator
            </h3>
            <p className="text-slate-400 text-xs mt-1">Configure trading limits, asset whitelists, and starting balances.</p>
          </div>
          {successMsg && <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">{successMsg}</span>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Numeric limits */}
          <div className="space-y-6">
            {/* Limit Day Trading */}
            <div className="bg-[#0f111a]/40 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm font-bold text-white block">Day-Trading Limit</span>
                  <span className="text-slate-400 text-[11px] block mt-0.5">Restrict transactions per student per day.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setTradeLimitEnabled(!tradeLimitEnabled)}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  {tradeLimitEnabled ? (
                    <ToggleRight className="h-9 w-9 text-teal-400" />
                  ) : (
                    <ToggleLeft className="h-9 w-9 text-slate-500" />
                  )}
                </button>
              </div>

              {tradeLimitEnabled && (
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Max Daily Trades</label>
                    <Input
                      type="number"
                      min="1"
                      value={maxDailyTrades}
                      onChange={(e) => setMaxDailyTrades(Number(e.target.value))}
                      className="bg-[#0f111a] border-slate-700/50 w-full text-white font-bold"
                    />
                  </div>
                  <div className="pt-6 text-xs text-slate-400 font-semibold">
                    trades per student
                  </div>
                </div>
              )}
            </div>

            {/* Starting Balance */}
            <div className="bg-[#0f111a]/40 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div>
                <span className="text-sm font-bold text-white block">Simulated Cash Balance</span>
                <span className="text-slate-400 text-[11px] block mt-0.5">Define starting capital assigned upon registration.</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-slate-500 font-bold text-sm">$</span>
                <Input
                  type="number"
                  min="1000"
                  step="5000"
                  value={startingCash}
                  onChange={(e) => setStartingCash(Number(e.target.value))}
                  className="bg-[#0f111a] border-slate-700/50 pl-7 py-3 w-full text-white font-extrabold"
                  block
                />
              </div>
            </div>
          </div>

          {/* Right Column: Whitelist / Blacklist Asset Tickers */}
          <div className="space-y-6">
            {/* Whitelist (Allowed Assets) */}
            <div className="bg-[#0f111a]/40 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-white flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-teal-400" /> Approved Assets (Whitelist)</span>
                  <span className="text-slate-400 text-[11px] block mt-0.5">Students can ONLY buy these. (Empty = allow all)</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="e.g. AAPL, SPY"
                  value={allowedInput}
                  onChange={(e) => setAllowedInput(e.target.value)}
                  className="bg-[#0f111a] border-slate-700/50 flex-1 uppercase font-bold"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddAllowed()}
                />
                <Button size="sm" onClick={handleAddAllowed} className="bg-teal-500 hover:bg-teal-600 font-bold px-4">
                  Add
                </Button>
              </div>

              {allowedAssets.length > 0 && (
                <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto pt-2 border-t border-slate-800">
                  {allowedAssets.map(symbol => (
                    <span key={symbol} className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-teal-500/10 border border-teal-500/30 text-teal-400 px-2 py-1 rounded-lg">
                      {symbol}
                      <button type="button" onClick={() => handleRemoveAllowed(symbol)} className="hover:text-red-400 ml-1">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Blacklist (Banned Assets) */}
            <div className="bg-[#0f111a]/40 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-white flex items-center gap-1.5"><ShieldAlert className="h-4 w-4 text-rose-500" /> Blocked Assets (Blacklist)</span>
                  <span className="text-slate-400 text-[11px] block mt-0.5">Students are completely banned from trading these.</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="e.g. GME, AMC"
                  value={blacklistedInput}
                  onChange={(e) => setBlacklistedInput(e.target.value)}
                  className="bg-[#0f111a] border-slate-700/50 flex-1 uppercase font-bold"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddBlacklisted()}
                />
                <Button size="sm" onClick={handleAddBlacklisted} className="bg-rose-500 hover:bg-rose-600 font-bold px-4">
                  Add
                </Button>
              </div>

              {blacklistedAssets.length > 0 && (
                <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto pt-2 border-t border-slate-800">
                  {blacklistedAssets.map(symbol => (
                    <span key={symbol} className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-rose-500/10 border border-rose-500/30 text-rose-400 px-2 py-1 rounded-lg">
                      {symbol}
                      <button type="button" onClick={() => handleRemoveBlacklisted(symbol)} className="hover:text-red-400 ml-1">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {error && <div className="text-rose-500 text-xs font-bold mt-4">{error}</div>}

        <div className="mt-8 pt-6 border-t border-slate-700/30 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 font-bold text-white px-8 py-3 rounded-xl shadow-lg shadow-teal-500/10"
          >
            {saving ? 'Saving...' : 'Save Constraints & Push to Class'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
