/**
 * RegistrationsScreen — Shows user's event registrations.
 * Reference: UX Flow Guide § 4.F
 */
import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  RefreshControl, 
  Pressable,
  ActivityIndicator
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, typography, borderRadius, shadows } from '@/theme';
import { SearchBar } from '@/components/ui/SearchBar';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import api from '@/services/api';
import type { Registration } from '@/types';

export function RegistrationsScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const router = useRouter();
  const styles = createStyles(colors);

  const [searchQuery, setSearchQuery] = useState('');

  const { data: registrations, isLoading, refetch } = useQuery<Registration[]>({
    queryKey: ['registrations'],
    queryFn: async () => {
      const resp = await api.get('/registrations');
      return resp.data;
    },
  });

  const filteredRegistrations = useMemo(() => {
    if (!registrations) return [];
    if (!searchQuery.trim()) return registrations;
    
    const query = searchQuery.toLowerCase();
    return registrations.filter(reg => 
      reg.event?.title.toLowerCase().includes(query) || 
      reg.registration_number.toLowerCase().includes(query)
    );
  }, [registrations, searchQuery]);

  const getStatusVariant = (status: Registration['status']) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'awaiting_payment': return 'warning';
      case 'cancelled': return 'danger';
      case 'submitted': return 'info';
      default: return 'neutral';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(i18n.language === 'id' ? 'id-ID' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderItem = ({ item }: { item: Registration }) => (
    <Pressable 
      onPress={() => router.push(`/registrations/${item.id}`)}
      style={({ pressed }) => [
        styles.registrationCard,
        shadows.sm,
        pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }
      ]}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.eventTitle} numberOfLines={1}>
          {item.event?.title || 'Unknown Event'}
        </Text>
        <Badge 
          label={t(`registrations.status.${item.status}`, item.status)} 
          variant={getStatusVariant(item.status)} 
        />
      </View>
      
      <View style={styles.cardInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="finger-print" size={14} color={colors.text.tertiary} />
          <Text style={styles.infoText}>{item.registration_number}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={14} color={colors.text.tertiary} />
          <Text style={styles.infoText}>{formatDate(item.created_at)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="people-outline" size={14} color={colors.text.tertiary} />
          <Text style={styles.infoText}>
            {item.participants.length} {t('registrations.participants')}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.amountText}>
          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.total_amount)}
        </Text>
        <View style={styles.actionLink}>
          <Text style={styles.actionText}>{t('common.seeDetails', 'Details')}</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.brand.primary} />
        </View>
      </View>
    </Pressable>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SearchBar 
          placeholder={t('registrations.searchPlaceholder', 'Search registrations...')}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredRegistrations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={isLoading} 
            onRefresh={refetch} 
            tintColor={colors.brand.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="ticket-outline"
            title={t('registrations.noRegistrations', 'No Registrations')}
            message={searchQuery 
              ? t('registrations.noResults', 'No registrations match your search.') 
              : t('registrations.emptyDescription', 'You haven\'t registered for any events yet.')}
            actionLabel={searchQuery ? t('common.clearSearch', 'Clear Search') : t('registrations.browseEvents', 'Browse Events')}
            onAction={() => searchQuery ? setSearchQuery('') : router.push('/(tabs)/events')}
          />
        }
      />
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.background.primary,
  },
  listContent: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
  },
  registrationCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  eventTitle: {
    ...typography.headline,
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.sm,
  },
  cardInfo: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  infoText: {
    ...typography.caption1,
    color: colors.text.secondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  amountText: {
    ...typography.headline,
    color: colors.text.primary,
  },
  actionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    ...typography.caption1,
    color: colors.brand.primary,
    fontWeight: '600',
  },
});
