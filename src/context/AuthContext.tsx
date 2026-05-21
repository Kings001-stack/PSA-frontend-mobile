import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import * as SecureStore from "expo-secure-store";
import api from "../services/api";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "pharmacist" | "super_admin";
  tenant_id: number;
  phone?: string;
  avatar_url?: string | null;
}

interface AuthContextType {
  user: User | null;
  userToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserInfo: (userData: User) => Promise<void>;
  refreshUserData: () => Promise<User | undefined>;
}

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType,
);

// Export useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userToken, setUserToken] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post("/login", {
        email,
        password,
        device_name: "mobile_app",
      });

      const { access_token, user: userData } = response.data;

      setUserToken(access_token);
      setUser(userData);
      await SecureStore.setItemAsync("userToken", access_token);
      await SecureStore.setItemAsync("userInfo", JSON.stringify(userData));
    } catch (error) {
      // Silently throw error to be handled by the calling component
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserInfo = async (userData: User) => {
    console.log("Updating user info in AuthContext:", userData);
    console.log("Avatar URL:", userData.avatar_url);
    setUser(userData);
    await SecureStore.setItemAsync("userInfo", JSON.stringify(userData));
  };

  const refreshUserData = async () => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      if (token) {
        console.log("Refreshing user data from backend...");
        const response = await api.get("/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Refreshed user data:", response.data);
        console.log("Refreshed avatar_url:", response.data.avatar_url);
        setUser(response.data);
        await SecureStore.setItemAsync(
          "userInfo",
          JSON.stringify(response.data),
        );
        return response.data;
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      throw error;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.post("/logout");
    } catch (e) {
      // Silently handle logout API failure
    }

    setUserToken(null);
    setUser(null);
    await SecureStore.deleteItemAsync("userToken");
    await SecureStore.deleteItemAsync("userInfo");
    setIsLoading(false);
  };

  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      const token = await SecureStore.getItemAsync("userToken");
      const userInfo = await SecureStore.getItemAsync("userInfo");

      if (token && userInfo) {
        // Verify token is still valid with backend
        try {
          console.log("Fetching fresh user data from /user endpoint...");
          const response = await api.get("/user", {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("Fresh user data received:", response.data);
          console.log("Avatar URL in response:", response.data.avatar_url);
          console.log("Avatar path in response:", response.data.avatar_path);

          setUserToken(token);
          setUser(response.data);
          await SecureStore.setItemAsync(
            "userInfo",
            JSON.stringify(response.data),
          );
        } catch (apiError) {
          console.error("Failed to fetch user data:", apiError);
          // Token is invalid or expired, silently logout
          await logout();
        }
      }
    } catch (e) {
      // Silently handle authentication errors
      console.error("isLoggedIn error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        isLoading,
        userToken,
        user,
        updateUserInfo,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
