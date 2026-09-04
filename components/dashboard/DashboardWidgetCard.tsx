'use client';

import React from 'react';
import { GripVertical, X, Maximize2, Minimize2, LayoutGrid } from 'lucide-react';

export type WidgetPresetSize = 'small' | 'medium' | 'large';

interface DashboardWidgetCardProps {
  id: string;
  title: string;
  isEditing?: boolean;
  onRemove?: (id: string) => void;
  onResizePreset?: (id: string, size: WidgetPresetSize) => void;
  currentWidth?: number;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  isMergedRow?: boolean;
  isMergedCol?: boolean;
  isLeftItem?: boolean;
  isRightItem?: boolean;
  isTopItem?: boolean;
  isBottomItem?: boolean;
  showRightSeparator?: boolean;
  showBottomSeparator?: boolean;
  isMergingAnimation?: boolean;
}

export default function DashboardWidgetCard({
  id,
  title,
  isEditing = false,
  onRemove,
  onResizePreset,
  currentWidth,
  children,
  headerAction,
  isMergedRow = false,
  isMergedCol = false,
  isLeftItem = false,
  isRightItem = false,
  isTopItem = false,
  isBottomItem = false,
  showRightSeparator = false,
  showBottomSeparator = false,
  isMergingAnimation = false,
}: DashboardWidgetCardProps) {
  // Corner classes based on neighbor positioning to form a unified container grid
  const roundedClasses = `${isTopItem && isLeftItem ? 'rounded-tl-2xl' : 'rounded-tl-none'} ${
    isTopItem && isRightItem ? 'rounded-tr-2xl' : 'rounded-tr-none'
  } ${isBottomItem && isLeftItem ? 'rounded-bl-2xl' : 'rounded-bl-none'} ${
    isBottomItem && isRightItem ? 'rounded-br-2xl' : 'rounded-br-none'
  }`;

  return (
    <div className={`h-full w-full relative ${roundedClasses} overflow-visible group/card`}>
      {/* Sleek vertical (right) divider line matching container border opacity, centered on border */}
      {showRightSeparator && (
        <div className="absolute right-[-0.5px] top-0 bottom-0 w-[1px] bg-slate-300/40 dark:bg-slate-700/50 z-20 pointer-events-none" />
      )}

      {/* Sleek horizontal (bottom) divider line matching container border opacity, centered on border */}
      {showBottomSeparator && (
        <div className="absolute bottom-[-0.5px] left-0 right-0 h-[1px] bg-slate-300/40 dark:bg-slate-700/50 z-20 pointer-events-none" />
      )}

      {/* Inner Card Container with background, border, and overflow-hidden for card content */}
      <div
        className={`h-full w-full flex flex-col ${roundedClasses} bg-white/95 dark:bg-[#121622]/90 backdrop-blur-md border border-slate-200 dark:border-slate-800/60 shadow-xl container-3d-bevel ${
          isMergingAnimation ? 'liquid-pool-merge green-wave-finish' : ''
        } transition-all duration-300 overflow-hidden relative`}
      >
      {/* Widget Header */}
      <div
        className="px-4 md:px-6 py-3.5 flex items-center justify-between border-b select-none shrink-0 bg-transparent border-slate-200/60 dark:border-slate-800/50"
      >
          <div className="flex items-center gap-2 min-w-0">
            {isEditing && (
              <div
                className="widget-drag-handle cursor-grab active:cursor-grabbing p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700/60 text-slate-400 hover:text-slate-200 transition-colors shrink-0 opacity-80 sm:opacity-0 group-hover/card:opacity-100 transition-opacity duration-200"
                title="Drag to reposition widget"
              >
                <GripVertical className="h-4 w-4" />
              </div>
            )}
            <h3 className="text-slate-900 dark:text-white font-extrabold text-sm md:text-base tracking-tight truncate">
              {title}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {headerAction}

            {/* Quick Preset Size Controls: Elegant on-hover transition so small widths don't crowd the title */}
            {onResizePreset && (
              <div className="flex items-center bg-slate-200/90 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-300 dark:border-slate-700 shadow-sm mr-1.5 opacity-90 sm:opacity-0 group-hover/card:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onResizePreset(id, 'small');
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-black transition-all cursor-pointer ${
                    currentWidth && currentWidth <= 4
                      ? 'bg-blue-600 text-white shadow-md ring-1 ring-blue-400 scale-105'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-slate-700/50'
                  }`}
                  title="Small Size (1/3 Width)"
                >
                  S
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onResizePreset(id, 'medium');
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-black transition-all cursor-pointer ${
                    currentWidth && currentWidth > 4 && currentWidth <= 8
                      ? 'bg-blue-600 text-white shadow-md ring-1 ring-blue-400 scale-105'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-slate-700/50'
                  }`}
                  title="Medium Size (2/3 Width)"
                >
                  M
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onResizePreset(id, 'large');
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-black transition-all cursor-pointer ${
                    currentWidth && currentWidth > 8
                      ? 'bg-blue-600 text-white shadow-md ring-1 ring-blue-400 scale-105'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-slate-700/50'
                  }`}
                  title="Large Size (Full Width)"
                >
                  L
                </button>
              </div>
            )}

            {onRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(id);
                }}
                className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 hover:text-rose-400 border border-rose-500/30 transition-all cursor-pointer ml-0.5"
                title="Hide Widget"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

      {/* Widget Body */}
      <div className="flex-1 min-h-0 p-4 md:p-6 lg:p-8 overflow-auto">
        {children}
      </div>
      </div>
    </div>
  );
}
