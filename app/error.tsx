'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    // eslint-disable-next-line no-console
    console.error('Production Error Captured:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f111a] text-white p-6">
      <div className="max-w-md w-full bg-[#1a2133] border border-slate-700/50 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-10 h-10 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-black tracking-tight">Application Error</h2>
          <p className="text-slate-400 text-sm">
            We encountered a problem while rendering this page. This has been logged for our team.
          </p>
        </div>

        {error.digest && (
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-500 break-all">
            Digest: {error.digest}
          </div>
        )}

        <div className="pt-4 flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]"
          >
            Try again
          </button>
          <a
            href="/"
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl transition-all"
          >
            Return Home
          </a>
        </div>
      </div>
    </div>
  );
}
