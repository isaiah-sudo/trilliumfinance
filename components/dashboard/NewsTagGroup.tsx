'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

interface TagDefinition {
  title: string;
  summary: string;
  prompt: string;
}

const TAG_DEFINITIONS: Record<string, TagDefinition> = {
  federalreserve: {
    title: 'Federal Reserve',
    summary: 'The U.S. central bank that sets interest rates and monetary policy.',
    prompt: 'How do Federal Reserve interest rate decisions affect stock valuations and bond yields?',
  },
  inflation: {
    title: 'Inflation',
    summary: 'Rising prices across the economy that affect corporate margins and purchasing power.',
    prompt: 'How does inflation affect corporate profit margins, consumer spending, and stock market returns?',
  },
  markettrends: {
    title: 'Market Trends',
    summary: 'Directional momentum and price behavior across major stock sectors.',
    prompt: 'What key technical and macroeconomic indicators do traders use to identify sustainable stock market trends?',
  },
  macroeconomy: {
    title: 'Macroeconomy',
    summary: 'Broad economic indicators like GDP growth, jobs reports, and retail spending.',
    prompt: 'Which macroeconomic reports have the highest impact on stock market volatility and trading sentiment?',
  },
  markets: {
    title: 'Financial Markets',
    summary: 'Open exchanges where stocks, bonds, currencies, and commodities are traded.',
    prompt: 'How does institutional capital flow and liquidity influence everyday stock market movements?',
  },
  treasuryyields: {
    title: 'Treasury Yields',
    summary: 'Interest rates on U.S. government debt, guiding equity valuation and borrowing costs.',
    prompt: 'Why do rising Treasury yields often cause technology and growth stocks to sell off?',
  },
};

function getTagData(rawTag: string): TagDefinition {
  const clean = rawTag.replace('#', '').trim();
  const key = clean.toLowerCase();

  if (TAG_DEFINITIONS[key]) {
    return TAG_DEFINITIONS[key];
  }

  return {
    title: clean,
    summary: `Key market concept influencing asset pricing and trading sentiment.`,
    prompt: `Can you explain what ${clean} means in finance and how it affects stock investments?`,
  };
}

interface NewsTagGroupProps {
  tags?: string[];
}

export default function NewsTagGroup({ tags = [] }: NewsTagGroupProps) {
  const router = useRouter();
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnterTag = (tag: string) => {
    // Clear close timer immediately
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    // Instant switch to new tag: previous tag closes immediately with zero overlap
    setActiveTag(tag);
  };

  const handleMouseLeaveTag = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = setTimeout(() => {
      setActiveTag(null);
    }, 150);
  };

  const handlePopoverMouseEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handlePopoverMouseLeave = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = setTimeout(() => {
      setActiveTag(null);
    }, 150);
  };

  const handleAskAI = (prompt: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    router.push(`/dashboard/chat?prompt=${encodeURIComponent(prompt)}&t=${Date.now()}`);
  };

  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 items-center relative z-20">
      {tags.map((tag) => {
        const isCurrentActive = activeTag === tag;
        const data = getTagData(tag);

        return (
          <div
            key={tag}
            className="relative inline-flex items-center justify-center"
            onMouseEnter={() => handleMouseEnterTag(tag)}
            onMouseLeave={handleMouseLeaveTag}
          >
            {/* Tag Button */}
            <button
              type="button"
              onClick={() => setActiveTag((prev) => (prev === tag ? null : tag))}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-black tracking-wide border transition-all cursor-pointer flex items-center gap-1 active:scale-95 ${
                isCurrentActive
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/25 hover:border-blue-500/40'
              }`}
            >
              <span>{tag}</span>
            </button>

            {/* Exactly Centered Smooth Popover (Using Framer Motion x: '-50%' so transform is never overridden) */}
            <AnimatePresence>
              {isCurrentActive && (
                <motion.div
                  key={`popover-${tag}`}
                  initial={{ opacity: 0, y: 6, x: '-50%', scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
                  exit={{ opacity: 0, y: 4, x: '-50%', scale: 0.95 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  style={{ left: '50%' }}
                  onMouseEnter={handlePopoverMouseEnter}
                  onMouseLeave={handlePopoverMouseLeave}
                  className="absolute bottom-full mb-2.5 z-[100] w-64 rounded-2xl bg-slate-950/95 dark:bg-[#0c0f18]/95 backdrop-blur-xl border border-slate-700/80 shadow-[0_12px_36px_rgba(0,0,0,0.7)] p-3.5 text-left pointer-events-auto select-none"
                >
                  {/* Perfectly Centered Downward Arrow Indicator */}
                  <div 
                    className="absolute -bottom-1.5 w-3 h-3 rotate-45 bg-slate-950 dark:bg-[#0c0f18] border-r border-b border-slate-700/80 pointer-events-none"
                    style={{ left: '50%', marginLeft: '-6px' }}
                  />

                  {/* Header */}
                  <div className="flex items-center justify-between gap-2 mb-1.5 pb-1.5 border-b border-slate-800">
                    <span className="text-xs font-black text-white tracking-tight">{data.title}</span>
                    <span className="text-[9px] font-extrabold text-blue-400 uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                      Topic
                    </span>
                  </div>

                  {/* One Simple Sentence */}
                  <p className="text-[11px] leading-snug text-slate-300 font-medium mb-3">
                    {data.summary}
                  </p>

                  {/* Clean Ask AI Action */}
                  <button
                    type="button"
                    onClick={(e) => handleAskAI(data.prompt, e)}
                    className="w-full py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[10px] transition-all flex items-center justify-between shadow-sm active:scale-95 cursor-pointer relative z-10"
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-amber-300" />
                      Ask AI
                    </span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
