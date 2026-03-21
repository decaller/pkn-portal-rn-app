import React from 'react';
import { Pressable, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { borderRadius } from '@/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import api from '@/services/api';
import type { DashboardResponse } from '@/types';

export function HeaderContactButton() {
  const { colors } = useAppTheme();
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
        {
          backgroundColor: colors.background.secondary,
          borderColor: colors.border.light,
        },
        pressed && { backgroundColor: colors.border.light, opacity: 0.7 }
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
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
});
