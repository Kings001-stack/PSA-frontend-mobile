import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";

// API URL Configuration:
// - Android Emulator: use '10.0.2.2'
// - iOS Simulator: use 'localhost'
// - Physical Device (iPhone/Android): use your computer's local IP (found via ipconfig/ifconfig)

// Previous IPs (commented out):
// - 192.168.100.11 (updated: March 11, 2026)
// - 10.254.172.244 (updated: March 12, 2026)
// - 192.168.43.177 (updated: March 17, 2026)
// - 192.168.0.194 (updated: March 30, 2026)
// - 10.92.124.244 (updated: April 6, 2026)
// - 192.168.100.11 (updated: April 11, 2026 - morning)
// - 10.94.174.244 (updated: April 11, 2026 - evening)
// - 192.168.100.11 (updated: April 11, 2026 - night)
// - 192.168.0.194 (updated: April 30, 2026 - afternoon)
// - 10.77.181.244 (updated: April 30, 2026 - evening)
// - 192.168.100.11 (updated: May 4, 2026 - evening)

// Current Wi-Fi IP: 192.168.0.194 (updated: May 9, 2026)
const BASE_URL = "http://192.168.0.194:8000";
export const API_URL = `${BASE_URL}/api`;
export const STORAGE_URL = `${BASE_URL}/storage`;

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Interceptor to add the token to every request
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  try {
    const token = await SecureStore.getItemAsync("userToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error("Error fetching token", error);
  }
  return config;
});

export default api;
