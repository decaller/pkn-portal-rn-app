/**
 * NewsCard — Reusable news article card for lists and featured sections.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Image } from 'expo-image';
import { colors, spacing, borderRadius, shadows, typography } from '@/theme';
import type { NewsItem } from '@/types';

interface NewsCardProps {
  article: NewsItem;
  onPress: () => void;
  variant?: 'featured' | 'compact';
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function NewsCard({ article, onPress, variant = 'compact' }: NewsCardProps) {
  if (variant === 'featured') {
    return (
      <Pressable
        onPress={onPress}
        android_ripple={{ color: 'rgba(0,0,0,0.08)' }}
        style={({ pressed }) => [
          styles.featured,
          shadows.md,
          Platform.OS === 'ios' && pressed ? { opacity: 0.85 } : {},
        ]}
        accessibilityRole="button"
        accessibilityLabel={article.title}
      >
        <Image
          source={{ uri: article.image?.url }}
          style={styles.featuredImage}
          contentFit="cover"
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          transition={300}
        />
        <View style={styles.featuredOverlay}>
          {article.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{article.category}</Text>
            </View>
          )}
          <Text style={styles.featuredTitle} numberOfLines={2}>
            {article.title}
          </Text>
          <Text style={styles.featuredDate}>{formatDate(article.published_at)}</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: 'rgba(0,0,0,0.08)' }}
      style={({ pressed }) => [
        styles.compact,
        Platform.OS === 'ios' && pressed ? { opacity: 0.85 } : {},
      ]}
      accessibilityRole="button"
      accessibilityLabel={article.title}
    >
      {article.image && (
        <Image
          source={{ uri: article.image.url }}
          style={styles.compactImage}
          contentFit="cover"
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          transition={300}
        />
      )}
      <View style={styles.compactContent}>
        <Text style={styles.compactTitle} numberOfLines={2}>
          {article.title}
        </Text>
        <Text style={styles.compactExcerpt} numberOfLines={2}>
          {article.excerpt}
        </Text>
        <Text style={styles.compactDate}>{formatDate(article.published_at)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Featured variant
  featured: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    height: 220,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingTop: spacing['4xl'],
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  categoryBadge: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.inverse,
    textTransform: 'uppercase',
  },
  featuredTitle: {
    ...typography.title3,
    color: colors.text.inverse,
  },
  featuredDate: {
    ...typography.caption1,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.xs,
  },

  // Compact variant
  compact: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.light,
    gap: spacing.md,
  },
  compactImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
  },
  compactContent: {
    flex: 1,
    gap: spacing.xs,
  },
  compactTitle: {
    ...typography.callout,
    fontWeight: '600',
    color: colors.text.primary,
  },
  compactExcerpt: {
    ...typography.footnote,
    color: colors.text.secondary,
  },
  compactDate: {
    ...typography.caption2,
    color: colors.text.tertiary,
  },
});
