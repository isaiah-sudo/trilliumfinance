'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, PropsWithChildren } from 'react';
import { Spinner } from '@/components/ui/Spinner';

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
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return null; // router.push handles redirection
  }

  return <>{children}</>;
};
