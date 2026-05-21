import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface UserDashboardHeaderProps {
  title: string;
  subtitle: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  children?: React.ReactNode;
}

const UserDashboardHeader: React.FC<UserDashboardHeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  rightComponent,
  children,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleGoBack = () => {
    try {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(user)");
      }
    } catch (error) {
      console.error("Navigation error:", error);
      router.replace("/(user)");
    }
  };

  return (
    <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
      <View style={styles.headerContent}>
        {showBackButton && (
          <TouchableOpacity
            onPress={handleGoBack}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        )}
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerSubtitle}>{subtitle}</Text>
        </View>
        {rightComponent}
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#2563eb",
    paddingBottom: 28,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "white",
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
    marginTop: 2,
  },
});

export default UserDashboardHeader;
