# React Native Performance Optimization (Simon Grimm Masterclass)

Simon Grimm's masterclass on React Native performance highlights key areas where we can ensure our app is "blazing fast." Our PKN Portal architecture already addresses some of these, but there are specific upgrades we need to implement.

## 🏆 Where Our Stack is Already Winning

* **Tip 1: Fast Startup (Time to Interactive)**
    * *Simon's Warning:* Don't load 10 things at startup. 
    * *Our Solution:* Because we designed the **BFF (Backend-For-Frontend) Dashboard Endpoint** combined with **Zustand `persist`**, our app boots instantly from local memory. We aren't blocking the startup screen waiting for the network.
* **Tip 5: Don't abuse React Context**
    * *Simon's Warning:* Putting everything in Context causes the whole app to re-render constantly.
    * *Our Solution:* We completely bypassed Context and are using **Zustand**, exactly as he recommends.

## 💾 Offline Strategy: Persistence & Hydration

Simon emphasizes that a premium app feels fast because it never shows an empty state if it doesn't have to. We achieve this through a dual-persistence strategy:

1. **App State (Zustand Persist)**:
1.  **App State (Zustand Persist)**:
    *   **What**: Language, onboarding status, and auth session.
    *   **Why**: To prevent the app from "forgetting" the user when they are offline.
    *   **Implementation**: Use `persist` middleware with `AsyncStorage`.

2.  **Data Cache (TanStack Query Persist)**:
    *   **What**: News, Events, and Dashboard results.
    *   **FlashList**: Use Shopify's `<FlashList>` for the **Events Discovery** tab to prevent memory crashes and frame drops.
    *   **Persistence Layer**: While the app currently uses `AsyncStorage` (compatible with Expo Go), we should aim for **MMKV** as the project matures.
    *   **Hydration Wait**: Always check for `_hasHydrated` in the root layout before rendering protected routes to avoid race conditions.

## 🚨 The 3 Action Items We Must Implement Now

Based on the performance tips, we need to apply these three optimizations:

### 1. Kill `FlatList` and use `FlashList` (Tip 4)
Simon explicitly states: *"Lists are where React Native performance goes to die."* In our previous Dashboard example, we used the default React Native `<FlatList>`. If you have an event list with 50+ items and images, `FlatList` will stutter.
*   **The Fix:** Use `@shopify/flash-list`. It is a drop-in replacement that is 5x faster and recycles views under the hood.

### 2. Prevent WebView/Deep Link Memory Leaks (Tip 6)
Mobile apps stay in memory much longer than websites. Our authentication relies on `expo-linking` listening for `pknportal://`. If we don't clean up that listener when the app closes, the app will leak memory and crash.
* **The Fix:** Every `useEffect` for Deep Links or WebViews must explicitly return a cleanup function.

### 3. Free Performance with Expo SDK 54+ (Tip 2)
The new **React Compiler** is a massive deal. In the past, you had to manually wrap components in `useMemo` to stop them from slowing down the app. 
* **The Fix:** Use the latest Expo (SDK 54 or higher), which has the React Compiler enabled by default. It automatically optimizes code behind the scenes.

---

## ⚡ Let's Apply the `FlashList` Upgrade

Here is how our Dashboard component looks after applying the Shopify `FlashList` recommendation. It requires an `estimatedItemSize` to calculate the physics incredibly fast.

### Installation
```bash
npx expo install @shopify/flash-list
```

### Implementation Example
```tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
// 1. Swap FlatList for FlashList
import { FlashList } from '@shopify/flash-list'; 
import { useDashboardStore } from '../store/dashboardStore';

export default function DashboardScreen() {
  const flashListRef = useRef<FlashList<any>>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data, lastUpdated, isBackgroundFetching, fetchDashboard } = useDashboardStore();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboard();
    setIsRefreshing(false);
  };

  if (!data && isBackgroundFetching) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {/* 2. Implement the FlashList */}
      <FlashList
        ref={flashListRef}
        data={data?.featured_events || []}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 20 }}
        
        // 3. CRUCIAL FOR FLASHLIST: Tell it roughly how tall each card is
        estimatedItemSize={80} 
        
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }

        ListHeaderComponent={
          <View style={{ marginBottom: 20 }}>
             <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Dashboard</Text>
             {/* ... header contents ... */}
          </View>
        }

        renderItem={({ item }) => (
          <View style={{ padding: 15, backgroundColor: '#fff', marginBottom: 10, borderRadius: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: '600' }}>{item.title}</Text>
          </View>
        )}
      />
    </View>
  );
}
```
