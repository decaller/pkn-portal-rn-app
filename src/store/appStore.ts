/**
 * General app state store using Zustand.
 * Manages onboarding state and language preference.
 */
import { create } from 'zustand';

interface AppState {
  hasSeenWelcome: boolean;
  isAuthenticated: boolean;
  language: 'en' | 'id';
  setHasSeenWelcome: (value: boolean) => void;
  setLanguage: (lang: 'en' | 'id') => void;
  setAuthenticated: (value: boolean) => void;
  _hasHydrated: boolean;
}

export const useAppStore = create<AppState>()((set) => ({
  hasSeenWelcome: false,
  isAuthenticated: false,
  language: 'en',
  _hasHydrated: true,
  setHasSeenWelcome: (value) => set({ hasSeenWelcome: value }),
  setLanguage: (lang) => set({ language: lang }),
  setAuthenticated: (value) => set({ isAuthenticated: value }),
}));



