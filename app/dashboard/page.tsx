'use client';

import dynamic from 'next/dynamic';
import GameDashboardLoader from '@/components/dashboard/GameDashboardLoader';

const DashboardClient = dynamic(() => import('./DashboardClient'), {
  ssr: false,
  loading: () => null,
});

export const fetchCache = 'force-no-store';

export default function Page() {
  return <DashboardClient />;
}
