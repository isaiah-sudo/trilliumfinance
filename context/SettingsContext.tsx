'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';
export type FontType = 'sans' | 'serif' | 'mono';

interface SettingsContextProps {
  theme: Theme;
  numberFont: FontType;
  textFont: FontType;
  detailedTrophies: boolean;
  showPets: boolean;
  isSettingsOpen: boolean;
  setTheme: (theme: Theme) => void;
  setNumberFont: (font: FontType) => void;
  setTextFont: (font: FontType) => void;
  setDetailedTrophies: (val: boolean) => void;
  setShowPets: (val: boolean) => void;
  setIsSettingsOpen: (val: boolean) => void;
}

const SettingsContext = createContext<SettingsContextProps | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [numberFont, setNumberFontState] = useState<FontType>('sans');
  const [textFont, setTextFontState] = useState<FontType>('sans');
  const [detailedTrophies, setDetailedTrophiesState] = useState<boolean>(true);
  const [showPets, setShowPetsState] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load from localStorage on mount
    const savedTheme = localStorage.getItem('settings_theme') as Theme;
    const savedNumFont = localStorage.getItem('settings_num_font') as FontType;
    const savedTxtFont = localStorage.getItem('settings_txt_font') as FontType;
    const savedDetailedTrophies = localStorage.getItem('settings_detailed_trophies');
    const savedShowPets = localStorage.getItem('settings_show_pets');

    if (savedTheme) {
      setThemeState(savedTheme);
    } else {
      // Check system preference
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setThemeState(isDark ? 'dark' : 'light');
    }

    if (savedNumFont) setNumberFontState(savedNumFont);
    if (savedTxtFont) setTextFontState(savedTxtFont);
    if (savedDetailedTrophies !== null) {
      setDetailedTrophiesState(savedDetailedTrophies === 'true');
    }
    if (savedShowPets !== null) {
      setShowPetsState(savedShowPets === 'true');
    }

    setMounted(true);
  }, []);

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

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem('settings_theme', t);
  };

  const setNumberFont = (f: FontType) => {
    setNumberFontState(f);
    localStorage.setItem('settings_num_font', f);
  };

  const setTextFont = (f: FontType) => {
    setTextFontState(f);
    localStorage.setItem('settings_txt_font', f);
  };

  const setDetailedTrophies = (v: boolean) => {
    setDetailedTrophiesState(v);
    localStorage.setItem('settings_detailed_trophies', String(v));
  };

  const setShowPets = (v: boolean) => {
    setShowPetsState(v);
    localStorage.setItem('settings_show_pets', String(v));
  };

  return (
    <SettingsContext.Provider
      value={{
        theme,
        numberFont,
        textFont,
        detailedTrophies,
        showPets,
        isSettingsOpen,
        setTheme,
        setNumberFont,
        setTextFont,
        setDetailedTrophies,
        setShowPets,
        setIsSettingsOpen,
      }}
    >
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
