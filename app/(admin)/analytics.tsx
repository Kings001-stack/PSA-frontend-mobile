import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
} from "react-native-chart-kit";
import api from "../../src/services/api";
import { AuthContext } from "../../src/context/AuthContext";

const screenWidth = Dimensions.get("window").width;

interface AnalyticsData {
  overview: any;
  conversations: any;
  inventory: any;
  refills: any;
  medications: any;
  users: any;
  trends: any;
}

const AnalyticsScreen: React.FC = () => {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<
    "overview" | "trends" | "inventory"
  >("overview");

  const fetchAnalytics = async () => {
    try {
      const response = await api.get("/admin/analytics");
      console.log("Analytics response:", response.data); // Debug log
      // Handle both direct data and wrapped response
      const analyticsData = response.data.data || response.data;
      setData(analyticsData);
    } catch (error) {
      console.error("Failed to fetch analytics", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#2563eb",
    },
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!data || !data.overview || !data.trends) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="analytics-outline" size={64} color="#cbd5e1" />
        <Text style={{ fontSize: 16, color: "#64748b", marginTop: 16 }}>
          No analytics data available
        </Text>
        <TouchableOpacity
          onPress={onRefresh}
          style={{
            marginTop: 16,
            paddingHorizontal: 20,
            paddingVertical: 10,
            backgroundColor: "#2563eb",
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Prepare chart data with safety checks
  const conversationTrendData = {
    labels: (data.trends?.last_7_days || []).map((d: any) => {
      const date = new Date(d.date);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }),
    datasets: [
      {
        data: (data.trends?.last_7_days || []).map(
          (d: any) => d.conversations || 0,
        ),
        color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  const refillTrendData = {
    labels: (data.trends?.last_7_days || []).map((d: any) => {
      const date = new Date(d.date);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }),
    datasets: [
      {
        data: (data.trends?.last_7_days || []).map((d: any) => d.refills || 0),
      },
    ],
  };

  const stockDistributionData = [
    {
      name: "In Stock",
      population: data.inventory?.stock_distribution?.in_stock || 0,
      color: "#10b981",
      legendFontColor: "#64748b",
      legendFontSize: 12,
    },
    {
      name: "Low Stock",
      population: data.inventory?.stock_distribution?.low_stock || 0,
      color: "#f59e0b",
      legendFontColor: "#64748b",
      legendFontSize: 12,
    },
    {
      name: "Out of Stock",
      population: data.inventory?.stock_distribution?.out_of_stock || 0,
      color: "#ef4444",
      legendFontColor: "#64748b",
      legendFontSize: 12,
    },
  ];

  const conversationStatusData = Object.entries(
    data.conversations?.by_status || {},
  ).map(([key, value]: any, index) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    population: value,
    color: ["#2563eb", "#10b981", "#f59e0b"][index] || "#64748b",
    legendFontColor: "#64748b",
    legendFontSize: 12,
  }));

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={22} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Ionicons name="stats-chart" size={24} color="white" />
            <Text style={styles.headerTitle}>Analytics</Text>
          </View>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
            <Ionicons name="refresh" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "overview" && styles.activeTab]}
          onPress={() => setSelectedTab("overview")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "overview" && styles.activeTabText,
            ]}
          >
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "trends" && styles.activeTab]}
          onPress={() => setSelectedTab("trends")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "trends" && styles.activeTabText,
            ]}
          >
            Trends
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "inventory" && styles.activeTab]}
          onPress={() => setSelectedTab("inventory")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "inventory" && styles.activeTabText,
            ]}
          >
            Inventory
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {selectedTab === "overview" && (
          <>
            {/* Key Metrics */}
            <Text style={styles.sectionTitle}>Key Metrics</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <View
                  style={[styles.metricIcon, { backgroundColor: "#dbeafe" }]}
                >
                  <Ionicons name="chatbubbles" size={20} color="#2563eb" />
                </View>
                <Text style={styles.metricValue}>
                  {data.overview?.total_conversations || 0}
                </Text>
                <Text style={styles.metricLabel}>Conversations</Text>
              </View>

              <View style={styles.metricCard}>
                <View
                  style={[styles.metricIcon, { backgroundColor: "#dcfce7" }]}
                >
                  <Ionicons name="people" size={20} color="#16a34a" />
                </View>
                <Text style={styles.metricValue}>
                  {data.overview?.total_users || 0}
                </Text>
                <Text style={styles.metricLabel}>Users</Text>
              </View>

              <View style={styles.metricCard}>
                <View
                  style={[styles.metricIcon, { backgroundColor: "#fef3c7" }]}
                >
                  <Ionicons name="medkit" size={20} color="#d97706" />
                </View>
                <Text style={styles.metricValue}>
                  {data.overview?.total_medications || 0}
                </Text>
                <Text style={styles.metricLabel}>Medications</Text>
              </View>

              <View style={styles.metricCard}>
                <View
                  style={[styles.metricIcon, { backgroundColor: "#fee2e2" }]}
                >
                  <Ionicons name="warning" size={20} color="#dc2626" />
                </View>
                <Text style={styles.metricValue}>
                  {data.overview?.low_stock_count || 0}
                </Text>
                <Text style={styles.metricLabel}>Low Stock</Text>
              </View>
            </View>

            {/* Conversation Status Distribution */}
            {conversationStatusData.length > 0 && (
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Conversation Status</Text>
                <PieChart
                  data={conversationStatusData}
                  width={screenWidth - 60}
                  height={200}
                  chartConfig={chartConfig}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
              </View>
            )}

            {/* Stats Cards */}
            <View style={styles.statsCard}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Escalation Rate</Text>
                <Text style={styles.statValue}>
                  {data.conversations?.escalation_rate || 0}%
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Avg Messages/Chat</Text>
                <Text style={styles.statValue}>
                  {data.conversations?.avg_messages_per_conversation || 0}
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Refill Approval Rate</Text>
                <Text style={styles.statValue}>
                  {data.refills?.approval_rate || 0}%
                </Text>
              </View>
            </View>
          </>
        )}

        {selectedTab === "trends" && (
          <>
            {/* Conversation Trend */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Conversations (Last 7 Days)</Text>
              <LineChart
                data={conversationTrendData}
                width={screenWidth - 60}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />
            </View>

            {/* Refill Requests Trend */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>
                Refill Requests (Last 7 Days)
              </Text>
              <BarChart
                data={refillTrendData}
                width={screenWidth - 60}
                height={220}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                }}
                style={styles.chart}
                yAxisLabel=""
                yAxisSuffix=""
              />
            </View>

            {/* Top Requested Medications */}
            {data.refills?.top_requested &&
              data.refills.top_requested.length > 0 && (
                <View style={styles.listCard}>
                  <Text style={styles.chartTitle}>
                    Top Requested Medications
                  </Text>
                  {data.refills.top_requested
                    .slice(0, 5)
                    .map((item: any, index: number) => (
                      <View key={index} style={styles.listItem}>
                        <View style={styles.listItemLeft}>
                          <View style={styles.rankBadge}>
                            <Text style={styles.rankText}>{index + 1}</Text>
                          </View>
                          <Text style={styles.listItemName}>{item.name}</Text>
                        </View>
                        <Text style={styles.listItemValue}>
                          {item.count} requests
                        </Text>
                      </View>
                    ))}
                </View>
              )}
          </>
        )}

        {selectedTab === "inventory" && (
          <>
            {/* Stock Distribution */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Stock Distribution</Text>
              <PieChart
                data={stockDistributionData}
                width={screenWidth - 60}
                height={200}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </View>

            {/* Inventory Summary */}
            <View style={styles.statsCard}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Total Items</Text>
                <Text style={styles.statValue}>
                  {data.inventory?.total_items || 0}
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Total Value</Text>
                <Text style={styles.statValue}>
                  ₦{(data.inventory?.total_value || 0).toLocaleString()}
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Expiring Soon</Text>
                <Text style={[styles.statValue, { color: "#dc2626" }]}>
                  {data.inventory?.expiring_soon || 0}
                </Text>
              </View>
            </View>

            {/* Top Medications by Stock */}
            {data.inventory?.top_medications &&
              data.inventory.top_medications.length > 0 && (
                <View style={styles.listCard}>
                  <Text style={styles.chartTitle}>
                    Top Medications by Stock
                  </Text>
                  {data.inventory.top_medications
                    .slice(0, 5)
                    .map((item: any, index: number) => (
                      <View key={index} style={styles.listItem}>
                        <View style={styles.listItemLeft}>
                          <View style={styles.rankBadge}>
                            <Text style={styles.rankText}>{index + 1}</Text>
                          </View>
                          <Text style={styles.listItemName}>{item.name}</Text>
                        </View>
                        <View style={styles.listItemRight}>
                          <Text style={styles.listItemValue}>
                            {item.quantity} units
                          </Text>
                          <Text style={styles.listItemSubValue}>
                            ₦{(item.value || 0).toLocaleString()}
                          </Text>
                        </View>
                      </View>
                    ))}
                </View>
              )}
          </>
        )}
      </ScrollView>
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
  },
  header: {
    backgroundColor: "#1e3a8a",
    paddingBottom: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: "#1e3a8a",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 10 : 20,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: "#2563eb",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
  },
  activeTabText: {
    color: "white",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chartCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
  },
  listCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  listItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
  },
  rankText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#2563eb",
  },
  listItemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    flex: 1,
  },
  listItemRight: {
    alignItems: "flex-end",
  },
  listItemValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
  },
  listItemSubValue: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 2,
  },
});

export default AnalyticsScreen;
