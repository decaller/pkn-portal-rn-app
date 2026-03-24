/**
 * General app state store using Zustand.
 * Manages onboarding state and language preference.
 *
 * Persistence is managed by zustandStorage (MMKV on Native, LocalStorage on Web).
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from './zustandStorage';

interface AppState {
  hasSeenWelcome: boolean;
  language: 'en' | 'id';
  theme: 'light' | 'dark' | 'system';
  setHasSeenWelcome: (value: boolean) => void;
  setLanguage: (lang: 'en' | 'id') => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  _hasHydrated: boolean;
}

const initialState = {
  hasSeenWelcome: false,
  language: 'en' as const,
  theme: 'system' as const,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,
      _hasHydrated: false,
      setHasSeenWelcome: (value) => set({ hasSeenWelcome: value }),
      setLanguage: (lang) => set({ language: lang }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'pkn-app-storage',
      storage: createJSONStorage(() => zustandStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true;
        }
      },
      partialize: (state) => ({
        hasSeenWelcome: state.hasSeenWelcome,
        language: state.language,
        theme: state.theme,
      }),
    }
  )
);
