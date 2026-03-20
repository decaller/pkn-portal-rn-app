import React from 'react';
import { Pressable, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { colors, borderRadius, spacing } from '@/theme';
import api from '@/services/api';
import type { DashboardResponse } from '@/types';

export function HeaderContactButton() {
  const { data: dashboardData } = useQuery<DashboardResponse>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const resp = await api.get('/mobile-dashboard');
      return resp.data;
    },
  });

  const whatsappUrl = dashboardData?.contact_info?.whatsapp_url;

  const handlePress = () => {
    if (whatsappUrl) {
      Linking.openURL(whatsappUrl);
    }
  };

  if (!whatsappUrl) return null;

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed
      ]}
      hitSlop={12}
    >
      <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  pressed: {
    opacity: 0.7,
    backgroundColor: colors.border.light,
  },
});
