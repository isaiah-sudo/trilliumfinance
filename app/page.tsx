'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { signOut } from '@/lib/auth';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { Button } from '@/components/ui';
import {
  TrendingUp,
  GraduationCap,
  Trophy,
  Flame,
  Plus,
  Minus,
  Sparkles,
  TreePine,
  ArrowRight,
  Shield,
  Layers,
  ChevronRight
} from 'lucide-react';
import { getMarketQuotes } from '@/app/actions/trading';

function TrilliumLogoMark() {
  return (
    <svg
      viewBox="330 330 320 320"
      aria-hidden="true"
      className="h-5 w-5 text-slate-950 transition-all duration-300 [&_path]:fill-current"
    >
      <path d="M460 478v2c-1.65 1.5-3.404 2.82-5.176 4.172-4.331 4.34-5.255 8.855-5.262 14.828.145 5.502.343 9.008 4.438 13 7.41 5.527 13.79 6.867 23 6 7.996-2.028 14.412-6.118 19-13l1 10h-2l-.062 3.125c-1.96 15.159-14.199 28.396-25.594 37.46-27.369 20.233-63.328 23.847-96.281 19.29A148.4 148.4 0 0 1 338 565c1.454-17.931 17.3-38.924 29-52h2c.26-.584.52-1.168.79-1.77 8.19-15.088 30.315-26.191 46.21-31.105 7.189-2.028 14.545-3.128 21.938-4.125l3.158-.453c6.991-.823 12.347-.118 18.904 2.453" />
      <path d="M579.281 485.082c9.715 4.91 18.383 10.933 26.719 17.918l2.582 2.02c13.975 11.446 24.002 29.217 32.293 44.918.49.924.978 1.85 1.482 2.802l1.385 2.662 1.246 2.39c.949 2.07 1.546 3.985 2.012 6.208-28.394 16.311-70.951 15.934-101.937 8.188-16.248-4.75-30.312-11.896-42.442-23.672-2.571-2.553-2.571-2.553-5.422-4.703C495 542 495 542 494.375 539.75c.78-3.429 2.377-5.721 4.313-8.625C501.186 527.08 503 522.801 503 518l3.727.105q2.448.043 4.898.082l2.45.077c7.394.09 12.492-2.125 17.925-7.264 4.145-5.574 3.869-12.36 3-19-2.09-5.383-5.933-9.049-10-13v-2c16.74-5.58 38.982.717 54.281 8.082" />
      <path d="M489 338c4.223 1.646 7.072 4.77 10.188 7.938l1.745 1.763c5.046 5.162 9.65 10.589 14.067 16.299.737.92 1.475 1.84 2.234 2.79C530.117 383.27 538.371 401.614 543 422l.688 2.953c1.464 7.609 1.515 15.193 1.562 22.922l.028 3.28c-.023 5.672-.357 10.494-2.278 15.845l-6.8 1.36q-3.498.7-6.993 1.406l-1.982.399-5.71 1.151A298 298 0 0 1 512 473l2-1c.428-10.103.238-18.735-6-27v-2l-1.687-.812C504 441 504 441 501.5 439.375c-2.609-1.696-2.609-1.696-6.5-1.375v-2c-7.266 1.498-13.166 3.113-18 9-3.206 5.088-5.144 10.055-5.098 16.11l.01 2.285.026 2.355.013 2.402q.02 2.925.049 5.848c-5.807-.725-11.305-2.028-16.951-3.54-3.496-.908-6.826-1.572-10.428-1.897L441 468c-7.162-10.742-4.002-32.947-1.812-45.125.531-2.652 1.155-5.247 1.812-7.875l.488-1.955c7.427-28.739 24.967-51.418 46.184-71.557 1.55-1.404 1.55-1.404 1.328-3.488" />
      <path d="m565.063 583.188 3.2.212q3.872.264 7.737.6c-3.421 5.146-7.795 7.561-13.062 10.5l-2.597 1.47C535.295 610 535.295 610 523 610l-1 2c-1.898.379-1.898.379-4.375.563l-2.79.218L512 613l-2.336.281c-30.437 3.546-60.78-1.569-87.664-16.281a700 700 0 0 0-6-3v-2l-1.766-.344c-2.418-.71-3.96-1.669-5.984-3.156l-1.86-1.344L405 586v-1c25.63-3.041 25.63-3.041 36 4 25.273 13.816 57.357 13.511 84.5 6.125 10.636-3.259 10.636-3.259 20.433-8.406 6.492-4.164 11.576-4.194 19.13-3.532" />
    </svg>
  );
}

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handlePulse = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    target.classList.remove('ring-pulse-active');
    void target.offsetWidth;
    target.classList.add('ring-pulse-active');
  };

  // Fidget 1: Trading Simulator State
  const [shareCount, setShareCount] = useState(10);
  const sharePrice = 182.50;
  const initialCash = 10000;
  const totalCost = shareCount * sharePrice;
  const remainingCash = initialCash - totalCost;

  // Fidget 2: Streak State
  const [streakCount, setStreakCount] = useState(3);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [xp, setXp] = useState(1250);
  const [xpNotes, setXpNotes] = useState<string[]>([]);

  // Interactive FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeMilestone, setActiveMilestone] = useState<{ title: string; desc: string; icon: string } | null>(null);
  const [activeOrbId, setActiveOrbId] = useState<string | null>(null);
  const [linePath, setLinePath] = useState<string>("");

  const activeOrbIdRef = useRef<string | null>(null);
  const stableMilestonesRef = useRef<Record<string, { title: string; desc: string; icon: string }>>({});

  const generateRandomMilestone = () => {
    const types = ["TRADE", "STREAK", "TROPHY"];
    const type = types[Math.floor(Math.random() * types.length)];

    if (type === "TRADE") {
      const tickers = ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'TSM', 'JPM'];
      const ticker = tickers[Math.floor(Math.random() * tickers.length)];
      const shares = Math.floor(Math.random() * 20) + 2; // 2 to 21 shares
      const pricePerShare = Math.floor(Math.random() * 300) + 50; // $50 to $350
      const totalAmount = (shares * pricePerShare).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return {
        title: "Trades Executed!",
        desc: `Completed sandbox portfolio order: Bought ${shares} shares of ${ticker} for $${totalAmount} virtual cash.`,
        icon: "TrendingUp"
      };
    } else if (type === "STREAK") {
      const days = Math.floor(Math.random() * 60) + 5; // 5 to 64 days
      return {
        title: "Streak Milestones!",
        desc: `Flame is burning bright: Been on for ${days} days straight! Unlocked daily XP boost.`,
        icon: "Flame"
      };
    } else {
      const trophies = [
        { title: "First Trade", desc: "Execute your first trade." },
        { title: "Diamond Hands", desc: "Make a trade that holds significant value." },
        { title: "The Whale", desc: "Reach a net worth of $100,000." },
        { title: "Diversified", desc: "Hold 5 different stocks in your portfolio." },
        { title: "Day Trader", desc: "Execute 5 trades in a single day." },
        { title: "Risk Taker", desc: "Execute a single trade exceeding $10,000 value." },
        { title: "Pioneer", desc: "Read the latest stock analysis in the Market Explorer." },
        { title: "Community Leader", desc: "Send messages and exchange strategies in chat." },
        { title: "Bull Market", desc: "Achieve a portfolio performance over +15% total return." },
        { title: "Bear Survivor", desc: "Retain positive returns during active market downtrends." },
        { title: "Financial Guru", desc: "Complete detailed analysis on at least 10 different stocks." },
        { title: "High Roller", desc: "Complete 25 or more transactions since opening your account." },
        { title: "Shrewd Investor", desc: "Hold cash reserves equal to less than 10% of portfolio value." },
        { title: "Steady Hand", desc: "Retain a stock position for more than 5 market days." }
      ];
      const trophy = trophies[Math.floor(Math.random() * trophies.length)];
      return {
        title: "Trophy Earned!",
        desc: `Achievement Unlocked: '${trophy.title}' (${trophy.desc}).`,
        icon: "Trophy"
      };
    }
  };

  const selectOrb = (orbId: string) => {
    setActiveOrbId(orbId);
    activeOrbIdRef.current = orbId;
    const milestone = stableMilestonesRef.current[orbId];
    if (milestone) {
      setActiveMilestone(milestone);
    }
  };

  useEffect(() => {
    // Generate stable milestones for the unique orbs so they don't change per click
    const milestoneA = generateRandomMilestone();
    const milestoneB = generateRandomMilestone();

    stableMilestonesRef.current = {
      "orb-1-1": milestoneA,
      "orb-2-1": milestoneA,
      "orb-1-2": milestoneB,
      "orb-2-2": milestoneB
    };

    // Automatically select the first orb to kick off the loop
    selectOrb("orb-1-1");
  }, []);

  const faqs = [
    {
      q: "How does the paper trading simulator work?",
      a: "Trillium Finance matches live market feeds with $10,000 in virtual starting cash. Invest in AAPL, MSFT, and popular indices with absolutely zero financial risk."
    },
    {
      q: "Do I need to pay or link a credit card?",
      a: "No! Trillium Finance is 100% free and educational. We do not support real-money trading, deposit features, or credit card linkages."
    },
    {
      q: "How do streaks and XP rewards benefit me?",
      a: "Completing daily check-ins and financial quests earns you XP. Build your streak to unlock achievements, climb the rankings leaderboard, and showcase your trading mastery to the community."
    }
  ];

  // Seamless gently rolling Stock Market wave coordinates (less jarring curves)
  const staticPoints = [
    150, 153, 158, 162, 165, 163, 158, 152, 146, 142, 145, 150, 156, 163, 170,
    175, 182, 188, 192, 190, 185, 178, 170, 162, 155, 150, 148, 152, 158, 165,
    172, 180, 188, 195, 202, 210, 215, 222, 228, 232, 230, 225, 218, 210, 202,
    195, 188, 180, 172, 165, 158, 152, 148, 145, 142, 146, 152, 158, 163, 165,
    162, 158, 153, 150
  ];

  const minVal = Math.min(...staticPoints);
  const maxVal = Math.max(...staticPoints);
  const range = maxVal - minVal || 1;

  const xs = staticPoints.map((_, index) => (index / (staticPoints.length - 1)) * 1000);
  const ys = staticPoints.map((val) => 400 - ((val - minVal) / range) * 260 - 70);

  const pathD = staticPoints
    .map((val, index) => `${index === 0 ? 'M' : 'L'} ${xs[index]} ${ys[index]}`)
    .join(' ');

  const areaD = `${pathD} L 1000 400 L 0 400 Z`;

  useEffect(() => {
    if (!activeMilestone) {
      setLinePath("");
      return;
    }

    let frameId: number;
    const updateLine = () => {
      const parentEl = document.getElementById("graph-card-container");
      const popupEl = document.getElementById("popup-anchor");
      const activeId = activeOrbIdRef.current;
      if (!activeId) {
        frameId = requestAnimationFrame(updateLine);
        return;
      }

      const orbEl = document.querySelector(`[data-orb-id="${activeId}"]`);

      if (parentEl && popupEl && orbEl) {
        const parentRect = parentEl.getBoundingClientRect();
        const popupRect = popupEl.getBoundingClientRect();
        const orbRect = orbEl.getBoundingClientRect();

        const x2 = orbRect.left + orbRect.width / 2 - parentRect.left;
        const y2 = orbRect.top + orbRect.height / 2 - parentRect.top;

        // Bounded horizontal center
        const parentCenter = parentRect.width / 2;

        // If the current tracked orb has slid completely off-screen, auto-transition to the next one
        if (x2 < 0) {
          let nextId = "orb-1-1";
          if (activeId === "orb-1-1") nextId = "orb-1-2";
          else if (activeId === "orb-1-2") nextId = "orb-2-1";
          else if (activeId === "orb-2-1") nextId = "orb-2-2";
          else if (activeId === "orb-2-2") nextId = "orb-1-1";

          selectOrb(nextId);
          frameId = requestAnimationFrame(updateLine);
          return;
        }

        // Connect to the left or right edge of the popup depending on the orb's relative side
        const leftEdgeX = popupRect.left - parentRect.left;
        const rightEdgeX = popupRect.right - parentRect.left;
        const middleY = popupRect.top + popupRect.height / 2 - parentRect.top;

        let x1 = parentCenter;
        let y1 = parentRect.height - 180;

        if (popupRect && popupRect.width > 0) {
          if (x2 < parentCenter) {
            x1 = leftEdgeX; // orb is on the left half, connect to left side of popup
          } else {
            x1 = rightEdgeX; // orb is on the right half, connect to right side of popup
          }
          y1 = middleY;
        }

        // Curve out from the side of the popup and target the orb naturally
        const controlX1 = x1 + (x2 < parentCenter ? -120 : 120);
        const controlY1 = y1 - 40;
        const controlX2 = x2 + (x2 < parentCenter ? 60 : -60);
        const controlY2 = y2 + 80;

        const path = `M ${x1} ${y1} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${x2} ${y2}`;
        setLinePath(path);
      }
      frameId = requestAnimationFrame(updateLine);
    };

    updateLine();
    return () => cancelAnimationFrame(frameId);
  }, [activeMilestone]);

  // Ticker bar quotes state initialized with fallback default prices
  const [tickerQuotes, setTickerQuotes] = useState<Array<{ ticker: string; price: number; change: number }>>([
    { ticker: 'AAPL', price: 182.50, change: 1.24 },
    { ticker: 'MSFT', price: 415.60, change: 0.85 },
    { ticker: 'TSLA', price: 177.40, change: -2.10 },
    { ticker: 'NVDA', price: 120.50, change: 3.15 },
    { ticker: 'GOOGL', price: 175.20, change: 0.42 },
    { ticker: 'AMZN', price: 180.10, change: -0.45 }
  ]);

  useEffect(() => {
    let isMounted = true;
    async function fetchTickerData() {
      try {
        const quotes = await getMarketQuotes(['AAPL', 'MSFT', 'TSLA', 'NVDA', 'GOOGL', 'AMZN']);
        if (isMounted && quotes && quotes.length > 0) {
          const validQuotes = quotes.filter(q => q.price > 0);
          if (validQuotes.length > 0) {
            setTickerQuotes(validQuotes);
          }
        }
      } catch (err) {
        console.error('Failed to fetch Finnhub ticker quotes for landing page bar:', err);
      }
    }

    fetchTickerData();
    const interval = setInterval(fetchTickerData, 60000); // refresh every minute
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleCheckIn = () => {
    if (hasCheckedIn) return;
    setHasCheckedIn(true);
    setStreakCount((prev) => prev + 1);
    setXp((prev) => prev + 150);
    setXpNotes((prev) => [...prev, '+150 Streak XP!']);
    setTimeout(() => {
      setXpNotes((prev) => prev.slice(1));
    }, 2500);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-950 font-sans text-slate-100 select-none">
      
      {/* Dynamic Glassmorphic Ambient Glows */}
      <div className="absolute top-[-10%] left-[-15%] w-[55%] h-[55%] rounded-full bg-emerald-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[5%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[140px] pointer-events-none" />
      <div className="absolute top-[35%] left-[30%] w-[35%] h-[35%] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

      {/* Floating Glass Header */}
      <header className="relative z-50 max-w-[1700px] mx-auto px-4 sm:px-6 py-3.5 sm:py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 hover:opacity-90 transition-opacity">
          <div className="flex h-8 sm:h-9 w-8 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] shrink-0">
            <TrilliumLogoMark />
          </div>
          <span className="text-lg sm:text-xl font-black text-white tracking-wide whitespace-nowrap">
            Trillium <span className="text-emerald-400">Finance</span>
          </span>
        </Link>
        
        <div className="flex items-center gap-2.5 sm:gap-4">
          {!loading && user ? (
            <>
              <button
                onClick={async () => {
                  await signOut();
                  router.refresh();
                }}
                className="text-xs sm:text-sm font-bold text-slate-400 hover:text-red-400 transition-colors"
              >
                Logout
              </button>
              <Link href="/dashboard">
                <button className="px-3 sm:px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all">
                  Dashboard
                </button>
              </Link>
              <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
                <span className="text-sm font-semibold text-slate-200 hidden sm:inline-block">
                  {user.displayName || user.email?.split('@')[0] || 'User'}
                </span>
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="h-8 w-8 rounded-full border border-emerald-500/30 object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-xs font-black text-slate-950">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/signup">
                <button 
                  onMouseDown={handlePulse}
                  style={{ '--pulse-ring-color': 'rgba(16, 185, 129, 0.4)' } as React.CSSProperties}
                  className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-black transition-all duration-200 shadow-[0_4px_20px_rgba(16,185,129,0.35)] hover:-translate-y-[0.5px] hover:scale-[1.01] hover:brightness-105 active:scale-[0.99] active:translate-y-[0.5px]"
                >
                  Get Started
                </button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Infinite Horizontal Asset Ticker Bar */}
      <div className="w-full bg-slate-950/60 border-y border-white/5 backdrop-blur-md py-2.5 overflow-hidden relative z-40">
        <style>{`
          @keyframes ticker {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
        <div 
          className="flex gap-12 w-[200%] animate-[ticker_35s_linear_infinite]"
          style={{ animation: "ticker 35s linear infinite" }}
        >
          {/* Duplicate sets for seamless loop */}
          {[1, 2].map((setIndex) => (
            <div key={setIndex} className="flex justify-around items-center w-1/2 gap-8 text-xs font-bold text-slate-400">
              {tickerQuotes.map((item) => {
                const isPositive = item.change >= 0;
                return (
                  <span key={item.ticker} className="flex items-center gap-2">
                    {item.ticker}{' '}
                    <span className="text-white font-black">
                      ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>{' '}
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                        isPositive
                          ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                          : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                      }`}
                    >
                      {isPositive ? '+' : ''}{item.change.toFixed(2)}%
                    </span>
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <main className="relative z-10 max-w-[1700px] mx-auto px-6 pt-10 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* Left Side: Context & Call to Action */}
        <div className="lg:col-span-6 flex flex-col items-start text-left space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 backdrop-blur-md"
          >
            <Sparkles className="h-4 w-4 text-emerald-400" /> Virtual Portfolio Simulator & Quests
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.1]"
          >
            Master the Markets with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500">Zero Risk</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-400 text-base sm:text-lg font-medium leading-relaxed max-w-xl"
          >
            Trillium Finance matches live market asset feeds with gamified financial literacy challenges. Grow your virtual wealth, protect your streak, unlock achievement badges, and trade Apple, Microsoft, or ETFs in a complete sandbox.
          </motion.p>

          {/* Quick Context Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-2 gap-4 w-full max-w-md pt-2"
          >
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <Shield className="h-5 w-5 text-emerald-400 mb-1.5" />
              <div className="text-xs font-bold text-slate-200">100% Risk Free</div>
              <div className="text-[10px] text-slate-400 mt-0.5">$10k starting paper cash.</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <Layers className="h-5 w-5 text-blue-400 mb-1.5" />
              <div className="text-xs font-bold text-slate-200">Interactive Lessons</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Learn finance, earn legendary badges.</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap gap-4 items-center pt-4"
          >
            {!loading && user ? (
              <Link href="/dashboard">
                <button 
                  onMouseDown={handlePulse}
                  style={{ '--pulse-ring-color': 'rgba(16, 185, 129, 0.4)' } as React.CSSProperties}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black transition-all duration-200 shadow-[0_4px_25px_rgba(16,185,129,0.3)] hover:-translate-y-[0.5px] hover:scale-[1.01] hover:brightness-105 active:scale-[0.99] active:translate-y-[0.5px]"
                >
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            ) : (
              <Link href="/signup">
                <button 
                  onMouseDown={handlePulse}
                  style={{ '--pulse-ring-color': 'rgba(16, 185, 129, 0.4)' } as React.CSSProperties}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black transition-all duration-200 shadow-[0_4px_25px_rgba(16,185,129,0.3)] hover:-translate-y-[0.5px] hover:scale-[1.01] hover:brightness-105 active:scale-[0.99] active:translate-y-[0.5px]"
                >
                  Start Trading Simulator <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            )}
          </motion.div>
        </div>

        {/* Right Side: Centered Interactive Sandbox */}
        <div className="lg:col-span-6 flex items-center justify-center relative w-full">
          {/* Foreground Simulator Widget, fully centered */}
          <div className="relative z-10 w-full max-w-[500px] p-6 md:p-8 rounded-[40px] bg-slate-900/85 border border-white/10 backdrop-blur-xl shadow-2xl space-y-6 flex flex-col items-stretch">
            {/* Ambient Background Glow inside the panel */}
            <div className="absolute -inset-px bg-gradient-to-r from-emerald-500/10 via-blue-500/15 to-purple-500/10 rounded-[40px] opacity-100 blur-xl pointer-events-none" />

            <div className="text-center pb-2 border-b border-white/5 relative z-10">
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                Interactive Sandbox Preview
              </span>
            </div>

            {/* Glass Card Widget 1: Mock Trading Transaction Fidget */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg relative z-10"
            >
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black tracking-widest text-emerald-400 uppercase">
                    SIMULATOR WIDGET
                  </span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <span className="text-xs text-slate-400 font-bold">Try Buying AAPL</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-slate-950/40 border border-white/5 rounded-2xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Estimated Cost</div>
                  <div className="text-lg font-black text-white mt-1">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div className="p-3 bg-slate-950/40 border border-white/5 rounded-2xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Virtual Cash Bal</div>
                  <div className="text-lg font-black text-emerald-400 mt-1">${remainingCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
              </div>

              {/* Slider control */}
              <div className="space-y-2.5 mt-2 bg-slate-950/20 p-4 border border-white/5 rounded-2xl">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>Shares: {shareCount}</span>
                  <span className="text-slate-400">AAPL Price: ${sharePrice}</span>
                </div>
                
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={shareCount}
                  onChange={(e) => setShareCount(parseInt(e.target.value))}
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-800 accent-emerald-400 focus:outline-none"
                />

                <div className="flex gap-2.5 pt-2.5">
                  <button
                    onClick={() => setShareCount((prev) => Math.max(1, prev - 1))}
                    className="flex-1 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex justify-center items-center font-black"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setShareCount((prev) => Math.min(100, prev + 1))}
                    className="flex-1 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex justify-center items-center font-black"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Glass Card Widget 2: Interactive Streak Counter Fidget */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg relative overflow-hidden z-10"
            >
              {/* Notification alert floating */}
              <AnimatePresence>
                {xpNotes.map((note, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute top-4 right-4 bg-emerald-500 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-xl shadow-xl z-30"
                  >
                    {note}
                  </motion.div>
                ))}
              </AnimatePresence>

              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500 fill-orange-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-200">Daily Quest Fidget</span>
                </div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Claim Streak</span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Total Account XP</div>
                  <div className="text-xl font-black tracking-tight text-white mt-0.5">
                    {xp} <span className="text-xs font-medium text-slate-500">XP</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckIn}
                  disabled={hasCheckedIn}
                  onMouseDown={handlePulse}
                  style={{ '--pulse-ring-color': 'rgba(249, 115, 22, 0.4)' } as React.CSSProperties}
                  className={`px-4 py-2 rounded-lg text-xs font-black transition-all duration-200 ${
                    hasCheckedIn
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-default'
                      : 'bg-orange-500 hover:bg-orange-400 text-slate-950 shadow-[0_4px_15px_rgba(249,115,22,0.3)] hover:-translate-y-[0.5px] hover:scale-[1.01] hover:brightness-105 active:scale-[0.99] active:translate-y-[0.5px]'
                  }`}
                >
                  {hasCheckedIn ? 'Checked In ✓' : 'Daily Check-In'}
                </button>
              </div>

              {/* Streak row indicator */}
              <div className="flex gap-1.5 mt-4">
                {[...Array(7)].map((_, i) => {
                  const dayNum = i + 1;
                  const isClaimed = dayNum <= streakCount;
                  return (
                    <div
                      key={i}
                      className={`flex-1 h-8 rounded-lg flex flex-col justify-center items-center text-[9px] font-black border transition-all duration-300 ${
                        isClaimed
                          ? 'bg-gradient-to-br from-orange-500 to-amber-600 border-orange-500 text-slate-950 scale-105'
                          : 'bg-slate-950/40 border-white/10 text-slate-500'
                      }`}
                    >
                      <span>D{dayNum}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Stock Market Graph Container (Seamless smooth scrolling ticker with zero empty scroll space) */}
      <div className="relative w-full max-w-[1700px] mx-auto px-6 mb-24 mt-8">
        <motion.div 
          id="graph-card-container"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="relative w-full min-h-[60vh] p-8 md:p-16 rounded-[40px] bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/20 backdrop-blur-xl overflow-hidden shadow-[0_0_80px_rgba(16,185,129,0.2)] group flex flex-col justify-between"
        >
          {/* Container background glow */}
          <div className="absolute -inset-px bg-gradient-to-r from-emerald-500/10 via-teal-500/15 to-blue-500/10 rounded-[40px] opacity-100 group-hover:opacity-150 blur-2xl transition-all duration-500 pointer-events-none" />
          
          {/* Seamless Automatic Stock Chart in Background (Hardware-accelerated sliding divs) */}
          <div className="absolute inset-0 z-0 opacity-45 group-hover:opacity-65 transition-opacity duration-500 overflow-hidden">
            {/* Inject CSS rule for smooth sliding keyframes */}
            <style>{`
              @keyframes slideChart {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
            `}</style>
            
            <div 
              className="flex w-[200%] h-full pointer-events-auto"
              style={{
                animation: "slideChart 40s linear infinite"
              }}
            >
              {/* First Half */}
              <div className="w-1/2 h-full relative">
                <svg className="w-full h-full pointer-events-none" viewBox="0 0 1000 400" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#059669" />
                      <stop offset="50%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                  
                  {/* Area Gradient Fill */}
                  <path d={areaD} fill="url(#chartGrad)" />
                  
                  {/* Smooth stock wave path */}
                  <path 
                    d={pathD} 
                    fill="none" 
                    stroke="url(#lineGrad)" 
                    strokeWidth="4.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>

                {/* Orb 1: Trades Executed Milestone */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    selectOrb("orb-1-1");
                  }}
                  data-orb-id="orb-1-1"
                  className={`absolute cursor-pointer pointer-events-auto group/orb z-30 flex items-center justify-center ${activeOrbId === "orb-1-1" ? "active-orb" : ""}`}
                  style={{
                    left: `${(xs[14] / 1000) * 100}%`,
                    top: `${(ys[14] / 400) * 100}%`,
                    transform: "translate(-50%, -50%)",
                    width: "28px",
                    height: "28px"
                  }}
                >
                  <span className="absolute h-7 w-7 rounded-full bg-blue-500/35 animate-ping" />
                  <div className="h-4 w-4 rounded-full bg-blue-500 border-2 border-white shadow-[0_0_15px_#3b82f6] group-hover/orb:scale-125 transition-transform" />
                </button>

                {/* Orb 2: Daily Streak Milestone */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    selectOrb("orb-1-2");
                  }}
                  data-orb-id="orb-1-2"
                  className={`absolute cursor-pointer pointer-events-auto group/orb z-30 flex items-center justify-center ${activeOrbId === "orb-1-2" ? "active-orb" : ""}`}
                  style={{
                    left: `${(xs[38] / 1000) * 100}%`,
                    top: `${(ys[38] / 400) * 100}%`,
                    transform: "translate(-50%, -50%)",
                    width: "28px",
                    height: "28px"
                  }}
                >
                  <span className="absolute h-7 w-7 rounded-full bg-blue-500/35 animate-ping" />
                  <div className="h-4 w-4 rounded-full bg-blue-500 border-2 border-white shadow-[0_0_15px_#3b82f6] group-hover/orb:scale-125 transition-transform" />
                </button>
              </div>

              {/* Second Half (Exact duplicate for seamless looping transition) */}
              <div className="w-1/2 h-full relative">
                <svg className="w-full h-full pointer-events-none" viewBox="0 0 1000 400" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGradDup" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="lineGradDup" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#059669" />
                      <stop offset="50%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                  
                  {/* Area Gradient Fill */}
                  <path d={areaD} fill="url(#chartGradDup)" />
                  
                  {/* Smooth stock wave path */}
                  <path 
                    d={pathD} 
                    fill="none" 
                    stroke="url(#lineGradDup)" 
                    strokeWidth="4.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>

                {/* Orb 1 (Dup) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    selectOrb("orb-2-1");
                  }}
                  data-orb-id="orb-2-1"
                  className={`absolute cursor-pointer pointer-events-auto group/orb z-30 flex items-center justify-center ${activeOrbId === "orb-2-1" ? "active-orb" : ""}`}
                  style={{
                    left: `${(xs[14] / 1000) * 100}%`,
                    top: `${(ys[14] / 400) * 100}%`,
                    transform: "translate(-50%, -50%)",
                    width: "28px",
                    height: "28px"
                  }}
                >
                  <span className="absolute h-7 w-7 rounded-full bg-blue-500/35 animate-ping" />
                  <div className="h-4 w-4 rounded-full bg-blue-500 border-2 border-white shadow-[0_0_15px_#3b82f6] group-hover/orb:scale-125 transition-transform" />
                </button>

                {/* Orb 2 (Dup) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    selectOrb("orb-2-2");
                  }}
                  data-orb-id="orb-2-2"
                  className={`absolute cursor-pointer pointer-events-auto group/orb z-30 flex items-center justify-center ${activeOrbId === "orb-2-2" ? "active-orb" : ""}`}
                  style={{
                    left: `${(xs[38] / 1000) * 100}%`,
                    top: `${(ys[38] / 400) * 100}%`,
                    transform: "translate(-50%, -50%)",
                    width: "28px",
                    height: "28px"
                  }}
                >
                  <span className="absolute h-7 w-7 rounded-full bg-blue-500/35 animate-ping" />
                  <div className="h-4 w-4 rounded-full bg-blue-500 border-2 border-white shadow-[0_0_15px_#3b82f6] group-hover/orb:scale-125 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic connection line between stationary popup and moving orb */}
          {activeMilestone && linePath && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
              <path
                d={linePath}
                fill="none"
                stroke="url(#lineGrad)"
                strokeWidth="3.5"
                strokeDasharray="8 4"
                className="animate-[dash_2s_linear_infinite]"
              />
              <style>{`
                @keyframes dash {
                  to {
                    stroke-dashoffset: -20;
                  }
                }
              `}</style>
            </svg>
          )}

          {/* Foreground content */}
          <div className="relative z-10 flex flex-col items-center text-center justify-center my-auto max-w-3xl mx-auto space-y-6 pt-12 pointer-events-auto">
            <h2 className="text-5xl md:text-7xl font-black tracking-tight text-white">
              Trillium <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500">Finance</span>
            </h2>
            
            <p className="text-slate-200 text-xl md:text-3xl font-extrabold leading-relaxed tracking-wide">
              Gamified Financial literacy for all ages, where you have fun while learning
            </p>

            <div className="flex flex-col items-center gap-4 w-full">

              {/* Pop-up Anchor directly under the Join Now button */}
              <div id="popup-anchor" className="w-full max-w-md relative z-40 mt-4 h-[120px]">
                <AnimatePresence>
                  {activeMilestone && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      className="p-5 rounded-2xl bg-[#0b0f19]/90 border border-emerald-500/30 shadow-2xl shadow-emerald-500/5 text-left space-y-2 relative backdrop-blur-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                            {activeMilestone.icon === 'TrendingUp' && <TrendingUp className="h-5 w-5" />}
                            {activeMilestone.icon === 'Flame' && <Flame className="h-5 w-5" />}
                            {activeMilestone.icon === 'Trophy' && <Trophy className="h-5 w-5" />}
                          </div>
                          <h4 className="text-sm font-black text-white tracking-tight">{activeMilestone.title}</h4>
                        </div>
                        <button 
                          onClick={() => {
                            setActiveMilestone(null);
                            setActiveOrbId(null);
                          }}
                          className="text-slate-400 hover:text-white text-[10px] font-bold px-2 py-1 rounded bg-slate-800 transition-colors"
                        >
                          ✕ Close
                        </button>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-medium">{activeMilestone.desc}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 3 Pillars Section (Between Sliding Graph and FAQ) */}
      <section className="relative z-10 max-w-[1700px] mx-auto px-6 mb-24">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-xs font-black uppercase text-emerald-400 tracking-widest mb-3">
            ALL-IN-ONE EDUCATION
          </h2>
          <p className="text-3xl font-black text-white tracking-tight">
            Our Key Financial Literacy Pillars
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Virtual Trading Feed */}
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 shadow-xl hover:-translate-y-1.5 hover:shadow-[0_10px_30px_rgba(16,185,129,0.1)] hover:border-emerald-500/30 transition-all duration-300 backdrop-blur-md">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 inline-block mb-6">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-white tracking-tight mb-3">
              Virtual Trading Feed
            </h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Practice trading AAPL, MSFT, and other popular instruments with real-time price feeds using virtual starting cash. Zero risk, high reward.
            </p>
          </div>

          {/* Card 2: Gamified Quizzes */}
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 shadow-xl hover:-translate-y-1.5 hover:shadow-[0_10px_30px_rgba(59,130,246,0.1)] hover:border-blue-500/30 transition-all duration-300 backdrop-blur-md">
            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 inline-block mb-6">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-white tracking-tight mb-3">
              Gamified Quizzes
            </h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Complete structured lessons on compounding interest, stock indices, and macroeconomics. Build streaks to earn daily XP boosts.
            </p>
          </div>

          {/* Card 3: Badges & Achievements */}
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 shadow-xl hover:-translate-y-1.5 hover:shadow-[0_10px_30px_rgba(168,85,247,0.1)] hover:border-purple-500/30 transition-all duration-300 backdrop-blur-md">
            <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 inline-block mb-6">
              <Trophy className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-white tracking-tight mb-3">
              Badges & Achievements
            </h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Unlock trophies as you execute smart trades, master quizzes, and rise through the global leaderboards. Showcase achievements to the community.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section (Interactive element that makes it look more professional) */}
      <section className="relative z-10 max-w-[1700px] mx-auto px-6 py-20 border-t border-white/5 bg-slate-950/40 backdrop-blur-sm [perspective:1200px]">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-xs font-black uppercase text-blue-400 tracking-widest mb-3">
            QUESTIONS & ANSWERS
          </h2>
          <p className="text-3xl font-black text-white tracking-tight">
            Frequently Asked Questions
          </p>
        </div>

        <div className="max-w-[1700px] mx-auto space-y-6">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div 
                key={index}
                className={`grid grid-cols-1 ${isOpen ? 'lg:grid-cols-2 lg:max-w-[1700px]' : 'max-w-3xl'} gap-0 transition-all duration-300 w-full mx-auto lg:h-28`}
              >
                <div 
                  className={`relative border bg-white/[0.02] backdrop-blur-md overflow-hidden transition-all duration-300 h-full ${
                    isOpen 
                      ? 'shadow-[0_8px_30px_rgba(16,185,129,0.08)] border-emerald-500/30 rounded-t-2xl lg:rounded-l-2xl lg:rounded-r-none border-b-0 lg:border-b lg:border-r-0' 
                      : 'border-white/10 rounded-2xl shadow-lg hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/5 hover:border-emerald-500/30'
                  }`}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex justify-between items-center p-6 text-left font-bold text-white hover:bg-white/5 transition-colors relative z-10 h-full"
                  >
                    <span className="text-base font-black tracking-tight">{faq.q}</span>
                    <span className={`text-xs text-emerald-400 font-black px-3 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 transform transition-all duration-300 ${isOpen ? 'rotate-180 bg-emerald-500 text-slate-950 border-emerald-500' : ''}`}>
                      ▶
                    </span>
                  </button>
                </div>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      exit={{ opacity: 0, scaleX: 0 }}
                      transition={{ 
                        opacity: { duration: 0.2 },
                        scaleX: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
                      }}
                      style={{ transformOrigin: "left", transformStyle: "preserve-3d" }}
                      className="h-full rounded-b-2xl lg:rounded-r-2xl lg:rounded-l-none border border-t-0 lg:border-t lg:border-l-0 border-emerald-500/30 bg-[#0b0f19]/90 backdrop-blur-md shadow-[0_8px_30px_rgba(16,185,129,0.08)] overflow-hidden flex items-center"
                    >
                      <div className="p-6 text-sm text-slate-300 leading-relaxed font-medium">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-10 border-t border-white/5 bg-slate-950 text-center text-xs text-slate-500 font-bold">
        <p>© 2026 Trillium Finance. Safe sandbox environment for education purposes only.</p>
      </footer>

    </div>
  );
}
