import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  Platform,
  Modal,
  TextInput,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import api from "../services/api";
import AnimatedIcon from "../components/AnimatedIcon";
import SuccessModal from "../components/SuccessModal";

interface RefillRequest {
  id: number;
  user: { id: number; name: string; email: string } | null;
  medication: { id: number; name: string } | null;
  quantity: number;
  notes: string | null;
  status: "pending" | "approved" | "rejected" | "completed";
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  completed: number;
}

const statusConfig = {
  pending: {
    bg: "#fef3c7",
    text: "#d97706",
    icon: "time" as const,
    label: "Pending",
  },
  approved: {
    bg: "#dcfce7",
    text: "#16a34a",
    icon: "checkmark-circle" as const,
    label: "Approved",
  },
  rejected: {
    bg: "#fee2e2",
    text: "#dc2626",
    icon: "close-circle" as const,
    label: "Rejected",
  },
  completed: {
    bg: "#dbeafe",
    text: "#2563eb",
    icon: "checkmark-done" as const,
    label: "Done",
  },
};

const filterTabs = [
  "all",
  "pending",
  "approved",
  "rejected",
  "completed",
] as const;

const RefillManagementScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refills, setRefills] = useState<RefillRequest[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedRefill, setSelectedRefill] = useState<RefillRequest | null>(
    null,
  );
  const [showActionModal, setShowActionModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [updating, setUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchRefills = useCallback(async () => {
    try {
      console.log("Fetching refills with filter:", activeFilter);
      const response = await api.get(
        `/pharmacist/refills?status=${activeFilter}`,
      );
      console.log("Refills response:", {
        refillsCount: response.data.refills?.length,
        stats: response.data.stats,
      });
      setRefills(response.data.refills);
      setStats(response.data.stats);
    } catch (error) {
      console.error("Failed to fetch refills", error);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    setLoading(true);
    fetchRefills();
  }, [fetchRefills]);

  const handleStatusUpdate = async (
    status: "approved" | "rejected" | "completed",
  ) => {
    if (!selectedRefill) return;
    setUpdating(true);
    try {
      let endpoint = "";
      let payload: any = {};

      if (status === "approved") {
        endpoint = `/pharmacist/refills/${selectedRefill.id}/approve`;
        payload = { admin_notes: adminNotes.trim() || null };
      } else if (status === "rejected") {
        endpoint = `/pharmacist/refills/${selectedRefill.id}/reject`;
        payload = {
          rejection_reason: adminNotes.trim() || "Rejected by pharmacist",
          admin_notes: adminNotes.trim() || null,
        };
      } else if (status === "completed") {
        endpoint = `/pharmacist/refills/${selectedRefill.id}/collected`;
        payload = {};
      }

      console.log("Updating refill status:", { endpoint, payload, status });
      const response = await api.post(endpoint, payload);
      console.log("Status update response:", response.data);

      setShowActionModal(false);
      setAdminNotes("");
      setSelectedRefill(null);

      setSuccessMessage(`Refill request ${status} successfully`);
      setShowSuccess(true);

      // Refresh immediately to show updated status
      await fetchRefills();
    } catch (error: any) {
      console.error("Status update error:", error);
      setErrorMessage(
        error.response?.data?.message || "Failed to update status",
      );
      setShowError(true);
    } finally {
      setUpdating(false);
    }
  };

  const openActions = async (refill: RefillRequest) => {
    console.log("Opening modal for refill:", refill);
    setSelectedRefill(refill);
    setAdminNotes(refill.admin_notes || "");
    setShowActionModal(true);

    // Mark refill as viewed to reset badge count
    try {
      await api.get(`/pharmacist/refills/${refill.id}`);
      // Refresh the refills list to update the viewed status
      fetchRefills();
    } catch (error) {
      console.error("Failed to mark refill as viewed:", error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderRefill = ({ item }: { item: RefillRequest }) => {
    const config = statusConfig[item.status];
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => openActions(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardMed}>
              {item.medication?.name || "Unknown Medication"}
            </Text>
            <Text style={styles.cardUser}>
              <Ionicons name="person-outline" size={12} color="#94a3b8" />{" "}
              {item.user?.name || "Unknown User"}
            </Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: config.bg }]}>
            <Ionicons name={config.icon} size={12} color={config.text} />
            <Text style={[styles.statusLabel, { color: config.text }]}>
              {config.label}
            </Text>
          </View>
        </View>

        <View style={styles.cardMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="cube-outline" size={14} color="#64748b" />
            <Text style={styles.metaText}>Qty: {item.quantity}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color="#64748b" />
            <Text style={styles.metaText}>{formatDate(item.created_at)}</Text>
          </View>
        </View>

        {item.notes && (
          <Text style={styles.cardNote} numberOfLines={2}>
            📌 {item.notes}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={22} color="white" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Refill Requests</Text>
            <Text style={styles.headerSub}>{stats.pending} pending review</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            { label: "Total", value: stats.total, color: "#60a5fa" },
            { label: "Pending", value: stats.pending, color: "#fbbf24" },
            { label: "Approved", value: stats.approved, color: "#34d399" },
            { label: "Rejected", value: stats.rejected, color: "#f87171" },
          ].map((stat, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={[styles.statValue, { color: stat.color }]}>
                {stat.value}
              </Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabRow}>
        {filterTabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeFilter === tab && styles.tabActive]}
            onPress={() => setActiveFilter(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeFilter === tab && styles.tabTextActive,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centerContent}>
          <AnimatedIcon type="loading" size={120} />
          <Text style={styles.loadingText}>Loading refills...</Text>
        </View>
      ) : refills.length === 0 ? (
        <View style={styles.centerContent}>
          <AnimatedIcon type="empty" size={120} />
          <Text style={styles.emptyText}>
            No {activeFilter !== "all" ? activeFilter : ""} refill requests
          </Text>
        </View>
      ) : (
        <FlatList
          data={refills}
          renderItem={renderRefill}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Action Modal */}
      <Modal
        visible={showActionModal}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setShowActionModal(false);
          setSelectedRefill(null);
          setAdminNotes("");
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setShowActionModal(false);
            setSelectedRefill(null);
            setAdminNotes("");
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[
              styles.modalContent,
              { paddingBottom: Math.max(insets.bottom, 16) },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHandle} />

            {selectedRefill ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                bounces={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                <Text style={styles.modalTitle}>Review Request</Text>

                <View style={styles.modalInfoCard}>
                  <Text style={styles.modalInfoLabel}>Medication</Text>
                  <Text style={styles.modalInfoValue}>
                    {selectedRefill.medication?.name || "N/A"}
                  </Text>

                  <Text style={styles.modalInfoLabel}>Requested by</Text>
                  <Text style={styles.modalInfoValue}>
                    {selectedRefill.user?.name || "N/A"} (
                    {selectedRefill.user?.email || "N/A"})
                  </Text>

                  <Text style={styles.modalInfoLabel}>Quantity</Text>
                  <Text style={styles.modalInfoValue}>
                    {selectedRefill.quantity}
                  </Text>

                  {selectedRefill.notes && (
                    <>
                      <Text style={styles.modalInfoLabel}>Patient Notes</Text>
                      <Text style={styles.modalInfoValue}>
                        {selectedRefill.notes}
                      </Text>
                    </>
                  )}
                </View>

                <Text style={styles.formLabel}>Admin Notes</Text>
                <TextInput
                  style={styles.notesInput}
                  value={adminNotes}
                  onChangeText={setAdminNotes}
                  placeholder="Optional response to the patient..."
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={4}
                />

                <View style={styles.actionRow}>
                  {selectedRefill.status === "pending" && (
                    <>
                      <TouchableOpacity
                        style={[
                          styles.actionBtn,
                          { backgroundColor: "#dc2626" },
                        ]}
                        onPress={() => handleStatusUpdate("rejected")}
                        disabled={updating}
                      >
                        <Ionicons name="close" size={18} color="white" />
                        <Text style={styles.actionBtnText}>Reject</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.actionBtn,
                          { backgroundColor: "#16a34a" },
                        ]}
                        onPress={() => handleStatusUpdate("approved")}
                        disabled={updating}
                      >
                        <Ionicons name="checkmark" size={18} color="white" />
                        <Text style={styles.actionBtnText}>Approve</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {selectedRefill.status === "approved" && (
                    <TouchableOpacity
                      style={[
                        styles.actionBtn,
                        { backgroundColor: "#2563eb", flex: 1 },
                      ]}
                      onPress={() => handleStatusUpdate("completed")}
                      disabled={updating}
                    >
                      <Ionicons name="checkmark-done" size={18} color="white" />
                      <Text style={styles.actionBtnText}>Mark Completed</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {updating && (
                  <ActivityIndicator
                    style={{ marginTop: 12 }}
                    color="#2563eb"
                  />
                )}

                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => {
                    setShowActionModal(false);
                    setSelectedRefill(null);
                    setAdminNotes("");
                  }}
                >
                  <Text style={styles.cancelBtnText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            ) : (
              <View style={{ padding: 20, alignItems: "center" }}>
                <AnimatedIcon type="loading" size={100} />
                <Text
                  style={{
                    marginTop: 12,
                    color: "#64748b",
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                >
                  Loading details...
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <SuccessModal
        visible={showSuccess}
        message={successMessage}
        onClose={() => setShowSuccess(false)}
        type="success"
      />

      <SuccessModal
        visible={showError}
        message={errorMessage}
        onClose={() => setShowError(false)}
        type="error"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },

  header: {
    backgroundColor: "#1e3a8a",
    paddingBottom: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: "#1e3a8a",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 12,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "white" },
  headerSub: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "600",
    marginTop: 2,
  },

  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    padding: 10,
    alignItems: "center",
  },
  statValue: { fontSize: 20, fontWeight: "800" },
  statLabel: {
    fontSize: 9,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "700",
    marginTop: 2,
    textTransform: "uppercase",
  },

  tabRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 6,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#e2e8f0",
  },
  tabActive: { backgroundColor: "#2563eb" },
  tabText: { fontSize: 12, fontWeight: "600", color: "#64748b" },
  tabTextActive: { color: "white" },

  listContent: { padding: 16, paddingBottom: 100 },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 8,
  },
  emptyText: { fontSize: 15, color: "#94a3b8", fontWeight: "600" },

  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#1e3a8a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(30,58,138,0.04)",
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardMed: { fontSize: 16, fontWeight: "700", color: "#1e293b" },
  cardUser: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  cardMeta: {
    flexDirection: "row",
    marginTop: 12,
    gap: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, color: "#64748b" },
  cardNote: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 8,
    fontStyle: "italic",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: "90%",
    minHeight: "50%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#e2e8f0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 16,
  },
  modalInfoCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 16,
  },
  modalInfoLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    marginTop: 8,
  },
  modalInfoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginTop: 2,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 8,
  },
  notesInput: {
    backgroundColor: "#f3f4f6",
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    color: "#1e293b",
    minHeight: 70,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 16,
  },
  actionRow: { flexDirection: "row", gap: 12 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionBtnText: { color: "white", fontWeight: "700", fontSize: 14 },
  cancelBtn: {
    marginTop: 16,
    alignItems: "center",
    paddingVertical: 12,
  },
  cancelBtnText: { fontSize: 14, fontWeight: "600", color: "#94a3b8" },
});

export default RefillManagementScreen;
