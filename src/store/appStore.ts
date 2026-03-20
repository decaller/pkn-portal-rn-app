/**
 * General app state store using Zustand.
 * Manages onboarding state and language preference.
 *
 * Persistence is enabled on Native only (iOS/Android).
 * Web (dev-only) uses a plain in-memory store to avoid Metro bundler
 * incompatibility with Zustand's ESM middleware (import.meta.env).
 */
import { Platform } from 'react-native';
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

const initialState = {
  hasSeenWelcome: false,
  isAuthenticated: false,
  language: 'en' as const,
};

function createStore() {
  if (Platform.OS === 'web') {
    // On web (dev only), skip persistence entirely — no import.meta.env issues
    return create<AppState>()((set) => ({
      ...initialState,
      _hasHydrated: true, // immediately ready on web
      setHasSeenWelcome: (value) => set({ hasSeenWelcome: value }),
      setLanguage: (lang) => set({ language: lang }),
      setAuthenticated: (value) => set({ isAuthenticated: value }),
    }));
  }

  // Native: use persist middleware with AsyncStorage
  const { persist, createJSONStorage } = require('zustand/middleware');
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;

  return create<AppState>()(
    persist(
      (set: (partial: Partial<AppState>) => void) => ({
        ...initialState,
        _hasHydrated: false,
        setHasSeenWelcome: (value: boolean) => set({ hasSeenWelcome: value }),
        setLanguage: (lang: 'en' | 'id') => set({ language: lang }),
        setAuthenticated: (value: boolean) => set({ isAuthenticated: value }),
      }),
      {
        name: 'pkn-app-storage',
        storage: createJSONStorage(() => AsyncStorage),
        skipHydration: true,
        onRehydrateStorage: () => {
          return () => {
            useAppStore.setState({ _hasHydrated: true });
          };
        },
        partialize: (state: AppState) => ({
          hasSeenWelcome: state.hasSeenWelcome,
          isAuthenticated: state.isAuthenticated,
          language: state.language,
        }),
      }
    )
  );
}

export const useAppStore = createStore();



