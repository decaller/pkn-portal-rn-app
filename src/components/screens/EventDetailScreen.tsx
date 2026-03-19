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

export function EventDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const event = MOCK_EVENTS.find((e) => e.id === Number(id)) ?? MOCK_EVENTS[0];

  const similarEvents = MOCK_EVENTS.filter((e) => e.id !== event.id).slice(0, 3);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out: ${event.title}`,
        title: event.title,
      });
    } catch (error) {
      // Intentionally empty
    }
  };

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
            source={{ uri: event.image?.url }}
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
            label={event.status}
            variant={
              event.status === 'upcoming'
                ? 'info'
                : event.status === 'ongoing'
                  ? 'success'
                  : 'neutral'
            }
          />
          <Text style={styles.title}>{event.title}</Text>
          {event.category && (
            <Text style={styles.category}>{event.category}</Text>
          )}

          {/* Metadata Tiles */}
          <View style={styles.metaGrid}>
            <MetaTile icon="calendar" label="Date" value={formatDate(event.event_date)} />
            <MetaTile icon="location" label="Location" value={event.location} />
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
              value={event.registration_open ? 'Open' : 'Closed'}
            />
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>{t('events.eventDetails')}</Text>
            <Text style={styles.description}>
              {event.summary}
              {'\n\n'}
              Join us for this exceptional event featuring world-class speakers,
              interactive workshops, and networking opportunities. This event brings
              together professionals from various fields to share knowledge and best
              practices.
              {'\n\n'}
              The event includes keynote presentations, panel discussions, breakout
              sessions, and a networking dinner. All participants will receive a
              certificate of attendance and access to event materials.
            </Text>
          </View>

          {/* Packages Preview */}
          <View style={styles.packagesSection}>
            <Text style={styles.sectionTitle}>{t('events.packages')}</Text>
            <View style={[styles.packageCard, shadows.sm]}>
              <Text style={styles.packageName}>Standard Package</Text>
              <Text style={styles.packagePrice}>IDR 1,500,000</Text>
              <Text style={styles.packageDesc}>
                Full access to all sessions, materials, and networking dinner.
              </Text>
            </View>
            <View style={[styles.packageCard, shadows.sm]}>
              <Text style={styles.packageName}>Premium Package</Text>
              <Text style={styles.packagePrice}>IDR 2,500,000</Text>
              <Text style={styles.packageDesc}>
                Everything in Standard plus VIP seating, 1-on-1 mentoring session, and exclusive gift bag.
              </Text>
            </View>
          </View>

          {/* Similar Events */}
          {similarEvents.length > 0 && (
            <>
              <SectionHeader title={t('events.similarEvents')} />
              <FlatList
                data={similarEvents}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <EventCard
                    event={item}
                    onPress={() => router.push(`/events/${item.id}`)}
                    variant="horizontal"
                  />
                )}
              />
            </>
          )}

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={[styles.stickyBar, shadows.lg]}>
        {event.registration_open ? (
          <View style={styles.stickyContent}>
            <View>
              <Text style={styles.stickyLabel}>{t('events.startingFrom')}</Text>
              <Text style={styles.stickyPrice}>IDR 1,500,000</Text>
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
