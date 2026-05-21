import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import UserTabBar from "../../src/components/UserTabBar";

export default function UserLayout() {
  return (
    <Tabs
      tabBar={(props) => <UserTabBar {...props} />}
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
        name="medications"
        options={{
          title: "Medications",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "medical" : "medical-outline"}
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
        name="chat"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="theme-settings"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
