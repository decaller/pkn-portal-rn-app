/**
 * Tab Layout — Bottom tab navigation with platform-aware styling.
 * iOS: BlurView background (Liquid Glass), Android: Material 3 solid surface.
 * Reference: Expo SDK 55 Features.md, UX Flow Guide § 3
 */
import { Tabs } from 'expo-router';
// import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors } from '@/theme';

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.brand.primary,
        tabBarInactiveTintColor: colors.text.tertiary,
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
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
          },
          android: {
            backgroundColor: colors.background.card,
            borderTopColor: colors.border.light,
            elevation: 8,
            height: 64,
            paddingBottom: 8,
            paddingTop: 4,
          },
        }),
        tabBarBackground: () => undefined,
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
