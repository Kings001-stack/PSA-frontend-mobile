import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import pushNotificationService, {
  PushNotificationData,
} from "../services/pushNotificationService";
import { AuthContext } from "./AuthContext";

interface PushNotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  isPermissionGranted: boolean;
  requestPermission: () => Promise<boolean>;
  scheduleLocalNotification: (
    title: string,
    body: string,
    data?: any,
  ) => Promise<string>;
  cancelNotification: (id: string) => Promise<void>;
}

const PushNotificationContext = createContext<
  PushNotificationContextType | undefined
>(undefined);

interface PushNotificationProviderProps {
  children: ReactNode;
}

export const PushNotificationProvider: React.FC<
  PushNotificationProviderProps
> = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const { user } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    let notificationListener: Notifications.Subscription;
    let responseListener: Notifications.Subscription;

    const initializePushNotifications = async () => {
      // Initialize push notification service
      const token = await pushNotificationService.initialize();
      setExpoPushToken(token);

      if (token) {
        setIsPermissionGranted(true);
      }

      // Listen for notifications received while app is in foreground
      notificationListener =
        pushNotificationService.addNotificationReceivedListener(
          (notification) => {
            console.log("Notification received:", notification);
            setNotification(notification);
          },
        );

      // Listen for notification responses (when user taps notification)
      responseListener =
        pushNotificationService.addNotificationResponseReceivedListener(
          (response) => {
            console.log("Notification response:", response);
            handleNotificationResponse(response);
          },
        );
    };

    if (user) {
      initializePushNotifications();
    }

    return () => {
      if (notificationListener) {
        notificationListener.remove();
      }
      if (responseListener) {
        responseListener.remove();
      }
    };
  }, [user]);

  // Handle notification tap/response
  const handleNotificationResponse = (
    response: Notifications.NotificationResponse,
  ) => {
    const data = response.notification.request.content
      .data as PushNotificationData;

    if (data?.type === "refill_status_update" && data.refillId) {
      // Navigate to refills screen for users
      if (user?.role === "user") {
        router.push("/(user)/refills");
      }
    } else if (data?.type === "new_refill_request") {
      // Navigate to refill management for admins/pharmacists
      if (user?.role === "admin" || user?.role === "pharmacist") {
        router.push("/(admin)/refills");
      }
    }
  };

  // Update token when user changes
  useEffect(() => {
    if (user && expoPushToken) {
      pushNotificationService.updateTokenWithBackend();
    }
  }, [user, expoPushToken]);

  // Remove token when user logs out
  useEffect(() => {
    if (!user && expoPushToken) {
      pushNotificationService.removeTokenFromBackend();
    }
  }, [user]);

  const requestPermission = async (): Promise<boolean> => {
    try {
      const { status } = await pushNotificationService.requestPermissions();
      const granted = status === "granted";
      setIsPermissionGranted(granted);

      if (granted && !expoPushToken) {
        const token = await pushNotificationService.initialize();
        setExpoPushToken(token);
      }

      return granted;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  };

  const scheduleLocalNotification = async (
    title: string,
    body: string,
    data?: any,
  ): Promise<string> => {
    return await pushNotificationService.scheduleLocalNotification(
      title,
      body,
      data,
    );
  };

  const cancelNotification = async (id: string): Promise<void> => {
    await pushNotificationService.cancelNotification(id);
  };

  const value: PushNotificationContextType = {
    expoPushToken,
    notification,
    isPermissionGranted,
    requestPermission,
    scheduleLocalNotification,
    cancelNotification,
  };

  return (
    <PushNotificationContext.Provider value={value}>
      {children}
    </PushNotificationContext.Provider>
  );
};

export const usePushNotifications = (): PushNotificationContextType => {
  const context = useContext(PushNotificationContext);
  if (context === undefined) {
    throw new Error(
      "usePushNotifications must be used within a PushNotificationProvider",
    );
  }
  return context;
};
