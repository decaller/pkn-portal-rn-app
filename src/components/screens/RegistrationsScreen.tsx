/**
 * RegistrationsScreen — Shows user's event registrations.
 * Reference: UX Flow Guide § 4.D
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, typography, borderRadius } from '@/theme';

export function RegistrationsScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.emptyState}>
        <Ionicons name="calendar-outline" size={80} color={colors.text.tertiary} />
        <Text style={styles.title}>{t('tabs.registrations')}</Text>
        <Text style={styles.description}>
          Your event registrations will appear here. This feature is coming soon!
        </Text>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    textAlign: 'center',
  },
  title: {
    ...typography.title2,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
