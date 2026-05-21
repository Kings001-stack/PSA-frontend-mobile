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
import UserNotificationBadge from "./UserNotificationBadge";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

interface UserTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const UserTabBar: React.FC<UserTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { user } = useContext(AuthContext);
  const [animations] = React.useState(
    state.routes.map(() => new Animated.Value(1)),
  );
  const [updatedRefillsCount, setUpdatedRefillsCount] = useState(0);

  // Fetch updated refills count (approved/rejected/ready for pickup that user hasn't viewed)
  const fetchUpdatedCount = React.useCallback(async () => {
    if (!user) {
      setUpdatedRefillsCount(0);
      return;
    }

    try {
      const response = await api.get("/refills");
      const refills = response.data;

      if (Array.isArray(refills)) {
        // Count refills that have been updated by admin but not viewed by user
        const updated = refills.filter(
          (refill: any) =>
            (refill.status === "approved" ||
              refill.status === "rejected" ||
              refill.status === "ready_for_pickup") &&
            refill.reviewed_at &&
            (!refill.user_viewed_at ||
              new Date(refill.reviewed_at) > new Date(refill.user_viewed_at)),
        );
        setUpdatedRefillsCount(updated.length);
      } else {
        setUpdatedRefillsCount(0);
      }
    } catch (error: any) {
      if (error.response?.status !== 401) {
        console.error("Failed to fetch updated refills count", error);
      }
      setUpdatedRefillsCount(0);
    }
  }, [user]);

  useEffect(() => {
    fetchUpdatedCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUpdatedCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUpdatedCount]);

  // Refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchUpdatedCount();
    }, [fetchUpdatedCount]),
  );

  // Check if current route is chat - hide navbar if true
  const currentRoute = state.routes[state.index];
  const shouldHideTabBar = currentRoute.name === "chat";

  // If we're on the chat screen, don't render the tab bar
  // This must come AFTER all hooks
  if (shouldHideTabBar) {
    return null;
  }

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
    // Only show routes that don't have href: null
    if (options.href === null) return false;
    // Explicitly only show these 3 routes
    return (
      route.name === "index" ||
      route.name === "medications" ||
      route.name === "refills"
    );
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
                {route.name === "refills" && updatedRefillsCount > 0 && (
                  <UserNotificationBadge top={-6} right={-8} />
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

export default UserTabBar;
