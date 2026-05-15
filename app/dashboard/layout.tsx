'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { signOut } from '@/lib/auth';
import { Settings, LogOut, TreePine } from 'lucide-react';
import { PropsWithChildren } from 'react';

function TrilliumLogoMark() {
  return (
    <svg
      viewBox="330 330 320 320"
      aria-hidden="true"
      className="h-6 w-6 text-white transition-all duration-300 [&_path]:fill-current"
    >
      <path d="M460 478v2c-1.65 1.5-3.404 2.82-5.176 4.172-4.331 4.34-5.255 8.855-5.262 14.828.145 5.502.343 9.008 4.438 13 7.41 5.527 13.79 6.867 23 6 7.996-2.028 14.412-6.118 19-13l1 10h-2l-.062 3.125c-1.96 15.159-14.199 28.396-25.594 37.46-27.369 20.233-63.328 23.847-96.281 19.29A148.4 148.4 0 0 1 338 565c1.454-17.931 17.3-38.924 29-52h2c.26-.584.52-1.168.79-1.77 8.19-15.088 30.315-26.191 46.21-31.105 7.189-2.028 14.545-3.128 21.938-4.125l3.158-.453c6.991-.823 12.347-.118 18.904 2.453" />
      <path d="M579.281 485.082c9.715 4.91 18.383 10.933 26.719 17.918l2.582 2.02c13.975 11.446 24.002 29.217 32.293 44.918.49.924.978 1.85 1.482 2.802l1.385 2.662 1.246 2.39c.949 2.07 1.546 3.985 2.012 6.208-28.394 16.311-70.951 15.934-101.937 8.188-16.248-4.75-30.312-11.896-42.442-23.672-2.571-2.553-2.571-2.553-5.422-4.703C495 542 495 542 494.375 539.75c.78-3.429 2.377-5.721 4.313-8.625C501.186 527.08 503 522.801 503 518l3.727.105q2.448.043 4.898.082l2.45.077c7.394.09 12.492-2.125 17.925-7.264 4.145-5.574 3.869-12.36 3-19-2.09-5.383-5.933-9.049-10-13v-2c16.74-5.58 38.982.717 54.281 8.082" />
      <path d="M489 338c4.223 1.646 7.072 4.77 10.188 7.938l1.745 1.763c5.046 5.162 9.65 10.589 14.067 16.299.737.92 1.475 1.84 2.234 2.79C530.117 383.27 538.371 401.614 543 422l.688 2.953c1.464 7.609 1.515 15.193 1.562 22.922l.028 3.28c-.023 5.672-.357 10.494-2.278 15.845l-6.8 1.36q-3.498.7-6.993 1.406l-1.982.399-5.71 1.151A298 298 0 0 1 512 473l2-1c.428-10.103.238-18.735-6-27v-2l-1.687-.812C504 441 504 441 501.5 439.375c-2.609-1.696-2.609-1.696-6.5-1.375v-2c-7.266 1.498-13.166 3.113-18 9-3.206 5.088-5.144 10.055-5.098 16.11l.01 2.285.026 2.355.013 2.402q.02 2.925.049 5.848c-5.807-.725-11.305-2.028-16.951-3.54-3.496-.908-6.826-1.572-10.428-1.897L441 468c-7.162-10.742-4.002-32.947-1.812-45.125.531-2.652 1.155-5.247 1.812-7.875l.488-1.955c7.427-28.739 24.967-51.418 46.184-71.557 1.55-1.404 1.55-1.404 1.328-3.488" />
      <path d="m565.063 583.188 3.2.212q3.872.264 7.737.6c-3.421 5.146-7.795 7.561-13.062 10.5l-2.597 1.47C535.295 610 535.295 610 523 610l-1 2c-1.898.379-1.898.379-4.375.563l-2.79.218L512 613l-2.336.281c-30.437 3.546-60.78-1.569-87.664-16.281a700 700 0 0 0-6-3v-2l-1.766-.344c-2.418-.71-3.96-1.669-5.984-3.156l-1.86-1.344L405 586v-1c25.63-3.041 25.63-3.041 36 4 25.273 13.816 57.357 13.511 84.5 6.125 10.636-3.259 10.636-3.259 20.433-8.406 6.492-4.164 11.576-4.194 19.13-3.532" />
    </svg>
  );
}

export default function DashboardLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const { user } = useAuth();

  const navLinks = [
    { name: 'Portfolio', href: '/dashboard' },
    { name: 'Explore', href: '/dashboard/explore' },
    { name: 'Chat', href: '/chat' },
    { name: 'Rankings', href: '/leaderboard' },
    { name: 'Achievements', href: '/achievements' },
  ];

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col bg-[#0f111a] text-slate-200 font-sans relative overflow-hidden">
        {/* Ambient Glow Effects */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-[30%] right-[-10%] w-[40%] h-[50%] rounded-full bg-rose-900/10 blur-[120px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-[1100px] mx-auto px-4 pt-6">
          <header className="flex h-[64px] items-center justify-between rounded-2xl bg-[#1a2133]/90 backdrop-blur-md border border-slate-700/50 px-5 shadow-xl">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                  <TrilliumLogoMark />
                </div>
                <span className="text-[17px] font-bold text-white tracking-wide">
                  Trillium <span className="text-blue-500">Finance</span>
                </span>
              </Link>

              <nav className="hidden items-center gap-6 lg:flex ml-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`text-sm font-semibold transition-colors ${
                      pathname === link.href
                        ? 'text-blue-400'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              {/* Level Badge */}
              <div className="hidden sm:flex items-center gap-3 rounded-xl bg-slate-800/50 px-3 py-1.5 border border-slate-700/50 shadow-inner">
                <div className="flex items-center gap-1.5">
                  <TreePine className="h-4 w-4 text-green-500" />
                  <span className="text-xs font-bold text-slate-300">Novice</span>
                </div>
                <div className="w-16 h-1.5 rounded-full bg-[#0f111a] overflow-hidden">
                  <div className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" style={{ width: '35%' }} />
                </div>
              </div>

              {/* Settings */}
              <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white transition-colors shadow-inner">
                <Settings className="h-4 w-4" />
              </button>

              {/* Personal Toggle */}
              <button className="hidden sm:flex items-center gap-2 rounded-xl bg-slate-800/50 px-3 py-1.5 border border-slate-700/50 shadow-inner hover:bg-slate-700/50 transition-colors">
                <span className="text-xs font-semibold text-slate-300">Personal</span>
                <span className="text-sm">🔥</span>
              </button>

              {/* Logout */}
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 rounded-xl bg-slate-800/50 px-4 py-1.5 border border-slate-700/50 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors shadow-inner"
              >
                Logout
              </button>
            </div>
          </header>

          <main className="w-full mt-6 pb-12">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
