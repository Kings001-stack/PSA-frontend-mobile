import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import api from "./api";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface PushNotificationData {
  type: "refill_status_update" | "new_refill_request" | "general";
  refillId?: number;
  status?: string;
  title: string;
  body: string;
}

class PushNotificationService {
  private expoPushToken: string | null = null;

  /**
   * Initialize push notifications
   */
  async initialize(): Promise<string | null> {
    try {
      // Check if device supports push notifications
      if (!Device.isDevice) {
        console.log("Push notifications only work on physical devices");
        return null;
      }

      // Get existing permission status
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permission if not granted
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Push notification permission not granted");
        return null;
      }

      // Get push token
      const token = await this.getExpoPushToken();

      if (token) {
        // Register token with backend
        await this.registerTokenWithBackend(token);
        this.expoPushToken = token;
      }

      return token;
    } catch (error) {
      console.log("Push notifications initialization skipped:", error);
      return null;
    }
  }

  /**
   * Get Expo push token
   */
  private async getExpoPushToken(): Promise<string | null> {
    try {
      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        Constants.easConfig?.projectId;

      if (!projectId) {
        console.log(
          "Project ID not found - Push notifications require EAS project setup",
        );
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      return token.data;
    } catch (error) {
      console.log("Push notifications not available:", error);
      return null;
    }
  }

  /**
   * Register push token with backend
   */
  private async registerTokenWithBackend(token: string): Promise<void> {
    try {
      await api.post("/user/push-token", {
        push_token: token,
        platform: Platform.OS,
        device_name: Device.deviceName || "Unknown Device",
      });
      console.log("Push token registered with backend");
    } catch (error) {
      console.error("Error registering push token:", error);
    }
  }

  /**
   * Schedule a local notification
   */
  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: any,
    trigger?: Notifications.NotificationTriggerInput,
  ): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: "default",
      },
      trigger: trigger || null,
    });
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Get notification permissions status
   */
  async getPermissionStatus(): Promise<Notifications.NotificationPermissionsStatus> {
    return await Notifications.getPermissionsAsync();
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<Notifications.NotificationPermissionsStatus> {
    return await Notifications.requestPermissionsAsync();
  }

  /**
   * Handle notification received while app is in foreground
   */
  addNotificationReceivedListener(
    listener: (notification: Notifications.Notification) => void,
  ): Notifications.EventSubscription {
    return Notifications.addNotificationReceivedListener(listener);
  }

  /**
   * Handle notification response (when user taps notification)
   */
  addNotificationResponseReceivedListener(
    listener: (response: Notifications.NotificationResponse) => void,
  ): Notifications.EventSubscription {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  /**
   * Get current push token
   */
  getCurrentToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Update push token with backend (call when user logs in/out)
   */
  async updateTokenWithBackend(): Promise<void> {
    if (this.expoPushToken) {
      await this.registerTokenWithBackend(this.expoPushToken);
    }
  }

  /**
   * Remove push token from backend (call when user logs out)
   */
  async removeTokenFromBackend(): Promise<void> {
    try {
      if (this.expoPushToken) {
        await api.delete("/user/push-token", {
          data: { push_token: this.expoPushToken },
        });
        console.log("Push token removed from backend");
      }
    } catch (error) {
      console.error("Error removing push token:", error);
    }
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();
export default pushNotificationService;
