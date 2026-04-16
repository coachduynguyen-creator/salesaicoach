import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { supabase } from './supabaseClient';

const NOTIFICATION_KEY = '@salescoach_notifications_enabled';
const PUSH_TOKEN_KEY = '@salescoach_push_token';

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

/**
 * Đăng ký Expo push token và lưu vào profiles.push_token.
 * Gọi sau khi user đăng nhập xong. Chỉ chạy trên thiết bị thật.
 */
export async function registerPushToken(userId: string): Promise<string | null> {
  try {
    // Không support web; simulator/emulator sẽ tự fail ở getExpoPushTokenAsync bên dưới
    if (Platform.OS === 'web') return null;

    const granted = await requestNotificationPermission();
    if (!granted) return null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'default',
      });
    }

    const projectId =
      (Constants.expoConfig as any)?.extra?.eas?.projectId ??
      (Constants.easConfig as any)?.projectId;

    const tokenResp = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    const token = tokenResp.data;
    if (!token) return null;

    // Chỉ update Supabase nếu token thay đổi (tránh write không cần thiết)
    const cached = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
    if (cached !== token) {
      await supabase.from('profiles').update({ push_token: token }).eq('id', userId);
      await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
    }
    return token;
  } catch {
    return null;
  }
}

/** Xoá push token khỏi server khi user đăng xuất để không push nhầm tới thiết bị cũ */
export async function clearPushToken(userId: string): Promise<void> {
  try {
    await supabase.from('profiles').update({ push_token: null }).eq('id', userId);
    await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
  } catch {
    /* im lặng — không chặn signout flow */
  }
}
