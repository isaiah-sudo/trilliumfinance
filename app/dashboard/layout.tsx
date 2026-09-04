'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { signOut } from '@/lib/auth';
import {
  Settings,
  LogOut,
  TreePine,
  X,
  ChevronLeft,
  ShoppingBag,
  Menu,
  LayoutDashboard,
  Compass,
  Newspaper,
  MessageSquare,
  Trophy,
  BookOpen,
  Sparkles,
  Flame,
  User,
  ArrowRight,
  Check
} from 'lucide-react';
import { PropsWithChildren, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings, FontType } from '@/context/SettingsContext';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { DashboardSettingsProvider, useDashboardSettings } from '@/context/DashboardSettingsContext';

interface ShopItem {
  id: string;
  name: string;
  category: 'themes' | 'titles' | 'perks';
  description: string;
  icon: string;
  costTrilliums: number;
  badgeText?: string;
  colorGradient?: string;
  palette?: string[];
}

const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'theme-slate',
    name: 'Sleek Slate Theme',
    category: 'themes',
    description: 'Classic dark slate interface with ocean blue accents.',
    icon: '🎨',
    costTrilliums: 0,
    colorGradient: 'from-blue-600 to-slate-900',
    palette: ['#0f172a', '#3b82f6', '#60a5fa'],
  },
  {
    id: 'theme-emerald',
    name: 'Emerald Glow Theme',
    category: 'themes',
    description: 'Vibrant neon emerald theme for a high-yield aesthetic.',
    icon: '🌿',
    costTrilliums: 50,
    colorGradient: 'from-emerald-500 to-teal-800',
    palette: ['#064e3b', '#10b981', '#34d399'],
  },
  {
    id: 'theme-nebula',
    name: 'Cosmic Nebula Theme',
    category: 'themes',
    description: 'Deep violet gradient with glowing cosmic purple accents.',
    icon: '🌌',
    costTrilliums: 120,
    colorGradient: 'from-purple-600 to-indigo-900',
    palette: ['#2e1065', '#a855f7', '#c084fc'],
  },
  {
    id: 'theme-cyber',
    name: 'Cyberpunk Gold Theme',
    category: 'themes',
    description: 'Futuristic gold trim & amber glow for elite portfolios.',
    icon: '⚡',
    costTrilliums: 250,
    colorGradient: 'from-amber-500 to-yellow-700',
    palette: ['#451a03', '#f59e0b', '#fbbf24'],
  },
  {
    id: 'title-bullish',
    name: 'Bullish Veteran',
    category: 'titles',
    description: 'Display a Bullish Veteran status tag next to your profile.',
    icon: '🐂',
    badgeText: 'BULLISH',
    costTrilliums: 30,
    colorGradient: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'title-wallstreet',
    name: 'Wall Street Pro',
    category: 'titles',
    description: 'Gold-embossed leaderboard title and verified status tag.',
    icon: '📈',
    badgeText: 'WS PRO',
    costTrilliums: 75,
    colorGradient: 'from-amber-400 to-amber-600',
  },
  {
    id: 'title-quant',
    name: 'Quant Specialist',
    category: 'titles',
    description: 'Elite algorithmic trader badge with holographic glow.',
    icon: '🧬',
    badgeText: 'QUANT',
    costTrilliums: 150,
    colorGradient: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'perk-streak-multiplier',
    name: '2x Streak Booster',
    category: 'perks',
    description: 'Permanently double all Trillium coins earned from lesson streaks.',
    icon: '🔥',
    badgeText: '2X BOOST',
    costTrilliums: 100,
    colorGradient: 'from-orange-500 to-amber-600',
  },
  {
    id: 'perk-vip-insights',
    name: 'VIP Market Analytics',
    category: 'perks',
    description: 'Access real-time institutional sentiment and automated trade alerts.',
    icon: '💎',
    badgeText: 'VIP UNLOCK',
    costTrilliums: 200,
    colorGradient: 'from-blue-500 to-cyan-600',
  },
];

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
    isSettingsOpen,
    trilliums,
    ownedSkins,
    setTheme,
    setNumberFont,
    setTextFont,
    setDetailedTrophies,
    setIsSettingsOpen,
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
  const [shopCategory, setShopCategory] = useState<'all' | 'themes' | 'titles' | 'perks'>('all');
  const [equippedItem, setEquippedItem] = useState<string>('theme-slate');
  const [equippedTitle, setEquippedTitle] = useState<string>('');
  const [shopMessage, setShopMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const triggerPulse = (e: React.MouseEvent<HTMLElement>) => {
    // Safe pulse effect that does not disrupt React event delegation
    const el = e.currentTarget;
    if (el) {
      el.classList.remove('ring-pulse-active');
      requestAnimationFrame(() => {
        el.classList.add('ring-pulse-active');
      });
    }
  };

  const handleNavClick = triggerPulse;

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('trillium_equipped_theme') || 'theme-slate';
      setEquippedItem(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
      const savedTitle = localStorage.getItem('trillium_equipped_title') || '';
      setEquippedTitle(savedTitle);
    } catch {
      // ignore
    }
  }, []);

  const handleEquipItem = (item: ShopItem) => {
    if (item.category === 'themes') {
      setEquippedItem(item.id);
      try {
        localStorage.setItem('trillium_equipped_theme', item.id);
        document.documentElement.setAttribute('data-theme', item.id);
      } catch {}
      setShopMessage({ text: `Equipped ${item.name}!`, type: 'success' });
    } else if (item.category === 'titles') {
      setEquippedTitle(item.id);
      try {
        localStorage.setItem('trillium_equipped_title', item.id);
      } catch {}
      setShopMessage({ text: `Equipped ${item.name}!`, type: 'success' });
    }
  };

  const handleBuyItemTrilliums = (item: ShopItem) => {
    if (item.costTrilliums === undefined) return;
    setShopMessage(null);
    const success = deductTrilliums(item.costTrilliums);
    if (success) {
      addOwnedSkin(item.id);
      handleEquipItem(item);
      setShopMessage({ text: `Success! You bought and equipped ${item.name}.`, type: 'success' });
    } else {
      setShopMessage({ text: 'Insufficient Trilliums balance!', type: 'error' });
    }
  };

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Explore', href: '/dashboard/explore' },
    { name: 'News', href: '/dashboard/news' },
    { name: 'Chat', href: '/dashboard/chat' },
    { name: 'Rankings', href: '/dashboard/leaderboard' },
    { name: 'Lesson', href: '/dashboard/lesson' },
  ];

  if (role === 'teacher') {
    navLinks.push({ name: 'Educator Portal', href: '/teacher' });
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
      {/* Ambient Glow Effects */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] pointer-events-none z-0 animate-bg-glow opacity-50"
        style={{ background: 'var(--theme-accent-glow, rgba(59, 130, 246, 0.04))' }} 
      />
      <div 
        className="absolute top-[30%] right-[-10%] w-[50%] h-[60%] rounded-full blur-[150px] pointer-events-none z-0 animate-bg-glow [animation-delay:4s] opacity-40"
        style={{ background: 'var(--theme-accent-secondary-glow, rgba(244, 63, 94, 0.04))' }} 
      />
      <div 
        className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full blur-[150px] pointer-events-none z-0 animate-bg-glow [animation-delay:8s] opacity-40"
        style={{ background: 'var(--theme-accent-glow, rgba(20, 184, 166, 0.04))' }} 
      />

      <div className="relative z-10 w-full min-h-screen px-3 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-14 max-w-[2560px] mx-auto pt-3 sm:pt-5 flex flex-col flex-1">
        <header className="relative z-[80] w-full flex h-auto min-h-[58px] items-center justify-between rounded-2xl bg-slate-900/80 dark:bg-slate-900/85 backdrop-blur-2xl px-3 sm:px-4 md:px-5 py-2 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.36)] transition-all duration-300 gap-1.5 sm:gap-3">
            {/* Logo Section */}
            <div className="flex items-center justify-start shrink-0">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--theme-accent,#10b981)] to-blue-500 shadow-[0_0_15px_var(--theme-accent-glow,rgba(16,185,129,0.35))] shrink-0 p-0.5">
                  <TrilliumLogoMark />
                </div>
                <span className="text-base sm:text-lg font-black text-white tracking-wide whitespace-nowrap">
                  Trillium <span className="text-[var(--theme-accent,#10b981)] hidden min-[380px]:inline">Finance</span>
                </span>
              </Link>
            </div>

            {/* Navigation Center Section */}
            <nav className="hidden lg:flex items-center justify-center flex-1 transition-all duration-500 ease-out mx-1 lg:mx-2 min-w-0">
              <div className="flex items-center justify-center gap-1 lg:gap-1.5 px-1 flex-wrap">
                {navLinks.map((link) => {
                  const details: Record<string, { title: string; desc: string; icon: any; color: string }> = {
                    Dashboard: {
                      title: 'My Dashboard',
                      desc: 'See how much money you have, what stocks you own, and watch your progress grow on simple charts.',
                      icon: LayoutDashboard,
                      color: 'text-emerald-400',
                    },
                    Explore: {
                      title: 'Market Explorer',
                      desc: 'Look for fun companies to invest in, search for stocks, and see what different businesses do.',
                      icon: Compass,
                      color: 'text-blue-400',
                    },
                    News: {
                      title: 'Daily News Feed',
                      desc: 'Read quick updates about what is happening in the world and how it changes the stock market.',
                      icon: Newspaper,
                      color: 'text-amber-400',
                    },
                    Chat: {
                      title: 'Community Chat',
                      desc: 'Talk with other traders, share ideas, and learn new market strategies.',
                      icon: MessageSquare,
                      color: 'text-purple-400',
                    },
                    Rankings: {
                      title: 'Global Leaderboard',
                      desc: 'See your place on the leaderboard, compete with peers, and level up your rank.',
                      icon: Trophy,
                      color: 'text-yellow-400',
                    },
                    Lesson: {
                      title: 'Loaning Lesson',
                      desc: 'Learn the basics of loaning, principal, and interest rates by interactively borrowing funds.',
                      icon: BookOpen,
                      color: 'text-teal-400',
                    },
                  };

                  const linkDetail = details[link.name] || { title: link.name, desc: '', icon: Sparkles, color: 'text-emerald-400' };
                  const NavIcon = linkDetail.icon;
                  const isActive = pathname === link.href;

                  return (
                    <div key={link.name} className="relative group py-1">
                      <Link
                        href={link.href}
                        onClick={triggerPulse}
                        style={{ '--pulse-ring-color': 'var(--pulse-ring-color, rgba(16, 185, 129, 0.4))' } as React.CSSProperties}
                        className={`text-xs font-bold transition-all duration-200 px-2.5 lg:px-3 py-1.5 rounded-xl border flex items-center justify-center whitespace-nowrap gap-1.5 cursor-pointer ${
                          isActive
                            ? 'text-[var(--theme-accent,#10b981)] bg-[var(--theme-accent-subtle,rgba(16,185,129,0.15))] border-[var(--theme-accent-border,rgba(16,185,129,0.35))] shadow-[0_0_15px_var(--theme-accent-subtle,rgba(16,185,129,0.25))]'
                            : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent hover:border-white/10'
                        }`}
                      >
                        <NavIcon className={`h-3.5 w-3.5 ${isActive ? 'text-[var(--theme-accent,#10b981)]' : 'text-slate-400 group-hover:text-slate-200'}`} />
                        <span>{link.name}</span>
                      </Link>

                      {/* Non-blocking Hover Dropdown Tooltip */}
                      <div
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-[70] rounded-2xl bg-slate-900/95 border border-white/10 p-4 shadow-2xl backdrop-blur-xl block text-left select-none"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <NavIcon className={`h-4 w-4 ${linkDetail.color}`} />
                          <span className="text-xs font-bold text-white tracking-wide">{linkDetail.title}</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-slate-400 font-medium">
                          {linkDetail.desc}
                        </p>
                        <div className="mt-2.5 pt-2 border-t border-white/10 flex justify-between items-center">
                          <span className="text-[9px] font-extrabold uppercase tracking-widest text-[var(--theme-accent,#10b981)]">Go to tab</span>
                          <ArrowRight className="h-3 w-3 text-[var(--theme-accent,#10b981)]" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </nav>

            {/* Divider line separating nav links and profile/shop controls */}
            <div className="h-6 w-[1px] bg-white/10 hidden lg:block mx-1 shrink-0" />

            {/* Profile & Settings Section */}
            <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0 ml-auto">
              {/* Shop Button */}
              <button
                onClick={(e) => { triggerPulse(e); setIsShopOpen(true); }}
                style={{ '--pulse-ring-color': 'var(--pulse-ring-color, rgba(16, 185, 129, 0.4))' } as React.CSSProperties}
                className="flex h-[36px] sm:h-[38px] items-center gap-1.5 sm:gap-2 rounded-xl bg-white/5 hover:bg-white/10 px-2.5 sm:px-3 border border-white/10 text-xs font-bold text-slate-200 hover:text-white transition-all shadow-sm hover:-translate-y-[0.5px] cursor-pointer shrink-0"
              >
                <ShoppingBag className="h-4 w-4 text-[var(--theme-accent,#10b981)] shrink-0" />
                <span className="hidden sm:inline">Shop</span>
              </button>

              {/* Remodeled Expanding Experience/Level Bar with Buttery Smooth Spring Animation */}
              <motion.div 
                layout
                onMouseEnter={() => setIsBadgeHovered(true)}
                onMouseLeave={() => setIsBadgeHovered(false)}
                onClick={() => setIsBadgeHovered(!isBadgeHovered)}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className={`relative hidden md:flex h-[36px] sm:h-[38px] items-center gap-2 sm:gap-2.5 rounded-xl border transition-colors duration-300 ease-out cursor-pointer select-none overflow-hidden px-2.5 sm:px-3 shrink-0 ${
                  isBadgeHovered
                    ? 'bg-slate-900/90 border-[var(--theme-accent-border,rgba(16,185,129,0.4))] shadow-[0_0_25px_var(--theme-accent-glow,rgba(16,185,129,0.25))] ring-1 ring-[var(--theme-accent-border,rgba(16,185,129,0.3))]'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 shadow-sm'
                }`}
              >
                {/* Level Rank Icon & Name */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <div className={`h-6 w-6 rounded-lg flex items-center justify-center transition-colors ${isBadgeHovered ? 'bg-[var(--theme-accent-subtle,rgba(16,185,129,0.2))] text-[var(--theme-accent,#10b981)]' : 'bg-white/5 text-[var(--theme-accent,#10b981)]'}`}>
                    <TreePine className="h-3.5 w-3.5 shrink-0" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-200 tracking-wide whitespace-nowrap">
                      {levelInfo?.name || 'Novice'}
                    </span>
                    {equippedTitle && SHOP_ITEMS.find(i => i.id === equippedTitle)?.badgeText && (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        {SHOP_ITEMS.find(i => i.id === equippedTitle)?.badgeText}
                      </span>
                    )}
                  </div>
                </div>

                {/* Dynamic Expanding Experience Bar & Values */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Illuminated Neon XP Progress Bar */}
                  <motion.div 
                    animate={{ width: isBadgeHovered ? 96 : 56 }}
                    transition={{ type: "spring", stiffness: 320, damping: 28 }}
                    className="h-2.5 rounded-full bg-slate-800/80 overflow-hidden relative"
                  >
                    <div 
                      className={`h-full bg-gradient-to-r from-[var(--theme-accent,#10b981)] via-teal-400 to-cyan-400 transition-all duration-500 relative overflow-hidden ${
                        isBadgeHovered
                          ? 'shadow-[0_0_16px_var(--theme-accent-glow,rgba(16,185,129,0.9)),0_0_24px_rgba(52,211,153,0.7)] brightness-110'
                          : 'shadow-[0_0_8px_var(--theme-accent-glow,rgba(16,185,129,0.5))]'
                      }`}
                      style={{ width: `${levelInfo?.progress || 0}%` }}
                    >
                      {/* Shimmer light reflection when hovered */}
                      {isBadgeHovered && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-[shimmer_1.2s_infinite]" />
                      )}
                    </div>
                  </motion.div>

                  {/* Side-Expanded Details: Total Experience & Streak */}
                  <AnimatePresence mode="wait" initial={false}>
                    {isBadgeHovered ? (
                      <motion.div 
                        key="badge-expanded"
                        initial={{ opacity: 0, x: -6, width: 0 }}
                        animate={{ opacity: 1, x: 0, width: 'auto' }}
                        exit={{ opacity: 0, x: -6, width: 0 }}
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                        className="flex items-center gap-1.5 text-xs font-mono shrink-0 overflow-hidden whitespace-nowrap"
                      >
                        <span className="font-extrabold text-emerald-400 whitespace-nowrap">
                          {levelInfo?.accumulated || 0} <span className="text-slate-500 font-normal">/</span> {levelInfo?.maxXp || 100} XP
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-1 py-0.5 rounded border border-white/10 whitespace-nowrap">
                          {Math.round(levelInfo?.progress || 0)}%
                        </span>
                        {streakCount > 0 && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 whitespace-nowrap">
                            <Flame className="h-3 w-3 text-amber-400" />
                            {streakCount}d
                          </span>
                        )}
                      </motion.div>
                    ) : (
                      <motion.span 
                        key="badge-compact"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="text-[11px] font-mono font-bold text-slate-400 hidden xl:inline shrink-0"
                      >
                        {Math.round(levelInfo?.progress || 0)}%
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Settings */}
              <button
                onClick={(e) => { triggerPulse(e); setIsSettingsOpen(true); }}
                style={{ '--pulse-ring-color': 'rgba(148, 163, 184, 0.4)' } as React.CSSProperties}
                className="flex h-[36px] w-[36px] sm:h-[38px] sm:w-[38px] items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all shadow-sm hover:-translate-y-[0.5px] cursor-pointer shrink-0"
                aria-label="Settings"
              >
                <Settings className="h-4 w-4 shrink-0" />
              </button>

              {/* Logout */}
              <button
                onClick={() => signOut()}
                className="hidden lg:flex h-[36px] sm:h-[38px] items-center gap-1.5 rounded-xl bg-white/5 hover:bg-white/10 px-2.5 sm:px-3 border border-white/10 text-xs font-bold text-slate-300 hover:text-rose-400 transition-all shadow-sm hover:-translate-y-[0.5px] cursor-pointer shrink-0"
              >
                <LogOut className="h-3.5 w-3.5 shrink-0" />
                <span>Logout</span>
              </button>

              {/* Mobile / Tablet Navigation Toggle Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex lg:hidden h-[36px] w-[36px] sm:h-[38px] sm:w-[38px] items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all shadow-sm shrink-0"
                aria-label="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </header>

          {/* Mobile Navigation Drawer */}
          {isMobileMenuOpen && (
            <div className="lg:hidden mt-3 rounded-2xl bg-slate-900/95 border border-white/10 p-4 shadow-2xl backdrop-blur-xl space-y-4 z-50 relative animate-in fade-in slide-in-from-top-2">
              <div className="grid grid-cols-2 gap-2">
                {navLinks.map((link) => {
                  const isMobileActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`p-3 rounded-xl border flex items-center justify-center text-xs font-bold transition-all ${
                        isMobileActive
                          ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-400 shadow-sm'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className="truncate">{link.name}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Mobile Level & Streak Progress Map */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5 font-extrabold text-slate-800 dark:text-white">
                    <TreePine className="h-4 w-4 text-emerald-500" />
                    <span>{levelInfo?.name || 'Novice'}</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-blue-500">
                    {levelInfo?.accumulated || 0} / {levelInfo?.maxXp || 100} XP
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 via-blue-400 to-cyan-400"
                    style={{ width: `${levelInfo?.progress || 0}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 font-bold pt-1">
                  <span>7-Day Streak Map</span>
                  <span className="text-emerald-500">{streakCount} Day Streak 🔥</span>
                </div>
              </div>

              {/* Mobile quick actions toolbar */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between gap-2">
                <button
                  onClick={() => { setIsShopOpen(true); setIsMobileMenuOpen(false); }}
                  className="flex-1 flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-xs font-bold text-blue-600 dark:text-blue-400 active:scale-95 transition-transform"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Shop</span>
                </button>
                <button
                  onClick={() => { setIsSettingsOpen(true); setIsMobileMenuOpen(false); }}
                  className="flex items-center justify-center h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 active:scale-95 transition-transform"
                  aria-label="Settings"
                >
                  <Settings className="h-4 w-4" />
                </button>
                <button
                  onClick={() => signOut()}
                  className="flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs font-bold text-rose-600 dark:text-rose-400 active:scale-95 transition-transform"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}

          <main className="w-full mt-6 pb-12 flex-1 flex flex-col">
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

        {/* Trillium Customization Store Popup Modal */}
        {isShopOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#121622] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-7 w-full max-w-4xl max-h-[85vh] flex flex-col justify-between shadow-2xl relative overflow-hidden">
              
              {/* Header section */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800/80 shrink-0">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-2xl bg-[var(--theme-accent-subtle,rgba(16,185,129,0.12))] border border-[var(--theme-accent-border,rgba(16,185,129,0.25))] text-[var(--theme-accent,#10b981)]">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                    <h2 className="text-slate-900 dark:text-white font-black text-xl md:text-2xl tracking-tight">
                      Trillium Store & Customization
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    Personalize your terminal with exclusive interface themes, leaderboard titles, and account boosters.
                  </p>
                </div>
                
                {/* Stats & Close Container */}
                <div className="flex items-center gap-3">
                  {/* Trilliums Balance Only */}
                  <div className="flex items-center gap-2.5 bg-slate-100/90 dark:bg-slate-800/90 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
                    <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Your Balance</span>
                    <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200 dark:border-slate-700/80">
                      <div className="text-[var(--theme-accent,#06b6d4)]">
                        <TrilliumLogoMark />
                      </div>
                      <span className="text-sm font-black text-cyan-600 dark:text-cyan-400 font-num-sans">
                        {trilliums.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Trilliums</span>
                    </div>
                  </div>
                  
                  {/* Close button */}
                  <button
                    onClick={() => setIsShopOpen(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                    aria-label="Close Store"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-2.5 my-4 shrink-0">
                {(['all', 'themes', 'titles', 'perks'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setShopCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-black capitalize transition-all cursor-pointer ${
                      shopCategory === cat
                        ? 'bg-[var(--theme-accent,#10b981)] text-slate-950 shadow-[0_0_15px_var(--theme-accent-glow,rgba(16,185,129,0.3))]'
                        : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/70 border border-transparent hover:border-slate-200 dark:hover:border-slate-700/50'
                    }`}
                  >
                    {cat === 'all' ? 'All Store Items' : cat}
                  </button>
                ))}
              </div>

              {/* Scrollable Item Grid - Clean, spacious, modern layout */}
              <div className="flex-1 overflow-y-auto pr-1.5 my-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700/50 min-h-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-1">
                  {(shopCategory === 'all' ? SHOP_ITEMS : SHOP_ITEMS.filter((i) => i.category === shopCategory)).map((item) => {
                    const isOwned = ownedSkins.includes(item.id) || item.id === 'theme-slate';
                    const isActive = item.category === 'titles' 
                      ? equippedTitle === item.id 
                      : (equippedItem === item.id || (item.id === 'theme-slate' && !equippedItem));

                    return (
                      <div
                        key={item.id}
                        className={`rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 bg-white/70 dark:bg-[#0e111a]/75 backdrop-blur-md hover:border-[var(--theme-accent-border,rgba(16,185,129,0.5))] hover:shadow-xl ${
                          isActive
                            ? 'ring-2 ring-[var(--theme-accent,#10b981)] border-[var(--theme-accent,#10b981)] shadow-[0_0_20px_var(--theme-accent-subtle,rgba(16,185,129,0.15))]'
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${item.colorGradient} flex items-center justify-center text-xl shadow-md shrink-0`}>
                              {item.icon}
                            </div>
                            {item.badgeText && (
                              <span className="text-[9.5px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[var(--theme-accent-subtle,rgba(16,185,129,0.12))] text-[var(--theme-accent,#10b981)] border border-[var(--theme-accent-border,rgba(16,185,129,0.25))]">
                                {item.badgeText}
                              </span>
                            )}
                          </div>
                          <h4 className="font-black text-sm text-slate-900 dark:text-white leading-tight">
                            {item.name}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                            {item.description}
                          </p>

                          {/* Theme Color Palette Preview Bar */}
                          {item.palette && (
                            <div className="mt-3.5 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Preview:</span>
                              <div className="flex items-center gap-1.5">
                                {item.palette.map((color, cIdx) => (
                                  <span
                                    key={cIdx}
                                    className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs"
                                    style={{ backgroundColor: color }}
                                    title={color}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Card Footer / Purchase & Equip Actions */}
                        <div className="mt-5 pt-3.5 border-t border-slate-200/60 dark:border-slate-800/60">
                          {isActive ? (
                            <div className="w-full py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 bg-[var(--theme-accent-subtle,rgba(16,185,129,0.12))] border border-[var(--theme-accent-border,rgba(16,185,129,0.3))] text-[var(--theme-accent,#10b981)] shadow-xs">
                              <Check className="h-3.5 w-3.5" />
                              <span>Currently Equipped</span>
                            </div>
                          ) : isOwned ? (
                            <button
                              onClick={() => handleEquipItem(item)}
                              className="w-full py-2.5 rounded-xl text-xs font-black transition-all bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 shadow-md cursor-pointer active:scale-98"
                            >
                              Equip
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBuyItemTrilliums(item)}
                              className="w-full py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 bg-[var(--theme-accent,#10b981)] hover:opacity-95 text-slate-950 shadow-[0_0_15px_var(--theme-accent-glow,rgba(16,185,129,0.3))] cursor-pointer active:scale-98"
                            >
                              <span>Unlock for</span>
                              <div className="flex items-center gap-1 font-extrabold">
                                <TrilliumLogoMark />
                                <span>{item.costTrilliums} Trilliums</span>
                              </div>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Toast Feedback Messages */}
              {shopMessage && (
                <div className={`mt-3 p-3 rounded-2xl text-xs font-bold text-center border transition-all shrink-0 ${
                  shopMessage.type === 'success'
                    ? 'bg-[var(--theme-accent-subtle,rgba(16,185,129,0.12))] border-[var(--theme-accent-border,rgba(16,185,129,0.3))] text-[var(--theme-accent,#10b981)] shadow-sm'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-500 shadow-sm'
                }`}>
                  {shopMessage.text}
                </div>
              )}

            </div>
          </div>
        )}
      </div>
  );
}
