import React, { useState, useEffect, useContext } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import NotificationBadge from "./NotificationBadge";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

interface AdminTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const AdminTabBar: React.FC<AdminTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { user } = useContext(AuthContext);
  const [animations] = React.useState(
    state.routes.map(() => new Animated.Value(1)),
  );
  const [pendingRefillsCount, setPendingRefillsCount] = useState(0);

  // Fetch pending refills count
  const fetchPendingCount = React.useCallback(async () => {
    // Only fetch if user is authenticated and is admin/pharmacist
    if (!user || (user.role !== "admin" && user.role !== "pharmacist")) {
      setPendingRefillsCount(0);
      return;
    }

    try {
      const response = await api.get("/pharmacist/refills");
      const data = response.data;

      // Handle different response formats
      if (data && typeof data === "object") {
        // Check if stats object exists with pending count
        if (data.stats && typeof data.stats.pending === "number") {
          setPendingRefillsCount(data.stats.pending);
        }
        // Check if refills array exists
        else if (Array.isArray(data.refills)) {
          const pending = data.refills.filter(
            (refill: any) => refill.status === "pending" && !refill.viewed_at,
          );
          setPendingRefillsCount(pending.length);
        }
        // Check if data is directly an array
        else if (Array.isArray(data)) {
          const pending = data.filter(
            (refill: any) => refill.status === "pending" && !refill.viewed_at,
          );
          setPendingRefillsCount(pending.length);
        } else {
          setPendingRefillsCount(0);
        }
      } else {
        setPendingRefillsCount(0);
      }
    } catch (error: any) {
      // Only log error if it's not a 401 (authentication error)
      if (error.response?.status !== 401) {
        console.error("Failed to fetch pending refills count", error);
      }
      setPendingRefillsCount(0);
    }
  }, [user]);

  useEffect(() => {
    fetchPendingCount();
    // Refresh every 15 seconds for more dynamic updates
    const interval = setInterval(fetchPendingCount, 15000);
    return () => clearInterval(interval);
  }, [fetchPendingCount]);

  // Refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchPendingCount();
    }, [fetchPendingCount]),
  );

  const handlePress = (route: any, index: number, isFocused: boolean) => {
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      Animated.sequence([
        Animated.spring(animations[index], {
          toValue: 0.95,
          useNativeDriver: true,
          speed: 50,
        }),
        Animated.spring(animations[index], {
          toValue: 1,
          useNativeDriver: true,
          speed: 50,
        }),
      ]).start();

      navigation.navigate(route.name);
    }
  };

  const visibleRoutes = state.routes.filter((route: any) => {
    const { options } = descriptors[route.key];
    // Check if tabBarButton is explicitly set to hide the tab
    if (typeof options.tabBarButton === "function") {
      const result = options.tabBarButton({});
      if (result === null) return false;
    }
    return true;
  });

  return (
    <View
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}
    >
      <View style={styles.tabBar}>
        {visibleRoutes.map((route: any, index: number) => {
          const actualIndex = state.routes.indexOf(route);
          const { options } = descriptors[route.key];
          const isFocused = state.index === actualIndex;

          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;

          const IconComponent = options.tabBarIcon;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={() => handlePress(route, actualIndex, isFocused)}
              style={[styles.tabItem, isFocused && styles.activeTabItem]}
              activeOpacity={0.7}
            >
              <Animated.View
                style={[
                  styles.iconWrapper,
                  {
                    transform: [{ scale: animations[actualIndex] }],
                  },
                ]}
              >
                {IconComponent &&
                  IconComponent({
                    color: isFocused ? "#2563eb" : "#64748b",
                    focused: isFocused,
                    size: 18,
                  })}
                {/* Show badge on refills tab */}
                {route.name === "refills" && pendingRefillsCount > 0 && (
                  <NotificationBadge
                    count={pendingRefillsCount}
                    top={-6}
                    right={-8}
                  />
                )}
              </Animated.View>
              <Text
                style={[styles.label, isFocused && styles.activeLabel]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "white",
    height: 58,
    paddingHorizontal: 4,
    paddingTop: 6,
    borderTopWidth: 3,
    borderTopColor: "#3b82f6",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
    justifyContent: "space-around",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    paddingHorizontal: 2,
    borderRadius: 12,
    marginHorizontal: 2,
  },
  activeTabItem: {
    backgroundColor: "#eff6ff",
  },
  iconWrapper: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
  },
  label: {
    fontSize: 9,
    fontWeight: "600",
    color: "#64748b",
    letterSpacing: 0.2,
    textAlign: "center",
  },
  activeLabel: {
    color: "#2563eb",
    fontWeight: "700",
  },
});

export default AdminTabBar;
