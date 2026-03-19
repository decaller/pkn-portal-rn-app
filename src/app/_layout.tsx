/**
 * Root Layout — App entry point.
 * Configures i18n, fonts, splash screen, and root navigation.
 */
import '@/utils/i18n';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { useAppStore } from '@/store/appStore';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const _hasHydrated = useAppStore((s) => s._hasHydrated);

  useEffect(() => {
    if (_hasHydrated) {
      // Hide splash after hydration is complete
      SplashScreen.hideAsync();
    }
  }, [_hasHydrated]);

  if (!_hasHydrated) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="events/[id]"
          options={{ headerShown: false, animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="news/index"
          options={{
            headerShown: true,
            title: 'News & Articles',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="news/[id]"
          options={{ headerShown: false, animation: 'slide_from_right' }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
