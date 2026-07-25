'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { signOut } from '@/lib/auth';
import { Settings, LogOut, TreePine, X, ChevronLeft, ShoppingBag, Menu } from 'lucide-react';
import { PropsWithChildren, useState, useEffect } from 'react';
import { useSettings, FontType } from '@/context/SettingsContext';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import DashboardPet from '@/components/DashboardPet';
import { spendPortfolioCash } from '@/app/actions/trading';

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

import { DashboardSettingsProvider, useDashboardSettings } from '@/context/DashboardSettingsContext';

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <ProtectedRoute>
      <DashboardSettingsProvider>
        <DashboardInnerLayout>{children}</DashboardInnerLayout>
      </DashboardSettingsProvider>
    </ProtectedRoute>
  );
}

function DashboardInnerLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { role, settings, teacherPreviewMode, setTeacherPreviewMode } = useDashboardSettings();
  const {
    theme,
    numberFont,
    textFont,
    detailedTrophies,
    showPets,
    isSettingsOpen,
    petSkin,
    trilliums,
    ownedSkins,
    setTheme,
    setNumberFont,
    setTextFont,
    setDetailedTrophies,
    setShowPets,
    setIsSettingsOpen,
    setPetSkin,
    addOwnedSkin,
    deductTrilliums,
  } = useSettings();

  const { portfolio, fetchPortfolio, levelInfo, streakCount, fetchAchievementsAndStreak } = usePortfolioStore();

  useEffect(() => {
    if (user) {
      fetchAchievementsAndStreak();
      fetchPortfolio();
    }
  }, [user, fetchAchievementsAndStreak, fetchPortfolio]);

  const [activeTab, setActiveTab] = useState<'Graphics' | 'Market' | 'Filters' | 'Linked'>('Graphics');
  const [isBadgeHovered, setIsBadgeHovered] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [shopMessage, setShopMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    const target = e.currentTarget;
    target.classList.remove('ring-pulse-active');
    // force reflow
    void target.offsetWidth;
    target.classList.add('ring-pulse-active');
  };

  const handleBuyCash = async (skinName: 'orange' | 'blue' | 'purple') => {
    const skinCosts = {
      orange: 0,
      blue: 500,
      purple: 1200
    };
    const cost = skinCosts[skinName];
    try {
      setShopMessage(null);
      await spendPortfolioCash(cost);
      addOwnedSkin(skinName);
      setPetSkin(skinName);
      await fetchPortfolio(); // refresh portfolio cash
      setShopMessage({ text: `Success! You bought the ${skinName.toUpperCase()} skin with portfolio cash.`, type: 'success' });
    } catch (e: any) {
      setShopMessage({ text: e.message || 'Deducting portfolio cash failed', type: 'error' });
    }
  };

  const handleBuyTrilliums = (skinName: 'orange' | 'blue' | 'purple') => {
    const skinCosts = {
      orange: 0,
      blue: 50,
      purple: 120
    };
    const cost = skinCosts[skinName];
    setShopMessage(null);
    const success = deductTrilliums(cost);
    if (success) {
      addOwnedSkin(skinName);
      setPetSkin(skinName);
      setShopMessage({ text: `Success! You bought the ${skinName.toUpperCase()} skin with Trilliums.`, type: 'success' });
    } else {
      setShopMessage({ text: 'Insufficient Trilliums balance!', type: 'error' });
    }
  };

  const navLinks = [
    { name: 'Portfolio', href: '/dashboard' },
    { name: 'Explore', href: '/dashboard/explore' },
    { name: 'News', href: '/dashboard/news' },
    { name: 'Chat', href: '/dashboard/chat' },
    { name: 'Rankings', href: '/dashboard/leaderboard' },
    { name: 'Lesson', href: '/dashboard/lesson' },
  ];

  if (role === 'teacher') {
    navLinks.push({ name: 'Classroom Controls', href: '/dashboard/teacher' });
  }

  return (
    <div className={`flex min-h-screen flex-col bg-slate-50 dark:bg-[#0f111a] text-slate-800 dark:text-slate-200 font-txt-${textFont} relative overflow-hidden`}>
      {teacherPreviewMode && (
        <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border-b border-amber-500/30 text-amber-200 text-[11px] py-2 px-6 flex justify-between items-center backdrop-blur-md relative z-[100] shadow-md shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="animate-pulse text-amber-400">🔍</span>
            <span className="font-extrabold uppercase tracking-wider">Simulating Student View:</span>
            <span className="font-medium text-slate-300">
              Short-Selling: <strong className={settings.allowShortSelling ? "text-emerald-400" : "text-rose-400"}>{settings.allowShortSelling ? "Allowed" : "Blocked"}</strong> | 
              Options: <strong className={settings.allowOptions ? "text-emerald-400" : "text-rose-400"}>{settings.allowOptions ? "Unlocked" : "Locked"}</strong> | 
              Max Positions: <strong className="text-white">{settings.maxPositions}</strong> | 
              Restricted Assets: <strong className="text-white">{settings.restrictedAssets.length > 0 ? settings.restrictedAssets.join(', ') : 'None'}</strong>
            </span>
          </div>
          <button 
            onClick={() => setTeacherPreviewMode(false)}
            className="bg-amber-600 hover:bg-amber-500 text-white font-extrabold px-3 py-1 rounded-lg transition-all text-[10px] uppercase tracking-wider cursor-pointer"
          >
            Exit Simulation
          </button>
        </div>
      )}

      {/* Ambient Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/[0.04] dark:bg-blue-500/[0.02] blur-[150px] pointer-events-none z-0 animate-bg-glow" />
      <div className="absolute top-[30%] right-[-10%] w-[50%] h-[60%] rounded-full bg-rose-500/[0.04] dark:bg-rose-500/[0.02] blur-[150px] pointer-events-none z-0 animate-bg-glow [animation-delay:4s]" />
      <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-teal-500/[0.04] dark:bg-teal-500/[0.015] blur-[150px] pointer-events-none z-0 animate-bg-glow [animation-delay:8s]" />

      <div className="relative z-10 w-full max-w-[1700px] mx-auto px-3 sm:px-6 pt-3 sm:pt-6">
        <header className="relative z-50 flex h-auto min-h-[64px] items-center justify-between rounded-2xl bg-white/95 dark:bg-[#121622]/90 backdrop-blur-md px-3.5 sm:px-5 py-2.5 sm:py-3 border border-slate-200 dark:border-slate-800/60 shadow-[0_4px_0_0_#cbd5e1] dark:shadow-[0_4px_0_0_#121622] transition-all duration-300 pet-container-target">
            {/* Logo Section */}
            <div className="flex items-center justify-start shrink-0">
              <Link href="/dashboard" className="flex items-center gap-2.5 sm:gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shrink-0">
                  <TrilliumLogoMark />
                </div>
                <span className="text-base sm:text-[17px] font-bold text-slate-900 dark:text-white tracking-wide whitespace-nowrap">
                  Trillium <span className="text-blue-500">Finance</span>
                </span>
              </Link>
            </div>

            {/* Navigation Center Section */}
            <nav className="hidden lg:flex items-center justify-center flex-1 transition-all duration-500 ease-out mx-2 xl:mx-4">
              <div className="flex items-center justify-center gap-1 xl:gap-2.5 px-1 transition-all duration-500 ease-out">
                {navLinks.map((link) => {
                  const details: Record<string, { title: string; desc: string; icon: string }> = {
                    Portfolio: {
                      title: 'My Portfolio',
                      desc: 'See how much money you have, what stocks you own, and watch your progress grow on simple charts.',
                      icon: '💼',
                    },
                    Explore: {
                      title: 'Market Explorer',
                      desc: 'Look for fun companies to invest in, search for stocks, and see what different businesses do.',
                      icon: '🔍',
                    },
                    News: {
                      title: 'Daily News Feed',
                      desc: 'Read quick updates about what is happening in the world and how it changes the stock market.',
                      icon: '📰',
                    },
                    Chat: {
                      title: 'Community Chat',
                      desc: 'Talk with other kids, share your trading ideas, and learn new tips together.',
                      icon: '💬',
                    },
                    Rankings: {
                      title: 'Global Leaderboard',
                      desc: 'See your place on the leaderboard, compete with friends, and see who is the top trader.',
                      icon: '🏆',
                    },
                    Lesson: {
                      title: 'Loaning Lesson',
                      desc: 'Learn the basics of loaning, principal, and interest rates by interactively borrowing funds.',
                      icon: '📖',
                    },
                  };

                  const linkDetail = details[link.name] || { title: link.name, desc: '', icon: '✨' };

                  return (
                    <div key={link.name} className="relative group py-1">
                      <Link
                        href={link.href}
                        onMouseDown={handleNavClick}
                        style={{ '--pulse-ring-color': 'rgba(59, 130, 246, 0.4)' } as React.CSSProperties}
                        className={`text-xs xl:text-sm font-semibold transition-all duration-300 px-2.5 xl:px-3.5 py-1.5 rounded-xl border flex items-center justify-center whitespace-nowrap hover:-translate-y-[0.5px] hover:scale-[1.01] hover:brightness-105 active:scale-[0.99] active:translate-y-[0.5px] ${
                          pathname === link.href
                            ? 'text-blue-600 bg-gradient-to-b from-blue-500/15 to-blue-500/5 border-t-blue-400/40 border-x-blue-500/20 border-b-2 border-b-blue-600/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_4px_12px_rgba(59,130,246,0.15)]'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-gradient-to-b hover:from-slate-100 hover:to-slate-200/50 dark:hover:from-slate-800/50 dark:hover:to-slate-800/20 border-t-transparent border-x-transparent border-b-2 border-b-transparent hover:border-t-white/30 dark:hover:border-t-slate-700/50 hover:border-x-slate-200/40 dark:hover:border-x-slate-800/50 hover:border-b-slate-300 dark:hover:border-b-slate-900 shadow-sm'
                        }`}
                      >
                        {link.name}
                      </Link>

                      {/* Dropdown Container */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 w-60 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-300 ease-out z-50 rounded-2xl bg-white/95 dark:bg-[#1e293b]/95 border border-slate-200 dark:border-slate-700/60 p-4 shadow-2xl backdrop-blur-md">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{linkDetail.icon}</span>
                          <span className="text-xs font-bold text-slate-800 dark:text-white tracking-wide">{linkDetail.title}</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
                          {linkDetail.desc}
                        </p>
                        <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700/50 flex justify-between items-center">
                          <span className="text-[9px] font-extrabold uppercase tracking-widest text-blue-500">Go to tab</span>
                          <span className="text-[10px] text-blue-400">→</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </nav>

            {/* Divider line separating nav links and profile/shop controls */}
            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700/60 transition-all duration-500 ease-out hidden lg:block mx-2 xl:mx-4 shrink-0" />

            {/* Profile & Settings Section */}
            <div className="flex items-center justify-end gap-2 sm:gap-3 shrink-0 ml-auto lg:ml-0">
              {/* Shop Button */}
              <button
                onClick={() => setIsShopOpen(true)}
                onMouseDown={handleNavClick}
                style={{ '--pulse-ring-color': 'rgba(6, 182, 212, 0.4)' } as React.CSSProperties}
                className="flex h-[38px] items-center gap-1.5 sm:gap-2 rounded-xl bg-slate-100 dark:bg-slate-800/50 px-2.5 sm:px-4 border border-slate-200 dark:border-slate-700/50 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-955 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-all shadow-[0_3px_0_0_#cbd5e1] dark:shadow-[0_3px_0_0_#0f111a] hover:-translate-y-[1px] active:translate-y-[2px] active:shadow-none hover:brightness-105"
              >
                <ShoppingBag className="h-4 w-4 text-blue-500 dark:text-blue-400 shrink-0" />
                <span className="hidden sm:inline">Shop</span>
              </button>

              {/* Level Badge with Popover Overlay */}
              <div 
                onMouseEnter={() => setIsBadgeHovered(true)}
                onMouseLeave={() => setIsBadgeHovered(false)}
                className="relative hidden md:block"
              >
                <div 
                  onClick={() => setIsBadgeHovered(!isBadgeHovered)}
                  className="flex h-[38px] items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 px-3 shadow-[0_3px_0_0_#cbd5e1] dark:shadow-[0_3px_0_0_#0f111a] hover:-translate-y-[1px] cursor-pointer transition-all"
                >
                  <TreePine className="h-4 w-4 text-green-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {levelInfo?.name || 'Novice'}
                  </span>
                  <div className="w-16 lg:w-24 h-2.5 rounded-full bg-slate-200 dark:bg-[#0f111a] overflow-hidden shrink-0">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-600 to-cyan-400"
                      style={{ width: `${levelInfo?.progress || 0}%` }}
                    />
                  </div>
                </div>

                {/* Popover Card for Streak & XP Info */}
                {isBadgeHovered && (
                  <div className="absolute right-0 top-full mt-2 w-[340px] sm:w-[380px] p-4 bg-white/95 dark:bg-[#121622]/95 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md z-[100] transition-all duration-200 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between mb-3 border-b border-slate-200 dark:border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <TreePine className="h-4 w-4 text-emerald-500" />
                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{levelInfo?.name || 'Novice'}</span>
                      </div>
                      <span className="text-[11px] font-extrabold text-blue-500">
                        {levelInfo?.accumulated || 0} / {levelInfo?.maxXp || 100} XP
                      </span>
                    </div>

                    <div className="mb-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        <span>Level Progress</span>
                        <span>{Math.round(levelInfo?.progress || 0)}%</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-600 via-blue-400 to-cyan-400 transition-all duration-500"
                          style={{ width: `${levelInfo?.progress || 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Streak Map */}
                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">7-Day Streak Map</span>
                        <span className="text-[11px] font-extrabold text-emerald-500">{streakCount} Day Streak 🔥</span>
                      </div>
                      <div className="relative flex items-center justify-between h-10 px-2 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                        <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 border-t-2 border-dotted border-slate-300 dark:border-slate-700 h-0" />
                        {streakCount > 1 && (
                          <div 
                            className="absolute left-3 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-500 transition-all duration-500"
                            style={{ 
                              width: `${((Math.min(streakCount, 7) - 1) / 6) * 100}%`,
                              maxWidth: 'calc(100% - 24px)' 
                            }} 
                          />
                        )}
                        {Array.from({ length: 7 }).map((_, index) => {
                          const day = index + 1;
                          const isDone = day <= streakCount;
                          const isMilestone = day === 7;
                          return (
                            <div key={day} className="relative z-10 flex flex-col items-center">
                              <div 
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all border-2 ${
                                  isDone 
                                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_8px_rgba(16,185,129,0.6)]' 
                                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500'
                                }`}
                              >
                                {isMilestone ? '👑' : day}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Settings */}
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex h-[38px] w-[38px] items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-all shadow-[0_3px_0_0_#cbd5e1] dark:shadow-[0_3px_0_0_#0f111a] hover:-translate-y-[1px] active:translate-y-[2px] active:shadow-none hover:brightness-105"
                aria-label="Settings"
              >
                <Settings className="h-4 w-4 shrink-0" />
              </button>

              {/* Logout */}
              <button
                onClick={() => signOut()}
                className="hidden sm:flex h-[38px] items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800/50 px-3.5 border border-slate-200 dark:border-slate-700/50 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-955 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-all shadow-[0_3px_0_0_#cbd5e1] dark:shadow-[0_3px_0_0_#0f111a] hover:-translate-y-[1px] active:translate-y-[2px] active:shadow-none hover:brightness-105"
              >
                Logout
              </button>

              {/* Mobile Navigation Toggle Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex lg:hidden h-[38px] w-[38px] items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-all shadow-[0_3px_0_0_#cbd5e1] dark:shadow-[0_3px_0_0_#0f111a]"
                aria-label="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </header>

          {/* Mobile Navigation Drawer */}
          {isMobileMenuOpen && (
            <div className="lg:hidden mt-3 rounded-2xl bg-white/95 dark:bg-[#121622]/95 border border-slate-200 dark:border-slate-800/80 p-4 shadow-2xl backdrop-blur-md space-y-3 z-50 relative">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {navLinks.map((link) => {
                  const navIcons: Record<string, string> = {
                    Portfolio: '💼', Explore: '🔍', News: '📰', Chat: '💬', Rankings: '🏆', Lesson: '📖', 'Classroom Controls': '🛠️'
                  };
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-sm font-bold transition-all ${
                        pathname === link.href
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800'
                          : 'text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-base">{navIcons[link.name] || '✨'}</span>
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Mobile quick info and controls */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <TreePine className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{levelInfo?.name || 'Novice'}</span>
                  <span className="text-[10px] text-blue-500 font-extrabold">({streakCount} Day Streak 🔥)</span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => { setIsShopOpen(true); setIsMobileMenuOpen(false); }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-xs font-bold text-blue-600 dark:text-blue-400"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>Shop</span>
                  </button>
                  <button
                    onClick={() => { setIsSettingsOpen(true); setIsMobileMenuOpen(false); }}
                    className="flex items-center justify-center h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                    aria-label="Settings"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center justify-center gap-1 h-9 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <main className="w-full mt-6 pb-12">
            {children}
          </main>
        </div>

        {/* Settings Popup Modal */}
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div className="bg-white dark:bg-[#1a2133] border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 w-full max-w-xl shadow-2xl relative">
              
              {/* Top Left Title and Clean X in top right */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-slate-900 dark:text-white font-extrabold text-2xl tracking-tight">
                    {activeTab}
                  </h2>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Tab Navigation Buttons under the title */}
              <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700/50 pb-3 overflow-x-auto">
                {(['Graphics', 'Market', 'Filters', 'Linked'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
                      activeTab === tab
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Content Panel */}
              <div className="min-h-[220px] py-2">
                {activeTab === 'Graphics' && (
                  <div className="space-y-6">
                    {/* Theme Mode Toggle */}
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#0f111a]/40 border border-slate-200/50 dark:border-slate-800/30">
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-white">Theme Mode</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Toggle between dark and light themes</div>
                      </div>
                      <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          theme === 'dark' ? 'bg-blue-600' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Font Changer for Text */}
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#0f111a]/40 border border-slate-200/50 dark:border-slate-800/30">
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-white">Text Font</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-sans">Choose typeface for menus and descriptions</div>
                      </div>
                      <div className="flex gap-1.5">
                        {(['sans', 'serif', 'mono'] as const).map((font) => (
                          <button
                            key={`text-${font}`}
                            onClick={() => setTextFont(font)}
                            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all ${
                              textFont === font
                                ? 'bg-blue-600/10 border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'bg-transparent border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                            }`}
                          >
                            {font.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Font Changer for Numbers */}
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#0f111a]/40 border border-slate-200/50 dark:border-slate-800/30">
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-white">Number Font</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-sans">Choose layout style for prices and charts</div>
                      </div>
                      <div className="flex gap-1.5">
                        {(['sans', 'serif', 'mono'] as const).map((font) => (
                          <button
                            key={`num-${font}`}
                            onClick={() => setNumberFont(font)}
                            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all ${
                              numberFont === font
                                ? 'bg-blue-600/10 border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'bg-transparent border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                            }`}
                          >
                            {font.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Switch for Detailed Trophies */}
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#0f111a]/40 border border-slate-200/50 dark:border-slate-800/30">
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-white">Detailed Trophies</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Show interactive animations and details on trophy hover</div>
                      </div>
                      <button
                        onClick={() => setDetailedTrophies(!detailedTrophies)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          detailedTrophies ? 'bg-blue-600' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            detailedTrophies ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Button for Dashboard Pet Spawn/Despawn */}
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#0f111a]/40 border border-slate-200/50 dark:border-slate-800/30">
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-white">Dashboard Pet</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Spawn or despawn a cute interactive pet on the dashboard</div>
                      </div>
                      <button
                        onClick={() => setShowPets(!showPets)}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-md ${
                          showPets 
                            ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-700/20' 
                            : 'bg-emerald-600 hover:bg-emerald-505 text-white shadow-emerald-700/20'
                        }`}
                      >
                        {showPets ? 'Despawn Pet' : 'Spawn Pet'}
                      </button>
                    </div>
                  </div>
                )}

                {activeTab !== 'Graphics' && (
                  <div className="flex flex-col items-center justify-center text-center py-12">
                    <span className="text-3xl mb-2">⚙️</span>
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">{activeTab} Settings</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Configuring {activeTab.toLowerCase()} properties will be supported in a future update.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Pet Skin Shop Popup Modal */}
        {isShopOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            {/* The Perfectly Square, Bigger container */}
            <div className="bg-white/95 dark:bg-[#121622]/95 border border-slate-200 dark:border-slate-850 rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] aspect-square flex flex-col justify-between shadow-[0_8px_0_0_#cbd5e1] dark:shadow-[0_8px_0_0_#121622] backdrop-blur-md relative overflow-hidden">
              
              {/* Header section */}
              <div className="flex justify-between items-start mb-4 shrink-0">
                <div>
                  <h2 className="text-slate-900 dark:text-white font-extrabold text-2xl tracking-tight">
                    Pet Skin Shop
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Select a skin for your dashboard companion!
                  </p>
                </div>
                
                {/* Stats & Close Container */}
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1.5 text-right">
                    {/* Available Cash */}
                    <div className="flex items-center justify-end gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-inner">
                      <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Available Cash</span>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                        ${portfolio?.cash !== undefined ? portfolio.cash.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '10,000.00'}
                      </span>
                    </div>
                    {/* Trilliums */}
                    <div className="flex items-center justify-end gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-inner">
                      <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Trilliums</span>
                      <div className="flex items-center gap-1.5">
                        <svg
                          viewBox="330 330 320 320"
                          className="h-3.5 w-3.5 fill-current text-cyan-500 dark:text-cyan-400 animate-pulse"
                        >
                          <path d="M460 478v2c-1.65 1.5-3.404 2.82-5.176 4.172-4.331 4.34-5.255 8.855-5.262 14.828.145 5.502.343 9.008 4.438 13 7.41 5.527 13.79 6.867 23 6 7.996-2.028 14.412-6.118 19-13l1 10h-2l-.062 3.125c-1.96 15.159-14.199 28.396-25.594 37.46-27.369 20.233-63.328 23.847-96.281 19.29A148.4 148.4 0 0 1 338 565c1.454-17.931 17.3-38.924 29-52h2c.26-.584.52-1.168.79-1.77 8.19-15.088 30.315-26.191 46.21-31.105 7.189-2.028 14.545-3.128 21.938-4.125l3.158-.453c6.991-.823 12.347-.118 18.904 2.453" />
                          <path d="M579.281 485.082c9.715 4.91 18.383 10.933 26.719 17.918l2.582 2.02c13.975 11.446 24.002 29.217 32.293 44.918.49.924.978 1.85 1.482 2.802l1.385 2.662 1.246 2.39c.949 2.07 1.546 3.985 2.012 6.208-28.394 16.311-70.951 15.934-101.937 8.188-16.248-4.75-30.312-11.896-42.442-23.672-2.571-2.553-2.571-2.553-5.422-4.703C495 542 495 542 494.375 539.75c.78-3.429 2.377-5.721 4.313-8.625C501.186 527.08 503 522.801 503 518l3.727.105q2.448.043 4.898.082l2.45.077c7.394.09 12.492-2.125 17.925-7.264 4.145-5.574 3.869-12.36 3-19-2.09-5.383-5.933-9.049-10-13v-2c16.74-5.58 38.982.717 54.281 8.082" />
                          <path d="M489 338c4.223 1.646 7.072 4.77 10.188 7.938l1.745 1.763c5.046 5.162 9.65 10.589 14.067 16.299.737.92 1.475 1.84 2.234 2.79C530.117 383.27 538.371 401.614 543 422l.688 2.953c1.464 7.609 1.515 15.193 1.562 22.922l.028 3.28c-.023 5.672-.357 10.494-2.278 15.845l-6.8 1.36q-3.498.7-6.993 1.406l-1.982.399-5.71 1.151A298 298 0 0 1 512 473l2-1c.428-10.103.238-18.735-6-27v-2l-1.687-.812C504 441 504 441 501.5 439.375c-2.609-1.696-2.609-1.696-6.5-1.375v-2c-7.266 1.498-13.166 3.113-18 9-3.206 5.088-5.144 10.055-5.098 16.11l.01 2.285.026 2.355.013 2.402q.02 2.925.049 5.848c-5.807-.725-11.305-2.028-16.951-3.54-3.496-.908-6.826-1.572-10.428-1.897L441 468c-7.162-10.742-4.002-32.947-1.812-45.125.531-2.652 1.155-5.247 1.812-7.875l.488-1.955c7.427-28.739 24.967-51.418 46.184-71.557 1.55-1.404 1.55-1.404 1.328-3.488" />
                          <path d="m565.063 583.188 3.2.212q3.872.264 7.737.6c-3.421 5.146-7.795 7.561-13.062 10.5l-2.597 1.47C535.295 610 535.295 610 523 610l-1 2c-1.898.379-1.898.379-4.375.563l-2.79.218L512 613l-2.336.281c-30.437 3.546-60.78-1.569-87.664-16.281a700 700 0 0 0-6-3v-2l-1.766-.344c-2.418-.71-3.96-1.669-5.984-3.156l-1.86-1.344L405 586v-1c25.63-3.041 25.63-3.041 36 4 25.273 13.816 57.357 13.511 84.5 6.125 10.636-3.259 10.636-3.259 20.433-8.406 6.492-4.164 11.576-4.194 19.13-3.532" />
                        </svg>
                        <span className="text-xs font-black text-cyan-500 dark:text-cyan-400">
                          {trilliums}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Close button */}
                  <button
                    onClick={() => setIsShopOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors shadow-inner"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content Container */}
              <div className="flex-1 overflow-y-auto pr-1 my-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700/50">
                {/* Pet Skins Header */}
                <h3 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                  Pet Skins
                </h3>

                {/* Grid of skins */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {(['orange', 'blue', 'purple'] as const).map((skin) => (
                    <ShopCard
                      key={skin}
                      skin={skin}
                      activeSkin={petSkin}
                      ownedSkins={ownedSkins}
                      onEquip={(chosenSkin) => setPetSkin(chosenSkin)}
                      onBuyCash={handleBuyCash}
                      onBuyTrilliums={handleBuyTrilliums}
                    />
                  ))}
                </div>

                {/* Divider */}
                <div className="h-[1px] bg-slate-200 dark:bg-slate-700/50 my-6" />

                {/* Navbar Skins Section */}
                <div className="mb-6">
                  <h3 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                    Navbar Skins
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['Sleek Slate', 'Emerald Glow', 'Cosmic Nebula'].map((name) => (
                      <div 
                        key={name} 
                        className="border border-dashed border-slate-300 dark:border-slate-700/80 rounded-2xl p-5 flex flex-col items-center justify-center min-h-[140px] bg-slate-50/10 dark:bg-slate-900/5 relative opacity-60"
                      >
                        <div className="absolute top-2.5 right-2.5 text-xs">🔒</div>
                        <span className="text-2xl mb-1">🎨</span>
                        <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300">{name}</h4>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">Coming Soon</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Toast Messages / Shop Feedback */}
              {shopMessage && (
                <div className={`mt-2 p-3 rounded-xl text-xs font-bold text-center border transition-all shrink-0 ${
                  shopMessage.type === 'success' 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.1)]' 
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.1)]'
                }`}>
                  {shopMessage.text}
                </div>
              )}

            </div>
          </div>
        )}

        {showPets && <DashboardPet />}
      </div>
  );
}

// --- HELPER COMPONENT: Pet Skin Preview ---
function PetPreview({ skin, isHovered }: { skin: 'orange' | 'blue' | 'purple'; isHovered: boolean }) {
  const configs = {
    orange: {
      arm: 'text-amber-500',
      body: 'from-amber-600 to-amber-400 border-amber-700',
      leg: 'text-amber-600',
      mouth: 'border-amber-900',
    },
    blue: {
      arm: 'text-blue-500',
      body: 'from-blue-600 to-blue-400 border-blue-700',
      leg: 'text-blue-600',
      mouth: 'border-blue-900',
    },
    purple: {
      arm: 'text-purple-500',
      body: 'from-purple-600 to-purple-400 border-purple-700',
      leg: 'text-purple-600',
      mouth: 'border-purple-900',
    },
  };

  const config = configs[skin];

  return (
    <div className={`relative w-8 h-12 flex flex-col items-center transition-all duration-500 ${
      isHovered ? 'animate-[preview-float_1.5s_infinite_ease-in-out]' : ''
    }`}>
      {/* Arms */}
      <div className="absolute top-4 inset-x-[-8px] flex justify-between pointer-events-none">
        {/* Left Arm */}
        <svg
          className={`h-4 w-3 origin-right ${config.arm} fill-current transition-all duration-300 ${
            isHovered ? 'rotate-[-30deg] -translate-y-[1px]' : 'rotate-[-40deg]'
          }`}
          viewBox="0 0 10 20"
        >
          <rect x="2" y="0" width="4" height="18" rx="2" />
        </svg>
        {/* Right Arm */}
        <svg
          className={`h-4 w-3 origin-left ${config.arm} fill-current transition-all duration-300 ${
            isHovered ? 'rotate-[30deg] -translate-y-[1px]' : 'rotate-[40deg]'
          }`}
          viewBox="0 0 10 20"
        >
          <rect x="4" y="0" width="4" height="18" rx="2" />
        </svg>
      </div>

      {/* Main Body Circle */}
      <div
        className={`w-8 h-8 rounded-full bg-gradient-to-tr ${config.body} border shadow-md relative flex items-center justify-center transition-all duration-300 ${
          isHovered ? 'scale-110' : 'scale-100'
        }`}
      >
        {/* Eyes */}
        <div className="flex gap-1.5 mt-[-2px] ml-[2px]">
          {/* Left Eye */}
          <div className="h-2.5 w-2 bg-white rounded-full flex items-center justify-center relative overflow-hidden">
            <div className="h-1.2 w-1.2 bg-slate-900 rounded-full absolute top-[2px] right-[1px]" />
          </div>
          {/* Right Eye */}
          <div className="h-2.5 w-2 bg-white rounded-full flex items-center justify-center relative overflow-hidden">
            <div className="h-1.2 w-1.2 bg-slate-900 rounded-full absolute top-[2px] right-[1px]" />
          </div>
        </div>

        {/* Mouth */}
        {isHovered ? (
          // Happy Smile
          <div className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 w-3.5 h-2 rounded-b-full border-2 ${config.mouth} bg-slate-900/10 dark:bg-slate-900/20`} />
        ) : (
          // Normal mouth
          <div className={`absolute bottom-2.5 left-1/2 -translate-x-1/2 w-2 h-1 border-b-2 ${config.mouth} rounded-b-full`} />
        )}
      </div>

      {/* Legs */}
      <div className="absolute bottom-0 inset-x-1.5 flex justify-between pointer-events-none">
        {/* Left Leg */}
        <svg
          className={`h-4.5 w-2.5 ${config.leg} fill-current`}
          viewBox="0 0 8 16"
        >
          <rect x="1.5" y="0" width="4.5" height="13" rx="2" />
          <ellipse cx="3.5" cy="13" rx="3.5" ry="2" />
        </svg>
        {/* Right Leg */}
        <svg
          className={`h-4.5 w-2.5 ${config.leg} fill-current`}
          viewBox="0 0 8 16"
        >
          <rect x="1.5" y="0" width="4.5" height="13" rx="2" />
          <ellipse cx="3.5" cy="13" rx="3.5" ry="2" />
        </svg>
      </div>
    </div>
  );
}

// --- HELPER COMPONENT: Shop Card ---
function ShopCard({
  skin,
  activeSkin,
  ownedSkins,
  onEquip,
  onBuyCash,
  onBuyTrilliums,
}: {
  skin: 'orange' | 'blue' | 'purple';
  activeSkin: string;
  ownedSkins: string[];
  onEquip: (skin: 'orange' | 'blue' | 'purple') => void;
  onBuyCash: (skin: 'orange' | 'blue' | 'purple') => void;
  onBuyTrilliums: (skin: 'orange' | 'blue' | 'purple') => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const displayName = skin.charAt(0).toUpperCase() + skin.slice(1);
  const isActive = activeSkin === skin;
  const isOwned = ownedSkins.includes(skin);

  const skinCosts = {
    orange: { cash: 0, trilliums: 0 },
    blue: { cash: 500, trilliums: 50 },
    purple: { cash: 1200, trilliums: 120 },
  };

  const cost = skinCosts[skin];

  const cardColorStyles = {
    orange: 'border-amber-200 dark:border-amber-900/40 hover:border-amber-400 dark:hover:border-amber-700 bg-amber-50/30 dark:bg-amber-950/10',
    blue: 'border-blue-200 dark:border-blue-900/40 hover:border-blue-400 dark:hover:border-blue-700 bg-blue-50/30 dark:bg-blue-950/10',
    purple: 'border-purple-200 dark:border-purple-900/40 hover:border-purple-400 dark:hover:border-purple-700 bg-purple-50/30 dark:bg-purple-950/10',
  };

  const handlePulse = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    target.classList.remove('ring-pulse-active');
    void target.offsetWidth;
    target.classList.add('ring-pulse-active');
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`rounded-xl border p-5 flex flex-col items-center justify-between min-h-[260px] transition-all duration-300 transform ${
        isActive
          ? 'ring-2 ring-blue-500 border-transparent shadow-[0_4px_12px_rgba(59,130,246,0.15)] bg-slate-50/50 dark:bg-[#121622]/50'
          : 'shadow-[0_2px_0_0_#cbd5e1] dark:shadow-[0_2px_0_0_#121622] hover:-translate-y-[2px] hover:shadow-[0_4px_0_0_#cbd5e1] dark:hover:shadow-[0_4px_0_0_#121622] hover:brightness-105 ' + cardColorStyles[skin]
      }`}
    >
      <div className="h-24 flex items-center justify-center">
        <PetPreview skin={skin} isHovered={isHovered} />
      </div>

      <div className="w-full text-center mt-4">
        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-2">
          {displayName} Skin
        </h3>
        
        {isOwned ? (
          <button
            onMouseDown={handlePulse}
            style={{ '--pulse-ring-color': 'rgba(59, 130, 246, 0.4)' } as React.CSSProperties}
            className={`mt-2 w-full py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
              isActive
                ? 'bg-blue-600 text-white shadow-md cursor-default'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:-translate-y-[0.5px] hover:scale-[1.01] hover:brightness-105 active:scale-[0.99] active:translate-y-[0.5px]'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              if (!isActive) onEquip(skin);
            }}
          >
            {isActive ? 'Active' : 'Equip'}
          </button>
        ) : (
          <div className="flex flex-col items-center w-full mt-2 gap-1">
            {/* Buy with Cash */}
            <button
              onMouseDown={handlePulse}
              style={{ '--pulse-ring-color': 'rgba(16, 185, 129, 0.4)' } as React.CSSProperties}
              onClick={(e) => {
                e.stopPropagation();
                onBuyCash(skin);
              }}
              className="w-full py-1.5 rounded-lg text-xs font-black transition-all duration-200 border border-emerald-500/30 hover:border-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.1)] hover:-translate-y-[0.5px] hover:scale-[1.01] hover:brightness-105 active:scale-[0.99] active:translate-y-[0.5px]"
            >
              ${cost.cash}
            </button>
            
            {/* Small 'or' text */}
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              or
            </span>
            
            {/* Buy with Trilliums */}
            <button
              onMouseDown={handlePulse}
              style={{ '--pulse-ring-color': 'rgba(6, 182, 212, 0.4)' } as React.CSSProperties}
              onClick={(e) => {
                e.stopPropagation();
                onBuyTrilliums(skin);
              }}
              className="w-full py-1.5 rounded-lg text-xs font-black transition-all duration-200 border border-cyan-500/30 hover:border-cyan-500 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-500 dark:text-cyan-400 flex items-center justify-center gap-1.5 shadow-[0_0_8px_rgba(6,182,212,0.1)] hover:-translate-y-[0.5px] hover:scale-[1.01] hover:brightness-105 active:scale-[0.99] active:translate-y-[0.5px]"
            >
              <div className="flex items-center gap-1">
                <svg
                  viewBox="330 330 320 320"
                  className="h-3.5 w-3.5 fill-current text-cyan-500 dark:text-cyan-400"
                >
                  <path d="M460 478v2c-1.65 1.5-3.404 2.82-5.176 4.172-4.331 4.34-5.255 8.855-5.262 14.828.145 5.502.343 9.008 4.438 13 7.41 5.527 13.79 6.867 23 6 7.996-2.028 14.412-6.118 19-13l1 10h-2l-.062 3.125c-1.96 15.159-14.199 28.396-25.594 37.46-27.369 20.233-63.328 23.847-96.281 19.29A148.4 148.4 0 0 1 338 565c1.454-17.931 17.3-38.924 29-52h2c.26-.584.52-1.168.79-1.77 8.19-15.088 30.315-26.191 46.21-31.105 7.189-2.028 14.545-3.128 21.938-4.125l3.158-.453c6.991-.823 12.347-.118 18.904 2.453" />
                  <path d="M579.281 485.082c9.715 4.91 18.383 10.933 26.719 17.918l2.582 2.02c13.975 11.446 24.002 29.217 32.293 44.918.49.924.978 1.85 1.482 2.802l1.385 2.662 1.246 2.39c.949 2.07 1.546 3.985 2.012 6.208-28.394 16.311-70.951 15.934-101.937 8.188-16.248-4.75-30.312-11.896-42.442-23.672-2.571-2.553-2.571-2.553-5.422-4.703C495 542 495 542 494.375 539.75c.78-3.429 2.377-5.721 4.313-8.625C501.186 527.08 503 522.801 503 518l3.727.105q2.448.043 4.898.082l2.45.077c7.394.09 12.492-2.125 17.925-7.264 4.145-5.574 3.869-12.36 3-19-2.09-5.383-5.933-9.049-10-13v-2c16.74-5.58 38.982.717 54.281 8.082" />
                  <path d="M489 338c4.223 1.646 7.072 4.77 10.188 7.938l1.745 1.763c5.046 5.162 9.65 10.589 14.067 16.299.737.92 1.475 1.84 2.234 2.79C530.117 383.27 538.371 401.614 543 422l.688 2.953c1.464 7.609 1.515 15.193 1.562 22.922l.028 3.28c-.023 5.672-.357 10.494-2.278 15.845l-6.8 1.36q-3.498.7-6.993 1.406l-1.982.399-5.71 1.151A298 298 0 0 1 512 473l2-1c.428-10.103.238-18.735-6-27v-2l-1.687-.812C504 441 504 441 501.5 439.375c-2.609-1.696-2.609-1.696-6.5-1.375v-2c-7.266 1.498-13.166 3.113-18 9-3.206 5.088-5.144 10.055-5.098 16.11l.01 2.285.026 2.355.013 2.402q.02 2.925.049 5.848c-5.807-.725-11.305-2.028-16.951-3.54-3.496-.908-6.826-1.572-10.428-1.897L441 468c-7.162-10.742-4.002-32.947-1.812-45.125.531-2.652 1.155-5.247 1.812-7.875l.488-1.955c7.427-28.739 24.967-51.418 46.184-71.557 1.55-1.404 1.55-1.404 1.328-3.488" />
                  <path d="m565.063 583.188 3.2.212q3.872.264 7.737.6c-3.421 5.146-7.795 7.561-13.062 10.5l-2.597 1.47C535.295 610 535.295 610 523 610l-1 2c-1.898.379-1.898.379-4.375.563l-2.79.218L512 613l-2.336.281c-30.437 3.546-60.78-1.569-87.664-16.281a700 700 0 0 0-6-3v-2l-1.766-.344c-2.418-.71-3.96-1.669-5.984-3.156l-1.86-1.344L405 586v-1c25.63-3.041 25.63-3.041 36 4 25.273 13.816 57.357 13.511 84.5 6.125 10.636-3.259 10.636-3.259 20.433-8.406 6.492-4.164 11.576-4.194 19.13-3.532" />
                </svg>
                <span>{cost.trilliums}</span>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
