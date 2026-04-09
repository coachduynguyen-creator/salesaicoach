import AsyncStorage from '@react-native-async-storage/async-storage';
import { AITier } from '../config/systemPrompts';

const SUB_KEY = '@salescoach_subscription';

export type PlanTier = 'free' | 'pro' | 'bds_pro' | 'team';

export interface SubscriptionInfo {
  tier: PlanTier;
  expiresAt: string | null;
  trialEndsAt: string | null;
}

export const PLAN_LIMITS: Record<PlanTier, {
  recordingsPerMonth: number;
  aiChatsPerMonth: number;
  lessonsAccess: number;
  teamMembers: number;
  adminDashboard: boolean;
  exportReport: boolean;
}> = {
  free: {
    recordingsPerMonth: 3,
    aiChatsPerMonth: 10,
    lessonsAccess: 5,
    teamMembers: 1,
    adminDashboard: false,
    exportReport: false,
  },
  pro: {
    recordingsPerMonth: 999,
    aiChatsPerMonth: 999,
    lessonsAccess: 32,
    teamMembers: 1,
    adminDashboard: false,
    exportReport: true,
  },
  bds_pro: {
    recordingsPerMonth: 999,
    aiChatsPerMonth: 999,
    lessonsAccess: 32,
    teamMembers: 1,
    adminDashboard: false,
    exportReport: true,
  },
  team: {
    recordingsPerMonth: 999,
    aiChatsPerMonth: 999,
    lessonsAccess: 32,
    teamMembers: 50,
    adminDashboard: true,
    exportReport: true,
  },
};

export const PLAN_PRICES = {
  pro: { monthly: 249000, yearly: 1990000 },
  bds_pro: { monthly: 499000, yearly: 3990000 },
  team: { monthly: 699000, yearly: 5990000 },
};

const DEFAULT_SUB: SubscriptionInfo = {
  tier: 'free',
  expiresAt: null,
  trialEndsAt: null,
};

export async function getSubscription(): Promise<SubscriptionInfo> {
  const raw = await AsyncStorage.getItem(SUB_KEY);
  if (!raw) return DEFAULT_SUB;
  try {
    const sub = JSON.parse(raw) as SubscriptionInfo;
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
  if (sub.tier === 'bds_pro') return 'bds_pro';
  if (sub.tier === 'pro' || sub.tier === 'team') return 'pro';
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
  await AsyncStorage.setItem(SUB_KEY, JSON.stringify({
    tier, expiresAt: expires.toISOString(), trialEndsAt: null,
  }));
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
