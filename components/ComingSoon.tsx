'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface ComingSoonProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function ComingSoon({ title, description, icon }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center max-w-lg p-10 rounded-[2rem] bg-slate-800/30 border border-slate-700/50 backdrop-blur-xl shadow-2xl"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-400 mb-6 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
          {icon || <Sparkles className="h-10 w-10" />}
        </div>
        
        <h1 className="text-3xl font-extrabold text-white mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          {title}
        </h1>
        
        <p className="text-slate-400 leading-relaxed mb-8 text-sm md:text-base">
          {description}
        </p>
        
        <div className="inline-flex items-center gap-2.5 rounded-full bg-slate-800/80 px-4 py-2 border border-slate-700/50 text-sm font-semibold text-slate-300 shadow-inner">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
          </span>
          In Active Development
        </div>
      </motion.div>
    </div>
  );
}
