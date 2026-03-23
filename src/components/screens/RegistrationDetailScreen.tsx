/**
 * RegistrationDetailScreen — Detailed view of a single registration.
 * Reference: UX Flow Guide § 4.G
 */
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  ActivityIndicator,
  Linking
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, typography, borderRadius, shadows } from '@/theme';
import { Badge } from '@/components/ui/Badge';
import api from '@/services/api';
import type { Registration } from '@/types';

export function RegistrationDetailScreen() {
  const { id } = useLocalSearchParams();
  const { t, i18n } = useTranslation();
  const { colors, isDark } = useAppTheme();
  const router = useRouter();
  const styles = createStyles(colors, isDark);

  const { data: registration, isLoading, isError } = useQuery<Registration>({
    queryKey: ['registration', id],
    queryFn: async () => {
      const resp = await api.get(`/registrations/${id}`);
      return resp.data;
    },
  });

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
      month: 'long',
      year: 'numeric'
    });
  };

  const handlePayment = () => {
    if (registration?.invoice?.snap_token) {
      // In a real app, we would open Midtrans SDK or WebView
      // For now, let's assume we redirect to a payment page or show a placeholder
      console.log('Opening payment for token:', registration.invoice.snap_token);
    }
  };

  const handleContactSupport = () => {
    Linking.openURL('https://wa.me/yournumber');
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
      </View>
    );
  }

  if (isError || !registration) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={60} color={colors.status.danger} />
        <Text style={styles.errorText}>{t('common.error')}</Text>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{t('common.back')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: t('registrations.detailTitle', 'Registration Detail') }} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={[styles.section, styles.headerSection]}>
          <Text style={styles.registrationNumber}>{registration.registration_number}</Text>
          <View style={styles.statusRow}>
            <Badge 
              label={t(`registrations.status.${registration.status}`, registration.status)} 
              variant={getStatusVariant(registration.status)} 
            />
            <Text style={styles.dateText}>{formatDate(registration.created_at)}</Text>
          </View>
        </View>

        {/* Event Summary */}
        <Pressable 
          onPress={() => router.push(`/events/${registration.event_id}`)}
          style={[styles.section, styles.eventSection]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('registrations.eventInfo', 'Event Information')}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} />
          </View>
          <Text style={styles.eventTitle}>{registration.event?.title}</Text>
          <Text style={styles.packageName}>{registration.package_name}</Text>
        </Pressable>

        {/* Participant List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('registrations.participants', 'Participants')} ({registration.participants.length})
          </Text>
          {registration.participants.map((p, index) => (
            <View key={p.id} style={[styles.participantItem, index === 0 && { borderTopWidth: 0 }]}>
              <View style={styles.participantInfo}>
                <Text style={styles.participantName}>{p.name}</Text>
                <Text style={styles.participantDetail}>{p.email} • {p.phone}</Text>
              </View>
              {p.category && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{p.category}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Payment/Invoice Section */}
        {registration.invoice && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('registrations.paymentInfo', 'Payment Information')}</Text>
            <View style={styles.invoiceRow}>
              <Text style={styles.invoiceLabel}>{t('registrations.invoiceNumber', 'Invoice #')}</Text>
              <Text style={styles.invoiceValue}>{registration.invoice.invoice_number}</Text>
            </View>
            <View style={styles.invoiceRow}>
              <Text style={styles.invoiceLabel}>{t('registrations.totalAmount', 'Total Amount')}</Text>
              <Text style={styles.totalValue}>
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(registration.total_amount)}
              </Text>
            </View>
            
            {registration.status === 'awaiting_payment' && registration.invoice.snap_token && (
              <Pressable 
                onPress={handlePayment}
                style={({ pressed }) => [styles.payButton, pressed && { opacity: 0.8 }]}
              >
                <Ionicons name="card-outline" size={20} color={colors.text.inverse} />
                <Text style={styles.payButtonText}>{t('registrations.payNow', 'Pay Now')}</Text>
              </Pressable>
            )}
          </View>
        )}

        <View style={styles.footerSpacer} />
      </ScrollView>

      {/* Sticky Actions */}
      <View style={[styles.stickyFooter, shadows.lg]}>
        <Pressable 
          onPress={handleContactSupport}
          style={({ pressed }) => [styles.secondaryAction, pressed && { opacity: 0.7 }]}
        >
          <Ionicons name="logo-whatsapp" size={20} color={colors.brand.primary} />
          <Text style={styles.secondaryActionText}>{t('common.contact', 'Contact')}</Text>
        </Pressable>
        
        {registration.status === 'draft' && (
          <Pressable 
            onPress={() => {}} // TODO: Navigate to wizard step 3
            style={({ pressed }) => [styles.primaryAction, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.primaryActionText}>{t('registrations.completeRegistration', 'Complete')}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  section: {
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  headerSection: {
    paddingTop: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  registrationNumber: {
    ...typography.title2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    ...typography.caption1,
    color: colors.text.tertiary,
  },
  eventSection: {
    // Interactive event card style
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.headline,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  eventTitle: {
    ...typography.title3,
    color: colors.brand.primary,
    marginBottom: 4,
  },
  packageName: {
    ...typography.body,
    color: colors.text.secondary,
  },
  participantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  participantDetail: {
    ...typography.caption1,
    color: colors.text.secondary,
  },
  categoryBadge: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  categoryText: {
    ...typography.caption2,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  invoiceLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  invoiceValue: {
    ...typography.body,
    fontWeight: '500',
    color: colors.text.primary,
  },
  totalValue: {
    ...typography.headline,
    color: colors.brand.primary,
  },
  payButton: {
    backgroundColor: colors.brand.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  payButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background.primary,
    flexDirection: 'row',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    gap: spacing.md,
  },
  primaryAction: {
    flex: 2,
    backgroundColor: colors.brand.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryAction: {
    flex: 1,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.brand.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryActionText: {
    color: colors.brand.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  footerSpacer: {
    height: 40,
  },
  errorText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  backButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
  },
  backButtonText: {
    color: colors.text.primary,
    fontWeight: '500',
  },
});
