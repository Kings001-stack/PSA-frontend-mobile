import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
  Image,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { usePushNotifications } from "../context/PushNotificationContext";
import api from "../services/api";
import * as ImagePicker from "expo-image-picker";
import PushNotificationSettings from "../components/PushNotificationSettings";

const ProfileScreen: React.FC = () => {
  const { user, updateUserInfo, refreshUserData } = useContext(AuthContext);
  const { theme } = useTheme();
  const colors = theme.colors;
  const { isPermissionGranted } = usePushNotifications();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] =
    useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(
    user?.avatar_url || null,
  );

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [avatarKey, setAvatarKey] = useState(Date.now());

  // Update avatar when user context changes
  useEffect(() => {
    console.log("ProfileScreen - User context changed:", user);
    console.log("ProfileScreen - Avatar URL:", user?.avatar_url);
    if (user?.avatar_url) {
      setAvatarUri(user.avatar_url);
      setAvatarKey(Date.now());
    }
  }, [user?.avatar_url]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library to set a profile picture.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;

      // Check file size (optional client-side check)
      try {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const sizeInMB = blob.size / (1024 * 1024);

        if (sizeInMB > 5) {
          Alert.alert(
            "Image Too Large",
            `The selected image is ${sizeInMB.toFixed(1)}MB. Please choose an image smaller than 5MB.`,
          );
          return;
        }
      } catch (error) {
        console.log("Could not check file size:", error);
      }

      setAvatarUri(imageUri);
    }
  };

  const handleUpdate = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      Alert.alert("Error", "Name and Email are required.");
      return;
    }

    setIsLoading(true);
    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("email", formData.email);
      submitData.append("phone", formData.phone || "");

      if (avatarUri && !avatarUri.includes("http")) {
        const uriParts = avatarUri.split(".");
        const fileType = uriParts[uriParts.length - 1];
        submitData.append("avatar", {
          uri: avatarUri,
          name: `avatar.${fileType}`,
          type: `image/${fileType}`,
        } as any);
        console.log("Uploading new avatar:", avatarUri);
      }

      console.log("Submitting profile update...");
      const response = await api.post("/user/profile", submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Profile update response:", response.data);
      console.log("Updated user data:", response.data.user);
      console.log("Avatar URL in response:", response.data.user?.avatar_url);

      if (response.data.user) {
        console.log("Updating user info in context...");

        // Update local avatar state with new key to force refresh
        if (response.data.user.avatar_url) {
          const newKey = Date.now();
          setAvatarKey(newKey);
          setAvatarUri(response.data.user.avatar_url);
          console.log("Avatar updated to:", response.data.user.avatar_url);
        }

        // Update context with fresh user data
        await updateUserInfo(response.data.user);

        // Force a complete refresh from backend to ensure consistency
        console.log("Forcing refresh from backend...");
        const freshUser = await refreshUserData();
        console.log("Fresh user data after refresh:", freshUser);
        console.log("Fresh avatar_url:", freshUser?.avatar_url);
      }

      Alert.alert("Success", "Profile updated successfully!", [
        {
          text: "OK",
          onPress: () => {
            // Navigate back after user acknowledges
            router.back();
          },
        },
      ]);
    } catch (error: any) {
      console.error("Update failed", error);
      console.error("Error response:", error.response?.data);

      // Better error message handling
      let errorMessage = "Failed to update profile";

      if (error.response?.data?.errors?.avatar) {
        const avatarError = error.response.data.errors.avatar[0];
        if (avatarError.includes("greater than")) {
          errorMessage =
            "Image is too large. Please choose an image smaller than 5MB.";
        } else if (
          avatarError.includes("mimes") ||
          avatarError.includes("image")
        ) {
          errorMessage =
            "Invalid image format. Please use JPG, PNG, or WEBP images.";
        } else {
          errorMessage = avatarError;
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={theme.mode === "dark" ? "light-content" : "light-content"}
        translucent
        backgroundColor="transparent"
      />

      <View
        style={[
          styles.header,
          { paddingTop: insets.top, backgroundColor: colors.headerBg },
        ]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[
              styles.backBtn,
              { backgroundColor: `${colors.headerText}20` },
            ]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.headerText} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.headerText }]}>
            Edit Profile
          </Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage} activeOpacity={0.7}>
            {avatarUri ? (
              <Image
                source={{ uri: `${avatarUri}?t=${avatarKey}` }}
                style={styles.avatarLarge}
                key={`profile-avatar-${avatarKey}`}
                onError={(error) => {
                  console.error(
                    "Profile avatar load error:",
                    error.nativeEvent,
                  );
                  setAvatarUri(null);
                }}
                onLoad={() => {
                  console.log("Profile avatar loaded successfully");
                }}
              />
            ) : (
              <View
                style={[
                  styles.avatarLarge,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Text style={styles.avatarText}>
                  {formData.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View
              style={[
                styles.cameraOverlay,
                { backgroundColor: colors.primary },
              ]}
            >
              <Ionicons name="camera" size={16} color="white" />
            </View>
          </TouchableOpacity>
          <Text
            style={[styles.changePhotoText, { color: colors.textSecondary }]}
          >
            Tap to change photo
          </Text>
          <Text style={[styles.userRole, { color: colors.primary }]}>
            {user?.role?.toUpperCase()}
          </Text>
        </View>

        {/* Theme Settings Button */}
        <TouchableOpacity
          style={[
            styles.themeCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => router.push("/(user)/theme-settings" as any)}
          activeOpacity={0.7}
        >
          <View style={styles.themeCardLeft}>
            <View
              style={[
                styles.themeIcon,
                { backgroundColor: colors.primaryLight + "20" },
              ]}
            >
              <Ionicons
                name={theme.mode === "dark" ? "moon" : "sunny"}
                size={24}
                color={colors.primary}
              />
            </View>
            <View>
              <Text style={[styles.themeCardTitle, { color: colors.text }]}>
                Theme Settings
              </Text>
              <Text
                style={[
                  styles.themeCardSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                Currently using {theme.mode} mode
              </Text>
            </View>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textTertiary}
          />
        </TouchableOpacity>

        {/* Push Notification Settings Button */}
        <TouchableOpacity
          style={[
            styles.themeCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => setShowNotificationSettings(true)}
          activeOpacity={0.7}
        >
          <View style={styles.themeCardLeft}>
            <View
              style={[
                styles.themeIcon,
                { backgroundColor: colors.primaryLight + "20" },
              ]}
            >
              <Ionicons
                name={
                  isPermissionGranted ? "notifications" : "notifications-off"
                }
                size={24}
                color={colors.primary}
              />
            </View>
            <View>
              <Text style={[styles.themeCardTitle, { color: colors.text }]}>
                Push Notifications
              </Text>
              <Text
                style={[
                  styles.themeCardSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                {isPermissionGranted ? "Enabled" : "Disabled"}
              </Text>
            </View>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textTertiary}
          />
        </TouchableOpacity>

        <View
          style={[
            styles.formCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: colors.surfaceVariant,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons
              name="person-outline"
              size={20}
              color={colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Your Name"
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          <Text style={[styles.label, { color: colors.text }]}>
            Email Address
          </Text>
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: colors.surfaceVariant,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons
              name="mail-outline"
              size={20}
              color={colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="Email Address"
              placeholderTextColor={colors.textTertiary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Text style={[styles.label, { color: colors.text }]}>
            Phone Number
          </Text>
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: colors.surfaceVariant,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons
              name="call-outline"
              size={20}
              color={colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              placeholder="Phone Number"
              placeholderTextColor={colors.textTertiary}
              keyboardType="phone-pad"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.saveBtn,
              { backgroundColor: colors.primary },
              isLoading && styles.disabledBtn,
            ]}
            onPress={handleUpdate}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="white"
                />
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.infoBox,
            { backgroundColor: colors.infoLight, borderColor: colors.info },
          ]}
        >
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={colors.info}
          />
          <Text style={[styles.infoText, { color: colors.info }]}>
            Only your display information can be changed here. Contact admin for
            role changes.
          </Text>
        </View>
      </ScrollView>

      {/* Push Notification Settings Modal */}
      <Modal
        visible={showNotificationSettings}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNotificationSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <PushNotificationSettings
            onClose={() => setShowNotificationSettings(false)}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    backgroundColor: "#1e3a8a",
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "white",
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#2563eb", // Changed to blue
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "800",
    color: "#ffffff", // Changed to white for better contrast on blue
  },
  cameraOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
  },
  changePhotoText: {
    marginTop: 8,
    fontSize: 12,
    color: "#2563eb",
    fontWeight: "600",
  },
  userRole: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "800",
    color: "#64748b",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    letterSpacing: 1,
  },
  themeCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  themeCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  themeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  themeCardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  themeCardSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  formCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#1e3a8a",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 8,
    marginTop: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: "#1e293b",
  },
  saveBtn: {
    backgroundColor: "#1d4ed8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    borderRadius: 16,
    marginTop: 32,
    gap: 10,
    shadowColor: "#1d4ed8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#eff6ff",
    padding: 16,
    borderRadius: 16,
    marginTop: 24,
    gap: 12,
    alignItems: "center",
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#1e3a8a",
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ProfileScreen;
