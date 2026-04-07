import * as ImagePicker from 'expo-image-picker';
import { documentDirectory, getInfoAsync, makeDirectoryAsync, copyAsync, deleteAsync } from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AVATAR_DIR = `${documentDirectory}avatars/`;
const USER_AVATAR_KEY = '@salescoach_user_avatar';

async function ensureDir() {
  const info = await getInfoAsync(AVATAR_DIR);
  if (!info.exists) {
    await makeDirectoryAsync(AVATAR_DIR, { intermediates: true });
  }
}

/** Copy ảnh vào thư mục app, trả về URI mới */
async function saveLocally(sourceUri: string, name: string): Promise<string> {
  await ensureDir();
  const ext = sourceUri.split('.').pop()?.split('?')[0] || 'jpg';
  const dest = `${AVATAR_DIR}${name}.${ext}`;
  await copyAsync({ from: sourceUri, to: dest });
  return dest;
}

/** Mở thư viện ảnh, trả về URI hoặc null nếu hủy */
export async function pickFromGallery(): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });

  if (result.canceled || !result.assets?.length) return null;
  return result.assets[0].uri;
}

/** Mở camera, trả về URI hoặc null nếu hủy */
export async function takePhoto(): Promise<string | null> {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) return null;

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });

  if (result.canceled || !result.assets?.length) return null;
  return result.assets[0].uri;
}

/** Lưu avatar user */
export async function saveUserAvatar(uri: string): Promise<string> {
  const saved = await saveLocally(uri, 'user_avatar');
  await AsyncStorage.setItem(USER_AVATAR_KEY, saved);
  return saved;
}

/** Lấy avatar user */
export async function loadUserAvatar(): Promise<string | null> {
  const uri = await AsyncStorage.getItem(USER_AVATAR_KEY);
  if (!uri) return null;
  const info = await getInfoAsync(uri);
  return info.exists ? uri : null;
}

/** Xóa avatar user */
export async function removeUserAvatar(): Promise<void> {
  const uri = await AsyncStorage.getItem(USER_AVATAR_KEY);
  if (uri) {
    const info = await getInfoAsync(uri);
    if (info.exists) await deleteAsync(uri);
  }
  await AsyncStorage.removeItem(USER_AVATAR_KEY);
}

/** Lưu ảnh khách hàng, trả về URI local */
export async function saveCustomerPhoto(customerId: string, uri: string): Promise<string> {
  return saveLocally(uri, `customer_${customerId}`);
}

/** Xóa ảnh khách hàng */
export async function removeCustomerPhoto(customerId: string): Promise<void> {
  const pattern = `${AVATAR_DIR}customer_${customerId}`;
  // Xóa mọi extension
  for (const ext of ['jpg', 'jpeg', 'png', 'webp']) {
    const path = `${pattern}.${ext}`;
    const info = await getInfoAsync(path);
    if (info.exists) await deleteAsync(path);
  }
}
