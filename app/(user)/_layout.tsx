import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from 'react-native';

export default function UserLayout() {
    return (
        <Tabs screenOptions={{
            tabBarActiveTintColor: "#1d4ed8",
            tabBarInactiveTintColor: "#6b7280",
            headerShown: false,
            tabBarStyle: {
                display: 'none',
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
                    title: "Home",
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
                            <Ionicons name={focused ? "home" : "home-outline"} size={22} color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="chat"
                options={{
                    title: "Assistant",
                    tabBarLabel: "Chat",
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
                            <Ionicons name={focused ? "chatbubbles" : "chatbubbles-outline"} size={22} color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="medications"
                options={{
                    title: "Medications",
                    href: null,
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
