/**
 * EventCard — Reusable event card for lists and carousels.
 * Uses Pressable with platform-correct feedback.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '@/components/ui/Badge';
import { colors, spacing, borderRadius, shadows, typography } from '@/theme';
import type { EventItem } from '@/types';

interface EventCardProps {
  event: EventItem;
  onPress: () => void;
  variant?: 'full' | 'compact' | 'horizontal';
}

function getStatusBadgeVariant(status: EventItem['status']) {
  switch (status) {
    case 'upcoming':
      return 'info';
    case 'ongoing':
      return 'success';
    case 'past':
      return 'neutral';
    case 'cancelled':
      return 'danger';
    default:
      return 'neutral';
  }
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
          source={{ uri: event.image?.url }}
          style={styles.horizontalImage}
          contentFit="cover"
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          transition={300}
        />
        <View style={styles.horizontalContent}>
          <Badge label={event.status} variant={getStatusBadgeVariant(event.status)} />
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
        source={{ uri: event.image?.url }}
        style={styles.image}
        contentFit="cover"
        placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        transition={300}
      />
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Badge label={event.status} variant={getStatusBadgeVariant(event.status)} />
          {event.available_spots !== null && event.available_spots > 0 && (
            <Text style={styles.spotsText}>
              {event.available_spots} spots left
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
              {event.location}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
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
