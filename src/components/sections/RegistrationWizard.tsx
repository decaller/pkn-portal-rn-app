/**
 * RegistrationWizard — Multi-step registration flow.
 * Reference: UX Flow Guide § 4.H
 */
import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  Alert,
  ActivityIndicator,
  TextInput,
  Modal
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, typography, borderRadius, shadows } from '@/theme';
import api from '@/services/api';
import type { EventItem, EventPackage, Participant } from '@/types';

interface RegistrationWizardProps {
  eventId: string;
}

export function RegistrationWizard({ eventId }: RegistrationWizardProps) {
  const { t } = useTranslation();
  const { colors, isDark } = useAppTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const styles = createStyles(colors, isDark);

  const [step, setStep] = useState(1);
  const [participants, setParticipants] = useState<Partial<Participant>[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [currentParticipant, setCurrentParticipant] = useState<Partial<Participant>>({});

  const { data: event, isLoading } = useQuery<EventItem>({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const resp = await api.get(`/events/${eventId}`);
      return resp.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const resp = await api.post('/registrations', {
        event_id: eventId,
        package_id: selectedPackageId,
        participants: participants,
      });
      return resp.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      router.replace(`/registrations/${data.id}`);
    },
    onError: (error: any) => {
      Alert.alert(t('common.error'), error?.response?.data?.message || t('common.errorDesc'));
    },
  });

  const handleAddParticipant = () => {
    if (!currentParticipant.name || !currentParticipant.email || !currentParticipant.phone) {
      Alert.alert(t('common.warning'), t('registrations.fillAllFields', 'Please fill all required fields.'));
      return;
    }
    setParticipants([...participants, { ...currentParticipant, id: Date.now() }]);
    setCurrentParticipant({});
    setModalVisible(false);
  };

  const removeParticipant = (id: number) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  const nextStep = () => {
    if (step === 1 && participants.length === 0) {
      Alert.alert(t('common.warning'), t('registrations.minOneParticipant', 'At least one participant is required.'));
      return;
    }
    if (step === 2 && !selectedPackageId) {
      Alert.alert(t('common.warning'), t('registrations.selectPackage', 'Please select a package.'));
      return;
    }
    setStep(step + 1);
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
      </View>
    );
  }

  const selectedPackage = event?.registration_packages.find(p => p.id === selectedPackageId);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: t('events.registration', 'Registration') }} />
      
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {[1, 2, 3].map((s) => (
          <View key={s} style={styles.progressItem}>
            <View style={[
              styles.progressDot, 
              step >= s ? { backgroundColor: colors.brand.primary } : { backgroundColor: colors.background.tertiary }
            ]}>
              <Text style={[styles.progressText, step >= s && { color: colors.text.inverse }]}>{s}</Text>
            </View>
            {s < 3 && <View style={[styles.progressLine, step > s && { backgroundColor: colors.brand.primary }]} />}
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{t('registrations.step1Title', 'Add Participants')}</Text>
            <Text style={styles.stepSubtitle}>{t('registrations.step1Subtitle', 'Enter details for all attendees.')}</Text>
            
            {participants.map((p, idx) => (
              <View key={p.id} style={[styles.card, shadows.sm]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{p.name}</Text>
                  <Pressable onPress={() => removeParticipant(p.id as number)}>
                    <Ionicons name="trash-outline" size={20} color={colors.status.danger} />
                  </Pressable>
                </View>
                <Text style={styles.cardDetail}>{p.email} • {p.phone}</Text>
              </View>
            ))}

            <Pressable 
              onPress={() => setModalVisible(true)}
              style={({ pressed }) => [styles.addButton, pressed && { opacity: 0.8 }]}
            >
              <Ionicons name="add-circle-outline" size={24} color={colors.brand.primary} />
              <Text style={styles.addButtonText}>{t('registrations.addParticipant', 'Add Participant')}</Text>
            </Pressable>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{t('registrations.step2Title', 'Select Package')}</Text>
            <Text style={styles.stepSubtitle}>{t('registrations.step2Subtitle', 'Choose the best option for your group.')}</Text>
            
            {event?.registration_packages.map((pkg) => (
              <Pressable 
                key={pkg.id}
                onPress={() => setSelectedPackageId(pkg.id)}
                style={({ pressed }) => [
                  styles.packageCard,
                  selectedPackageId === pkg.id && { borderColor: colors.brand.primary, borderWidth: 2 },
                  shadows.sm,
                  pressed && { opacity: 0.9 }
                ]}
              >
                <View style={styles.packageHeader}>
                  <Text style={styles.packageName}>{pkg.name}</Text>
                  <Text style={styles.packagePrice}>
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(pkg.price)}
                  </Text>
                </View>
                {pkg.description && <Text style={styles.packageDesc}>{pkg.description}</Text>}
              </Pressable>
            ))}
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{t('registrations.step3Title', 'Review Summary')}</Text>
            
            <View style={[styles.summaryCard, shadows.md]}>
              <Text style={styles.summaryLabel}>{t('registrations.event', 'Event')}</Text>
              <Text style={styles.summaryValue}>{event?.title}</Text>
              
              <View style={styles.summaryDivider} />
              
              <Text style={styles.summaryLabel}>{t('registrations.package', 'Package')}</Text>
              <Text style={styles.summaryValue}>{selectedPackage?.name}</Text>
              
              <View style={styles.summaryDivider} />
              
              <Text style={styles.summaryLabel}>{t('registrations.participants', 'Participants')}</Text>
              {participants.map((p) => (
                <Text key={p.id} style={styles.summaryParticipant}>{p.name} ({p.category || 'General'})</Text>
              ))}
              
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>{t('registrations.totalAmount', 'Total')}</Text>
                <Text style={styles.totalValue}>
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format((selectedPackage?.price || 0) * participants.length)}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Navigation Footer */}
      <View style={styles.footer}>
        {step > 1 && (
          <Pressable 
            onPress={() => setStep(step - 1)}
            style={styles.backBtn}
          >
            <Text style={styles.backBtnText}>{t('common.back')}</Text>
          </Pressable>
        )}
        <Pressable 
          onPress={step < 3 ? nextStep : () => mutation.mutate()}
          style={[styles.nextBtn, mutation.isPending && { opacity: 0.7 }]}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <ActivityIndicator color={colors.text.inverse} />
          ) : (
            <Text style={styles.nextBtnText}>
              {step === 3 ? t('registrations.submit', 'Submit Registration') : t('common.next', 'Next')}
            </Text>
          )}
        </Pressable>
      </View>

      {/* Participant Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background.primary }]}>
            <Text style={styles.modalTitle}>{t('registrations.addParticipant')}</Text>
            
            <TextInput 
              placeholder={t('common.name', 'Full Name')}
              style={[styles.input, { color: colors.text.primary, borderColor: colors.border.light }]}
              value={currentParticipant.name}
              onChangeText={(txt) => setCurrentParticipant({ ...currentParticipant, name: txt })}
            />
            <TextInput 
              placeholder={t('common.email', 'Email Address')}
              keyboardType="email-address"
              style={[styles.input, { color: colors.text.primary, borderColor: colors.border.light }]}
              value={currentParticipant.email}
              onChangeText={(txt) => setCurrentParticipant({ ...currentParticipant, email: txt })}
            />
            <TextInput 
              placeholder={t('common.phone', 'Phone Number')}
              keyboardType="phone-pad"
              style={[styles.input, { color: colors.text.primary, borderColor: colors.border.light }]}
              value={currentParticipant.phone}
              onChangeText={(txt) => setCurrentParticipant({ ...currentParticipant, phone: txt })}
            />

            <View style={styles.modalActions}>
              <Pressable onPress={() => setModalVisible(false)} style={styles.modalCancel}>
                <Text style={styles.modalCancelText}>{t('common.cancel')}</Text>
              </Pressable>
              <Pressable onPress={handleAddParticipant} style={styles.modalConfirm}>
                <Text style={styles.modalConfirmText}>{t('common.add', 'Add')}</Text>
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
  progressContainer: {
    flexDirection: 'row',
    padding: spacing.lg,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.tertiary,
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.background.tertiary,
    marginHorizontal: 4,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    ...typography.title2,
    color: colors.text.primary,
    marginBottom: 4,
  },
  stepSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.background.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: {
    ...typography.headline,
    color: colors.text.primary,
  },
  cardDetail: {
    ...typography.caption1,
    color: colors.text.secondary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.brand.primary,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  addButtonText: {
    ...typography.body,
    color: colors.brand.primary,
    fontWeight: '600',
  },
  packageCard: {
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  packageName: {
    ...typography.headline,
    color: colors.text.primary,
  },
  packagePrice: {
    ...typography.headline,
    color: colors.brand.primary,
  },
  packageDesc: {
    ...typography.caption1,
    color: colors.text.secondary,
  },
  summaryCard: {
    backgroundColor: colors.background.primary,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
  },
  summaryLabel: {
    ...typography.caption2,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  summaryValue: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  summaryParticipant: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 2,
    borderTopColor: colors.border.light,
  },
  totalLabel: {
    ...typography.title3,
    color: colors.text.primary,
  },
  totalValue: {
    ...typography.title3,
    color: colors.brand.primary,
    fontWeight: '700',
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.background.primary,
    flexDirection: 'row',
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  nextBtn: {
    flex: 1,
    backgroundColor: colors.brand.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  backBtn: {
    padding: spacing.md,
    justifyContent: 'center',
  },
  backBtnText: {
    color: colors.text.secondary,
    fontSize: 16,
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
