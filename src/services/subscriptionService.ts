import AsyncStorage from '@react-native-async-storage/async-storage';
import { AITier } from '../config/systemPrompts';
import { getRemotePricing } from './remoteConfigService';
import { supabase } from './supabaseClient';

const SUB_KEY = '@salescoach_subscription';

export type PlanTier = 'free' | 'pro' | 'bds_pro' | 'team_s' | 'team_m' | 'team_l';

/** Legacy alias — giữ tương thích với code cũ dùng 'team' */
export type LegacyPlanTier = PlanTier | 'team';

export interface SubscriptionInfo {
  tier: PlanTier;
  expiresAt: string | null;
  trialEndsAt: string | null;
}

export interface PlanLimits {
  recordingsPerMonth: number;
  aiChatsPerMonth: number;
  lessonsAccess: number;
  teamMembers: number;
  adminDashboard: boolean;
  exportReport: boolean;
  bdsContext: boolean;
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: {
    recordingsPerMonth: 3,
    aiChatsPerMonth: 10,
    lessonsAccess: 5,
    teamMembers: 1,
    adminDashboard: false,
    exportReport: false,
    bdsContext: false,
  },
  pro: {
    recordingsPerMonth: 999,
    aiChatsPerMonth: 999,
    lessonsAccess: 32,
    teamMembers: 1,
    adminDashboard: false,
    exportReport: true,
    bdsContext: false,
  },
  bds_pro: {
    recordingsPerMonth: 999,
    aiChatsPerMonth: 999,
    lessonsAccess: 32,
    teamMembers: 1,
    adminDashboard: false,
    exportReport: true,
    bdsContext: true,
  },
  team_s: {
    recordingsPerMonth: 999,
    aiChatsPerMonth: 999,
    lessonsAccess: 32,
    teamMembers: 5,
    adminDashboard: true,
    exportReport: true,
    bdsContext: false,
  },
  team_m: {
    recordingsPerMonth: 999,
    aiChatsPerMonth: 999,
    lessonsAccess: 32,
    teamMembers: 10,
    adminDashboard: true,
    exportReport: true,
    bdsContext: false,
  },
  team_l: {
    recordingsPerMonth: 999,
    aiChatsPerMonth: 999,
    lessonsAccess: 32,
    teamMembers: 20,
    adminDashboard: true,
    exportReport: true,
    bdsContext: false,
  },
};

export const PLAN_PRICES: Record<string, { monthly: number; yearly: number }> = {
  pro:    { monthly:   499000, yearly:  4790000 },
  bds_pro:{ monthly:  1000000, yearly:  9600000 },
  team_s: { monthly:  1999000, yearly: 19190000 },
  team_m: { monthly:  3499000, yearly: 33590000 },
  team_l: { monthly:  5999000, yearly: 57590000 },
};

/** Tên hiển thị */
export const PLAN_LABELS: Record<PlanTier, string> = {
  free: 'Free',
  pro: 'Pro',
  bds_pro: 'BĐS Pro',
  team_s: 'Team S (5 người)',
  team_m: 'Team M (10 người)',
  team_l: 'Team L (20 người)',
};

/** Normalize legacy 'team' tier */
export function normalizeTier(tier: string): PlanTier {
  if (tier === 'team') return 'team_s';
  if (Object.keys(PLAN_LIMITS).includes(tier)) return tier as PlanTier;
  return 'free';
}

const DEFAULT_SUB: SubscriptionInfo = {
  tier: 'free',
  expiresAt: null,
  trialEndsAt: null,
};

export async function getSubscription(): Promise<SubscriptionInfo> {
  let serverReachable = false;
  // 1. Kiểm tra server-side subscription trước (source of truth)
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: serverSub, error } = await supabase
        .from('subscriptions')
        .select('tier, expires_at')
        .eq('user_id', user.id)
        .maybeSingle();

      serverReachable = !error;

      if (serverSub) {
        const tier = normalizeTier(serverSub.tier);
        const expired = serverSub.expires_at && new Date(serverSub.expires_at) < new Date();
        if (!expired) {
          const sub: SubscriptionInfo = { tier, expiresAt: serverSub.expires_at, trialEndsAt: null };
          await AsyncStorage.setItem(SUB_KEY, JSON.stringify(sub));
          return sub;
        }
      } else if (serverReachable) {
        // Server xác nhận user CHƯA có subscription → đúng là free
        return DEFAULT_SUB;
      }
    }
  } catch {
    // Offline
  }

  // 2. Fallback: đọc local (offline hoặc server chưa có data)
  const raw = await AsyncStorage.getItem(SUB_KEY);
  if (!raw) return DEFAULT_SUB;
  try {
    const sub = JSON.parse(raw) as SubscriptionInfo;
    sub.tier = normalizeTier(sub.tier);
    if (sub.expiresAt && new Date(sub.expiresAt) < new Date()) {
      return { ...DEFAULT_SUB, trialEndsAt: sub.trialEndsAt };
    }
    if (sub.trialEndsAt && new Date(sub.trialEndsAt) < new Date() && sub.tier !== 'free') {
      if (!sub.expiresAt) return DEFAULT_SUB;
    }
    return sub;
  } catch {
    return DEFAULT_SUB;
  }
}

/** Lấy AI tier (map từ PlanTier sang AITier) */
export async function getAITier(): Promise<AITier> {
  const sub = await getSubscription();
  const tier = normalizeTier(sub.tier);
  if (tier === 'bds_pro') return 'bds_pro';
  if (tier !== 'free') return 'pro';
  return 'free';
}

export async function startTrial(): Promise<void> {
  const existing = await getSubscription();
  if (existing.trialEndsAt) return;
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 7);
  await AsyncStorage.setItem(SUB_KEY, JSON.stringify({
    tier: 'pro', expiresAt: null, trialEndsAt: trialEnd.toISOString(),
  }));
}

export async function activateSubscription(tier: PlanTier, durationMonths: number): Promise<void> {
  const expires = new Date();
  expires.setMonth(expires.getMonth() + durationMonths);
  await AsyncStorage.setItem(SUB_KEY, JSON.stringify({
    tier, expiresAt: expires.toISOString(),
    trialEndsAt: (await getSubscription()).trialEndsAt,
  }));
}

/** Admin: chuyển tier để test (không cần thanh toán) */
export async function adminSetTier(tier: PlanTier): Promise<void> {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 10); // 10 năm

  // Ghi local
  await AsyncStorage.setItem(SUB_KEY, JSON.stringify({
    tier, expiresAt: expires.toISOString(), trialEndsAt: null,
  }));

  // Ghi Supabase (source of truth) — tránh bị overwrite khi getSubscription
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('subscriptions').upsert({
        user_id: user.id,
        tier,
        expires_at: expires.toISOString(),
        activated_by: user.id,
        payment_note: 'Admin test mode',
      }, { onConflict: 'user_id' });
    }
  } catch {
    // Offline - local copy sẽ đồng bộ sau
  }
}

export function isFeatureAvailable(tier: PlanTier, feature: keyof typeof PLAN_LIMITS.free): boolean {
  const limits = PLAN_LIMITS[tier] || PLAN_LIMITS.free;
  const limit = limits[feature];
  if (typeof limit === 'boolean') return limit;
  return true;
}

export function formatPrice(vnd: number): string {
  return vnd.toLocaleString('vi-VN') + 'đ';
}

/** Lấy giá từ remote config (fallback về PLAN_PRICES nếu offline) */
export async function getPricing(): Promise<typeof PLAN_PRICES> {
  try {
    return await getRemotePricing();
  } catch {
    return PLAN_PRICES;
  }
}
