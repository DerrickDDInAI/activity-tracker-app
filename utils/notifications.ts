import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const CHANNEL_ID = 'activity-tracker-notifications';

export async function setupNotifications() {
  if (Platform.OS === 'web') return;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
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
    });
  }

  await Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
      priority: Notifications.AndroidNotificationPriority.HIGH
    }),
  });

  return true;
}

export async function scheduleNotification(title: string, body: string, trigger: Notifications.NotificationTriggerInput = null) {
  try {
    const notificationContent: Notifications.NotificationRequestInput = {
      content: {
        title,
        body,
        sound: true,
        priority: 'high',
        android: {
          channelId: CHANNEL_ID,
          color: '#FF9500',
        },
      },
      trigger,
    };

    const id = await Notifications.scheduleNotificationAsync(notificationContent);
    return id;
  } catch (error) {
    console.error('Failed to schedule notification:', error);
    return null;
  }
}

export async function cancelNotification(notificationId: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    return true;
  } catch (error) {
    console.error('Failed to cancel notification:', error);
    return false;
  }
}