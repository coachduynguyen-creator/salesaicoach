import * as SecureStore from 'expo-secure-store';

const SECURE_PREFIX = 'sc_secure_';

/** Lưu giá trị an toàn (mã hóa bởi OS) */
export async function secureSet(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(SECURE_PREFIX + key, value);
  } catch {
    // Fallback: một số thiết bị không hỗ trợ SecureStore
  }
}

/** Đọc giá trị an toàn */
export async function secureGet(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(SECURE_PREFIX + key);
  } catch {
    return null;
  }
}

/** Xóa giá trị an toàn */
export async function secureDelete(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SECURE_PREFIX + key);
  } catch {}
}

// Keys cho các dữ liệu nhạy cảm
export const SECURE_KEYS = {
  OPENAI_KEY: 'openai_api_key',
  CLAUDE_KEY: 'claude_api_key',
  USER_TOKEN: 'user_auth_token',
} as const;
