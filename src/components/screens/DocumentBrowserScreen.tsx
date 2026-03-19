/**
 * DocumentBrowserScreen — Public document browser with preview UI.
 * In Phase 1, shows a sign-in prompt since documents require auth.
 * Reference: event_documents_guest_view mockup, UX Flow Guide § 4.G
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Platform,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

import { SearchBar } from '@/components/ui/SearchBar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SkeletonCard } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';

import { colors, spacing, borderRadius, typography, shadows } from '@/theme';
import type { DocumentItem, DocumentsResponse } from '@/types';

import { useAppStore } from '@/store/appStore';

function DocumentCard({ doc }: { doc: DocumentItem }) {
  const { isAuthenticated } = useAppStore();
  const getFileInfo = (mime: string) => {

    if (mime.includes('pdf')) return { icon: 'document-text' as const, color: '#E74C3C', label: 'PDF' };
    if (mime.includes('spreadsheet') || mime.includes('excel')) return { icon: 'grid' as const, color: '#27AE60', label: 'XLSX' };
    if (mime.includes('presentation') || mime.includes('powerpoint')) return { icon: 'play-circle' as const, color: '#D35400', label: 'PPTX' };
    if (mime.includes('word') || mime.includes('document')) return { icon: 'document' as const, color: '#2980B9', label: 'DOCX' };
    if (mime.includes('zip') || mime.includes('compressed')) return { icon: 'archive' as const, color: '#F39C12', label: 'ZIP' };
    return { icon: 'document' as const, color: colors.text.tertiary, label: 'FILE' };
  };

  const info = getFileInfo(doc.mime_type);

  return (
    <View style={[styles.docCard, shadows.sm]}>
      <View style={[styles.docIcon, { backgroundColor: info.color }]}>
        <Ionicons name={info.icon} size={22} color={colors.text.inverse} />
      </View>
      <View style={styles.docContent}>
        <Text style={styles.docTitle} numberOfLines={2}>
          {doc.title}
        </Text>
        <Text style={styles.docDesc} numberOfLines={1}>
          {doc.description || doc.original_filename}
        </Text>
        <View style={styles.docMeta}>
          <Text style={styles.docMetaText}>{info.label}</Text>
          <Text style={styles.docMetaDot}>•</Text>
          <Text style={styles.docMetaText}>{doc.tags && doc.tags.length > 0 ? doc.tags[0] : 'Public'}</Text>
        </View>
      </View>
      {isAuthenticated && (
        <Pressable
          style={({ pressed }) => [
            styles.downloadButton,
            Platform.OS === 'ios' && pressed ? { opacity: 0.7 } : {},
          ]}
          android_ripple={{ color: 'rgba(32, 138, 239, 0.15)' }}
          accessibilityLabel="Download document"
        >
          <Ionicons name="download-outline" size={20} color={colors.brand.primary} />
        </Pressable>
      )}

    </View>
  );
}

export function DocumentBrowserScreen() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: docsData,
    isLoading,
    refetch,
  } = useQuery<DocumentsResponse>({
    queryKey: ['documents'],
    queryFn: async () => {
      const resp = await api.get('/documents');
      return resp.data;
    },
  });

  const allDocs = docsData?.data || [];
  const filteredDocs = allDocs.filter((doc) =>
    doc.title.toLowerCase().includes(search.toLowerCase())
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };


  return (
    <View style={styles.container}>
      {/* Sign-In Prompt Banner */}
      <View style={styles.signInBanner}>
        <View style={styles.signInIcon}>
          <Ionicons name="lock-closed" size={28} color={colors.brand.primary} />
        </View>
        <Text style={styles.signInTitle}>{t('documents.signInPrompt')}</Text>
        <Text style={styles.signInDesc}>{t('documents.signInDesc')}</Text>
        <Pressable
          style={({ pressed }) => [
            styles.signInButton,
            Platform.OS === 'ios' && pressed ? { opacity: 0.85 } : {},
          ]}
          android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
          accessibilityRole="button"
        >
          <Ionicons name="log-in-outline" size={18} color={colors.text.inverse} />
          <Text style={styles.signInButtonText}>{t('common.signIn')}</Text>
        </Pressable>
      </View>

      {/* Preview Section (mock data) */}
      <View style={styles.previewSection}>
        <Text style={styles.previewLabel}>Preview</Text>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder={t('documents.searchPlaceholder')}
        />
      </View>

      <SectionHeader title={t('documents.allDocuments')} />

      <FlatList
        data={filteredDocs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <DocumentCard doc={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={{ gap: spacing.md }}>
              <SkeletonCard style={{ height: 80 }} />
              <SkeletonCard style={{ height: 80 }} />
              <SkeletonCard style={{ height: 80 }} />
            </View>
          ) : (
            <EmptyState
              icon="document-outline"
              title={t('documents.noDocs')}
              message={t('documents.noDocsDesc')}
            />
          )
        }
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  signInBanner: {
    backgroundColor: colors.background.card,
    margin: spacing.lg,
    padding: spacing['2xl'],
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  signInIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.status.infoLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  signInTitle: {
    ...typography.title3,
    color: colors.text.primary,
    textAlign: 'center',
  },
  signInDesc: {
    ...typography.subhead,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  signInButton: {
    backgroundColor: colors.brand.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  signInButtonText: {
    color: colors.text.inverse,
    fontSize: 15,
    fontWeight: '600',
  },
  previewSection: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  previewLabel: {
    ...typography.caption1,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  docIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docContent: {
    flex: 1,
    gap: 2,
  },
  docTitle: {
    ...typography.callout,
    fontWeight: '600',
    color: colors.text.primary,
  },
  docDesc: {
    ...typography.caption1,
    color: colors.text.secondary,
  },
  docMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  docMetaText: {
    ...typography.caption2,
    color: colors.text.tertiary,
  },
  docMetaDot: {
    fontSize: 8,
    color: colors.text.tertiary,
  },
  downloadButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.status.infoLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
