'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  LayoutDashboard,
  BarChart3,
  Sparkles,
  Zap,
  Sliders,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import LiveTradingSimulator from './LiveTradingSimulator';
import CustomizableDashboardSimulator from './CustomizableDashboardSimulator';
import ScenarioSimulator from './ScenarioSimulator';

export type SimulatorTab = 'terminal' | 'dashboard' | 'scenario';

export default function LandingSimulatorSuite() {
  const [activeTab, setActiveTab] = useState<SimulatorTab>('terminal');

  const TABS: Array<{
    id: SimulatorTab;
    label: string;
    badge: string;
    icon: any;
    desc: string;
  }> = [
    {
      id: 'terminal',
      label: 'Live Paper Trading Terminal',
      badge: 'Real-Time Sandbox',
      icon: TrendingUp,
      desc: 'Simulate buy & sell stock orders with live ticks and portfolio tracking.'
    },
    {
      id: 'dashboard',
      label: 'Customizable Dashboard Studio',
      badge: 'Interactive Canvas',
      icon: LayoutDashboard,
      desc: 'Drag, reorder, resize, and theme your custom modular finance workspace.'
    },
    {
      id: 'scenario',
      label: 'Wealth & Risk Scenario Simulator',
      badge: 'Growth Engine',
      icon: BarChart3,
      desc: 'Model compounding interest, portfolio risk, and long-term asset trajectories.'
    }
  ];

  return (
    <div className="w-full max-w-[2200px] mx-auto space-y-8 relative">
      {/* Top Section Header & Glass Navigation Tabs */}
      <div className="flex flex-col items-center text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black tracking-wide uppercase shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
          Interactive Platform Simulator Suite
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
          Test-Drive the Entire Trillium Ecosystem
        </h2>

        <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
          Experience authentic real-time market execution, customize your ideal modular dashboard layout, and model your financial wealth trajectory—100% risk-free.
        </p>

        {/* Master Glass Mode Switcher Tabs */}
        <div className="pt-2 w-full flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-3 p-1.5 rounded-2xl bg-slate-900/80 border border-white/15 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] gap-1.5 w-full max-w-3xl">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-3 rounded-xl text-xs font-black transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                    isActive
                      ? 'text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-simulator-tab"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 z-0 shadow-md"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <Icon className={`h-4 w-4 relative z-10 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span className="relative z-10 whitespace-nowrap">{tab.label.split(' ')[0]} {tab.label.split(' ')[1]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Simulator Deck Container */}
      <div className="relative w-full">
        <AnimatePresence mode="wait">
          {activeTab === 'terminal' && (
            <motion.div
              key="terminal"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <LiveTradingSimulator />
            </motion.div>
          )}

          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <CustomizableDashboardSimulator />
            </motion.div>
          )}

          {activeTab === 'scenario' && (
            <motion.div
              key="scenario"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <ScenarioSimulator />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
