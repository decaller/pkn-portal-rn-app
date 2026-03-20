/**
 * EventCard — Reusable event card for lists and carousels.
 * Uses Pressable with platform-correct feedback.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/Badge';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, borderRadius, shadows, typography } from '@/theme';
import type { EventItem } from '@/types';

interface EventCardProps {
  event: EventItem;
  onPress: () => void;
  variant?: 'full' | 'compact' | 'horizontal';
}

function getStatusBadge(event: EventItem) {
  if (!event.is_published) return { label: 'Draft', variant: 'neutral' as const };
  if (event.is_full) return { label: 'Full', variant: 'danger' as const };
  if (event.allow_registration) return { label: 'Open', variant: 'success' as const };
  return { label: 'Closed', variant: 'neutral' as const };
}


function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function EventCard({ event, onPress, variant = 'full' }: EventCardProps) {
  const { t } = useTranslation();
  const { colors, isDark } = useAppTheme();
  const styles = createStyles(colors, isDark);

  if (variant === 'horizontal') {
    return (
      <Pressable
        onPress={onPress}
        android_ripple={{ color: 'rgba(0,0,0,0.08)' }}
        style={({ pressed }) => [
          styles.horizontalCard,
          shadows.md,
          Platform.OS === 'ios' && pressed ? { opacity: 0.85 } : {},
        ]}
        accessibilityRole="button"
        accessibilityLabel={event.title}
      >
        <Image
          source={{ uri: event.cover_image ?? undefined }}
          style={styles.horizontalImage}
          contentFit="cover"
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          transition={300}
        />
        <View style={styles.horizontalContent}>
          <Badge label={getStatusBadge(event).label} variant={getStatusBadge(event).variant} />
          <Text style={styles.horizontalTitle} numberOfLines={2}>
            {event.title}
          </Text>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={12} color={colors.text.tertiary} />
            <Text style={styles.metaText}>{formatDate(event.event_date)}</Text>
          </View>
        </View>

      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: 'rgba(0,0,0,0.08)' }}
      style={({ pressed }) => [
        styles.card,
        shadows.md,
        Platform.OS === 'ios' && pressed ? { opacity: 0.85 } : {},
      ]}
      accessibilityRole="button"
      accessibilityLabel={event.title}
    >
      <Image
        source={{ uri: event.cover_image ?? undefined }}
        style={styles.image}
        contentFit="cover"
        placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        transition={300}
      />
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Badge label={getStatusBadge(event).label} variant={getStatusBadge(event).variant} />
          {event.available_spots !== null && event.available_spots > 0 && (
            <Text style={styles.spotsText}>
              {t('events.spotsLeft', { count: event.available_spots })}
            </Text>
          )}
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>
        <Text style={styles.summary} numberOfLines={2}>
          {event.summary}
        </Text>
        <View style={styles.metaContainer}>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={14} color={colors.text.tertiary} />
            <Text style={styles.metaText}>{formatDate(event.event_date)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={colors.text.tertiary} />
            <Text style={styles.metaText} numberOfLines={1}>
              {event.city || event.nation || 'TBA'}
            </Text>
          </View>
        </View>
      </View>

    </Pressable>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  card: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    borderWidth: isDark ? 1 : 0,
    borderColor: colors.border.light,
  },
  image: {
    width: '100%',
    height: 180,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...typography.headline,
    color: colors.text.primary,
  },
  summary: {
    ...typography.subhead,
    color: colors.text.secondary,
  },
  spotsText: {
    fontSize: 12,
    color: colors.status.warning,
    fontWeight: '500',
  },
  metaContainer: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...typography.caption1,
    color: colors.text.tertiary,
  },
  // Horizontal variant (for carousels)
  horizontalCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    width: 260,
    marginRight: spacing.md,
    borderWidth: isDark ? 1 : 0,
    borderColor: colors.border.light,
  },
  horizontalImage: {
    width: '100%',
    height: 130,
  },
  horizontalContent: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  horizontalTitle: {
    ...typography.callout,
    fontWeight: '600',
    color: colors.text.primary,
  },
});
