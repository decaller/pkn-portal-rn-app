/**
 * FilterChip — Tappable filter pill for list filtering.
 * Uses Pressable with platform-correct feedback per Native Look and Feel Guide.
 */
import React from 'react';
import { Pressable, Text, StyleSheet, Platform } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, borderRadius } from '@/theme';

interface FilterChipProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

export function FilterChip({ label, isActive, onPress }: FilterChipProps) {
  const { colors, isDark } = useAppTheme();
  const styles = createStyles(colors, isDark);

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: 'rgba(32, 138, 239, 0.15)' }}
      style={({ pressed }) => [
        styles.chip,
        isActive ? styles.active : styles.inactive,
        Platform.OS === 'ios' && pressed ? { opacity: 0.7 } : {},
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
    >
      <Text style={[styles.label, isActive ? styles.activeLabel : styles.inactiveLabel]}>
        {label}
      </Text>
    </Pressable>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    borderWidth: 1,
  },
  active: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  inactive: {
    backgroundColor: isDark ? colors.background.tertiary : colors.background.card,
    borderColor: colors.border.light,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeLabel: {
    color: colors.text.inverse,
  },
  inactiveLabel: {
    color: colors.text.secondary,
  },
});
