import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
  StatusBar,
  Platform,
  Modal,
  Animated,
  PanResponder,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import AnimatedIcon from "../components/AnimatedIcon";
import SuccessModal from "../components/SuccessModal";
import UserDashboardHeader from "../components/UserDashboardHeader";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

interface Medication {
  id: number;
  name: string;
  dosage_form?: string;
  strength?: string;
  requires_prescription?: boolean;
}

interface RefillRequest {
  id: number;
  medication_id: number;
  medication: { id: number; name: string } | null;
  quantity: number;
  notes: string | null;
  status:
    | "pending"
    | "approved"
    | "rejected"
    | "completed"
    | "ready_for_pickup"
    | "collected";
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
}

const ImprovedRefillScreen: React.FC = () => {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refills, setRefills] = useState<RefillRequest[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showMedPicker, setShowMedPicker] = useState(false);
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");
  const [medSearch, setMedSearch] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [documentUploading, setDocumentUploading] = useState(false);

  const translateY = new Animated.Value(0);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dy) > 10 && gestureState.dy > 0;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        translateY.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 150) {
        Animated.timing(translateY, {
          toValue: 500,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          if (showMedPicker) {
            setShowMedPicker(false);
            setMedSearch("");
          } else if (showModal) {
            setShowModal(false);
            resetForm();
          }
        });
      } else {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  useEffect(() => {
    fetchRefills();
    fetchMedications();
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log("ImprovedRefillScreen focused, refreshing refills");
      fetchRefills();
    }, []),
  );

  const fetchRefills = async () => {
    try {
      const response = await api.get("/refills");
      setRefills(response.data);

      // Mark any updated refills as viewed by user
      const updatedRefills = response.data.filter(
        (refill: any) =>
          (refill.status === "approved" ||
            refill.status === "rejected" ||
            refill.status === "ready_for_pickup") &&
          refill.reviewed_at &&
          (!refill.user_viewed_at ||
            new Date(refill.reviewed_at) > new Date(refill.user_viewed_at)),
      );

      // Mark each updated refill as viewed
      for (const refill of updatedRefills) {
        try {
          await api.post(`/refills/${refill.id}/viewed`);
        } catch (error) {
          console.error(`Failed to mark refill ${refill.id} as viewed:`, error);
        }
      }
    } catch (error) {
      console.error("Failed to fetch refills", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMedications = async () => {
    try {
      const response = await api.get("/refills/medications");
      setMedications(response.data);
    } catch (error) {
      console.error("Failed to fetch medications", error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMed) {
      Alert.alert("Missing Field", "Please select a medication");
      return;
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 1) {
      Alert.alert("Invalid Quantity", "Please enter a valid quantity");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("medication_id", selectedMed.id.toString());
      formData.append("quantity", qty.toString());
      formData.append("notes", notes.trim() || "");
      formData.append("prescription_id", "");
      formData.append("is_urgent", "0"); // Send as 0 for false, 1 for true

      // Add prescription document if selected
      if (selectedDocument) {
        formData.append("prescription_document", {
          uri: selectedDocument.uri,
          type: selectedDocument.mimeType || "image/jpeg",
          name: selectedDocument.name || "prescription.jpg",
        } as any);
      }

      await api.post("/refills", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setShowModal(false);
      resetForm();
      setShowSuccess(true);
      setTimeout(() => {
        fetchRefills();
      }, 500);
    } catch (error: any) {
      console.error("Submit error:", error);
      console.error("Error response:", error.response?.data);

      let errorMessage = "Failed to submit refill request";
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        errorMessage = Array.isArray(errors)
          ? errors.join("\n")
          : JSON.stringify(errors);
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedMed(null);
    setQuantity("1");
    setNotes("");
    setMedSearch("");
    setSelectedDocument(null);
  };

  const pickDocument = async () => {
    try {
      setDocumentUploading(true);

      Alert.alert(
        "Select Prescription",
        "Choose how you want to upload your prescription",
        [
          {
            text: "Camera",
            onPress: async () => {
              const { status } =
                await ImagePicker.requestCameraPermissionsAsync();
              if (status !== "granted") {
                Alert.alert(
                  "Permission needed",
                  "Camera permission is required",
                );
                return;
              }

              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
              });

              if (!result.canceled && result.assets[0]) {
                setSelectedDocument({
                  uri: result.assets[0].uri,
                  name: "prescription_photo.jpg",
                  mimeType: "image/jpeg",
                });
              }
            },
          },
          {
            text: "Photo Library",
            onPress: async () => {
              const { status } =
                await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (status !== "granted") {
                Alert.alert(
                  "Permission needed",
                  "Photo library permission is required",
                );
                return;
              }

              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
              });

              if (!result.canceled && result.assets[0]) {
                setSelectedDocument({
                  uri: result.assets[0].uri,
                  name: "prescription_image.jpg",
                  mimeType: "image/jpeg",
                });
              }
            },
          },
          {
            text: "Documents",
            onPress: async () => {
              const result = await DocumentPicker.getDocumentAsync({
                type: ["image/*", "application/pdf"],
                copyToCacheDirectory: true,
              });

              if (!result.canceled && result.assets[0]) {
                setSelectedDocument({
                  uri: result.assets[0].uri,
                  name: result.assets[0].name,
                  mimeType: result.assets[0].mimeType,
                });
              }
            },
          },
          { text: "Cancel", style: "cancel" },
        ],
      );
    } catch (error) {
      console.error("Document picker error:", error);
      Alert.alert("Error", "Failed to pick document");
    } finally {
      setDocumentUploading(false);
    }
  };

  const filteredMeds = medications.filter((med) =>
    med.name.toLowerCase().includes(medSearch.toLowerCase()),
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <AnimatedIcon type="loading" size={120} />
        <Text style={styles.loadingText}>Loading refills...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2563eb" />

      <UserDashboardHeader
        title="Medication Refills"
        subtitle="Request & track prescriptions"
        showBackButton={true}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowModal(true)}
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      {refills.length === 0 ? (
        <ScrollView contentContainerStyle={styles.emptyState}>
          <AnimatedIcon type="empty" size={140} />
          <Text style={styles.emptyText}>No refill requests yet</Text>
          <Text style={styles.emptySubtext}>
            Tap the blue + button to request a medication refill
          </Text>
        </ScrollView>
      ) : (
        <FlatList
          data={refills}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 100 },
          ]}
          renderItem={({ item }) => (
            <View style={styles.refillCard}>
              <View style={styles.refillHeader}>
                <Text style={styles.medName}>
                  {item.medication?.name || "Unknown"}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(item.status).bg },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(item.status).text },
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>
              <Text style={styles.refillDetail}>Quantity: {item.quantity}</Text>
              {item.notes && (
                <Text style={styles.refillNotes}>Notes: {item.notes}</Text>
              )}
              <Text style={styles.refillDate}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
          )}
        />
      )}

      {/* New Refill Modal */}
      <Modal
        visible={showModal && !showMedPicker}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setShowModal(false);
          resetForm();
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => {
              setShowModal(false);
              resetForm();
            }}
          >
            <Animated.View
              style={[
                styles.modalContent,
                {
                  transform: [{ translateY }],
                },
              ]}
            >
              <View style={styles.modalHandle} {...panResponder.panHandlers} />

              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>New Refill Request</Text>
                  <Text style={styles.modalSubtitle}>
                    Fill in the details below
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  style={styles.closeBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.formScroll}
                contentContainerStyle={styles.formScrollContent}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>
                    <Ionicons name="medical" size={14} color="#2563eb" />{" "}
                    Medication *
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.pickerButton,
                      selectedMed && styles.pickerButtonSelected,
                    ]}
                    onPress={() => setShowMedPicker(true)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.pickerContent}>
                      <Ionicons
                        name={
                          selectedMed ? "checkmark-circle" : "ellipse-outline"
                        }
                        size={20}
                        color={selectedMed ? "#2563eb" : "#cbd5e1"}
                      />
                      <Text
                        style={[
                          styles.pickerText,
                          selectedMed && styles.pickerTextSelected,
                        ]}
                      >
                        {selectedMed?.name || "Select a medication..."}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#9ca3af"
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>
                    <Ionicons name="cube" size={14} color="#2563eb" /> Quantity
                    *
                  </Text>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      style={styles.quantityBtn}
                      onPress={() => {
                        const current = parseInt(quantity) || 1;
                        if (current > 1) setQuantity((current - 1).toString());
                      }}
                    >
                      <Ionicons name="remove" size={20} color="#2563eb" />
                    </TouchableOpacity>
                    <TextInput
                      style={styles.quantityInput}
                      value={quantity}
                      onChangeText={setQuantity}
                      keyboardType="number-pad"
                    />
                    <TouchableOpacity
                      style={styles.quantityBtn}
                      onPress={() => {
                        const current = parseInt(quantity) || 1;
                        setQuantity((current + 1).toString());
                      }}
                    >
                      <Ionicons name="add" size={20} color="#2563eb" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>
                    <Ionicons name="document-text" size={14} color="#2563eb" />{" "}
                    Notes (Optional)
                  </Text>
                  <TextInput
                    style={styles.notesInput}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Any special instructions..."
                    placeholderTextColor="#9ca3af"
                    multiline
                    numberOfLines={4}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>
                    <Ionicons name="camera" size={14} color="#2563eb" />{" "}
                    Prescription Document (Optional)
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.documentButton,
                      selectedDocument && styles.documentButtonSelected,
                    ]}
                    onPress={pickDocument}
                    disabled={documentUploading}
                    activeOpacity={0.7}
                  >
                    <View style={styles.documentContent}>
                      {documentUploading ? (
                        <ActivityIndicator size="small" color="#2563eb" />
                      ) : (
                        <Ionicons
                          name={
                            selectedDocument
                              ? "document-attach"
                              : "camera-outline"
                          }
                          size={20}
                          color={selectedDocument ? "#2563eb" : "#9ca3af"}
                        />
                      )}
                      <Text
                        style={[
                          styles.documentText,
                          selectedDocument && styles.documentTextSelected,
                        ]}
                      >
                        {selectedDocument
                          ? selectedDocument.name || "Document selected"
                          : "Upload prescription photo/document"}
                      </Text>
                    </View>
                    {selectedDocument && (
                      <TouchableOpacity
                        onPress={() => setSelectedDocument(null)}
                        style={styles.removeDocBtn}
                      >
                        <Ionicons
                          name="close-circle"
                          size={20}
                          color="#dc2626"
                        />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                  <Text style={styles.formatHint}>
                    Accepted formats: JPG, PNG, PDF (Max 5MB)
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    submitting && styles.submitBtnDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={submitting}
                  activeOpacity={0.8}
                >
                  {submitting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Ionicons name="paper-plane" size={20} color="white" />
                      <Text style={styles.submitText}>Submit Request</Text>
                    </>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </Animated.View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Medication Picker Modal */}
      <Modal
        visible={showMedPicker}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setShowMedPicker(false);
          setMedSearch("");
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.medPickerContent}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Select Medication</Text>
                <Text style={styles.modalSubtitle}>
                  {medications.length} available
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setShowMedPicker(false);
                  setMedSearch("");
                }}
                style={styles.closeBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color="#9ca3af" />
              <TextInput
                style={styles.searchInput}
                value={medSearch}
                onChangeText={setMedSearch}
                placeholder="Search medications..."
                placeholderTextColor="#9ca3af"
                autoFocus
              />
              {medSearch.length > 0 && (
                <TouchableOpacity onPress={() => setMedSearch("")}>
                  <Ionicons name="close-circle" size={20} color="#9ca3af" />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={filteredMeds}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.medItem,
                    selectedMed?.id === item.id && styles.medItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedMed(item);
                    setShowMedPicker(false);
                    setMedSearch("");
                  }}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.medCheckbox,
                      selectedMed?.id === item.id && styles.medCheckboxSelected,
                    ]}
                  >
                    {selectedMed?.id === item.id && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </View>
                  <View style={styles.medInfo}>
                    <Text
                      style={[
                        styles.medItemText,
                        selectedMed?.id === item.id &&
                          styles.medItemTextSelected,
                      ]}
                    >
                      {item.name}
                    </Text>
                    {(item.dosage_form || item.strength) && (
                      <Text style={styles.medItemSubtext}>
                        {item.strength} {item.dosage_form}
                      </Text>
                    )}
                  </View>
                  {selectedMed?.id === item.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#2563eb"
                    />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyMedList}>
                  <AnimatedIcon type="empty" size={100} />
                  <Text style={styles.emptyMedText}>No medications found</Text>
                  <Text style={styles.emptyMedSubtext}>
                    Try a different search term
                  </Text>
                </View>
              }
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          </View>
        </View>
      </Modal>

      <SuccessModal
        visible={showSuccess}
        message="Refill request submitted successfully!"
        onClose={() => setShowSuccess(false)}
        type="success"
      />
    </View>
  );
};

const getStatusColor = (status: string) => {
  const colors: any = {
    pending: { bg: "#fef3c7", text: "#d97706" },
    approved: { bg: "#dcfce7", text: "#16a34a" },
    rejected: { bg: "#fee2e2", text: "#dc2626" },
    completed: { bg: "#dbeafe", text: "#2563eb" },
    ready_for_pickup: { bg: "#e0e7ff", text: "#4f46e5" },
    collected: { bg: "#f3e8ff", text: "#7c3aed" },
  };
  return colors[status] || colors.pending;
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
  fab: {
    position: "absolute",
    bottom: 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
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
  listContent: {
    padding: 16,
  },
  refillCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  refillHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  medName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  refillDetail: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
  },
  refillNotes: {
    fontSize: 13,
    color: "#94a3b8",
    marginTop: 4,
    fontStyle: "italic",
  },
  refillDate: {
    fontSize: 12,
    color: "#cbd5e1",
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 12,
    paddingHorizontal: 20,
    height: "90%",
  },
  medPickerContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
    height: "80%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#e2e8f0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1e293b",
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "600",
    marginTop: 2,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  formScroll: {
    flex: 1,
  },
  formScrollContent: {
    paddingBottom: 40,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 10,
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  pickerButtonSelected: {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
  },
  pickerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  pickerText: {
    fontSize: 15,
    color: "#94a3b8",
  },
  pickerTextSelected: {
    color: "#1e293b",
    fontWeight: "600",
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
    minHeight: 100,
    textAlignVertical: "top",
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    borderRadius: 16,
    padding: 16,
    gap: 8,
    marginTop: 10,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#1e293b",
  },
  medItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  medItemSelected: {
    backgroundColor: "#eff6ff",
    borderColor: "#2563eb",
  },
  medCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  medCheckboxSelected: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  medInfo: {
    flex: 1,
  },
  medItemText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
  },
  medItemTextSelected: {
    color: "#2563eb",
  },
  medItemSubtext: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  emptyMedList: {
    alignItems: "center",
    padding: 40,
  },
  emptyMedText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#64748b",
    marginTop: 12,
  },
  emptyMedSubtext: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 4,
  },
  documentButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
  },
  documentButtonSelected: {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
    borderStyle: "solid",
  },
  documentContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  documentText: {
    fontSize: 14,
    color: "#9ca3af",
  },
  documentTextSelected: {
    color: "#1e293b",
    fontWeight: "600",
  },
  removeDocBtn: {
    padding: 4,
  },
  formatHint: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 6,
    fontStyle: "italic",
  },
});

export default ImprovedRefillScreen;
