/**
 * EventDetailScreen — Event detail with hero, metadata, packages, and sticky CTA.
 * Reference: event_detail_screen mockup, UX Flow Guide § 4.D
 */
import { Badge } from "@/components/ui/Badge";
import { borderRadius, spacing, typography, shadows } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Dimensions,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { useAppTheme } from "@/hooks/useAppTheme";

const { width } = Dimensions.get("window");

function MetaTile({
  icon,
  label,
  value,
  colors,
  styles
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  colors: any;
  styles: any;
}) {
  return (
    <View style={styles.metaTile}>
      <Ionicons name={icon} size={20} color={colors.brand.primary} />
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

import api from "@/services/api";
import type { EventItem, SingleEventResponse, DashboardResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";

import { useAppStore } from "@/store/appStore";
import { useAuthStore } from "@/store/authStore";

export function EventDetailScreen() {
  const { t, i18n } = useTranslation();
  const { colors, isDark } = useAppTheme();
  const styles = createStyles(colors, isDark);
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isAuthenticated } = useAuthStore();
  const [isModalVisible, setIsModalVisible] = React.useState(false);

  const { data: eventResp, isLoading } = useQuery<SingleEventResponse>({
    queryKey: ["event", id],
    queryFn: async () => {
      const resp = await api.get(`/events/${id}`);
      return resp.data;
    },
  });

  const { data: dashboardData } = useQuery<DashboardResponse>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const resp = await api.get("/mobile-dashboard");
      return resp.data;
    },
  });

  const event = eventResp?.data;
  const whatsappUrl = dashboardData?.contact_info?.whatsapp_url;

  const handleContact = () => {
    if (whatsappUrl) {
      Linking.openURL(whatsappUrl);
    }
  };

  const getStatusBadge = (e: EventItem) => {
    if (!e.is_published)
      return { label: t("events.draft"), variant: "neutral" as const };
    if (e.is_full)
      return { label: t("events.full"), variant: "danger" as const };
    if (e.allow_registration)
      return { label: t("events.open"), variant: "success" as const };
    return { label: t("events.closed"), variant: "neutral" as const };
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const lng = i18n.language === "id" ? "id-ID" : "en-US";
    return date.toLocaleDateString(lng, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleShare = async () => {
    if (!event) return;
    try {
      await Share.share({
        message: `Check out: ${event.title}`,
        title: event.title,
      });
    } catch (error) {}
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={colors.brand.primary} />
      </View>
    );
  }

  if (!event) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={typography.headline}>{t("events.notFound")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Hero Image */}
        <View style={styles.heroSection}>
          <Image
            source={{ uri: event.cover_image ?? undefined }}
            style={styles.heroImage}
            contentFit="cover"
            placeholder={{ blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4" }}
            transition={300}
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroActions}>
            <Pressable
              onPress={() => router.back()}
              style={styles.heroButton}
              accessibilityLabel={t("common.back")}
            >
              <BlurView
                intensity={40}
                tint="dark"
                style={StyleSheet.absoluteFill}
              />
              <Ionicons
                name="arrow-back"
                size={22}
                color={colors.text.inverse}
              />
            </Pressable>
            <View style={{ flexDirection: "row", gap: spacing.sm }}>
              <Pressable
                onPress={handleShare}
                style={styles.heroButton}
                accessibilityLabel={t("common.share")}
              >
                <BlurView
                  intensity={40}
                  tint="dark"
                  style={StyleSheet.absoluteFill}
                />
                <Ionicons
                  name="share-outline"
                  size={22}
                  color={colors.text.inverse}
                />
              </Pressable>
              {whatsappUrl && (
                <Pressable
                  onPress={handleContact}
                  style={styles.heroButton}
                  accessibilityLabel={t("common.contact")}
                >
                  <BlurView
                    intensity={40}
                    tint="dark"
                    style={StyleSheet.absoluteFill}
                  />
                  <Ionicons
                    name="logo-whatsapp"
                    size={22}
                    color="#25D366"
                  />
                </Pressable>
              )}
            </View>
          </View>

          <Pressable
            onPress={() => setIsModalVisible(true)}
            style={styles.viewFullBadge}
          >
            <BlurView
              intensity={60}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
            <Ionicons name="expand" size={14} color={colors.text.inverse} />
            <Text style={styles.viewFullText}>{t("events.viewFullImage")}</Text>
          </Pressable>
        </View>

        {/* Content */}
        <View style={styles.contentSection}>
          {/* Status & Title */}
          <Badge
            label={getStatusBadge(event).label}
            variant={getStatusBadge(event).variant}
          />
          <Text style={styles.title}>{event.title}</Text>

          {/* Metadata Tiles */}
          <View style={styles.metaGrid}>
            <MetaTile
              icon="calendar"
              label={t("events.date")}
              value={formatDate(event.event_date)}
              colors={colors}
              styles={styles}
            />
            <MetaTile
              icon="location"
              label={t("events.location")}
              value={event.city || t("events.location")}
              colors={colors}
              styles={styles}
            />
            <MetaTile
              icon="people"
              label={t("events.spots")}
              value={
                event.available_spots !== null
                  ? `${event.available_spots} ${t("events.remaining")}`
                  : t("events.unlimited")
              }
              colors={colors}
              styles={styles}
            />
            <MetaTile
              icon="clipboard"
              label={t("events.registration")}
              value={
                event.allow_registration ? t("events.open") : t("events.closed")
              }
              colors={colors}
              styles={styles}
            />
          </View>

          {/* Proposal Download (Promoted) */}
          <Pressable
            onPress={() =>
              event.proposal ? Linking.openURL(event.proposal) : null
            }
            style={({ pressed }) => [
              styles.proposalButtonAlt,
              shadows.md,
              pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
              !event.proposal && { opacity: 0.5 },
            ]}
          >
            <View style={styles.proposalIconContainer}>
              <Ionicons
                name="document-text"
                size={24}
                color={colors.text.inverse}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[typography.headline, { color: colors.text.primary }]}
              >
                {event.proposal
                  ? t("events.downloadProposal")
                  : t("events.proposalNotAvailable")}
              </Text>
              <Text style={[typography.caption1, { color: colors.text.secondary }]}>
                {event.proposal
                  ? t("events.proposalDetailedPdf")
                  : t("events.proposalComingSoon")}
              </Text>
            </View>
            {event.proposal && (
              <Ionicons
                name="download-outline"
                size={20}
                color={colors.brand.primary}
              />
            )}
          </Pressable>

          {/* Duration Calendar */}
          <View style={styles.calendarSection}>
            <Text style={styles.sectionTitle}>{t("events.eventDuration")}</Text>
            <View style={styles.calendarGrid}>
              {Array.from({ length: 14 }).map((_, i) => {
                const d = new Date(event.event_date);
                d.setDate(d.getDate() - 3 + i); 
                const isEventDay = (day: Date) => {
                  const dayTime = new Date(day.toDateString()).getTime();
                  const eventStart = new Date(
                    new Date(event.event_date).toDateString(),
                  ).getTime();
                  const duration = event.duration_days || 1;
                  const eventEnd =
                    eventStart + (duration - 1) * 24 * 60 * 60 * 1000;
                  return dayTime >= eventStart && dayTime <= eventEnd;
                };
                const active = isEventDay(d);
                const lng = i18n.language === "id" ? "id-ID" : "en-US";
                return (
                  <View
                    key={i}
                    style={[
                      styles.calendarDay,
                      active && styles.calendarDayActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.calendarWeekday,
                        active && styles.calendarDayActiveText,
                      ]}
                    >
                      {d.toLocaleDateString(lng, { weekday: "short" })}
                    </Text>
                    <Text
                      style={[
                        styles.calendarDayNum,
                        active && styles.calendarDayActiveText,
                      ]}
                    >
                      {d.getDate()}
                    </Text>
                    <Text
                      style={[
                        styles.calendarMonth,
                        active && styles.calendarDayActiveText,
                      ]}
                    >
                      {d.toLocaleDateString(lng, { month: "short" })}
                    </Text>
                  </View>
                );
              })}
            </View>
            <Text style={styles.calendarLegend}>
              {event.duration_days || 1} {t("common.days")}{" "}
              {t("events.totalStartingFrom")} {formatDate(event.event_date)}
            </Text>
          </View>

          {/* Location & Maps */}
          <View style={styles.locationSection}>
            <Text style={styles.sectionTitle}>{t("events.location")}</Text>
            <View style={[styles.locationCard, shadows.sm]}>
              <View style={styles.locationInfo}>
                <Ionicons
                  name="location"
                  size={24}
                  color={colors.status.info}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[typography.headline, { color: colors.text.primary }]}>
                    {event.city || t("events.location")}
                  </Text>
                  <Text style={[typography.subhead, { color: colors.text.secondary }]}>
                    {event.province}, {event.nation}
                  </Text>
                </View>
              </View>
              {event.google_maps_url && (
                <Pressable
                  onPress={() => Linking.openURL(event.google_maps_url!)}
                  style={styles.mapButton}
                >
                  <Ionicons name="map" size={18} color={colors.text.inverse} />
                  <Text style={styles.mapButtonText}>{t("events.googleMaps")}</Text>
                </Pressable>
              )}
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>{t("events.eventDetails")}</Text>
            <Text style={styles.description}>
              {(event.description || "").replace(/<[^>]*>?/gm, "").trim()}
            </Text>
          </View>

          {/* Rundown / Agenda */}
          {event.rundown && event.rundown.length > 0 && (
            <View style={styles.packagesSection}>
              <Text style={styles.sectionTitle}>{t("events.agenda")}</Text>
              {event.rundown.map((item, idx) => (
                <View
                  key={idx}
                  style={[styles.packageCard, { padding: spacing.md }]}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={styles.packageName}>{item.data.title}</Text>
                    <Text style={[styles.packageDesc, { marginTop: 0 }]}>
                      {item.data.start_time || item.data.date || "-"}
                    </Text>
                  </View>

                  {item.data.speaker && (
                    <Text
                      style={[
                        styles.packageDesc,
                        { marginTop: 4, fontStyle: "italic" },
                      ]}
                    >
                      {t("events.speaker")}: {item.data.speaker}
                    </Text>
                  )}

                  {/* Session Files */}
                  {item.data.session_files &&
                    item.data.session_files.length > 0 && (
                      <View style={{ marginTop: spacing.md, gap: spacing.xs }}>
                        <Text
                          style={[
                            typography.caption1,
                            { fontWeight: "600", color: colors.text.secondary },
                          ]}
                        >
                          {t("events.materials")}:
                        </Text>
                        {item.data.session_files.map((file, fIdx) => {
                          const fileName = file.split("/").pop() || "Untitled";
                          const isPDF = file.toLowerCase().endsWith(".pdf");
                          const isXLS =
                            file.toLowerCase().endsWith(".xlsx") ||
                            file.toLowerCase().endsWith(".xls");

                          return (
                            <View
                              key={fIdx}
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 8,
                                paddingVertical: 4,
                              }}
                            >
                              <Ionicons
                                name={
                                  isPDF
                                    ? "document-text"
                                    : isXLS
                                      ? "grid"
                                      : "document"
                                }
                                size={16}
                                color={colors.text.tertiary}
                              />
                              <Text
                                style={[typography.caption2, { flex: 1, color: colors.text.primary }]}
                                numberOfLines={1}
                              >
                                {fileName}
                              </Text>
                              {!isAuthenticated ? (
                                <Ionicons
                                  name="lock-closed"
                                  size={14}
                                  color={colors.status.warning}
                                />
                              ) : (
                                <Ionicons
                                  name="download-outline"
                                  size={14}
                                  color={colors.brand.primary}
                                />
                              )}
                            </View>
                          );
                        })}
                        {!isAuthenticated && (
                          <Text
                            style={[
                              typography.caption2,
                              {
                                color: colors.text.tertiary,
                                fontStyle: "italic",
                                marginTop: 4,
                              },
                            ]}
                          >
                            {t("events.loginToAccessFiles")}
                          </Text>
                        )}
                      </View>
                    )}
                </View>
              ))}
            </View>
          )}

          {/* Documentation Gallery */}
          {event.documentation && event.documentation.length > 0 && (
            <View style={styles.packagesSection}>
              <Text style={styles.sectionTitle}>{t("events.documentation")}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: spacing.md }}
              >
                {event.documentation.map((url, idx) => (
                  <Image
                    key={idx}
                    source={{ uri: url }}
                    style={styles.documentationImage}
                    contentFit="cover"
                    placeholder={{ blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4" }}
                    transition={300}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Testimonials */}
          {event.testimonials && event.testimonials.length > 0 && (
            <View style={styles.packagesSection}>
              <Text style={styles.sectionTitle}>{t("events.testimonials")}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: spacing.md }}
              >
                {event.testimonials.map((tItem, idx) => (
                  <View key={idx} style={[styles.testimonialCard, shadows.sm]}>
                    <Ionicons
                      name="chatbox-ellipses"
                      size={24}
                      color={colors.brand.primary}
                      style={{ opacity: 0.2 }}
                    />
                    <Text style={styles.testimonialQuote}>{tItem.quote}</Text>
                    <View style={{ marginTop: spacing.md }}>
                      <Text style={styles.testimonialName}>{tItem.name}</Text>
                      <Text style={styles.testimonialRole}>{tItem.role}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Packages Preview */}
          {event.registration_packages &&
            event.registration_packages.length > 0 && (
              <View style={styles.packagesSection}>
                <Text style={styles.sectionTitle}>{t("events.packages")}</Text>
                {event.registration_packages.map((pkg, idx) => (
                  <View key={idx} style={[styles.packageCard, shadows.sm]}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text style={styles.packageName}>{pkg.name}</Text>
                      <Text style={styles.packagePrice}>
                        {formatCurrency(pkg.price)}
                      </Text>
                    </View>
                    {pkg.description && (
                      <Text
                        style={[styles.packageDesc, { marginTop: spacing.sm }]}
                      >
                        {pkg.description}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          {/* Help Panel */}
          {whatsappUrl && (
            <View style={styles.helpSection}>
              <View style={styles.helpContent}>
                <View style={styles.helpIconBg}>
                  <Ionicons name="help-circle" size={24} color={colors.brand.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.helpTitle}>{t("events.helpTitle")}</Text>
                  <Text style={styles.helpQuestion}>{t("events.helpQuestion")}</Text>
                </View>
              </View>
              <Pressable
                onPress={handleContact}
                style={({ pressed }) => [
                  styles.helpWhatsAppButton,
                  pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                ]}
              >
                <Ionicons name="logo-whatsapp" size={20} color={colors.text.inverse} />
                <Text style={styles.helpWhatsAppText}>{t("events.contactWhatsApp")}</Text>
              </Pressable>
            </View>
          )}

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={[styles.stickyBar, shadows.lg]}>
        {event.allow_registration ? (
          <View style={styles.stickyContent}>
            <View>
              <Text style={styles.stickyLabel}>{t("events.startingFrom")}</Text>
              <Text style={styles.stickyPrice}>
                {event.registration_packages?.[0]
                  ? formatCurrency(event.registration_packages[0].price)
                  : "-"}
              </Text>
            </View>
            <Pressable
              onPress={() => {
                if (!isAuthenticated) {
                  router.push('/auth/login');
                } else {
                  // TODO: Navigate to registration form/webview
                  // For now, redirect to event website or show coming soon
                  if (event.registration_url) {
                    Linking.openURL(event.registration_url);
                  }
                }
              }}
              android_ripple={{ color: "rgba(255,255,255,0.2)" }}
              style={({ pressed }) => [
                styles.registerButton,
                Platform.OS === "ios" && pressed ? { opacity: 0.85 } : {},
              ]}
              accessibilityRole="button"
            >
              <Ionicons name="ticket" size={18} color={colors.text.inverse} />
              <Text style={styles.registerText}>
                {isAuthenticated ? t("events.registerNow") : t("events.loginToRegister")}
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.stickyContent}>
            <Text style={styles.closedText}>
              {t("events.registrationClosed")}
            </Text>
          </View>
        )}
      </View>

      {/* Full Image Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setIsModalVisible(false)}
          />
          <View style={styles.modalContent}>
            <Image
              source={{ uri: event.cover_image ?? undefined }}
              style={styles.modalImage}
              contentFit="contain"
            />
            <Pressable
              onPress={() => setIsModalVisible(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={28} color={colors.text.inverse} />
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
  },
  // Hero
  heroSection: {
    height: 280,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  heroActions: {
    position: "absolute",
    top: Platform.OS === "ios" ? 56 : 40,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heroButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    overflow: "hidden", 
    justifyContent: "center",
    alignItems: "center",
  },
  // Content
  contentSection: {
    padding: spacing.lg,
    gap: spacing.sm,
    marginTop: -borderRadius.xl,
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  title: {
    ...typography.title1,
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  category: {
    ...typography.footnote,
    color: colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  // Meta grid
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  metaTile: {
    width: (width - spacing.lg * 2 - spacing.md) / 2,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  metaLabel: {
    ...typography.caption2,
    color: colors.text.tertiary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metaValue: {
    ...typography.callout,
    fontWeight: "600",
    color: colors.text.primary,
  },
  // Description
  descriptionSection: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    ...typography.title3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  // Packages
  packagesSection: {
    marginTop: spacing["2xl"],
  },
  packageCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  packageName: {
    ...typography.headline,
    color: colors.text.primary,
  },
  packagePrice: {
    ...typography.title3,
    color: colors.brand.primary,
    marginTop: spacing.xs,
  },
  packageDesc: {
    ...typography.subhead,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  // Sticky CTA
  stickyBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingBottom: Platform.OS === "ios" ? 36 : spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border.light,
  },
  stickyContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stickyLabel: {
    ...typography.caption1,
    color: colors.text.tertiary,
  },
  stickyPrice: {
    ...typography.title3,
    color: colors.text.primary,
  },
  registerButton: {
    backgroundColor: colors.brand.primary,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  registerText: {
    color: colors.text.inverse,
    fontSize: 15,
    fontWeight: "600",
  },
  closedText: {
    ...typography.callout,
    color: colors.text.tertiary,
    flex: 1,
    textAlign: "center",
  },
  documentationImage: {
    width: 240,
    height: 160,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
  },
  testimonialCard: {
    width: 280,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  testimonialQuote: {
    ...typography.body,
    color: colors.text.secondary,
    fontStyle: "italic",
    lineHeight: 22,
  },
  testimonialName: {
    ...typography.headline,
    color: colors.text.primary,
  },
  testimonialRole: {
    ...typography.caption1,
    color: colors.text.tertiary,
  },
  // New Styles
  imageCard: {
    marginVertical: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    backgroundColor: colors.background.secondary,
  },
  fullImage: {
    width: "100%",
    height: 200,
  },
  proposalButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginVertical: spacing.md,
  },
  locationSection: {
    marginTop: spacing.xl,
  },
  locationCard: {
    padding: spacing.lg,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.brand.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  mapButtonText: {
    color: colors.text.inverse,
    fontWeight: "600",
  },
  calendarSection: {
    marginTop: spacing.xl,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    justifyContent: "space-between",
  },
  calendarDay: {
    width: (width - spacing.lg * 2 - spacing.xs * 6) / 7,
    aspectRatio: 1,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background.secondary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  calendarDayActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  calendarDayNum: {
    ...typography.subhead,
    fontWeight: "700",
    color: colors.text.primary,
  },
  calendarMonth: {
    ...typography.caption2,
    fontSize: 8,
    color: colors.text.tertiary,
    textTransform: "uppercase",
  },
  calendarDayActiveText: {
    color: colors.text.inverse,
  },
  calendarWeekday: {
    ...typography.caption2,
    fontSize: 7,
    textTransform: "uppercase",
    fontWeight: "bold",
    color: colors.text.tertiary,
  },
  calendarLegend: {
    ...typography.caption1,
    color: colors.text.tertiary,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  // New Modal Styles
  viewFullBadge: {
    position: "absolute",
    bottom: spacing.md + 20,
    right: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    overflow: "hidden", 
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  viewFullText: {
    color: colors.text.inverse,
    fontSize: 10,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    width: "100%",
    height: "80%",
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: "95%",
    height: "100%",
  },
  modalCloseButton: {
    position: "absolute",
    top: 40,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  proposalButtonAlt: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  proposalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.brand.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  whatsappStickyButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  stickyActionArea: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  helpSection: {
    marginTop: spacing["2xl"],
    padding: spacing.lg,
    backgroundColor: isDark ? colors.background.secondary : colors.brand.primary + "10", 
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: isDark ? colors.border.light : colors.brand.primary + "40",
    gap: spacing.md,
  },
  helpContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  helpIconBg: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: isDark ? colors.background.tertiary : colors.brand.primary + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  helpTitle: {
    ...typography.headline,
    color: colors.text.primary,
  },
  helpQuestion: {
    ...typography.subhead,
    color: colors.text.secondary,
  },
  helpWhatsAppButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#25D366",
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    ...shadows.sm,
  },
  helpWhatsAppText: {
    color: colors.text.inverse,
    fontWeight: "600",
    fontSize: 15,
  },
});
