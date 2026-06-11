'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmail, signInWithGoogle } from '@/lib/auth';
import { Button, Input, TrilliumFlower } from '@/components/ui';
import Link from 'next/link';
import { X } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const router = useRouter();

  // Prefetch dashboard early to optimize post-login routing
  useEffect(() => {
    router.prefetch('/dashboard');
  }, [router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmail(email, password);
      // Route optimistically - AuthContext will handle cookie sync in the background
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Email login flow error:', err);
      setError(err.message || 'An error occurred during sign-in.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      // Isolate popup trigger: Must be absolute first async action of user click
      await signInWithGoogle();
      // Route optimistically
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Google login flow error:', err);
      // Explicitly reset loading immediately to unfreeze UI
      setLoading(false);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed before completion. Please try again.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup blocker blocked the sign-in window. Please enable popups.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('Popup request cancelled. Only one popup can be active at a time.');
      } else {
        setError(err.message || 'An error occurred during Google sign-in.');
      }
    }
  };


  return (
    <div className="relative flex min-h-screen flex-col lg:flex-row bg-slate-50 dark:bg-slate-950">
      {/* Return home Close Button (Top Left of the screen, overlaying the dark flower canvas) */}
      <Link
        href="/"
        className="absolute top-6 left-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/40 transition-all z-50"
        aria-label="Back to landing page"
      >
        <X className="h-6 w-6" />
      </Link>

      {/* Left Side: Interactive Trillium Flower (taking up 75% on desktop) */}
      <div className="hidden lg:flex lg:w-3/4 h-screen">
        <TrilliumFlower isClosed={isPasswordFocused} />
      </div>

      {/* Vertical divider line separating the 75% split (Left side) from 25% (Right side) */}
      <div className="hidden lg:block absolute left-3/4 top-[7.5vh] h-[85vh] w-[1px] bg-slate-200 dark:bg-slate-800 -translate-x-1/2 z-20 pointer-events-none" />

      {/* Right Side: Sign In Form (taking up 25% on desktop, full height) */}
      <div className="flex w-full flex-col justify-center p-8 pt-20 lg:p-12 lg:w-1/4 bg-white dark:bg-slate-900/60 z-10 min-h-screen">
        <div className="w-full">
          {/* Mobile-only compact flower visualization */}
          <div className="mb-6 block h-44 w-full overflow-hidden rounded-3xl lg:hidden shadow-lg border border-slate-200 dark:border-slate-800">
            <TrilliumFlower isClosed={isPasswordFocused} />
          </div>

          <h2 className="mb-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Sign In
          </h2>
          <p className="mb-8 text-sm text-slate-500 dark:text-slate-400">
            Enter your details to access your trillium dashboard.
          </p>

          {error && <p className="mb-4 text-sm text-red-600 text-center">{error}</p>}
          
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                block
                className="bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700/60"
              />
            </div>
            
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                block
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                className="bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700/60"
              />
            </div>

            <Button type="submit" loading={loading} block className="py-2.5 bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg">
              Sign In
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 dark:bg-slate-900">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            variant="secondary"
            onClick={handleGoogleLogin}
            loading={loading}
            block
            className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 dark:border-slate-700/60"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </Button>

          <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-bold text-blue-600 hover:underline dark:text-blue-400">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
