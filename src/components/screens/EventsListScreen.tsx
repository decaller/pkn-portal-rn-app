/**
 * EventsListScreen — Searchable event discovery screen.
 * Reference: events_list_screen mockup, UX Flow Guide § 4.C
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { EventCard } from '@/components/sections/EventCard';
import { SearchBar } from '@/components/ui/SearchBar';
import { FilterChip } from '@/components/ui/FilterChip';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/SkeletonLoader';
import { colors, spacing } from '@/theme';
import { MOCK_EVENTS } from '@/services/mockData';
import type { EventItem } from '@/types';

const FILTERS = ['all', 'upcoming', 'ongoing', 'past'] as const;

export function EventsListScreen() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading] = useState(false);

  const filteredEvents = MOCK_EVENTS.filter((event) => {
    const matchesSearch =
      !search || event.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      activeFilter === 'all' || event.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const handleEventPress = (event: EventItem) => {
    router.push(`/events/${event.id}`);
  };

  const resetFilters = () => {
    setSearch('');
    setActiveFilter('all');
  };

  if (loading) {
    return (
      <View style={styles.container}>
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
      </View>
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
              label={t(`events.filters.${filter}`)}
              isActive={activeFilter === filter}
              onPress={() => setActiveFilter(filter)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Events List */}
      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <EventCard event={item} onPress={() => handleEventPress(item)} />
        )}
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

const styles = StyleSheet.create({
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
