import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import LoadingOverlay from "../../src/components/LoadingOverlay";
import { useAuth } from "../../src/context/AuthContext";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import api from "../../src/services/api";
import {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
} from "../../src/styles/superAdminTheme";

export default function SuperAdminProfile() {
  const { user, logout, updateUserInfo, refreshUserData } = useAuth();
  const [navigating, setNavigating] = React.useState(false);
  const [avatarUri, setAvatarUri] = React.useState<string | null>(
    user?.avatar_url || null,
  );
  const [avatarKey, setAvatarKey] = React.useState(Date.now());
  const [uploading, setUploading] = React.useState(false);

  React.useEffect(() => {
    setAvatarUri(user?.avatar_url || null);
    setAvatarKey(Date.now());
  }, [user]);

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
      const newUri = result.assets[0].uri;
      setAvatarUri(newUri);
      await uploadAvatar(newUri);
    }
  };

  const uploadAvatar = async (uri: string) => {
    setUploading(true);
    try {
      const formData = new FormData();
      const uriParts = uri.split(".");
      const fileType = uriParts[uriParts.length - 1];

      formData.append("name", user?.name || "");
      formData.append("email", user?.email || "");
      formData.append("phone", user?.phone || "");
      formData.append("avatar", {
        uri: uri,
        name: `avatar.${fileType}`,
        type: `image/${fileType}`,
      } as any);

      const response = await api.post("/user/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.user) {
        const newKey = Date.now();
        setAvatarKey(newKey);
        setAvatarUri(response.data.user.avatar_url);
        await updateUserInfo(response.data.user);
        await refreshUserData();
        Alert.alert("Success", "Profile photo updated successfully!");
      }
    } catch (error: any) {
      console.error("Avatar upload failed:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update profile photo",
      );
      setAvatarUri(user?.avatar_url || null);
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => logout(),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#8B5CF6", "#6366F1", "#4F46E5"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={["top"]}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Profile</Text>
            <Text style={styles.headerSubtitle}>Manage your account</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info Card */}
        <View style={styles.userCard}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={pickImage}
            activeOpacity={0.7}
            disabled={uploading}
          >
            {avatarUri ? (
              <Image
                key={avatarKey}
                source={{ uri: `${avatarUri}?t=${avatarKey}` }}
                style={styles.avatarImage}
              />
            ) : (
              <LinearGradient
                colors={["#8B5CF6", "#6366F1"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>
            )}
            <View style={styles.cameraOverlay}>
              <Ionicons name="camera" size={16} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={styles.changePhotoText}>Tap to change photo</Text>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Ionicons
              name="shield-checkmark"
              size={16}
              color={colors.superAdmin}
            />
            <Text style={styles.roleBadgeText}>Super Admin</Text>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => {
              setNavigating(true);
              setTimeout(() => {
                router.push("/(super-admin)/notifications");
                setNavigating(false);
              }, 300);
            }}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.settingIcon,
                { backgroundColor: colors.infoLight },
              ]}
            >
              <Ionicons name="notifications" size={22} color={colors.info} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Notifications</Text>
              <Text style={styles.settingSubtitle}>
                Manage notification preferences
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            activeOpacity={0.7}
            onPress={() => {
              setNavigating(true);
              setTimeout(() => {
                // Navigate to security settings when implemented
                setNavigating(false);
              }, 300);
            }}
          >
            <View
              style={[
                styles.settingIcon,
                { backgroundColor: colors.successLight },
              ]}
            >
              <Ionicons name="lock-closed" size={22} color={colors.success} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Security</Text>
              <Text style={styles.settingSubtitle}>
                Password and authentication
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
          </TouchableOpacity>
        </View>

        {/* Quick Access Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => {
              setNavigating(true);
              setTimeout(() => {
                router.push("/(super-admin)/users");
                setNavigating(false);
              }, 300);
            }}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.settingIcon,
                { backgroundColor: colors.primaryBg },
              ]}
            >
              <Ionicons name="people" size={22} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>User Management</Text>
              <Text style={styles.settingSubtitle}>Manage all users</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => {
              setNavigating(true);
              setTimeout(() => {
                router.push("/(super-admin)/activity");
                setNavigating(false);
              }, 300);
            }}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.settingIcon,
                { backgroundColor: colors.warningLight },
              ]}
            >
              <Ionicons name="pulse" size={22} color={colors.warning} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Activity Feed</Text>
              <Text style={styles.settingSubtitle}>View system activities</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => {
              setNavigating(true);
              setTimeout(() => {
                router.push("/(super-admin)/security");
                setNavigating(false);
              }, 300);
            }}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.settingIcon,
                { backgroundColor: colors.errorLight },
              ]}
            >
              <Ionicons
                name="shield-checkmark"
                size={22}
                color={colors.error}
              />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Security Center</Text>
              <Text style={styles.settingSubtitle}>
                Monitor security threats
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
          </TouchableOpacity>
        </View>

        {/* Account Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.settingIcon,
                { backgroundColor: colors.errorLight },
              ]}
            >
              <Ionicons name="log-out" size={22} color={colors.error} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, { color: colors.error }]}>
                Logout
              </Text>
              <Text style={styles.settingSubtitle}>
                Sign out of your account
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Pharmacy Management System</Text>
          <Text style={styles.appInfoText}>Version 1.0.0</Text>
          <Text style={styles.appInfoText}>© 2024 All rights reserved</Text>
        </View>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>

      <LoadingOverlay visible={navigating || uploading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerGradient: {
    paddingBottom: spacing.xxxl,
    borderBottomLeftRadius: borderRadius.xxl,
    borderBottomRightRadius: borderRadius.xxl,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: typography.huge,
    fontWeight: typography.bold,
    color: "#FFFFFF",
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.base,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: typography.medium,
  },
  content: {
    flex: 1,
    marginTop: spacing.lg,
  },
  userCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
    padding: spacing.xxl,
    borderRadius: borderRadius.xl,
    alignItems: "center",
    ...shadows.md,
  },
  avatarContainer: {
    marginBottom: spacing.lg,
    position: "relative",
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.lg,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.full,
    ...shadows.lg,
  },
  cameraOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.white,
  },
  changePhotoText: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  avatarText: {
    fontSize: typography.giant,
    fontWeight: typography.extrabold,
    color: "#FFFFFF",
  },
  userName: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: typography.base,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: `${colors.superAdmin}15`,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  roleBadgeText: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.superAdmin,
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  settingSubtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  appInfo: {
    alignItems: "center",
    paddingVertical: spacing.xxxl,
  },
  appInfoText: {
    fontSize: typography.xs,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
});
