/**
 * GuestDashboard — Public dashboard for unauthenticated users.
 * Reference: guest_dashboard_fresh_variant_2 mockup, UX Flow Guide § 4.C.1
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  RefreshControl,
  StyleSheet,
  Platform,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Image } from 'expo-image';
import { useQuery } from '@tanstack/react-query';

import { EventCard } from '@/components/sections/EventCard';
import { NewsCard } from '@/components/sections/NewsCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SkeletonCard } from '@/components/ui/SkeletonLoader';
import { MOCK_DASHBOARD } from '@/services/mockData';
import api from '@/services/api';
import type { EventItem, NewsItem, DashboardResponse as DashboardData } from '@/types';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, borderRadius, typography, shadows } from '@/theme';

export function GuestDashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const styles = createStyles(colors, isDark);

  const {
    data: dashboardData,
    isLoading,
    isError,
    refetch,
  } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const resp = await api.get('/mobile-dashboard');
      return resp.data;
    },
  });

  const [refreshing, setRefreshing] = useState(false);
  const data: DashboardData = dashboardData || (MOCK_DASHBOARD as unknown as DashboardData);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (e) {
      console.error('Refresh failed', e);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);


  const handleEventPress = (event: EventItem) => {
    router.push(`/events/${event.id}`);
  };

  const handleNewsPress = (article: NewsItem) => {
    router.push(`/news/${article.id}`);
  };

  if (isLoading && !dashboardData) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand.primary}
            colors={[colors.brand.primary]}
          />
        }
      >
        <View style={styles.banner}>
          <View style={styles.bannerContent}>
            <Text style={styles.greeting}>{t('dashboard.guestGreeting')}</Text>
            <Text style={styles.subtitle}>{t('dashboard.guestSubtitle')}</Text>
          </View>
        </View>
        <SectionHeader title={t('dashboard.featuredEvents')} />
        <View style={{ paddingLeft: spacing.lg, flexDirection: 'row', gap: spacing.md }}>
          <SkeletonCard style={{ width: 280 }} />
          <SkeletonCard style={{ width: 280 }} />
        </View>
        <SectionHeader title={t('dashboard.latestNews')} />
        <View style={{ marginHorizontal: spacing.lg }}>
          <SkeletonCard style={{ width: '100%', marginBottom: spacing.md }} />
          <SkeletonCard style={{ width: '100%' }} />
        </View>
      </ScrollView>
    );
  }

  if (isError && !dashboardData) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={{ padding: spacing.xl, alignItems: 'center' }}>
          <Ionicons name="cloud-offline" size={64} color={colors.text.tertiary} />
          <Text style={[typography.headline, { marginTop: spacing.md, color: colors.text.primary }]}>
            {t('common.error')}
          </Text>
          <Pressable onPress={() => refetch()} style={{ marginTop: spacing.md }}>
            <Text style={{ color: colors.brand.primary }}>{t('common.retry')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.brand.primary}
          colors={[colors.brand.primary]}
        />
      }
      contentInsetAdjustmentBehavior="automatic"
    >
      {/* Greeting Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerContent}>
          <Text style={styles.greeting}>{t('dashboard.guestGreeting')}</Text>
          <Text style={styles.subtitle}>{t('dashboard.guestSubtitle')}</Text>
        </View>
        <View style={styles.bannerIcon}>
          <Ionicons name="school" size={40} color={colors.brand.primary} />
        </View>
      </View>



      {/* Featured Events Carousel */}
      <SectionHeader
        title={t('dashboard.featuredEvents')}
        actionLabel={t('dashboard.viewAll')}
        onAction={() => router.push('/(tabs)/events')}
      />
      {isLoading ? (
        <View style={styles.horizontalList}>
          {[1, 2].map((i) => (
            <SkeletonCard key={i} style={{ width: 260, marginRight: spacing.md }} />
          ))}
        </View>
      ) : (
        <FlatList
          data={data.featured_events}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              onPress={() => handleEventPress(item)}
              variant="horizontal"
            />
          )}
        />
      )}

      {/* Why Join PKN? */}
      <View style={[styles.whyJoinCard, shadows.md]}>
        <Ionicons name="people" size={32} color={colors.brand.primary} />
        <View style={styles.whyJoinContent}>
          <Text style={styles.whyJoinTitle}>{t('dashboard.whyJoin')}</Text>
          <Text style={styles.whyJoinDesc}>{t('dashboard.whyJoinDesc')}</Text>
        </View>
        <Pressable
          onPress={() => {}}
          android_ripple={{ color: 'rgba(32, 138, 239, 0.15)' }}
          style={({ pressed }) => [
            styles.whyJoinButton,
            Platform.OS === 'ios' && pressed ? { opacity: 0.7 } : {},
          ]}
        >
          <Text style={styles.whyJoinButtonText}>{t('common.signIn')}</Text>
        </Pressable>
      </View>

      {/* Latest News */}
      <SectionHeader
        title={t('dashboard.latestNews')}
        actionLabel={t('dashboard.viewAll')}
        onAction={() => router.push('/news')}
      />
      {data.latest_news.length > 0 && (
        <View style={styles.newsSection}>
          <NewsCard
            article={data.latest_news[0]}
            onPress={() => handleNewsPress(data.latest_news[0])}
            variant="featured"
          />
          {data.latest_news.slice(1).map((article) => (
            <NewsCard
              key={article.id}
              article={article}
              onPress={() => handleNewsPress(article)}
              variant="compact"
            />
          ))}
        </View>
      )}

      {/* Testimonials */}
      <SectionHeader title={t('dashboard.testimonials')} />
      <FlatList
        data={data.testimonials}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.testimonialCard, shadows.sm]}>
            <Text style={styles.testimonialQuote}>"{item.quote}"</Text>
            <View style={styles.testimonialAuthor}>
              <View style={styles.testimonialAvatar}>
                <Text style={styles.testimonialInitial}>
                  {item.name.charAt(0)}
                </Text>
              </View>
              <View>
                <Text style={styles.testimonialName}>{item.name}</Text>
                <Text style={styles.testimonialRole}>{item.role}</Text>
              </View>
            </View>
          </View>
        )}
      />

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  content: {
    paddingTop: spacing.lg,
  },
  banner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: isDark ? colors.background.tertiary : colors.brand.primary,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: isDark ? 1 : 0,
    borderColor: colors.border.light,
  },
  bannerContent: {
    flex: 1,
    marginRight: spacing.lg,
  },
  greeting: {
    ...typography.title2,
    color: isDark ? colors.text.primary : colors.text.inverse,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.subhead,
    color: isDark ? colors.text.secondary : 'rgba(255,255,255,0.8)',
  },
  bannerIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    backgroundColor: isDark ? colors.background.secondary : 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontalList: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  whyJoinCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    marginVertical: spacing.sm,
    borderWidth: isDark ? 1 : 0,
    borderColor: colors.border.light,
  },
  whyJoinContent: {
    flex: 1,
  },
  whyJoinTitle: {
    ...typography.headline,
    color: colors.text.primary,
  },
  whyJoinDesc: {
    ...typography.footnote,
    color: colors.text.secondary,
    marginTop: 2,
  },
  whyJoinButton: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  whyJoinButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.inverse,
  },
  newsSection: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    borderWidth: isDark ? 1 : 0,
    borderColor: colors.border.light,
  },
  testimonialCard: {
    width: 280,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginRight: spacing.md,
    justifyContent: 'space-between',
    borderWidth: isDark ? 1 : 0,
    borderColor: colors.border.light,
  },
  testimonialQuote: {
    ...typography.subhead,
    color: colors.text.secondary,
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  testimonialAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  testimonialAvatar: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  testimonialInitial: {
    color: colors.text.inverse,
    fontWeight: '700',
    fontSize: 16,
  },
  testimonialName: {
    ...typography.footnote,
    fontWeight: '600',
    color: colors.text.primary,
  },
  testimonialRole: {
    ...typography.caption2,
    color: colors.text.tertiary,
  },
  bottomSpacer: {
    height: Platform.OS === 'ios' ? 100 : 80,
  },
});

