/**
 * DocumentDetailScreen — Full view for a single document.
 * Reference: UX Flow Guide § 4.G
 */
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  Share,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as WebBrowser from 'expo-web-browser';
import { useQuery } from '@tanstack/react-query';

import api from '@/services/api';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, borderRadius, typography, shadows } from '@/theme';
import type { DocumentItem, DocumentsResponse } from '@/types';
import { useAuthStore } from '@/store/authStore';

export function DocumentDetailScreen() {
  const { t } = useTranslation();
  const { colors, isDark } = useAppTheme();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { id } = useLocalSearchParams<{ id: string }>();
  const styles = createStyles(colors, isDark);

  const { data: docsData, isLoading } = useQuery<DocumentsResponse>({
    queryKey: ['documents'],
    queryFn: async () => {
      const resp = await api.get('/documents');
      return resp.data;
    },
  });

  const allDocs = [
    ...(docsData?.featured || []),
    ...(docsData?.documents?.data || [])
  ];
  
  // Find the exact document, making sure to handle potential duplicates between featured and regular
  const document = allDocs.find((doc) => doc.id === Number(id));

  const getFileInfo = (mime: string | null | undefined) => {
    const defaultInfo = { icon: 'document' as const, color: colors.text.tertiary, label: 'FILE' };
    if (!mime) return defaultInfo;

    if (mime.includes('pdf')) return { icon: 'document-text' as const, color: '#E74C3C', label: 'PDF' };
    if (mime.includes('spreadsheet') || mime.includes('excel')) return { icon: 'grid' as const, color: '#27AE60', label: 'XLSX' };
    if (mime.includes('presentation') || mime.includes('powerpoint')) return { icon: 'play-circle' as const, color: '#D35400', label: 'PPTX' };
    if (mime.includes('word') || mime.includes('document')) return { icon: 'document' as const, color: '#2980B9', label: 'DOCX' };
    if (mime.includes('zip') || mime.includes('compressed')) return { icon: 'archive' as const, color: '#F39C12', label: 'ZIP' };
    return defaultInfo;
  };

  const handleDownload = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (document?.file_url) {
      await WebBrowser.openBrowserAsync(document.file_url);
    }
  };

  const handleShare = async () => {
    if (!document) return;
    try {
      await Share.share({
        message: `${document.title}\n\n${document.description || ''}`,
        title: document.title,
      });
    } catch (_) {}
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
      </View>
    );
  }

  if (!document) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={typography.headline}>{t('documents.notFound') || 'Document not found'}</Text>
      </View>
    );
  }

  const info = getFileInfo(document.mime_type);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image
            source={{ uri: document.cover_image || 'https://picsum.photos/seed/' + document.id + '/800/600' }}
            style={styles.heroImage}
            contentFit="cover"
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

        {/* Content Section */}
        <View style={styles.content}>
          <View style={styles.headerRow}>
             <View style={[styles.fileIconBadge, { backgroundColor: info.color }]}>
                <Ionicons name={info.icon} size={24} color={colors.text.inverse} />
             </View>
             <View style={styles.titleContainer}>
               <Text style={styles.title}>{document.title}</Text>
               <View style={styles.metaRow}>
                 <Text style={styles.metaText}>{info.label}</Text>
                 <Text style={styles.metaDot}>•</Text>
                 <Text style={styles.metaText}>{document.original_filename}</Text>
               </View>
             </View>
          </View>

          {/* Tags */}
          {document.tags && document.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {document.tags.map((tag, idx) => (
                <View key={idx} style={styles.tagBadge}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.divider} />

          {/* Description */}
          <Text style={styles.sectionTitle}>{t('documents.description') || 'Description'}</Text>
          <Text style={styles.description}>
            {document.description || t('documents.noDescription') || 'No description available for this document.'}
          </Text>

          <View style={styles.spacer} />
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <View style={[styles.footer, shadows.md]}>
        <Pressable
          onPress={handleDownload}
          style={({ pressed }) => [
            styles.downloadButton,
            pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
          ]}
          android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
        >
          <Ionicons 
            name={isAuthenticated ? "download-outline" : "lock-closed-outline"} 
            size={20} 
            color={colors.text.inverse} 
          />
          <Text style={styles.downloadButtonText}>
            {isAuthenticated ? t('documents.download') : t('common.signIn')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  heroSection: {
    height: 300,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  heroActions: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  heroButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  content: {
    padding: spacing.xl,
    marginTop: -borderRadius.xl,
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  fileIconBadge: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...typography.title2,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    ...typography.caption1,
    color: colors.text.tertiary,
  },
  metaDot: {
    fontSize: 8,
    color: colors.text.tertiary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  tagBadge: {
    backgroundColor: isDark ? colors.background.tertiary : colors.background.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  tagText: {
    ...typography.caption1,
    color: colors.brand.primary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.headline,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  spacer: {
    height: 120,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl * 1.5 : spacing.lg,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  downloadButton: {
    backgroundColor: colors.brand.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  downloadButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '700',
  },
});
