import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface QuickStatsCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  trend?: number;
  color: string;
  backgroundColor: string;
}

const QuickStatsCard: React.FC<QuickStatsCardProps> = ({
  icon,
  label,
  value,
  trend,
  color,
  backgroundColor,
}) => {
  return (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.valueRow}>
          <Text style={styles.value}>{value}</Text>
          {trend !== undefined && (
            <View
              style={[
                styles.trendBadge,
                { backgroundColor: trend >= 0 ? "#dcfce7" : "#fee2e2" },
              ]}
            >
              <Ionicons
                name={trend >= 0 ? "trending-up" : "trending-down"}
                size={12}
                color={trend >= 0 ? "#16a34a" : "#dc2626"}
              />
              <Text
                style={[
                  styles.trendText,
                  { color: trend >= 0 ? "#16a34a" : "#dc2626" },
                ]}
              >
                {Math.abs(trend)}%
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  value: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1e293b",
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  trendText: {
    fontSize: 10,
    fontWeight: "700",
  },
});

export default QuickStatsCard;
