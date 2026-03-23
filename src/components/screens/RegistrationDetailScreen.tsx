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
  Linking,
  Modal,
  TextInput
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, typography, borderRadius, shadows } from '@/theme';
import { Badge } from '@/components/ui/Badge';
import api from '@/services/api';
import { extractRegistration, type Registration, type Participant, type DashboardResponse } from '@/types';

export function RegistrationDetailScreen() {
  const { id } = useLocalSearchParams();
  const { t, i18n } = useTranslation();
  const { colors, isDark } = useAppTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const styles = createStyles(colors, isDark);

  const [isParticipantModalVisible, setParticipantModalVisible] = React.useState(false);
  const [editingParticipant, setEditingParticipant] = React.useState<Partial<Participant> | null>(null);
  const [participantForm, setParticipantForm] = React.useState<Partial<Participant>>({});

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

  const participantMutation = useMutation({
    mutationFn: async (data: Partial<Participant>) => {
      if (editingParticipant?.id) {
        const resp = await api.put(`/registrations/${id}/participants/${editingParticipant.id}`, data);
        return resp.data;
      } else {
        const resp = await api.post(`/registrations/${id}/participants`, data);
        return resp.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registration', id] });
      setParticipantModalVisible(false);
      setEditingParticipant(null);
      setParticipantForm({});
    },
  });

  const removeParticipantMutation = useMutation({
    mutationFn: async (pId: number) => {
      const resp = await api.delete(`/registrations/${id}/participants/${pId}`);
      return resp.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registration', id] });
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

  const handleOpenWeb = () => {
    Linking.openURL(`https://portal.pkn.or.id/registrations/${id}`);
  };

  const handleContactSupport = () => {
    const whatsappUrl = dashboardData?.contact_info?.whatsapp_url || 'https://wa.me/yournumber';
    Linking.openURL(whatsappUrl);
  };

  const handleSaveParticipant = () => {
    if (!participantForm.name || !participantForm.email || !participantForm.phone) {
      Alert.alert(t('common.warning'), t('registrations.fillAllFields'));
      return;
    }
    participantMutation.mutate(participantForm);
  };

  const confirmRemoveParticipant = (pId: number) => {
    Alert.alert(
      t('common.warning'),
      t('registrations.confirmRemoveParticipant'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.confirm'), style: 'destructive', onPress: () => removeParticipantMutation.mutate(pId) }
      ]
    );
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
          <View style={styles.headerTop}>
            <Text style={styles.registrationNumber}>{registration.registration_number}</Text>
            <Pressable onPress={handleOpenWeb} style={styles.webButton}>
              <Ionicons name="open-outline" size={20} color={colors.brand.primary} />
            </Pressable>
          </View>
          <View style={styles.statusRow}>
            <Badge 
              label={t(`registrations.status.${registration.status}`, registration.status)} 
              variant={getStatusVariant(registration.status)} 
            />
            <Text style={styles.dateText}>{formatDate(registration.created_at)}</Text>
          </View>
        </View>

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
          </Pressable>
          
          <View style={styles.packageRow}>
            <View style={styles.packageInfo}>
              <Text style={styles.label}>{t('registrations.package', 'Package')}</Text>
              <Text style={styles.packageName}>{registration.package_name}</Text>
            </View>
            {registration.status !== 'cancelled' && (
              <Pressable 
                onPress={() => router.push(`/events/${registration.event_id}/register?step=2&regId=${id}`)}
                style={styles.changePackageBtn}
              >
                <Text style={styles.changePackageText}>{t('registrations.changePackage', 'Change')}</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Participant List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t('registrations.participants', 'Participants')} ({registration.participants.length})
            </Text>
            {registration.status !== 'cancelled' && (
              <Pressable 
                onPress={() => {
                  setEditingParticipant(null);
                  setParticipantForm({});
                  setParticipantModalVisible(true);
                }}
                style={styles.addSmallBtn}
              >
                <Ionicons name="add-circle" size={24} color={colors.brand.primary} />
              </Pressable>
            )}
          </View>
          {registration.participants.map((p, index) => (
            <View key={p.id} style={[styles.participantItem, index === 0 && { borderTopWidth: 0 }]}>
              <View style={styles.participantInfo}>
                <Text style={styles.participantName}>{p.name}</Text>
                <Text style={styles.participantDetail}>{p.email} • {p.phone}</Text>
              </View>
              <View style={styles.participantActions}>
                {registration.status !== 'cancelled' && (
                  <>
                    <Pressable 
                      onPress={() => {
                        setEditingParticipant(p);
                        setParticipantForm(p);
                        setParticipantModalVisible(true);
                      }}
                      style={styles.iconBtn}
                    >
                      <Ionicons name="pencil" size={18} color={colors.text.tertiary} />
                    </Pressable>
                    <Pressable 
                      onPress={() => confirmRemoveParticipant(p.id)}
                      style={styles.iconBtn}
                    >
                      <Ionicons name="trash" size={18} color={colors.status.danger} />
                    </Pressable>
                  </>
                )}
                {p.category && (
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{p.category}</Text>
                  </View>
                )}
              </View>
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
        {registration.status !== 'cancelled' ? (
          <>
            <Pressable 
              onPress={handleCancel}
              style={({ pressed }) => [styles.secondaryAction, pressed && { opacity: 0.7 }]}
            >
              <Ionicons name="close-circle-outline" size={20} color={colors.status.danger} />
              <Text style={[styles.secondaryActionText, { color: colors.status.danger }]}>{t('common.cancel', 'Cancel')}</Text>
            </Pressable>
            
            {registration.status === 'draft' ? (
              <Pressable 
                onPress={() => router.push(`/events/${registration.event_id}/register?step=3&regId=${id}`)}
                style={({ pressed }) => [styles.primaryAction, pressed && { opacity: 0.8 }]}
              >
                <Text style={styles.primaryActionText}>{t('registrations.completeRegistration', 'Complete')}</Text>
              </Pressable>
            ) : (
              <Pressable 
                onPress={handleContactSupport}
                style={({ pressed }) => [styles.primaryAction, pressed && { opacity: 0.8 }]}
              >
                <Ionicons name="logo-whatsapp" size={20} color={colors.text.inverse} />
                <Text style={styles.primaryActionText}>{t('common.contact', 'Contact')}</Text>
              </Pressable>
            )}
          </>
        ) : (
          <Pressable 
            onPress={handleContactSupport}
            style={({ pressed }) => [styles.fullWidthAction, pressed && { opacity: 0.8 }]}
          >
            <Ionicons name="logo-whatsapp" size={20} color={colors.text.inverse} />
            <Text style={styles.primaryActionText}>{t('common.contact', 'Contact Support')}</Text>
          </Pressable>
        )}
      </View>

      {/* Participant Modal */}
      <Modal visible={isParticipantModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background.primary }]}>
            <Text style={styles.modalTitle}>
              {editingParticipant ? t('registrations.editParticipant') : t('registrations.addParticipant')}
            </Text>
            
            <TextInput 
              placeholder={t('common.name', 'Full Name')}
              style={[styles.input, { color: colors.text.primary, borderColor: colors.border.light }]}
              value={participantForm.name || ''}
              onChangeText={(txt) => setParticipantForm({ ...participantForm, name: txt })}
            />
            <TextInput 
              placeholder={t('common.email', 'Email Address')}
              keyboardType="email-address"
              style={[styles.input, { color: colors.text.primary, borderColor: colors.border.light }]}
              value={participantForm.email || ''}
              onChangeText={(txt) => setParticipantForm({ ...participantForm, email: txt })}
            />
            <TextInput 
              placeholder={t('common.phone', 'Phone Number')}
              keyboardType="phone-pad"
              style={[styles.input, { color: colors.text.primary, borderColor: colors.border.light }]}
              value={participantForm.phone || ''}
              onChangeText={(txt) => setParticipantForm({ ...participantForm, phone: txt })}
            />

            <View style={styles.modalActions}>
              <Pressable onPress={() => setParticipantModalVisible(false)} style={styles.modalCancel}>
                <Text style={styles.modalCancelText}>{t('common.cancel')}</Text>
              </Pressable>
              <Pressable 
                onPress={handleSaveParticipant} 
                style={[styles.modalConfirm, participantMutation.isPending && { opacity: 0.7 }]}
                disabled={participantMutation.isPending}
              >
                {participantMutation.isPending ? (
                  <ActivityIndicator color={colors.text.inverse} />
                ) : (
                  <Text style={styles.modalConfirmText}>{t('common.confirm')}</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
