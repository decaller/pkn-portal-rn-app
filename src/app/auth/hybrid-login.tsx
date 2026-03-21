/**
 * HybridLoginScreen — WebView wrapper for Laravel login.
 * Extracts token/user data via token-handoff URL.
 */
import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useAppTheme } from '@/hooks/useAppTheme';
import { API_BASE_URL } from '@/services/api';

// The URL that will carry the token/user data back to the app
const HANDOFF_PATH = '/api/v1/auth/token-handoff';

export default function HybridLoginScreen() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { colors } = useAppTheme();
  const [isLoading, setIsLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);

  // Derive the web login URL from the API base URL
  // Typically: https://portal.pkn.or.id/user/login
  const webLoginUrl = API_BASE_URL.replace('/api/v1', '/user/login');

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    const { url } = navState;

    // Check if the URL matches the handoff pattern
    if (url.includes(HANDOFF_PATH)) {
      try {
        const urlObj = new URL(url);
        const token = urlObj.searchParams.get('token');
        const userDataStr = urlObj.searchParams.get('user');

        if (token && userDataStr) {
          const user = JSON.parse(decodeURIComponent(userDataStr));
          setAuth(user, token);
          
          // Successful login, navigate back or to dashboard
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/(tabs)');
          }
        }
      } catch (error) {
        console.error('Failed to parse handoff data:', error);
      }
      return false; // Stop navigation
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: webLoginUrl }}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        style={styles.webview}
        // Ensure cookies and session state are handled correctly
        sharedCookiesEnabled={true}
        domStorageEnabled={true}
        javaScriptEnabled={true}
      />
      {isLoading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
