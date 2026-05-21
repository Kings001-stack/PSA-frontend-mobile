import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import LoadingOverlay from "../../src/components/LoadingOverlay";
import { useLocalSearchParams, router } from "expo-router";
import api from "../../src/services/api";
import {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
} from "../../src/styles/superAdminTheme";

interface UserDetails {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    account_status: string;
    phone: string | null;
    last_login_at: string | null;
    created_at: string;
    creator?: { name: string };
    updater?: { name: string };
  };
  activity_logs: Array<any>;
  audit_logs: Array<any>;
}

export default function UserDetailsScreen() {
  const { userId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    try {
      const response = await api.get(`/super-admin/users/${userId}`);
      if (response.data.success) {
        setUserDetails(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch user details:", error);
      Alert.alert("Error", "Failed to load user details");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = () => {
    Alert.alert(
      "Suspend User",
      `Are you sure you want to suspend ${userDetails?.user.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Suspend",
          style: "destructive",
          onPress: async () => {
            try {
              await api.post(`/super-admin/users/${userId}/suspend`);
              Alert.alert("Success", "User suspended successfully");
              fetchUserDetails();
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.response?.data?.message || "Failed to suspend user",
              );
            }
          },
        },
      ],
    );
  };

  const handleReactivate = async () => {
    try {
      await api.post(`/super-admin/users/${userId}/reactivate`);
      Alert.alert("Success", "User reactivated successfully");
      fetchUserDetails();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to reactivate user",
      );
    }
  };

  const handleResetPassword = () => {
    Alert.prompt(
      "Reset Password",
      "Enter new password (min 8 characters)",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          onPress: async (password) => {
            if (!password || password.length < 8) {
              Alert.alert("Error", "Password must be at least 8 characters");
              return;
            }
            try {
              await api.post(`/super-admin/users/${userId}/reset-password`, {
                new_password: password,
              });
              Alert.alert("Success", "Password reset successfully");
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.response?.data?.message || "Failed to reset password",
              );
            }
          },
        },
      ],
      "secure-text",
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={["#8B5CF6", "#6366F1", "#4F46E5"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <SafeAreaView edges={["top"]}>
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>User Details</Text>
              <View style={{ width: 24 }} />
            </View>
          </SafeAreaView>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <LottieView
            source={require("../../src/assets/lottie/Loading animation blue.json")}
            autoPlay
            loop
            style={styles.lottieAnimation}
          />
          <Text style={styles.loadingText}>Loading user details...</Text>
        </View>
      </View>
    );
  }

  if (!userDetails) return null;

  const { user, activity_logs, audit_logs } = userDetails;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#8B5CF6", "#6366F1", "#4F46E5"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={["top"]}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>User Details</Text>
            <View style={{ width: 24 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.contentSpacer} />

        {/* User Info Card */}
        <View style={styles.card}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>

          <View style={styles.badges}>
            <View style={styles.roleBadge}>
              <Ionicons
                name="shield-checkmark"
                size={14}
                color={colors.primary}
              />
              <Text style={styles.roleBadgeText}>
                {user.role.replace("_", " ")}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    user.account_status === "active"
                      ? colors.successLight
                      : colors.errorLight,
                },
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  {
                    color:
                      user.account_status === "active"
                        ? colors.success
                        : colors.error,
                  },
                ]}
              >
                {user.account_status}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons
              name="call-outline"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={styles.infoText}>
              {user.phone || "No phone number"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons
              name="time-outline"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={styles.infoText}>
              Last login:{" "}
              {user.last_login_at
                ? new Date(user.last_login_at).toLocaleString()
                : "Never"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={styles.infoText}>
              Created: {new Date(user.created_at).toLocaleDateString()}
            </Text>
          </View>

          {user.creator && (
            <View style={styles.infoRow}>
              <Ionicons
                name="person-outline"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={styles.infoText}>
                Created by: {user.creator.name}
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        {user.role !== "super_admin" && (
          <View style={styles.actionsCard}>
            {user.account_status === "active" ? (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleSuspend}
              >
                <Ionicons name="ban" size={20} color="#EF4444" />
                <Text style={[styles.actionButtonText, { color: "#EF4444" }]}>
                  Suspend Account
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleReactivate}
              >
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={[styles.actionButtonText, { color: "#10B981" }]}>
                  Reactivate Account
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleResetPassword}
            >
              <Ionicons name="key" size={20} color="#3B82F6" />
              <Text style={[styles.actionButtonText, { color: "#3B82F6" }]}>
                Reset Password
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Activity Logs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {activity_logs && activity_logs.length > 0 ? (
            activity_logs.slice(0, 5).map((log: any) => (
              <View key={log.id} style={styles.logCard}>
                <Text style={styles.logDescription}>{log.description}</Text>
                <Text style={styles.logTime}>
                  {new Date(log.created_at).toLocaleString()}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={48} color={colors.gray300} />
              <Text style={styles.emptyText}>No activity logs</Text>
            </View>
          )}
        </View>

        {/* Audit Logs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audit Trail</Text>
          {audit_logs && audit_logs.length > 0 ? (
            audit_logs.slice(0, 5).map((log: any) => (
              <View key={log.id} style={styles.logCard}>
                <Text style={styles.logDescription}>{log.action}</Text>
                {log.user && (
                  <Text style={styles.logUser}>by {log.user.name}</Text>
                )}
                <Text style={styles.logTime}>
                  {new Date(log.created_at).toLocaleString()}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="document-text-outline"
                size={48}
                color={colors.gray300}
              />
              <Text style={styles.emptyText}>No audit logs</Text>
            </View>
          )}
        </View>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerGradient: {
    paddingBottom: spacing.xxxl,
    borderBottomLeftRadius: borderRadius.xxl,
    borderBottomRightRadius: borderRadius.xxl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.huge,
    fontWeight: typography.bold,
    color: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  lottieAnimation: {
    width: 200,
    height: 200,
  },
  loadingText: {
    marginTop: spacing.lg,
    fontSize: typography.lg,
    color: colors.primary,
    fontWeight: typography.semibold,
  },
  content: {
    flex: 1,
  },
  contentSpacer: {
    height: spacing.lg,
  },
  card: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.xl,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  userName: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: typography.base,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  badges: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.primaryBg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  roleBadgeText: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.primary,
    textTransform: "capitalize",
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  statusBadgeText: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    textTransform: "capitalize",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  actionsCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    ...shadows.md,
  },
  actionButtonText: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
  },
  section: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  logCard: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  logDescription: {
    fontSize: typography.base,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  logUser: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  logTime: {
    fontSize: typography.sm,
    color: colors.textTertiary,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xxxl,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    ...shadows.sm,
  },
  emptyText: {
    fontSize: typography.base,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});
