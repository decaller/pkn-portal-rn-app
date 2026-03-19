# Internationalization (i18n) Guide (react-i18next)

This guide provides a practical, step-by-step approach to implementing internationalization in the PKN Portal app using **i18next** and **react-i18next**.

---

## 🛠️ 1. Step-by-Step Setup

### Step 1: Installation
Install the required packages:
```bash
npm install i18next react-i18next
```
*(Optional but recommended for React Native: `npm install expo-localization` to detect device language automatically).*

### Step 2: Configuration
Create a configuration file at `src/utils/i18n/index.ts`.

```tsx
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          welcomeMessage: "Welcome to PKN Portal"
        }
      },
      id: {
        translation: {
          welcomeMessage: "Selamat datang di Portal PKN"
        }
      }
    },
    lng: "en", // Default starting language
    fallbackLng: "en", // Failsafe language
    interpolation: {
      escapeValue: false // React Native is already protected from XSS
    }
  });

export default i18n;
```

**Crucial:** Import this file in your main entry point (e.g., `app/_layout.tsx` or `index.js`):
```tsx
import './src/utils/i18n';
```

### Step 3: Basic Translations
Use the `useTranslation` hook in your components.

```tsx
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';

function WelcomeHeader() {
  const { t } = useTranslation();
  return <Text>{t('welcomeMessage')}</Text>; 
}
```

---

## 📈 2. Advanced Usage

### Handling Pluralization
i18next handles pluralization automatically based on key suffixes.

**In your translation JSON:**
```json
{
  "notifications_one": "You have 1 notification",
  "notifications_other": "You have {{count}} notifications"
}
```

**In your component:**
```tsx
<Text>{t('notifications', { count: 2 })}</Text> 
// Output: You have 2 notifications
```

### Complex Strings (HTML/Formatting)
For strings with formatting (e.g., bold text), use the `<Trans>` component. Avoid this for simple cases as it can be complex.

**In translations:**
```json
{
  "welcomeUser": "Welcome <1>{{name}}</1>!"
}
```

**In component:**
```tsx
import { Trans } from 'react-i18next';
import { Text } from 'react-native';

<Trans i18nKey="welcomeUser" values={{ name: 'User' }}>
  Welcome <Text style={{ fontWeight: 'bold' }}>User</Text>!
</Trans>
```

---

## 💡 3. Recommendations & Best Practices

1.  **Use camelCase Keys:** Instead of full sentences as keys, use semantic keys like `loginButtonLabel` or `welcomeMessage`. This prevents code breakage if the phrasing changes.
2.  **Extract to JSON Files Promptly:** Move translations into separate JSON files (e.g., `locales/en/translation.json`) once the app grows beyond basic setup. This allows easy hand-off to professional translators.
3.  **Handle Missing Keys Gracefully:** Always set a `fallbackLng`. If a translation is missing in the target language, the app will display the fallback version instead of a raw key.
4.  **Minimize <Trans> Usage:** The index-based syntax of `<Trans>` can be fragile. Whenever possible, split complex strings into simpler, separate translation keys.
5.  **Dynamic Language Switching:** Use `i18n.changeLanguage('id')` to change the app language on the fly (e.g., from a settings menu).
