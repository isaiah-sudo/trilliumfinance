import React, { InputHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  /**
   * When true, the input will stretch to full width on small screens.
   */
  block?: boolean;
};

/**
 * Reusable input component reflecting the legacy Trillium style.
 * Supports dark mode and focus ring animations.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, block = false, ...props }, ref) => {
    const baseClasses =
      'rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-all duration-250 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 dark:border-slate-700/60 dark:bg-slate-800/40 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20 shadow-sm';
    const widthClass = block ? 'w-full' : '';
    return (
      <input
        ref={ref}
        className={clsx(baseClasses, widthClass, className)}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';
