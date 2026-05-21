import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Platform,
  Alert,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useRouter } from "expo-router";
import AnimatedIcon from "../components/AnimatedIcon";
import NotificationBadge from "../components/NotificationBadge";

interface DashboardStats {
  total_medications: number;
  low_stock_count: number;
  total_value: number;
  expiring_soon: number;
  active_adverts?: number;
  pending_refills?: number;
}

interface AlertItem {
  id: number;
  quantity: number;
  medication: {
    id: number;
    name: string;
  };
}

const AdminDashboardScreen: React.FC = () => {
  const { user, logout, refreshUserData } = useContext(AuthContext);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [avatarKey, setAvatarKey] = useState(Date.now());

  const fetchDashboard = async () => {
    if (!user || user.role !== "pharmacist") {
      return;
    }

    try {
      // Updated Endpoint: /admin/dashboard
      const response = await api.get("/admin/dashboard");
      setStats(response.data.stats);
      setAlerts(response.data.low_stock_alerts);
    } catch (error) {
      console.error("Failed to fetch dashboard", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboard();
      setAvatarKey(Date.now()); // Refresh avatar when user changes
    }
  }, [user]);

  // Refresh avatar when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refreshUserData()
        .then(() => {
          setAvatarKey(Date.now());
        })
        .catch((error) => {
          console.error("Failed to refresh user data:", error);
        });
    }, []),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshUserData(); // Refresh user data including avatar
    setAvatarKey(Date.now()); // Force avatar refresh
    fetchDashboard();
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: logout },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <AnimatedIcon type="loading" size={120} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerGlass}>
          <View style={styles.headerTop}>
            <View style={styles.brandContainer}>
              <View style={styles.logoCircle}>
                <Ionicons name="medical" size={20} color="white" />
              </View>
              <View>
                <Text style={styles.brandTitle}>PRIMECHEM</Text>
                <Text style={styles.brandTagline}>EXPERT PHARMACY NETWORK</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.profileIndicator}
                onPress={() => router.push("/(admin)/profile")}
              >
                {user?.avatar_url ? (
                  <Image
                    key={avatarKey}
                    source={{ uri: `${user.avatar_url}?t=${avatarKey}` }}
                    style={styles.avatarMini}
                  />
                ) : (
                  <View style={styles.avatarMini}>
                    <Text style={styles.avatarChar}>
                      {user?.name?.charAt(0) || "A"}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleLogout}
                style={styles.logoutHeaderBtn}
              >
                <Ionicons name="log-out-outline" size={22} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.adminBrief}>
            <View>
              <Text style={styles.roleTag}>PHARMACIST</Text>
              <Text style={styles.adminWelcome}>
                {user?.name || "Pharmacist"}
              </Text>
            </View>
            <View style={styles.activePill}>
              <View style={styles.pulseDot} />
              <Text style={styles.pulseText}>LIVE</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.iconBox, { backgroundColor: "#dbeafe" }]}>
              <Ionicons name="medkit" size={24} color="#2563eb" />
            </View>
            <Text style={styles.statValue}>
              {stats?.total_medications?.toString() || "0"}
            </Text>
            <Text style={styles.statLabel}>Total Meds</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconBox, { backgroundColor: "#fee2e2" }]}>
              <Ionicons name="warning" size={24} color="#dc2626" />
            </View>
            <Text style={styles.statValue}>
              {stats?.low_stock_count?.toString() || "0"}
            </Text>
            <Text style={styles.statLabel}>Low Stock</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconBox, { backgroundColor: "#dcfce7" }]}>
              <Ionicons name="megaphone" size={24} color="#16a34a" />
            </View>
            <Text style={styles.statValue}>
              {stats?.active_adverts?.toString() || "0"}
            </Text>
            <Text style={styles.statLabel}>Active Ads</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconBox, { backgroundColor: "#fef3c7" }]}>
              <Ionicons name="calendar-outline" size={24} color="#d97706" />
            </View>
            <Text style={styles.statValue}>
              {stats?.expiring_soon?.toString() || "0"}
            </Text>
            <Text style={styles.statLabel}>Exp. Soon</Text>
          </View>
        </View>

        {/* Management Actions */}
        <Text style={styles.sectionTitle}>Management</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(admin)/analytics")}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#f0f9ff" }]}>
              <Ionicons name="stats-chart" size={28} color="#0284c7" />
            </View>
            <View>
              <Text style={styles.actionTitle}>Analytics & Reports</Text>
              <Text style={styles.actionSubtitle}>View detailed insights</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#9ca3af"
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(admin)/inventory")}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#eff6ff" }]}>
              <Ionicons name="list" size={28} color="#2563eb" />
            </View>
            <View>
              <Text style={styles.actionTitle}>Manage Inventory</Text>
              <Text style={styles.actionSubtitle}>Update stock levels</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#9ca3af"
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(admin)/adverts")}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#fef3c7" }]}>
              <Ionicons name="megaphone" size={28} color="#eab308" />
            </View>
            <View>
              <Text style={styles.actionTitle}>Adverts & Promotions</Text>
              <Text style={styles.actionSubtitle}>Manage special offers</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#9ca3af"
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(admin)/refills")}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#f0fdf4" }]}>
              <Ionicons name="refresh" size={28} color="#16a34a" />
              {(stats?.pending_refills ?? 0) > 0 && (
                <NotificationBadge
                  count={stats?.pending_refills ?? 0}
                  top={-4}
                  right={-4}
                />
              )}
            </View>
            <View>
              <Text style={styles.actionTitle}>Refill Requests</Text>
              <Text style={styles.actionSubtitle}>
                {(stats?.pending_refills ?? 0) > 0
                  ? `${stats?.pending_refills ?? 0} pending`
                  : "Review patient refills"}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#9ca3af"
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(admin)/user-management")}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#fff7ed" }]}>
              <Ionicons name="people" size={28} color="#ea580c" />
            </View>
            <View>
              <Text style={styles.actionTitle}>User Accounts</Text>
              <Text style={styles.actionSubtitle}>Manage access</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#9ca3af"
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>
        </View>

        {/* Alerts Section - Clickable */}
        {alerts.length > 0 && (
          <TouchableOpacity
            style={styles.alertsContainer}
            onPress={() => router.push("/(admin)/alerts")}
            activeOpacity={0.7}
          >
            <View style={styles.alertHeader}>
              <Ionicons name="alert-circle" size={20} color="#dc2626" />
              <Text style={styles.alertTitle}>Critical Stock Alerts</Text>
              <View style={styles.alertBadgeCount}>
                <Text style={styles.alertBadgeCountText}>{alerts.length}</Text>
              </View>
            </View>
            {alerts.slice(0, 3).map((item) => (
              <View key={item.id} style={styles.alertItem}>
                <Text style={styles.alertName}>
                  {item.medication?.name || "Unknown Medication"}
                </Text>
                <View style={styles.alertBadge}>
                  <Text style={styles.alertBadgeText}>
                    {item.quantity?.toString() || "0"} left
                  </Text>
                </View>
              </View>
            ))}
            {alerts.length > 3 && (
              <View style={styles.viewAllAlertsRow}>
                <Text style={styles.viewAllAlertsText}>
                  View all {alerts.length} alerts
                </Text>
                <Ionicons name="chevron-forward" size={18} color="#dc2626" />
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.actionCard, styles.logoutCard]}
          onPress={handleLogout}
        >
          <View style={[styles.actionIcon, { backgroundColor: "#fef2f2" }]}>
            <Ionicons name="log-out" size={24} color="#dc2626" />
          </View>
          <View>
            <Text style={[styles.actionTitle, { color: "#dc2626" }]}>
              Sign Out
            </Text>
            <Text style={styles.actionSubtitle}>
              Securely exit your account
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 16,
  },
  header: {
    backgroundColor: "#1e3a8a",
    paddingBottom: 32,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    shadowColor: "#1e3a8a",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  headerGlass: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 10 : 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "white",
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: 7,
    fontWeight: "700",
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 1.2,
    marginTop: -2,
  },
  profileBtn: {
    padding: 2,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  avatarMini: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#fbbf24",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarChar: {
    color: "#1e3a8a",
    fontWeight: "bold",
    fontSize: 16,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  profileIndicator: {
    padding: 2,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  logoutHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  adminBrief: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roleTag: {
    fontSize: 10,
    fontWeight: "800",
    color: "rgba(255,255,255,0.6)",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 4,
  },
  adminWelcome: {
    fontSize: 22,
    fontWeight: "700",
    color: "white",
  },
  activePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(52, 211, 153, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(52, 211, 153, 0.3)",
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#34d399",
  },
  pulseText: {
    fontSize: 8,
    fontWeight: "900",
    color: "#34d399",
  },
  scrollContent: {
    padding: 18,
    paddingTop: 16,
    paddingBottom: 100,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
    marginTop: 0,
  },
  statCard: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#1e3a8a",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(30, 58, 138, 0.08)",
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e293b",
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 16,
    paddingLeft: 4,
    marginTop: 16,
  },
  actionRow: {
    marginBottom: 20,
    gap: 12,
  },
  actionCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
  },
  actionSubtitle: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 1,
  },
  alertsContainer: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    borderColor: "#fecaca",
    marginTop: 10,
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#991b1b",
    flex: 1,
  },
  alertBadgeCount: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 28,
    alignItems: "center",
  },
  alertBadgeCountText: {
    fontSize: 12,
    fontWeight: "800",
    color: "white",
  },
  alertItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(190, 18, 60, 0.1)",
  },
  alertName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#881337",
    flex: 1,
  },
  alertBadge: {
    backgroundColor: "white",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fca5a5",
  },
  alertBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#e11d48",
  },
  viewAllAlertsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#fee2e2",
    gap: 6,
  },
  viewAllAlertsText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#dc2626",
  },
  logoutCard: {
    marginTop: 20,
    borderColor: "#fee2e2",
    backgroundColor: "#fffafb",
    borderStyle: "dashed",
  },
});

export default AdminDashboardScreen;
