'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Palette,
  TrendingUp,
  SlidersHorizontal,
  GraduationCap,
  Moon,
  Sun,
  Eye,
  EyeOff,
  ShieldCheck,
  Volume2,
  VolumeX,
  RefreshCw,
  AlertTriangle,
  Check,
  Copy,
  Download,
  RotateCcw,
  Search,
  Sparkles,
  Layers,
  Activity,
  Lock,
  Unlock,
  Play,
  CheckCircle2,
  Sliders,
  DollarSign,
  Briefcase,
  Zap,
} from 'lucide-react';
import { useSettings, ChartStyle, Timeframe, OrderType, TickerSpeed, FontType } from '@/context/SettingsContext';
import { useDashboardSettings } from '@/context/DashboardSettingsContext';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { useAuth } from '@/context/AuthContext';
import { joinClassroom } from '@/app/actions/edu';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const LOCAL_STORAGE_LAYOUT_KEY = 'trillium_dashboard_layouts_v2';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'Graphics' | 'Market' | 'Filters' | 'Linked';

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { user } = useAuth();
  const {
    theme,
    numberFont,
    textFont,
    detailedTrophies,
    showPets,
    privacyMode,
    chartStyle,
    defaultTimeframe,
    showSparklines,
    compactLayout,
    reducedMotion,

    orderConfirmation,
    defaultOrderType,
    defaultTradeQuantity,
    marketRefreshInterval,
    pennyStockWarning,
    soundEffects,
    soundVolume,

    defaultExplorerSort,
    defaultExplorerCategory,
    newsSentimentFilter,
    hidePennyStocks,
    tickerSpeed,

    notifyPriceAlerts,
    notifyStreakReminders,
    notifyClassroomUpdates,

    setTheme,
    setNumberFont,
    setTextFont,
    setDetailedTrophies,
    setShowPets,
    setPrivacyMode,
    setChartStyle,
    setDefaultTimeframe,
    setShowSparklines,
    setCompactLayout,
    setReducedMotion,

    setOrderConfirmation,
    setDefaultOrderType,
    setDefaultTradeQuantity,
    setMarketRefreshInterval,
    setPennyStockWarning,
    setSoundEffects,
    setSoundVolume,

    setDefaultExplorerSort,
    setDefaultExplorerCategory,
    setNewsSentimentFilter,
    setHidePennyStocks,
    setTickerSpeed,

    setNotifyPriceAlerts,
    setNotifyStreakReminders,
    setNotifyClassroomUpdates,

    playSound,
    resetAllSettings,
  } = useSettings();

  const { role, classCode, className, settings: classSettings, teacherPreviewMode, setTeacherPreviewMode } = useDashboardSettings();
  const { portfolio } = usePortfolioStore();

  const [activeTab, setActiveTab] = useState<TabType>('Graphics');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinMessage, setJoinMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyClassCode = () => {
    if (classCode) {
      navigator.clipboard.writeText(classCode);
      setCopiedCode(true);
      playSound('click');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleResetLayout = async () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_LAYOUT_KEY);
      if (user?.uid) {
        const userDocRef = doc(db, 'users', user.uid, 'settings', 'dashboardLayout');
        await setDoc(userDocRef, { layouts: null, updatedAt: new Date().toISOString() }, { merge: true });
      }
      setResetSuccess(true);
      playSound('toggle');
      setTimeout(() => {
        setResetSuccess(false);
        window.location.reload();
      }, 1200);
    } catch (e) {
      console.error('Failed to reset dashboard layout:', e);
    }
  };

  const handleExportData = () => {
    try {
      const exportPayload = {
        exportedAt: new Date().toISOString(),
        user: {
          uid: user?.uid,
          email: user?.email,
          role,
          classroom: className || null,
        },
        portfolioSummary: portfolio || 'No portfolio snapshot loaded',
        preferences: {
          theme,
          numberFont,
          textFont,
          chartStyle,
          defaultTimeframe,
          orderConfirmation,
          defaultOrderType,
          soundEffects,
        },
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `trillium_portfolio_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setExportSuccess(true);
      playSound('achievement');
      setTimeout(() => setExportSuccess(false), 2500);
    } catch (e) {
      console.error('Failed to export data:', e);
    }
  };

  const handleJoinClassInline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    setJoinLoading(true);
    setJoinMessage(null);
    try {
      const studentName = user?.displayName || user?.email?.split('@')[0] || 'Student';
      const res = await joinClassroom(joinCodeInput.trim().toUpperCase(), studentName);
      if (res.success) {
        setJoinMessage({ type: 'success', text: `Joined ${res.className || 'Classroom'}!` });
        playSound('achievement');
        setJoinCodeInput('');
      } else {
        setJoinMessage({ type: 'error', text: 'Class not found. Please check code.' });
        playSound('alert');
      }
    } catch (err: any) {
      setJoinMessage({ type: 'error', text: err.message || 'Failed to join class.' });
      playSound('alert');
    } finally {
      setJoinLoading(false);
    }
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'Graphics', label: 'Graphics', icon: <Palette className="h-4 w-4" />, desc: 'Display & Aesthetics' },
    { id: 'Market', label: 'Market & Trading', icon: <TrendingUp className="h-4 w-4" />, desc: 'Execution & Audio' },
    { id: 'Filters', label: 'Filters & Feed', icon: <SlidersHorizontal className="h-4 w-4" />, desc: 'Explorer & News' },
    { id: 'Linked', label: 'Classroom & Data', icon: <GraduationCap className="h-4 w-4" />, desc: 'Rules & Management' },
  ];

  const q = searchQuery.toLowerCase().trim();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-slate-700/80 rounded-3xl w-full max-w-2xl max-h-[90dvh] flex flex-col shadow-2xl relative overflow-hidden transition-all">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 pb-3 border-b border-slate-200 dark:border-slate-800/80 shrink-0">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <Sliders className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-slate-900 dark:text-white font-black text-xl sm:text-2xl tracking-tight leading-none">
                  Preferences & Settings
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                  Customize interface visuals, trading execution, data filters, and classroom settings.
                </p>
              </div>
            </div>
            <button
              onClick={() => { playSound('click'); onClose(); }}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Close Settings"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search settings (e.g., sound, privacy, font, orders, classroom)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0c101a] border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Tab Navigation */}
          {!q && (
            <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-1">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { playSound('click'); setActiveTab(tab.id); }}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs font-bold rounded-xl transition-all duration-150 whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/60 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Scrollable Content Panel */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
          
          {/* ---------------- 1. GRAPHICS TAB ---------------- */}
          {(q ? ('theme font display mode privacy chart sparkline trophy pet motion'.includes(q)) : activeTab === 'Graphics') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 dark:border-slate-800/60">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Visual Appearance & Typography
                </span>
              </div>

              {/* Theme Mode Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0c101a]/70 border border-slate-200/70 dark:border-slate-800/60 transition-all hover:border-slate-300 dark:hover:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 dark:text-blue-400">
                    {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-amber-500" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      Theme Mode
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {theme}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Select deep dark mode for terminals or high-clarity light mode
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const next = theme === 'dark' ? 'light' : 'dark';
                    playSound('toggle');
                    setTheme(next);
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
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

              {/* Privacy Mode Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0c101a]/70 border border-slate-200/70 dark:border-slate-800/60 transition-all hover:border-slate-300 dark:hover:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 dark:text-purple-400">
                    {privacyMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      Privacy Mode (Mask Balances)
                      {privacyMode && (
                        <span className="text-[9px] font-black px-1.5 py-0.2 rounded uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Obscure portfolio balances with •••••• for classroom presentation and streaming
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    playSound('toggle');
                    setPrivacyMode(!privacyMode);
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    privacyMode ? 'bg-purple-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      privacyMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Text Font Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0c101a]/70 border border-slate-200/70 dark:border-slate-800/60 gap-3">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Text Typeface</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Select typography for headings, menus, and descriptions
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {(['sans', 'serif', 'mono'] as const).map((font) => (
                    <button
                      key={`txt-${font}`}
                      onClick={() => { playSound('click'); setTextFont(font); }}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-xl border transition-all cursor-pointer ${
                        textFont === font
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                      } ${font === 'mono' ? 'font-mono' : font === 'serif' ? 'font-serif' : 'font-sans'}`}
                    >
                      {font.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Number Font Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0c101a]/70 border border-slate-200/70 dark:border-slate-800/60 gap-3">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Numeric / Price Typeface</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Layout styling for ticker prices, percent deltas, and chart scales
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {(['sans', 'serif', 'mono'] as const).map((font) => (
                    <button
                      key={`num-${font}`}
                      onClick={() => { playSound('click'); setNumberFont(font); }}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-xl border transition-all cursor-pointer ${
                        numberFont === font
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                      } ${font === 'mono' ? 'font-mono' : font === 'serif' ? 'font-serif' : 'font-sans'}`}
                    >
                      {font.toUpperCase()} (123)
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 pb-1 border-b border-slate-200/60 dark:border-slate-800/60">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Charts & Dashboards
                </span>
              </div>

              {/* Chart Style */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0c101a]/70 border border-slate-200/70 dark:border-slate-800/60 gap-3">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Default Chart Type</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Choose between clean area graphs and candlestick candles
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {(['line', 'candlestick'] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => { playSound('click'); setChartStyle(style); }}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-xl border transition-all cursor-pointer capitalize ${
                        chartStyle === style
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      {style === 'line' ? 'Smooth Line' : 'Candlestick'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Default Chart Timeframe */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0c101a]/70 border border-slate-200/70 dark:border-slate-800/60 gap-3">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Default Time Horizon</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Pre-selected period for portfolio and asset price graphs
                  </div>
                </div>
                <div className="flex gap-1">
                  {(['1D', '1W', '1M', '1Y', 'ALL'] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => { playSound('click'); setDefaultTimeframe(tf); }}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                        defaultTimeframe === tf
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Sparklines */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#0c101a]/70 border border-slate-200/70 dark:border-slate-800/60">
                  <div>
                    <div className="text-[11px] font-bold text-slate-900 dark:text-white">Card Sparklines</div>
                    <div className="text-[9px] text-slate-500 dark:text-slate-400">Mini price trends on cards</div>
                  </div>
                  <button
                    onClick={() => { playSound('toggle'); setShowSparklines(!showSparklines); }}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                      showSparklines ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        showSparklines ? 'translate-x-4.5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* Detailed Trophies */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#0c101a]/70 border border-slate-200/70 dark:border-slate-800/60">
                  <div>
                    <div className="text-[11px] font-bold text-slate-900 dark:text-white">Trophy Details</div>
                    <div className="text-[9px] text-slate-500 dark:text-slate-400">Rarity animations on hover</div>
                  </div>
                  <button
                    onClick={() => { playSound('toggle'); setDetailedTrophies(!detailedTrophies); }}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                      detailedTrophies ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        detailedTrophies ? 'translate-x-4.5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* Show Mascot / Pets */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#0c101a]/70 border border-slate-200/70 dark:border-slate-800/60">
                  <div>
                    <div className="text-[11px] font-bold text-slate-900 dark:text-white">Dashboard Mascot</div>
                    <div className="text-[9px] text-slate-500 dark:text-slate-400">Show companion pet</div>
                  </div>
                  <button
                    onClick={() => { playSound('toggle'); setShowPets(!showPets); }}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                      showPets ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        showPets ? 'translate-x-4.5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* Reduced Motion */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#0c101a]/70 border border-slate-200/70 dark:border-slate-800/60">
                  <div>
                    <div className="text-[11px] font-bold text-slate-900 dark:text-white">Reduced Motion</div>
                    <div className="text-[9px] text-slate-500 dark:text-slate-400">Disable pulsing glows</div>
                  </div>
                  <button
                    onClick={() => { playSound('toggle'); setReducedMotion(!reducedMotion); }}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                      reducedMotion ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        reducedMotion ? 'translate-x-4.5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- 2. MARKET & TRADING TAB ---------------- */}
          {(q ? ('market trade order sound volume confirm penny execution rate refresh'.includes(q)) : activeTab === 'Market') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 dark:border-slate-800/60">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Order Execution & Safeguards
                </span>
              </div>

              {/* Order Confirmation Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0c101a]/70 border border-slate-200/70 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      Order Confirmation Dialog
                      {orderConfirmation && (
                        <span className="text-[9px] font-black px-1.5 py-0.2 rounded uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Protected
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Prompt a confirmation review before submitting market buy/sell trades
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => { playSound('toggle'); setOrderConfirmation(!orderConfirmation); }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    orderConfirmation ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      orderConfirmation ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Default Order Type */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0c101a]/70 border border-slate-200/70 dark:border-slate-800/60 gap-3">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Default Order Type</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Pre-selected order method when opening stock trading drawers
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {(['market', 'limit'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => { playSound('click'); setDefaultOrderType(type); }}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-xl border transition-all cursor-pointer capitalize ${
                        defaultOrderType === type
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      {type === 'market' ? 'Market (Instant)' : 'Limit Order'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Share Quantity Presets */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0c101a]/70 border border-slate-200/70 dark:border-slate-800/60 gap-3">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Default Trade Quantity</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Initial share count autofilled when launching a new trade
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {[1, 5, 10, 25, 100].map((qty) => (
                    <button
                      key={qty}
                      onClick={() => { playSound('click'); setDefaultTradeQuantity(qty); }}
                      className={`px-2.5 py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                        defaultTradeQuantity === qty
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      {qty} {qty === 1 ? 'Share' : 'Shares'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto-Refresh Rate */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0c101a]/70 border border-slate-200/70 dark:border-slate-800/60 gap-3">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Market Quote Refresh Rate</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Frequency for streaming live price quotes from market sources
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {[
                    { sec: 5, label: '5s Real-time' },
                    { sec: 15, label: '15s Standard' },
                    { sec: 30, label: '30s Relaxed' },
                    { sec: 0, label: 'Manual' },
                  ].map(({ sec, label }) => (
                    <button
                      key={sec}
                      onClick={() => { playSound('click'); setMarketRefreshInterval(sec); }}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                        marketRefreshInterval === sec
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Penny Stock Warning Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0c101a]/70 border border-slate-200/70 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">High Volatility Guard</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Display advisory warnings when placing trades on penny stocks or volatile tickers
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => { playSound('toggle'); setPennyStockWarning(!pennyStockWarning); }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    pennyStockWarning ? 'bg-amber-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      pennyStockWarning ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 pb-1 border-b border-slate-200/60 dark:border-slate-800/60">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Audio & Sound Effects
                </span>
              </div>

              {/* Sound Effects Section */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0c101a]/70 border border-slate-200/70 dark:border-slate-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500 dark:text-cyan-400">
                      {soundEffects ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Platform Sound Effects</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Audio cues for filled orders, achievements, and milestone unlocks
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => playSound('trade')}
                      disabled={!soundEffects}
                      className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 disabled:opacity-40 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="h-2.5 w-2.5" /> Test Sound
                    </button>
                    <button
                      onClick={() => {
                        const next = !soundEffects;
                        setSoundEffects(next);
                        if (next) playSound('achievement');
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        soundEffects ? 'bg-cyan-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          soundEffects ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Volume Slider */}
                {soundEffects && (
                  <div className="flex items-center gap-3 pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 w-16">
                      Volume: {soundVolume}%
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={soundVolume}
                      onChange={(e) => setSoundVolume(Number(e.target.value))}
                      className="flex-1 accent-cyan-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ---------------- 3. FILTERS & FEED TAB ---------------- */}
          {(q ? ('filter feed news sentiment explore sector penny ticker speed sort'.includes(q)) : activeTab === 'Filters') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 dark:border-slate-800/60">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Stock Explorer Defaults
                </span>
              </div>

              {/* Default Sort */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0c101a]/70 border border-slate-200/70 dark:border-slate-800/60 gap-3">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Default Market Sort</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Initial order of assets displayed upon visiting the Explore terminal
                  </div>
                </div>
                <select
                  value={defaultExplorerSort}
                  onChange={(e) => { playSound('click'); setDefaultExplorerSort(e.target.value); }}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="default">Featured / Algorithmic</option>
                  <option value="gainers">Top Gainers First</option>
                  <option value="losers">Top Losers First</option>
                  <option value="price-high">Highest Price</option>
                  <option value="price-low">Lowest Price</option>
                  <option value="ticker">Ticker Alphabetical (A-Z)</option>
                </select>
              </div>

              {/* Default Sector Category */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0c101a]/70 border border-slate-200/70 dark:border-slate-800/60 gap-3">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Default Sector Category</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Pre-selected industry filter when browsing equities
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['All', 'Technology', 'Healthcare', 'Energy', 'Finance', 'Index'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { playSound('click'); setDefaultExplorerCategory(cat); }}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                        defaultExplorerCategory === cat
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hide Penny Stocks Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0c101a]/70 border border-slate-200/70 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Hide Micro-Cap / Penny Stocks</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Filter out equities priced below $5.00 from default discovery views
                  </div>
                </div>
                <button
                  onClick={() => { playSound('toggle'); setHidePennyStocks(!hidePennyStocks); }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    hidePennyStocks ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      hidePennyStocks ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 pb-1 border-b border-slate-200/60 dark:border-slate-800/60">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  News & Dashboard Feed
                </span>
              </div>

              {/* News Sentiment Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0c101a]/70 border border-slate-200/70 dark:border-slate-800/60 gap-3">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">News Sentiment Filter</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Filter news feed articles according to market outlook
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {[
                    { id: 'all', label: 'All Stories' },
                    { id: 'bullish', label: 'Bullish' },
                    { id: 'bearish', label: 'Bearish' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => { playSound('click'); setNewsSentimentFilter(s.id); }}
                      className={`px-3 py-1 text-[10px] font-bold rounded-xl border transition-all cursor-pointer ${
                        newsSentimentFilter === s.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ticker Tape Velocity */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0c101a]/70 border border-slate-200/70 dark:border-slate-800/60 gap-3">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Ticker Tape Velocity</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Speed of the scrolling live market quotes banner
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {(['off', 'slow', 'normal', 'fast'] as const).map((spd) => (
                    <button
                      key={spd}
                      onClick={() => { playSound('click'); setTickerSpeed(spd); }}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer capitalize ${
                        tickerSpeed === spd
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      {spd}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ---------------- 4. LINKED & CLASSROOM TAB ---------------- */}
          {(q ? ('classroom code student teacher rule rules export reset layout backup linked'.includes(q)) : activeTab === 'Linked') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 dark:border-slate-800/60">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Classroom Membership & Rulebook
                </span>
              </div>

              {/* Classroom Status Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/20 dark:from-[#0c101a] dark:to-blue-950/20 border border-slate-200/80 dark:border-slate-800">
                {classCode ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                            Active Classroom
                          </span>
                        </div>
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                          {className || 'Enrolled Class'}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 rounded-xl shadow-xs">
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase">Code:</span>
                          <span className="font-mono text-xs font-black text-blue-600 dark:text-blue-400">
                            {classCode}
                          </span>
                          <button
                            onClick={handleCopyClassCode}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
                            title="Copy code"
                          >
                            {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Active Rules Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50">
                        <div className="text-[9px] font-bold text-slate-400 uppercase">Starting Balance</div>
                        <div className="text-xs font-black text-slate-800 dark:text-slate-200 mt-0.5">
                          ${classSettings.startingBalance?.toLocaleString() || '10,000'}
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50">
                        <div className="text-[9px] font-bold text-slate-400 uppercase">Short Selling</div>
                        <div className={`text-xs font-black mt-0.5 flex items-center gap-1 ${classSettings.allowShortSelling ? 'text-emerald-500' : 'text-rose-400'}`}>
                          {classSettings.allowShortSelling ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                          {classSettings.allowShortSelling ? 'Allowed' : 'Blocked'}
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50">
                        <div className="text-[9px] font-bold text-slate-400 uppercase">Options Trading</div>
                        <div className={`text-xs font-black mt-0.5 flex items-center gap-1 ${classSettings.allowOptions ? 'text-emerald-500' : 'text-rose-400'}`}>
                          {classSettings.allowOptions ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                          {classSettings.allowOptions ? 'Unlocked' : 'Locked'}
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50">
                        <div className="text-[9px] font-bold text-slate-400 uppercase">Max Positions</div>
                        <div className="text-xs font-black text-slate-800 dark:text-slate-200 mt-0.5">
                          {classSettings.maxPositions || 'Unlimited'}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        <Briefcase className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          Individual Trading Account
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          You are currently not enrolled in a school or university classroom.
                        </p>
                      </div>
                    </div>

                    {/* Quick Join Inline Form */}
                    <form onSubmit={handleJoinClassInline} className="flex gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                      <input
                        type="text"
                        placeholder="Enter 6-digit class code..."
                        value={joinCodeInput}
                        onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                        maxLength={10}
                        className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-mono uppercase focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="submit"
                        disabled={joinLoading || !joinCodeInput.trim()}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        {joinLoading ? 'Joining...' : 'Join Class'}
                      </button>
                    </form>

                    {joinMessage && (
                      <div className={`text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1.5 ${
                        joinMessage.type === 'success' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                      }`}>
                        {joinMessage.type === 'success' ? <Check className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                        {joinMessage.text}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Teacher Mode Simulation Toggle if Teacher */}
              {role === 'teacher' && (
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                  <div>
                    <div className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                      Teacher Preview Simulation
                    </div>
                    <div className="text-[10px] text-amber-300/80 mt-0.5">
                      Experience the terminal with strict student rules and position limits applied
                    </div>
                  </div>
                  <button
                    onClick={() => { playSound('toggle'); setTeacherPreviewMode(!teacherPreviewMode); }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      teacherPreviewMode ? 'bg-amber-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        teacherPreviewMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 pb-1 border-b border-slate-200/60 dark:border-slate-800/60">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Data & Workspace Reset
                </span>
              </div>

              {/* Reset Dashboard Layout */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0c101a]/70 border border-slate-200/70 dark:border-slate-800/60">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Reset Dashboard Widgets</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Restore widget arrangement and cockpit layout back to factory defaults
                  </div>
                </div>
                <button
                  onClick={handleResetLayout}
                  disabled={resetSuccess}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className="h-3 w-3" />
                  {resetSuccess ? 'Restored!' : 'Reset Layout'}
                </button>
              </div>

              {/* Export Portfolio Data */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0c101a]/70 border border-slate-200/70 dark:border-slate-800/60">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Export Portfolio & History</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Download complete snapshot of holdings and trade records as JSON
                  </div>
                </div>
                <button
                  onClick={handleExportData}
                  disabled={exportSuccess}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Download className="h-3 w-3" />
                  {exportSuccess ? 'Downloaded!' : 'Export JSON'}
                </button>
              </div>

              {/* Restore All Preferences to Default */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-rose-500/5 border border-rose-500/20">
                <div>
                  <div className="text-xs font-bold text-rose-600 dark:text-rose-400">Restore All Settings</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Clear local customizations and revert all interface options to original defaults
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to revert all settings to factory defaults?')) {
                      resetAllSettings();
                      playSound('alert');
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl bg-rose-600/10 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-500/30 transition-all cursor-pointer"
                >
                  Reset All
                </button>
              </div>
            </div>
          )}

          {/* No search matches */}
          {q && !(
            'theme font display mode privacy chart sparkline trophy pet motion'.includes(q) ||
            'market trade order sound volume confirm penny execution rate refresh'.includes(q) ||
            'filter feed news sentiment explore sector penny ticker speed sort'.includes(q) ||
            'classroom code student teacher rule rules export reset layout backup linked'.includes(q)
          ) && (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <span className="text-3xl mb-2">🔍</span>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No settings found</h3>
              <p className="text-xs text-slate-500 mt-1">Try searching for &quot;theme&quot;, &quot;sound&quot;, &quot;privacy&quot;, &quot;order&quot;, or &quot;classroom&quot;.</p>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 px-6 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0c101a]/50 flex items-center justify-between shrink-0">
          <div className="text-[10px] text-slate-400 font-medium">
            Changes are saved automatically and synchronized to your account.
          </div>
          <button
            onClick={() => { playSound('click'); onClose(); }}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}

export default SettingsModal;
