import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen from '../screens/LoginScreen';
import ChatScreen from '../screens/ChatScreen';
import InventoryScreen from '../screens/InventoryScreen';
import { AuthContext } from '../context/AuthContext';

export type RootStackParamList = {
    Login: undefined;
    Chat: undefined;
    Inventory: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AuthStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
);

const AppStack = () => {
    const { logout } = useContext(AuthContext);

    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#ffffff',
                    elevation: 0,
                    shadowOpacity: 0,
                    borderBottomWidth: 1,
                    borderBottomColor: '#f3f4f6',
                },
                headerTitleStyle: {
                    fontWeight: 'bold',
                    color: '#111827',
                },
                headerTintColor: '#2563eb',
            }}
        >
            <Stack.Screen
                name="Chat"
                component={ChatScreen}
                options={{
                    title: 'Assistant',
                    headerRight: () => (
                        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                            <Ionicons name="log-out-outline" size={22} color="#2563eb" />
                        </TouchableOpacity>
                    ),
                }}
            />
            <Stack.Screen
                name="Inventory"
                component={InventoryScreen}
                options={{ title: 'Stock Management' }}
            />
        </Stack.Navigator>
    );
};

const MainNavigator: React.FC = () => {
    const { userToken, isLoading } = useContext(AuthContext);

    if (isLoading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    return userToken ? <AppStack /> : <AuthStack />;
};

const styles = StyleSheet.create({
    logoutBtn: {
        marginRight: 16,
        padding: 4,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb'
    }
});

export default MainNavigator;
