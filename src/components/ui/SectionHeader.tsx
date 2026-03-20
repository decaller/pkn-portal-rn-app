/**
 * SectionHeader — Reusable header with title and optional "See All" action.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, typography } from '@/theme';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  const { colors, isDark } = useAppTheme();
  const styles = createStyles(colors, isDark);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          android_ripple={{ color: 'rgba(32, 138, 239, 0.15)' }}
          style={({ pressed }) => [
            styles.action,
            Platform.OS === 'ios' && pressed ? { opacity: 0.7 } : {},
          ]}
          accessibilityRole="button"
        >
          <Text style={styles.actionLabel}>{actionLabel}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.brand.primary} />
        </Pressable>
      )}
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    ...typography.title3,
    color: colors.text.primary,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.brand.primary,
  },
});
