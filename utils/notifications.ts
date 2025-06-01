import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const CHANNEL_ID = 'activity-reminders';

export interface NotificationError extends Error {
  code: string;
  details?: any;
}

class NotificationServiceError extends Error implements NotificationError {
  code: string;
  details?: any;

  constructor(message: string, code: string, details?: any) {
    super(message);
    this.name = 'NotificationServiceError';
    this.code = code;
    this.details = details;
  }
}

export async function setupNotifications(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      throw new NotificationServiceError(
        'Permission not granted',
        'PERMISSION_DENIED'
      );
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Activity Reminders',
        description: 'Notifications for activity tracking and reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF9500',
        enableVibrate: true,
        enableLights: true,
        sound: true,
      });
    }

    await Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      }),
    });

    return true;
  } catch (error) {
    if (error instanceof NotificationServiceError) {
      throw error;
    }
    throw new NotificationServiceError(
      'Failed to setup notifications',
      'SETUP_FAILED',
      error
    );
  }
}

export async function scheduleActivityReminder(
  title: string,
  body: string,
  trigger: Notifications.NotificationTriggerInput
): Promise<string> {
  if (Platform.OS === 'web') {
    throw new NotificationServiceError(
      'Notifications not supported on web',
      'PLATFORM_NOT_SUPPORTED'
    );
  }

  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        priority: 'high',
        data: { type: 'activity_reminder' },
      },
      trigger,
    });

    return notificationId;
  } catch (error) {
    throw new NotificationServiceError(
      'Failed to schedule notification',
      'SCHEDULE_FAILED',
      error
    );
  }
}

export async function cancelNotification(notificationId: string): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    throw new NotificationServiceError(
      'Failed to cancel notification',
      'CANCEL_FAILED',
      error
    );
  }
}

export async function cancelAllNotifications(): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    throw new NotificationServiceError(
      'Failed to cancel all notifications',
      'CANCEL_ALL_FAILED',
      error
    );
  }
}

export async function getBadgeCount(): Promise<number> {
  if (Platform.OS === 'web') return 0;

  try {
    return await Notifications.getBadgeCountAsync();
  } catch (error) {
    throw new NotificationServiceError(
      'Failed to get badge count',
      'GET_BADGE_FAILED',
      error
    );
  }
}

export async function setBadgeCount(count: number): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    throw new NotificationServiceError(
      'Failed to set badge count',
      'SET_BADGE_FAILED',
      error
    );
  }
}