import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/appStore';
import { useAppTheme } from '@/hooks/useAppTheme';
import { borderRadius, spacing, typography, shadows } from '@/theme';
import { BlurView } from 'expo-blur';

type MenuItem = {
  label: string;
  value: string;
  active: boolean;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
};

type MenuSection = {
  label: string;
  items: MenuItem[];
};

export function HeaderMenu() {
  const { t, i18n } = useTranslation();
  const { colors, themeSetting, isDark } = useAppTheme();
  const { language, setLanguage, setTheme } = useAppStore();
  const [visible, setVisible] = useState(false);

  const toggleModal = () => setVisible(!visible);

  const handleLanguageChange = (lang: 'en' | 'id') => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    setVisible(false);
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setTheme(theme);
    setVisible(false);
  };

  const menuItems: MenuSection[] = [
    {
      label: t('menu.language') as string,
      items: [
        { label: 'English', value: 'en', active: language === 'en', onPress: () => handleLanguageChange('en') },
        { label: 'Bahasa', value: 'id', active: language === 'id', onPress: () => handleLanguageChange('id') },
      ],
    },
    {
      label: t('menu.theme') as string,
      items: [
        { label: t('theme.light') as string, value: 'light', active: themeSetting === 'light', onPress: () => handleThemeChange('light'), icon: 'sunny-outline' },
        { label: t('theme.dark') as string, value: 'dark', active: themeSetting === 'dark', onPress: () => handleThemeChange('dark'), icon: 'moon-outline' },
        { label: t('theme.system') as string, value: 'system', active: themeSetting === 'system', onPress: () => handleThemeChange('system'), icon: 'settings-outline' },
      ],
    },
  ];

  return (
    <View>
      <Pressable
        onPress={toggleModal}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: colors.background.tertiary, opacity: pressed ? 0.7 : 1 }
        ]}
        hitSlop={10}
      >
        <Ionicons name="ellipsis-vertical" size={20} color={colors.text.primary} />
      </Pressable>

      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={toggleModal}
      >
        <Pressable style={styles.modalOverlay} onPress={toggleModal}>
          <View style={[styles.menuContainer, { 
            backgroundColor: isDark ? colors.background.secondary : colors.background.primary,
            borderColor: colors.border.light,
            ...shadows.lg 
          }]}>
            {Platform.OS === 'ios' && (
              <BlurView intensity={20} style={StyleSheet.absoluteFill} tint={isDark ? 'dark' : 'light'} />
            )}
            
            {menuItems.map((section, idx) => (
              <View key={idx} style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>{section.label}</Text>
                <View style={styles.itemRow}>
                  {section.items.map((item) => (
                    <TouchableOpacity
                      key={item.value}
                      style={[
                        styles.menuItem,
                        { 
                          backgroundColor: item.active ? colors.brand.primary : 'transparent',
                          borderColor: item.active ? colors.brand.primary : colors.border.light 
                        }
                      ]}
                      onPress={item.onPress}
                    >
                      {item.icon && (
                        <Ionicons 
                          name={item.icon} 
                          size={14} 
                          color={item.active ? '#FFF' : colors.text.primary} 
                          style={{ marginRight: 4 }}
                        />
                      )}
                      <Text style={[
                        styles.menuItemText, 
                        { color: item.active ? '#FFF' : colors.text.primary }
                      ]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {idx < menuItems.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border.light }]} />}
              </View>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: Platform.OS === 'ios' ? 100 : 60,
    paddingRight: 16,
  },
  menuContainer: {
    width: 220,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    overflow: 'hidden',
    ...shadows.lg,
  },
  section: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.caption2,
    fontWeight: '600',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  menuItem: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  menuItemText: {
    ...typography.caption1,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: spacing.sm,
    width: '100%',
  },
});
