/**
 * NewsDetailScreen — Full article view.
 * Reference: UX Flow Guide § 4.H (Detail)
 */
import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Platform, Share } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { NewsCard } from '@/components/sections/NewsCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, borderRadius, typography } from '@/theme';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import type { NewsItem, NewsResponse } from '@/types';
import { ActivityIndicator } from 'react-native';

export function NewsDetailScreen() {
  const { t } = useTranslation();
  const { colors, isDark } = useAppTheme();
  const styles = createStyles(colors, isDark);
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: newsData, isLoading } = useQuery<NewsResponse>({
    queryKey: ['news'],
    queryFn: async () => {
      const resp = await api.get('/news');
      return resp.data;
    },
  });

  const allNews = newsData?.data || [];
  const article = allNews.find((a) => a.id === Number(id));
  const related = allNews.filter((a) => a.id !== article?.id).slice(0, 2);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleShare = async () => {
    if (!article) return;
    try {
      await Share.share({ message: article.title, title: article.title });
    } catch (_) {}
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
      </View>
    );
  }

  if (!article) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={typography.headline}>{t('news.notFound')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Hero Image */}
        <View style={styles.heroSection}>
          <Image
            source={{ uri: article.thumbnail ?? undefined }}
            style={styles.heroImage}
            contentFit="cover"
            transition={300}
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroActions}>
            <Pressable onPress={() => router.back()} style={styles.heroButton} accessibilityLabel={t('common.back')}>
              <Ionicons name="arrow-back" size={22} color={colors.text.inverse} />
            </Pressable>
            <Pressable onPress={handleShare} style={styles.heroButton} accessibilityLabel={t('common.share')}>
              <Ionicons name="share-outline" size={22} color={colors.text.inverse} />
            </Pressable>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{article.title}</Text>
          <View style={styles.meta}>
            <Text style={styles.date}>{formatDate(article.created_at)}</Text>
          </View>

          {/* Article Body */}
          <Text style={styles.body}>
            {article.content.replace(/<[^>]*>?/gm, '').trim()}
          </Text>


          {/* Related Articles */}
          {related.length > 0 && (
            <>
              <SectionHeader title={t('news.relatedArticles')} />
              {related.map((r) => (
                <NewsCard
                  key={r.id}
                  article={r}
                  onPress={() => router.push(`/news/${r.id}`)}
                />
              ))}
            </>
          )}

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  heroSection: {
    height: 240,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  heroActions: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 40,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: spacing.lg,
    marginTop: -borderRadius.xl,
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  title: {
    ...typography.title1,
    color: colors.text.primary,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  date: {
    ...typography.footnote,
    color: colors.text.tertiary,
  },
  body: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 26,
  },
});
