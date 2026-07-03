'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';
export type FontType = 'sans' | 'serif' | 'mono';
export type PetSkin = 'orange' | 'blue' | 'purple';

interface SettingsContextProps {
  theme: Theme;
  numberFont: FontType;
  textFont: FontType;
  detailedTrophies: boolean;
  showPets: boolean;
  isSettingsOpen: boolean;
  petSkin: PetSkin;
  trilliums: number;
  ownedSkins: string[];
  setTheme: (theme: Theme) => void;
  setNumberFont: (font: FontType) => void;
  setTextFont: (font: FontType) => void;
  setDetailedTrophies: (val: boolean) => void;
  setShowPets: (val: boolean) => void;
  setIsSettingsOpen: (val: boolean) => void;
  setPetSkin: (skin: PetSkin) => void;
  setTrilliums: (val: number) => void;
  addOwnedSkin: (skin: string) => void;
  deductTrilliums: (amount: number) => boolean;
}

const SettingsContext = createContext<SettingsContextProps | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [numberFont, setNumberFontState] = useState<FontType>('sans');
  const [textFont, setTextFontState] = useState<FontType>('sans');
  const [detailedTrophies, setDetailedTrophiesState] = useState<boolean>(true);
  const [showPets, setShowPetsState] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [petSkin, setPetSkinState] = useState<PetSkin>('orange');
  const [trilliums, setTrilliumsState] = useState<number>(200);
  const [ownedSkins, setOwnedSkinsState] = useState<string[]>(['orange']);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load from localStorage on mount
    const savedTheme = localStorage.getItem('settings_theme') as Theme;
    const savedNumFont = localStorage.getItem('settings_num_font') as FontType;
    const savedTxtFont = localStorage.getItem('settings_txt_font') as FontType;
    const savedDetailedTrophies = localStorage.getItem('settings_detailed_trophies');
    const savedShowPets = localStorage.getItem('settings_show_pets');
    const savedPetSkin = localStorage.getItem('settings_pet_skin') as PetSkin;
    const savedTrilliums = localStorage.getItem('settings_trilliums');
    const savedOwnedSkins = localStorage.getItem('settings_owned_skins');

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
    if (savedPetSkin) {
      setPetSkinState(savedPetSkin);
    }
    if (savedTrilliums !== null) {
      setTrilliumsState(Number(savedTrilliums));
    }
    if (savedOwnedSkins) {
      try {
        setOwnedSkinsState(JSON.parse(savedOwnedSkins));
      } catch (e) {
        console.error(e);
      }
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

  const setPetSkin = (skin: PetSkin) => {
    setPetSkinState(skin);
    localStorage.setItem('settings_pet_skin', skin);
  };

  const setTrilliums = (val: number) => {
    setTrilliumsState(val);
    localStorage.setItem('settings_trilliums', String(val));
  };

  const addOwnedSkin = (skin: string) => {
    const updated = [...ownedSkins, skin];
    setOwnedSkinsState(updated);
    localStorage.setItem('settings_owned_skins', JSON.stringify(updated));
  };

  const deductTrilliums = (amount: number): boolean => {
    if (trilliums < amount) return false;
    const newVal = trilliums - amount;
    setTrilliums(newVal);
    return true;
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
        petSkin,
        trilliums,
        ownedSkins,
        setTheme,
        setNumberFont,
        setTextFont,
        setDetailedTrophies,
        setShowPets,
        setIsSettingsOpen,
        setPetSkin,
        setTrilliums,
        addOwnedSkin,
        deductTrilliums,
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
