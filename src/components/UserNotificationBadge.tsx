import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import api from "../services/api";

interface UserNotificationBadgeProps {
  top?: number;
  right?: number;
}

const UserNotificationBadge: React.FC<UserNotificationBadgeProps> = ({
  top = -6,
  right = -8,
}) => {
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    fetchNotificationCount();
    // Check for new notifications every 30 seconds
    const interval = setInterval(fetchNotificationCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotificationCount = async () => {
    try {
      const response = await api.get("/refills");
      const refills = response.data;

      // Count refills that have been updated (approved/rejected) but not yet viewed by user
      const updatedRefills = refills.filter(
        (refill: any) =>
          (refill.status === "approved" ||
            refill.status === "rejected" ||
            refill.status === "ready_for_pickup") &&
          refill.reviewed_at &&
          (!refill.user_viewed_at ||
            new Date(refill.reviewed_at) > new Date(refill.user_viewed_at)),
      );

      setNotificationCount(updatedRefills.length);
    } catch (error) {
      console.error("Failed to fetch notification count:", error);
      setNotificationCount(0);
    }
  };

  if (notificationCount === 0) {
    return null;
  }

  return (
    <View style={[styles.badge, { top, right }]}>
      <Text style={styles.badgeText}>
        {notificationCount > 99 ? "99+" : notificationCount.toString()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
  },
});

export default UserNotificationBadge;
