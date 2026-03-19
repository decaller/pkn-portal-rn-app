/**
 * i18next configuration for PKN Portal
 * Supports English and Indonesian with device locale detection and type safety.
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';

import en from './locales/en.json';
import id from './locales/id.json';

const resources = {
  en: { translation: en },
  id: { translation: id },
};

// Enable Type Safety for translated keys
export type AppTranslations = typeof en;

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: typeof resources['en'];
  }
}

// Detect device language safely
let deviceLanguage = 'en';
try {
  const locales = getLocales();
  if (locales && locales.length > 0) {
    deviceLanguage = locales[0].languageCode === 'id' ? 'id' : 'en';
  }
} catch {
  deviceLanguage = 'en';
}

i18n.use(initReactI18next).init({
  resources,
  lng: deviceLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // React Native already protects from XSS
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
