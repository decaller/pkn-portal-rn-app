import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, RefreshControl, Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { paymentService, InvoiceItem } from '@/services/paymentService';
import { useAppTheme } from '@/hooks/useAppTheme';

const InvoiceCard = ({ item }: { item: InvoiceItem }) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'unpaid': return '#F44336';
      default: return '#757575';
    }
  };

  return (
    <Pressable 
      style={styles.card}
      onPress={() => router.push(`/invoices/${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.invoiceId}>#{item.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {t(`payments.status.${item.status}`, item.status.toUpperCase())}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <Text style={styles.amount}>Rp {item.amount.toLocaleString('id-ID')}</Text>
        <Text style={styles.dueDate}>{t('payments.due', 'Due')}: {new Date(item.due_date).toLocaleDateString()}</Text>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color="#CCC" style={styles.chevron} />
    </Pressable>
  );
};

export default function InvoicesScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const { data: invoices, isLoading, refetch } = useQuery({
    queryKey: ['invoices'],
    queryFn: paymentService.getInvoices
  });

  return (
    <View style={styles.container}>
      <FlashList
        data={invoices}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <InvoiceCard item={item} />}
        estimatedItemSize={100}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.brand.primary} />
        }
        ListHeaderComponent={<Text style={styles.title}>{t('payments.myInvoices', 'My Invoices')}</Text>}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#DDD" />
            <Text style={styles.emptyText}>{t('payments.noInvoices', 'No invoices yet')}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  listContent: { padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1A1A1A' },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flex: 1 },
  invoiceId: { fontSize: 14, color: '#666', marginBottom: 4 },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: { fontSize: 12, fontWeight: '600' },
  cardBody: { flex: 2, alignItems: 'flex-end', marginRight: 12 },
  amount: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  dueDate: { fontSize: 12, color: '#999', marginTop: 4 },
  chevron: { marginLeft: 4 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#999', marginTop: 12, fontSize: 16 },
});
