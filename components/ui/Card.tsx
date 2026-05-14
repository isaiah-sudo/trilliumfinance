import React, { ReactNode, forwardRef } from "react";
import clsx from "clsx";

export type CardProps = {
  /** Content of the card */
  children: ReactNode;
  /** Optional extra Tailwind classes */
  className?: string;
};

/**
 * Core Card component – matches the legacy “panel” style:
 * - Rounded corners: 2 rem (`rounded-[2rem]`)
 * - Border & background: light (`bg-white border-slate-200`) /
 *   dark (`dark:bg-slate-800 dark:border-slate-700`)
 * - Padding: `p-3` (mobile) → `sm:p-6` (tablet+)
 * - Subtle shadow: `shadow-sm`
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className }, ref) => (
    <div
      ref={ref}
      className={clsx(
        "rounded-[2rem] border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-3 sm:p-6 shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  ),
);

Card.displayName = "Card";
