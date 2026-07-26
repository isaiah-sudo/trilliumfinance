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
  ChevronRight,
  ShieldCheck,
  Activity,
  Award,
  Star,
  ChevronDown,
  ChevronLeft
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

function InteractiveDripDotGrid() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.offsetHeight || 1400);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    const mouse = { x: -1000, y: -1000, active: false };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const spacing = 22; // Dots slightly closer together
    const hoverRadius = 90; // Tighter hover activation range

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / spacing);
      const rows = Math.ceil(height / spacing);

      let heroCenterX = width / 2;
      let heroCenterY = 220;

      const heroEl = document.getElementById('hero-headline');
      if (heroEl && canvas) {
        const canvasRect = canvas.getBoundingClientRect();
        const heroRect = heroEl.getBoundingClientRect();
        heroCenterX = (heroRect.left + heroRect.width / 2) - canvasRect.left;
        heroCenterY = (heroRect.top + heroRect.height / 2) - canvasRect.top;
      }

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * spacing + spacing / 2;
          const y = j * spacing + spacing / 2;

          // Organic drip opacity taper as y increases down into simulator
          const verticalProgress = y / height;
          const fadeMultiplier = Math.max(0, 1 - Math.pow(verticalProgress, 1.6));

          if (fadeMultiplier <= 0) continue;

          // Check proximity to "Master the Markets with Zero Risk" headline
          const normDx = (x - heroCenterX) / Math.min(width * 0.44, 600);
          const normDy = (y - heroCenterY) / 220;
          const distSq = normDx * normDx + normDy * normDy;

          // Headline text region boost factor (dots behind headline are always slightly activated)
          let textBoost = 0;
          if (distSq <= 0.7) {
            textBoost = 1.0;
          } else if (distSq < 1.2) {
            textBoost = Math.pow(1.0 - (distSq - 0.7) / 0.5, 2);
          }

          // Idle state calculations:
          // Dots behind text are always slightly activated (~0.22 opacity emerald), others are barely noticeable (0.04)
          const baseOpacity = (0.04 + textBoost * 0.18) * fadeMultiplier;
          let targetRadius = 1.4 + textBoost * 0.6;
          let targetOpacity = baseOpacity;
          
          // Color: emerald tint for activated text dots, slate for standard dots
          let color = textBoost > 0.1
            ? `rgba(16, 185, 129, ${targetOpacity})`
            : `rgba(148, 163, 184, ${targetOpacity})`;

          // Interactive Mouse Hover Activation
          if (mouse.active) {
            const dx = mouse.x - x;
            const dy = mouse.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < hoverRadius) {
              const hoverFactor = 1 - dist / hoverRadius;
              const glowIntensity = Math.pow(hoverFactor, 2);
              
              targetRadius = (1.4 + textBoost * 0.6) + glowIntensity * 3.0;
              targetOpacity = Math.min(0.9, baseOpacity + glowIntensity * 0.85);
              color = `rgba(16, 185, 129, ${targetOpacity})`; // vibrant glowing emerald on hover
            }
          }

          ctx.beginPath();
          ctx.arc(x, y, targetRadius, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{
        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 65%, rgba(0,0,0,0) 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 65%, rgba(0,0,0,0) 100%)'
      }}
    />
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
  const [stockAssets, setStockAssets] = useState([
    { symbol: 'AAPL', name: 'Apple Inc.', price: 189.45, change: 3.8 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 124.50, change: 5.2 },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.20, change: -1.4 }
  ]);

  const [selectedSymbol, setSelectedSymbol] = useState<'AAPL' | 'NVDA' | 'TSLA'>('AAPL');
  const [virtualCash, setVirtualCash] = useState(10000);
  const [shareCount, setShareCount] = useState(10);
  const [orderToast, setOrderToast] = useState<string | null>(null);

  // Interactive Sample Quiz State
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  const currentAsset = stockAssets.find(a => a.symbol === selectedSymbol) || stockAssets[0];
  const maxShares = Math.max(1, Math.floor(virtualCash / currentAsset.price));
  const totalCost = shareCount * currentAsset.price;
  const remainingCash = virtualCash - totalCost;

  // Fidget 2: Trophy Showcase Carousel State
  const trophiesList = [
    { id: 1, title: 'Paper Pioneer', desc: 'Executed 1st virtual trade', icon: '🌱', xp: 100, unlocked: true },
    { id: 2, title: 'Market Wizard', desc: 'Hit $12,000 Portfolio Equity', icon: '🏆', xp: 250, unlocked: true },
    { id: 3, title: 'Streak Titan', desc: 'Maintained 7-Day Active Streak', icon: '🔥', xp: 150, unlocked: true },
    { id: 4, title: 'Diamond Hands', desc: 'Held Position Through Volatility', icon: '💎', xp: 300, unlocked: false },
    { id: 5, title: 'Bull Champ', desc: 'Reached 1,500 Total Account XP', icon: '👑', xp: 500, unlocked: false }
  ];

  const [activeTrophyIdx, setActiveTrophyIdx] = useState(1); // Default center highlighted trophy (Market Wizard)
  const [claimedTrophies, setClaimedTrophies] = useState<number[]>([1]);
  const [xp, setXp] = useState(1250);
  const [xpNotes, setXpNotes] = useState<string[]>([]);

  const handleClaimTrophy = (trophyId: number, trophyXp: number) => {
    if (claimedTrophies.includes(trophyId)) return;
    setClaimedTrophies(prev => [...prev, trophyId]);
    setXp(prev => prev + trophyXp);
    setXpNotes(prev => [...prev, `+${trophyXp} XP Unlocked! 🏆`]);
    setTimeout(() => {
      setXpNotes(prev => prev.slice(1));
    }, 2500);
  };

  // Interactive FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number>(0);
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
    },
    {
      q: "Where does Trillium Finance get its live market data?",
      a: "We connect to real-time market data feeds for top equities (like AAPL and MSFT) and major market indices, allowing you to practice strategies against authentic live price action."
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
            setStockAssets(prev => prev.map(asset => {
              const match = validQuotes.find(q => q.ticker === asset.symbol);
              return match ? { ...asset, price: match.price, change: match.change } : asset;
            }));
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

  const handleExecuteOrder = () => {
    if (totalCost > virtualCash || shareCount <= 0) return;
    setVirtualCash((prev) => prev - totalCost);
    setOrderToast(`Bought ${shareCount} shares of ${selectedSymbol}!`);
    setTimeout(() => {
      setOrderToast(null);
    }, 3000);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-950 font-sans text-slate-100 select-none">
      
      {/* Dynamic Glassmorphic Ambient Glows */}
      <div className="absolute top-[-10%] left-[-15%] w-[55%] h-[55%] rounded-full bg-emerald-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[5%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[140px] pointer-events-none" />
      <div className="absolute top-[35%] left-[30%] w-[35%] h-[35%] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

      {/* Sleek Professional 3-Part Glass Navbar */}
      <header className="w-full flex items-center justify-between px-6 py-4 bg-slate-950/80 backdrop-blur-lg border-b border-white/[0.08] sticky top-0 z-50">
        {/* Left: Logo & Brand Name + Quick Links */}
        <div className="flex items-center gap-8 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] shrink-0">
              <TrilliumLogoMark />
            </div>
            <span className="text-lg sm:text-xl font-black text-white tracking-wide whitespace-nowrap">
              Trillium <span className="text-emerald-400">Finance</span>
            </span>
          </Link>

          {/* Quick Nav Links (Positioned on Left next to Logo with White Text) */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-3 pl-4 border-l border-white/10">
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-white hover:text-emerald-400 text-sm font-bold transition-all duration-200 px-3 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => document.getElementById('simulator')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-white hover:text-emerald-400 text-sm font-bold transition-all duration-200 px-3 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
            >
              Simulator
            </button>
            <button
              onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-white hover:text-emerald-400 text-sm font-bold transition-all duration-200 px-3 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
            >
              FAQ
            </button>
          </nav>
        </div>

        {/* Right: User Profile & Primary Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {!loading && user ? (
            <>
              {/* Avatar Pill */}
              <div className="bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs font-medium text-slate-200 flex items-center gap-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-black text-slate-950">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="truncate max-w-[120px] font-semibold text-slate-200">
                  {user.displayName || user.email?.split('@')[0] || 'User'}
                </span>
              </div>

              {/* Primary Button */}
              <Link href="/dashboard">
                <button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-1.5 rounded-full text-xs shadow-sm transition-all cursor-pointer">
                  Dashboard
                </button>
              </Link>

              {/* Secondary Action */}
              <button
                onClick={async () => {
                  await signOut();
                  router.refresh();
                }}
                className="text-slate-400 hover:text-white text-xs px-2 font-medium transition-colors cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-slate-400 hover:text-white text-xs px-2.5 py-1.5 font-medium transition-colors">
                Sign In
              </Link>
              <Link href="/signup">
                <button
                  onMouseDown={handlePulse}
                  style={{ '--pulse-ring-color': 'rgba(16, 185, 129, 0.4)' } as React.CSSProperties}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-1.5 rounded-full text-xs shadow-sm transition-all cursor-pointer"
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
            <div key={setIndex} className="flex justify-around items-center w-1/2 gap-8 text-xs font-bold text-slate-300">
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

      {/* Interactive Hero & Simulator Background Bleed Container */}
      <div className="relative w-full overflow-hidden">
        <InteractiveDripDotGrid />

        {/* Hero Section - Robinhood Editorial Aesthetic with Dynamic Visuals & Ambient Lighting */}
        <main className="relative z-10 w-full px-4 md:px-8 lg:px-12 py-24 md:py-32 flex flex-col items-center justify-center text-center overflow-hidden bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))]">
          {/* Ambient Dark Radial Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] bg-emerald-500/[0.06] blur-[160px] pointer-events-none rounded-full" />

          <div className="flex flex-col items-center text-center max-w-4xl mx-auto relative z-10 space-y-6">
            <motion.h1
              id="hero-headline"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-white font-serif-editorial leading-[1.08]"
            >
              Master the Markets with Zero Risk
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-slate-300 text-lg sm:text-xl max-w-2xl mt-4 font-normal leading-relaxed"
            >
              Practice trading stocks and ETFs with live market data and gamified quests—100% free with zero real cash at risk.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="pt-4"
            >
              {user ? (
                <Link href="/dashboard">
                  <button
                    onMouseDown={handlePulse}
                    style={{ '--pulse-ring-color': 'rgba(16, 185, 129, 0.4)' } as React.CSSProperties}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-3.5 rounded-full text-sm md:text-base transition-all duration-300 shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] hover:scale-105 cursor-pointer inline-flex items-center gap-2"
                  >
                    Go to Dashboard <ArrowRight className="h-5 w-5" />
                  </button>
                </Link>
              ) : (
                <Link href="/signup">
                  <button
                    onMouseDown={handlePulse}
                    style={{ '--pulse-ring-color': 'rgba(16, 185, 129, 0.4)' } as React.CSSProperties}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-3.5 rounded-full text-sm md:text-base transition-all duration-300 shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] hover:scale-105 cursor-pointer inline-flex items-center gap-2"
                  >
                    Start Paper Trading <ArrowRight className="h-5 w-5" />
                  </button>
                </Link>
              )}
            </motion.div>
          </div>
        </main>

        {/* Sleek Section Divider 1 (Hero -> Simulator) */}
        <div className="w-full max-w-full px-4 md:px-12 py-6 relative z-20 flex items-center justify-center">
          <div className="h-px w-full bg-[linear-gradient(90deg,transparent_0%,rgba(16,185,129,0.35)_15%,rgba(16,185,129,0.35)_85%,transparent_100%)]" />
          <div className="absolute h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
        </div>

        {/* Interactive Feature Showcase Section (High-Converting 2-Card System) */}
        <section id="simulator" className="relative z-10 w-full px-4 md:px-8 lg:px-12 py-16">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            
            {/* Left Card: Interactive Demo (Centered Title at Top + Interactive Demo Underneath) */}
            <div className="p-6 md:p-8 rounded-3xl bg-slate-900/60 border border-emerald-500/30 backdrop-blur-xl shadow-[0_0_50px_rgba(16,185,129,0.15)] flex flex-col justify-between overflow-hidden relative group">
              {/* Ambient Background Glow */}
              <div className="absolute -inset-px bg-gradient-to-r from-emerald-500/10 via-blue-500/15 to-purple-500/10 rounded-3xl opacity-100 blur-xl pointer-events-none" />

              {/* Centered Text Header in Middle Top */}
              <div className="flex flex-col items-center text-center space-y-3 mb-6 relative z-10">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold shadow-inner">
                  <span>✨</span> Interactive Trading Demo
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  Experience the Sandbox Before You Sign Up
                </h2>
                <p className="text-slate-300 text-xs md:text-sm max-w-md leading-relaxed">
                  Test live paper trading execution and unlock trophy achievements in real time—100% free with $10,000 starting cash.
                </p>
              </div>

              {/* Interactive Sandbox Widgets Container */}
              <div className="space-y-5 relative z-10 flex-1 flex flex-col justify-between">
                {/* Header Feed Indicator */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                    LIVE PAPER TRADING DEMO
                  </span>
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Live Feed Active
                  </div>
                </div>

                {/* Glass Card Widget 1: Mock Trading Transaction Fidget */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="w-full p-4 md:p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg relative z-10 space-y-4"
                >
                  {/* Stock Selector Tabs */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-1.5">
                      {stockAssets.map((asset) => {
                        const isActive = selectedSymbol === asset.symbol;
                        return (
                          <button
                            key={asset.symbol}
                            onClick={() => {
                              setSelectedSymbol(asset.symbol as any);
                              setShareCount((prev) => Math.min(prev, Math.max(1, Math.floor(virtualCash / asset.price))));
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                              isActive
                                ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-white/5'
                            }`}
                          >
                            {asset.symbol}
                          </button>
                        );
                      })}
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-white">${currentAsset.price.toFixed(2)}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ml-1.5 ${
                        currentAsset.change >= 0 ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                      }`}>
                        {currentAsset.change >= 0 ? '+' : ''}{currentAsset.change}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-950/40 border border-white/5 rounded-2xl">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Estimated Cost</div>
                      <div className="text-base md:text-lg font-black text-white mt-0.5">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                    <div className="p-3 bg-slate-950/40 border border-white/5 rounded-2xl">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Virtual Cash Bal</div>
                      <div className="text-base md:text-lg font-black text-emerald-400 mt-0.5">${virtualCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                  </div>

                  {/* Slider control */}
                  <div className="space-y-2 bg-slate-950/20 p-3 border border-white/5 rounded-2xl">
                    <div className="flex justify-between text-xs font-bold text-slate-300">
                      <span>Shares: {shareCount}</span>
                      <span className="text-slate-400">Max Shares: {maxShares}</span>
                    </div>
                    
                    <input
                      type="range"
                      min="1"
                      max={maxShares}
                      value={shareCount}
                      onChange={(e) => setShareCount(parseInt(e.target.value))}
                      className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-800 accent-emerald-400 focus:outline-none"
                    />

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => setShareCount((prev) => Math.max(1, prev - 1))}
                        className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 font-bold transition-all border border-white/10 flex justify-center items-center cursor-pointer text-white text-xs"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShareCount((prev) => Math.min(maxShares, prev + 1))}
                        className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 font-bold transition-all border border-white/10 flex justify-center items-center cursor-pointer text-white text-xs"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Prominent Execute Paper Order Button */}
                  <div className="relative">
                    <button
                      onClick={handleExecuteOrder}
                      disabled={virtualCash < totalCost}
                      className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                        virtualCash >= totalCost
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.01]'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                      }`}
                    >
                      Execute Paper Order
                    </button>

                    {/* Toast Notification */}
                    <AnimatePresence>
                      {orderToast && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="absolute -top-12 left-1/2 -translate-x-1/2 bg-emerald-400 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-xl shadow-2xl border border-white/20 whitespace-nowrap z-30"
                        >
                          ✅ {orderToast}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* Glass Card Widget 2: Interactive Trophy Showcase Carousel */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg relative overflow-hidden z-10 space-y-3"
                >
                  {/* Floating Notification alert */}
                  <AnimatePresence>
                    {xpNotes.map((note, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute top-3 right-4 bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-xl shadow-xl z-30"
                      >
                        {note}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-amber-400 fill-amber-400/20" />
                      <span className="text-xs font-bold text-slate-200">Trophy Showcase</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold block">Account XP</span>
                      <span className="text-xs font-black text-amber-400">{xp} XP</span>
                    </div>
                  </div>

                  {/* 3 Trophy Row Showcase with Center Highlight */}
                  <div className="relative flex items-center justify-between gap-2 py-0.5">
                    {/* Prev Button */}
                    <button
                      onClick={() => setActiveTrophyIdx(prev => Math.max(0, prev - 1))}
                      disabled={activeTrophyIdx === 0}
                      className={`p-1.5 rounded-xl border transition-all z-20 cursor-pointer ${
                        activeTrophyIdx > 0
                          ? 'bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-white border-white/10'
                          : 'bg-slate-900/50 text-slate-600 border-white/5 cursor-not-allowed'
                      }`}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    {/* Row of 3 Trophies Container */}
                    <div className="flex-1 grid grid-cols-3 gap-2 items-center justify-center">
                      {[-1, 0, 1].map((offset) => {
                        const idx = activeTrophyIdx + offset;
                        const trophy = trophiesList[idx];
                        if (!trophy) {
                          return <div key={offset} className="h-20 rounded-2xl bg-slate-950/20 border border-white/5 opacity-30" />;
                        }

                        const isCenter = offset === 0;
                        const isClaimed = claimedTrophies.includes(trophy.id);

                        return (
                          <motion.div
                            key={trophy.id}
                            layout
                            onClick={() => setActiveTrophyIdx(idx)}
                            className={`p-2.5 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer relative ${
                              isCenter
                                ? 'bg-gradient-to-b from-amber-500/20 to-amber-950/40 border-amber-400/60 text-white shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/40 scale-105 z-10'
                                : 'bg-slate-950/40 border-white/10 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 scale-95 opacity-60'
                            }`}
                          >
                            <div className={`text-xl mb-0.5 transition-transform ${isCenter ? 'scale-110' : ''}`}>
                              {trophy.icon}
                            </div>

                            <div className={`text-[10px] font-black tracking-tight leading-tight line-clamp-1 ${isCenter ? 'text-amber-300' : 'text-slate-300'}`}>
                              {trophy.title}
                            </div>

                            <div className="text-[8px] text-slate-400 font-medium line-clamp-1 mt-0.5">
                              {trophy.desc}
                            </div>

                            {isCenter && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClaimTrophy(trophy.id, trophy.xp);
                                }}
                                disabled={isClaimed}
                                className={`mt-1.5 px-2 py-0.5 rounded-md text-[8px] font-black transition-all cursor-pointer whitespace-nowrap ${
                                  isClaimed
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-400/30'
                                }`}
                              >
                                {isClaimed ? 'Claimed ✓' : `Unlock +${trophy.xp} XP`}
                              </button>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={() => setActiveTrophyIdx(prev => Math.min(trophiesList.length - 1, prev + 1))}
                      disabled={activeTrophyIdx === trophiesList.length - 1}
                      className={`p-1.5 rounded-xl border transition-all z-20 cursor-pointer ${
                        activeTrophyIdx < trophiesList.length - 1
                          ? 'bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-white border-white/10'
                          : 'bg-slate-900/50 text-slate-600 border-white/5 cursor-not-allowed'
                      }`}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Right Card: Interactive Sample Lesson (Safe Investing vs. Risky Investing) */}
            <div className="p-6 md:p-8 rounded-3xl bg-slate-900/60 border border-emerald-500/30 backdrop-blur-xl shadow-[0_0_50px_rgba(16,185,129,0.15)] flex flex-col justify-between overflow-hidden relative group">
              {/* Ambient Background Glow */}
              <div className="absolute -inset-px bg-gradient-to-r from-blue-500/10 via-teal-500/15 to-emerald-500/10 rounded-3xl opacity-100 blur-xl pointer-events-none" />

              <div className="space-y-5 relative z-10 flex-1 flex flex-col justify-between">
                {/* Header Text */}
                <div className="flex flex-col items-start space-y-2 pb-3 border-b border-white/10">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold shadow-inner">
                    <span>📚</span> Interactive Lesson Preview
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                    Safe Investing vs. Risky Investing
                  </h2>
                  <p className="text-white text-xs md:text-sm leading-relaxed font-normal">
                    Master essential portfolio risk management, asset allocation strategies, and historical market volatility.
                  </p>
                </div>

                {/* Comparative Graph Example Visualization */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span>10-Year Portfolio Performance Comparison</span>
                    <span className="text-emerald-400 text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Live Graph</span>
                  </div>

                  {/* SVG Chart Graphic */}
                  <div className="relative h-40 w-full bg-slate-950/70 rounded-xl p-3 border border-white/5 overflow-hidden flex flex-col justify-between">
                    <svg className="absolute inset-0 w-full h-full p-2" viewBox="0 0 400 140" preserveAspectRatio="none">
                      {/* Grid Lines */}
                      <line x1="0" y1="35" x2="400" y2="35" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                      <line x1="0" y1="70" x2="400" y2="70" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                      <line x1="0" y1="105" x2="400" y2="105" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />

                      {/* Safe Investing Curve (Emerald - Smooth Compound Growth) */}
                      <path
                        d="M 10 120 Q 120 105, 230 70 T 390 20"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />

                      {/* Risky Investing Line (Rose Red - Wild Volatile Spikes & Dips) */}
                      <path
                        d="M 10 120 L 55 35 L 95 125 L 145 15 L 195 135 L 255 25 L 315 110 L 390 60"
                        fill="none"
                        stroke="#f43f5e"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeDasharray="6 3"
                      />
                    </svg>

                    {/* Chart Legend Pills */}
                    <div className="relative z-10 flex items-center justify-between text-[10px] md:text-[11px] font-bold">
                      <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-emerald-500/30 text-emerald-400 shadow-md">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        Safe Portfolio (+6.5%/yr Compound)
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-rose-500/30 text-rose-400 shadow-md">
                        <span className="h-2 w-2 rounded-full bg-rose-400" />
                        Risky Asset (+45% / -60% Volatility)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lesson Key Summary Section */}
                <div className="p-4 rounded-2xl bg-slate-950/50 border border-white/10 space-y-2">
                  <div className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <span>💡</span> Lesson Summary & Key Takeaways
                  </div>
                  <ul className="text-xs text-white space-y-1.5 list-disc pl-4 font-normal">
                    <li><strong className="text-white font-bold">Safe Investing:</strong> Broad-market ETFs & bonds reduce risk through steady long-term compounding.</li>
                    <li><strong className="text-white font-bold">Risky Investing:</strong> Un-hedged single stocks or crypto offer high yields but carry severe drawdown potential.</li>
                  </ul>
                </div>

                {/* Interactive End-of-Lesson Quiz at the Very Bottom */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                      <span>🧠</span> End-of-Lesson Knowledge Check
                    </span>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">+50 XP Reward</span>
                  </div>

                  <p className="text-xs font-bold text-white">
                    Question: Which portfolio strategy minimizes drawdown volatility while building reliable long-term wealth?
                  </p>

                  <div className="space-y-2">
                    {[
                      { id: 0, text: 'A) 100% High-leverage meme stock options', isCorrect: false },
                      { id: 1, text: 'B) Diversified index funds & bonds (Safe Portfolio)', isCorrect: true },
                      { id: 2, text: 'C) Uninvested cash held under the mattress', isCorrect: false }
                    ].map((opt) => {
                      const isSelected = quizAnswer === opt.id;
                      let btnStyle = 'bg-slate-950/60 text-slate-200 border-white/10 hover:border-emerald-500/40';
                      if (isSelected) {
                        if (opt.isCorrect) {
                          btnStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
                        } else {
                          btnStyle = 'bg-rose-500/20 text-rose-300 border-rose-400';
                        }
                      }

                      return (
                        <button
                          key={opt.id}
                          onClick={() => setQuizAnswer(opt.id)}
                          className={`w-full text-left p-2.5 rounded-xl border text-xs font-medium transition-all duration-200 cursor-pointer flex items-center justify-between ${btnStyle}`}
                        >
                          <span className="text-white font-semibold">{opt.text}</span>
                          {isSelected && (
                            <span className="font-extrabold text-xs shrink-0 ml-2">
                              {opt.isCorrect ? '✓ Correct! (+50 XP)' : '✕ Incorrect'}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>
      </div>

      {/* Sleek Section Divider 2 (Simulator -> Chart Timeline) */}
      <div className="w-full max-w-full px-4 md:px-12 py-6 relative z-20 flex items-center justify-center">
        <div className="h-px w-full bg-[linear-gradient(90deg,transparent_0%,rgba(16,185,129,0.35)_15%,rgba(16,185,129,0.35)_85%,transparent_100%)]" />
        <div className="absolute h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
      </div>

      {/* Stock Market Graph Container (Polished Animated Chart Timeline) */}
      <div className="relative w-full px-4 md:px-8 lg:px-12 mb-16 mt-4">
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
          <div className="absolute inset-0 z-0 opacity-55 group-hover:opacity-75 transition-opacity duration-500 overflow-hidden">
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
                    <linearGradient id="chart-fade" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="emerald-cyan-gradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="50%" stopColor="#06B6D4" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                  </defs>
                  
                  {/* Area Gradient Fill */}
                  <path d={areaD} fill="url(#chart-fade)" />
                  
                  {/* Smooth stock wave path with Dual-Tone Gradient */}
                  <path 
                    d={pathD} 
                    fill="none" 
                    stroke="url(#emerald-cyan-gradient)" 
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
                    width: "32px",
                    height: "32px"
                  }}
                >
                  <span className="relative flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 shadow-[0_0_15px_#10b981]"></span>
                  </span>
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
                    width: "32px",
                    height: "32px"
                  }}
                >
                  <span className="relative flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500 shadow-[0_0_15px_#06b6d4]"></span>
                  </span>
                </button>
              </div>

              {/* Second Half (Exact duplicate for seamless looping transition) */}
              <div className="w-1/2 h-full relative">
                <svg className="w-full h-full pointer-events-none" viewBox="0 0 1000 400" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chart-fade-dup" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="emerald-cyan-gradient-dup" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="50%" stopColor="#06B6D4" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                  </defs>
                  
                  {/* Area Gradient Fill */}
                  <path d={areaD} fill="url(#chart-fade-dup)" />
                  
                  {/* Smooth stock wave path */}
                  <path 
                    d={pathD} 
                    fill="none" 
                    stroke="url(#emerald-cyan-gradient-dup)" 
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
                    width: "32px",
                    height: "32px"
                  }}
                >
                  <span className="relative flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 shadow-[0_0_15px_#10b981]"></span>
                  </span>
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
                    width: "32px",
                    height: "32px"
                  }}
                >
                  <span className="relative flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500 shadow-[0_0_15px_#06b6d4]"></span>
                  </span>
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
                stroke="url(#emerald-cyan-gradient)"
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

          {/* Feathered Radial Blur Mask Layer behind Text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div 
              className="w-full h-full max-w-3xl bg-slate-950/80 backdrop-blur-md"
              style={{
                maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
                WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)'
              }}
            />
          </div>

          {/* Foreground Centerpiece Text Content */}
          <div className="relative z-10 flex flex-col items-center text-center justify-center my-auto max-w-2xl mx-auto p-6 md:p-10 space-y-4 pointer-events-auto">
            <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-semibold px-4 py-1.5 rounded-full text-xs tracking-wider uppercase inline-block shadow-[0_0_12px_rgba(16,185,129,0.3)]">
              🚀 Gamified Learning Journey
            </div>
            
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
              Track Your Progress as You Master the Market
            </h2>
            
            <p className="text-slate-200 text-base md:text-lg leading-relaxed font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] max-w-xl">
              Earn achievement badges, hit daily streaks, and watch your virtual portfolio scale.
            </p>

            <div className="flex flex-col items-center gap-4 w-full pt-4">
              {/* Pop-up Anchor directly under the text container */}
              <div id="popup-anchor" className="w-full max-w-md relative z-40 h-[120px]">
                <AnimatePresence>
                  {activeMilestone && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.25)] text-xs font-medium text-slate-200 text-left space-y-2 relative backdrop-blur-md"
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
                          className="text-slate-400 hover:text-white text-[10px] font-bold px-2 py-1 rounded bg-slate-800 transition-colors cursor-pointer"
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

      {/* Sleek Section Divider 3 (Chart Timeline -> 3 Pillars Features) */}
      <div className="w-full max-w-full px-4 md:px-12 py-6 relative z-20 flex items-center justify-center mb-6">
        <div className="h-px w-full bg-[linear-gradient(90deg,transparent_0%,rgba(16,185,129,0.35)_15%,rgba(16,185,129,0.35)_85%,transparent_100%)]" />
        <div className="absolute h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
      </div>

      {/* 3 Pillars Section (Between Sliding Graph and FAQ) */}
      <section id="features" className="relative z-10 w-full px-4 md:px-8 lg:px-12 mb-20">
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
          <div className="group relative overflow-hidden p-8 rounded-3xl bg-slate-900/60 border border-white/[0.08] shadow-2xl hover:-translate-y-1.5 hover:shadow-[0_10px_30px_rgba(16,185,129,0.15)] hover:border-emerald-500/30 transition-all duration-300 backdrop-blur-xl">
            {/* Center Watermark Logo starting off-container and animating to top-right */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
              <svg 
                className="w-full h-full max-w-[320px] max-h-[320px] p-2 text-emerald-400 opacity-0 scale-60 -translate-x-16 translate-y-16 group-hover:opacity-10 group-hover:scale-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-600 ease-out" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path 
                  d="M2 17L8.5 10.5L13.5 15.5L22 7" 
                  className="[stroke-dasharray:40] [stroke-dashoffset:40] group-hover:[stroke-dashoffset:0] transition-all duration-500 ease-out"
                />
                <polyline 
                  points="16 7 22 7 22 13" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-150" 
                />
              </svg>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 inline-block mb-6 relative z-10 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-white tracking-tight mb-3 relative z-10">
              Virtual Trading Feed
            </h3>
            <p className="text-slate-300 text-sm font-medium leading-relaxed relative z-10">
              Practice trading AAPL, MSFT, and other popular instruments with real-time price feeds using virtual starting cash. Zero risk, high reward.
            </p>
          </div>

          {/* Card 2: Gamified Quizzes */}
          <div className="group relative overflow-hidden p-8 rounded-3xl bg-slate-900/60 border border-white/[0.08] shadow-2xl hover:-translate-y-1.5 hover:shadow-[0_10px_30px_rgba(59,130,246,0.15)] hover:border-blue-500/30 transition-all duration-300 backdrop-blur-xl">
            {/* Center Watermark Logo - Fully Filling Container */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
              <GraduationCap className="w-full h-full max-w-[300px] max-h-[300px] p-2 text-blue-400 stroke-[1.25] opacity-0 scale-75 group-hover:opacity-10 group-hover:scale-100 transition-all duration-500 ease-out" />
            </div>

            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 inline-block mb-6 relative z-10 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-white tracking-tight mb-3 relative z-10">
              Gamified Quizzes
            </h3>
            <p className="text-slate-300 text-sm font-medium leading-relaxed relative z-10">
              Complete structured lessons on compounding interest, stock indices, and macroeconomics. Build streaks to earn daily XP boosts.
            </p>
          </div>

          {/* Card 3: Badges & Achievements */}
          <div className="group relative overflow-hidden p-8 rounded-3xl bg-slate-900/60 border border-white/[0.08] shadow-2xl hover:-translate-y-1.5 hover:shadow-[0_10px_30px_rgba(168,85,247,0.15)] hover:border-purple-500/30 transition-all duration-300 backdrop-blur-xl">
            {/* Center Watermark Logo - Fully Filling Container */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
              <Trophy className="w-full h-full max-w-[300px] max-h-[300px] p-2 text-purple-400 stroke-[1.25] opacity-0 scale-75 group-hover:opacity-10 group-hover:scale-100 transition-all duration-500 ease-out" />
            </div>

            <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 inline-block mb-6 relative z-10 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-300">
              <Trophy className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-white tracking-tight mb-3 relative z-10">
              Badges & Achievements
            </h3>
            <p className="text-slate-300 text-sm font-medium leading-relaxed relative z-10">
              Unlock trophies as you execute smart trades, master quizzes, and rise through the global leaderboards. Showcase achievements to the community.
            </p>
          </div>
        </div>
      </section>

      {/* Sleek Section Divider 4 (3 Pillars Features -> FAQ) */}
      <div className="w-full max-w-full px-4 md:px-12 py-6 relative z-20 flex items-center justify-center">
        <div className="h-px w-full bg-[linear-gradient(90deg,transparent_0%,rgba(16,185,129,0.35)_15%,rgba(16,185,129,0.35)_85%,transparent_100%)]" />
        <div className="absolute h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
      </div>

      {/* FAQ / Questions & Answers Section (Clean In-Place Expanding Accordion) */}
      <section id="faq" className="relative z-10 w-full px-4 md:px-8 lg:px-12 py-20">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-xs font-black uppercase text-emerald-400 tracking-widest mb-3">
            QUESTIONS & ANSWERS
          </h2>
          <p className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Frequently Asked Questions
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden backdrop-blur-xl ${
                  isOpen
                    ? 'bg-slate-900/90 border-emerald-500/50 shadow-[0_4px_30px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30'
                    : 'bg-slate-900/40 border-white/[0.08] hover:border-white/20 hover:bg-slate-900/60'
                }`}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? -1 : index)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left cursor-pointer group"
                >
                  <span className={`text-base sm:text-lg font-bold tracking-tight pr-4 transition-colors ${
                    isOpen ? 'text-emerald-400' : 'text-white group-hover:text-emerald-300'
                  }`}>
                    {faq.q}
                  </span>
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${
                      isOpen
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/30'
                        : 'bg-white/5 text-slate-400 border-white/10 group-hover:bg-white/10 group-hover:text-white'
                    }`}
                  >
                    <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="px-6 pb-6 pt-2 text-slate-300 text-sm sm:text-base leading-relaxed border-t border-white/5 font-normal">
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
