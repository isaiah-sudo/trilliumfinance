'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  ShieldCheck,
  Zap,
  Sparkles,
  BarChart3,
  Percent,
  CheckCircle2,
  Info
} from 'lucide-react';

const STRATEGIES = [
  { id: 'conservative', name: 'Conservative', rate: 0.052, risk: 'Low', drawdown: '-3.5%' },
  { id: 'balanced', name: 'Balanced Growth', rate: 0.088, risk: 'Moderate', drawdown: '-8.2%' },
  { id: 'aggressive', name: 'Aggressive Alpha', rate: 0.135, risk: 'High', drawdown: '-18.4%' }
];

export default function ScenarioSimulator() {
  const [initialCapital, setInitialCapital] = useState<number>(5000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(300);
  const [years, setYears] = useState<number>(10);
  const [strategyIndex, setStrategyIndex] = useState<number>(1); // Balanced Growth

  const currentStrategy = STRATEGIES[strategyIndex];

  // Mathematical Compounding Returns
  const calculationData = useMemo(() => {
    const r = currentStrategy.rate; // Annual interest rate
    const savingsRate = 0.015; // Standard bank rate
    const monthlyRate = r / 12;
    const monthlySavingsRate = savingsRate / 12;
    const totalMonths = years * 12;

    const yearlyPoints: Array<{
      year: number;
      invested: number;
      trilliumVal: number;
      savingsVal: number;
    }> = [];

    let currentTrillium = initialCapital;
    let currentSavings = initialCapital;
    let totalInvested = initialCapital;

    yearlyPoints.push({
      year: 0,
      invested: totalInvested,
      trilliumVal: currentTrillium,
      savingsVal: currentSavings
    });

    for (let m = 1; m <= totalMonths; m++) {
      currentTrillium = currentTrillium * (1 + monthlyRate) + monthlyContribution;
      currentSavings = currentSavings * (1 + monthlySavingsRate) + monthlyContribution;
      totalInvested += monthlyContribution;

      if (m % 12 === 0) {
        yearlyPoints.push({
          year: m / 12,
          invested: Math.round(totalInvested),
          trilliumVal: Math.round(currentTrillium),
          savingsVal: Math.round(currentSavings)
        });
      }
    }

    const finalValue = Math.round(currentTrillium);
    const finalSavings = Math.round(currentSavings);
    const finalInvested = Math.round(totalInvested);
    const interestEarned = finalValue - finalInvested;
    const outperformance = finalValue - finalSavings;

    return {
      yearlyPoints,
      finalValue,
      finalSavings,
      finalInvested,
      interestEarned,
      outperformance
    };
  }, [initialCapital, monthlyContribution, years, currentStrategy]);

  // Chart SVG Coordinates
  const chartWidth = 600;
  const chartHeight = 200;
  const maxVal = Math.max(...calculationData.yearlyPoints.map((p) => p.trilliumVal)) * 1.05;
  const minVal = 0;
  const range = maxVal - minVal || 1;

  const trilliumPts = calculationData.yearlyPoints
    .map((pt, idx) => {
      const x = (idx / (calculationData.yearlyPoints.length - 1)) * chartWidth;
      const y = chartHeight - ((pt.trilliumVal - minVal) / range) * (chartHeight - 30) - 15;
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const savingsPts = calculationData.yearlyPoints
    .map((pt, idx) => {
      const x = (idx / (calculationData.yearlyPoints.length - 1)) * chartWidth;
      const y = chartHeight - ((pt.savingsVal - minVal) / range) * (chartHeight - 30) - 15;
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const trilliumArea = `${trilliumPts} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

  return (
    <div className="w-full relative rounded-3xl p-5 sm:p-7 md:p-8 glass-card-premium border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.6)] overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-[100px] bg-emerald-500/15 pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            Financial Scenario Modeling
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Compounding Growth & Risk Simulator
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Test how regular contributions and portfolio asset strategies compound over your investment horizon.
          </p>
        </div>

        {/* Projected Value Highlight Box */}
        <div className="p-3 sm:px-4 sm:py-2.5 rounded-2xl bg-slate-950/70 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Projected Year {years} Value</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
            ${calculationData.finalValue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Two-Column Grid: Sliders on Left, Interactive Projections on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 relative z-10">
        {/* Left: Parameter Sliders (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-white/10 backdrop-blur-md space-y-4">
            <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-400" />
              Adjust Simulation Parameters
            </h4>

            {/* Slider 1: Initial Deposit */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-300">
                <span>Initial Virtual Deposit</span>
                <span className="text-emerald-400 font-mono font-black">${initialCapital.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="500"
                max="50000"
                step="500"
                value={initialCapital}
                onChange={(e) => setInitialCapital(parseInt(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-800 accent-emerald-400 focus:outline-none"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                <span>$500</span>
                <span>$25,000</span>
                <span>$50,000</span>
              </div>
            </div>

            {/* Slider 2: Monthly Contribution */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-300">
                <span>Monthly Recurring Contribution</span>
                <span className="text-emerald-400 font-mono font-black">${monthlyContribution}/mo</span>
              </div>
              <input
                type="range"
                min="0"
                max="2000"
                step="50"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(parseInt(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-800 accent-emerald-400 focus:outline-none"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                <span>$0</span>
                <span>$1,000</span>
                <span>$2,000</span>
              </div>
            </div>

            {/* Slider 3: Time Horizon */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-300">
                <span>Time Horizon</span>
                <span className="text-emerald-400 font-mono font-black">{years} Years</span>
              </div>
              <input
                type="range"
                min="3"
                max="30"
                step="1"
                value={years}
                onChange={(e) => setYears(parseInt(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-800 accent-emerald-400 focus:outline-none"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                <span>3 Yrs</span>
                <span>15 Yrs</span>
                <span>30 Yrs</span>
              </div>
            </div>

            {/* Strategy Select Buttons */}
            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-bold text-slate-300 block">Investment Strategy</span>
              <div className="grid grid-cols-3 gap-1.5">
                {STRATEGIES.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => setStrategyIndex(idx)}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      strategyIndex === idx
                        ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                        : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-[11px] font-black leading-tight">{s.name}</div>
                    <div className="text-[10px] text-emerald-400 font-mono mt-0.5">+{(s.rate * 100).toFixed(1)}%/yr</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Compounding Growth Visualizer (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-white/10 backdrop-blur-md space-y-4 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-black text-white uppercase tracking-wider">
                10-Year Growth Comparison Curve
              </span>
              <div className="flex items-center gap-3 text-[10px] font-bold">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" /> Trillium Strategy
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-slate-500" /> Standard Savings
                </div>
              </div>
            </div>

            {/* Smooth SVG Chart Graphic */}
            <div className="relative w-full h-48 my-1 flex items-center justify-center">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="scenario-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="0" y1="50" x2={chartWidth} y2="50" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                <line x1="0" y1="100" x2={chartWidth} y2="100" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                <line x1="0" y1="150" x2={chartWidth} y2="150" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />

                {/* Trillium Area & Path */}
                <path d={trilliumArea} fill="url(#scenario-grad)" />
                <path d={savingsPts} fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="4 4" />
                <path d={trilliumPts} fill="none" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" />
              </svg>
            </div>

            {/* Breakdown Stats Cards */}
            <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-white/10 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5">
                <span className="text-[10px] text-slate-400 font-bold block">TOTAL PRINCIPAL</span>
                <span className="text-white font-mono font-black">${calculationData.finalInvested.toLocaleString()}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5">
                <span className="text-[10px] text-slate-400 font-bold block">COMPOUND GAINS</span>
                <span className="text-emerald-400 font-mono font-black">+${calculationData.interestEarned.toLocaleString()}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5">
                <span className="text-[10px] text-slate-400 font-bold block">SAVINGS ADVANTAGE</span>
                <span className="text-teal-300 font-mono font-black">+${calculationData.outperformance.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
