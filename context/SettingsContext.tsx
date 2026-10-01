'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export type Theme = 'light' | 'dark';
export type FontType = 'sans' | 'serif' | 'mono';
export type PetSkin = 'orange' | 'blue' | 'purple';
export type ChartStyle = 'candlestick' | 'line';
export type Timeframe = '1D' | '1W' | '1M' | '1Y' | 'ALL';
export type OrderType = 'market' | 'limit';
export type TickerSpeed = 'off' | 'slow' | 'normal' | 'fast';
export type SoundType = 'trade' | 'achievement' | 'click' | 'toggle' | 'alert';

export function playWebSound(type: SoundType = 'click', volume = 0.5) {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    const vol = Math.max(0, Math.min(1, volume * 0.15));
    gain.gain.setValueAtTime(vol, now);
    gain.connect(ctx.destination);

    if (type === 'click') {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.exponentialRampToValueAtTime(350, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'toggle') {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.setValueAtTime(750, now + 0.035);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'trade') {
      [587.33, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.07);
        osc.connect(gain);
        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.16);
      });
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
    } else if (type === 'achievement') {
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);
        osc.connect(gain);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.22);
      });
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
    } else if (type === 'alert') {
      [440, 370].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        osc.connect(gain);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.12);
      });
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
    }
  } catch (e) {
    // Audio autoplay or context failure handled gracefully
  }
}

interface SettingsContextProps {
  // Appearance / Graphics
  theme: Theme;
  numberFont: FontType;
  textFont: FontType;
  detailedTrophies: boolean;
  showPets: boolean;
  privacyMode: boolean;
  chartStyle: ChartStyle;
  defaultTimeframe: Timeframe;
  showSparklines: boolean;
  compactLayout: boolean;
  reducedMotion: boolean;

  // Trading & Market
  orderConfirmation: boolean;
  defaultOrderType: OrderType;
  defaultTradeQuantity: number;
  marketRefreshInterval: number; // in seconds (e.g. 5, 15, 30, 0 = manual)
  pennyStockWarning: boolean;
  soundEffects: boolean;
  soundVolume: number; // 0 to 100

  // Filters & Discovery
  defaultExplorerSort: string;
  defaultExplorerCategory: string;
  newsSentimentFilter: string;
  hidePennyStocks: boolean;
  tickerSpeed: TickerSpeed;

  // Notifications
  notifyPriceAlerts: boolean;
  notifyStreakReminders: boolean;
  notifyClassroomUpdates: boolean;

  // Trillium & Customization
  petSkin: PetSkin;
  trilliums: number;
  ownedSkins: string[];
  isSettingsOpen: boolean;

  // Actions
  setTheme: (theme: Theme) => void;
  setNumberFont: (font: FontType) => void;
  setTextFont: (font: FontType) => void;
  setDetailedTrophies: (val: boolean) => void;
  setShowPets: (val: boolean) => void;
  setPrivacyMode: (val: boolean) => void;
  setChartStyle: (style: ChartStyle) => void;
  setDefaultTimeframe: (tf: Timeframe) => void;
  setShowSparklines: (val: boolean) => void;
  setCompactLayout: (val: boolean) => void;
  setReducedMotion: (val: boolean) => void;

  setOrderConfirmation: (val: boolean) => void;
  setDefaultOrderType: (type: OrderType) => void;
  setDefaultTradeQuantity: (qty: number) => void;
  setMarketRefreshInterval: (sec: number) => void;
  setPennyStockWarning: (val: boolean) => void;
  setSoundEffects: (val: boolean) => void;
  setSoundVolume: (vol: number) => void;

  setDefaultExplorerSort: (sort: string) => void;
  setDefaultExplorerCategory: (cat: string) => void;
  setNewsSentimentFilter: (filter: string) => void;
  setHidePennyStocks: (val: boolean) => void;
  setTickerSpeed: (speed: TickerSpeed) => void;

  setNotifyPriceAlerts: (val: boolean) => void;
  setNotifyStreakReminders: (val: boolean) => void;
  setNotifyClassroomUpdates: (val: boolean) => void;

  setIsSettingsOpen: (val: boolean) => void;
  setPetSkin: (skin: PetSkin) => void;
  setTrilliums: (val: number) => void;
  addOwnedSkin: (skin: string) => void;
  deductTrilliums: (amount: number) => boolean;

  playSound: (type?: SoundType) => void;
  resetAllSettings: () => void;
}

const SettingsContext = createContext<SettingsContextProps | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  // Graphics & Display
  const [theme, setThemeState] = useState<Theme>('dark');
  const [numberFont, setNumberFontState] = useState<FontType>('sans');
  const [textFont, setTextFontState] = useState<FontType>('sans');
  const [detailedTrophies, setDetailedTrophiesState] = useState<boolean>(true);
  const [showPets, setShowPetsState] = useState<boolean>(true);
  const [privacyMode, setPrivacyModeState] = useState<boolean>(false);
  const [chartStyle, setChartStyleState] = useState<ChartStyle>('line');
  const [defaultTimeframe, setDefaultTimeframeState] = useState<Timeframe>('1D');
  const [showSparklines, setShowSparklinesState] = useState<boolean>(true);
  const [compactLayout, setCompactLayoutState] = useState<boolean>(false);
  const [reducedMotion, setReducedMotionState] = useState<boolean>(false);

  // Trading & Market
  const [orderConfirmation, setOrderConfirmationState] = useState<boolean>(true);
  const [defaultOrderType, setDefaultOrderTypeState] = useState<OrderType>('market');
  const [defaultTradeQuantity, setDefaultTradeQuantityState] = useState<number>(1);
  const [marketRefreshInterval, setMarketRefreshIntervalState] = useState<number>(15);
  const [pennyStockWarning, setPennyStockWarningState] = useState<boolean>(true);
  const [soundEffects, setSoundEffectsState] = useState<boolean>(true);
  const [soundVolume, setSoundVolumeState] = useState<number>(50);

  // Filters & Discovery
  const [defaultExplorerSort, setDefaultExplorerSortState] = useState<string>('default');
  const [defaultExplorerCategory, setDefaultExplorerCategoryState] = useState<string>('All');
  const [newsSentimentFilter, setNewsSentimentFilterState] = useState<string>('all');
  const [hidePennyStocks, setHidePennyStocksState] = useState<boolean>(false);
  const [tickerSpeed, setTickerSpeedState] = useState<TickerSpeed>('normal');

  // Notifications
  const [notifyPriceAlerts, setNotifyPriceAlertsState] = useState<boolean>(true);
  const [notifyStreakReminders, setNotifyStreakRemindersState] = useState<boolean>(true);
  const [notifyClassroomUpdates, setNotifyClassroomUpdatesState] = useState<boolean>(true);

  // Modal & Gamification
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [petSkin, setPetSkinState] = useState<PetSkin>('orange');
  const [trilliums, setTrilliumsState] = useState<number>(200);
  const [ownedSkins, setOwnedSkinsState] = useState<string[]>(['orange']);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load from localStorage on mount
    try {
      const savedTheme = localStorage.getItem('settings_theme') as Theme;
      const savedNumFont = localStorage.getItem('settings_num_font') as FontType;
      const savedTxtFont = localStorage.getItem('settings_txt_font') as FontType;
      const savedDetailedTrophies = localStorage.getItem('settings_detailed_trophies');
      const savedShowPets = localStorage.getItem('settings_show_pets');
      const savedPrivacyMode = localStorage.getItem('settings_privacy_mode');
      const savedChartStyle = localStorage.getItem('settings_chart_style') as ChartStyle;
      const savedTimeframe = localStorage.getItem('settings_default_timeframe') as Timeframe;
      const savedSparklines = localStorage.getItem('settings_show_sparklines');
      const savedCompact = localStorage.getItem('settings_compact_layout');
      const savedReducedMotion = localStorage.getItem('settings_reduced_motion');

      const savedOrderConf = localStorage.getItem('settings_order_confirmation');
      const savedOrderType = localStorage.getItem('settings_default_order_type') as OrderType;
      const savedTradeQty = localStorage.getItem('settings_default_trade_quantity');
      const savedRefreshInterval = localStorage.getItem('settings_market_refresh_interval');
      const savedPennyWarn = localStorage.getItem('settings_penny_stock_warning');
      const savedSound = localStorage.getItem('settings_sound_effects');
      const savedSoundVol = localStorage.getItem('settings_sound_volume');

      const savedSort = localStorage.getItem('settings_default_explorer_sort');
      const savedCat = localStorage.getItem('settings_default_explorer_category');
      const savedSentiment = localStorage.getItem('settings_news_sentiment_filter');
      const savedHidePenny = localStorage.getItem('settings_hide_penny_stocks');
      const savedTickerSpeed = localStorage.getItem('settings_ticker_speed') as TickerSpeed;

      const savedNotifyPrice = localStorage.getItem('settings_notify_price_alerts');
      const savedNotifyStreak = localStorage.getItem('settings_notify_streak_reminders');
      const savedNotifyClass = localStorage.getItem('settings_notify_classroom_updates');

      const savedPetSkin = localStorage.getItem('settings_pet_skin') as PetSkin;
      const savedTrilliums = localStorage.getItem('settings_trilliums');
      const savedOwnedSkins = localStorage.getItem('settings_owned_skins');

      if (savedTheme) {
        setThemeState(savedTheme);
      } else {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setThemeState(isDark ? 'dark' : 'light');
      }

      if (savedNumFont) setNumberFontState(savedNumFont);
      if (savedTxtFont) setTextFontState(savedTxtFont);
      if (savedDetailedTrophies !== null) setDetailedTrophiesState(savedDetailedTrophies === 'true');
      if (savedShowPets !== null) setShowPetsState(savedShowPets === 'true');
      if (savedPrivacyMode !== null) setPrivacyModeState(savedPrivacyMode === 'true');
      if (savedChartStyle) setChartStyleState(savedChartStyle);
      if (savedTimeframe) setDefaultTimeframeState(savedTimeframe);
      if (savedSparklines !== null) setShowSparklinesState(savedSparklines === 'true');
      if (savedCompact !== null) setCompactLayoutState(savedCompact === 'true');
      if (savedReducedMotion !== null) setReducedMotionState(savedReducedMotion === 'true');

      if (savedOrderConf !== null) setOrderConfirmationState(savedOrderConf === 'true');
      if (savedOrderType) setDefaultOrderTypeState(savedOrderType);
      if (savedTradeQty) setDefaultTradeQuantityState(Number(savedTradeQty) || 1);
      if (savedRefreshInterval) setMarketRefreshIntervalState(Number(savedRefreshInterval) || 15);
      if (savedPennyWarn !== null) setPennyStockWarningState(savedPennyWarn === 'true');
      if (savedSound !== null) setSoundEffectsState(savedSound === 'true');
      if (savedSoundVol) setSoundVolumeState(Number(savedSoundVol) || 50);

      if (savedSort) setDefaultExplorerSortState(savedSort);
      if (savedCat) setDefaultExplorerCategoryState(savedCat);
      if (savedSentiment) setNewsSentimentFilterState(savedSentiment);
      if (savedHidePenny !== null) setHidePennyStocksState(savedHidePenny === 'true');
      if (savedTickerSpeed) setTickerSpeedState(savedTickerSpeed);

      if (savedNotifyPrice !== null) setNotifyPriceAlertsState(savedNotifyPrice === 'true');
      if (savedNotifyStreak !== null) setNotifyStreakRemindersState(savedNotifyStreak === 'true');
      if (savedNotifyClass !== null) setNotifyClassroomUpdatesState(savedNotifyClass === 'true');

      if (savedPetSkin) setPetSkinState(savedPetSkin);
      if (savedTrilliums !== null) setTrilliumsState(Number(savedTrilliums));
      if (savedOwnedSkins) {
        try {
          setOwnedSkinsState(JSON.parse(savedOwnedSkins));
        } catch (e) {
          console.error(e);
        }
      }
    } catch (err) {
      console.warn('Failed to read localStorage settings:', err);
    }

    setMounted(true);
  }, []);

  // Fetch and sync user settings & trilliums currency with Firestore account
  useEffect(() => {
    if (!user?.uid) return;

    const syncUserAccountSettings = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data.trilliums !== undefined && typeof data.trilliums === 'number') {
            setTrilliumsState(data.trilliums);
            localStorage.setItem('settings_trilliums', String(data.trilliums));
          } else {
            const currentLocalTrilliums = Number(localStorage.getItem('settings_trilliums') || 200);
            await setDoc(userRef, { trilliums: currentLocalTrilliums }, { merge: true });
          }

          if (data.petSkin) {
            setPetSkinState(data.petSkin);
            localStorage.setItem('settings_pet_skin', data.petSkin);
          }
          if (Array.isArray(data.ownedSkins)) {
            setOwnedSkinsState(data.ownedSkins);
            localStorage.setItem('settings_owned_skins', JSON.stringify(data.ownedSkins));
          }
          if (data.theme) {
            setThemeState(data.theme);
            localStorage.setItem('settings_theme', data.theme);
          }
          if (data.numberFont) {
            setNumberFontState(data.numberFont);
            localStorage.setItem('settings_num_font', data.numberFont);
          }
          if (data.textFont) {
            setTextFontState(data.textFont);
            localStorage.setItem('settings_txt_font', data.textFont);
          }
          if (data.privacyMode !== undefined) {
            setPrivacyModeState(data.privacyMode);
            localStorage.setItem('settings_privacy_mode', String(data.privacyMode));
          }
          if (data.chartStyle) {
            setChartStyleState(data.chartStyle);
            localStorage.setItem('settings_chart_style', data.chartStyle);
          }
        }
      } catch (err) {
        console.error('Failed to sync settings with Firestore:', err);
      }
    };

    syncUserAccountSettings();
  }, [user?.uid]);

  // Sync theme class to html element
  useEffect(() => {
    if (!mounted) return;
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme, mounted]);

  // Sound Player helper
  const playSound = useCallback((type: SoundType = 'click') => {
    if (!soundEffects) return;
    playWebSound(type, soundVolume / 100);
  }, [soundEffects, soundVolume]);

  // Helper to sync single key to Firestore
  const syncFirestore = useCallback((key: string, value: any) => {
    if (user?.uid) {
      setDoc(doc(db, 'users', user.uid), { [key]: value }, { merge: true }).catch(console.error);
    }
  }, [user?.uid]);

  // Graphics setters
  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem('settings_theme', t);
    syncFirestore('theme', t);
  }, [syncFirestore]);

  const setNumberFont = useCallback((f: FontType) => {
    setNumberFontState(f);
    localStorage.setItem('settings_num_font', f);
    syncFirestore('numberFont', f);
  }, [syncFirestore]);

  const setTextFont = useCallback((f: FontType) => {
    setTextFontState(f);
    localStorage.setItem('settings_txt_font', f);
    syncFirestore('textFont', f);
  }, [syncFirestore]);

  const setDetailedTrophies = useCallback((v: boolean) => {
    setDetailedTrophiesState(v);
    localStorage.setItem('settings_detailed_trophies', String(v));
  }, []);

  const setShowPets = useCallback((v: boolean) => {
    setShowPetsState(v);
    localStorage.setItem('settings_show_pets', String(v));
  }, []);

  const setPrivacyMode = useCallback((v: boolean) => {
    setPrivacyModeState(v);
    localStorage.setItem('settings_privacy_mode', String(v));
    syncFirestore('privacyMode', v);
  }, [syncFirestore]);

  const setChartStyle = useCallback((style: ChartStyle) => {
    setChartStyleState(style);
    localStorage.setItem('settings_chart_style', style);
    syncFirestore('chartStyle', style);
  }, [syncFirestore]);

  const setDefaultTimeframe = useCallback((tf: Timeframe) => {
    setDefaultTimeframeState(tf);
    localStorage.setItem('settings_default_timeframe', tf);
  }, []);

  const setShowSparklines = useCallback((v: boolean) => {
    setShowSparklinesState(v);
    localStorage.setItem('settings_show_sparklines', String(v));
  }, []);

  const setCompactLayout = useCallback((v: boolean) => {
    setCompactLayoutState(v);
    localStorage.setItem('settings_compact_layout', String(v));
  }, []);

  const setReducedMotion = useCallback((v: boolean) => {
    setReducedMotionState(v);
    localStorage.setItem('settings_reduced_motion', String(v));
  }, []);

  // Trading setters
  const setOrderConfirmation = useCallback((v: boolean) => {
    setOrderConfirmationState(v);
    localStorage.setItem('settings_order_confirmation', String(v));
  }, []);

  const setDefaultOrderType = useCallback((type: OrderType) => {
    setDefaultOrderTypeState(type);
    localStorage.setItem('settings_default_order_type', type);
  }, []);

  const setDefaultTradeQuantity = useCallback((qty: number) => {
    setDefaultTradeQuantityState(qty);
    localStorage.setItem('settings_default_trade_quantity', String(qty));
  }, []);

  const setMarketRefreshInterval = useCallback((sec: number) => {
    setMarketRefreshIntervalState(sec);
    localStorage.setItem('settings_market_refresh_interval', String(sec));
  }, []);

  const setPennyStockWarning = useCallback((v: boolean) => {
    setPennyStockWarningState(v);
    localStorage.setItem('settings_penny_stock_warning', String(v));
  }, []);

  const setSoundEffects = useCallback((v: boolean) => {
    setSoundEffectsState(v);
    localStorage.setItem('settings_sound_effects', String(v));
  }, []);

  const setSoundVolume = useCallback((vol: number) => {
    setSoundVolumeState(vol);
    localStorage.setItem('settings_sound_volume', String(vol));
  }, []);

  // Filters setters
  const setDefaultExplorerSort = useCallback((sort: string) => {
    setDefaultExplorerSortState(sort);
    localStorage.setItem('settings_default_explorer_sort', sort);
  }, []);

  const setDefaultExplorerCategory = useCallback((cat: string) => {
    setDefaultExplorerCategoryState(cat);
    localStorage.setItem('settings_default_explorer_category', cat);
  }, []);

  const setNewsSentimentFilter = useCallback((filter: string) => {
    setNewsSentimentFilterState(filter);
    localStorage.setItem('settings_news_sentiment_filter', filter);
  }, []);

  const setHidePennyStocks = useCallback((v: boolean) => {
    setHidePennyStocksState(v);
    localStorage.setItem('settings_hide_penny_stocks', String(v));
  }, []);

  const setTickerSpeed = useCallback((speed: TickerSpeed) => {
    setTickerSpeedState(speed);
    localStorage.setItem('settings_ticker_speed', speed);
  }, []);

  // Notifications setters
  const setNotifyPriceAlerts = useCallback((v: boolean) => {
    setNotifyPriceAlertsState(v);
    localStorage.setItem('settings_notify_price_alerts', String(v));
  }, []);

  const setNotifyStreakReminders = useCallback((v: boolean) => {
    setNotifyStreakRemindersState(v);
    localStorage.setItem('settings_notify_streak_reminders', String(v));
  }, []);

  const setNotifyClassroomUpdates = useCallback((v: boolean) => {
    setNotifyClassroomUpdatesState(v);
    localStorage.setItem('settings_notify_classroom_updates', String(v));
  }, []);

  // Gamification
  const setPetSkin = useCallback((skin: PetSkin) => {
    setPetSkinState(skin);
    localStorage.setItem('settings_pet_skin', skin);
    syncFirestore('petSkin', skin);
  }, [syncFirestore]);

  const setTrilliums = useCallback((val: number) => {
    setTrilliumsState(val);
    localStorage.setItem('settings_trilliums', String(val));
    syncFirestore('trilliums', val);
  }, [syncFirestore]);

  const addOwnedSkin = useCallback((skin: string) => {
    setOwnedSkinsState((prev) => {
      const updated = [...prev, skin];
      localStorage.setItem('settings_owned_skins', JSON.stringify(updated));
      syncFirestore('ownedSkins', updated);
      return updated;
    });
  }, [syncFirestore]);

  const deductTrilliums = useCallback((amount: number): boolean => {
    if (trilliums < amount) return false;
    const newVal = trilliums - amount;
    setTrilliums(newVal);
    return true;
  }, [trilliums, setTrilliums]);

  // Reset helper
  const resetAllSettings = useCallback(() => {
    const isDark = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : true;
    setTheme(isDark ? 'dark' : 'light');
    setNumberFont('sans');
    setTextFont('sans');
    setDetailedTrophies(true);
    setShowPets(true);
    setPrivacyMode(false);
    setChartStyle('line');
    setDefaultTimeframe('1D');
    setShowSparklines(true);
    setCompactLayout(false);
    setReducedMotion(false);

    setOrderConfirmation(true);
    setDefaultOrderType('market');
    setDefaultTradeQuantity(1);
    setMarketRefreshInterval(15);
    setPennyStockWarning(true);
    setSoundEffects(true);
    setSoundVolume(50);

    setDefaultExplorerSort('default');
    setDefaultExplorerCategory('All');
    setNewsSentimentFilter('all');
    setHidePennyStocks(false);
    setTickerSpeed('normal');

    setNotifyPriceAlerts(true);
    setNotifyStreakReminders(true);
    setNotifyClassroomUpdates(true);
  }, [
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
  ]);

  const contextValue = useMemo(() => ({
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

    petSkin,
    trilliums,
    ownedSkins,
    isSettingsOpen,

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

    setIsSettingsOpen,
    setPetSkin,
    setTrilliums,
    addOwnedSkin,
    deductTrilliums,

    playSound,
    resetAllSettings,
  }), [
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

    petSkin,
    trilliums,
    ownedSkins,
    isSettingsOpen,

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

    setIsSettingsOpen,
    setPetSkin,
    setTrilliums,
    addOwnedSkin,
    deductTrilliums,

    playSound,
    resetAllSettings,
  ]);

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
