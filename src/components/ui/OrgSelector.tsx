import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useAuthStore } from '@/store/authStore';
import { useAppTheme } from '@/hooks/useAppTheme';
import { borderRadius, spacing, typography, shadows } from '@/theme';
import { organizationService } from '@/services/organizationService';

export function OrgSelector() {
  const { colors, isDark } = useAppTheme();
  const { user, updateUser, switchOrganization } = useAuthStore();
  const [visible, setVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const currentOrg = user?.organization;
  const organizations = Array.isArray(user?.organizations) ? user.organizations : [];

  useEffect(() => {
    // If we have a user but no organizations list, fetch it
    if (user && !user.organizations) {
      loadOrganizations();
    }
  }, [user]);

  const loadOrganizations = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const orgs = await organizationService.getOrganizations();
      updateUser({ organizations: orgs });
      
      // Auto-select if no organization is currently active and list is available
      if (orgs.length > 0) {
        if (!currentOrg) {
          // If only one org, select it automatically. 
          // If multiple, maybe we can auto-select the first one anyway if nothing is set.
          handleSelectOrg(orgs[0].slug);
        } else {
          // If we already have an org, verify it still exists in the list
          const exists = orgs.some(o => o.id === currentOrg.id);
          if (!exists) {
            handleSelectOrg(orgs[0].slug);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load organizations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleModal = () => {
    if (!visible && (!organizations.length)) {
      loadOrganizations();
    }
    setVisible(!visible);
  };

  const handleSelectOrg = (slug: string) => {
    switchOrganization(slug);
    setVisible(false);
  };

  if (!user) return null;

  return (
    <View style={styles.container}>
      <Pressable
        onPress={toggleModal}
        style={({ pressed }) => [
          styles.selector,
          { 
            backgroundColor: isDark ? colors.background.tertiary : colors.background.secondary,
            borderColor: colors.border.light,
            opacity: pressed ? 0.7 : 1 
          }
        ]}
      >
        <Text style={[styles.slugText, { color: colors.brand.primary }]}>
          {currentOrg?.slug || 'select-org'}
        </Text>
        <Ionicons name="chevron-down" size={14} color={colors.text.secondary} style={{ marginLeft: 4 }} />
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

            <Text style={[styles.menuTitle, { color: colors.text.secondary }]}>Switch Organization</Text>
            
            {isLoading && organizations.length === 0 ? (
              <ActivityIndicator size="small" color={colors.brand.primary} style={{ margin: spacing.md }} />
            ) : (
              <View style={styles.list}>
                {organizations.map((org) => (
                  <TouchableOpacity
                    key={org.id}
                    style={[
                      styles.orgItem,
                      { 
                        backgroundColor: currentOrg?.id === org.id ? colors.brand.primary + '15' : 'transparent',
                        borderColor: currentOrg?.id === org.id ? colors.brand.primary : 'transparent' 
                      }
                    ]}
                    onPress={() => handleSelectOrg(org.slug)}
                  >
                    <View style={styles.orgInfo}>
                      <Text style={[
                        styles.orgName, 
                        { color: currentOrg?.id === org.id ? colors.brand.primary : colors.text.primary }
                      ]}>
                        {org.name}
                      </Text>
                      <Text style={[styles.orgSlug, { color: colors.text.tertiary }]}>
                        {org.slug}
                      </Text>
                    </View>
                    {currentOrg?.id === org.id && (
                      <Ionicons name="checkmark-circle" size={18} color={colors.brand.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {organizations.length === 0 && !isLoading && (
              <Text style={[styles.emptyText, { color: colors.text.tertiary }]}>No organizations found</Text>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // margin removed
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  slugText: {
    ...typography.caption1,
    fontWeight: '700',
    letterSpacing: 0.5,
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
    width: 260,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    overflow: 'hidden',
    ...shadows.lg,
  },
  menuTitle: {
    ...typography.caption2,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  list: {
    gap: spacing.xs,
  },
  orgItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  orgInfo: {
    flex: 1,
  },
  orgName: {
    ...typography.body,
    fontWeight: '600',
  },
  orgSlug: {
    ...typography.caption2,
    marginTop: 2,
  },
  emptyText: {
    ...typography.caption1,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
});
