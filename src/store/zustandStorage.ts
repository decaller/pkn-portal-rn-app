/**
 * Platform-aware Zustand storage adapter.
 * 
 * - Web: uses window.localStorage (synchronous, SSR-safe)
 * - Native: uses react-native-mmkv (synchronous, 30x faster than AsyncStorage)
 */
import { Platform } from 'react-native';
import { type StateStorage } from 'zustand/middleware';

/**
 * Lazy MMKV Instance for Native
 */
let mmkvStorage: any = null;

const getMMKVStorage = () => {
  if (Platform.OS === 'web') return null;
  
  if (!mmkvStorage) {
    const { MMKV } = require('react-native-mmkv');
    mmkvStorage = new MMKV({
      id: 'pkn-portal-storage',
      encryptionKey: 'pkn-secret-key-123'
    });
  }
  return mmkvStorage;
};

/**
 * Web LocalStorage adapter
 */
const webLocalStorage: StateStorage = {
  getItem: (name) => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(name);
  },
  setItem: (name, value) => {
    window.localStorage.setItem(name, value);
  },
  removeItem: (name) => {
    window.localStorage.removeItem(name);
  },
};

/**
 * Native MMKV adapter
 */
const nativeMMKVStorage: StateStorage = {
  getItem: (name) => {
    const storage = getMMKVStorage();
    return storage?.getString(name) ?? null;
  },
  setItem: (name, value) => {
    const storage = getMMKVStorage();
    storage?.set(name, value);
  },
  removeItem: (name) => {
    const storage = getMMKVStorage();
    storage?.delete(name);
  },
};

/**
 * Export the correct storage based on platform
 */
export const zustandStorage: StateStorage = 
  Platform.OS === 'web' ? webLocalStorage : nativeMMKVStorage;

