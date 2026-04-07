import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const NOTIFICATION_KEY = '@salescoach_notifications_enabled';

// Setup notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/** Request permission */
export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
}

/** Bật nhắc nhở hàng ngày */
export async function enableDailyReminders(): Promise<void> {
  const granted = await requestNotificationPermission();
  if (!granted) return;

  // Hủy tất cả notification cũ
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Nhắc học bài - 8h sáng
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Sales Coach',
      body: 'Hôm nay bạn đã học bài chưa? Mở app để tiếp tục nâng cao kỹ năng tư vấn.',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 8,
      minute: 0,
    },
  });

  // Nhắc ghi âm - 17h chiều
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Sales Coach',
      body: 'Buổi tư vấn hôm nay thế nào? Ghi âm và phân tích để cải thiện.',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 17,
      minute: 0,
    },
  });

  await AsyncStorage.setItem(NOTIFICATION_KEY, 'true');
}

/** Tắt nhắc nhở */
export async function disableReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await AsyncStorage.setItem(NOTIFICATION_KEY, 'false');
}

/** Kiểm tra trạng thái */
export async function isRemindersEnabled(): Promise<boolean> {
  const val = await AsyncStorage.getItem(NOTIFICATION_KEY);
  return val === 'true';
}
