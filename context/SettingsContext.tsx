'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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
  const { user } = useAuth();
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
            // First time storing user trilliums on Firestore account
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
        } else {
          // Initialize new user profile document with default currency and settings
          const initialTrilliums = Number(localStorage.getItem('settings_trilliums') || 200);
          await setDoc(userRef, {
            trilliums: initialTrilliums,
            petSkin: 'orange',
            ownedSkins: ['orange'],
            theme: 'dark',
            numberFont: 'sans',
            textFont: 'sans',
            createdAt: new Date().toISOString()
          }, { merge: true });
        }
      } catch (err) {
        console.error('Failed to sync trilliums currency with Firestore account:', err);
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

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem('settings_theme', t);
    if (user?.uid) {
      setDoc(doc(db, 'users', user.uid), { theme: t }, { merge: true }).catch(console.error);
    }
  };

  const setNumberFont = (f: FontType) => {
    setNumberFontState(f);
    localStorage.setItem('settings_num_font', f);
    if (user?.uid) {
      setDoc(doc(db, 'users', user.uid), { numberFont: f }, { merge: true }).catch(console.error);
    }
  };

  const setTextFont = (f: FontType) => {
    setTextFontState(f);
    localStorage.setItem('settings_txt_font', f);
    if (user?.uid) {
      setDoc(doc(db, 'users', user.uid), { textFont: f }, { merge: true }).catch(console.error);
    }
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
    if (user?.uid) {
      setDoc(doc(db, 'users', user.uid), { petSkin: skin }, { merge: true }).catch(console.error);
    }
  };

  const setTrilliums = (val: number) => {
    setTrilliumsState(val);
    localStorage.setItem('settings_trilliums', String(val));
    if (user?.uid) {
      setDoc(doc(db, 'users', user.uid), { trilliums: val, updatedAt: new Date().toISOString() }, { merge: true }).catch((err) => {
        console.error('Failed to save trilliums to Firestore user account:', err);
      });
    }
  };

  const addOwnedSkin = (skin: string) => {
    const updated = [...ownedSkins, skin];
    setOwnedSkinsState(updated);
    localStorage.setItem('settings_owned_skins', JSON.stringify(updated));
    if (user?.uid) {
      setDoc(doc(db, 'users', user.uid), { ownedSkins: updated }, { merge: true }).catch(console.error);
    }
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
