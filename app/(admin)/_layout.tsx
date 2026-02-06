import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from 'react-native';

export default function AdminLayout() {
    return (
        <Tabs screenOptions={{
            tabBarActiveTintColor: "#1d4ed8",
            tabBarInactiveTintColor: "#6b7280",
            headerShown: false,
            tabBarStyle: {
                backgroundColor: 'white',
                borderTopWidth: 0,
                elevation: 25,
                shadowColor: '#1d4ed8',
                shadowOffset: { width: 0, height: -10 },
                shadowOpacity: 0.08,
                shadowRadius: 15,
                height: 65,
                paddingBottom: 12,
                paddingTop: 8,
                marginHorizontal: 16,
                marginBottom: 10,
                borderRadius: 20,
                position: 'absolute',
                borderWidth: 1,
                borderColor: '#f3f4f6',
            },
            tabBarLabelStyle: {
                fontSize: 9,
                fontWeight: '800',
                marginTop: -2,
            },
        }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: "Dashboard",
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
                            <Ionicons name={focused ? "stats-chart" : "stats-chart-outline"} size={22} color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="inventory"
                options={{
                    title: "Inventory",
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
                            <Ionicons name={focused ? "list" : "list-outline"} size={22} color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="adverts"
                options={{
                    title: "Adverts",
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
                            <Ionicons name={focused ? "megaphone" : "megaphone-outline"} size={22} color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="inventory-import"
                options={{
                    href: null, // Hide from tab bar
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
        </Tabs>
    );
}

const styles = StyleSheet.create({
    iconContainer: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    activeIconContainer: {
        backgroundColor: '#eff6ff',
    },
});
