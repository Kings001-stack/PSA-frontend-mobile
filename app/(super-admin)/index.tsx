import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  LinearGradient,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient as ExpoLinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import LoadingOverlay from "../../src/components/LoadingOverlay";
import { useAuth } from "../../src/context/AuthContext";
import api from "../../src/services/api";
import { router } from "expo-router";
import {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
} from "../../src/styles/superAdminTheme";

const { width } = Dimensions.get("window");
const cardWidth = (width - spacing.xl * 3) / 2;

interface DashboardData {
  overview: {
    total_users: number;
    total_admins: number;
    total_pharmacists: number;
    total_super_admins: number;
    suspended_accounts: number;
    active_sessions: number;
    growth_percentage: number;
    new_users_30_days: number;
  };
  recent_activity: Array<{
    id: number;
    event_type: string;
    description: string;
    created_at: string;
    user?: {
      name: string;
      email: string;
      role: string;
    };
  }>;
  security_alerts: Array<any>;
  failed_logins_24h: number;
}

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [navigating, setNavigating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    fetchDashboardData();
    fetchNotifications();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get("/super-admin/dashboard");
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/super-admin/notifications", {
        params: { unread_only: true },
      });
      if (response.data.success) {
        setUnreadNotifications(response.data.data.unread_count);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
    fetchNotifications();
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getEventIcon = (eventType: string) => {
    const iconMap: { [key: string]: string } = {
      login: "log-in",
      logout: "log-out",
      admin_created: "person-add",
      pharmacist_created: "person-add",
      user_suspended: "ban",
      user_reactivated: "checkmark-circle",
      user_deleted: "trash",
      failed_login: "warning",
    };
    return iconMap[eventType] || "information-circle";
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LottieView
            source={require("../../src/assets/lottie/Loading animation blue.json")}
            autoPlay
            loop
            style={styles.lottieAnimation}
          />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Purple Gradient Header */}
      <ExpoLinearGradient
        colors={["#8B5CF6", "#6366F1", "#4F46E5"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={["top"]}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.userName}>{user?.name}</Text>
              <View style={styles.roleBadge}>
                <Ionicons name="shield-checkmark" size={12} color="#FFFFFF" />
                <Text style={styles.roleText}>SUPER ADMIN</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => {
                setNavigating(true);
                setTimeout(() => {
                  router.push("/(super-admin)/notifications");
                  setNavigating(false);
                }, 300);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.notificationIconContainer}>
                <Ionicons name="notifications" size={22} color="#FFFFFF" />
                {unreadNotifications > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {unreadNotifications > 9 ? "9+" : unreadNotifications}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ExpoLinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Spacer for visual separation */}
        <View style={styles.contentSpacer} />

        {/* Stats Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Platform Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Users"
              value={dashboardData?.overview.total_users || 0}
              icon="people"
              color={colors.info}
              trend="+12%"
            />
            <StatCard
              title="Admins"
              value={dashboardData?.overview.total_admins || 0}
              icon="shield"
              color={colors.admin}
            />
            <StatCard
              title="Pharmacists"
              value={dashboardData?.overview.total_pharmacists || 0}
              icon="medical"
              color={colors.pharmacist}
            />
            <StatCard
              title="Active Now"
              value={dashboardData?.overview.active_sessions || 0}
              icon="pulse"
              color={colors.warning}
              subtitle="sessions"
            />
          </View>
        </View>

        {/* Growth & Alerts Row */}
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={[styles.metricCard, { marginRight: spacing.md }]}>
              <View style={styles.metricHeader}>
                <View
                  style={[
                    styles.metricIconContainer,
                    { backgroundColor: colors.successLight },
                  ]}
                >
                  <Ionicons
                    name="trending-up"
                    size={20}
                    color={colors.success}
                  />
                </View>
                <View style={styles.metricBadge}>
                  <Text style={styles.metricBadgeText}>
                    +{dashboardData?.overview.growth_percentage || 0}%
                  </Text>
                </View>
              </View>
              <Text style={styles.metricValue}>
                {dashboardData?.overview.new_users_30_days || 0}
              </Text>
              <Text style={styles.metricLabel}>New Users (30d)</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <View
                  style={[
                    styles.metricIconContainer,
                    { backgroundColor: colors.errorLight },
                  ]}
                >
                  <Ionicons name="ban" size={20} color={colors.error} />
                </View>
              </View>
              <Text style={styles.metricValue}>
                {dashboardData?.overview.suspended_accounts || 0}
              </Text>
              <Text style={styles.metricLabel}>Suspended Accounts</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <ActionButton
              title="Create Admin"
              icon="person-add"
              color={colors.admin}
              onPress={() => {
                setNavigating(true);
                setTimeout(() => {
                  router.push("/(super-admin)/create-admin");
                  setNavigating(false);
                }, 300);
              }}
            />
            <ActionButton
              title="Create Pharmacist"
              icon="medical"
              color={colors.pharmacist}
              onPress={() => {
                setNavigating(true);
                setTimeout(() => {
                  router.push("/(super-admin)/create-pharmacist");
                  setNavigating(false);
                }, 300);
              }}
            />
            <ActionButton
              title="View All Users"
              icon="people"
              color={colors.info}
              onPress={() => {
                setNavigating(true);
                setTimeout(() => {
                  router.push("/(super-admin)/users");
                  setNavigating(false);
                }, 300);
              }}
            />
            <ActionButton
              title="Security Center"
              icon="shield-checkmark"
              color={colors.error}
              onPress={() => {
                setNavigating(true);
                setTimeout(() => {
                  router.push("/(super-admin)/security");
                  setNavigating(false);
                }, 300);
              }}
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity
              onPress={() => router.push("/(super-admin)/activity")}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllLink}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.activityCard}>
            {dashboardData?.recent_activity &&
            dashboardData.recent_activity.length > 0 ? (
              dashboardData.recent_activity
                .slice(0, 5)
                .map((activity, index) => (
                  <View
                    key={activity.id}
                    style={[
                      styles.activityItem,
                      index !== 0 && styles.activityItemBorder,
                    ]}
                  >
                    <View style={styles.activityIconContainer}>
                      <Ionicons
                        name={getEventIcon(activity.event_type) as any}
                        size={16}
                        color={colors.primary}
                      />
                    </View>
                    <View style={styles.activityContent}>
                      <Text
                        style={styles.activityDescription}
                        numberOfLines={2}
                      >
                        {activity.description}
                      </Text>
                      <Text style={styles.activityTime}>
                        {formatTimeAgo(activity.created_at)}
                      </Text>
                    </View>
                  </View>
                ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons
                  name="time-outline"
                  size={48}
                  color={colors.gray300}
                />
                <Text style={styles.emptyStateText}>No recent activity</Text>
              </View>
            )}
          </View>
        </View>

        {/* Security Alerts */}
        {dashboardData && dashboardData.failed_logins_24h > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Security Alerts</Text>
            <View style={styles.alertCard}>
              <View style={styles.alertIconContainer}>
                <Ionicons name="warning" size={24} color={colors.error} />
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>Failed Login Attempts</Text>
                <Text style={styles.alertText}>
                  {dashboardData.failed_logins_24h} failed attempts detected in
                  the last 24 hours
                </Text>
              </View>
              <TouchableOpacity
                style={styles.alertButton}
                onPress={() => router.push("/(super-admin)/security")}
                activeOpacity={0.7}
              >
                <Text style={styles.alertButtonText}>Review</Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.error}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>

      <LoadingOverlay visible={navigating} />
    </View>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: string;
  trend?: string;
  subtitle?: string;
}

function StatCard({
  title,
  value,
  icon,
  color,
  trend,
  subtitle,
}: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <View
          style={[styles.statIconContainer, { backgroundColor: `${color}15` }]}
        >
          <Ionicons name={icon as any} size={22} color={color} />
        </View>
        {trend && (
          <View style={styles.trendBadge}>
            <Text style={styles.trendText}>{trend}</Text>
          </View>
        )}
      </View>
      <Text style={styles.statValue}>{value.toLocaleString()}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );
}

interface ActionButtonProps {
  title: string;
  icon: string;
  color: string;
  onPress: () => void;
}

function ActionButton({ title, icon, color, onPress }: ActionButtonProps) {
  return (
    <TouchableOpacity
      style={styles.actionButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[styles.actionIconContainer, { backgroundColor: `${color}15` }]}
      >
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text style={styles.actionTitle} numberOfLines={2}>
        {title}
      </Text>
    </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  contentSpacer: {
    height: spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: typography.base,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: typography.medium,
    marginBottom: spacing.xs,
  },
  userName: {
    fontSize: typography.huge,
    color: "#FFFFFF",
    fontWeight: typography.bold,
    marginBottom: spacing.sm,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: "flex-start",
  },
  roleText: {
    fontSize: typography.xs,
    color: "#FFFFFF",
    fontWeight: typography.semibold,
    marginLeft: spacing.xs,
  },
  notificationButton: {
    marginLeft: spacing.md,
  },
  notificationIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#EF4444",
    borderRadius: borderRadius.full,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xs,
    borderWidth: 2,
    borderColor: "#8B5CF6",
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: typography.bold,
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  viewAllLink: {
    color: colors.primary,
    fontSize: typography.base,
    fontWeight: typography.semibold,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -spacing.sm,
  },
  statCard: {
    width: cardWidth,
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    marginHorizontal: spacing.sm,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  trendBadge: {
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  trendText: {
    fontSize: typography.xs,
    color: colors.success,
    fontWeight: typography.semibold,
  },
  statValue: {
    fontSize: typography.massive,
    fontWeight: typography.extrabold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  statTitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },
  statSubtitle: {
    fontSize: typography.xs,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  row: {
    flexDirection: "row",
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    ...shadows.md,
  },
  metricHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  metricIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  metricBadge: {
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  metricBadgeText: {
    fontSize: typography.xs,
    color: colors.success,
    fontWeight: typography.bold,
  },
  metricValue: {
    fontSize: typography.huge,
    fontWeight: typography.extrabold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  metricLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -spacing.sm,
  },
  actionButton: {
    width: cardWidth,
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    marginHorizontal: spacing.sm,
    marginBottom: spacing.md,
    alignItems: "center",
    ...shadows.md,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  actionTitle: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    textAlign: "center",
  },
  activityCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.md,
  },
  activityItem: {
    flexDirection: "row",
    paddingVertical: spacing.md,
  },
  activityItemBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  activityIconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryBg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityDescription: {
    fontSize: typography.base,
    color: colors.textPrimary,
    fontWeight: typography.medium,
    marginBottom: spacing.xs,
    lineHeight: typography.normal * typography.base,
  },
  activityTime: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xxxl,
  },
  emptyStateText: {
    fontSize: typography.base,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  alertCard: {
    flexDirection: "row",
    backgroundColor: colors.errorLight,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.error + "30",
    alignItems: "center",
  },
  alertIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: typography.base,
    fontWeight: typography.bold,
    color: colors.errorDark,
    marginBottom: spacing.xs,
  },
  alertText: {
    fontSize: typography.sm,
    color: colors.errorDark,
    lineHeight: typography.normal * typography.sm,
  },
  alertButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginLeft: spacing.sm,
  },
  alertButtonText: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.error,
    marginRight: spacing.xs,
  },
});
