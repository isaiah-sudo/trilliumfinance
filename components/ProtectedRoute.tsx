'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, PropsWithChildren } from 'react';
import GameDashboardLoader from '@/components/dashboard/GameDashboardLoader';

/**
 * A component to wrap protected routes.
 * It redirects to /login if the user is not authenticated.
 */
export const ProtectedRoute = ({ children }: PropsWithChildren) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    if (typeof window !== 'undefined' && sessionStorage.getItem('trillium_show_loader') === 'true') {
      return <GameDashboardLoader minDurationMs={850} />;
    }
    return null;
  }

  if (!user) {
    return null; // router.push handles redirection
  }

  return <>{children}</>;
};
