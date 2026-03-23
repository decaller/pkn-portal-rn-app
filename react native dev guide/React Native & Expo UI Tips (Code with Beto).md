# React Native & Expo UI Development Tips (Code with Beto)

This guide summarizes key development tips and modern native UI tricks shared by **Code with Beto** for Expo and React Native. These should be considered during the implementation of the PKN Portal app to ensure a premium, native-feeling experience.

---

## 🎨 Expo UI Tricks (Modern Native UI)
*From the video: [6 Expo UI Tricks That Save You Hours of Debugging](https://youtu.be/dhN7eeqOVeE)*

### 1. Handle Keyboard Safe Areas
*   **The Tip:** Use the `ignoreSafeArea` property (e.g., `ignoreSafeArea="keyboard"` or `"all"`) on host components.
*   **Why:** This prevents the UI from shifting or breaking unexpectedly when the keyboard opens, which is critical for registration forms.

### 2. Automatic Sizing with Match Contents
*   **The Tip:** Use `matchContents` instead of manually setting width and height for native host views.
*   **Why:** This ensures the React Native "window" perfectly fits the underlying SwiftUI or Jetpack Compose content without trial-and-error styling.

### 3. Advanced Native Views

*   **Why:** Enables complex native layouts that can still host standard React Native components.

### 4. Platform Extensions for UI
*   **The Tip:** Organize code using `.ios.tsx` and `.android.tsx` extensions.
*   **Why:** Allows writing platform-specific UI (SwiftUI for iOS, Jetpack Compose for Android) in separate files while maintaining a single, clean import in your main logic.

### 5. Centralize Shared Logic
*   **The Tip:** Lift API calls and state management into a shared **Context** or "mini-library."
*   **Why:** Prevents duplicating business logic across platform-specific UI files, ensuring consistency between iOS and Android.

### 6. Adopt System Colors
*   **The Tip:** Leverage `color.ios` and `color.android` utilities.
*   **Why:** On Android, this allows the app to automatically adapt to the user's system theme and wallpaper colors (Material You), providing a truly integrated native feel.

---

## 🚀 General React Native Best Practices
*From the video: [Top 6 React Native Tips to Survive 2026](https://youtu.be/zMM0d1d1_X4)*

### 1. Switch to Pressable
*   **The Tip:** Stop using `TouchableOpacity`. Use `Pressable` for more event control (like `onPressIn/Out`).
*   **Recommendation:** Consider using a library like **Presto** to handle animations and haptics automatically for all interactions.

### 2. Avoid Inline Platform Checks
*   **The Tip:** Rather than using `Platform.OS === 'ios'` throughout the JSX, use **platform file extensions** (`.ios.js`, `.android.js`).
*   **Why:** Keeps components clean, readable, and much easier to scale as the app grows.

### 3. Native Form Sheets
*   **The Tip:** For iOS, prefer using the native `presentation: 'formSheet'` over standard custom-built modals.
*   **Why:** It provides a more polished, system-standard look with features like "liquid glass" blur backgrounds.

### 4. Native Scroll Behavior
*   **The Tip:** Use `contentInsetAdjustmentBehavior="automatic"` on `ScrollView` or `FlatList`.
*   **Why:** Handles safe areas and headers natively, which is cleaner and more reliable than wrapping everything in a manual `SafeAreaView`.

### 5. Optimize Data Lists
*   **The Tip:** Always prefer `FlatList` (or `FlashList`) over `ScrollView` for API-driven data.
*   **Why:** Provides better performance via virtualization and includes useful helpers like `ListEmptyComponent`.

### 6. Lean Routing Files (Expo Router)
*   **The Tip:** Keep files in the `app/` folder extremely thin.
*   **Why:** Only handle routing and parameters in the `app/` directory. Export the actual screen content from the `components/` directory to simplify refactoring and testing.
