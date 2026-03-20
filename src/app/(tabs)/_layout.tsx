/**
 * Tab Layout — Bottom tab navigation with platform-aware styling.
 * iOS: BlurView background (Liquid Glass), Android: Material 3 solid surface.
 * Reference: Expo SDK 55 Features.md, UX Flow Guide § 3
 */
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { spacing } from '@/theme';
import { HeaderMenu } from '@/components/ui/HeaderMenu';
import { HeaderReloadButton } from '@/components/ui/HeaderReloadButton';
import { HeaderContactButton } from '@/components/ui/HeaderContactButton';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function TabLayout() {
  const { t } = useTranslation();
  const { colors, isDark } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.brand.primary,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarShowLabel: false,
        headerRight: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: spacing.md, gap: spacing.sm }}>
            <HeaderReloadButton />
            <HeaderContactButton />
            <HeaderMenu />
          </View>
        ),
        headerStyle: {
          backgroundColor: colors.background.primary,
        },

        headerTitleStyle: {
          fontWeight: '600',
          color: colors.text.primary,
        },
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            borderTopWidth: 0,
            elevation: 0,
          },
          android: {
            backgroundColor: isDark ? colors.background.secondary : colors.background.card, 
            borderTopColor: colors.border.light,
            elevation: 8,
            height: 64,
            paddingBottom: 8,
            paddingTop: 4,
          },
        }),
        tabBarBackground: () => 
          Platform.OS === 'ios' ? (
            <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          ) : undefined,
      }}
    >

      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.dashboard'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          headerTitle: 'PKN Portal',
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: t('tabs.events'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          title: t('tabs.documents'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="documents" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
