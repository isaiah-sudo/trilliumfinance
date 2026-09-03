'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Lock, Heart, TreePine, X, Trophy, Rocket, Gem, Crown, PieChart, Zap, Flame, GraduationCap, ShieldAlert, Edit3, Check, RotateCcw, Plus } from 'lucide-react';
import PortfolioChart from '@/components/PortfolioChart';
import { getGraphData } from '@/app/actions/trading';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { ACHIEVEMENTS, getUserAchievements } from '@/app/actions/achievements';
import { useSettings } from '@/context/SettingsContext';
import { AnimatedNumber } from '@/components/ui';
import { useDashboardSettings } from '@/context/DashboardSettingsContext';
import { joinClassroom } from '@/app/actions/edu';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

import { Responsive, useContainerWidth, Layout } from 'react-grid-layout';
import { DEFAULT_WIDGET_LAYOUTS, WidgetLayoutItem, ResponsiveDashboardLayouts } from '@/lib/defaultDashboardLayout';
import DashboardWidgetCard from '@/components/dashboard/DashboardWidgetCard';
import { WIDGET_REGISTRY } from '@/components/dashboard/WidgetRegistry';
import GameDashboardLoader from '@/components/dashboard/GameDashboardLoader';


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
  const [isNetWorthExpanded, setIsNetWorthExpanded] = useState(false);
  const [isGameLoading, setIsGameLoading] = useState(() => {
    if (typeof window === 'undefined') return false;
    const shouldShow = sessionStorage.getItem('trillium_show_loader') === 'true';
    if (shouldShow) {
      sessionStorage.removeItem('trillium_show_loader');
      return true;
    }
    return false;
  });
  const { width, containerRef } = useContainerWidth();

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
  const [chartData, setChartData] = useState<{ portfolio: any[], benchmark: any[] } | null>(null);
  const [timeRange, setTimeRange] = useState<'1D' | '1W' | '1M' | '1Y'>('1D');
  const [selectedTrophyIds, setSelectedTrophyIds] = useState<string[]>([]);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [hoveredData, setHoveredData] = useState<{ portfolio: number; spy: number; time: number; achievements?: any[] } | null>(null);

  // Layout customization states - widgets are always editable
  const [isEditMode, setIsEditMode] = useState(true);
  const [layouts, setLayouts] = useState<ResponsiveDashboardLayouts>(DEFAULT_WIDGET_LAYOUTS);
  const [currentBreakpoint, setCurrentBreakpoint] = useState<keyof ResponsiveDashboardLayouts>('lg');
  const [mounted, setMounted] = useState(false);

  // Force resize calculation after client mount to prevent initial squished widget layout
  useEffect(() => {
    setMounted(true);
    const t1 = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 50);
    const t2 = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const activePerformance = useMemo(() => {
    if (timeRange === '1D') {
      return {
        usd: portfolio?.dayPerformanceUSD ?? 0,
        percent: portfolio?.dayPerformancePercent ?? 0,
        label: 'Today'
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
    
    const labelMap = {
      '1W': 'Past Week',
      '1M': 'Past Month',
      '1Y': 'Past Year'
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
            exit={{ opacity: 0 }}
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
        ref={containerRef}
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl bg-white/95 dark:bg-[#121622]/90 backdrop-blur-md border border-slate-200 dark:border-slate-800/60 p-4 md:p-6 lg:p-8 shadow-xl container-3d-bevel pet-container-target relative w-full"
      >
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-blue-600 dark:text-blue-400 text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight">Portfolio Overview</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWidgetModalOpen(true)}
              className="flex items-center justify-center p-2 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-500 hover:text-blue-400 transition-all cursor-pointer shadow-sm"
              title="Add Widgets"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              onClick={handleResetLayout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/60 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-sm"
              title="Reset Grid Layout"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Layout</span>
            </button>
          </div>
        </div>
        
        <div className="flex flex-col gap-6">
          {/* Top Layer: Net Worth */}
          <div className="p-4 md:p-6 lg:p-8 rounded-xl bg-slate-50/50 dark:bg-[#0f111a]/40 border border-slate-200 dark:border-slate-800/50 shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-1">Net Worth</div>
                <div className={`text-3xl md:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-slate-100 dark:to-slate-400 tracking-tight font-num-${numberFont}`}>
                  <AnimatedNumber value={portfolio.totalValue} formatter={formatCurrency} startOffset={borrowedAmountJustNow} />
                </div>
              </div>
              
              <button
                onClick={() => setIsNetWorthExpanded(!isNetWorthExpanded)}
                onMouseDown={handlePulse}
                style={{ '--pulse-ring-color': 'rgba(148, 163, 184, 0.4)' } as React.CSSProperties}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 border border-slate-700/50 transition-all duration-200 hover:-translate-y-[0.5px] hover:scale-[1.01] hover:brightness-105 active:scale-[0.99] active:translate-y-[0.5px] shadow-md shrink-0"
                title="Toggle Borrowing Details"
              >
                {isNetWorthExpanded ? (
                  <ChevronUp className="h-5 w-5 text-blue-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-blue-400 animate-pulse" />
                )}
              </button>
            </div>

            {/* Collapsible Borrowing Details */}
            <AnimatePresence>
              {isNetWorthExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                  animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden border-t border-slate-200 dark:border-slate-800/50 pt-4"
                >
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <div className="text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-1">Borrowed Money</div>
                        <div className={`text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight font-num-${numberFont}`}>
                          ${(portfolio.borrowedAmount || 0).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-1">Interest Rate on Borrowed Money</div>
                        <div className={`text-xs md:text-sm font-extrabold text-amber-650 dark:text-amber-500 font-num-${numberFont}`}>
                          {((portfolio.interestRate || 0.08) * 100).toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 border-l border-slate-200 dark:border-slate-800/30 pl-6">
                      <div>
                        <div className="text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-1">Amount Owed</div>
                        <div className={`text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight font-num-${numberFont}`}>
                          ${(portfolio.amountOwed || 0).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-1">Amount Added Per Month</div>
                        <div className={`text-xs md:text-sm font-extrabold text-amber-650 dark:text-amber-500 font-num-${numberFont}`}>
                          ${(portfolio.monthlyInterest || 0).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Supporting Stats */}
          <div className="p-4 md:p-6 lg:p-8 rounded-xl bg-slate-50/50 dark:bg-[#0f111a]/30 border border-slate-200 dark:border-slate-800/40 shadow-sm backdrop-blur-sm transition-all hover:bg-slate-100/50 dark:hover:bg-[#0f111a]/40 duration-200 pet-container-target relative w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800/30">
              <div className="pb-4 md:pb-0 md:pr-6 w-full flex-1">
                <div className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">Available Cash</div>
                <div className={`text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-num-${numberFont}`}>
                  <AnimatedNumber value={portfolio.cash} formatter={formatNumberNoCurrency} startOffset={borrowedAmountJustNow} />
                </div>
              </div>

              <div className="py-4 md:py-0 md:px-6 w-full flex-1">
                <div className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">Total Performance</div>
                <div className="flex flex-col">
                  <div className={`text-2xl md:text-3xl font-black tracking-tight font-num-${numberFont} ${portfolio.totalPerformanceUSD >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-500'}`}>
                    {portfolio.totalPerformanceUSD >= 0 ? '+' : ''}
                    <AnimatedNumber value={portfolio.totalPerformanceUSD} formatter={formatNumberNoCurrency} />
                  </div>
                  <div className={`text-[11px] md:text-xs font-bold text-slate-455 dark:text-slate-500 mt-0.5 font-num-${numberFont}`}>
                    {portfolio.totalPerformancePercent >= 0 ? '+' : ''}
                    <AnimatedNumber value={portfolio.totalPerformancePercent} formatter={formatPercent} />
                  </div>
                </div>
              </div>

              <div className="pt-4 md:pt-0 md:pl-6 w-full flex-1">
                <div className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">Day Performance</div>
                <div className="flex flex-col">
                  <div className={`text-2xl md:text-3xl font-black tracking-tight font-num-${numberFont} ${portfolio.dayPerformanceUSD >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-500'}`}>
                    {portfolio.dayPerformanceUSD >= 0 ? '+' : ''}
                    <AnimatedNumber value={portfolio.dayPerformanceUSD} formatter={formatNumberNoCurrency} />
                  </div>
                  <div className={`text-[11px] md:text-xs font-bold text-slate-455 dark:text-slate-500 mt-0.5 font-num-${numberFont}`}>
                    {portfolio.dayPerformancePercent >= 0 ? '+' : ''}
                    <AnimatedNumber value={portfolio.dayPerformancePercent} formatter={formatPercent} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Dynamic Grid Layout Engine */}
      <Responsive
        className="layout w-full"
        width={mounted && width && width > 0 ? width : 1200}
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
            <div key={item.i}>
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
                  portfolio={portfolio}
                  chartData={chartData}
                  timeRange={timeRange}
                  setTimeRange={setTimeRange}
                  hoveredData={hoveredData}
                  setHoveredData={setHoveredData}
                  handleLookAchievement={handleLookAchievement}
                  numberFont={numberFont}
                  onOpenTradeModal={() => router.push('/dashboard/explore')}
                  borrowedAmountJustNow={borrowedAmountJustNow}
                />
              </DashboardWidgetCard>
            </div>
          );
        })}
      </Responsive>

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
              className="bg-white/95 dark:bg-[#121622]/95 border border-slate-200 dark:border-slate-800/60 rounded-2xl p-6 w-full max-w-2xl shadow-2xl flex flex-col gap-6 backdrop-blur-xl"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-slate-900 dark:text-white font-extrabold text-xl tracking-tight">Widget Selection & Management</h3>
                  <p className="text-slate-505 dark:text-slate-400 text-xs mt-1 font-semibold">Enable or restore widgets on your grid canvas.</p>
                </div>
                <button 
                  onClick={() => setWidgetModalOpen(false)} 
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors shadow-inner"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {Object.values(WIDGET_REGISTRY).map((widget) => {
                  const isVisible = !hiddenWidgetIds.includes(widget.id);
                  return (
                    <div 
                      key={widget.id}
                      onClick={() => {
                        if (!isVisible) {
                          handleAddWidget(widget.id);
                        }
                      }}
                      className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                        isVisible
                          ? 'bg-slate-100/50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 opacity-60 cursor-default'
                          : 'bg-blue-600/10 dark:bg-blue-950/40 border-blue-500/40 hover:bg-blue-600/20 cursor-pointer shadow-md'
                      }`}
                    >
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{widget.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">{widget.description}</p>
                      </div>
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg ${
                        isVisible ? 'bg-slate-200 dark:bg-slate-800 text-slate-500' : 'bg-blue-500 text-white shadow-sm'
                      }`}>
                        {isVisible ? 'Active' : '+ Add'}
                      </span>
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
              className="bg-white/95 dark:bg-[#121622]/95 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl backdrop-blur-md"
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
