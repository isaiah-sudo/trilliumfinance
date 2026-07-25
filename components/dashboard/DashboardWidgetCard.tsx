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
}: DashboardWidgetCardProps) {
  return (
    <div
      className={`h-full w-full flex flex-col rounded-2xl bg-white/95 dark:bg-[#121622]/90 backdrop-blur-md border transition-all duration-200 overflow-hidden shadow-xl ${
        isEditing
          ? 'border-emerald-500/50 dark:border-emerald-500/40 ring-1 ring-emerald-500/20'
          : 'border-slate-200 dark:border-slate-800/60'
      }`}
    >
      {/* Widget Header */}
      <div
        className={`px-4 md:px-6 py-3.5 flex items-center justify-between border-b select-none shrink-0 ${
          isEditing
            ? 'bg-slate-100/90 dark:bg-[#181f30] border-slate-200 dark:border-slate-700/60'
            : 'bg-transparent border-slate-200/60 dark:border-slate-800/50'
        }`}
      >

        <div className="flex items-center gap-2 min-w-0">
          {isEditing && (
            <div
              className="widget-drag-handle cursor-grab active:cursor-grabbing p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700/60 text-slate-400 hover:text-slate-200 transition-colors shrink-0"
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

          {/* Quick Preset Size Controls */}
          {isEditing && onResizePreset && (
            <div className="flex items-center bg-slate-200/60 dark:bg-slate-800/80 rounded-lg p-0.5 border border-slate-300 dark:border-slate-700/60 mr-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onResizePreset(id, 'small');
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  currentWidth && currentWidth <= 4
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
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
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  currentWidth && currentWidth > 4 && currentWidth <= 8
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
                title="Medium Size (1/2 Width)"
              >
                M
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onResizePreset(id, 'large');
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  currentWidth && currentWidth > 8
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
                title="Large Size (Full Width)"
              >
                L
              </button>
            </div>
          )}

          {isEditing && onRemove && (
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
  );
}
