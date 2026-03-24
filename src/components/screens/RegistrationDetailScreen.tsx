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
  Alert,
  ActivityIndicator,
  Linking
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, typography, borderRadius, shadows } from '@/theme';
import { Badge } from '@/components/ui/Badge';
import api, { PORTAL_BASE_URL, getWebviewTicket } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { extractRegistration, type Registration, type Participant, type DashboardResponse } from '@/types';

export function RegistrationDetailScreen() {
  const { id } = useLocalSearchParams();
  const { t, i18n } = useTranslation();
  const { colors, isDark } = useAppTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [isRequestingTicket, setIsRequestingTicket] = React.useState(false);
  const styles = createStyles(colors, isDark);


  const { data: registration, isLoading, isError } = useQuery<Registration>({
    queryKey: ['registration', id],
    queryFn: async () => {
      const resp = await api.get(`/registrations/${id}`);
      const registration = extractRegistration(resp.data);
      if (!registration) {
        throw new Error('Invalid registration response');
      }
      return registration;
    },
  });

  const { data: dashboardData } = useQuery<DashboardResponse>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const resp = await api.get('/mobile-dashboard');
      return resp.data;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const resp = await api.post(`/registrations/${id}/cancel`);
      return resp.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registration', id] });
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      Alert.alert(t('common.success', 'Success'), t('registrations.cancelSuccess', 'Registration cancelled successfully.'));
    },
    onError: (error: any) => {
      Alert.alert(t('common.error'), error?.message || t('common.errorDesc'));
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


  const handleCancel = () => {
    Alert.alert(
      t('registrations.confirmCancelTitle'),
      t('registrations.confirmCancelMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.confirm'), style: 'destructive', onPress: () => cancelMutation.mutate() }
      ]
    );
  };

  const handleOpenWeb = async () => {
    try {
      setIsRequestingTicket(true);
      const ticket = await getWebviewTicket();
      const orgSlug = user?.organization?.slug;
      
      const targetPath = `/user/${orgSlug}/event-registrations/${id}`;
      // Note: we encode the targetPath because it's a query parameter for /webview-login
      const magicLink = `${PORTAL_BASE_URL}/webview-login?ticket=${ticket}&redirect=${encodeURIComponent(targetPath)}`;
      
      await Linking.openURL(magicLink);
    } catch (error: any) {
      Alert.alert(
        t('common.error', 'Error'), 
        error?.message || t('common.errorDesc', 'An error occurred while opening the portal.')
      );
    } finally {
      setIsRequestingTicket(false);
    }
  };

  const handleContactSupport = () => {
    const whatsappUrl = dashboardData?.contact_info?.whatsapp_url || 'https://wa.me/yournumber';
    Linking.openURL(whatsappUrl);
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

  const packageSummary = registration.package_breakdown.length > 0
    ? registration.package_breakdown
        .map((item) => `${item.package_name} x${item.participant_count}`)
        .join(', ')
    : registration.package_name;
  
  const isDraft = registration.status === 'draft';
  const isPendingPayment = registration.status === 'awaiting_payment' || registration.status === 'submitted';
  const isPaid = registration.status === 'confirmed';
  const isCancelled = registration.status === 'cancelled';
  const isClosed = registration.status === 'closed';

  const invoicesToShow = registration.invoices && registration.invoices.length > 0 
    ? registration.invoices 
    : (registration.invoice ? [registration.invoice] : []);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: t('registrations.detailTitle', 'Registration Detail') }} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={[styles.section, styles.headerSection]}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Pressable onPress={() => router.back()} style={styles.headerBackButton}>
                <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
              </Pressable>
              <View>
                <Text style={styles.registrationNumber}>{registration.registration_number}</Text>
                <Text style={styles.dateText}>{formatDate(registration.created_at)}</Text>
              </View>
              <Badge 
                label={registration.status_label || t(`registrations.status.${registration.status}`, registration.status)} 
                variant={getStatusVariant(registration.status)} 
              />
            </View>
            <Pressable onPress={handleOpenWeb} style={styles.webButton} disabled={isRequestingTicket}>
              {isRequestingTicket ? (
                <ActivityIndicator color={colors.brand.primary} size="small" />
              ) : (
                <Ionicons name="open-outline" size={20} color={colors.brand.primary} />
              )}
            </Pressable>
          </View>
        </View>

        {/* Booker Information */}
        {registration.booker && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('registrations.bookerInfo', 'Booker Information')}</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>{t('registrations.bookerName', 'Name')}</Text>
              <Text style={styles.infoValue}>{registration.booker.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>{t('registrations.paymentStatus', 'Payment Status')}</Text>
              <Badge 
                label={registration.payment_status_label || registration.payment_status || 'unpaid'} 
                variant={registration.payment_status === 'paid' ? 'success' : 'warning'} 
              />
            </View>
          </View>
        )}

        {/* Event & Package Summary */}
        <View style={styles.section}>
          <Pressable 
            onPress={() => router.push(`/events/${registration.event_id}`)}
            style={styles.eventSection}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('registrations.eventInfo', 'Event Information')}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} />
            </View>
            <Text style={styles.eventTitle}>{registration.event?.title}</Text>
            
            {registration.event && (
              <View style={styles.eventDetails}>
                <View style={styles.eventDetailItem}>
                  <Ionicons name="calendar-outline" size={14} color={colors.text.tertiary} />
                  <Text style={styles.eventDetailText}>
                    {registration.event.event_date} ({registration.event.duration_days} {t('common.days', 'days')})
                  </Text>
                </View>
                <View style={styles.eventDetailItem}>
                  <Ionicons name="location-outline" size={14} color={colors.text.tertiary} />
                  <Text style={styles.eventDetailText}>
                    {registration.event.city}, {registration.event.province}
                  </Text>
                </View>
              </View>
            )}
          </Pressable>
          
          <View style={styles.packageRow}>
            <View style={styles.packageInfo}>
              <Text style={styles.label}>{t('registrations.package', 'Package')}</Text>
              <Text style={styles.packageName}>{packageSummary || '-'}</Text>
            </View>
          </View>
        </View>

        {/* Participant List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t('registrations.participants', 'Participants')} ({registration.participant_count})
            </Text>
          </View>
          {registration.participants.length === 0 && (
            <Text style={styles.emptyParticipantText}>
              {t('registrations.noParticipantDetailsYet', 'Participant details have not been added yet.')}
            </Text>
          )}
          {registration.participants.map((p, index) => (
            <View key={p.id} style={[styles.participantItem, index === 0 && { borderTopWidth: 0 }]}>
              <View style={styles.participantInfo}>
                <Text style={styles.participantName}>{p.name}</Text>
                <Text style={styles.participantDetail}>{p.email} • {p.phone}</Text>
              </View>
              <View style={styles.participantActions}>
                {p.category && (
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{p.category}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}

          {/* Contact Support Item moved from footer */}
          <Pressable 
            onPress={handleContactSupport}
            style={styles.contactSupportItem}
          >
            <View style={styles.contactIconCircle}>
              <Ionicons name="logo-whatsapp" size={16} color={colors.brand.primary} />
            </View>
            <Text style={styles.contactSupportText}>{t('common.contactSupport', 'Contact Support via WhatsApp')}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} style={{ marginLeft: 'auto' }} />
          </Pressable>
        </View>

        {/* Payment/Invoice Section */}
        {(invoicesToShow.length > 0 || registration.latest_invoice) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('registrations.paymentInfo', 'Payment Information')}</Text>
            
            {/* Show latest invoice separately if available for download */}
            {registration.latest_invoice && (
              <View style={styles.latestInvoiceCard}>
                <View style={styles.invoiceRow}>
                  <Text style={styles.invoiceLabel}>{t('registrations.latestInvoice', 'Latest Invoice')}</Text>
                  <Text style={styles.invoiceValue}>{registration.latest_invoice.invoice_number}</Text>
                </View>
                <View style={styles.invoiceRow}>
                   <Text style={styles.invoiceLabel}>{t('registrations.amount', 'Amount')}</Text>
                   <Text style={styles.totalValue}>
                     {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(registration.latest_invoice.amount || registration.latest_invoice.total_amount || 0)}
                   </Text>
                </View>
                {registration.latest_invoice.download_url && (
                  <Pressable 
                    onPress={() => Linking.openURL(registration.latest_invoice?.download_url || '')}
                    style={styles.downloadButton}
                  >
                    <Ionicons name="download-outline" size={18} color={colors.brand.primary} />
                    <Text style={styles.downloadButtonText}>{t('registrations.downloadInvoice', 'Download Invoice PDF')}</Text>
                  </Pressable>
                )}
              </View>
            )}

            {invoicesToShow.map((inv, idx) => (
              <View key={inv.id} style={[styles.invoiceItem, (idx > 0 || registration.latest_invoice) && { marginTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border.light, paddingTop: spacing.md }]}>
                <View style={styles.invoiceRow}>
                  <Text style={styles.invoiceLabel}>{t('registrations.invoiceNumber', 'Invoice #')}</Text>
                  <Text style={styles.invoiceValue}>{inv.invoice_number}</Text>
                </View>
                <View style={[styles.invoiceRow, { marginBottom: 0 }]}>
                    <Text style={styles.invoiceLabel}>{t('common.status', 'Status')}</Text>
                    <Badge 
                      label={inv.status_label || t(`registrations.invoiceStatus.${inv.status}`, inv.status)} 
                      variant={inv.status === 'paid' ? 'success' : 'warning'} 
                    />
                </View>
                <View style={styles.invoiceRow}>
                  <Text style={styles.invoiceLabel}>{t('registrations.totalAmount', 'Total Amount')}</Text>
                  <Text style={idx === 0 && !registration.latest_invoice ? styles.totalValue : styles.invoiceValue}>
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(inv.amount)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.footerSpacer} />
      </ScrollView>

      {/* Sticky Actions */}
      <View style={[styles.stickyFooter, shadows.lg]}>
        {!isCancelled && !isClosed ? (
          <Pressable 
              onPress={handleOpenWeb}
              style={({ pressed }) => [
                styles.primaryAction, 
                { flex: 1 },
                (pressed || isRequestingTicket) && { opacity: 0.8 }
              ]}
              disabled={isRequestingTicket}
          >
            {isRequestingTicket ? (
              <ActivityIndicator color={colors.text.inverse} size="small" />
            ) : (
              <>
                <Ionicons name="open-outline" size={20} color={colors.text.inverse} />
                <Text style={styles.primaryActionText}>{t('registrations.manageInWeb', 'Manage Registration')}</Text>
              </>
            )}
          </Pressable>
        ) : (
          <View style={styles.cancelledNote}>
            <Text style={styles.cancelledNoteText}>
              {isClosed ? t('registrations.closedRegistrationInfo', 'This event has been closed.') : t('registrations.cancelledRegistrationInfo', 'This registration has been cancelled.')}
            </Text>
          </View>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerBackButton: {
    padding: spacing.xs,
    marginLeft: -spacing.xs,
  },
  webButton: {
    padding: spacing.xs,
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
  packageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    marginTop: spacing.sm,
  },
  packageInfo: {
    flex: 1,
  },
  label: {
    ...typography.caption2,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  changePackageBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background.secondary,
  },
  changePackageText: {
    ...typography.caption1,
    color: colors.brand.primary,
    fontWeight: '600',
  },
  participantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  emptyParticipantText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.xs,
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
    marginLeft: spacing.sm,
  },
  categoryText: {
    ...typography.caption2,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
  },
  participantActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addSmallBtn: {
    padding: 4,
  },
  iconBtn: {
    padding: 8,
    marginLeft: 4,
  },
  fullWidthAction: {
    flex: 1,
    backgroundColor: colors.brand.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    padding: spacing.xl,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  modalTitle: {
    ...typography.title3,
    marginBottom: spacing.lg,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  contactSupportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    marginTop: spacing.sm,
  },
  contactIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  contactSupportText: {
    ...typography.body,
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '500',
  },
  cancelledNote: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  cancelledNoteText: {
    ...typography.caption1,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  modalCancel: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
  },
  modalCancelText: {
    color: colors.text.secondary,
  },
  modalConfirm: {
    flex: 2,
    backgroundColor: colors.brand.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: colors.text.inverse,
    fontWeight: '600',
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  invoiceItem: {
    marginBottom: spacing.xs,
  },
  paidAction: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  paidBadgeText: {
    ...typography.headline,
    color: colors.status.success,
  },
  paidNote: {
    ...typography.caption1,
    color: colors.text.secondary,
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  eventDetails: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  eventDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  eventDetailText: {
    ...typography.caption1,
    color: colors.text.tertiary,
  },
  latestInvoiceCard: {
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingTop: spacing.md,
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  downloadButtonText: {
    ...typography.body,
    color: colors.brand.primary,
    fontWeight: '600',
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
