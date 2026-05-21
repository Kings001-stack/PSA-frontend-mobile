import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import api from "../services/api";
import AnimatedIcon from "../components/AnimatedIcon";

interface AlertItem {
  id: number;
  medication: {
    id: number;
    name: string;
  };
  current_quantity: number;
  reorder_level: number;
  alert_type: "low_stock" | "out_of_stock" | "expiring_soon" | "expired";
  created_at: string;
}

interface AlertStatistics {
  total_unresolved: number;
  low_stock: number;
  out_of_stock: number;
  expiring_soon: number;
  expired: number;
}

const LowStockAlertsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [statistics, setStatistics] = useState<AlertStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  useEffect(() => {
    fetchAlerts();
  }, [selectedFilter]);

  const fetchAlerts = async () => {
    try {
      const params = selectedFilter !== "all" ? `?type=${selectedFilter}` : "";
      const response = await api.get(`/admin/alerts${params}`);
      setAlerts(response.data.alerts);
      setStatistics(response.data.statistics);
    } catch (error) {
      console.error("Failed to fetch alerts", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAlerts();
  };

  const handleResolveAlert = async (alertId: number) => {
    Alert.alert("Resolve Alert", "Mark this alert as resolved?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Resolve",
        onPress: async () => {
          try {
            await api.post(`/admin/alerts/${alertId}/resolve`);
            fetchAlerts();
            Alert.alert("Success", "Alert resolved successfully");
          } catch (error) {
            console.error("Failed to resolve alert", error);
            Alert.alert("Error", "Failed to resolve alert");
          }
        },
      },
    ]);
  };

  const handleCheckAlerts = async () => {
    try {
      setLoading(true);
      const response = await api.post("/admin/alerts/check");
      fetchAlerts();
      Alert.alert(
        "Alert Check Complete",
        `Found ${response.data.new_alerts} new alerts`,
      );
    } catch (error) {
      console.error("Failed to check alerts", error);
      Alert.alert("Error", "Failed to check for alerts");
    } finally {
      setLoading(false);
    }
  };

  const getAlertColor = (type: string) => {
    const colors: any = {
      low_stock: { bg: "#fef3c7", text: "#d97706", icon: "warning" },
      out_of_stock: { bg: "#fee2e2", text: "#dc2626", icon: "close-circle" },
      expiring_soon: { bg: "#fef3c7", text: "#ea580c", icon: "time" },
      expired: { bg: "#fee2e2", text: "#991b1b", icon: "alert-circle" },
    };
    return colors[type] || colors.low_stock;
  };

  const getAlertLabel = (type: string) => {
    const labels: any = {
      low_stock: "Low Stock",
      out_of_stock: "Out of Stock",
      expiring_soon: "Expiring Soon",
      expired: "Expired",
    };
    return labels[type] || type;
  };

  const renderAlert = ({ item }: { item: AlertItem }) => {
    const alertStyle = getAlertColor(item.alert_type);

    return (
      <View style={styles.alertCard}>
        <View style={styles.alertHeader}>
          <View style={styles.alertTitleRow}>
            <Ionicons
              name={alertStyle.icon}
              size={24}
              color={alertStyle.text}
            />
            <View style={styles.alertTitleContainer}>
              <Text style={styles.medicationName}>
                {item.medication?.name || "Unknown Medication"}
              </Text>
              <View
                style={[styles.alertBadge, { backgroundColor: alertStyle.bg }]}
              >
                <Text
                  style={[styles.alertBadgeText, { color: alertStyle.text }]}
                >
                  {getAlertLabel(item.alert_type)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.alertDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="cube-outline" size={16} color="#64748b" />
            <Text style={styles.detailText}>
              Current: {item.current_quantity} units
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="refresh-outline" size={16} color="#64748b" />
            <Text style={styles.detailText}>
              Reorder Level: {item.reorder_level} units
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#64748b" />
            <Text style={styles.detailText}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.resolveButton}
          onPress={() => handleResolveAlert(item.id)}
          activeOpacity={0.7}
        >
          <Ionicons name="checkmark-circle" size={20} color="white" />
          <Text style={styles.resolveButtonText}>Resolve</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <AnimatedIcon type="loading" size={120} />
        <Text style={styles.loadingText}>Loading alerts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Stock Alerts</Text>
            <Text style={styles.headerSubtitle}>
              {statistics?.total_unresolved || 0} unresolved alerts
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleCheckAlerts}
            style={styles.refreshBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="sync" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {statistics && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="warning" size={24} color="#d97706" />
            <Text style={styles.statNumber}>{statistics.low_stock}</Text>
            <Text style={styles.statLabel}>Low Stock</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="close-circle" size={24} color="#dc2626" />
            <Text style={styles.statNumber}>{statistics.out_of_stock}</Text>
            <Text style={styles.statLabel}>Out of Stock</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time" size={24} color="#ea580c" />
            <Text style={styles.statNumber}>{statistics.expiring_soon}</Text>
            <Text style={styles.statLabel}>Expiring</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="alert-circle" size={24} color="#991b1b" />
            <Text style={styles.statNumber}>{statistics.expired}</Text>
            <Text style={styles.statLabel}>Expired</Text>
          </View>
        </View>
      )}

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedFilter === "all" && styles.filterChipActive,
          ]}
          onPress={() => setSelectedFilter("all")}
        >
          <Text
            style={[
              styles.filterChipText,
              selectedFilter === "all" && styles.filterChipTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedFilter === "low_stock" && styles.filterChipActive,
          ]}
          onPress={() => setSelectedFilter("low_stock")}
        >
          <Text
            style={[
              styles.filterChipText,
              selectedFilter === "low_stock" && styles.filterChipTextActive,
            ]}
          >
            Low Stock
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedFilter === "out_of_stock" && styles.filterChipActive,
          ]}
          onPress={() => setSelectedFilter("out_of_stock")}
        >
          <Text
            style={[
              styles.filterChipText,
              selectedFilter === "out_of_stock" && styles.filterChipTextActive,
            ]}
          >
            Out of Stock
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedFilter === "expiring_soon" && styles.filterChipActive,
          ]}
          onPress={() => setSelectedFilter("expiring_soon")}
        >
          <Text
            style={[
              styles.filterChipText,
              selectedFilter === "expiring_soon" && styles.filterChipTextActive,
            ]}
          >
            Expiring
          </Text>
        </TouchableOpacity>
      </View>

      {alerts.length === 0 ? (
        <View style={styles.emptyState}>
          <AnimatedIcon type="success" size={140} />
          <Text style={styles.emptyText}>No alerts found</Text>
          <Text style={styles.emptySubtext}>
            All inventory levels are healthy!
          </Text>
        </View>
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderAlert}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 20 },
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 16,
  },
  header: {
    backgroundColor: "#dc2626",
    paddingBottom: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1e293b",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 4,
    textAlign: "center",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  filterChipActive: {
    backgroundColor: "#dc2626",
    borderColor: "#dc2626",
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
  },
  filterChipTextActive: {
    color: "white",
  },
  listContent: {
    padding: 16,
  },
  alertCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  alertHeader: {
    marginBottom: 12,
  },
  alertTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  alertTitleContainer: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  alertBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  alertBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  alertDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#64748b",
  },
  resolveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16a34a",
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  resolveButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "white",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#64748b",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 8,
  },
});

export default LowStockAlertsScreen;
