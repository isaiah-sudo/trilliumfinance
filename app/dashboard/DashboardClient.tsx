'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Lock, Heart, TreePine, X, Trophy, Rocket, Gem, Crown, PieChart, Zap, Flame } from 'lucide-react';
import PortfolioChart from '@/components/PortfolioChart';
import { getGraphData } from '@/app/actions/trading';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { ACHIEVEMENTS, getUserAchievements } from '@/app/actions/achievements';
import { useSettings } from '@/context/SettingsContext';
import { AnimatedNumber } from '@/components/ui';


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
      onClick={handleCardClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => { if (detailedTrophies) setIsHovered(true); }}
      onMouseLeave={handleMouseLeave}
      className={`relative w-44 h-44 aspect-square rounded-2xl border flex flex-col items-center justify-center gap-2 overflow-hidden cursor-pointer select-none transition-[border-color,background-color,box-shadow,ring] duration-200 ${style.border} ${
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
  const { numberFont } = useSettings();
  const [showDetails, setShowDetails] = useState(true);
  
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

  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [tradeTicker, setTradeTicker] = useState('');
  const [tradeQty, setTradeQty] = useState(1);
  const [tradeLoading, setTradeLoading] = useState(false);
  const [tradeError, setTradeError] = useState('');

  const [activeWidget, setActiveWidget] = useState<string | null>(null);
  const [widgetModalOpen, setWidgetModalOpen] = useState(false);

  useEffect(() => {
    const savedWidget = localStorage.getItem('dashboard_active_widget');
    if (savedWidget) {
      setActiveWidget(savedWidget);
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
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
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
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        <p className="font-medium animate-pulse">Syncing with markets...</p>
      </div>
    );
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

  const marketValue = portfolio.totalMarketValue;

  return (
    <div className="space-y-6 relative">
      {/* Financial Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl bg-[#1a2133]/90 backdrop-blur-md border border-slate-700/50 p-6 shadow-2xl"
      >
        <h2 className="text-teal-400 text-xl md:text-2xl font-extrabold tracking-tight mb-6">Financial Summary</h2>
        
        <div className="flex flex-col gap-6">
          {/* Top Layer: Net Worth */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-[#1e293b]/40 to-[#0f172a]/20 border border-slate-700/30 shadow-[0_4px_0_0_#e2e8f0] dark:shadow-[0_4px_0_0_#0f111a]">
            <div className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-1">Net Worth</div>
            <div className={`text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 tracking-tight font-num-${numberFont}`}>
              <AnimatedNumber value={portfolio.totalValue} formatter={formatCurrency} />
            </div>
          </div>

          {/* Lower Layer: Supporting Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Available Cash */}
            <div className="p-4 rounded-xl bg-[#1e293b]/30 border border-slate-700/20 shadow-[0_4px_0_0_#e2e8f0] dark:shadow-[0_4px_0_0_#0f111a]">
              <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">Available Cash</div>
              <div className={`text-xl font-extrabold text-white tracking-tight font-num-${numberFont}`}>
                <AnimatedNumber value={portfolio.cash} formatter={formatNumberNoCurrency} />
              </div>
            </div>

            {/* Total Performance */}
            <div className="p-4 rounded-xl bg-[#1e293b]/30 border border-slate-700/20 shadow-[0_4px_0_0_#e2e8f0] dark:shadow-[0_4px_0_0_#0f111a]">
              <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">Total Performance</div>
              <div className={`text-xl font-extrabold tracking-tight font-num-${numberFont} ${portfolio.totalPerformanceUSD >= 0 ? 'text-teal-400' : 'text-rose-500'}`}>
                {portfolio.totalPerformanceUSD >= 0 ? '+' : ''}
                <AnimatedNumber value={portfolio.totalPerformanceUSD} formatter={formatNumberNoCurrency} />
              </div>
              <div className={`text-[11px] font-bold text-slate-500 mt-0.5 font-num-${numberFont}`}>
                {portfolio.totalPerformancePercent >= 0 ? '+' : ''}
                <AnimatedNumber value={portfolio.totalPerformancePercent} formatter={formatPercent} />
              </div>
            </div>

            {/* Day Performance */}
            <div className="p-4 rounded-xl bg-[#1e293b]/30 border border-slate-700/20 shadow-[0_4px_0_0_#e2e8f0] dark:shadow-[0_4px_0_0_#0f111a]">
              <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">Day Performance</div>
              <div className={`text-xl font-extrabold tracking-tight font-num-${numberFont} ${portfolio.dayPerformanceUSD >= 0 ? 'text-teal-400' : 'text-rose-500'}`}>
                {portfolio.dayPerformanceUSD >= 0 ? '+' : ''}
                <AnimatedNumber value={portfolio.dayPerformanceUSD} formatter={formatNumberNoCurrency} />
              </div>
              <div className={`text-[11px] font-bold text-slate-500 mt-0.5 font-num-${numberFont}`}>
                {portfolio.dayPerformancePercent >= 0 ? '+' : ''}
                <AnimatedNumber value={portfolio.dayPerformancePercent} formatter={formatPercent} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-700/50 flex justify-center">
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-slate-200 tracking-widest uppercase transition-colors"
          >
            {showDetails ? 'Hide Details' : 'Show XP & Trophies'} 
            {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 p-6 rounded-2xl bg-[#1e293b]/50 border border-slate-700/50 flex flex-col md:flex-row gap-8 overflow-hidden"
            >
              {/* Left Side: Experience */}
              <div className="flex-1">
                <h3 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-4">Your Experience</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className={`text-4xl font-extrabold text-blue-500 font-num-${numberFont}`}>
                    <AnimatedNumber value={xp} formatter={(val) => Math.round(val).toString()} />
                  </span>
                  <span className="text-sm font-bold text-slate-400">XP</span>
                </div>
                
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-2">
                  <div className="flex items-center gap-1.5">
                    <TreePine className="h-4 w-4 text-green-500" />
                    <span>{levelInfo?.name || 'Novice'}</span>
                  </div>
                  <div className="text-slate-500">Next: {levelInfo?.nextName || 'Rookie'}</div>
                </div>
                
                {/* Progress Bar */}
                <div className="group/xpbar relative w-full h-1.5 hover:h-5 rounded-full bg-slate-800 cursor-pointer overflow-hidden transition-all duration-350 flex items-center justify-center">
                   <div className="absolute left-0 top-0 h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] transition-all duration-350" style={{ width: `${levelInfo?.progress || 0}%` }} />
                   <span className="relative z-10 text-[9px] font-black text-white opacity-0 group-hover/xpbar:opacity-100 transition-opacity duration-300 tracking-wider">
                     {levelInfo?.accumulated || 0} / {levelInfo?.maxXp || 100} XP
                   </span>
                </div>

                {/* Widget Slot Container */}
                <div className="mt-6">
                  <h4 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-2">Custom Widget</h4>
                  {activeWidget === 'streak' ? (
                    <div className="relative w-full p-4 rounded-xl bg-[#0f111a]/60 border border-slate-700/40 shadow-inner flex flex-col justify-center min-h-[90px]">
                      {/* Mini X Button in Top Right */}
                      <button 
                        onClick={() => setWidgetModalOpen(true)}
                        className="absolute top-2.5 right-2.5 text-slate-500 hover:text-white transition-colors"
                        title="Change widget"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>

                      {/* Streak Map Content */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Login Streak Map: {streakCount} Days
                          </span>
                        </div>
                        <div className="relative w-full flex items-center justify-between h-8 px-2 mt-1">
                          {/* Dotted line */}
                          <div className="absolute left-2.5 right-2.5 top-1/2 -translate-y-1/2 border-t-2 border-dotted border-slate-700 h-0" />
                          
                          {/* Filled green line */}
                          {streakCount > 1 && (
                            <div 
                              className="absolute left-2.5 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-500 transition-all duration-500"
                              style={{ 
                                width: `${((streakCount - 1) / 6) * 100}%`,
                                maxWidth: 'calc(100% - 20px)' 
                              }} 
                            />
                          )}

                          {/* 7 circles */}
                          {Array.from({ length: 7 }).map((_, index) => {
                            const day = index + 1;
                            const isDone = day <= streakCount;
                            const isMilestone = day === 7;
                            return (
                              <div key={day} className="relative z-10 flex flex-col items-center group/day">
                                <div 
                                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black transition-all duration-350 border-2 ${
                                    isDone 
                                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_8px_rgba(16,185,129,0.6)]' 
                                      : 'bg-slate-800 border-slate-700 text-slate-500'
                                  }`}
                                >
                                  {isMilestone ? '👑' : day}
                                </div>
                                <div className="absolute bottom-full mb-1.5 opacity-0 pointer-events-none group-hover/day:opacity-100 transition-opacity duration-200 bg-slate-900 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap z-[60]">
                                  Day {day}: {isMilestone ? '+40 XP' : '+10 XP'} {isDone ? '(Done)' : ''}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setWidgetModalOpen(true)}
                      className="w-full h-[90px] rounded-xl border border-dashed border-slate-700 hover:border-slate-500 bg-[#0f111a]/20 hover:bg-[#0f111a]/40 transition-all duration-300 flex items-center justify-center group"
                    >
                      <div className="flex flex-col items-center justify-center gap-1">
                        <span className="text-2xl text-slate-500 group-hover:text-blue-500 transition-colors group-hover:scale-110 duration-300">+</span>
                        <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-300 transition-colors uppercase tracking-wider">Add Widget</span>
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Right Side: Top Trophies */}
              <div className="flex-[2] md:pl-8 md:border-l border-slate-700/50 mt-8 md:mt-0 flex flex-col">
                <div className="flex justify-between items-center mb-6 w-full">
                  <button 
                    onClick={() => setCustomizerOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/50 text-[10px] font-extrabold text-slate-300 hover:text-white hover:border-slate-500 transition-all shadow-inner uppercase tracking-wider"
                  >
                    ⚙️ Customize Trophies
                  </button>
                  <h3 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase text-right">Top Trophies</h3>
                </div>
                
                <div className="flex flex-wrap gap-6 justify-center items-center mx-auto w-full">
                  {(() => {
                    if (selectedTrophyIds.length === 0) {
                      return (
                        <div className="text-slate-500 text-xs font-semibold py-8 italic text-center w-full">No trophies selected. Click Customize to curate your showcase!</div>
                      );
                    }

                    return selectedTrophyIds.map((tid) => {
                      const trophy = ACHIEVEMENTS.find(a => a.id === tid);
                      if (!trophy) return null;
                      return (
                        <TrophyCard
                          key={tid}
                          id={trophy.id}
                          title={trophy.title}
                          description={trophy.description}
                          iconType={trophy.iconType}
                        />
                      );
                    });
                  })()}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>

      {/* Market Value Card with Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-3xl bg-[#1a2133]/90 backdrop-blur-md border border-slate-700/50 p-6 shadow-2xl"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-slate-400 text-[11px] font-bold tracking-widest uppercase">Market Value</h2>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#0f111a] border border-slate-700/50 text-[10px] font-bold text-slate-300 shadow-inner">
                <Lock className="h-3 w-3" /> Live Market
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#0f111a] border border-slate-700/50 text-[10px] font-bold text-slate-300 shadow-inner">
                vs SPY
              </span>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-baseline gap-3">
            <div className={`text-3xl font-extrabold text-white tracking-tight font-num-${numberFont}`}>
              <AnimatedNumber value={marketValue} formatter={formatNumberNoCurrency} />
            </div>
            <div className={`text-[13px] font-bold font-num-${numberFont} ${portfolio.dayPerformanceUSD >= 0 ? 'text-teal-400' : 'text-rose-500'}`}>
              {portfolio.dayPerformanceUSD >= 0 ? '+' : ''}
              <AnimatedNumber value={portfolio.dayPerformanceUSD} formatter={formatNumberNoCurrency} />
              <span> (</span>
              {portfolio.dayPerformancePercent >= 0 ? '+' : ''}
              <AnimatedNumber value={portfolio.dayPerformancePercent} formatter={formatPercent} />
              <span>)</span>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3 text-[11px] font-semibold">
            <div className="flex items-center gap-2 text-teal-400">
              <div className="w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)]" /> Portfolio
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <div className="w-2 h-2 rounded-full bg-slate-400" /> SPY
            </div>
          </div>
        </div>

        <div className="w-full mt-4">
          <PortfolioChart data={chartData || { portfolio: [], benchmark: [] }} timeRange={timeRange} onTimeRangeChange={setTimeRange} />
        </div>
      </motion.div>

      {/* Holdings Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-3xl bg-[#1a2133]/90 backdrop-blur-md border border-slate-700/50 p-6 shadow-2xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-lg font-bold tracking-tight">Holdings Breakdown</h2>
          <button 
            onClick={() => setTradeModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-[0_0_15px_rgba(37,99,235,0.4)]"
          >
            + Buy Stocks
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold whitespace-nowrap">
            <thead className="text-slate-500 border-b border-slate-700/50">
              <tr>
                <th className="pb-3 pr-4 font-semibold uppercase tracking-wider text-[10px]">Symbol</th>
                <th className="pb-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Name</th>
                <th className={`pb-3 px-4 font-semibold uppercase tracking-wider text-[10px] text-right font-num-${numberFont}`}>Qty</th>
                <th className={`pb-3 px-4 font-semibold uppercase tracking-wider text-[10px] text-right font-num-${numberFont}`}>Avg Price</th>
                <th className={`pb-3 px-4 font-semibold uppercase tracking-wider text-[10px] text-right font-num-${numberFont}`}>Market Value</th>
                <th className={`pb-3 px-4 font-semibold uppercase tracking-wider text-[10px] text-right font-num-${numberFont}`}>Day P/L</th>
                <th className={`pb-3 px-4 font-semibold uppercase tracking-wider text-[10px] text-right font-num-${numberFont}`}>P/L %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30 text-slate-300">
              {!Array.isArray(portfolio.holdings) || portfolio.holdings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">No holdings yet. Start trading!</td>
                </tr>
              ) : portfolio.holdings.map((h: any) => (
                <tr key={h.symbol} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 pr-4 text-blue-400 font-bold">{h.symbol}</td>
                  <td className="py-4 px-4">{h.name}</td>
                  <td className={`py-4 px-4 text-right font-num-${numberFont}`}>{h.qty}</td>
                  <td className={`py-4 px-4 text-right font-num-${numberFont}`}>{formatNumberNoCurrency(h.avgPrice)}</td>
                  <td className={`py-4 px-4 text-right text-white font-bold font-num-${numberFont}`}>{formatNumberNoCurrency(h.marketValue)}</td>
                  <td className={`py-4 px-4 text-right font-num-${numberFont} ${h.dayPl >= 0 ? 'text-teal-400' : 'text-rose-500'}`}>
                    {h.dayPl >= 0 ? '+' : ''}{formatNumberNoCurrency(h.dayPl)}
                  </td>
                  <td className={`py-4 px-4 text-right font-num-${numberFont} ${h.plPercent >= 0 ? 'text-teal-400' : 'text-rose-500'}`}>
                    {h.plPercent >= 0 ? '+' : ''}{formatPercent(h.plPercent)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Customizer Modal */}
      <AnimatePresence>
        {customizerOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1a2133] border border-slate-700 rounded-3xl p-6 w-full max-w-4xl max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col gap-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-white font-extrabold text-xl tracking-tight">Curate Your Trophy Showcase</h3>
                  <p className="text-slate-400 text-xs mt-1">Select up to 3 unlocked trophies to showcase prominently on your dashboard profile.</p>
                </div>
                <button 
                  onClick={() => setCustomizerOpen(false)} 
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800/80 border border-slate-700/50 text-slate-400 hover:text-white transition-colors shadow-inner"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Selected Top Trophies Showcase */}
              <div>
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">Selected Top Trophies (Max 3)</h4>
                <div className="flex flex-wrap gap-6 justify-center min-h-[200px] p-4 rounded-2xl bg-[#0f111a]/50 border border-slate-800 shadow-inner">
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

              {/* Styled Separating Line */}
              <div className="relative py-2 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700/50"></div>
                </div>
                <span className="relative bg-[#1a2133] px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Available Unlocked Trophies
                </span>
              </div>              {/* Unlocked Trophies Selection */}
              <div>
                <div className="flex flex-wrap gap-6 justify-center p-4 rounded-2xl bg-[#0f111a]/30 border border-slate-800/30">
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
                            return 'text-slate-300 font-semibold';
                          default:
                            return 'text-orange-500 font-medium';
                        }
                      };

                      return (
                        <div key={`unlocked-${trophy.id}`} className="flex flex-col items-center gap-2 p-2 bg-[#1e293b]/20 border border-slate-800/30 rounded-2xl hover:bg-[#1e293b]/40 transition-colors duration-200">
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

      {/* Trade Modal */}
      <AnimatePresence>
        {tradeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1a2133] border border-slate-700 rounded-3xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-bold text-lg">Trade Stock</h3>
                <button onClick={() => setTradeModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
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
                
                {tradeError && <div className="text-rose-500 text-xs font-bold">{tradeError}</div>}
                
                <div className="flex gap-4 pt-2">
                  <button 
                    onClick={() => executeTradeSubmit('BUY')}
                    disabled={tradeLoading || !tradeTicker}
                    className="flex-1 bg-teal-500 hover:bg-teal-400 text-white font-bold py-3 rounded-xl transition-colors shadow-[0_0_15px_rgba(20,184,166,0.3)] disabled:opacity-50"
                  >
                    {tradeLoading ? 'Processing...' : 'Buy'}
                  </button>
                  <button 
                    onClick={() => executeTradeSubmit('SELL')}
                    disabled={tradeLoading || !tradeTicker}
                    className="flex-1 bg-rose-500 hover:bg-rose-400 text-white font-bold py-3 rounded-xl transition-colors shadow-[0_0_15px_rgba(244,63,94,0.3)] disabled:opacity-50"
                  >
                    {tradeLoading ? 'Processing...' : 'Sell'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Widget Modal */}
      <AnimatePresence>
        {widgetModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1a2133] border border-slate-700 rounded-3xl p-6 w-full max-w-2xl shadow-2xl flex flex-col gap-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-white font-extrabold text-xl tracking-tight">Select a Widget</h3>
                  <p className="text-slate-400 text-xs mt-1 font-semibold">Choose a widget to display under your level details.</p>
                </div>
                <button 
                  onClick={() => setWidgetModalOpen(false)} 
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800/80 border border-slate-700/50 text-slate-400 hover:text-white transition-colors shadow-inner"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Grid Layout: 2 rows and 4 columns */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                {/* Streak Map Widget */}
                <div 
                  onClick={() => handleSelectWidget('streak')}
                  className="relative cursor-pointer group flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-700 bg-slate-800/40 hover:bg-slate-800/80 hover:border-emerald-500/60 transition-all duration-300 min-h-[120px] text-center"
                >
                  <Flame className="h-8 w-8 text-emerald-400 mb-2 group-hover:animate-bounce" />
                  <span className="text-xs font-bold text-slate-100">Streak Map</span>
                  <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Track Daily Streak</span>
                </div>

                {/* Locked Widget 2 */}
                <div className="relative group flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-800 bg-slate-900/40 opacity-50 min-h-[120px] text-center select-none">
                  <Lock className="absolute top-2.5 right-2.5 h-3.5 w-3.5 text-slate-600" />
                  <PieChart className="h-8 w-8 text-slate-600 mb-2" />
                  <span className="text-xs font-bold text-slate-500">Value Sparkline</span>
                  <span className="text-[9px] font-bold text-slate-600 mt-1 uppercase tracking-wider">Coming Soon</span>
                </div>

                {/* Locked Widget 3 */}
                <div className="relative group flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-800 bg-slate-900/40 opacity-50 min-h-[120px] text-center select-none">
                  <Lock className="absolute top-2.5 right-2.5 h-3.5 w-3.5 text-slate-600" />
                  <Zap className="h-8 w-8 text-slate-600 mb-2" />
                  <span className="text-xs font-bold text-slate-500">Quick Trade</span>
                  <span className="text-[9px] font-bold text-slate-600 mt-1 uppercase tracking-wider">Coming Soon</span>
                </div>

                {/* Locked Widget 4 */}
                <div className="relative group flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-800 bg-slate-900/40 opacity-50 min-h-[120px] text-center select-none">
                  <Lock className="absolute top-2.5 right-2.5 h-3.5 w-3.5 text-slate-600" />
                  <Rocket className="h-8 w-8 text-slate-600 mb-2" />
                  <span className="text-xs font-bold text-slate-500">Market Watch</span>
                  <span className="text-[9px] font-bold text-slate-600 mt-1 uppercase tracking-wider">Coming Soon</span>
                </div>

                {/* Locked Widget 5 */}
                <div className="relative group flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-800 bg-slate-900/40 opacity-50 min-h-[120px] text-center select-none">
                  <Lock className="absolute top-2.5 right-2.5 h-3.5 w-3.5 text-slate-600" />
                  <Crown className="h-8 w-8 text-slate-600 mb-2" />
                  <span className="text-xs font-bold text-slate-500">Leaderboard</span>
                  <span className="text-[9px] font-bold text-slate-600 mt-1 uppercase tracking-wider">Coming Soon</span>
                </div>

                {/* Locked Widget 6 */}
                <div className="relative group flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-800 bg-slate-900/40 opacity-50 min-h-[120px] text-center select-none">
                  <Lock className="absolute top-2.5 right-2.5 h-3.5 w-3.5 text-slate-600" />
                  <Trophy className="h-8 w-8 text-slate-600 mb-2" />
                  <span className="text-xs font-bold text-slate-500">Trophy Case</span>
                  <span className="text-[9px] font-bold text-slate-600 mt-1 uppercase tracking-wider">Coming Soon</span>
                </div>

                {/* Locked Widget 7 */}
                <div className="relative group flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-800 bg-slate-900/40 opacity-50 min-h-[120px] text-center select-none">
                  <Lock className="absolute top-2.5 right-2.5 h-3.5 w-3.5 text-slate-600" />
                  <Heart className="h-8 w-8 text-slate-600 mb-2" />
                  <span className="text-xs font-bold text-slate-500">Daily Quest</span>
                  <span className="text-[9px] font-bold text-slate-600 mt-1 uppercase tracking-wider">Coming Soon</span>
                </div>

                {/* Locked Widget 8 */}
                <div className="relative group flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-800 bg-slate-900/40 opacity-50 min-h-[120px] text-center select-none">
                  <Lock className="absolute top-2.5 right-2.5 h-3.5 w-3.5 text-slate-600" />
                  <Gem className="h-8 w-8 text-slate-600 mb-2" />
                  <span className="text-xs font-bold text-slate-500">AI Advisor</span>
                  <span className="text-[9px] font-bold text-slate-600 mt-1 uppercase tracking-wider">Coming Soon</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
