'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PropsWithChildren } from 'react';
import { DashboardSettingsProvider } from '@/context/DashboardSettingsContext';

export default function StandaloneTeacherLayout({ children }: PropsWithChildren) {
  return (
    <ProtectedRoute>
      <DashboardSettingsProvider>
        <div className="min-h-screen bg-[#0b0d14] text-slate-200">
          {children}
        </div>
      </DashboardSettingsProvider>
    </ProtectedRoute>
  );
}
