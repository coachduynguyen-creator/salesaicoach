import AsyncStorage from '@react-native-async-storage/async-storage';

const SUB_KEY = '@salescoach_subscription';

export type PlanTier = 'free' | 'pro' | 'team';

export interface SubscriptionInfo {
  tier: PlanTier;
  expiresAt: string | null; // ISO date, null = never (free)
  trialEndsAt: string | null;
}

export const PLAN_LIMITS: Record<PlanTier, {
  recordingsPerMonth: number;
  aiChatsPerMonth: number;
  lessonsAccess: number; // số bài học mở khóa
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
  pro: { monthly: 249000, yearly: 1990000 }, // VND
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
    // Kiểm tra hết hạn
    if (sub.expiresAt && new Date(sub.expiresAt) < new Date()) {
      return { ...DEFAULT_SUB, trialEndsAt: sub.trialEndsAt };
    }
    // Kiểm tra trial
    if (sub.trialEndsAt && new Date(sub.trialEndsAt) < new Date() && sub.tier !== 'free') {
      if (!sub.expiresAt) return DEFAULT_SUB; // trial hết, chưa mua
    }
    return sub;
  } catch {
    return DEFAULT_SUB;
  }
}

export async function startTrial(): Promise<void> {
  const existing = await getSubscription();
  if (existing.trialEndsAt) return; // đã trial rồi
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 7);
  const sub: SubscriptionInfo = {
    tier: 'pro',
    expiresAt: null,
    trialEndsAt: trialEnd.toISOString(),
  };
  await AsyncStorage.setItem(SUB_KEY, JSON.stringify(sub));
}

export async function activateSubscription(tier: PlanTier, durationMonths: number): Promise<void> {
  const expires = new Date();
  expires.setMonth(expires.getMonth() + durationMonths);
  const sub: SubscriptionInfo = {
    tier,
    expiresAt: expires.toISOString(),
    trialEndsAt: (await getSubscription()).trialEndsAt,
  };
  await AsyncStorage.setItem(SUB_KEY, JSON.stringify(sub));
}

export function isFeatureAvailable(tier: PlanTier, feature: keyof typeof PLAN_LIMITS.free): boolean {
  const limit = PLAN_LIMITS[tier][feature];
  if (typeof limit === 'boolean') return limit;
  return true;
}

export function formatPrice(vnd: number): string {
  return vnd.toLocaleString('vi-VN') + 'đ';
}
