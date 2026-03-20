/**
 * Root Layout — App entry point.
 * Configures i18n, fonts, splash screen, and root navigation.
 *
 * Persistence is native-only. Web (dev only) skips it to avoid Metro bundler
 * incompatibility with Zustand/TanStack ESM packages (import.meta.env).
 */
import '@/utils/i18n';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Platform } from 'react-native';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import { useAppStore } from '@/store/appStore';
import { useAppTheme } from '@/hooks/useAppTheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
      gcTime: 1000 * 60 * 60 * 24, // 24 hours (for native cache)
    },
  },
});

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Lazy-load the native persist provider at module level to avoid
// Metro bundling ESM packages (import.meta.env) when targeting Web.
const NativePersistentLayout = Platform.OS !== 'web'
  ? (() => {
      const { PersistQueryClientProvider } = require('@tanstack/react-query-persist-client');
      const { createAsyncStoragePersister } = require('@tanstack/query-async-storage-persister');
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const persister = createAsyncStoragePersister({ storage: AsyncStorage });

      return function NativePersistWrapper({ children }: { children: React.ReactNode }) {
        return (
          <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
            {children}
          </PersistQueryClientProvider>
        );
      };
    })()
  : null;

function AppShell() {
  const _hasHydrated = useAppStore((s) => s._hasHydrated);
  const { colors, isDark } = useAppTheme();

  useEffect(() => {
    // On native, manually trigger Zustand hydration after mount
    if (Platform.OS !== 'web') {
      (useAppStore as any).persist?.rehydrate();
    }
  }, []);

  useEffect(() => {
    if (_hasHydrated) {
      SplashScreen.hideAsync();
    }
  }, [_hasHydrated]);

  if (!_hasHydrated) {
    return null;
  }

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.brand.primary,
      background: colors.background.primary,
      card: colors.background.card,
      text: colors.text.primary,
      border: colors.border.light,
      notification: colors.brand.accent,
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ThemeProvider value={navigationTheme}>
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
              headerTintColor: colors.text.primary,
              headerStyle: { backgroundColor: colors.background.primary },
            }}
          />
          <Stack.Screen
            name="news/[id]"
            options={{ headerShown: false, animation: 'slide_from_right' }}
          />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  if (Platform.OS === 'web' || !NativePersistentLayout) {
    // Web: no persistence — plain QueryClientProvider only
    return (
      <QueryClientProvider client={queryClient}>
        <AppShell />
      </QueryClientProvider>
    );
  }

  // Native: full TanStack Query persistence via AsyncStorage
  return (
    <NativePersistentLayout>
      <AppShell />
    </NativePersistentLayout>
  );
}
