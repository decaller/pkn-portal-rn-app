/**
 * Badge — Status indicator chip.
 * Maps semantic status to colors per UX Flow Guide § 8.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, borderRadius } from '@/theme';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'info';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export function Badge({ label, variant = 'neutral' }: BadgeProps) {
  const { colors, isDark } = useAppTheme();
  
  const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
    success: { bg: colors.status.successLight, text: colors.status.success },
    warning: { bg: colors.status.warningLight, text: isDark ? '#FBBF24' : '#92400E' },
    danger: { bg: colors.status.dangerLight, text: colors.status.danger },
    neutral: { bg: colors.status.neutralLight, text: isDark ? '#D1D5DB' : '#4B5563' },
    info: { bg: colors.status.infoLight, text: colors.status.info },
  };

  const colorScheme = variantColors[variant];
  return (
    <View style={[styles.container, { backgroundColor: colorScheme.bg }]}>
      <Text style={[styles.label, { color: colorScheme.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
