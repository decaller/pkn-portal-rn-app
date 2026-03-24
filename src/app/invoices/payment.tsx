import React from 'react';
import { View, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { useQueryClient } from '@tanstack/react-query';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function PaymentWebViewScreen() {
  const { url, invoiceId } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const { colors } = useAppTheme();

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    const { url: currentUrl } = navState;

    // Detect Finish/Return URL from backend configuration
    // Usually something like: https://pkn-portal.id/payments/finish
    if (currentUrl.includes('/payments/finish') || currentUrl.includes('/payments/completed')) {
      // Invalidate queries to refresh data on Return
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });
      
      // Navigate back to Invoice Detail
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: url as string }}
        onNavigationStateChange={handleNavigationStateChange}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.brand.primary} />
          </View>
        )}
        onShouldStartLoadWithRequest={(request) => {
          // Handle Deep Links (GoPay, ShopeePay, etc)
          const { url: requestUrl } = request;
          
          if (
            requestUrl.startsWith('gojek://') || 
            requestUrl.startsWith('shopeepay://') ||
            requestUrl.startsWith('ul-link://') ||
            !requestUrl.startsWith('http')
          ) {
            Linking.openURL(requestUrl);
            return false; // Prevent WebView from trying to load custom schemes
          }
          
          return true;
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  loading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF'
  }
});
