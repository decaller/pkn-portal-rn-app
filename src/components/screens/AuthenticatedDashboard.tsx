/**
 * AuthenticatedDashboard — Private dashboard for logged-in users.
 * Reference: refined_dashboard_screen mockup, UX Flow Guide § 4.C.2
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
import { useQuery } from '@tanstack/react-query';

import { EventCard } from '@/components/sections/EventCard';
import { NewsCard } from '@/components/sections/NewsCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SkeletonCard } from '@/components/ui/SkeletonLoader';
import { DocumentCarousel } from '@/components/sections/DocumentCarousel';
import { MOCK_DASHBOARD } from '@/services/mockData';
import api from '@/services/api';
import type { EventItem, NewsItem, DashboardResponse as DashboardData } from '@/types';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAuthStore } from '@/store/authStore';
import { spacing, borderRadius, typography } from '@/theme';

import { AlertBanner } from '@/components/ui/AlertBanner';

export function AuthenticatedDashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const { user } = useAuthStore();
  const styles = createStyles(colors, isDark);

  const {
    data: dashboardData,
    isLoading,
    refetch,
  } = useQuery<DashboardData>({
    queryKey: ['dashboard', user?.id],
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

  const activeRegistrations = data.stats?.active_registrations ?? 0;
  const pendingPayments = data.stats?.pending_payments ?? 0;

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
      {/* Personalized Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>
            {(t('dashboard.userGreeting', { name: user?.name || t('common.user') }) as string)}
          </Text>
          <Text style={styles.subtitle}>{user?.organization?.name || t('dashboard.userSubtitle')}</Text>
        </View>
      </View>

      {/* High-priority Alerts */}
      {data.alerts && data.alerts.length > 0 && (
        <View style={styles.alertsSection}>
          {data.alerts.map((alert) => (
            <AlertBanner
              key={alert.id}
              type={alert.type}
              title={alert.title}
              message={alert.message}
              onPress={alert.action_route ? () => router.push(alert.action_route as any) : undefined}
            />
          ))}
        </View>
      )}

      <Pressable
        onPress={() => router.push('/(tabs)/registrations')}
        style={({ pressed }) => [
          styles.registrationButton,
          pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] },
        ]}
      >
        <View style={styles.registrationButtonContent}>
          <View style={styles.registrationIcon}>
            <Ionicons name="ticket-outline" size={24} color={colors.brand.primary} />
          </View>

          <View style={styles.registrationCopy}>
            <Text style={styles.registrationTitle}>{t('dashboard.myRegistrations')}</Text>
            <Text style={styles.registrationSubtitle}>
              {activeRegistrations} {t('dashboard.activeEvents')}
            </Text>
          </View>

          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeValue}>{pendingPayments}</Text>
            <Text style={styles.pendingBadgeLabel}>{t('dashboard.pendingPayments')}</Text>
          </View>
        </View>
      </Pressable>

      {/* Featured Document Carousel */}
      {(() => {
        const featuredDocs = data.featured_documents || (data.featured_document ? [data.featured_document] : []);
        if (featuredDocs.length === 0) return null;

        return (
          <>
            <SectionHeader
              title={t('dashboard.featuredDocument')}
              actionLabel={t('dashboard.viewAll')}
              onAction={() => router.push('/(tabs)/documents')}
            />
            <DocumentCarousel documents={featuredDocs} />
          </>
        );
      })()}

      {/* Featured Events */}
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

      {/* Latest News */}
      <SectionHeader
        title={t('dashboard.latestNews')}
        actionLabel={t('dashboard.viewAll')}
        onAction={() => router.push('/news')}
      />
      {data.latest_news.length > 0 && (
        <FlatList
          data={data.latest_news}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <NewsCard
              article={item}
              onPress={() => handleNewsPress(item)}
              variant="horizontal"
            />
          )}
        />
      )}

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  headerContent: {
    flex: 1,
  },
  alertsSection: {
    marginBottom: spacing.md,
  },
  greeting: {
    ...typography.title1,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.subhead,
    color: colors.text.secondary,
    marginTop: 2,
  },
  registrationButton: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  registrationButtonContent: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: isDark ? 1 : 0,
    borderColor: colors.border.light,
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)',
  },
  registrationIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
  },
  registrationCopy: {
    flex: 1,
    gap: 2,
  },
  registrationTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
  },
  registrationSubtitle: {
    ...typography.footnote,
    color: colors.text.secondary,
  },
  pendingBadge: {
    minWidth: 84,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.brand.primary,
  },
  pendingBadgeValue: {
    ...typography.title3,
    color: colors.text.inverse,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  pendingBadgeLabel: {
    ...typography.caption2,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
    textAlign: 'center',
  },
  horizontalList: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  bottomSpacer: {
    height: Platform.OS === 'ios' ? 100 : 80,
  },
});
