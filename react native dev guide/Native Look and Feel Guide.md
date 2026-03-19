# React Native: Achieving a Truly Native Look and Feel 📱

While React Native allows for a single codebase, a successful app respects the distinct design languages of iOS (Human Interface Guidelines) and Android (Material Design). This guide outlines the techniques and checklists to ensure the PKN Portal app feels perfectly at home on any device.

---

## 1. Code & Structural Techniques 🛠️

### The Platform API
Use `Platform.OS` for simple conditional rendering or logic.
```tsx
import { Platform } from 'react-native';
const isIOS = Platform.OS === 'ios';
```

### Platform.select()
The cleanest way to apply platform-specific styles or values.
```tsx
const headerHeight = Platform.select({
  ios: 44,
  android: 56,
  default: 50,
});
```

### Platform-Specific File Extensions
For components that differ vastly between OS, use `.ios.tsx` and `.android.tsx`. The bundler automatically picks the right one.
*Example:* `DatePicker.ios.tsx` and `DatePicker.android.tsx`. Import simply as `import DatePicker from './DatePicker';`.

---

## 2. UI Elements & Visual Guidelines 🎨

### Typography
*   **iOS:** Uses **San Francisco (SF Pro)**. Handles dynamic tracking automatically.
*   **Android:** Uses **Roboto**.
*   **Technique:** Avoid hardcoding `fontFamily` unless using a brand font. Leaving it `undefined` defaults to the system font perfectly.

### Headers & Navigation
*   **iOS:** Titles are usually centered. iOS 11+ supports "Large Titles". An explicit `< Back` chevron is mandatory (no hardware back button).
*   **Android:** Titles are traditionally left-aligned (Material 3 sometimes centers them). Always account for the system hardware/gesture back button.

### Form Controls
*   **Pickers:** iOS uses "Wheel" pickers (often in modals); Android uses overlay dialogs (Calendar/Clock).
*   **Solution:** Use `@react-native-community/datetimepicker` to wrap these native components.
*   **Switches:** Use the core `Switch`. It renders the iOS pill-toggle and Android Material toggle automatically.

### Alerts & Dialogs
*   **iOS:** Use `ActionSheetIOS` for multiple choices or `Alert` for center popups.
*   **Android:** Dialogs sit in the center with right-aligned flat buttons (e.g., "CANCEL" "OK").

---

## 3. UX & Interaction (The "Feel") 🖐️

### Touch Feedback (Crucial!)
Stop using `TouchableOpacity` everywhere. Use the modern `Pressable` component to provide platform-correct feedback.
```tsx
<Pressable
  android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
  style={({ pressed }) => [
    styles.button,
    Platform.OS === 'ios' && pressed ? { opacity: 0.7 } : {}
  ]}
>
  <Text>Press Me</Text>
</Pressable>
```

### Gestures & Navigation
*   **iOS:** Users expect "swipe right from left edge" to go back. Ensure `gestureEnabled: true` in stack navigators.
*   **Android:** Implement `BackHandler` to manage the system back button correctly.

### Scrolling
*   **iOS:** Enable "rubber band" bounce (`bounces={true}`).
*   **Android:** Use the default "glow/ripple" over-scroll (`bounces={false}`).

---

## 4. Quirks, Layouts, & Edge Cases 📐

### Shadows vs. Elevation
*   **iOS:** Uses `shadowColor`, `shadowOffset`, `shadowOpacity`, and `shadowRadius`.
*   **Android:** Uses the `elevation` property. Always define both for cross-platform depth.

### SafeArea & Notches
iPhones have notches/Dynamic Islands; Android status bars vary. Use **React Navigation's `SafeAreaProvider`** and the `useSafeAreaInsets()` hook to pad headers and footers dynamically.

### Keyboard Handling
*   **iOS:** Use `KeyboardAvoidingView` (usually `behavior="padding"`).
*   **Android:** Often handled by `windowSoftInputMode="adjustResize"` in `AndroidManifest.xml`, making manual avoiding less necessary.

### Image Performance
Use `expo-image`. It uses native caching libraries (**Glide** on Android, **SDWebImage** on iOS), making loading feel instantaneous and flicker-free.

---

## 5. Summary Checklist for a "Native" Audit ✅

- [ ] Did I use `android_ripple` on Android and opacity changes on iOS for all buttons/links?
- [ ] Does the hardware back button on Android navigate back correctly?
- [ ] Can I swipe to go back on iOS?
- [ ] Are forms usable without the keyboard covering text inputs?
- [ ] Do custom headers respect the OS status bar and iOS notch/dynamic island?
- [ ] Are shadows rendering correctly (including `elevation` on Android)?
- [ ] Am I using native date/time pickers instead of building custom JS ones?
- [ ] Do scrolling lists feel right? (Bouncy on iOS, solid on Android).
