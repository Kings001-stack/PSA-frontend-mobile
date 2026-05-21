import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AdminTabBar from "../../src/components/AdminTabBar";

export default function AdminLayout() {
  return (
    <Tabs
      tabBar={(props) => <AdminTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={18}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: "Inventory",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "list" : "list-outline"}
              size={18}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="refills"
        options={{
          title: "Refills",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "refresh-circle" : "refresh-circle-outline"}
              size={18}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analytics",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "stats-chart" : "stats-chart-outline"}
              size={18}
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
              size={18}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="adverts"
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="inventory-import"
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="user-management"
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="theme-settings"
        options={{
          tabBarButton: () => null,
        }}
      />
    </Tabs>
  );
}
