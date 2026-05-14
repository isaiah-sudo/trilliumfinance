'use client';

import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export type SpinnerProps = {
  className?: string;
};

/**
 * Simple loading spinner using Framer Motion.
 */
export const Spinner = ({ className }: SpinnerProps) => (
  <motion.div
    className={clsx("flex items-center justify-center", className)}
    animate={{ rotate: 360 }}
    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
  >
    <svg
      className="h-full w-full text-current"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
      <path d="M12 2 a10 10 0 0 1 0 20" strokeLinecap="round" />
    </svg>
  </motion.div>
);
