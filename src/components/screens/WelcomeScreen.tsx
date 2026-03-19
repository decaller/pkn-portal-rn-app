/**
 * WelcomeScreen — Premium first impression and onboarding.
 * Reference: welcome_screen mockup, UX Flow Guide § 4.A
 */
import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useAppStore } from '@/store/appStore';
import { colors, spacing, borderRadius, typography, shadows } from '@/theme';

const { width, height } = Dimensions.get('window');

interface FeatureCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <View style={[styles.featureCard, shadows.md]}>
      <View style={styles.featureIconWrapper}>
        <Ionicons name={icon} size={24} color={colors.brand.primary} />
      </View>
      <View style={styles.featureTextWrapper}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDesc}>{description}</Text>
      </View>
    </View>
  );
}

export function WelcomeScreen() {
  const { t } = useTranslation();
  const setHasSeenWelcome = useAppStore((s) => s.setHasSeenWelcome);

  const handleGetStarted = () => {
    setHasSeenWelcome(true);
    router.replace('/(tabs)');
  };

  const handleSignIn = () => {
    // In Phase 1, just go to tabs. Phase 2 will add hybrid login.
    setHasSeenWelcome(true);
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#0D1B2A', '#1B2838', '#208AEF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <Ionicons name="globe" size={28} color={colors.text.inverse} />
          </View>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIconContainer}>
            <Ionicons name="school" size={64} color="rgba(255,255,255,0.9)" />
          </View>
          <Text style={styles.heroTitle}>{t('welcome.title')}</Text>
          <Text style={styles.heroSubtitle}>{t('welcome.subtitle')}</Text>
        </View>

        {/* Feature Cards */}
        <View style={styles.featureSection}>
          <FeatureCard
            icon="calendar"
            title={t('welcome.features.events')}
            description={t('welcome.features.eventsDesc')}
          />
          <FeatureCard
            icon="newspaper"
            title={t('welcome.features.news')}
            description={t('welcome.features.newsDesc')}
          />
          <FeatureCard
            icon="earth"
            title={t('welcome.features.network')}
            description={t('welcome.features.networkDesc')}
          />
        </View>

        {/* CTA Buttons */}
        <View style={styles.ctaSection}>
          <Pressable
            onPress={handleGetStarted}
            android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
            style={({ pressed }) => [
              styles.primaryCta,
              Platform.OS === 'ios' && pressed ? { opacity: 0.85 } : {},
            ]}
            accessibilityRole="button"
            accessibilityLabel={t('welcome.getStarted')}
          >
            <Text style={styles.primaryCtaText}>{t('welcome.getStarted')}</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.brand.primary} />
          </Pressable>

          <Pressable
            onPress={handleSignIn}
            android_ripple={{ color: 'rgba(255,255,255,0.15)' }}
            style={({ pressed }) => [
              styles.secondaryCta,
              Platform.OS === 'ios' && pressed ? { opacity: 0.7 } : {},
            ]}
            accessibilityRole="button"
            accessibilityLabel={t('welcome.signIn')}
          >
            <Text style={styles.secondaryCtaText}>{t('welcome.signIn')}</Text>
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: spacing['2xl'],
    justifyContent: 'space-between',
    paddingBottom: Platform.OS === 'ios' ? 50 : 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  heroIconContainer: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  heroTitle: {
    ...typography.largeTitle,
    color: colors.text.inverse,
    textAlign: 'center',
  },
  heroSubtitle: {
    ...typography.body,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 24,
  },
  featureSection: {
    gap: spacing.md,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  featureIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTextWrapper: {
    flex: 1,
  },
  featureTitle: {
    ...typography.callout,
    fontWeight: '600',
    color: colors.text.inverse,
  },
  featureDesc: {
    ...typography.caption1,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },
  ctaSection: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  primaryCta: {
    backgroundColor: colors.text.inverse,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  primaryCtaText: {
    ...typography.headline,
    color: colors.brand.primary,
  },
  secondaryCta: {
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  secondaryCtaText: {
    ...typography.callout,
    fontWeight: '600',
    color: colors.text.inverse,
  },
});
