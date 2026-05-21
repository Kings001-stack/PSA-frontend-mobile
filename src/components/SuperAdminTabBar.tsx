import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
} from "../styles/superAdminTheme";

export default function SuperAdminTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  // Filter out hidden routes (those with tabBarButton: () => null)
  const visibleRoutes = state.routes.filter((route) => {
    const { options } = descriptors[route.key];
    return options.tabBarButton !== undefined
      ? options.tabBarButton({}) !== null
      : true;
  });

  return (
    <View
      style={[styles.container, { paddingBottom: insets.bottom || spacing.md }]}
    >
      <View style={styles.tabBar}>
        {visibleRoutes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title || route.name;
          const isFocused = state.index === state.routes.indexOf(route);

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          // Get icon from options
          const iconName = options.tabBarIcon
            ? (options.tabBarIcon as any)({
                color: isFocused ? colors.primary : colors.textSecondary,
                focused: isFocused,
              }).props.name
            : "ellipse";

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tab}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.tabContent,
                  isFocused && styles.tabContentActive,
                ]}
              >
                <Ionicons
                  name={iconName}
                  size={22}
                  color={isFocused ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: isFocused ? colors.primary : colors.textSecondary,
                    },
                    isFocused && styles.tabLabelActive,
                  ]}
                >
                  {label}
                </Text>
              </View>
              {isFocused && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.md,
  },
  tabBar: {
    flexDirection: "row",
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    position: "relative",
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    minHeight: 56,
  },
  tabContentActive: {
    backgroundColor: colors.primaryBg,
  },
  tabLabel: {
    fontSize: typography.xs,
    fontWeight: typography.medium,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  tabLabelActive: {
    fontWeight: typography.semibold,
  },
  activeIndicator: {
    position: "absolute",
    top: 0,
    width: 32,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
});
