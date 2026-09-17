'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronUp, 
  Lock, 
  Heart, 
  TreePine, 
  X, 
  Trophy, 
  Rocket, 
  Gem, 
  Crown, 
  PieChart, 
  Zap, 
  Flame, 
  GraduationCap, 
  ShieldAlert, 
  Edit3, 
  Check, 
  RotateCcw, 
  Plus,
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import PortfolioChart from '@/components/PortfolioChart';
import { getGraphData } from '@/app/actions/trading';
import { TimeRange } from '@/lib/portfolioTransformation';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { ACHIEVEMENTS, getUserAchievements } from '@/app/actions/achievements';
import { useSettings } from '@/context/SettingsContext';
import { AnimatedNumber } from '@/components/ui';
import { useDashboardSettings } from '@/context/DashboardSettingsContext';
import { useStockMarket } from '@/context/StockMarketContext';
import { safeRound, safeAdd, safeSubtract } from '@/lib/portfolioMath';
import { joinClassroom } from '@/app/actions/edu';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

import { Responsive, Layout } from 'react-grid-layout';
import { DEFAULT_WIDGET_LAYOUTS, WidgetLayoutItem, ResponsiveDashboardLayouts } from '@/lib/defaultDashboardLayout';
import DashboardWidgetCard from '@/components/dashboard/DashboardWidgetCard';
import { WIDGET_REGISTRY } from '@/components/dashboard/WidgetRegistry';
import GameDashboardLoader from '@/components/dashboard/GameDashboardLoader';
import CockpitPerimeterTrace from '@/components/dashboard/CockpitPerimeterTrace';
import WidgetPreviewCard from '@/components/dashboard/WidgetPreviewCard';


const LOCAL_STORAGE_LAYOUT_KEY = 'trillium_dashboard_layout_v2';

const sanitizeLayouts = (rawLayouts: ResponsiveDashboardLayouts): ResponsiveDashboardLayouts => {
  if (!rawLayouts || typeof rawLayouts !== 'object') return DEFAULT_WIDGET_LAYOUTS;

  const cleanItem = (item: WidgetLayoutItem): WidgetLayoutItem => {
    const cleaned: WidgetLayoutItem = {
      i: String(item.i),
      x: Number.isFinite(item.x) ? item.x : 0,
      y: Number.isFinite(item.y) ? item.y : 0,
      w: Number.isFinite(item.w) ? item.w : 6,
      h: Number.isFinite(item.h) ? item.h : 4,
      visible: item.visible !== false,
    };
    if (item.minW !== undefined) cleaned.minW = item.minW;
    if (item.maxW !== undefined) cleaned.maxW = item.maxW;
    if (item.minH !== undefined) cleaned.minH = item.minH;
    if (item.maxH !== undefined) cleaned.maxH = item.maxH;

    if (cleaned.i === 'account-summary') {
      cleaned.minW = Math.max(cleaned.minW || 0, 4);
      cleaned.minH = Math.max(cleaned.minH || 0, 4);
      if (cleaned.w < cleaned.minW) cleaned.w = cleaned.minW;
      if (cleaned.h < cleaned.minH) cleaned.h = cleaned.minH;
    }

    return cleaned;
  };

  const next: ResponsiveDashboardLayouts = {
    lg: Array.isArray(rawLayouts.lg) ? rawLayouts.lg.map(cleanItem) : [...DEFAULT_WIDGET_LAYOUTS.lg],
    md: Array.isArray(rawLayouts.md) ? rawLayouts.md.map(cleanItem) : [...DEFAULT_WIDGET_LAYOUTS.md],
    sm: Array.isArray(rawLayouts.sm) ? rawLayouts.sm.map(cleanItem) : [...DEFAULT_WIDGET_LAYOUTS.sm],
  };

  return next;
};

interface TrophyCardProps {
  id: string;
  title: string;
  description: string;
  iconType: string;
  difficulty?: 'gem' | 'gold' | 'silver' | 'copper';
  isSelected?: boolean;
  onClickAction?: () => void;
}

function TrophyCard({ id, title, description, iconType, difficulty, isSelected, onClickAction }: TrophyCardProps) {
  const { detailedTrophies } = useSettings();
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);



  const getDifficulty = (tid: string): 'gem' | 'gold' | 'silver' | 'copper' => {
    if (difficulty) return difficulty;
    switch (tid) {
      case 'BULL_MARKET':
      case 'FINANCIAL_GURU':
      case 'HIGH_ROLLER':
        return 'gem';
      case 'WHALE':
      case 'DAY_TRADER':
      case 'RISK_TAKER':
        return 'gold';
      case 'DIVERSIFIED':
      case 'DIAMOND_HANDS':
      case 'COMMUNITY_LEADER':
      case 'BEAR_SURVIVOR':
        return 'silver';
      default:
        return 'copper';
    }
  };

  const rank = getDifficulty(id);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!detailedTrophies) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateX = -(y / (rect.height / 2)) * 20;
    const rotateY = (x / (rect.width / 2)) * 20;
    setCoords({ x: rotateY, y: rotateX });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords({ x: 0, y: 0 });
  };

  const IconComponent = (() => {
    switch (iconType) {
      case 'Rocket': return Rocket;
      case 'Gem': return Gem;
      case 'Crown': return Crown;
      case 'PieChart': return PieChart;
      case 'Zap': return Zap;
      default: return Trophy;
    }
  })();

  const rankStyles = {
    gem: {
      border: 'border-fuchsia-500/40 bg-fuchsia-950/15 hover:border-fuchsia-400 shadow-[0_0_20px_rgba(217,70,239,0.06)] hover:shadow-[0_0_30px_rgba(217,70,239,0.4)]',
      iconColor: 'text-fuchsia-400 fill-fuchsia-400/20 drop-shadow-[0_0_10px_rgba(217,70,239,0.5)]',
      glow: 'bg-fuchsia-500/10',
      label: 'Gem (Legendary)',
      textColor: 'text-fuchsia-400',
      xpAmount: 100
    },
    gold: {
      border: 'border-amber-500/40 bg-amber-950/15 hover:border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.06)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]',
      iconColor: 'text-amber-400 fill-amber-400/20 drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]',
      glow: 'bg-amber-500/10',
      label: 'Gold (Epic)',
      textColor: 'text-amber-400',
      xpAmount: 50
    },
    silver: {
      border: 'border-slate-400/40 bg-slate-800/25 hover:border-slate-300 shadow-[0_0_20px_rgba(148,163,184,0.06)] hover:shadow-[0_0_30px_rgba(148,163,184,0.3)]',
      iconColor: 'text-slate-300 fill-slate-300/20 drop-shadow-[0_0_10px_rgba(148,163,184,0.5)]',
      glow: 'bg-slate-400/10',
      label: 'Silver (Rare)',
      textColor: 'text-slate-300',
      xpAmount: 25
    },
    copper: {
      border: 'border-orange-700/40 bg-orange-950/15 hover:border-orange-600 shadow-[0_0_20px_rgba(194,65,12,0.06)] hover:shadow-[0_0_30px_rgba(194,65,12,0.35)]',
      iconColor: 'text-orange-500 fill-orange-500/20 drop-shadow-[0_0_10px_rgba(194,65,12,0.5)]',
      glow: 'bg-orange-700/10',
      label: 'Copper (Common)',
      textColor: 'text-orange-500',
      xpAmount: 10
    }
  };

  const style = rankStyles[rank];

  const handleCardClick = (e: React.MouseEvent) => {
    if (!detailedTrophies) {
      if (onClickAction) {
        onClickAction();
      }
      return;
    }
    setIsClicked(!isClicked);
    if (onClickAction) {
      onClickAction();
    }
  };

  return (
    <div
      ref={cardRef}
      id={`trophy-card-${id}`}
      onClick={handleCardClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => { if (detailedTrophies) setIsHovered(true); }}
      onMouseLeave={handleMouseLeave}
      className={`relative w-44 h-44 aspect-square rounded-2xl border flex flex-col items-center justify-center gap-2 overflow-hidden cursor-pointer select-none transition-[border-color,background-color,box-shadow,ring] duration-200 trophy-card-element ${style.border} ${
        isSelected ? 'ring-2 ring-blue-500 border-transparent shadow-[0_0_25px_rgba(59,130,246,0.4)]' : ''
      }`}
      style={{
        transformStyle: 'preserve-3d',
        transform: `perspective(1000px) rotateX(${coords.y}deg) rotateY(${coords.x}deg) ${isHovered && detailedTrophies ? 'scale3d(1.05, 1.05, 1.05)' : 'scale3d(1, 1, 1)'}`,
      }}
    >
      <div className={`absolute inset-0 opacity-40 blur-xl transition-opacity duration-300 ${style.glow} ${isHovered && detailedTrophies ? 'opacity-100' : 'opacity-0'}`} />

      <div 
        className="flex flex-col items-center justify-center gap-2 pointer-events-none transition-all duration-200" 
        style={{ transform: isHovered && detailedTrophies ? 'translateZ(35px) scale(0.95)' : 'translateZ(0px)' }}
      >
        <IconComponent className={`h-10 w-10 ${style.iconColor}`} />
        <span className="text-[12px] font-extrabold text-slate-100 text-center tracking-tight px-3">{title}</span>
        <span className={`text-[9px] font-bold uppercase tracking-widest ${style.textColor}`}>
          {style.label}
        </span>
      </div>

      {detailedTrophies && (
        <div
          className={`absolute inset-0 bg-[#0b0f19]/95 backdrop-blur-[10px] flex flex-col items-center justify-center p-4 text-center transition-all duration-300 ${
            isClicked ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-full pointer-events-none'
          }`}
        >
          <span className={`text-[11px] font-extrabold tracking-widest uppercase mb-1 ${style.textColor}`}>
            {style.label}
          </span>
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider mb-2">
            +{style.xpAmount} XP Gain
          </span>
          <p className="text-[10px] font-bold text-slate-300 leading-normal mb-3">
            {description}
          </p>
          <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">
            Click to close
          </span>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { numberFont } = useSettings();
  const [showDetails, setShowDetails] = useState(true);
  const [isGameLoading, setIsGameLoading] = useState(() => {
    if (typeof window === 'undefined') return false;
    const shouldShow = sessionStorage.getItem('trillium_show_loader') === 'true';
    if (shouldShow) {
      sessionStorage.removeItem('trillium_show_loader');
      return true;
    }
    return false;
  });
  const gridWrapperRef = useRef<HTMLDivElement | null>(null);
  const roRef = useRef<ResizeObserver | null>(null);
  const hasFiredIntroRef = useRef<boolean>(false);
  const [gridWidth, setGridWidth] = useState<number>(0);

  const handlePulse = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    target.classList.remove('ring-pulse-active');
    void target.offsetWidth;
    target.classList.add('ring-pulse-active');
  };
  
  const { role, settings, classCode, className } = useDashboardSettings();
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [tradeTab, setTradeTab] = useState<'stock' | 'options'>('stock');

  // Option contract fields
  const [optionType, setOptionType] = useState<'CALL' | 'PUT'>('CALL');
  const [optionStrike, setOptionStrike] = useState(150);
  const [optionExpiry, setOptionExpiry] = useState('2026-07-17');

  const { 
    portfolio, 
    loading: storeLoading, 
    error: storeError, 
    fetchPortfolio, 
    executeTrade, 
    xp, 
    levelInfo, 
    unlockedAchievements, 
    streakCount,
    fetchAchievementsAndStreak 
  } = usePortfolioStore();
  const { getStock, lastUpdated } = useStockMarket();

  const [chartData, setChartData] = useState<{ portfolio: any[], benchmark: any[] } | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('1D');
  const [selectedTrophyIds, setSelectedTrophyIds] = useState<string[]>([]);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [hoveredData, setHoveredData] = useState<{ portfolio: number; spy: number; time: number; achievements?: any[] } | null>(null);

  // Compute real-time live portfolio calculations synced with StockMarketContext ticks
  const livePortfolio = useMemo(() => {
    if (!portfolio) return null;

    const rawHoldings = portfolio.holdings || [];
    let totalMarketValue = 0;
    let totalCostBasis = 0;
    let dayPerformanceUSD = 0;

    const holdings = rawHoldings.map((h: any) => {
      const liveStock = getStock(h.symbol);
      const currentPrice = liveStock?.price || h.currentPrice || 0;
      const qty = h.qty || 0;
      const avgPrice = h.avgPrice || 0;

      const marketValue = safeRound(qty * currentPrice, 2);
      const costBasis = safeRound(qty * avgPrice, 2);
      const pl = safeRound(marketValue - costBasis, 2);
      const plPercent = avgPrice > 0 ? safeRound(((currentPrice - avgPrice) / avgPrice) * 100, 2) : 0;

      const stockChangePercent = liveStock?.change ?? h.dayPlPercent ?? 0;
      const prevPrice = stockChangePercent !== -100 ? currentPrice / (1 + stockChangePercent / 100) : currentPrice;
      const dayPl = safeRound(qty * (currentPrice - prevPrice), 2);
      const dayPlPercent = safeRound(stockChangePercent, 2);

      totalMarketValue = safeAdd(totalMarketValue, marketValue);
      totalCostBasis = safeAdd(totalCostBasis, costBasis);
      dayPerformanceUSD = safeAdd(dayPerformanceUSD, dayPl);

      return {
        ...h,
        currentPrice,
        marketValue,
        costBasis,
        pl,
        plPercent,
        dayPl,
        dayPlPercent
      };
    });

    const cash = portfolio.cash ?? 10000;
    const borrowedAmount = portfolio.borrowedAmount ?? 0;
    const netWorth = safeSubtract(safeAdd(cash, totalMarketValue), borrowedAmount);
    const totalPerformanceUSD = safeRound(totalMarketValue - totalCostBasis, 2);
    const totalPerformancePercent = totalCostBasis > 0 ? safeRound((totalPerformanceUSD / totalCostBasis) * 100, 2) : 0;

    const previousNetWorth = safeSubtract(netWorth, dayPerformanceUSD);
    const dayPerformancePercent = previousNetWorth > 0 ? safeRound((dayPerformanceUSD / previousNetWorth) * 100, 2) : 0;

    return {
      ...portfolio,
      cash,
      totalValue: netWorth,
      netWorth,
      totalMarketValue,
      totalCostBasis,
      totalPerformanceUSD,
      totalPerformancePercent,
      dayPerformanceUSD,
      dayPerformancePercent,
      holdings
    };
  }, [portfolio, getStock, lastUpdated]);

  const displayPortfolio = livePortfolio || portfolio;

  // Layout customization states - widgets are always editable
  const [isEditMode, setIsEditMode] = useState(true);
  const [layouts, setLayouts] = useState<ResponsiveDashboardLayouts>(DEFAULT_WIDGET_LAYOUTS);
  const [currentBreakpoint, setCurrentBreakpoint] = useState<keyof ResponsiveDashboardLayouts>('lg');
  const [mounted, setMounted] = useState(false);
  const [cockpitIntroTrigger, setCockpitIntroTrigger] = useState(0);

  // Reliable callback ref ensuring immediate synchronous dimension measurement upon DOM mount
  const gridWrapperCallbackRef = useCallback((node: HTMLDivElement | null) => {
    if (roRef.current) {
      roRef.current.disconnect();
      roRef.current = null;
    }
    gridWrapperRef.current = node;

    if (node) {
      const updateWidth = () => {
        const w = node.clientWidth || node.offsetWidth;
        if (w > 0) {
          setGridWidth(w);
          if (!hasFiredIntroRef.current) {
            hasFiredIntroRef.current = true;
            setTimeout(() => {
              setCockpitIntroTrigger(1);
            }, 100);
          }
        }
      };

      updateWidth();

      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const w = entry.contentRect.width;
            if (w > 0) {
              setGridWidth(w);
            }
          }
        });
        ro.observe(node);
        roRef.current = ro;
      }
    }
  }, []);

  // Additional safety synchronization on mount and data transition
  useEffect(() => {
    setMounted(true);

    const measureWidth = () => {
      if (gridWrapperRef.current) {
        const w = gridWrapperRef.current.clientWidth || gridWrapperRef.current.offsetWidth;
        if (w > 0) {
          setGridWidth(w);
          if (!hasFiredIntroRef.current) {
            hasFiredIntroRef.current = true;
            setTimeout(() => {
              setCockpitIntroTrigger(1);
            }, 100);
          }
        }
      }
    };

    measureWidth();
    const t1 = setTimeout(measureWidth, 50);
    const t2 = setTimeout(measureWidth, 200);

    window.addEventListener('resize', measureWidth);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', measureWidth);
    };
  }, [portfolio, storeLoading]);


  const activePerformance = useMemo(() => {
    if (timeRange === '1D') {
      return {
        usd: portfolio?.dayPerformanceUSD ?? 0,
        percent: portfolio?.dayPerformancePercent ?? 0,
        label: 'Today'
      };
    }
    if (timeRange === 'ALL') {
      return {
        usd: portfolio?.totalPerformanceUSD ?? 0,
        percent: portfolio?.totalPerformancePercent ?? 0,
        label: 'All Time'
      };
    }
    
    const chartPortfolio = chartData?.portfolio || [];
    if (chartPortfolio.length < 2) {
      return { usd: 0, percent: 0, label: timeRange };
    }
    
    const startVal = chartPortfolio[0].value;
    const endVal = chartPortfolio[chartPortfolio.length - 1].value;
    const usd = endVal - startVal;
    const percent = startVal > 0 ? (usd / startVal) * 100 : 0;
    
    const labelMap: Record<string, string> = {
      '1W': 'Past Week',
      '1M': 'Past Month',
      '1Y': 'Past Year',
      'ALL': 'All Time'
    };
    
    return {
      usd,
      percent,
      label: labelMap[timeRange] || timeRange
    };
  }, [timeRange, chartData, portfolio]);

  const handleLookAchievement = (achievementId: string) => {
    setShowDetails(true);
    setTimeout(() => {
      const targetId = `trophy-card-${achievementId}`;
      const element = document.getElementById(targetId) || document.getElementById('trophy-showcase-section');
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element?.classList.add('ring-4', 'ring-amber-400', 'duration-500');
      setTimeout(() => {
        element?.classList.remove('ring-4', 'ring-amber-400');
      }, 2000);
    }, 100);
  };

  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [tradeTicker, setTradeTicker] = useState('');
  const [tradeQty, setTradeQty] = useState(1);
  const [tradeLoading, setTradeLoading] = useState(false);
  const [tradeError, setTradeError] = useState('');

  const [activeWidget, setActiveWidget] = useState<string | null>(null);
  const [widgetModalOpen, setWidgetModalOpen] = useState(false);
  const [borrowedAmountJustNow, setBorrowedAmountJustNow] = useState(0);

  // Load layout from localStorage / Firestore
  useEffect(() => {
    const loadLayout = async () => {
      // 1. Try local storage first for snappy load
      const localData = localStorage.getItem(LOCAL_STORAGE_LAYOUT_KEY);
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          setLayouts(sanitizeLayouts(parsed));
        } catch (e) {
          console.error('Failed to parse local dashboard layout', e);
        }
      } else {
        setLayouts(DEFAULT_WIDGET_LAYOUTS);
      }

      // 2. Fetch user Firestore layout if logged in
      if (user?.uid) {
        try {
          const userDocRef = doc(db, 'users', user.uid, 'settings', 'dashboardLayout');
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists() && docSnap.data().layouts) {
            const firestoreLayouts = sanitizeLayouts(docSnap.data().layouts);
            setLayouts(firestoreLayouts);
            localStorage.setItem(LOCAL_STORAGE_LAYOUT_KEY, JSON.stringify(firestoreLayouts));
          }
        } catch (err) {
          console.error('Failed to load layout from Firestore', err);
        }
      }
    };

    loadLayout();
  }, [user]);

  // Save layout helper
  const handleSaveLayout = async () => {
    setIsEditMode(false);
    try {
      localStorage.setItem(LOCAL_STORAGE_LAYOUT_KEY, JSON.stringify(layouts));

      if (user?.uid) {
        const userDocRef = doc(db, 'users', user.uid, 'settings', 'dashboardLayout');
        await setDoc(userDocRef, {
          layouts,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }
    } catch (err) {
      console.error('Failed to save layout', err);
    }
  };

  // Reset layout helper
  const handleResetLayout = async () => {
    setLayouts(DEFAULT_WIDGET_LAYOUTS);
    localStorage.removeItem(LOCAL_STORAGE_LAYOUT_KEY);
    setCockpitIntroTrigger((prev) => prev + 1);

    if (user?.uid) {
      try {
        const userDocRef = doc(db, 'users', user.uid, 'settings', 'dashboardLayout');
        await setDoc(userDocRef, {
          layouts: DEFAULT_WIDGET_LAYOUTS,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      } catch (err) {
        console.error('Failed to reset layout in Firestore', err);
      }
    }
  };

  // Remove widget helper
  const handleRemoveWidget = (widgetId: string) => {
    setLayouts((prevLayouts) => {
      const next: ResponsiveDashboardLayouts = { ...prevLayouts };
      (Object.keys(next) as Array<keyof ResponsiveDashboardLayouts>).forEach((bp) => {
        next[bp] = next[bp].map((item) =>
          item.i === widgetId ? { ...item, visible: false } : item
        );
      });
      return next;
    });
    setCockpitIntroTrigger((prev) => prev + 1);
  };

  // Add back removed widget helper
  const handleAddWidget = (widgetId: string) => {
    setLayouts((prevLayouts) => {
      const next: ResponsiveDashboardLayouts = { ...prevLayouts };
      (Object.keys(next) as Array<keyof ResponsiveDashboardLayouts>).forEach((bp) => {
        const defaultItem = DEFAULT_WIDGET_LAYOUTS[bp]?.find((item) => item.i === widgetId);
        const exists = next[bp]?.some((item) => item.i === widgetId);
        if (exists) {
          next[bp] = next[bp].map((item) =>
            item.i === widgetId
              ? {
                  ...item,
                  visible: true,
                  w: defaultItem ? defaultItem.w : item.w,
                  h: defaultItem ? defaultItem.h : item.h,
                  minW: defaultItem ? defaultItem.minW : item.minW,
                  minH: defaultItem ? defaultItem.minH : item.minH,
                }
              : item
          );
        } else if (defaultItem) {
          next[bp] = [...(next[bp] || []), { ...defaultItem, visible: true }];
        } else {
          next[bp] = [
            ...(next[bp] || []),
            { i: widgetId, x: 0, y: 100, w: bp === 'lg' ? 12 : bp === 'md' ? 10 : 6, h: 5, minW: 3, minH: 3, visible: true },
          ];
        }
      });
      return sanitizeLayouts(next);
    });
    setCockpitIntroTrigger((prev) => prev + 1);
    setWidgetModalOpen(false);
  };

  // Preset resize helper (Small = 1/3 (4 cols), Medium = 2/3 (8 cols), Large = Full (12 cols) for lg)
  const handleResizePreset = (widgetId: string, size: 'small' | 'medium' | 'large') => {
    const widthMap: Record<string, { small: number; medium: number; large: number }> = {
      lg: { small: 4, medium: 8, large: 12 },
      md: { small: 3, medium: 7, large: 10 },
      sm: { small: 2, medium: 4, large: 6 },
    };

    setLayouts((prevLayouts) => {
      const next: ResponsiveDashboardLayouts = { ...prevLayouts };
      (Object.keys(next) as Array<keyof ResponsiveDashboardLayouts>).forEach((bp) => {
        const totalCols = bp === 'lg' ? 12 : bp === 'md' ? 10 : 6;
        const targetWidth = widthMap[bp]?.[size] || 6;
        const items = next[bp] || [];
        const targetItem = items.find((i) => i.i === widgetId);
        if (!targetItem) return;

        // Calculate sum of widths of other widgets on the same row
        const rowOthers = items.filter((i) => i.i !== widgetId && i.y === targetItem.y && i.visible !== false);
        const otherWidthSum = rowOthers.reduce((sum, i) => sum + i.w, 0);

        if (otherWidthSum + targetWidth > totalCols) {
          // Move ONLY the target resized widget to a new row down
          const maxRowY = items.reduce((maxY, i) => Math.max(maxY, i.y + i.h), 0);
          next[bp] = items.map((item) =>
            item.i === widgetId ? { ...item, w: targetWidth, x: 0, y: maxRowY } : item
          );
        } else {
          // Keep on the same row if space allows
          next[bp] = items.map((item) =>
            item.i === widgetId ? { ...item, w: targetWidth } : item
          );
        }
      });
      return sanitizeLayouts(next);
    });
    setCockpitIntroTrigger((prev) => prev + 1);
  };

  const layoutsRef = useRef(layouts);
  useEffect(() => {
    layoutsRef.current = layouts;
  }, [layouts]);

  const handleLayoutChange = (currentLayout: any, allLayouts: any) => {
    if (!allLayouts || typeof allLayouts !== 'object') return;

    let hasChanged = false;
    const updatedLayouts = { ...(allLayouts as ResponsiveDashboardLayouts) };

    (Object.keys(updatedLayouts) as Array<keyof ResponsiveDashboardLayouts>).forEach((bp) => {
      const existingBpLayout = layoutsRef.current[bp] || [];
      if (Array.isArray(updatedLayouts[bp])) {
        updatedLayouts[bp] = updatedLayouts[bp].map((item) => {
          const existing = existingBpLayout.find((e) => e.i === item.i);
          if (
            !existing ||
            existing.x !== item.x ||
            existing.y !== item.y ||
            existing.w !== item.w ||
            existing.h !== item.h
          ) {
            hasChanged = true;
          }
          return {
            ...item,
            visible: existing ? existing.visible !== false : true,
            minW: existing?.minW,
            minH: existing?.minH,
            maxW: existing?.maxW,
            maxH: existing?.maxH,
          };
        });
      }
    });

    if (hasChanged) {
      const sanitized = sanitizeLayouts(updatedLayouts);
      setLayouts(sanitized);
      setCockpitIntroTrigger((prev) => prev + 1);
      try {
        localStorage.setItem(LOCAL_STORAGE_LAYOUT_KEY, JSON.stringify(sanitized));
        if (user?.uid) {
          const userDocRef = doc(db, 'users', user.uid, 'settings', 'dashboardLayout');
          setDoc(userDocRef, {
            layouts: sanitized,
            updatedAt: new Date().toISOString(),
          }, { merge: true }).catch(() => {});
        }
      } catch (e) {
        console.error('Failed to auto-save layout', e);
      }
    }
  };

  useEffect(() => {
    const savedWidget = localStorage.getItem('dashboard_active_widget');
    if (savedWidget) {
      setActiveWidget(savedWidget);
    }
    const amt = localStorage.getItem('borrowed_just_now');
    if (amt) {
      setBorrowedAmountJustNow(Number(amt));
      localStorage.removeItem('borrowed_just_now');
    }
  }, []);

  const handleSelectWidget = (widgetName: string | null) => {
    setActiveWidget(widgetName);
    if (widgetName) {
      localStorage.setItem('dashboard_active_widget', widgetName);
    } else {
      localStorage.removeItem('dashboard_active_widget');
    }
    setWidgetModalOpen(false);
  };

  const loadData = async () => {
    await fetchPortfolio();
    await fetchAchievementsAndStreak();
  };

  useEffect(() => {
    const saved = localStorage.getItem('top_trophy_selections');
    if (saved) {
      try {
        setSelectedTrophyIds(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('top_trophy_selections');
    if (!saved && unlockedAchievements.length > 0) {
      const ACHIEVEMENT_PRIORITY = ['WHALE', 'DIVERSIFIED', 'DAY_TRADER', 'DIAMOND_HANDS', 'FIRST_TRADE'];
      const defaultTrophies = ACHIEVEMENTS.filter((ach) => unlockedAchievements.includes(ach.id))
        .sort((a, b) => {
          const idxA = ACHIEVEMENT_PRIORITY.indexOf(a.id);
          const idxB = ACHIEVEMENT_PRIORITY.indexOf(b.id);
          return (idxA > -1 ? idxA : 99) - (idxB > -1 ? idxB : 99);
        })
        .slice(0, 3)
        .map(t => t.id);
      setSelectedTrophyIds(defaultTrophies);
    }
  }, [unlockedAchievements]);

  useEffect(() => {
    if (!user) return;
    const loadGraph = async () => {
      try {
        const data = await getGraphData(timeRange);
        setChartData(data);
      } catch (err) {
        console.error('Failed to load graph data', err);
      }
    };
    loadGraph();

    let intervalId: NodeJS.Timeout | undefined;
    if (timeRange === '1D') {
      intervalId = setInterval(loadGraph, 10 * 60 * 1000); // 10 minutes
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [user, timeRange]);

  useEffect(() => {
    if (!authLoading && user) {
      loadData();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (customizerOpen || widgetModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [customizerOpen, widgetModalOpen]);

  const executeTradeSubmit = async (type: 'BUY' | 'SELL') => {
    if (!tradeTicker) return;
    setTradeLoading(true);
    setTradeError('');
    try {
      await executeTrade(tradeTicker.toUpperCase(), Number(tradeQty), type);
      setTradeModalOpen(false);
      setTradeTicker('');
      setTradeQty(1);
    } catch (err: any) {
      setTradeError(err.message || 'Trade failed');
    } finally {
      setTradeLoading(false);
    }
  };

  const formatCurrency = (val: number) => val.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  const formatSignedCurrency = (val: number) => {
    const absVal = Math.abs(val);
    const formatted = absVal.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    if (val > 0) return `+${formatted}`;
    if (val < 0) return `-${formatted}`;
    return formatted;
  };
  const formatSignedPercent = (val: number) => {
    const formatted = Math.abs(val).toFixed(2) + '%';
    if (val > 0) return `+${formatted}`;
    if (val < 0) return `-${formatted}`;
    return formatted;
  };
  const formatNumberNoCurrency = (val: number) => val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatPercent = (val: number) => val.toFixed(2) + '%';

  if (authLoading) {
    if (isGameLoading) {
      return <GameDashboardLoader minDurationMs={850} onLoaded={() => setIsGameLoading(false)} />;
    }
    return null;
  }

  if (!user) {
    return (
      <div className="text-white text-center mt-20 p-8 rounded-3xl bg-[#1a2133]/90 border border-slate-700/50">
        <Lock className="h-12 w-12 text-slate-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-slate-400 mb-6">Please log in to view your portfolio.</p>
        <a href="/login" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-colors inline-block">
          Go to Login
        </a>
      </div>
    );
  }

  if (storeLoading && !portfolio) {
    if (isGameLoading) {
      return <GameDashboardLoader minDurationMs={850} onLoaded={() => setIsGameLoading(false)} />;
    }
    return null;
  }

  if (storeError) {
    return (
      <div className="text-white text-center mt-20 p-8 rounded-3xl bg-rose-500/10 border border-rose-500/50">
        <X className="h-12 w-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
        <p className="text-slate-400 mb-6">{storeError}</p>
        <button onClick={loadData} className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 py-3 rounded-xl transition-colors">
          Try Again
        </button>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="text-white text-center mt-20 flex flex-col items-center gap-4">
        <h2 className="text-2xl font-bold">Welcome to Trillium Finance</h2>
        <p className="text-slate-400">Your portfolio is currently empty or failed to load. Start by exploring the market!</p>
        <button 
          onClick={() => setTradeModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-[0_0_15px_rgba(37,99,235,0.4)]"
        >
          Make Your First Trade
        </button>
      </div>
    );
  }

  const activeBreakpointLayout = layouts[currentBreakpoint] || layouts.lg;
  const visibleItems = activeBreakpointLayout.filter((item) => item.visible !== false);
  const hiddenWidgetIds = Object.keys(WIDGET_REGISTRY).filter(
    (id) => !visibleItems.some((item) => item.i === id)
  );

  return (
    <>
      <AnimatePresence>
        {isGameLoading && (
          <motion.div
            key="game-loader-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, pointerEvents: 'none' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="fixed inset-0 z-[9999]"
          >
            <GameDashboardLoader minDurationMs={850} onLoaded={() => setIsGameLoading(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isGameLoading ? 0 : 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="space-y-3 sm:space-y-4 relative w-full min-h-screen flex flex-col flex-1"
      >


      {role === 'student' && className && (
        <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-between text-teal-400 text-xs">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            <span>Enrolled in: <strong>{className}</strong> (Code: <code>{classCode}</code>)</span>
          </div>
          <span className="font-extrabold uppercase tracking-widest text-[9px] px-2 py-0.5 rounded bg-teal-500/20">Classroom Mode</span>
        </div>
      )}

      {/* Financial Summary Card Header */}
      <div className="relative w-full overflow-visible">
        {/* Exact Ambient Underglow Layer: Matches the widget silhouette underglow */}
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none z-0 overflow-visible"
          aria-hidden="true"
        >
          {/* Ambient aura stroke matching widget Layer 1A */}
          <div
            className="absolute -inset-1 rounded-[26px] pointer-events-none transition-opacity duration-700"
            style={{
              border: '14px solid var(--theme-accent-glow, rgba(168, 85, 247, 0.15))',
              filter: 'blur(16px)',
              opacity: 0.22,
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl bg-white/95 dark:bg-[#121622]/90 backdrop-blur-md border border-slate-200 dark:border-slate-800/60 p-4 md:p-6 lg:p-8 shadow-xl container-3d-bevel pet-container-target relative w-full z-10"
        >
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 shadow-sm shrink-0">
              <Wallet className="h-4 w-4 text-[var(--theme-accent,#3b82f6)]" />
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-slate-900 dark:text-white text-lg md:text-xl lg:text-2xl font-black tracking-tight">
                Portfolio Overview
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setWidgetModalOpen(true)}
              className="p-2 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-500 hover:text-blue-400 transition-all cursor-pointer shadow-sm active:scale-95 flex items-center justify-center"
              title="Add Widgets"
              aria-label="Add Widgets"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              onClick={handleResetLayout}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-sm active:scale-95 group flex items-center justify-center"
              title="Reset Layout"
              aria-label="Reset Layout"
            >
              <RotateCcw className="h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
            </button>
          </div>
        </div>
        
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Top Layer: Net Worth */}
          <div className="p-4 sm:p-6 lg:p-8 rounded-2xl bg-slate-50/50 dark:bg-[#0f111a]/40 border border-slate-200 dark:border-slate-800/50 shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest mb-1">Net Worth</div>
                <div className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-num-${numberFont}`}>
                  <AnimatedNumber value={displayPortfolio?.totalValue ?? 0} formatter={formatCurrency} startOffset={borrowedAmountJustNow} />
                </div>
              </div>
            </div>
          </div>

          {/* Supporting Stats */}
          <div className="p-4 sm:p-6 lg:p-8 rounded-2xl bg-slate-50/50 dark:bg-[#0f111a]/30 border border-slate-200 dark:border-slate-800/40 shadow-sm backdrop-blur-sm transition-all hover:bg-slate-100/50 dark:hover:bg-[#0f111a]/40 duration-200 pet-container-target relative w-full">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800/30">
              <div className="pb-3 sm:pb-0 sm:pr-4 md:pr-6 w-full flex-1">
                <div className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Available Cash</div>
                <div className={`text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-num-${numberFont}`}>
                  <AnimatedNumber value={displayPortfolio?.cash ?? 0} formatter={formatCurrency} startOffset={borrowedAmountJustNow} />
                </div>
              </div>

              <div className="py-3 sm:py-0 sm:px-4 md:px-6 w-full flex-1">
                <div className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Performance</div>
                <div className="flex flex-col">
                  <div className={`text-xl sm:text-2xl md:text-3xl font-black tracking-tight font-num-${numberFont} ${(displayPortfolio?.totalPerformanceUSD ?? 0) >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-500'}`}>
                    <AnimatedNumber value={displayPortfolio?.totalPerformanceUSD ?? 0} formatter={formatSignedCurrency} />
                  </div>
                  <div className={`text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 mt-0.5 font-num-${numberFont}`}>
                    <AnimatedNumber value={displayPortfolio?.totalPerformancePercent ?? 0} formatter={formatSignedPercent} />
                  </div>
                </div>
              </div>

              <div className="pt-3 sm:pt-0 sm:pl-4 md:pl-6 w-full flex-1">
                <div className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Day Performance</div>
                <div className="flex flex-col">
                  <div className={`text-xl sm:text-2xl md:text-3xl font-black tracking-tight font-num-${numberFont} ${(displayPortfolio?.dayPerformanceUSD ?? 0) >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-500'}`}>
                    <AnimatedNumber value={displayPortfolio?.dayPerformanceUSD ?? 0} formatter={formatSignedCurrency} />
                  </div>
                  <div className={`text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 mt-0.5 font-num-${numberFont}`}>
                    <AnimatedNumber value={displayPortfolio?.dayPerformancePercent ?? 0} formatter={formatSignedPercent} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      </div>



      {/* Dynamic Grid Layout Engine */}
      <div ref={gridWrapperCallbackRef} className="relative w-full overflow-visible min-h-[400px]">
        {/* Global Unified Cockpit Perimeter Neon Trace: Outlines all widgets with zero interior lines and zero clipping */}
        {gridWidth > 0 && (
          <CockpitPerimeterTrace
            playTrigger={cockpitIntroTrigger}
            widgets={visibleItems}
            gridWidth={gridWidth}
            durationMs={3000}
          />
        )}
        {gridWidth > 0 ? (
          <Responsive
            className="layout w-full"
            width={gridWidth}
            layouts={layouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768 }}
            cols={{ lg: 12, md: 10, sm: 6 }}
            rowHeight={90}
            margin={[0, 0]}
            dragConfig={{ enabled: isEditMode, handle: '.widget-drag-handle' }}
            resizeConfig={{ enabled: isEditMode, handles: ['se', 'sw'] }}
            onLayoutChange={handleLayoutChange}
            onBreakpointChange={(newBp) => setCurrentBreakpoint(newBp as keyof ResponsiveDashboardLayouts)}
          >
          {visibleItems.map((item) => {
            const regItem = WIDGET_REGISTRY[item.i];
            if (!regItem) return null;
            const WidgetComp = regItem.component;

            // Accurately check adjacent touching neighbors along 2D box edges
            const hasLeft = visibleItems.some(
              (other) =>
                other.i !== item.i &&
                other.x + other.w === item.x &&
                Math.max(other.y, item.y) < Math.min(other.y + other.h, item.y + item.h)
            );
            const hasRight = visibleItems.some(
              (other) =>
                other.i !== item.i &&
                item.x + item.w === other.x &&
                Math.max(other.y, item.y) < Math.min(other.y + other.h, item.y + item.h)
            );
            const hasTop = visibleItems.some(
              (other) =>
                other.i !== item.i &&
                other.y + other.h === item.y &&
                Math.max(other.x, item.x) < Math.min(other.x + other.w, item.x + item.w)
            );
            const hasBottom = visibleItems.some(
              (other) =>
                other.i !== item.i &&
                item.y + item.h === other.y &&
                Math.max(other.x, item.x) < Math.min(other.x + other.w, item.x + item.w)
            );

            const isMergedRow = hasLeft || hasRight;
            const isMergedCol = hasTop || hasBottom;

            const isLeftItem = !hasLeft;
            const isRightItem = !hasRight;
            const isTopItem = !hasTop;
            const isBottomItem = !hasBottom;

            const showRightSeparator = hasRight;
            const showBottomSeparator = hasBottom;

            return (
              <div key={item.i} className="h-full w-full overflow-visible">
                <DashboardWidgetCard
                  id={item.i}
                  title={regItem.title}
                  isEditing={isEditMode}
                  onRemove={handleRemoveWidget}
                  onResizePreset={handleResizePreset}
                  currentWidth={item.w}
                  isMergedRow={isMergedRow}
                  isMergedCol={isMergedCol}
                  isLeftItem={isLeftItem}
                  isRightItem={isRightItem}
                  isTopItem={isTopItem}
                  isBottomItem={isBottomItem}
                  showRightSeparator={showRightSeparator}
                  showBottomSeparator={showBottomSeparator}
                  isMergingAnimation={isMergedRow || isMergedCol}
                >
                  <WidgetComp
                    portfolio={displayPortfolio}
                    chartData={chartData}
                    timeRange={timeRange}
                    setTimeRange={setTimeRange}
                    hoveredData={hoveredData}
                    setHoveredData={setHoveredData}
                    handleLookAchievement={handleLookAchievement}
                    numberFont={numberFont}
                    onOpenTradeModal={() => setTradeModalOpen(true)}
                    borrowedAmountJustNow={borrowedAmountJustNow}
                  />
                </DashboardWidgetCard>
              </div>
            );
          })}
        </Responsive>
        ) : (
          <div className="w-full h-[500px] flex items-center justify-center rounded-2xl bg-white/40 dark:bg-[#121622]/40 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              <span>Calibrating dashboard layout...</span>
            </div>
          </div>
        )}
      </div>


      {/* Customizer Trophy Showcase Modal */}
      <AnimatePresence>
        {customizerOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/95 dark:bg-[#121622]/95 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-4xl max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col gap-6 backdrop-blur-xl"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-slate-900 dark:text-white font-extrabold text-xl tracking-tight">Curate Your Trophy Showcase</h3>
                  <p className="text-slate-505 dark:text-slate-400 text-xs mt-1">Select up to 3 unlocked trophies to showcase prominently on your dashboard profile.</p>
                </div>
                <button 
                  onClick={() => setCustomizerOpen(false)} 
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors shadow-inner"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div>
                <h4 className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase tracking-widest mb-4">Selected Top Trophies (Max 3)</h4>
                <div className="flex flex-wrap gap-6 justify-center min-h-[200px] p-4 rounded-xl bg-slate-50/50 dark:bg-[#0f111a]/50 border border-slate-200 dark:border-slate-800/80 shadow-inner">
                  {selectedTrophyIds.length === 0 ? (
                    <div className="flex items-center justify-center text-slate-500 text-xs italic py-12 w-full">No trophies selected. Select from below to populate.</div>
                  ) : (
                    selectedTrophyIds.map((tid) => {
                      const trophy = ACHIEVEMENTS.find(a => a.id === tid);
                      if (!trophy) return null;
                      return (
                        <TrophyCard
                          key={`selected-${tid}`}
                          id={trophy.id}
                          title={trophy.title}
                          description={trophy.description}
                          iconType={trophy.iconType}
                          onClickAction={() => {
                            const updated = selectedTrophyIds.filter(id => id !== tid);
                            setSelectedTrophyIds(updated);
                            localStorage.setItem('top_trophy_selections', JSON.stringify(updated));
                          }}
                        />
                      );
                    })
                  )}
                </div>
              </div>

              <div className="relative py-2 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800/50"></div>
                </div>
                <span className="relative bg-white dark:bg-[#121622] px-4 text-[10px] font-bold text-slate-550 dark:text-slate-500 uppercase tracking-widest">
                  Available Unlocked Trophies
                </span>
              </div>

              <div>
                <div className="flex flex-wrap gap-6 justify-center p-4 rounded-xl bg-slate-50/30 dark:bg-[#0f111a]/30 border border-slate-200/50 dark:border-slate-800/30">
                  {(() => {
                    const unlockedOnly = ACHIEVEMENTS.filter(a => unlockedAchievements.includes(a.id));
                    if (unlockedOnly.length === 0) {
                      return (
                        <div className="text-slate-500 text-xs italic py-8 text-center w-full">Keep trading and completing achievements to unlock trophies!</div>
                      );
                    }
                    return unlockedOnly.map((trophy) => {
                      const isSelected = selectedTrophyIds.includes(trophy.id);

                      const getDifficulty = (tid: string): string => {
                        switch (tid) {
                          case 'BULL_MARKET':
                          case 'FINANCIAL_GURU':
                          case 'HIGH_ROLLER':
                            return 'Gem (Legendary)';
                          case 'WHALE':
                          case 'DAY_TRADER':
                          case 'RISK_TAKER':
                            return 'Gold (Epic)';
                          case 'DIVERSIFIED':
                          case 'DIAMOND_HANDS':
                          case 'COMMUNITY_LEADER':
                          case 'BEAR_SURVIVOR':
                            return 'Silver (Rare)';
                          default:
                            return 'Copper (Common)';
                        }
                      };

                      const getRarityClass = (tid: string): string => {
                        switch (tid) {
                          case 'BULL_MARKET':
                          case 'FINANCIAL_GURU':
                          case 'HIGH_ROLLER':
                            return 'text-fuchsia-400 font-extrabold drop-shadow-[0_0_8px_rgba(217,70,239,0.3)]';
                          case 'WHALE':
                          case 'DAY_TRADER':
                          case 'RISK_TAKER':
                            return 'text-amber-400 font-bold';
                          case 'DIVERSIFIED':
                          case 'DIAMOND_HANDS':
                          case 'COMMUNITY_LEADER':
                          case 'BEAR_SURVIVOR':
                            return 'text-slate-350 font-semibold';
                          default:
                            return 'text-orange-500 font-medium';
                        }
                      };

                      return (
                        <div key={`unlocked-${trophy.id}`} className="flex flex-col items-center gap-2 p-2 bg-slate-50/20 dark:bg-[#1e293b]/20 border border-slate-200 dark:border-slate-800/30 rounded-xl hover:bg-slate-100/30 dark:hover:bg-[#1e293b]/40 transition-colors duration-200">
                          <TrophyCard
                            id={trophy.id}
                            title={trophy.title}
                            description={trophy.description}
                            iconType={trophy.iconType}
                            isSelected={isSelected}
                            onClickAction={() => {
                              if (isSelected) {
                                const updated = selectedTrophyIds.filter(id => id !== trophy.id);
                                setSelectedTrophyIds(updated);
                                localStorage.setItem('top_trophy_selections', JSON.stringify(updated));
                              } else {
                                if (selectedTrophyIds.length >= 3) {
                                  alert("You can select a maximum of 3 top trophies. Deselect one first!");
                                  return;
                                }
                                const updated = [...selectedTrophyIds, trophy.id];
                                setSelectedTrophyIds(updated);
                                localStorage.setItem('top_trophy_selections', JSON.stringify(updated));
                              }
                            }}
                          />
                          <span className="text-[10px] uppercase tracking-widest text-slate-500 mt-1">
                            Rarity: <span className={getRarityClass(trophy.id)}>{getDifficulty(trophy.id)}</span>
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add / Restore Widget Selection Modal */}
      <AnimatePresence>
        {widgetModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/95 dark:bg-[#121622]/95 border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 w-full max-w-4xl max-h-[85vh] shadow-2xl flex flex-col gap-4 backdrop-blur-xl"
            >
              <div className="flex justify-between items-center shrink-0 border-b border-slate-200/60 dark:border-slate-800/60 pb-4">
                <div>
                  <h3 className="text-slate-900 dark:text-white font-extrabold text-xl tracking-tight">Widget Selection & Management</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-semibold">Enable or restore widgets on your cockpit grid canvas with live component previews.</p>
                </div>
                <button 
                  onClick={() => setWidgetModalOpen(false)} 
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors shadow-inner cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-1 py-1">
                {Object.values(WIDGET_REGISTRY).map((widget) => {
                  const isVisible = !hiddenWidgetIds.includes(widget.id);
                  return (
                    <div 
                      key={widget.id}
                      className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 transition-all ${
                        isVisible
                          ? 'bg-slate-100/40 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800/60 opacity-60'
                          : 'bg-white dark:bg-[#0f111a]/70 border-slate-200 dark:border-slate-800/80 hover:border-blue-500/50 shadow-md hover:shadow-xl transition-all'
                      }`}
                    >
                      {/* Top Header Row with Widget Name, Subtext & Action Button */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                            {widget.title}
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                            {widget.description}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            if (!isVisible) {
                              handleAddWidget(widget.id);
                            }
                          }}
                          disabled={isVisible}
                          className={`text-[10px] font-extrabold uppercase px-3 py-1.5 rounded-xl shrink-0 transition-all cursor-pointer ${
                            isVisible 
                              ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
                              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/25 active:scale-95'
                          }`}
                        >
                          {isVisible ? 'Active' : '+ Add'}
                        </button>
                      </div>

                      {/* Accurate, Authentic Non-AI Component Preview */}
                      <div className="w-full">
                        <WidgetPreviewCard widgetId={widget.id} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Join Classroom Modal */}
      <AnimatePresence>
        {joinModalOpen && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1a2133] border border-slate-700 rounded-3xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-bold text-lg">Join Classroom</h3>
                <button onClick={() => setJoinModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!joinCodeInput.trim()) return;
                setJoinLoading(true);
                setJoinError('');
                try {
                  const res = await joinClassroom(joinCodeInput, user?.displayName || 'Student');
                  if (res.success) {
                    setJoinModalOpen(false);
                    window.location.reload();
                  }
                } catch (err: any) {
                  setJoinError(err.message || 'Failed to join classroom');
                } finally {
                  setJoinLoading(false);
                }
              }} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">6-character class code</label>
                  <input 
                    type="text"
                    maxLength={6}
                    placeholder="TR389X"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase().trim())}
                    className="w-full bg-[#0f111a] border border-slate-700 rounded-xl px-4 py-3 text-white font-bold placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors uppercase text-center tracking-widest text-lg"
                  />
                </div>
                {joinError && <div className="text-rose-500 text-xs font-bold text-center">{joinError}</div>}
                <button
                  type="submit"
                  disabled={joinLoading || joinCodeInput.length !== 6}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {joinLoading ? 'Joining...' : 'Submit'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Trade Modal */}
      <AnimatePresence>
        {tradeModalOpen && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/95 dark:bg-[#121622]/95 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 w-full max-w-sm max-h-[88dvh] overflow-y-auto shadow-2xl backdrop-blur-md"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-slate-900 dark:text-white font-bold text-lg">New Order</h3>
                <button onClick={() => setTradeModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex border-b border-slate-700 mb-6">
                <button
                  onClick={() => setTradeTab('stock')}
                  className={`flex-1 text-center pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                    tradeTab === 'stock'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  Stocks
                </button>
                <button
                  onClick={() => setTradeTab('options')}
                  className={`flex-1 text-center pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                    tradeTab === 'options'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  Options
                </button>
              </div>
              
              {tradeTab === 'stock' ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Ticker Symbol</label>
                    <input 
                      type="text" 
                      value={tradeTicker}
                      onChange={(e) => setTradeTicker(e.target.value)}
                      placeholder="AAPL, TSLA, SPY..."
                      className="w-full bg-[#0f111a] border border-slate-700 rounded-xl px-4 py-3 text-white font-bold placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Quantity</label>
                    <input 
                      type="number" 
                      min="1"
                      value={tradeQty}
                      onChange={(e) => setTradeQty(Number(e.target.value))}
                      className="w-full bg-[#0f111a] border border-slate-700 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  {(() => {
                    const upperTicker = tradeTicker.toUpperCase().trim();
                    const isRestricted = settings.restrictedAssets.some(
                      (asset: string) => asset.toUpperCase().trim() === upperTicker
                    );
                    const ownsStock = portfolio?.holdings?.some((h: any) => h.ticker.toUpperCase() === upperTicker);
                    const currentPosCount = portfolio?.holdings?.length || 0;
                    const isPosLimitReached = !!(!ownsStock && settings.maxPositions && currentPosCount >= settings.maxPositions);

                    const ownedHolding = portfolio?.holdings?.find((h: any) => h.ticker.toUpperCase() === upperTicker);
                    const ownedQty = ownedHolding?.qty || 0;
                    const isShortSale = tradeQty > ownedQty;
                    const isShortBlocked = !!(isShortSale && !settings.allowShortSelling);

                    return (
                      <div className="space-y-2">
                        {isRestricted && (
                          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-400 text-[11px] font-semibold leading-normal">
                            <ShieldAlert className="h-4 w-4 shrink-0" />
                            <span>This asset has been restricted by your instructor.</span>
                          </div>
                        )}
                        {!isRestricted && isPosLimitReached && (
                          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2 text-amber-400 text-[11px] font-semibold leading-normal">
                            <ShieldAlert className="h-4 w-4 shrink-0" />
                            <span>Max positions limit reached ({settings.maxPositions} maximum).</span>
                          </div>
                        )}
                        {!isRestricted && isShortBlocked && (
                          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-400 text-[11px] font-semibold leading-normal">
                            <ShieldAlert className="h-4 w-4 shrink-0" />
                            <span>Short selling is disabled by your instructor.</span>
                          </div>
                        )}
                        {tradeError && <div className="text-rose-500 text-xs font-bold">{tradeError}</div>}
                        
                        <div className="flex gap-4 pt-2">
                          <button 
                            onClick={() => executeTradeSubmit('BUY')}
                            disabled={tradeLoading || !tradeTicker || isRestricted || isPosLimitReached}
                            className="flex-1 bg-teal-500 hover:bg-teal-400 text-white font-bold py-3 rounded-xl transition-colors shadow-[0_0_15px_rgba(20,184,166,0.3)] disabled:opacity-50 cursor-pointer"
                          >
                            {tradeLoading ? 'Processing...' : 'Buy'}
                          </button>
                          <button 
                            onClick={() => executeTradeSubmit('SELL')}
                            disabled={tradeLoading || !tradeTicker || isRestricted || isShortBlocked}
                            className="flex-1 bg-rose-500 hover:bg-rose-400 text-white font-bold py-3 rounded-xl transition-colors shadow-[0_0_15px_rgba(244,63,94,0.3)] disabled:opacity-50 cursor-pointer"
                          >
                            {tradeLoading ? 'Processing...' : 'Sell'}
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div>
                  {!settings.allowOptions ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                      <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 text-slate-500">
                        <Lock className="h-8 w-8 text-rose-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-white font-bold text-sm">Options Trading Locked</h4>
                        <p className="text-slate-400 text-[11px] max-w-xs leading-relaxed">Options trading has been disabled by your instructor for this classroom sandbox.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Option Ticker Symbol</label>
                        <input 
                          type="text" 
                          value={tradeTicker}
                          onChange={(e) => setTradeTicker(e.target.value)}
                          placeholder="AAPL, TSLA, SPY..."
                          className="w-full bg-[#0f111a] border border-slate-700 rounded-xl px-4 py-3 text-white font-bold placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors uppercase"
                        />
                      </div>

                      {(() => {
                        const upperTicker = tradeTicker.toUpperCase().trim();
                        const isRestricted = settings.restrictedAssets.some(
                          (asset: string) => asset.toUpperCase().trim() === upperTicker
                        );

                        return (
                          <div className="space-y-3">
                            {isRestricted && (
                              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-400 text-[11px] font-semibold leading-normal">
                                <ShieldAlert className="h-4 w-4 shrink-0" />
                                <span>This asset has been restricted by your instructor.</span>
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Contract Type</label>
                                <div className="flex bg-[#0f111a] rounded-xl p-1 border border-slate-700">
                                  <button
                                    type="button"
                                    onClick={() => setOptionType('CALL')}
                                    className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                      optionType === 'CALL' ? 'bg-teal-500 text-white font-extrabold' : 'text-slate-400 font-semibold'
                                    }`}
                                  >
                                    Call
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setOptionType('PUT')}
                                    className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                      optionType === 'PUT' ? 'bg-rose-500 text-white font-extrabold' : 'text-slate-400 font-semibold'
                                    }`}
                                  >
                                    Put
                                  </button>
                                </div>
                              </div>
                              <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Strike Price</label>
                                <input 
                                  type="number" 
                                  value={optionStrike}
                                  onChange={(e) => setOptionStrike(Number(e.target.value))}
                                  className="w-full bg-[#0f111a] border border-slate-700 rounded-xl px-4 py-2 text-white font-bold focus:outline-none focus:border-blue-500 transition-colors"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Expiration Date</label>
                              <select
                                value={optionExpiry}
                                onChange={(e) => setOptionExpiry(e.target.value)}
                                className="w-full bg-[#0f111a] border border-slate-700 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-blue-500 transition-colors"
                              >
                                <option value="2026-07-17">July 17, 2026</option>
                                <option value="2026-08-21">August 21, 2026</option>
                                <option value="2026-09-18">September 18, 2026</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Quantity (Contracts)</label>
                              <input 
                                type="number" 
                                min="1"
                                value={tradeQty}
                                onChange={(e) => setTradeQty(Number(e.target.value))}
                                className="w-full bg-[#0f111a] border border-slate-700 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-blue-500 transition-colors"
                              />
                            </div>

                            {tradeError && <div className="text-rose-500 text-xs font-bold">{tradeError}</div>}

                            <button
                              type="button"
                              disabled={tradeLoading || !tradeTicker || isRestricted}
                              onClick={async () => {
                                setTradeLoading(true);
                                setTradeError('');
                                try {
                                  alert(`Successfully traded ${tradeQty} ${tradeTicker} ${optionExpiry} $${optionStrike} ${optionType} contract(s)!`);
                                  setTradeModalOpen(false);
                                } catch (e: any) {
                                  setTradeError(e.message || 'Option trade failed');
                                } finally {
                                  setTradeLoading(false);
                                }
                              }}
                              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors shadow-md disabled:opacity-50 cursor-pointer"
                            >
                              {tradeLoading ? 'Processing Option...' : 'Submit Option Order'}
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  </>
);
}
