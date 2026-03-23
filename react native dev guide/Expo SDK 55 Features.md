# Expo SDK 55 Features 

Expo SDK 55 (February 2026) is packed with game-changers for the PKN Portal app. Using SDK 55 as our foundation provides premium features that enhance performance, developer experience, and user interface.

## 🤖 1. The AI Agent "Skills" (Leveling up our AI assistance)
Expo announced `expo/skills` (MCP servers for AI). AI assistants (like Cursor or Windsurf) gain the physical ability to run Expo CLI commands, check app performance, and build native UIs using Expo's exact best practices.
* **The Upgrade:** Run `npx skills add expo/skills` to turn your AI assistant into a literal junior developer.

## 💎 2. Premium "Liquid Glass" & Native Tabs (Expo Router v7)
The 4-tab bottom navigation (`Home`, `Events`, `Portal`, `Profile`) gets a native upgrade. Expo Router v7 natively supports Apple's **Liquid Glass** blur effect and Android's **Material 3 Native Colors**.
*   **iOS Native:** Use the system tab bar to automatically inherit "liquid glass" blur and auto-minimizing when scrolling.
*   **Android Native:** Do not mimic iOS blur. Instead, embrace **Material 3 Bottom Navigation**. Android users expect solid or slightly elevated surfaces with pill-shaped indicators and native ripple interactions.

## 🛠️ 3. Native Toolbar & Accessories (SDK 55)
*   **Stack Toolbar:** Allows placing buttons/menus in the header (left, right, or bottom) using native primitives.
    *   **Android Approach:** Use the standard **Material Top App Bar**. For bottom actions, configure a `BottomAppBar` with an integrated FAB (Floating Action Button).
*   **Bottom Accessory:** Attach accessories (like a mini-player) directly above the tab bar.
    *   **Android Approach:** Use standard **Snackbars** for temporary updates or **Persistent Bottom Sheets** for persistent controls.
*   **Zoom Transitions:** Use `apple-zoom` inside `<Link>` for fluid iOS 18 transitions.
    *   **Android Approach:** Rely on built-in **Material Motion** (Shared Axis/Fade Through) and Android 14's native **Predictive Back Gestures**.
*   **Native Bottom Sheets:** Reliable `flex: 1` pinning to the bottom without layout jumps.

## ⚡ 4. The React 19 `<Activity>` Component (WebView Saver)

* **The Upgrade:** SDK 55 includes React 19's new `<Activity>` component. We can wrap our WebView in it: `<Activity mode="hidden">`.
* **What it means for PKN:** When users tab away, the WebView is visually hidden but remains frozen in memory. Tabbing back instantly restores it exactly where they left off.

## 📦 5. Byte-Code OTA Updates (EAS Updates)
Push fixes instantly without waiting for App Store reviews using "Byte Code Diffing." Expo only sends the exact bytes that changed, shrinking update downloads to about 25% of their original size.
*   **The Implementation:** Turn this on manually in `app.json` by adding the `bytecodeDiffPatchSupport` flag inside the `updates` object.

## 🛠️ 6. New Arch & Cleanup (SDK 55)
*   **Package Versioning:** Ensure all Expo packages (like `expo-image`, `expo-router`) start with version `55` to guarantee compatibility.
*   **Architecture Cleanup:** The legacy architecture is officially retired. You can safely remove the `newArch` flag from `app.json` if it's still there.
*   **Hermes v1 Opt-in:** Use the `expo-build-properties` plugin to enable Hermes v1 for better ES6 support and performance. This requires building from source and may require overriding `react-native-worklets-core` version if using Reanimated.

## 🎨 7. Material 3 & Android UI (SDK 55)
*   **Native Colors:** Leverage the new Expo Router colors API. Setting a color to `"surface"` will automatically adapt to the user's system wallpaper and dark/light modes on Android.
*   **Stable Android Blur:** Use `<BlurTargetView>` from `expo-blur` for a stable and efficient blur effect on Android devices.

## 🚀 8. Advanced Native Integration
*   **Brownfield Adoption:** For existing native apps, use `expo-brownfield-target` to package React Native features into a native iOS/Android library.
*   **Native Widgets & Live Activities:** Use the `expo-widgets` alpha to build iOS Live Activities and widgets using Expo UI components—no Swift code required.
*   **Share Extensions:** Use the experimental config plugin to add share extension targets (iOS) and intent filters (Android) to receive data from system share sheets.

---

## 🔔 6. Rich Push Notifications in Expo
Implementing images in push notifications requires different platform strategies.

### iOS: Apple Targets & Swift
*   **The Problem:** iOS does not render images in notifications by default.
*   **The Fix:** Use **Expo Apple Targets** (`npx create-expo-target`) to scaffold a "Notification Service Extension".
*   **Swift Integration:** Add a small Swift interceptor to download and attach the image before display.
*   **Testing:** Use the **Quick Push** macOS utility to test payloads and image URLs locally.

### Android: Out-of-the-box Support
*   **Zero Configuration:** Android supports rich images natively without extra targets or Kotlin code.
*   **Mechanism:** Simply include the image URL in the payload; the OS handles downloading and rendering automatically.

---

## 🏗️ SDK 55 Tab Layout Example (Native)
using Expo Router v7 features:

```tsx
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // iOS: Absolute positioning + Blur
        // Android: Standard Material 3 styling
        tabBarStyle: Platform.OS === 'ios' ? { position: 'absolute' } : {},
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="light" />
          ) : undefined
        ),
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="events" options={{ title: 'Events' }} />
      <Tabs.Screen name="portal" options={{ title: 'Portal' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
```

