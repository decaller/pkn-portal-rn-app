/**
 * SkeletonLoader — Animated shimmer placeholder for loading states.
 * Per UX Flow Guide § 7: use skeleton blocks for first-load states.
 */
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { borderRadius } from '@/theme';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadiusSize?: number;
  style?: ViewStyle;
}

export function SkeletonLoader({
  width = '100%',
  height = 16,
  borderRadiusSize = borderRadius.md,
  style,
}: SkeletonLoaderProps) {
  const { colors, isDark } = useAppTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [isDark ? 0.1 : 0.3, isDark ? 0.3 : 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          backgroundColor: isDark ? colors.background.tertiary : colors.border.light,
          width: width as any,
          height,
          borderRadius: borderRadiusSize,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCard({ style }: { style?: ViewStyle }) {
  const { colors, isDark } = useAppTheme();
  
  return (
    <View style={[
      {
        backgroundColor: colors.background.card,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        marginBottom: 16,
      },
      style
    ]}>
      <SkeletonLoader height={160} borderRadiusSize={borderRadius.lg} />
      <View style={{ padding: 12, gap: 4 }}>
        <SkeletonLoader width="80%" height={18} />
        <SkeletonLoader width="60%" height={14} style={{ marginTop: 8 }} />
        <SkeletonLoader width="40%" height={12} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}
