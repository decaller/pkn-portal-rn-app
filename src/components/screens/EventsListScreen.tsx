/**
 * EventsListScreen — Searchable event discovery screen.
 * Reference: events_list_screen mockup, UX Flow Guide § 4.C
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  RefreshControl,
  StyleSheet,
  Platform,
  ScrollView,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { EventCard } from '@/components/sections/EventCard';
import { SearchBar } from '@/components/ui/SearchBar';
import { FilterChip } from '@/components/ui/FilterChip';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/SkeletonLoader';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import type { EventItem, EventsResponse } from '@/types';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing } from '@/theme';

const FILTERS = ['all', 'upcoming', 'past'] as const;

export function EventsListScreen() {
  const { t } = useTranslation();
  const { colors, isDark } = useAppTheme();
  const styles = createStyles(colors, isDark);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: eventsData,
    isLoading,
    refetch,
  } = useQuery<EventsResponse>({
    queryKey: ['events'],
    queryFn: async () => {
      const resp = await api.get('/events');
      return resp.data;
    },
  });

  const allEvents = eventsData?.data || [];

  const filteredEvents = allEvents.filter((event: EventItem) => {
    const matchesSearch =
      !search || event.title.toLowerCase().includes(search.toLowerCase());

    const isPast = new Date(event.event_date) < new Date();
    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'upcoming' && !isPast) ||
      (activeFilter === 'past' && isPast);

    return matchesSearch && matchesFilter;
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);


  const handleEventPress = (event: EventItem) => {
    router.push(`/events/${event.id}`);
  };

  const resetFilters = () => {
    setSearch('');
    setActiveFilter('all');
  };

  if (isLoading && !eventsData) {
    return (
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand.primary}
            colors={[colors.brand.primary]}
          />
        }
      >
        <View style={styles.searchSection}>
          <SearchBar
            value=""
            onChangeText={() => {}}
            placeholder={t('events.searchPlaceholder')}
          />
        </View>
        <View style={styles.listContent}>
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search & Filters */}
      <View style={styles.searchSection}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder={t('events.searchPlaceholder')}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
          contentContainerStyle={styles.filterContent}
        >
          {FILTERS.map((filter) => (
            <FilterChip
              key={filter}
              label={t(`events.filters.${filter}` as any)}
              isActive={activeFilter === filter}
              onPress={() => setActiveFilter(filter)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Events List */}
      <FlashList
        data={filteredEvents}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <EventCard event={item} onPress={() => handleEventPress(item)} />
        )}
        estimatedItemSize={280}
        contentContainerStyle={styles.listContent}
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
        ListEmptyComponent={
          <EmptyState
            icon="calendar-outline"
            title={t('events.noEvents')}
            message={t('events.noEventsDesc')}
            actionLabel={t('events.resetFilters')}
            onAction={resetFilters}
          />
        }
      />
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  searchSection: {
    backgroundColor: colors.background.card,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.light,
  },
  filterRow: {
    marginTop: spacing.sm,
  },
  filterContent: {
    paddingBottom: spacing.sm,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
    flexGrow: 1,
  },
});
