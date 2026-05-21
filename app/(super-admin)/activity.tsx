import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
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

interface Activity {
  id: number;
  event_type: string;
  event_category: string;
  description: string;
  severity: "info" | "warning" | "critical";
  created_at: string;
  user?: {
    name: string;
    email: string;
    role: string;
  };
}

export default function ActivityLog() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetchActivities();
  }, [selectedCategory]);

  const fetchActivities = async () => {
    try {
      const response = await api.get("/super-admin/activity", {
        params: {
          category: selectedCategory !== "all" ? selectedCategory : undefined,
        },
      });

      if (response.data.success) {
        setActivities(response.data.data);
      }
    } catch (error: any) {
      // Silently handle all errors - API endpoint not implemented yet
      setActivities([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchActivities();
  };

  const getEventIcon = (eventType: string) => {
    const iconMap: { [key: string]: any } = {
      login: "log-in",
      logout: "log-out",
      admin_created: "person-add",
      pharmacist_created: "medical",
      user_suspended: "ban",
      user_reactivated: "checkmark-circle",
      user_deleted: "trash",
      failed_login: "warning",
      password_changed: "key",
      settings_updated: "settings",
    };
    return iconMap[eventType] || "information-circle";
  };

  const getSeverityColor = (severity: string) => {
    const severityColors: { [key: string]: string } = {
      info: colors.info,
      warning: colors.warning,
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
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const renderActivity = ({ item }: { item: Activity }) => (
    <TouchableOpacity
      style={styles.activityCard}
      activeOpacity={0.7}
      onPress={() => {
        setNavigating(true);
        setTimeout(() => {
          // Navigate to activity detail if needed
          setNavigating(false);
        }, 300);
      }}
    >
      <View style={styles.activityHeader}>
        <View
          style={[
            styles.activityIcon,
            { backgroundColor: `${getSeverityColor(item.severity)}15` },
          ]}
        >
          <Ionicons
            name={getEventIcon(item.event_type)}
            size={20}
            color={getSeverityColor(item.severity)}
          />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityDescription}>{item.description}</Text>
          {item.user && (
            <View style={styles.activityUser}>
              <Ionicons
                name="person-outline"
                size={12}
                color={colors.textSecondary}
              />
              <Text style={styles.activityUserText}>
                {item.user.name} • {item.user.role}
              </Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.activityFooter}>
        <View
          style={[
            styles.severityBadge,
            { backgroundColor: `${getSeverityColor(item.severity)}15` },
          ]}
        >
          <Text
            style={[
              styles.severityText,
              { color: getSeverityColor(item.severity) },
            ]}
          >
            {item.severity.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.activityTime}>
          {formatTimeAgo(item.created_at)}
        </Text>
      </View>
    </TouchableOpacity>
  );

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
              <Text style={styles.headerTitle}>Activity Log</Text>
              <Text style={styles.headerSubtitle}>
                Monitor system activities
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
          <Text style={styles.loadingText}>Loading activities...</Text>
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
            <Text style={styles.headerTitle}>Activity Log</Text>
            <Text style={styles.headerSubtitle}>Monitor system activities</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.content}>
        {/* Category Filters */}
        <View style={styles.filtersContainer}>
          <Text style={styles.filterLabel}>Category:</Text>
          <View style={styles.filterButtons}>
            {["all", "auth", "user", "security", "system"].map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.filterButton,
                  selectedCategory === category && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedCategory(category)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedCategory === category &&
                      styles.filterButtonTextActive,
                  ]}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Activity List */}
        <FlatList
          data={activities}
          renderItem={renderActivity}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={64} color={colors.gray300} />
              <Text style={styles.emptyText}>No activities found</Text>
              <Text style={styles.emptySubtext}>
                Activity logs will appear here
              </Text>
            </View>
          }
        />
      </View>

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
  filtersContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  filterLabel: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  filterButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: typography.sm,
    fontWeight: typography.medium,
    color: colors.textPrimary,
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  activityCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  activityHeader: {
    flexDirection: "row",
    marginBottom: spacing.md,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityDescription: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    lineHeight: typography.normal * typography.base,
  },
  activityUser: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  activityUserText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  activityFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  severityBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  severityText: {
    fontSize: typography.xs,
    fontWeight: typography.bold,
  },
  activityTime: {
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
