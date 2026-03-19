/**
 * General app state store using Zustand.
 * Manages onboarding state and language preference.
 * In Phase 2, this will be persisted with MMKV.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppState {
  hasSeenWelcome: boolean;
  isAuthenticated: boolean;
  language: 'en' | 'id';
  setHasSeenWelcome: (value: boolean) => void;
  setLanguage: (lang: 'en' | 'id') => void;
  setAuthenticated: (value: boolean) => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useAppStore = create<AppState>()(
  (set) => ({
    hasSeenWelcome: false,
    isAuthenticated: false,
    language: 'en',
    _hasHydrated: true,
    setHasSeenWelcome: (value) => set({ hasSeenWelcome: value }),
    setLanguage: (lang) => set({ language: lang }),
    setAuthenticated: (value) => set({ isAuthenticated: value }),
    setHasHydrated: (state) => set({ _hasHydrated: state }),
  })
);



