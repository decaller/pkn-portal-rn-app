import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Dimensions, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, borderRadius, shadows, typography } from '@/theme';
import { DocumentItem } from '@/types';

interface DocumentCarouselProps {
  documents: DocumentItem[];
}

const CARD_WIDTH = 260;

export function DocumentCarousel({ documents }: DocumentCarouselProps) {
  const { t } = useTranslation();
  const { colors, isDark } = useAppTheme();
  const router = useRouter();
  const styles = createStyles(colors, isDark);

  const renderItem = ({ item }: { item: DocumentItem }) => (
    <Pressable
      onPress={() => router.push('/(tabs)/documents')}
      style={({ pressed }) => [
        styles.card,
        shadows.md,
        Platform.OS === 'ios' && pressed ? { opacity: 0.85 } : {},
      ]}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.cover_image || 'https://picsum.photos/seed/' + item.id + '/400/600' }}
          style={styles.coverImage}
          contentFit="cover"
          transition={300}
        />
        <View style={styles.badgeContainer}>
          <Ionicons name="star" size={12} color="#F1C40F" />
          <Text style={styles.badgeText}>{t('dashboard.featured')}</Text>
        </View>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.metaRow}>
          <Ionicons name="document-text-outline" size={12} color={colors.text.tertiary} />
          <Text style={styles.metaText} numberOfLines={1}>
            {item.description || item.original_filename}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <FlatList
      data={documents}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
    />
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    marginRight: spacing.md,
    overflow: 'hidden',
    borderWidth: isDark ? 1 : 0,
    borderColor: colors.border.light,
  },
  imageContainer: {
    width: '100%',
    height: 130,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  badgeContainer: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    gap: 4,
    zIndex: 10,
  },
  badgeText: {
    color: '#F1C40F',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  infoContainer: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  title: {
    ...typography.callout,
    fontWeight: '600',
    color: colors.text.primary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  metaText: {
    ...typography.caption1,
    color: colors.text.tertiary,
    flex: 1,
  },
});
