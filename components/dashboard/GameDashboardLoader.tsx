'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb } from 'lucide-react';

export interface WebsiteTip {
  id: number;
  text: string;
}

const WEBSITE_TIPS: WebsiteTip[] = [
  {
    id: 1,
    text: 'You can customize your dashboard layout by dragging widgets and resizing them with the S / M / L buttons.'
  },
  {
    id: 2,
    text: 'Check out the Market Explorer to research stock fundamentals, analyst price targets, and live charts.'
  },
  {
    id: 3,
    text: 'Maintain your daily check-in streak to earn bonus XP and climb the global leaderboards.'
  },
  {
    id: 4,
    text: 'Practice with $10,000 in virtual cash to test trading strategies with zero financial risk.'
  },
  {
    id: 5,
    text: 'Complete interactive financial literacy lessons to unlock achievements and level up your trader rank.'
  },
  {
    id: 6,
    text: 'Join your teacher’s class code in the Classroom tab to participate in student trading competitions.'
  },
  {
    id: 7,
    text: 'Use the AI Chat assistant to ask questions about market trends, options, and portfolio risk.'
  },
  {
    id: 8,
    text: 'Explore different color schemes and number fonts in Settings to personalize your workstation.'
  }
];

interface GameDashboardLoaderProps {
  onLoaded?: () => void;
  minDurationMs?: number;
}

export default function GameDashboardLoader({
  onLoaded,
  minDurationMs = 850
}: GameDashboardLoaderProps) {
  const [tipIndex, setTipIndex] = useState(() => Math.floor(Math.random() * WEBSITE_TIPS.length));

  // Cycle tips smoothly every 3s
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % WEBSITE_TIPS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fast completion timer
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onLoaded) onLoaded();
    }, minDurationMs);
    return () => clearTimeout(timer);
  }, [minDurationMs, onLoaded]);

  const currentTip = WEBSITE_TIPS[tipIndex];

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 text-white select-none px-6">
      <div className="relative z-10 flex flex-col items-center text-center max-w-xl space-y-7">
        
        {/* Unified Liquid Snake Loading Circle */}
        <div className="relative h-14 w-14 flex items-center justify-center">
          <svg className="w-full h-full animate-[spin_0.85s_linear_infinite]" viewBox="0 0 56 56">
            <defs>
              {/* Snake body gradient: Fades from 0% opacity tail -> neon emerald -> bright white head */}
              <linearGradient id="snake-fluid-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
                <stop offset="20%" stopColor="#10b981" stopOpacity="0.15" />
                <stop offset="50%" stopColor="#10b981" stopOpacity="0.5" />
                <stop offset="80%" stopColor="#34d399" stopOpacity="0.9" />
                <stop offset="95%" stopColor="#a7f3d0" stopOpacity="1" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
              </linearGradient>

              {/* Liquid Drag Halo Glow Filter */}
              <filter id="liquid-halo-glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur1" />
                <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur2" />
                  <feMergeNode in="blur1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Background Circular Track */}
            <circle
              cx="28"
              cy="28"
              r="22"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="2.5"
            />

            {/* Trailing Liquid Halo Drag (Blurred wake trailing behind the snake) */}
            <circle
              cx="28"
              cy="28"
              r="22"
              fill="none"
              stroke="url(#snake-fluid-grad)"
              strokeWidth="5"
              strokeDasharray="52 86"
              strokeDashoffset="0"
              strokeLinecap="round"
              filter="url(#liquid-halo-glow)"
              opacity="0.8"
            />

            {/* Core Tapering Snake Body with Sharpened Trailing Tail */}
            <circle
              cx="28"
              cy="28"
              r="22"
              fill="none"
              stroke="url(#snake-fluid-grad)"
              strokeWidth="3.2"
              strokeDasharray="50 88"
              strokeDashoffset="0"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Website Tips Container with Neon Halo situated directly UNDER (behind) the text */}
        <div className="relative min-h-[95px] flex flex-col items-center justify-center space-y-3 px-8 py-5 max-w-xl">
          {/* Vibrant Horizontal Neon Halo situated directly UNDER / BEHIND the text */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[480px] md:w-[560px] h-[75px] sm:h-[95px] rounded-[100%] bg-emerald-500/25 blur-[45px] sm:blur-[55px] pointer-events-none" />

          {/* Minimalist Tip Badge */}
          <div className="relative z-10 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold tracking-widest uppercase shadow-[0_0_12px_rgba(16,185,129,0.25)]">
            <Lightbulb className="h-3.5 w-3.5 text-emerald-400" />
            <span>PRO TIP</span>
          </div>

          {/* Clean Tip Text resting above the neon halo background */}
          <div className="relative z-10">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentTip.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="text-sm sm:text-base md:text-lg text-slate-100 font-semibold leading-relaxed tracking-normal max-w-lg drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]"
              >
                {currentTip.text}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}
