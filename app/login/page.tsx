'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmail, signInWithGoogle, resetPassword, syncAuthCookie } from '@/lib/auth';
import { Button, Input, TrilliumFlower } from '@/components/ui';
import Link from 'next/link';
import { X, ShieldCheck, Sparkles, Activity, GraduationCap } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('signup') === 'success') {
        setSuccess('Account created successfully! Please sign in.');
      }
    }
  }, []);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userCredential = await signInWithEmail(email, password);
      const idToken = await userCredential.user.getIdToken();
      
      // Sync cookie with retries & rate-limit resilience
      const syncSuccess = await syncAuthCookie(idToken);
      if (!syncSuccess) {
        console.warn('Auth cookie sync delayed by rate limits, proceeding with client navigation.');
      }

      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get('redirect') || '/dashboard';
      window.location.href = redirectUrl;
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
      const userCredential = await signInWithGoogle();
      const idToken = await userCredential.user.getIdToken();

      // Sync cookie with retries & rate-limit resilience
      const syncSuccess = await syncAuthCookie(idToken);
      if (!syncSuccess) {
        console.warn('Auth cookie sync delayed by rate limits, proceeding with client navigation.');
      }

      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get('redirect') || '/dashboard';
      window.location.href = redirectUrl;
    } catch (err: any) {
      console.error('Google login flow error:', err);
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

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address above to request a password reset.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess('Password reset link sent! Check your email inbox.');
    } catch (err: any) {
      console.error('Forgot password error:', err);
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col lg:flex-row bg-slate-950 overflow-hidden font-sans">
      {/* Return home Close Button */}
      <Link
        href="/"
        className="absolute top-6 left-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/40 transition-all z-50 border border-white/5 bg-slate-900/60 backdrop-blur-md"
        aria-label="Back to landing page"
      >
        <X className="h-6 w-6" />
      </Link>

      {/* Left Side: Interactive Canvas */}
      <div className="hidden lg:flex lg:w-7/12 relative flex-col justify-between p-12 lg:p-16 bg-slate-950 overflow-hidden border-r border-white/10">
        {/* Interactive Trillium Flower Container (Center stage) */}
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          <TrilliumFlower isClosed={isPasswordFocused} />
        </div>

        {/* Spacer to keep bottom features aligned */}
        <div className="relative z-20" />

        {/* Footer Guarantee Highlights */}
        <div className="relative z-20 flex items-center gap-4 sm:gap-6 text-xs text-slate-300 font-bold">
          <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 backdrop-blur-md shadow-lg">
            <Sparkles className="h-4 w-4 text-emerald-400" /> Real-Time Quotes
          </span>
          <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 backdrop-blur-md shadow-lg">
            <Activity className="h-4 w-4 text-blue-400" /> Daily Quests
          </span>
          <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 backdrop-blur-md shadow-lg">
            <ShieldCheck className="h-4 w-4 text-purple-400" /> Zero Financial Risk
          </span>
        </div>
      </div>

      {/* Right Side: Sign In Form Container */}
      <div className="flex w-full flex-col justify-center p-8 pt-20 lg:p-12 lg:w-5/12 bg-white/95 dark:bg-[#121622]/95 border-l border-slate-200 dark:border-slate-800/80 backdrop-blur-xl z-10 min-h-screen shadow-2xl">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile-only compact flower visualization */}
          <div className="mb-6 block h-40 w-full overflow-hidden rounded-3xl lg:hidden shadow-lg border border-slate-200 dark:border-slate-800">
            <TrilliumFlower isClosed={isPasswordFocused} />
          </div>

          <h2 className="mb-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Sign In
          </h2>
          <p className="mb-8 text-sm text-slate-500 dark:text-slate-400 font-medium">
            Enter your details to access your Trillium paper trading account.
          </p>

          {error && (
            <p className="mb-4 text-sm text-red-600 dark:text-red-400 text-center bg-red-500/10 py-2.5 px-3 rounded-xl border border-red-500/20 font-medium">
              {error}
            </p>
          )}
          {success && (
            <p className="mb-4 text-sm text-emerald-600 dark:text-emerald-400 text-center bg-emerald-500/10 py-2.5 px-3 rounded-xl border border-emerald-500/20 font-medium">
              {success}
            </p>
          )}
          
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
                className="bg-slate-50/50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700/60 text-slate-900 dark:text-white"
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
                className="bg-slate-50/50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700/60 text-slate-900 dark:text-white"
              />
            </div>

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between text-xs py-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-emerald-500 focus:ring-emerald-500/20 h-4 w-4 accent-emerald-500 cursor-pointer"
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="font-bold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 hover:underline transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            {/* Brand Emerald Green Primary Submit Button */}
            <Button
              type="submit"
              loading={loading}
              block
              className="py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black transition-all shadow-lg shadow-emerald-500/20 text-sm"
            >
              Sign In
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200 dark:border-slate-800/60" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-[#121622] px-3 text-slate-400 font-extrabold tracking-wider">
                Or continue with
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              variant="secondary"
              onClick={handleGoogleLogin}
              loading={loading}
              block
              className="flex items-center justify-center gap-2 py-3 border border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/20 hover:bg-slate-100 dark:hover:bg-slate-800/65 transition-all shadow-sm font-semibold"
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

            <Link
              href="/edu/auth"
              className="flex items-center justify-center gap-2 py-3 w-full rounded-xl border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 font-bold transition-all text-xs uppercase tracking-wider shadow-sm"
            >
              <GraduationCap className="h-4 w-4 text-teal-400" />
              Sign in with Classroom Account
            </Link>
          </div>

          <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-bold text-emerald-600 hover:underline dark:text-emerald-400">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
