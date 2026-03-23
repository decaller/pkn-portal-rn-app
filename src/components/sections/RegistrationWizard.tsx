/**
 * RegistrationWizard — Single-step registration flow.
 * Reference: UX Flow Guide § 4.H
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, typography, borderRadius, shadows } from '@/theme';
import api from '@/services/api';
import { extractRegistration, type EventItem, type Participant, type Registration, type SingleEventResponse } from '@/types';

interface RegistrationWizardProps {
  eventId: string;
  regId?: string;
  initialStep?: number;
}

type PackageCountMap = Record<string, number>;

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);

const getPackageKey = (pkg: EventItem['registration_packages'][number], index: number) =>
  `${pkg.id ?? 'no-id'}:${pkg.name ?? 'package'}:${index}`;

const getApiErrorMessage = (error: any) => {
  const responseData = error?.response?.data ?? error?.data ?? error;
  const validationErrors = responseData?.errors;

  if (validationErrors && typeof validationErrors === 'object') {
    const firstValidationMessage = Object.values(validationErrors)
      .flatMap((value) => (Array.isArray(value) ? value : [value]))
      .find((value) => typeof value === 'string');

    if (typeof firstValidationMessage === 'string' && firstValidationMessage.trim().length > 0) {
      return firstValidationMessage;
    }
  }

  if (typeof responseData?.message === 'string' && responseData.message.trim().length > 0) {
    return responseData.message;
  }

  if (typeof error?.message === 'string' && error.message.trim().length > 0) {
    return error.message;
  }

  return null;
};

export function RegistrationWizard({ eventId, regId }: RegistrationWizardProps) {
  const { t } = useTranslation();
  const { colors, isDark } = useAppTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const styles = createStyles(colors, isDark);

  const [packageCounts, setPackageCounts] = useState<PackageCountMap>({});
  const hydratedRegistrationKeyRef = React.useRef<string | null>(null);

  const { data: existingReg, isLoading: isLoadingReg } = useQuery<Registration | null>({
    queryKey: ['registration', regId],
    queryFn: async () => {
      if (!regId) return null;
      const resp = await api.get(`/registrations/${regId}`);
      return extractRegistration(resp.data);
    },
    enabled: !!regId,
  });

  const { data: event, isLoading } = useQuery<EventItem>({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const resp = await api.get(`/events/${eventId}`);
      const payload = resp.data as EventItem | SingleEventResponse;
      const eventData = 'data' in payload ? payload.data : payload;

      return {
        ...eventData,
        registration_packages: Array.isArray(eventData.registration_packages)
          ? eventData.registration_packages
          : [],
      };
    },
  });

  const registrationPackages = React.useMemo(
    () => event?.registration_packages ?? [],
    [event?.registration_packages],
  );

  React.useEffect(() => {
    if (!existingReg || registrationPackages.length === 0) return;

    const hydrationKey = `${existingReg.id}:${registrationPackages.map((pkg) => pkg.id).join(',')}`;
    if (hydratedRegistrationKeyRef.current === hydrationKey) return;

    const nextCounts: PackageCountMap = {};

    if (existingReg.package_breakdown.length > 0) {
      existingReg.package_breakdown.forEach((item) => {
        const matchedIndex = registrationPackages.findIndex((pkg) => pkg.name === item.package_name);
        const matchedPackage = matchedIndex >= 0 ? registrationPackages[matchedIndex] : null;
        if (matchedPackage) {
          nextCounts[getPackageKey(matchedPackage, matchedIndex)] = item.participant_count;
        }
      });
    } else if (existingReg.package_id) {
      const matchedIndex = registrationPackages.findIndex((pkg) => pkg.id === existingReg.package_id);
      if (matchedIndex >= 0) {
        nextCounts[getPackageKey(registrationPackages[matchedIndex], matchedIndex)] = existingReg.participant_count;
      }
    }

    setPackageCounts(nextCounts);
    hydratedRegistrationKeyRef.current = hydrationKey;
  }, [existingReg, registrationPackages]);

  const packageBreakdown = registrationPackages
    .map((pkg, index) => ({
      package_id: pkg.id,
      package_name: pkg.name,
      package_key: getPackageKey(pkg, index),
      participant_count: packageCounts[getPackageKey(pkg, index)] ?? 0,
      unit_price: pkg.price,
    }))
    .filter((item) => item.participant_count > 0);

  const totalParticipants = packageBreakdown.reduce((sum, item) => sum + item.participant_count, 0);
  const totalAmount = packageBreakdown.reduce(
    (sum, item) => sum + item.participant_count * item.unit_price,
    0,
  );
  const primaryPackageId = packageBreakdown[0]?.package_id ?? null;
  const hasSelectedPackagesWithoutIds = packageBreakdown.some((item) => item.package_id == null);

  const mutation = useMutation({
    mutationFn: async () => {
      if (packageBreakdown.length === 0) {
        throw new Error(t('registrations.minOneParticipant', 'At least one participant is required.'));
      }

      if (hasSelectedPackagesWithoutIds) {
        throw new Error(
          t(
            'registrations.packageConfigUnavailable',
            'This event cannot be registered from the app yet because the API does not return registration package IDs.',
          ),
        );
      }

      const payload = {
        event_id: eventId,
        package_id: primaryPackageId,
        participants: [] as Partial<Participant>[],
      };

      if (regId) {
        const resp = await api.put(`/registrations/${regId}`, payload);
        const registration = extractRegistration(resp.data);
        if (!registration) {
          throw new Error('Invalid registration response');
        }
        return registration;
      }

      const resp = await api.post('/registrations', payload);
      const registration = extractRegistration(resp.data);
      if (!registration) {
        throw new Error('Invalid registration response');
      }
      return registration;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      queryClient.invalidateQueries({ queryKey: ['registration', data.id] });
      router.replace(`/registrations/${data.id}`);
    },
    onError: (error: any) => {
      Alert.alert(
        t('common.error'),
        getApiErrorMessage(error) || t('common.errorDesc'),
      );
    },
  });

  const updatePackageCount = (packageKey: string, nextValue: number) => {
    setPackageCounts((current) => ({
      ...current,
      [packageKey]: Math.max(0, nextValue),
    }));
  };

  if (isLoading || isLoadingReg) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: t('events.registration', 'Registration') }} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>{t('registrations.step1Title', 'Set Package Counts')}</Text>
          <Text style={styles.stepSubtitle}>
            {t('registrations.step1Subtitle', 'Set participant count for each package. You only need to review the total here.')}
          </Text>

          {registrationPackages.map((pkg, index) => {
            const packageKey = getPackageKey(pkg, index);
            const count = packageCounts[packageKey] ?? 0;
            const itemTotal = pkg.price * count;

            return (
              <View key={packageKey} style={[styles.packageCard, shadows.sm]}>
                <View style={styles.packageHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.packageName}>{pkg.name}</Text>
                    {pkg.description ? <Text style={styles.packageDesc}>{pkg.description}</Text> : null}
                  </View>
                  <Text style={styles.packagePrice}>{formatCurrency(pkg.price)}</Text>
                </View>

                <View style={styles.counterRow}>
                  <View>
                    <Text style={styles.counterLabel}>{t('registrations.participantCount', 'Participant count')}</Text>
                    <Text style={styles.counterHint}>
                      {count} x {formatCurrency(pkg.price)}
                    </Text>
                  </View>
                  <View style={styles.counterControls}>
                    <Pressable
                      onPress={() => updatePackageCount(packageKey, count - 1)}
                      style={({ pressed }) => [
                        styles.counterButton,
                        count <= 0 && styles.counterButtonDisabled,
                        pressed && count > 0 && { opacity: 0.8 },
                      ]}
                      disabled={count <= 0}
                    >
                      <Ionicons name="remove" size={18} color={count <= 0 ? colors.text.tertiary : colors.text.primary} />
                    </Pressable>
                    <Text style={styles.counterValue}>{count}</Text>
                    <Pressable
                      onPress={() => updatePackageCount(packageKey, count + 1)}
                      style={({ pressed }) => [styles.counterButton, pressed && { opacity: 0.8 }]}
                    >
                      <Ionicons name="add" size={18} color={colors.text.primary} />
                    </Pressable>
                  </View>
                </View>

                <View style={styles.packageFooter}>
                  <Text style={styles.packageFooterLabel}>{t('registrations.estimatedPayment', 'Estimated payment')}</Text>
                  <Text style={styles.packageFooterValue}>{formatCurrency(itemTotal)}</Text>
                </View>
              </View>
            );
          })}

          <View style={[styles.summaryCard, shadows.md]}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('registrations.totalPackages', 'Selected packages')}</Text>
              <Text style={styles.summaryValue}>{packageBreakdown.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('registrations.participantCount', 'Participant count')}</Text>
              <Text style={styles.summaryValue}>{totalParticipants}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>{t('registrations.totalAmount', 'Total')}</Text>
              <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
            </View>
          </View>

          <View style={[styles.noteCard, shadows.sm]}>
            <Ionicons name="information-circle-outline" size={20} color={colors.brand.primary} />
            <Text style={styles.noteText}>
              {t(
                'registrations.countNote',
                'Participant details will be added after payment, and the participant count can still be changed before payment.',
              )}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={() => mutation.mutate()}
          style={[styles.nextBtn, mutation.isPending && { opacity: 0.7 }]}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <ActivityIndicator color={colors.text.inverse} />
          ) : (
            <Text style={styles.nextBtnText}>{t('registrations.submit', 'Submit Registration')}</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
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
    gap: spacing.md,
  },
  packageName: {
    ...typography.headline,
    color: colors.text.primary,
    marginBottom: 4,
  },
  packageDesc: {
    ...typography.caption1,
    color: colors.text.secondary,
  },
  packagePrice: {
    ...typography.headline,
    color: colors.brand.primary,
  },
  counterRow: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  counterLabel: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  counterHint: {
    ...typography.caption1,
    color: colors.text.secondary,
    marginTop: 4,
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  counterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  counterButtonDisabled: {
    opacity: 0.55,
  },
  counterValue: {
    ...typography.title3,
    color: colors.text.primary,
    minWidth: 24,
    textAlign: 'center',
    fontWeight: '700',
  },
  packageFooter: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packageFooterLabel: {
    ...typography.caption1,
    color: colors.text.secondary,
  },
  packageFooterValue: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '700',
  },
  summaryCard: {
    backgroundColor: isDark ? colors.background.primary : '#F6FBFF',
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    marginTop: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  summaryValue: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '700',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.md,
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
  noteCard: {
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    marginTop: spacing.md,
  },
  noteText: {
    ...typography.caption1,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  nextBtn: {
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
});
