/**
 * i18next configuration for PKN Portal
 * Supports English and Indonesian with device locale detection.
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
// import { getLocales } from 'expo-localization/build/Localization';
import en from './locales/en.json';
import id from './locales/id.json';

// Detect device language (temporarily hardcoded for debugging Phase 1 setup)
const deviceLanguage = 'en';


i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    id: { translation: id },
  },
  lng: deviceLanguage === 'id' ? 'id' : 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // React Native already protects from XSS
  },
});

export default i18n;
