import AsyncStorage from '@react-native-async-storage/async-storage';

const STREAK_KEY = '@salescoach_streak';
const LAST_ACTIVE_KEY = '@salescoach_last_active';
const BADGES_KEY = '@salescoach_badges';

export interface StreakInfo {
  current: number;
  longest: number;
  lastDate: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  earnedAt?: string;
}

export const ALL_BADGES: Badge[] = [
  { id: 'first_record', name: 'Buổi đầu tiên', description: 'Ghi âm buổi tư vấn đầu tiên', emoji: '🎙️' },
  { id: 'first_lesson', name: 'Học viên', description: 'Hoàn thành bài học đầu tiên', emoji: '📖' },
  { id: '5_sessions', name: '5 buổi', description: 'Ghi âm 5 buổi tư vấn', emoji: '⭐' },
  { id: '10_sessions', name: '10 buổi', description: 'Ghi âm 10 buổi tư vấn', emoji: '🌟' },
  { id: 'score_8', name: 'Xuất sắc', description: 'Đạt điểm 8+ trong một buổi', emoji: '🏆' },
  { id: 'all_lessons', name: 'Tốt nghiệp', description: 'Hoàn thành tất cả 32 bài học', emoji: '🎓' },
  { id: 'streak_3', name: '3 ngày liên tiếp', description: 'Dùng app 3 ngày liên tiếp', emoji: '🔥' },
  { id: 'streak_7', name: '7 ngày liên tiếp', description: 'Dùng app 7 ngày liên tiếp', emoji: '💪' },
  { id: 'streak_30', name: '30 ngày liên tiếp', description: 'Dùng app 30 ngày liên tiếp', emoji: '👑' },
  { id: 'first_won', name: 'Deal đầu tiên', description: 'Chốt deal đầu tiên', emoji: '💰' },
  { id: '5_customers', name: 'Mở rộng', description: 'Thêm 5 khách hàng vào CRM', emoji: '📋' },
  { id: 'ai_coach_10', name: 'AI Coach Fan', description: 'Chat với AI Coach 10 lần', emoji: '🤖' },
];

/** Cập nhật streak khi mở app */
export async function updateStreak(): Promise<StreakInfo> {
  const today = new Date().toISOString().split('T')[0];
  const raw = await AsyncStorage.getItem(STREAK_KEY);
  let info: StreakInfo = raw ? JSON.parse(raw) : { current: 0, longest: 0, lastDate: '' };

  if (info.lastDate === today) return info; // Đã check hôm nay

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (info.lastDate === yesterday) {
    info.current += 1;
  } else {
    info.current = 1;
  }

  if (info.current > info.longest) info.longest = info.current;
  info.lastDate = today;

  await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(info));
  return info;
}

/** Load streak */
export async function loadStreak(): Promise<StreakInfo> {
  const raw = await AsyncStorage.getItem(STREAK_KEY);
  return raw ? JSON.parse(raw) : { current: 0, longest: 0, lastDate: '' };
}

/** Load earned badges */
export async function loadBadges(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(BADGES_KEY);
  return raw ? JSON.parse(raw) : [];
}

/** Earn a badge */
export async function earnBadge(badgeId: string): Promise<boolean> {
  const earned = await loadBadges();
  if (earned.includes(badgeId)) return false;
  earned.push(badgeId);
  await AsyncStorage.setItem(BADGES_KEY, JSON.stringify(earned));
  return true;
}

/** Check and award badges based on stats */
export async function checkBadges(stats: {
  sessionCount: number;
  lessonCount: number;
  customerCount: number;
  conversationCount: number;
  highestScore: number;
  hasWon: boolean;
  streak: number;
}): Promise<string[]> {
  const newBadges: string[] = [];

  const checks: [boolean, string][] = [
    [stats.sessionCount >= 1, 'first_record'],
    [stats.lessonCount >= 1, 'first_lesson'],
    [stats.sessionCount >= 5, '5_sessions'],
    [stats.sessionCount >= 10, '10_sessions'],
    [stats.highestScore >= 8, 'score_8'],
    [stats.lessonCount >= 32, 'all_lessons'],
    [stats.streak >= 3, 'streak_3'],
    [stats.streak >= 7, 'streak_7'],
    [stats.streak >= 30, 'streak_30'],
    [stats.hasWon, 'first_won'],
    [stats.customerCount >= 5, '5_customers'],
    [stats.conversationCount >= 10, 'ai_coach_10'],
  ];

  for (const [condition, badgeId] of checks) {
    if (condition) {
      const isNew = await earnBadge(badgeId);
      if (isNew) newBadges.push(badgeId);
    }
  }

  return newBadges;
}
