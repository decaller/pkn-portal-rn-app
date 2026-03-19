import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/appStore';
import { colors, borderRadius, typography, spacing } from '@/theme';

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const setStoreLanguage = useAppStore((s) => s.setLanguage);
  const currentLang = useAppStore((s) => s.language);

  const toggleLanguage = () => {
    const newLang = currentLang === 'en' ? 'id' : 'en';
    setStoreLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  return (
    <Pressable
      onPress={toggleLanguage}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed
      ]}
      hitSlop={12}
    >
      <Ionicons name="language" size={18} color={colors.brand.primary} />
      <Text style={styles.text}>
        {currentLang.toUpperCase()}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    marginRight: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  pressed: {
    opacity: 0.7,
    backgroundColor: colors.border.light,
  },
  text: {
    ...typography.caption1,
    fontWeight: '700',
    color: colors.text.primary,
  },
});
