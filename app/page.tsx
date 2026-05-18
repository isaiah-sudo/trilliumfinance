'use client';

import Link from 'next/link';
import { Button } from '@/components/ui';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl"
      >
        <h1 className="mb-6 text-5xl font-extrabold tracking-tight sm:text-6xl">
          Trillium <span className="text-blue-600">Finance</span>
        </h1>
        <p className="mb-10 text-lg text-slate-600 dark:text-slate-400 sm:text-xl">
          Modern finance dashboard with realtime insights, portfolio management, and educational tracking.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/signup">
            <Button className="px-8 py-3 text-lg">Get Started</Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" className="px-8 py-3 text-lg">
              Sign In
            </Button>
          </Link>
          <Link href="/edu/auth">
            <Button variant="primary" className="px-8 py-3 text-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 shadow-emerald-500/20 border-0">
              Go to Education Mode
            </Button>
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
