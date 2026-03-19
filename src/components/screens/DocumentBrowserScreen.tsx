/**
 * DocumentBrowserScreen — Public document browser with preview UI.
 * In Phase 1, shows a sign-in prompt since documents require auth.
 * Reference: event_documents_guest_view mockup, UX Flow Guide § 4.G
 */
import React from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SearchBar } from '@/components/ui/SearchBar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, spacing, borderRadius, typography, shadows } from '@/theme';
import { MOCK_DOCUMENTS } from '@/services/mockData';

function DocumentCard({ doc }: { doc: typeof MOCK_DOCUMENTS[0] }) {
  const fileIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
    PDF: 'document-text',
    DOCX: 'document',
    XLSX: 'grid',
    ZIP: 'archive',
  };

  return (
    <View style={[styles.docCard, shadows.sm]}>
      <View style={[styles.docIcon, { backgroundColor: getFileColor(doc.file_type) }]}>
        <Ionicons
          name={fileIcons[doc.file_type] ?? 'document'}
          size={22}
          color={colors.text.inverse}
        />
      </View>
      <View style={styles.docContent}>
        <Text style={styles.docTitle} numberOfLines={2}>
          {doc.title}
        </Text>
        <Text style={styles.docDesc} numberOfLines={1}>
          {doc.description}
        </Text>
        <View style={styles.docMeta}>
          <Text style={styles.docMetaText}>{doc.file_type}</Text>
          <Text style={styles.docMetaDot}>•</Text>
          <Text style={styles.docMetaText}>{doc.file_size}</Text>
        </View>
      </View>
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
    </View>
  );
}

function getFileColor(type: string): string {
  switch (type) {
    case 'PDF':
      return '#E74C3C';
    case 'DOCX':
      return '#2980B9';
    case 'XLSX':
      return '#27AE60';
    case 'ZIP':
      return '#F39C12';
    default:
      return colors.text.tertiary;
  }
}

export function DocumentBrowserScreen() {
  const { t } = useTranslation();
  const [search, setSearch] = React.useState('');

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
        data={MOCK_DOCUMENTS}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <DocumentCard doc={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
