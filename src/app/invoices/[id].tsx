import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { paymentService } from '@/services/paymentService';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams();
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const [isCharging, setIsCharging] = useState(false);

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => paymentService.getInvoiceDetail(Number(id))
  });

  const handlePayNow = async () => {
    try {
      setIsCharging(true);
      const response = await paymentService.charge(Number(id));
      
      // Navigate to WebView payment screen
      router.push({
        pathname: '/invoices/payment',
        params: { 
          url: response.redirect_url,
          invoiceId: id 
        }
      });
    } catch (error) {
      console.error('Payment charge error:', error);
      Alert.alert(t('common.error'), t('payments.chargeFailed', 'Failed to initiate payment. Please try again.'));
    } finally {
      setIsCharging(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
      </View>
    );
  }

  if (!invoice) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Ionicons name="receipt" size={48} color={colors.brand.primary} />
        <Text style={styles.title}>{t('payments.invoiceDetail', 'Invoice Detail')}</Text>
        <Text style={styles.invoiceId}>#{invoice.id}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>{t('payments.status', 'Status')}</Text>
          <Text style={[styles.value, { color: colors.brand.primary }]}>{invoice.status.toUpperCase()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{t('payments.dueDate', 'Due Date')}</Text>
          <Text style={styles.value}>{new Date(invoice.due_date).toLocaleDateString()}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.totalSection}>
        <Text style={styles.totalLabel}>{t('payments.totalAmount', 'Total Amount')}</Text>
        <Text style={styles.totalValue}>Rp {invoice.amount.toLocaleString('id-ID')}</Text>
      </View>

      {invoice.status === 'unpaid' && (
        <Pressable 
          style={({ pressed }) => [
            styles.payButton,
            { backgroundColor: colors.brand.primary },
            pressed && styles.payButtonPressed,
            isCharging && styles.payButtonDisabled
          ]}
          onPress={handlePayNow}
          disabled={isCharging}
        >
          {isCharging ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="card" size={20} color="#FFF" style={styles.buttonIcon} />
              <Text style={styles.payButtonText}>{t('payments.payNow', 'Pay Now')}</Text>
            </>
          )}
        </Pressable>
      )}

      <Text style={styles.footerNote}>
        {t('payments.safePaymentNote', 'Payments are processed securely via Midtrans.')}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { padding: 24, alignItems: 'center' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 12, color: '#1A1A1A' },
  invoiceId: { fontSize: 16, color: '#666', marginTop: 4 },
  section: { width: '100%', backgroundColor: '#F8F9FA', borderRadius: 16, padding: 20, marginBottom: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  label: { color: '#666', fontSize: 14 },
  value: { fontWeight: '600', color: '#1A1A1A', fontSize: 14 },
  statusValue: {},
  divider: { width: '100%', height: 1, backgroundColor: '#EEE', marginBottom: 24 },
  totalSection: { width: '100%', marginBottom: 40 },
  totalLabel: { fontSize: 16, color: '#666', textAlign: 'center' },
  totalValue: { fontSize: 32, fontWeight: '800', color: '#1A1A1A', textAlign: 'center', marginTop: 8 },
  payButton: {
    flexDirection: 'row',
    width: '100%',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  payButtonPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  payButtonDisabled: { backgroundColor: '#CCC', shadowOpacity: 0 },
  buttonIcon: { marginRight: 8 },
  payButtonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  footerNote: { marginTop: 24, color: '#999', fontSize: 12, textAlign: 'center' },
});
