'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
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

export default function LandingPage() {
  // Fidget 1: Trading Simulator State
  const [shareCount, setShareCount] = useState(10);
  const sharePrice = 182.50;
  const initialCash = 100000;
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
      a: "Trillium Finance matches live market feeds with $100,000 in virtual starting cash. Invest in AAPL, MSFT, and popular indices with absolutely zero financial risk."
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
      <header className="relative z-50 max-w-[1700px] mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <TreePine className="h-5 w-5 text-slate-950" />
          </div>
          <span className="text-xl font-black text-white tracking-wide">
            Trillium <span className="text-emerald-400">Finance</span>
          </span>
        </Link>
        
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/signup">
            <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-black transition-all shadow-[0_4px_20px_rgba(16,185,129,0.35)] active:scale-95">
              Get Started
            </button>
          </Link>
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
              <span className="flex items-center gap-2">
                AAPL <span className="text-emerald-400 font-black">$182.50</span> <span className="text-[10px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">+1.24%</span>
              </span>
              <span className="flex items-center gap-2">
                MSFT <span className="text-emerald-400 font-black">$415.60</span> <span className="text-[10px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">+0.85%</span>
              </span>
              <span className="flex items-center gap-2">
                TSLA <span className="text-red-400 font-black">$177.40</span> <span className="text-[10px] text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-md">-2.10%</span>
              </span>
              <span className="flex items-center gap-2">
                BTC <span className="text-emerald-400 font-black">$69,420</span> <span className="text-[10px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">+4.55%</span>
              </span>
              <span className="flex items-center gap-2">
                ETH <span className="text-emerald-400 font-black">$3,812</span> <span className="text-[10px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">+3.12%</span>
              </span>
              <span className="flex items-center gap-2">
                AMZN <span className="text-red-400 font-black">$180.10</span> <span className="text-[10px] text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-md">-0.45%</span>
              </span>
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
              <div className="text-[10px] text-slate-400 mt-0.5">$100k starting paper cash.</div>
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
            <Link href="/signup">
              <button className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black transition-all shadow-[0_4px_25px_rgba(16,185,129,0.3)] active:scale-95">
                Start Trading Simulator <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
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
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    hasCheckedIn
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-default'
                      : 'bg-orange-500 hover:bg-orange-400 text-slate-950 shadow-[0_4px_15px_rgba(249,115,22,0.3)] hover:scale-105 active:scale-95'
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
                      className="p-5 rounded-2xl bg-[#0b0f19] border-2 border-emerald-500/30 shadow-2xl text-left space-y-2 relative"
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
          <div className="p-8 rounded-3xl bg-[#0b0f19]/80 border-2 border-white/10 shadow-[6px_6px_0px_rgba(255,255,255,0.06)] hover:-translate-y-1.5 hover:shadow-[8px_8px_0px_rgba(16,185,129,0.2)] hover:border-emerald-500/20 transition-all duration-300">
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
          <div className="p-8 rounded-3xl bg-[#0b0f19]/80 border-2 border-white/10 shadow-[6px_6px_0px_rgba(255,255,255,0.06)] hover:-translate-y-1.5 hover:shadow-[8px_8px_0px_rgba(59,130,246,0.2)] hover:border-blue-500/20 transition-all duration-300">
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
          <div className="p-8 rounded-3xl bg-[#0b0f19]/80 border-2 border-white/10 shadow-[6px_6px_0px_rgba(255,255,255,0.06)] hover:-translate-y-1.5 hover:shadow-[8px_8px_0px_rgba(168,85,247,0.2)] hover:border-purple-500/20 transition-all duration-300">
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

        <div className="max-w-3xl mx-auto space-y-6">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div 
                key={index}
                className={`relative rounded-2xl border-2 border-white/10 bg-[#0b0f19]/80 backdrop-blur-md overflow-visible transition-all duration-300 ${
                  isOpen 
                    ? 'shadow-[2px_2px_0px_rgba(16,185,129,0.3)] translate-x-[2px] translate-y-[2px] border-emerald-500/30' 
                    : 'shadow-[6px_6px_0px_rgba(255,255,255,0.06)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[8px_8px_0px_rgba(16,185,129,0.2)] hover:border-emerald-500/20'
                }`}
                style={{ transformStyle: "preserve-3d" }}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full flex justify-between items-center p-6 text-left font-bold text-white hover:bg-white/5 transition-colors relative z-10"
                >
                  <span className="text-base font-black tracking-tight">{faq.q}</span>
                  <span className={`text-xs text-emerald-400 font-black px-3 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 transform transition-all duration-300 ${isOpen ? 'rotate-180 bg-emerald-500 text-slate-950 border-emerald-500' : ''}`}>
                    ▼
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0, rotateX: -90 }}
                      animate={{ height: "auto", opacity: 1, rotateX: 0 }}
                      exit={{ height: 0, opacity: 0, rotateX: -90 }}
                      transition={{ 
                        height: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                        opacity: { duration: 0.2 },
                        rotateX: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
                      }}
                      style={{ transformOrigin: "top", transformStyle: "preserve-3d" }}
                      className="absolute top-full left-0 right-0 mt-1.5 z-30 rounded-2xl border-2 border-emerald-500/30 bg-[#0b0f19]/95 shadow-2xl overflow-hidden"
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
