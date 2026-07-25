'use client';

import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';
import { Spinner } from './Spinner';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Visual variant of the button */
  variant?: 'primary' | 'secondary' | 'danger';
  /** When true, renders a full‑width button */
  block?: boolean;
  /** Size of the button */
  size?: 'sm' | 'md' | 'lg';
  /** Shows a loading spinner and disables the button */
  loading?: boolean;
};

/**
 * Reusable button component that mirrors the legacy Trillium UI styles.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', block = false, size = 'md', loading = false, disabled, children, onMouseDown, ...props }, ref) => {
    const [isPulsing, setIsPulsing] = React.useState(false);

    const baseClasses =
      'inline-flex items-center justify-center rounded-xl font-bold transition-all duration-200 hover:-translate-y-[0.5px] hover:scale-[1.01] hover:brightness-105 active:scale-[0.99] active:translate-y-[0.5px] focus:outline-none disabled:opacity-50 disabled:pointer-events-none disabled:transform-none';

    const variantClasses = {
      primary: 'bg-emerald-500 text-slate-950 font-black hover:bg-emerald-400 dark:bg-emerald-500 dark:hover:bg-emerald-400 shadow-md shadow-emerald-500/20',
      secondary: 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700/80 dark:hover:bg-slate-700/60',
      danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-500/20',
    }[variant];

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    }[size];

    const widthClass = block ? 'w-full' : '';

    const pulseColor = variant === 'primary' 
      ? 'rgba(16, 185, 129, 0.6)' 
      : variant === 'danger' 
      ? 'rgba(239, 68, 68, 0.6)' 
      : 'rgba(148, 163, 184, 0.6)';

    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
      setIsPulsing(false);
      // Wait for React to render and trigger pulse
      requestAnimationFrame(() => {
        setIsPulsing(true);
      });
      if (onMouseDown) onMouseDown(e);
    };

    return (
      <button
        ref={ref}
        className={clsx(baseClasses, variantClasses, sizeClasses, widthClass, isPulsing && 'ring-pulse-active', className)}
        disabled={disabled || loading}
        onMouseDown={handleMouseDown}
        onAnimationEnd={() => setIsPulsing(false)}
        style={{ '--pulse-ring-color': pulseColor } as React.CSSProperties}
        {...props}
      >
        {loading ? (
          <>
            <Spinner className="mr-2 h-4 w-4" />
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
