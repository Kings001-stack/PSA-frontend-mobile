import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface TabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const FloatingTabBar: React.FC<TabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const [animations] = React.useState(
    state.routes.map(() => new Animated.Value(1)),
  );

  const handlePress = (route: any, index: number, isFocused: boolean) => {
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      // Bounce animation
      Animated.sequence([
        Animated.spring(animations[index], {
          toValue: 0.9,
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

  const visibleRoutes = state.routes.filter((_: any, index: number) => {
    const { options } = descriptors[state.routes[index].key];
    return options.href !== null;
  });

  return (
    <View
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}
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

          // Get icon from options
          const IconComponent = options.tabBarIcon;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={() => handlePress(route, actualIndex, isFocused)}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <Animated.View
                style={[
                  styles.iconWrapper,
                  isFocused && styles.activeIconWrapper,
                  {
                    transform: [{ scale: animations[actualIndex] }],
                  },
                ]}
              >
                {IconComponent &&
                  IconComponent({
                    color: isFocused ? "#2563eb" : "#94a3b8",
                    focused: isFocused,
                    size: 20,
                  })}
                {isFocused && <View style={styles.activeIndicator} />}
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
    paddingHorizontal: 0,
    paddingTop: 0,
    backgroundColor: "white",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 0,
    paddingVertical: 8,
    paddingHorizontal: 8,
    shadowColor: "#1e3a8a",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(226, 232, 240, 0.8)",
    justifyContent: "space-around",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    position: "relative",
    marginBottom: 2,
    backgroundColor: "transparent",
  },
  activeIconWrapper: {
    backgroundColor: "#eff6ff",
    borderWidth: 1.5,
    borderColor: "#dbeafe",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  activeIndicator: {
    position: "absolute",
    bottom: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#2563eb",
  },
  label: {
    fontSize: 9,
    fontWeight: "600",
    color: "#94a3b8",
    letterSpacing: 0.3,
    marginTop: 1,
  },
  activeLabel: {
    color: "#2563eb",
    fontWeight: "800",
  },
});

export default FloatingTabBar;
