/**
 * AlertBanner — Reusable alert banner for high-priority messages.
 */
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, borderRadius, typography, shadows } from '@/theme';

interface AlertBannerProps {
  type: 'info' | 'warning' | 'danger' | 'success';
  title: string;
  message: string;
  onPress?: () => void;
  style?: any;
}

export function AlertBanner({ type, title, message, onPress, style }: AlertBannerProps) {
  const { colors } = useAppTheme();
  
  const getIcon = () => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'warning': return 'alert-circle';
      case 'danger': return 'flash';
      default: return 'information-circle';
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success': return { bg: colors.status.success + '20', border: colors.status.success, icon: colors.status.success };
      case 'warning': return { bg: colors.status.warning + '20', border: colors.status.warning, icon: colors.status.warning };
      case 'danger': return { bg: colors.status.danger + '20', border: colors.status.danger, icon: colors.status.danger };
      default: return { bg: colors.status.info + '20', border: colors.status.info, icon: colors.status.info };
    }
  };

  const themeColors = getColors();

  return (
    <Pressable 
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: themeColors.bg, borderColor: themeColors.border },
        pressed && onPress && { opacity: 0.8 },
        style
      ]}
      disabled={!onPress}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={getIcon() as any} size={24} color={themeColors.icon} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
        <Text style={[styles.message, { color: colors.text.secondary }]}>{message}</Text>
      </View>
      {onPress && (
        <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.headline,
    fontSize: 14,
  },
  message: {
    ...typography.caption1,
    marginTop: 2,
  },
});
