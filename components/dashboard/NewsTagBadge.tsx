'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
    prompt: 'How do Federal Reserve interest rate hikes and cuts affect the stock market and corporate valuations?',
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

interface NewsTagBadgeProps {
  tag: string;
}

export default function NewsTagBadge({ tag }: NewsTagBadgeProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const data = getTagData(tag);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 180);
  };

  const handleAskAI = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    router.push(`/dashboard/chat?prompt=${encodeURIComponent(data.prompt)}`);
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Badge Tag Pill */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="px-2 py-0.5 rounded-lg text-[10px] font-black tracking-wide bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/25 hover:border-blue-500/40 transition-all cursor-pointer flex items-center gap-1 active:scale-95"
      >
        <span>{tag}</span>
      </button>

      {/* Clean & Simple Popover (No long paragraphs) */}
      {isOpen && (
        <div
          className="absolute left-0 bottom-full mb-2 z-50 w-64 rounded-2xl bg-slate-950/95 dark:bg-[#10141f]/95 backdrop-blur-xl border border-slate-700/80 shadow-[0_12px_32px_rgba(0,0,0,0.6)] p-3.5 text-left transition-all duration-150 animate-in fade-in zoom-in-95 pointer-events-auto"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex items-center justify-between gap-2 mb-1.5 pb-1.5 border-b border-slate-800">
            <span className="text-xs font-black text-white tracking-tight">{data.title}</span>
            <span className="text-[9px] font-extrabold text-blue-400 uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
              Topic
            </span>
          </div>

          <p className="text-[11px] leading-snug text-slate-300 font-medium mb-3">
            {data.summary}
          </p>

          <button
            type="button"
            onClick={handleAskAI}
            className="w-full py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[10px] transition-all flex items-center justify-between shadow-sm active:scale-95 cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-amber-300" />
              Ask AI
            </span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
