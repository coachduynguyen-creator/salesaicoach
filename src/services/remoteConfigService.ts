import { supabase } from './supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = '@salescoach_remote_config';
const CACHE_TTL = 5 * 60 * 1000; // 5 phút

interface CachedConfig {
  data: Record<string, any>;
  fetchedAt: number;
}

let memoryCache: CachedConfig | null = null;

/** Lấy toàn bộ config từ Supabase (có cache) */
export async function fetchAllConfig(): Promise<Record<string, any>> {
  // Check memory cache
  if (memoryCache && Date.now() - memoryCache.fetchedAt < CACHE_TTL) {
    return memoryCache.data;
  }

  try {
    const { data, error } = await supabase
      .from('app_config')
      .select('key, value');

    if (error || !data) {
      // Fallback to local cache
      return loadLocalCache();
    }

    const config: Record<string, any> = {};
    for (const row of data) {
      config[row.key] = row.value;
    }

    // Save to caches
    memoryCache = { data: config, fetchedAt: Date.now() };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache));

    return config;
  } catch {
    return loadLocalCache();
  }
}

/** Lấy 1 config cụ thể */
export async function getConfig<T = any>(key: string, fallback: T): Promise<T> {
  const all = await fetchAllConfig();
  return (all[key] as T) ?? fallback;
}

/** Admin: cập nhật config */
export async function updateConfig(key: string, value: any): Promise<boolean> {
  const { error } = await supabase
    .from('app_config')
    .upsert({ key, value }, { onConflict: 'key' });

  if (!error) {
    // Invalidate cache
    memoryCache = null;
    await AsyncStorage.removeItem(CACHE_KEY);
  }

  return !error;
}

/** Lấy giá từ remote config */
export async function getRemotePricing(): Promise<Record<string, { monthly: number; yearly: number }>> {
  return getConfig('pricing', {
    pro:     { monthly:   499000, yearly:  4790000 },
    bds_pro: { monthly:  1000000, yearly:  9600000 },
    team_s:  { monthly:  1999000, yearly: 19190000 },
    team_m:  { monthly:  3499000, yearly: 33590000 },
    team_l:  { monthly:  5999000, yearly: 57590000 },
  });
}

/** Lấy thông báo */
export async function getAnnouncement(): Promise<{
  enabled: boolean;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  dismissable: boolean;
} | null> {
  const ann = await getConfig<{
    enabled: boolean; title: string; message: string;
    type: 'info' | 'warning' | 'success'; dismissable: boolean;
  } | null>('announcement', null);
  if (!ann || !ann.enabled) return null;
  return ann;
}

/** Kiểm tra chế độ bảo trì */
export async function isMaintenanceMode(): Promise<{ enabled: boolean; message: string }> {
  return getConfig('maintenance', { enabled: false, message: '' });
}

/** Lấy feature flags */
export async function getFeatureFlags(): Promise<Record<string, boolean>> {
  return getConfig('feature_flags', {
    ai_coach: true,
    recording: true,
    crm: true,
    training: true,
    script_generator: true,
    goal_setting: true,
  });
}

/** Xóa cache (dùng khi admin vừa update) */
export function invalidateCache(): void {
  memoryCache = null;
}

// ── Internal ──────────────────────────────────────────────

async function loadLocalCache(): Promise<Record<string, any>> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (raw) {
      const cached = JSON.parse(raw) as CachedConfig;
      memoryCache = cached;
      return cached.data;
    }
  } catch {
    // ignore
  }
  return {};
}
