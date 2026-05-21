import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import SuperAdminTabBar from "../../src/components/SuperAdminTabBar";

export default function SuperAdminLayout() {
  return (
    <Tabs
      tabBar={(props) => <SuperAdminTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Main 5 Navigation Tabs */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: "Users",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "people" : "people-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: "Activity",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "pulse" : "pulse-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="security"
        options={{
          title: "Security",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "shield-checkmark" : "shield-checkmark-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />

      {/* Hidden Screens - Accessible via navigation */}
      <Tabs.Screen
        name="user-details"
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="create-admin"
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="create-pharmacist"
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          tabBarButton: () => null,
        }}
      />
    </Tabs>
  );
}
