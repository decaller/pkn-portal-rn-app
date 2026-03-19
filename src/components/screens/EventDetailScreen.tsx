/**
 * EventDetailScreen — Event detail with hero, metadata, packages, and sticky CTA.
 * Reference: event_detail_screen mockup, UX Flow Guide § 4.D
 */
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  Dimensions,
  FlatList,
  Share,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/Badge';
import { EventCard } from '@/components/sections/EventCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, spacing, borderRadius, typography, shadows } from '@/theme';
import { MOCK_EVENTS } from '@/services/mockData';

const { width } = Dimensions.get('window');

function MetaTile({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metaTile}>
      <Ionicons name={icon} size={20} color={colors.brand.primary} />
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import type { EventItem } from '@/types';
import { ActivityIndicator } from 'react-native';

import { useAppStore } from '@/store/appStore';

export function EventDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isAuthenticated } = useAppStore();

  const { data: eventResp, isLoading } = useQuery<{ data: EventItem }>({

    queryKey: ['event', id],
    queryFn: async () => {
      const resp = await api.get(`/events/${id}`);
      return resp.data;
    },
  });

  const event = eventResp?.data;

  const getStatusBadge = (e: EventItem) => {
    if (!e.is_published) return { label: 'Draft', variant: 'neutral' as const };
    if (e.is_full) return { label: 'Full', variant: 'danger' as const };
    if (e.allow_registration) return { label: 'Open', variant: 'success' as const };
    return { label: 'Closed', variant: 'neutral' as const };
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleShare = async () => {
    if (!event) return;
    try {
      await Share.share({
        message: `Check out: ${event.title}`,
        title: event.title,
      });
    } catch (error) {}
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={typography.headline}>{t('events.notFound')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Hero Image */}
        <View style={styles.heroSection}>
          <Image
            source={{ uri: event.cover_image ?? undefined }}
            style={styles.heroImage}
            contentFit="cover"
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
            transition={300}
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroActions}>
            <Pressable
              onPress={() => router.back()}
              style={styles.heroButton}
              accessibilityLabel={t('common.back')}
            >
              <Ionicons name="arrow-back" size={22} color={colors.text.inverse} />
            </Pressable>
            <Pressable
              onPress={handleShare}
              style={styles.heroButton}
              accessibilityLabel={t('common.share')}
            >
              <Ionicons name="share-outline" size={22} color={colors.text.inverse} />
            </Pressable>
          </View>
        </View>

        {/* Content */}
        <View style={styles.contentSection}>
          {/* Status & Title */}
          <Badge
            label={getStatusBadge(event).label}
            variant={getStatusBadge(event).variant}
          />
          <Text style={styles.title}>{event.title}</Text>

          {/* Metadata Tiles */}
          <View style={styles.metaGrid}>
            <MetaTile icon="calendar" label="Date" value={formatDate(event.event_date)} />
            <MetaTile icon="location" label="Location" value={event.city || 'TBA'} />
            <MetaTile
              icon="people"
              label="Spots"
              value={
                event.available_spots !== null
                  ? `${event.available_spots} remaining`
                  : 'Unlimited'
              }
            />
            <MetaTile
              icon="clipboard"
              label="Registration"
              value={event.allow_registration ? 'Open' : 'Closed'}
            />
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>{t('events.eventDetails')}</Text>
            <Text style={styles.description}>
              {(event.description || '').replace(/<[^>]*>?/gm, '').trim()}
            </Text>
          </View>

          {/* Rundown / Agenda */}
          {event.rundown && event.rundown.length > 0 && (
            <View style={styles.packagesSection}>
              <Text style={styles.sectionTitle}>Agenda</Text>
              {event.rundown.map((item, idx) => (
                <View key={idx} style={[styles.packageCard, { padding: spacing.md }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.packageName}>{item.data.title}</Text>
                    <Text style={styles.packageDesc}>{item.data.start_time || item.data.date || '-'}</Text>
                  </View>
                  
                  {item.data.speaker && (
                    <Text style={[styles.packageDesc, { marginTop: 4, fontStyle: 'italic' }]}>
                      Speaker: {item.data.speaker}
                    </Text>
                  )}

                  {/* Session Files */}
                  {item.data.session_files && item.data.session_files.length > 0 && (
                    <View style={{ marginTop: spacing.md, gap: spacing.xs }}>
                      <Text style={[typography.caption1, { fontWeight: '600', color: colors.text.secondary }]}>
                        Materials:
                      </Text>
                      {item.data.session_files.map((file, fIdx) => {
                        const fileName = file.split('/').pop() || 'Untitled';
                        const isPDF = file.toLowerCase().endsWith('.pdf');
                        const isXLS = file.toLowerCase().endsWith('.xlsx') || file.toLowerCase().endsWith('.xls');

                        return (
                          <View key={fIdx} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 }}>
                            <Ionicons 
                              name={isPDF ? 'document-text' : isXLS ? 'grid' : 'document'} 
                              size={16} 
                              color={colors.text.tertiary} 
                            />
                            <Text style={[typography.caption2, { flex: 1 }]} numberOfLines={1}>
                              {fileName}
                            </Text>
                            {!isAuthenticated ? (
                              <Ionicons name="lock-closed" size={14} color={colors.status.warning} />
                            ) : (
                              <Ionicons name="download-outline" size={14} color={colors.brand.primary} />
                            )}
                          </View>
                        );
                      })}
                      {!isAuthenticated && (
                        <Text style={[typography.caption2, { color: colors.text.tertiary, fontStyle: 'italic', marginTop: 4 }]}>
                          {t('events.loginToAccessFiles')}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}


          {/* Packages Preview */}
          {event.registration_packages && event.registration_packages.length > 0 && (
            <View style={styles.packagesSection}>
              <Text style={styles.sectionTitle}>{t('events.packages')}</Text>
              {event.registration_packages.map((pkg, idx) => (
                <View key={idx} style={[styles.packageCard, shadows.sm]}>
                  <Text style={styles.packageName}>{pkg.name}</Text>
                  <Text style={styles.packagePrice}>{formatCurrency(pkg.price)}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={[styles.stickyBar, shadows.lg]}>
        {event.allow_registration ? (
          <View style={styles.stickyContent}>
            <View>
              <Text style={styles.stickyLabel}>{t('events.startingFrom')}</Text>
              <Text style={styles.stickyPrice}>
                {event.registration_packages?.[0] ? formatCurrency(event.registration_packages[0].price) : '-'}
              </Text>
            </View>
            <Pressable
              onPress={() => {}}
              android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
              style={({ pressed }) => [
                styles.registerButton,
                Platform.OS === 'ios' && pressed ? { opacity: 0.85 } : {},
              ]}
              accessibilityRole="button"
            >
              <Ionicons name="ticket" size={18} color={colors.text.inverse} />
              <Text style={styles.registerText}>
                {t('events.loginToRegister')}
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.stickyContent}>
            <Text style={styles.closedText}>{t('events.registrationClosed')}</Text>
          </View>
        )}
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
  },
  // Hero
  heroSection: {
    height: 280,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  heroActions: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 40,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Content
  contentSection: {
    padding: spacing.lg,
    gap: spacing.sm,
    marginTop: -borderRadius.xl,
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  title: {
    ...typography.title1,
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  category: {
    ...typography.footnote,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Meta grid
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  metaTile: {
    width: (width - spacing.lg * 2 - spacing.md) / 2,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  metaLabel: {
    ...typography.caption2,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaValue: {
    ...typography.callout,
    fontWeight: '600',
    color: colors.text.primary,
  },
  // Description
  descriptionSection: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    ...typography.title3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  // Packages
  packagesSection: {
    marginTop: spacing['2xl'],
  },
  packageCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  packageName: {
    ...typography.headline,
    color: colors.text.primary,
  },
  packagePrice: {
    ...typography.title3,
    color: colors.brand.primary,
    marginTop: spacing.xs,
  },
  packageDesc: {
    ...typography.subhead,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  // Sticky CTA
  stickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 36 : spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border.light,
  },
  stickyContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stickyLabel: {
    ...typography.caption1,
    color: colors.text.tertiary,
  },
  stickyPrice: {
    ...typography.title3,
    color: colors.text.primary,
  },
  registerButton: {
    backgroundColor: colors.brand.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  registerText: {
    color: colors.text.inverse,
    fontSize: 15,
    fontWeight: '600',
  },
  closedText: {
    ...typography.callout,
    color: colors.text.tertiary,
    flex: 1,
    textAlign: 'center',
  },
});
