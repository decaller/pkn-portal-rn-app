import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { spacing } from '@/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

const STALE_THRESHOLD = 1000 * 60 * 60; // 1 hour

export function HeaderReloadButton() {
  const { colors } = useAppTheme();
  const queryClient = useQueryClient();
  const [isStale, setIsStale] = useState(false);
  const opacity = React.useRef(new Animated.Value(0)).current;

  // Subscribe to these queries to get updates
  const { dataUpdatedAt: dashboardUpdatedAt } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => queryClient.getQueryData(['dashboard']),
    enabled: false,
  });

  const { dataUpdatedAt: eventsUpdatedAt } = useQuery({
    queryKey: ['events'],
    queryFn: () => queryClient.getQueryData(['events']),
    enabled: false,
  });

  const checkStaleness = () => {
    const now = Date.now();
    const latestUpdate = Math.max(dashboardUpdatedAt || 0, eventsUpdatedAt || 0);

    // If we have data and it's older than threshold
    const currentlyStale = latestUpdate > 0 && now - latestUpdate > STALE_THRESHOLD;

    if (currentlyStale !== isStale) {
      setIsStale(currentlyStale);
      Animated.timing(opacity, {
        toValue: currentlyStale ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  useEffect(() => {
    checkStaleness();
    // Check every minute in case time passes without updates
    const interval = setInterval(checkStaleness, 1000 * 60);
    return () => clearInterval(interval);
  }, [dashboardUpdatedAt, eventsUpdatedAt, isStale]);

  const handlePress = async () => {
    try {
      // Refresh both queries
      await queryClient.refetchQueries({ queryKey: ['dashboard'] });
      await queryClient.refetchQueries({ queryKey: ['events'] });
    } catch (error) {
      console.error('Failed to refetch queries:', error);
    }
  };

  if (!isStale) return null;

  return (
    <Animated.View style={{ opacity }}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: colors.brand.primary + (pressed ? '33' : '1A'), // 20% or 10% opacity
          }
        ]}
      >
        <Ionicons name="refresh-outline" size={22} color={colors.brand.primary} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: spacing.sm,
    borderRadius: 20,
  },
});
