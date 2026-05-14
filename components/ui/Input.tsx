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
      'rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-500';
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
