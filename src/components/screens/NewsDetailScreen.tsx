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
import { colors, spacing, borderRadius, typography } from '@/theme';
import { MOCK_NEWS } from '@/services/mockData';

export function NewsDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const article = MOCK_NEWS.find((a) => a.id === Number(id)) ?? MOCK_NEWS[0];
  const related = MOCK_NEWS.filter((a) => a.id !== article.id).slice(0, 2);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: article.title, title: article.title });
    } catch (_) {}
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Hero Image */}
        <View style={styles.heroSection}>
          <Image
            source={{ uri: article.image?.url }}
            style={styles.heroImage}
            contentFit="cover"
            transition={300}
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroActions}>
            <Pressable onPress={() => router.back()} style={styles.heroButton}>
              <Ionicons name="arrow-back" size={22} color={colors.text.inverse} />
            </Pressable>
            <Pressable onPress={handleShare} style={styles.heroButton}>
              <Ionicons name="share-outline" size={22} color={colors.text.inverse} />
            </Pressable>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {article.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{article.category}</Text>
            </View>
          )}
          <Text style={styles.title}>{article.title}</Text>
          <View style={styles.meta}>
            {article.author && (
              <Text style={styles.author}>By {article.author}</Text>
            )}
            <Text style={styles.date}>{formatDate(article.published_at)}</Text>
          </View>

          {/* Article Body */}
          <Text style={styles.body}>
            {article.excerpt}
            {'\n\n'}
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            malesuada lacus ex, sit amet blandit leo lobortis eget. Ut vel
            eleifend ante. Donec sit amet sapien mollis, hendrerit tortor nec,
            viverra dui. Praesent vitae ligula eu eros condimentum elementum.
            {'\n\n'}
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem
            accusantium doloremque laudantium. Nemo enim ipsam voluptatem quia
            voluptas sit aspernatur aut odit aut fugit.
            {'\n\n'}
            At vero eos et accusamus et iusto odio dignissimos ducimus qui
            blanditiis praesentium voluptatum deleniti atque corrupti quos dolores
            et quas molestias excepturi sint occaecati cupiditate non provident.
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

const styles = StyleSheet.create({
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
  categoryBadge: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.inverse,
    textTransform: 'uppercase',
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
  author: {
    ...typography.footnote,
    color: colors.text.secondary,
    fontWeight: '500',
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
