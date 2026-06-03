import React, {
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Alert,
  Linking,
  ActivityIndicator,
  TextInput,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import AdvertCarousel from "../components/AdvertCarousel";
import DesignSystem from "../theme/designSystem";
import UserDashboardHeader from "../components/UserDashboardHeader";
import api from "../services/api";

interface MedicationAvailability {
  id?: number;
  name: string;
  dosage: string;
  form: string;
  availability: "available" | "limited" | "out_of_stock";
}

const UserHomeScreen: React.FC = () => {
  const { user, logout, refreshUserData } = useContext(AuthContext);
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [avatarKey, setAvatarKey] = useState(Date.now());
  const [avatarLoading, setAvatarLoading] = useState(false);
  const isRefreshing = useRef(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [medications, setMedications] = useState<MedicationAvailability[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showRefillModal, setShowRefillModal] = useState(false);
  const [selectedMedication, setSelectedMedication] =
    useState<MedicationAvailability | null>(null);
  const [refillQuantity, setRefillQuantity] = useState("1");
  const [refillNotes, setRefillNotes] = useState("");
  const [isSubmittingRefill, setIsSubmittingRefill] = useState(false);

  useEffect(() => {
    // Only update if avatar URL actually changed
    if (user?.avatar_url !== avatarUrl) {
      console.log("User avatar URL changed:", user?.avatar_url);
      const newKey = Date.now();
      setAvatarUrl(user?.avatar_url || null);
      setImageError(false);
      setAvatarKey(newKey);
      setAvatarLoading(false);
    }
  }, [user?.avatar_url]);

  useFocusEffect(
    React.useCallback(() => {
      // Prevent multiple simultaneous refreshes
      if (isRefreshing.current) {
        console.log("Already refreshing, skipping...");
        return;
      }

      console.log("UserHomeScreen focused - refreshing user data");
      isRefreshing.current = true;
      let isMounted = true;

      refreshUserData()
        .then((freshUser) => {
          if (freshUser && isMounted) {
            console.log("Fresh user data received:", freshUser);
            console.log("Fresh avatar_url:", freshUser.avatar_url);
            const newKey = Date.now();
            setAvatarUrl(freshUser.avatar_url || null);
            setImageError(false);
            setAvatarKey(newKey);
          }
        })
        .catch((error) => {
          console.error("Failed to refresh user data:", error);
          if (isMounted) {
            setAvatarUrl(user?.avatar_url || null);
            setImageError(false);
            setAvatarKey(Date.now());
          }
        })
        .finally(() => {
          if (isMounted) {
            isRefreshing.current = false;
          }
        });

      return () => {
        isMounted = false;
        isRefreshing.current = false;
      };
    }, []),
  );

  const navigateToChat = () => {
    router.push("/(user)/chat");
  };

  const performSearch = useCallback(async (query: string) => {
    setIsSearching(true);
    try {
      const response = await api.get("/medications/search", {
        params: { query },
      });
      setMedications(response.data);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsSearching(false);
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

  const handleCall = () => {
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

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={DesignSystem.colors.primary[700]}
      />

      {/* Header */}
      <UserDashboardHeader
        title="PrimeChem"
        subtitle={`Hello, ${user?.name?.split(" ")[0] || "User"}`}
        rightComponent={
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => router.push("/(user)/profile")}
            >
              {avatarUrl && !imageError ? (
                <>
                  <Image
                    key={`avatar-${avatarKey}`}
                    source={{
                      uri: `${avatarUrl}?t=${avatarKey}`,
                    }}
                    style={styles.avatarImg}
                    onError={(error) => {
                      console.error(
                        "Avatar image load error:",
                        error.nativeEvent,
                      );
                      setImageError(true);
                      setAvatarLoading(false);
                    }}
                    onLoadStart={() => {
                      setAvatarLoading(true);
                    }}
                    onLoad={() => {
                      console.log("Avatar image loaded successfully");
                      setAvatarLoading(false);
                    }}
                  />
                  {avatarLoading && (
                    <View style={styles.avatarLoadingOverlay}>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    </View>
                  )}
                </>
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}
            >
              <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Adverts Carousel */}
        <View style={styles.section}>
          <AdvertCarousel />
        </View>

        {/* AI Assistant Card */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.aiCard}
            onPress={navigateToChat}
            activeOpacity={0.8}
          >
            <View style={styles.aiCardContent}>
              <View style={styles.aiIconContainer}>
                <Ionicons
                  name="sparkles"
                  size={32}
                  color={DesignSystem.colors.primary[600]}
                />
              </View>
              <View style={styles.aiTextContent}>
                <View style={styles.aiBadge}>
                  <Ionicons
                    name="sparkles"
                    size={10}
                    color={DesignSystem.colors.primary[600]}
                  />
                  <Text style={styles.aiBadgeText}>AI ASSISTANT</Text>
                </View>
                <Text style={styles.aiTitle}>Health Concierge</Text>
                <Text style={styles.aiSubtitle}>
                  Get instant help with medications, refills, and health advice
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={24}
                color={DesignSystem.colors.text.secondary}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Medication Search */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Find Medications</Text>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#9ca3af" />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search medication name..."
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {isSearching ? (
              <ActivityIndicator size="small" color="#2563eb" />
            ) : searchQuery.length > 0 ? (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#9ca3af" />
              </TouchableOpacity>
            ) : null}
          </View>

          {medications.length > 0 && (
            <FlatList
              data={medications.slice(0, 5)}
              keyExtractor={(item, index) => `${item.name}-${index}`}
              scrollEnabled={false}
              nestedScrollEnabled={true}
              style={styles.medicationsList}
              renderItem={({ item }) => {
                const status = getStatusDetails(item.availability);
                const isOutOfStock = item.availability === "out_of_stock";

                return (
                  <View style={styles.medicationCard}>
                    <View style={styles.medCardHeader}>
                      <View
                        style={[styles.medIcon, { backgroundColor: status.bg }]}
                      >
                        <Ionicons
                          name="medical"
                          size={20}
                          color={status.color}
                        />
                      </View>
                      <View style={styles.medInfo}>
                        <Text style={styles.medName}>{item.name}</Text>
                        <Text style={styles.medDetails}>
                          {item.dosage} • {item.form}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: status.bg },
                      ]}
                    >
                      <Ionicons
                        name={status.icon}
                        size={12}
                        color={status.color}
                      />
                      <Text
                        style={[styles.statusText, { color: status.color }]}
                      >
                        {status.label}
                      </Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.medCardActions}>
                      {isOutOfStock ? (
                        <TouchableOpacity
                          style={styles.callButton}
                          onPress={handleCall}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="call" size={16} color="white" />
                          <Text style={styles.callButtonText}>
                            Call Pharmacy
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <>
                          <TouchableOpacity
                            style={styles.refillButton}
                            onPress={() => handleRequestRefill(item)}
                            activeOpacity={0.7}
                          >
                            <Ionicons
                              name="refresh-circle"
                              size={16}
                              color="#2563eb"
                            />
                            <Text style={styles.refillButtonText}>
                              Request Refill
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.chatButton}
                            onPress={navigateToChat}
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
              }}
              ListFooterComponent={
                medications.length > 5 ? (
                  <TouchableOpacity
                    style={styles.viewAllBtn}
                    onPress={() => router.push("/(user)/medications")}
                  >
                    <Text style={styles.viewAllText}>
                      View all {medications.length} results
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#2563eb"
                    />
                  </TouchableOpacity>
                ) : null
              }
            />
          )}

          {searchQuery.length > 0 &&
            medications.length === 0 &&
            !isSearching && (
              <View style={styles.emptySearch}>
                <Ionicons name="search-outline" size={48} color="#cbd5e1" />
                <Text style={styles.emptySearchText}>No medications found</Text>
                <Text style={styles.emptySearchSubtext}>
                  Try a different search term
                </Text>
              </View>
            )}
        </View>

        {/* Pharmacy Info */}
        <View style={styles.section}>
          <View style={styles.infoCard}>
            <View style={styles.infoContent}>
              <View style={styles.infoIconContainer}>
                <Ionicons
                  name="time"
                  size={24}
                  color={DesignSystem.colors.primary[600]}
                />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>PrimeChem Central</Text>
                <Text style={styles.infoSubtitle}>Open until 9:00 PM</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.infoCallButton}
              onPress={handleCall}
            >
              <Ionicons name="call" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Floating Chat Button */}
      <TouchableOpacity style={styles.floatingButton} onPress={navigateToChat}>
        <Ionicons name="chatbubbles" size={28} color="#FFFFFF" />
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
    backgroundColor: DesignSystem.colors.background.default,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: DesignSystem.spacing.sm,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: DesignSystem.borderRadius.full,
    overflow: "hidden",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: DesignSystem.colors.primary[500],
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  avatarLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: DesignSystem.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: DesignSystem.borderRadius.md,
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    paddingHorizontal: DesignSystem.spacing.md,
    marginTop: DesignSystem.spacing.lg,
  },
  sectionTitle: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: "700",
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.md,
  },
  aiCard: {
    backgroundColor: DesignSystem.colors.background.paper,
    borderRadius: DesignSystem.borderRadius.xl,
    padding: DesignSystem.spacing.md,
    ...DesignSystem.shadows.md,
    borderWidth: 1,
    borderColor: DesignSystem.colors.divider,
  },
  aiCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: DesignSystem.spacing.md,
  },
  aiIconContainer: {
    width: 56,
    height: 56,
    borderRadius: DesignSystem.borderRadius.md,
    backgroundColor: DesignSystem.colors.primary[50],
    justifyContent: "center",
    alignItems: "center",
  },
  aiTextContent: {
    flex: 1,
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: DesignSystem.colors.primary[50],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: DesignSystem.borderRadius.sm,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  aiBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: DesignSystem.colors.primary[600],
  },
  aiTitle: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: "700",
    color: DesignSystem.colors.text.primary,
    marginBottom: 2,
  },
  aiSubtitle: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.text.secondary,
    lineHeight: 18,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: DesignSystem.colors.divider,
    ...DesignSystem.shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: DesignSystem.colors.text.primary,
    fontWeight: "500",
  },
  medicationsList: {
    marginTop: 16,
  },
  medicationCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: DesignSystem.colors.divider,
    ...DesignSystem.shadows.sm,
  },
  medCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  medIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  medInfo: {
    flex: 1,
  },
  medName: {
    fontSize: 15,
    fontWeight: "700",
    color: DesignSystem.colors.text.primary,
    marginBottom: 2,
  },
  medDetails: {
    fontSize: 12,
    color: DesignSystem.colors.text.secondary,
    fontWeight: "500",
  },
  chatIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
  },
  callIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#dc2626",
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  medCardActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  refillButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eff6ff",
    borderRadius: 10,
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
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 6,
  },
  callButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "white",
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    padding: 14,
    gap: 8,
    marginTop: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563eb",
  },
  emptySearch: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptySearchText: {
    fontSize: 16,
    fontWeight: "700",
    color: DesignSystem.colors.text.secondary,
    marginTop: 12,
  },
  emptySearchSubtext: {
    fontSize: 13,
    color: DesignSystem.colors.text.secondary,
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: DesignSystem.colors.background.paper,
    borderRadius: DesignSystem.borderRadius.xl,
    padding: DesignSystem.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...DesignSystem.shadows.md,
    borderWidth: 1,
    borderColor: DesignSystem.colors.divider,
  },
  infoContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: DesignSystem.spacing.sm,
    flex: 1,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: DesignSystem.borderRadius.md,
    backgroundColor: DesignSystem.colors.primary[50],
    justifyContent: "center",
    alignItems: "center",
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: "700",
    color: DesignSystem.colors.text.primary,
    marginBottom: 2,
  },
  infoSubtitle: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.success.main,
    fontWeight: "600",
  },
  infoCallButton: {
    width: 44,
    height: 44,
    borderRadius: DesignSystem.borderRadius.md,
    backgroundColor: DesignSystem.colors.primary[600],
    justifyContent: "center",
    alignItems: "center",
    ...DesignSystem.shadows.sm,
  },
  floatingButton: {
    position: "absolute",
    bottom: 80,
    right: DesignSystem.spacing.md,
    width: 60,
    height: 60,
    borderRadius: DesignSystem.borderRadius.full,
    backgroundColor: DesignSystem.colors.primary[600],
    justifyContent: "center",
    alignItems: "center",
    ...DesignSystem.shadows.xl,
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
    color: DesignSystem.colors.text.primary,
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
    color: DesignSystem.colors.text.primary,
    marginBottom: 4,
  },
  selectedMedDetails: {
    fontSize: 13,
    color: DesignSystem.colors.text.secondary,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: DesignSystem.colors.text.primary,
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
    color: DesignSystem.colors.text.primary,
  },
  notesInput: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    fontSize: 15,
    color: DesignSystem.colors.text.primary,
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

export default UserHomeScreen;
