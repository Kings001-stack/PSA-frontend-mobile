import React, { createContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user' | 'pharmacist' | 'staff';
    tenant_id: number;
    phone?: string;
}

interface AuthContextType {
    user: User | null;
    userToken: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUserInfo: (userData: User) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [userToken, setUserToken] = useState<string | null>(null);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await api.post('/login', {
                email,
                password,
                device_name: 'mobile_app'
            });

            const { access_token, user: userData } = response.data;

            setUserToken(access_token);
            setUser(userData);
            await SecureStore.setItemAsync('userToken', access_token);
            await SecureStore.setItemAsync('userInfo', JSON.stringify(userData));

        } catch (error) {
            console.error('Login failed', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const updateUserInfo = async (userData: User) => {
        setUser(userData);
        await SecureStore.setItemAsync('userInfo', JSON.stringify(userData));
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await api.post('/logout');
        } catch (e) {
            console.error('Logout API failed', e);
        }

        setUserToken(null);
        setUser(null);
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('userInfo');
        setIsLoading(false);
    };

    const isLoggedIn = async () => {
        try {
            setIsLoading(true);
            const token = await SecureStore.getItemAsync('userToken');
            const userInfo = await SecureStore.getItemAsync('userInfo');

            if (token && userInfo) {
                // Verify token is still valid with backend
                try {
                    const response = await api.get('/user', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUserToken(token);
                    setUser(response.data);
                    await SecureStore.setItemAsync('userInfo', JSON.stringify(response.data));
                } catch (apiError) {
                    console.error('Stored token is invalid', apiError);
                    await logout();
                }
            }
        } catch (e) {
            console.error('isLoggedIn authentication error', e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        isLoggedIn();
    }, []);

    return (
        <AuthContext.Provider value={{ login, logout, isLoading, userToken, user, updateUserInfo }}>
            {children}
        </AuthContext.Provider>
    );
};
