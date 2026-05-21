import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface NotificationBadgeProps {
  count: number;
  size?: "small" | "medium";
  top?: number;
  right?: number;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  size = "small",
  top = -4,
  right = -4,
}) => {
  if (count === 0) return null;

  const displayCount = count > 99 ? "99+" : count.toString();
  const isSmall = size === "small";

  return (
    <View
      style={[
        styles.badge,
        isSmall ? styles.badgeSmall : styles.badgeMedium,
        { top, right },
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          isSmall ? styles.textSmall : styles.textMedium,
        ]}
      >
        {displayCount}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    backgroundColor: "#dc2626",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  badgeSmall: {
    minWidth: 18,
    height: 18,
  },
  badgeMedium: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
  },
  badgeText: {
    color: "white",
    fontWeight: "800",
    textAlign: "center",
  },
  textSmall: {
    fontSize: 10,
  },
  textMedium: {
    fontSize: 12,
  },
});

export default NotificationBadge;
