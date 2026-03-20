/**
 * EmptyState — Illustrated empty state with message and optional action.
 * Per UX Flow Guide § 7: must include icon, one-line explanation, and clear next action.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, borderRadius, typography } from '@/theme';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = 'albums-outline',
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const { colors, isDark } = useAppTheme();
  const styles = createStyles(colors, isDark);

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Ionicons name={icon} size={48} color={colors.text.tertiary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          android_ripple={{ color: 'rgba(32, 138, 239, 0.15)' }}
          style={({ pressed }) => [
            styles.actionButton,
            Platform.OS === 'ios' && pressed ? { opacity: 0.7 } : {},
          ]}
          accessibilityRole="button"
        >
          <Text style={styles.actionLabel}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['3xl'],
    minHeight: 300,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: isDark ? colors.background.tertiary : colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.headline,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.subhead,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  actionButton: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  actionLabel: {
    color: colors.text.inverse,
    fontSize: 15,
    fontWeight: '600',
  },
});
