/**
 * Platform-aware Zustand storage adapter.
 *
 * - Web: uses window.localStorage (synchronous, SSR-safe because it only runs in browser)
 * - Native (iOS/Android): uses @react-native-async-storage/async-storage
 *
 * This avoids two bugs:
 * 1. `window is not defined` — AsyncStorage tries to access window during SSR
 * 2. `import.meta may only appear in a module` — Zustand's ESM middleware.mjs
 *    uses import.meta.env, which Metro bundler does not support
 */
import { Platform } from 'react-native';
import { type StateStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * A synchronous localStorage adapter that matches the StateStorage interface.
 */
const webLocalStorage: StateStorage = {
  getItem: (name) => {
    const value = localStorage.getItem(name);
    return value ?? null;
  },
  setItem: (name, value) => {
    localStorage.setItem(name, value);
  },
  removeItem: (name) => {
    localStorage.removeItem(name);
  },
};

/**
 * An AsyncStorage adapter that matches the StateStorage interface.
 */
const nativeAsyncStorage: StateStorage = {
  getItem: (name) => AsyncStorage.getItem(name),
  setItem: (name, value) => AsyncStorage.setItem(name, value),
  removeItem: (name) => AsyncStorage.removeItem(name),
};

/**
 * Export the correct storage based on the current platform.
 * On Web, we use localStorage to avoid SSR issues with AsyncStorage.
 */
export const zustandStorage: StateStorage =
  Platform.OS === 'web' ? webLocalStorage : nativeAsyncStorage;
