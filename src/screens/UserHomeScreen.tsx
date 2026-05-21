import React, { useContext, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Alert,
  Linking,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import AdvertCarousel from "../components/AdvertCarousel";
import DesignSystem from "../theme/designSystem";
import UserDashboardHeader from "../components/UserDashboardHeader";

const UserHomeScreen: React.FC = () => {
  const { user, logout, refreshUserData } = useContext(AuthContext);
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [avatarKey, setAvatarKey] = useState(Date.now());
  const [avatarLoading, setAvatarLoading] = useState(false);
  const isRefreshing = useRef(false);

  useEffect(() => {
    // Only update if avatar URL actually changed
    if (user?.avatar_url !== avatarUrl) {
      console.log("User avatar URL changed:", user?.avatar_url);
      const newKey = Date.now();
      setAvatarUrl(user?.avatar_url || null);
      setImageError(false);
      setAvatarKey(newKey);
      setAvatarLoading(false);
    }
  }, [user?.avatar_url]);

  useFocusEffect(
    React.useCallback(() => {
      // Prevent multiple simultaneous refreshes
      if (isRefreshing.current) {
        console.log("Already refreshing, skipping...");
        return;
      }

      console.log("UserHomeScreen focused - refreshing user data");
      isRefreshing.current = true;
      let isMounted = true;

      refreshUserData()
        .then((freshUser) => {
          if (freshUser && isMounted) {
            console.log("Fresh user data received:", freshUser);
            console.log("Fresh avatar_url:", freshUser.avatar_url);
            const newKey = Date.now();
            setAvatarUrl(freshUser.avatar_url || null);
            setImageError(false);
            setAvatarKey(newKey);
          }
        })
        .catch((error) => {
          console.error("Failed to refresh user data:", error);
          if (isMounted) {
            setAvatarUrl(user?.avatar_url || null);
            setImageError(false);
            setAvatarKey(Date.now());
          }
        })
        .finally(() => {
          if (isMounted) {
            isRefreshing.current = false;
          }
        });

      return () => {
        isMounted = false;
        isRefreshing.current = false;
      };
    }, []),
  );

  const navigateToChat = () => {
    router.push("/(user)/chat");
  };

  const handleCall = () => {
    Linking.openURL("tel:09071906688");
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={DesignSystem.colors.primary[700]}
      />

      {/* Header */}
      <UserDashboardHeader
        title="PrimeChem"
        subtitle={`Hello, ${user?.name?.split(" ")[0] || "User"}`}
        rightComponent={
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => router.push("/(user)/profile")}
            >
              {avatarUrl && !imageError ? (
                <>
                  <Image
                    key={`avatar-${avatarKey}`}
                    source={{
                      uri: `${avatarUrl}?t=${avatarKey}`,
                    }}
                    style={styles.avatarImg}
                    onError={(error) => {
                      console.error(
                        "Avatar image load error:",
                        error.nativeEvent,
                      );
                      setImageError(true);
                      setAvatarLoading(false);
                    }}
                    onLoadStart={() => {
                      setAvatarLoading(true);
                    }}
                    onLoad={() => {
                      console.log("Avatar image loaded successfully");
                      setAvatarLoading(false);
                    }}
                  />
                  {avatarLoading && (
                    <View style={styles.avatarLoadingOverlay}>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    </View>
                  )}
                </>
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}
            >
              <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Adverts Carousel */}
        <View style={styles.section}>
          <AdvertCarousel />
        </View>

        {/* AI Assistant Card */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.aiCard}
            onPress={navigateToChat}
            activeOpacity={0.8}
          >
            <View style={styles.aiCardContent}>
              <View style={styles.aiIconContainer}>
                <Ionicons
                  name="sparkles"
                  size={32}
                  color={DesignSystem.colors.primary[600]}
                />
              </View>
              <View style={styles.aiTextContent}>
                <View style={styles.aiBadge}>
                  <Ionicons
                    name="sparkles"
                    size={10}
                    color={DesignSystem.colors.primary[600]}
                  />
                  <Text style={styles.aiBadgeText}>AI ASSISTANT</Text>
                </View>
                <Text style={styles.aiTitle}>Health Concierge</Text>
                <Text style={styles.aiSubtitle}>
                  Get instant help with medications, refills, and health advice
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={24}
                color={DesignSystem.colors.text.secondary}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push("/(user)/medications")}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: DesignSystem.colors.primary[50] },
                ]}
              >
                <Ionicons
                  name="medical"
                  size={28}
                  color={DesignSystem.colors.primary[600]}
                />
              </View>
              <Text style={styles.actionTitle}>Find Medications</Text>
              <Text style={styles.actionSubtitle}>Search inventory</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push("/(user)/refills")}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: DesignSystem.colors.info.light + "20" },
                ]}
              >
                <Ionicons
                  name="refresh-circle"
                  size={28}
                  color={DesignSystem.colors.info.main}
                />
              </View>
              <Text style={styles.actionTitle}>Refill Requests</Text>
              <Text style={styles.actionSubtitle}>Manage refills</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pharmacy Info */}
        <View style={styles.section}>
          <View style={styles.infoCard}>
            <View style={styles.infoContent}>
              <View style={styles.infoIconContainer}>
                <Ionicons
                  name="time"
                  size={24}
                  color={DesignSystem.colors.primary[600]}
                />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>PrimeChem Central</Text>
                <Text style={styles.infoSubtitle}>Open until 9:00 PM</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.callButton} onPress={handleCall}>
              <Ionicons name="call" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Floating Chat Button */}
      <TouchableOpacity style={styles.floatingButton} onPress={navigateToChat}>
        <Ionicons name="chatbubbles" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background.default,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: DesignSystem.spacing.sm,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: DesignSystem.borderRadius.full,
    overflow: "hidden",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: DesignSystem.colors.primary[500],
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  avatarLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: DesignSystem.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: DesignSystem.borderRadius.md,
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    paddingHorizontal: DesignSystem.spacing.md,
    marginTop: DesignSystem.spacing.lg,
  },
  sectionTitle: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: "700",
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.md,
  },
  aiCard: {
    backgroundColor: DesignSystem.colors.background.paper,
    borderRadius: DesignSystem.borderRadius.xl,
    padding: DesignSystem.spacing.md,
    ...DesignSystem.shadows.md,
    borderWidth: 1,
    borderColor: DesignSystem.colors.divider,
  },
  aiCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: DesignSystem.spacing.md,
  },
  aiIconContainer: {
    width: 56,
    height: 56,
    borderRadius: DesignSystem.borderRadius.md,
    backgroundColor: DesignSystem.colors.primary[50],
    justifyContent: "center",
    alignItems: "center",
  },
  aiTextContent: {
    flex: 1,
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: DesignSystem.colors.primary[50],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: DesignSystem.borderRadius.sm,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  aiBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: DesignSystem.colors.primary[600],
  },
  aiTitle: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: "700",
    color: DesignSystem.colors.text.primary,
    marginBottom: 2,
  },
  aiSubtitle: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.text.secondary,
    lineHeight: 18,
  },
  actionsGrid: {
    flexDirection: "row",
    gap: DesignSystem.spacing.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background.paper,
    borderRadius: DesignSystem.borderRadius.xl,
    padding: DesignSystem.spacing.md,
    alignItems: "center",
    ...DesignSystem.shadows.md,
    borderWidth: 1,
    borderColor: DesignSystem.colors.divider,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: DesignSystem.borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: DesignSystem.spacing.sm,
  },
  actionTitle: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: "700",
    color: DesignSystem.colors.text.primary,
    textAlign: "center",
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: DesignSystem.typography.fontSize.xs,
    color: DesignSystem.colors.text.secondary,
    textAlign: "center",
  },
  infoCard: {
    backgroundColor: DesignSystem.colors.background.paper,
    borderRadius: DesignSystem.borderRadius.xl,
    padding: DesignSystem.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...DesignSystem.shadows.md,
    borderWidth: 1,
    borderColor: DesignSystem.colors.divider,
  },
  infoContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: DesignSystem.spacing.sm,
    flex: 1,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: DesignSystem.borderRadius.md,
    backgroundColor: DesignSystem.colors.primary[50],
    justifyContent: "center",
    alignItems: "center",
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: "700",
    color: DesignSystem.colors.text.primary,
    marginBottom: 2,
  },
  infoSubtitle: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.success.main,
    fontWeight: "600",
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: DesignSystem.borderRadius.md,
    backgroundColor: DesignSystem.colors.primary[600],
    justifyContent: "center",
    alignItems: "center",
    ...DesignSystem.shadows.sm,
  },
  floatingButton: {
    position: "absolute",
    bottom: 80,
    right: DesignSystem.spacing.md,
    width: 60,
    height: 60,
    borderRadius: DesignSystem.borderRadius.full,
    backgroundColor: DesignSystem.colors.primary[600],
    justifyContent: "center",
    alignItems: "center",
    ...DesignSystem.shadows.xl,
  },
});

export default UserHomeScreen;
