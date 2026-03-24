/**
 * NewsListScreen — News/articles listing.
 * Reference: UX Flow Guide § 4.H
 */
import React, { useState, useCallback } from 'react';
import { View, RefreshControl, StyleSheet, Platform } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { NewsCard } from '@/components/sections/NewsCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors, spacing } from '@/theme';
import { MOCK_NEWS } from '@/services/mockData';
import type { NewsItem } from '@/types';

export function NewsListScreen() {
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const handlePress = (article: NewsItem) => {
    router.push(`/news/${article.id}`);
  };

  return (
    <FlashList
      data={MOCK_NEWS}
      keyExtractor={(item) => item.id.toString()}
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      estimatedItemSize={120}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.brand.primary}
          colors={[colors.brand.primary]}
        />
      }
      contentInsetAdjustmentBehavior="automatic"
      ListHeaderComponent={
        MOCK_NEWS.length > 0 ? (
          <View style={styles.featuredContainer}>
            <NewsCard
              article={MOCK_NEWS[0]}
              onPress={() => handlePress(MOCK_NEWS[0])}
              variant="featured"
            />
          </View>
        ) : null
      }
      renderItem={({ item, index }) =>
        index === 0 ? null : (
          <NewsCard article={item} onPress={() => handlePress(item)} />
        )
      }
      ListEmptyComponent={
        <EmptyState
          icon="newspaper-outline"
          title="No articles found"
          message="Check back later for new articles"
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  featuredContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },
});
