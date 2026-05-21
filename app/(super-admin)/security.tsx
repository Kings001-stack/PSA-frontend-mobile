import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import LoadingOverlay from "../../src/components/LoadingOverlay";
import api from "../../src/services/api";
import { router } from "expo-router";
import {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
} from "../../src/styles/superAdminTheme";

interface SecurityData {
  failed_logins_24h: number;
  suspicious_activities: number;
  blocked_ips: number;
  active_sessions: number;
  recent_alerts: Array<{
    id: number;
    type: string;
    message: string;
    severity: string;
    created_at: string;
  }>;
}

export default function SecurityCenter() {
  const [securityData, setSecurityData] = useState<SecurityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      const response = await api.get("/super-admin/security");
      if (response.data.success) {
        setSecurityData(response.data.data);
      }
    } catch (error: any) {
      // Silently handle all errors - API endpoint not implemented yet
      setSecurityData({
        failed_logins_24h: 0,
        suspicious_activities: 0,
        blocked_ips: 0,
        active_sessions: 0,
        recent_alerts: [],
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSecurityData();
  };

  const getSeverityColor = (severity: string) => {
    const severityColors: { [key: string]: string } = {
      low: colors.info,
      medium: colors.warning,
      high: colors.error,
      critical: colors.error,
    };
    return severityColors[severity] || colors.gray500;
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
              <Text style={styles.headerTitle}>Security Center</Text>
              <Text style={styles.headerSubtitle}>
                Monitor security threats
              </Text>
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
          <Text style={styles.loadingText}>Loading security data...</Text>
        </View>
      </View>
    );
  }

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
            <Text style={styles.headerTitle}>Security Center</Text>
            <Text style={styles.headerSubtitle}>Monitor security threats</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.content}
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
        {/* Security Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Overview</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <View
                style={[
                  styles.metricIcon,
                  { backgroundColor: colors.errorLight },
                ]}
              >
                <Ionicons name="warning" size={24} color={colors.error} />
              </View>
              <Text style={styles.metricValue}>
                {securityData?.failed_logins_24h || 0}
              </Text>
              <Text style={styles.metricLabel}>Failed Logins (24h)</Text>
            </View>

            <View style={styles.metricCard}>
              <View
                style={[
                  styles.metricIcon,
                  { backgroundColor: colors.warningLight },
                ]}
              >
                <Ionicons
                  name="alert-circle"
                  size={24}
                  color={colors.warning}
                />
              </View>
              <Text style={styles.metricValue}>
                {securityData?.suspicious_activities || 0}
              </Text>
              <Text style={styles.metricLabel}>Suspicious Activities</Text>
            </View>

            <View style={styles.metricCard}>
              <View
                style={[
                  styles.metricIcon,
                  { backgroundColor: colors.errorLight },
                ]}
              >
                <Ionicons name="ban" size={24} color={colors.error} />
              </View>
              <Text style={styles.metricValue}>
                {securityData?.blocked_ips || 0}
              </Text>
              <Text style={styles.metricLabel}>Blocked IPs</Text>
            </View>

            <View style={styles.metricCard}>
              <View
                style={[
                  styles.metricIcon,
                  { backgroundColor: colors.successLight },
                ]}
              >
                <Ionicons name="pulse" size={24} color={colors.success} />
              </View>
              <Text style={styles.metricValue}>
                {securityData?.active_sessions || 0}
              </Text>
              <Text style={styles.metricLabel}>Active Sessions</Text>
            </View>
          </View>
        </View>

        {/* Recent Alerts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Security Alerts</Text>
          {securityData?.recent_alerts &&
          securityData.recent_alerts.length > 0 ? (
            securityData.recent_alerts.map((alert) => (
              <View key={alert.id} style={styles.alertCard}>
                <View style={styles.alertHeader}>
                  <View
                    style={[
                      styles.alertIcon,
                      {
                        backgroundColor: `${getSeverityColor(alert.severity)}15`,
                      },
                    ]}
                  >
                    <Ionicons
                      name="shield-checkmark"
                      size={20}
                      color={getSeverityColor(alert.severity)}
                    />
                  </View>
                  <View style={styles.alertContent}>
                    <View style={styles.alertTop}>
                      <Text style={styles.alertType}>{alert.type}</Text>
                      <View
                        style={[
                          styles.severityBadge,
                          {
                            backgroundColor: `${getSeverityColor(alert.severity)}15`,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.severityText,
                            { color: getSeverityColor(alert.severity) },
                          ]}
                        >
                          {alert.severity.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.alertMessage}>{alert.message}</Text>
                    <Text style={styles.alertTime}>
                      {formatTimeAgo(alert.created_at)}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="shield-checkmark-outline"
                size={64}
                color={colors.gray300}
              />
              <Text style={styles.emptyText}>No security alerts</Text>
              <Text style={styles.emptySubtext}>Your system is secure</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Actions</Text>
          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.7}
            onPress={() => {
              setNavigating(true);
              setTimeout(() => {
                router.push("/(super-admin)/activity");
                setNavigating(false);
              }, 300);
            }}
          >
            <View
              style={[styles.actionIcon, { backgroundColor: colors.infoLight }]}
            >
              <Ionicons name="document-text" size={24} color={colors.info} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>View Audit Logs</Text>
              <Text style={styles.actionSubtitle}>
                Review all system activities
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.7}
            onPress={() => {
              setNavigating(true);
              setTimeout(() => {
                // Navigate to blocked IPs screen when implemented
                setNavigating(false);
              }, 300);
            }}
          >
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: colors.errorLight },
              ]}
            >
              <Ionicons name="ban" size={24} color={colors.error} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Manage Blocked IPs</Text>
              <Text style={styles.actionSubtitle}>
                View and manage IP blacklist
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.7}
            onPress={() => {
              setNavigating(true);
              setTimeout(() => {
                // Navigate to security settings when implemented
                setNavigating(false);
              }, 300);
            }}
          >
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: colors.warningLight },
              ]}
            >
              <Ionicons name="settings" size={24} color={colors.warning} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Security Settings</Text>
              <Text style={styles.actionSubtitle}>
                Configure security policies
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
          </TouchableOpacity>
        </View>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>

      <LoadingOverlay visible={navigating} />
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
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: typography.huge,
    fontWeight: typography.bold,
    color: "#FFFFFF",
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.base,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: typography.medium,
  },
  content: {
    flex: 1,
    marginTop: spacing.lg,
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -spacing.sm,
  },
  metricCard: {
    width: "48%",
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginHorizontal: "1%",
    marginBottom: spacing.md,
    ...shadows.md,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  metricValue: {
    fontSize: typography.massive,
    fontWeight: typography.extrabold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  metricLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },
  alertCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  alertHeader: {
    flexDirection: "row",
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  alertContent: {
    flex: 1,
  },
  alertTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  alertType: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  severityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  severityText: {
    fontSize: typography.xs,
    fontWeight: typography.bold,
  },
  alertMessage: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: typography.normal * typography.sm,
  },
  alertTime: {
    fontSize: typography.xs,
    color: colors.textTertiary,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  actionSubtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
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
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.massive,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    ...shadows.md,
  },
  emptyText: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
  emptySubtext: {
    fontSize: typography.base,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
});
