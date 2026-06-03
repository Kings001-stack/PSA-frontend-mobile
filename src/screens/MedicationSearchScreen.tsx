import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Linking,
  Platform,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import api from "../services/api";
import AnimatedIcon from "../components/AnimatedIcon";
import UserDashboardHeader from "../components/UserDashboardHeader";

interface MedicationAvailability {
  id?: number;
  name: string;
  dosage: string;
  form: string;
  availability: "available" | "limited" | "out_of_stock";
}

const MedicationSearchScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [medications, setMedications] = useState<MedicationAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showRefillModal, setShowRefillModal] = useState(false);
  const [selectedMedication, setSelectedMedication] =
    useState<MedicationAvailability | null>(null);
  const [refillQuantity, setRefillQuantity] = useState("1");
  const [refillNotes, setRefillNotes] = useState("");
  const [isSubmittingRefill, setIsSubmittingRefill] = useState(false);

  const performSearch = useCallback(async (query: string) => {
    setIsLoading(true);
    try {
      const response = await api.get("/medications/search", {
        params: { query },
      });
      setMedications(response.data);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery);
      } else {
        setMedications([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, performSearch]);

  const getStatusDetails = (status: string) => {
    switch (status) {
      case "available":
        return {
          label: "Available",
          color: "#16a34a",
          bg: "#dcfce7",
          icon: "checkmark-circle" as const,
        };
      case "limited":
        return {
          label: "Limited Stock",
          color: "#ea580c",
          bg: "#fed7aa",
          icon: "alert-circle" as const,
        };
      case "out_of_stock":
        return {
          label: "Out of Stock",
          color: "#dc2626",
          bg: "#fee2e2",
          icon: "close-circle" as const,
        };
      default:
        return {
          label: "Unknown",
          color: "#64748b",
          bg: "#f1f5f9",
          icon: "help-circle" as const,
        };
    }
  };

  const handleGoBack = () => {
    try {
      router.back();
    } catch (error) {
      console.error("Navigation error:", error);
      try {
        router.replace("/(user)");
      } catch (fallbackError) {
        console.error("Fallback navigation error:", fallbackError);
      }
    }
  };

  const handleCallPharmacy = () => {
    Linking.openURL("tel:09071906688");
  };

  const handleRequestRefill = (medication: MedicationAvailability) => {
    setSelectedMedication(medication);
    setRefillQuantity("1");
    setRefillNotes("");
    setShowRefillModal(true);
  };

  const submitRefillRequest = async () => {
    if (!selectedMedication || !selectedMedication.id) {
      Alert.alert("Error", "Please select a medication");
      return;
    }

    const qty = parseInt(refillQuantity);
    if (isNaN(qty) || qty < 1) {
      Alert.alert("Invalid Quantity", "Please enter a valid quantity");
      return;
    }

    setIsSubmittingRefill(true);
    try {
      await api.post("/refills", {
        medication_id: selectedMedication.id,
        quantity: qty,
        notes: refillNotes.trim() || "",
        prescription_id: "",
        is_urgent: false,
      });

      Alert.alert(
        "Success",
        "Refill request submitted successfully! You'll be notified when it's ready.",
        [
          {
            text: "OK",
            onPress: () => {
              setShowRefillModal(false);
              setSelectedMedication(null);
              setRefillQuantity("1");
              setRefillNotes("");
            },
          },
        ],
      );
    } catch (error: any) {
      console.error("Refill request failed:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to submit refill request",
      );
    } finally {
      setIsSubmittingRefill(false);
    }
  };

  const renderMedication = ({ item }: { item: MedicationAvailability }) => {
    const status = getStatusDetails(item.availability);
    const isOutOfStock = item.availability === "out_of_stock";
    const isLimited = item.availability === "limited";

    return (
      <View style={styles.medicationCard}>
        <View style={styles.cardHeader}>
          <View style={styles.medIconContainer}>
            <View style={[styles.medIcon, { backgroundColor: status.bg }]}>
              <Ionicons name="medical" size={22} color={status.color} />
            </View>
          </View>

          <View style={styles.medInfo}>
            <Text style={styles.medName}>{item.name}</Text>
            <Text style={styles.medDetails}>
              {item.dosage} • {item.form}
            </Text>
          </View>
        </View>

        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Ionicons name={status.icon} size={14} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.medCardActions}>
          {isOutOfStock ? (
            <TouchableOpacity
              style={styles.callButton}
              onPress={handleCallPharmacy}
              activeOpacity={0.7}
            >
              <Ionicons name="call" size={16} color="white" />
              <Text style={styles.callButtonText}>Call Pharmacy</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={styles.refillButton}
                onPress={() => handleRequestRefill(item)}
                activeOpacity={0.7}
              >
                <Ionicons name="refresh-circle" size={16} color="#2563eb" />
                <Text style={styles.refillButtonText}>Request Refill</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.chatButton}
                onPress={() => router.push("/(user)/chat")}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="chatbubble-ellipses"
                  size={16}
                  color="#64748b"
                />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Enhanced Header */}
      <UserDashboardHeader
        title="Find Medications"
        subtitle="Check availability in real-time"
        showBackButton={true}
      >
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#94a3b8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search medication name..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {isLoading ? (
              <ActivityIndicator size="small" color="#2563eb" />
            ) : searchQuery.length > 0 ? (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle" size={20} color="#9ca3af" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </UserDashboardHeader>

      {/* Results List */}
      <FlatList
        data={medications}
        renderItem={renderMedication}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <AnimatedIcon
              type={searchQuery ? "empty" : "loading"}
              size={120}
              loop={!searchQuery}
            />
            <Text style={styles.emptyTitle}>
              {searchQuery ? "No Results Found" : "Search Medications"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? `No medications found matching "${searchQuery}"`
                : "Enter a medication name to check availability"}
            </Text>
          </View>
        }
      />

      {/* Floating Call Button */}
      <TouchableOpacity
        style={[styles.floatingCallBtn, { bottom: insets.bottom + 90 }]}
        onPress={handleCallPharmacy}
        activeOpacity={0.9}
      >
        <Ionicons name="call" size={24} color="white" />
      </TouchableOpacity>

      {/* Refill Request Modal */}
      <Modal
        visible={showRefillModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowRefillModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowRefillModal(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidingView}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Request Refill</Text>
                  <TouchableOpacity
                    onPress={() => setShowRefillModal(false)}
                    style={styles.modalCloseBtn}
                  >
                    <Ionicons name="close" size={24} color="#64748b" />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={styles.modalScrollView}
                  contentContainerStyle={styles.modalBody}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.selectedMedInfo}>
                    <Ionicons name="medical" size={24} color="#2563eb" />
                    <View style={styles.selectedMedText}>
                      <Text style={styles.selectedMedName}>
                        {selectedMedication?.name}
                      </Text>
                      <Text style={styles.selectedMedDetails}>
                        {selectedMedication?.dosage} •{" "}
                        {selectedMedication?.form}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Quantity</Text>
                    <View style={styles.quantityContainer}>
                      <TouchableOpacity
                        style={styles.quantityBtn}
                        onPress={() => {
                          const current = parseInt(refillQuantity) || 1;
                          if (current > 1)
                            setRefillQuantity((current - 1).toString());
                        }}
                      >
                        <Ionicons name="remove" size={20} color="#2563eb" />
                      </TouchableOpacity>
                      <TextInput
                        style={styles.quantityInput}
                        value={refillQuantity}
                        onChangeText={setRefillQuantity}
                        keyboardType="number-pad"
                      />
                      <TouchableOpacity
                        style={styles.quantityBtn}
                        onPress={() => {
                          const current = parseInt(refillQuantity) || 1;
                          setRefillQuantity((current + 1).toString());
                        }}
                      >
                        <Ionicons name="add" size={20} color="#2563eb" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Notes (Optional)</Text>
                    <TextInput
                      style={styles.notesInput}
                      value={refillNotes}
                      onChangeText={setRefillNotes}
                      placeholder="Any special instructions..."
                      placeholderTextColor="#9ca3af"
                      multiline
                      numberOfLines={3}
                    />
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      isSubmittingRefill && styles.submitButtonDisabled,
                    ]}
                    onPress={submitRefillRequest}
                    disabled={isSubmittingRefill}
                  >
                    {isSubmittingRefill ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <>
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="white"
                        />
                        <Text style={styles.submitButtonText}>
                          Submit Request
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  searchContainer: {
    paddingHorizontal: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 14 : 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#1e293b",
    fontWeight: "500",
  },
  listContent: {
    padding: 20,
  },
  medicationCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#1e3a8a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(30,58,138,0.06)",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  medIconContainer: {
    marginRight: 14,
  },
  medIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  medInfo: {
    flex: 1,
  },
  medName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  medDetails: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
  },
  statusContainer: {
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#334155",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 20,
  },
  floatingCallBtn: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#16a34a",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 100,
  },
  medCardActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  refillButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 6,
  },
  refillButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563eb",
  },
  chatButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  callButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dc2626",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 6,
  },
  callButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "white",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  keyboardAvoidingView: {
    width: "100%",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: "80%",
  },
  modalScrollView: {
    maxHeight: "100%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e293b",
  },
  modalCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBody: {
    paddingHorizontal: 20,
  },
  selectedMedInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  selectedMedText: {
    flex: 1,
  },
  selectedMedName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  selectedMedDetails: {
    fontSize: 13,
    color: "#64748b",
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quantityBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  quantityInput: {
    flex: 1,
    height: 44,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  notesInput: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    fontSize: 15,
    color: "#1e293b",
    minHeight: 80,
    textAlignVertical: "top",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    borderRadius: 12,
    padding: 16,
    gap: 8,
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default MedicationSearchScreen;
