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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import api from "../services/api";
import AnimatedIcon from "../components/AnimatedIcon";
import UserDashboardHeader from "../components/UserDashboardHeader";

interface MedicationAvailability {
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

          {isOutOfStock ? (
            <TouchableOpacity
              style={styles.callIconBtn}
              onPress={handleCallPharmacy}
              activeOpacity={0.7}
            >
              <Ionicons name="call" size={18} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.chatIconBtn}
              onPress={() => router.push("/(user)/chat")}
              activeOpacity={0.7}
            >
              <Ionicons name="chatbubble-ellipses" size={18} color="#2563eb" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Ionicons name={status.icon} size={14} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
        </View>

        {isOutOfStock && (
          <View style={styles.alertBox}>
            <Ionicons name="information-circle" size={14} color="#991b1b" />
            <Text style={styles.alertText}>
              Currently unavailable. Contact pharmacist for alternatives or
              restock dates.
            </Text>
          </View>
        )}

        {isLimited && (
          <View
            style={[
              styles.alertBox,
              { backgroundColor: "#fff7ed", borderColor: "#fed7aa" },
            ]}
          >
            <Ionicons name="warning" size={14} color="#9a3412" />
            <Text style={[styles.alertText, { color: "#9a3412" }]}>
              Low stock. Contact us soon to ensure availability.
            </Text>
          </View>
        )}
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
  chatIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
  },
  callIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#dc2626",
    justifyContent: "center",
    alignItems: "center",
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
  alertBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#fee2e2",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  alertText: {
    flex: 1,
    fontSize: 11,
    color: "#991b1b",
    lineHeight: 16,
    fontWeight: "600",
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
});

export default MedicationSearchScreen;
