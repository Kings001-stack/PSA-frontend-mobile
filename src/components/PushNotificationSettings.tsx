import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePushNotifications } from "../context/PushNotificationContext";
import api from "../services/api";

interface PushNotificationSettingsProps {
  onClose?: () => void;
}

interface NotificationPreferences {
  notify_refill_status: boolean;
  notify_prescription_reminders: boolean;
  notify_pharmacy_updates: boolean;
}

const PushNotificationSettings: React.FC<PushNotificationSettingsProps> = ({
  onClose,
}) => {
  const {
    isPermissionGranted,
    requestPermission,
    expoPushToken,
    scheduleLocalNotification,
  } = usePushNotifications();

  const [isLoading, setIsLoading] = useState(false);
  const [loadingPreferences, setLoadingPreferences] = useState(true);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    notify_refill_status: true,
    notify_prescription_reminders: true,
    notify_pharmacy_updates: false,
  });

  useEffect(() => {
    if (isPermissionGranted) {
      fetchPreferences();
    } else {
      setLoadingPreferences(false);
    }
  }, [isPermissionGranted]);

  const fetchPreferences = async () => {
    try {
      console.log("Fetching notification preferences...");
      const response = await api.get("/user/notification-preferences");
      console.log("Preferences response:", response.data);

      if (response.data.success) {
        setPreferences(response.data.preferences);
        console.log("Preferences set to:", response.data.preferences);
      }
    } catch (error) {
      console.error("Failed to fetch notification preferences:", error);
    } finally {
      setLoadingPreferences(false);
    }
  };

  const updatePreference = async (
    key: keyof NotificationPreferences,
    value: boolean,
  ) => {
    const previousValue = preferences[key];

    console.log(`Updating ${key} to ${value}`);

    // Optimistically update UI
    setPreferences((prev) => ({ ...prev, [key]: value }));

    try {
      console.log("Sending API request:", { [key]: value });
      const response = await api.post("/user/notification-preferences", {
        [key]: value,
      });

      console.log("API response:", response.data);

      if (response.data.success) {
        // Update preferences with the response to ensure sync
        setPreferences(response.data.preferences);

        // Show success feedback
        const preferenceNames = {
          notify_refill_status: "Refill Status Updates",
          notify_prescription_reminders: "Prescription Reminders",
          notify_pharmacy_updates: "Pharmacy Updates",
        };

        Alert.alert(
          "Updated",
          `${preferenceNames[key]} ${value ? "enabled" : "disabled"}`,
          [{ text: "OK" }],
        );
      }
    } catch (error) {
      console.error("Failed to update preference:", error);
      // Revert on error
      setPreferences((prev) => ({ ...prev, [key]: previousValue }));
      Alert.alert(
        "Error",
        "Failed to update notification preferences. Please try again.",
      );
    }
  };

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    try {
      const granted = await requestPermission();
      if (granted) {
        Alert.alert(
          "Success!",
          "Push notifications have been enabled. You'll now receive updates about your refill requests.",
          [{ text: "OK" }],
        );
      } else {
        Alert.alert(
          "Permission Denied",
          "To receive notifications, please enable them in your device settings.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () => {
                // Note: Opening settings programmatically requires additional setup
                Alert.alert(
                  "Please go to Settings > Notifications > PrimeChem to enable notifications",
                );
              },
            },
          ],
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to enable notifications. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      await scheduleLocalNotification(
        "Test Notification",
        "This is a test notification from PrimeChem Pharmacy!",
        { type: "test" },
      );
      Alert.alert(
        "Test Sent!",
        "Check your notification panel to see the test notification.",
      );
    } catch (error) {
      Alert.alert("Error", "Failed to send test notification.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name="notifications" size={24} color="#2563eb" />
          </View>
          <View>
            <Text style={styles.title}>Push Notifications</Text>
            <Text style={styles.subtitle}>Stay updated with your refills</Text>
          </View>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#64748b" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Notification Status</Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: isPermissionGranted ? "#dcfce7" : "#fee2e2",
                },
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  { color: isPermissionGranted ? "#16a34a" : "#dc2626" },
                ]}
              >
                {isPermissionGranted ? "Enabled" : "Disabled"}
              </Text>
            </View>
          </View>

          <Text style={styles.statusDescription}>
            {isPermissionGranted
              ? "You'll receive notifications when your refill status changes."
              : "Enable notifications to get updates about your refill requests."}
          </Text>
        </View>

        {!isPermissionGranted && (
          <TouchableOpacity
            style={styles.enableButton}
            onPress={handleEnableNotifications}
            disabled={isLoading}
          >
            <Ionicons name="notifications-outline" size={20} color="white" />
            <Text style={styles.enableButtonText}>
              {isLoading ? "Enabling..." : "Enable Notifications"}
            </Text>
          </TouchableOpacity>
        )}

        {isPermissionGranted && (
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Notification Types</Text>

            {loadingPreferences ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#2563eb" />
                <Text style={styles.loadingText}>Loading preferences...</Text>
              </View>
            ) : (
              <>
                <View style={styles.settingItem}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingName}>
                      Refill Status Updates
                    </Text>
                    <Text style={styles.settingDescription}>
                      When your refill is approved, rejected, or ready for
                      pickup
                    </Text>
                  </View>
                  <Switch
                    value={preferences.notify_refill_status}
                    onValueChange={(value) =>
                      updatePreference("notify_refill_status", value)
                    }
                    trackColor={{ false: "#e5e7eb", true: "#3b82f6" }}
                    thumbColor={
                      preferences.notify_refill_status ? "#ffffff" : "#f4f3f4"
                    }
                  />
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingName}>
                      Prescription Reminders
                    </Text>
                    <Text style={styles.settingDescription}>
                      Reminders to refill your prescriptions before they run out
                    </Text>
                  </View>
                  <Switch
                    value={preferences.notify_prescription_reminders}
                    onValueChange={(value) =>
                      updatePreference("notify_prescription_reminders", value)
                    }
                    trackColor={{ false: "#e5e7eb", true: "#3b82f6" }}
                    thumbColor={
                      preferences.notify_prescription_reminders
                        ? "#ffffff"
                        : "#f4f3f4"
                    }
                  />
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingName}>Pharmacy Updates</Text>
                    <Text style={styles.settingDescription}>
                      Important announcements and promotional offers
                    </Text>
                  </View>
                  <Switch
                    value={preferences.notify_pharmacy_updates}
                    onValueChange={(value) =>
                      updatePreference("notify_pharmacy_updates", value)
                    }
                    trackColor={{ false: "#e5e7eb", true: "#3b82f6" }}
                    thumbColor={
                      preferences.notify_pharmacy_updates
                        ? "#ffffff"
                        : "#f4f3f4"
                    }
                  />
                </View>
              </>
            )}

            <TouchableOpacity
              style={styles.testButton}
              onPress={handleTestNotification}
            >
              <Ionicons name="send" size={16} color="#2563eb" />
              <Text style={styles.testButtonText}>Send Test Notification</Text>
            </TouchableOpacity>
          </View>
        )}

        {expoPushToken && (
          <View style={styles.tokenInfo}>
            <Text style={styles.tokenTitle}>Device Token</Text>
            <Text style={styles.tokenText} numberOfLines={2}>
              {expoPushToken}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    gap: 16,
  },
  statusCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statusDescription: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
  enableButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  enableButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  settingsSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
  },
  settingDescription: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  testButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eff6ff",
    borderRadius: 8,
    padding: 12,
    gap: 6,
    marginTop: 8,
  },
  testButtonText: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "600",
  },
  tokenInfo: {
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  tokenTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 4,
  },
  tokenText: {
    fontSize: 10,
    color: "#94a3b8",
    fontFamily: "monospace",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#64748b",
  },
});

export default PushNotificationSettings;
