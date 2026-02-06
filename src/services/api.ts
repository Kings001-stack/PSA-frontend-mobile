import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

// API URL Configuration:
// - Android Emulator: use '10.0.2.2'
// - iOS Simulator: use 'localhost'
// - Physical Device (iPhone/Android): use your computer's local IP (found via ipconfig/ifconfig)
const API_URL = 'http://10.152.239.244:8000/api';

const api: AxiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 30000, // 30 second timeout
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Interceptor to add the token to every request
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    try {
        const token = await SecureStore.getItemAsync('userToken');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (error) {
        console.error('Error fetching token', error);
    }
    return config;
});

export default api;
