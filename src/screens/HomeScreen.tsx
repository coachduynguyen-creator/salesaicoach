import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { updateStreak, loadStreak, loadBadges, checkBadges, ALL_BADGES, StreakInfo } from '../services/gamificationService';
import { loadUserAvatar } from '../services/imageService';
import { getDailyInsight, DailyInsight } from '../services/dailyInsightService';
import { getCurrentChallenge, getChallengeProgress, toggleChallengeTask, WeeklyChallenge, SavedChallenge } from '../services/challengeService';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { useColors } from '../contexts/ThemeContext';
import { loadSessions, Session, loadCustomers } from '../services/storageService';
import { useKnowledge } from '../contexts/KnowledgeContext';
import { useAuth } from '../contexts/AuthContext';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  return m > 0 ? `${m} phút` : `${seconds} giây`;
}

function getScoreColor(score: number): string {
  if (score >= 7) return COLORS.SUCCESS;
  if (score >= 5) return COLORS.WARNING;
  return COLORS.DANGER;
}

function getAvgScore(sessions: Session[]): string {
  if (!sessions.length) return '—';
  return (sessions.reduce((s, x) => s + x.score, 0) / sessions.length).toFixed(1);
}

function getThisWeekCount(sessions: Session[]): number {
  const now = new Date();
  return sessions.filter(s => {
    const [d, m, y] = s.date.split('/').map(Number);
    return (now.getTime() - new Date(y, m - 1, d).getTime()) / 86400000 <= 7;
  }).length;
}

function getWinRate(sessions: Session[]): string {
  const decided = sessions.filter(s => s.outcome === 'won' || s.outcome === 'lost');
  if (!decided.length) return '—';
  const won = decided.filter(s => s.outcome === 'won').length;
  return Math.round((won / decided.length) * 100) + '%';
}

const TIPS = [
  'Vị thế cố vấn đến từ việc đặt câu hỏi đúng, không phải nói nhiều.',
  'Lắng nghe 70%, nói 30% — khách hàng sẽ tự tìm thấy giải pháp.',
  'Khi khách nói "giá cao", hỏi "cao so với điều gì?" trước khi giải thích.',
  'Kết thúc mỗi buổi bằng một bước tiếp theo cụ thể, có thời gian rõ ràng.',
  'Công thức Trust: T = (Uy tín + Tin cậy + Kết nối) / Tập trung bản thân.',
];

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const C = useColors();
  const { profile } = useAuth();
  const { isStaleCache, reload } = useKnowledge();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [streak, setStreak] = useState<StreakInfo>({ current: 0, longest: 0, lastDate: '' });
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [dailyInsight, setDailyInsight] = useState<DailyInsight | null>(null);
  const [customerMap, setCustomerMap] = useState<Record<string, string>>({});
  const [challenge, setChallenge] = useState<WeeklyChallenge | null>(null);
  const [challengeProgress, setChallengeProgress] = useState<SavedChallenge | null>(null);
  const tip = TIPS[new Date().getDay() % TIPS.length];

  useFocusEffect(
    useCallback(() => {
      loadSessions().then(setSessions);
      updateStreak().then(setStreak);
      loadBadges().then(setEarnedBadges);
      loadUserAvatar().then(setAvatarUri);
      loadCustomers().then(customers => {
        const map: Record<string, string> = {};
        // Map theo tên (fallback)
        customers.forEach(c => { map[c.name.toLowerCase().trim()] = c.id; });
        // Map theo sessionId → customer name (ưu tiên, tên luôn mới nhất)
        customers.forEach(c => {
          (c.sessionIds || []).forEach(sid => { map['__sid__' + sid] = c.id; map['__sname__' + sid] = c.name; });
        });
        setCustomerMap(map);
      });
      getDailyInsight().then(setDailyInsight);
      setChallenge(getCurrentChallenge());
      getChallengeProgress().then(setChallengeProgress);
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSessions().then(setSessions);
    await reload();
    setRefreshing(false);
  }, [reload]);

  const recent = sessions.slice(0, 3);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.BACKGROUND }]} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.PRIMARY} colors={[C.PRIMARY]} />}>

        {/* Hero Header */}
        <LinearGradient
          colors={[C.GRADIENT_START, C.GRADIENT_END]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroGreeting}>Chào mừng trở lại</Text>
              <Text style={styles.heroTitle}>{profile?.full_name || 'Sales Coach'}</Text>
              <Text style={styles.heroTagline}>AI Coaching cho Sales | by Coach Duy Nguyễn</Text>
            </View>
            <TouchableOpacity
              style={styles.heroAvatar}
              onPress={() => navigation.navigate('CaiDat')}
            >
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.heroAvatarImage} />
              ) : (
                <Ionicons name="person" size={22} color={C.PRIMARY} />
              )}
            </TouchableOpacity>
          </View>

          {/* Stats trong header */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{sessions.length}</Text>
              <Text style={styles.statLabel}>Tổng buổi</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{getAvgScore(sessions)}</Text>
              <Text style={styles.statLabel}>Điểm TB</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{getThisWeekCount(sessions)}</Text>
              <Text style={styles.statLabel}>Tuần này</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{getWinRate(sessions)}</Text>
              <Text style={styles.statLabel}>Tỷ lệ chốt</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Hướng dẫn sử dụng */}
        <TouchableOpacity
          style={[styles.searchBar, { backgroundColor: C.CARD }]}
          onPress={() => navigation.navigate('UserGuide' as never)}
          activeOpacity={0.7}
        >
          <Ionicons name="book-outline" size={18} color={C.PRIMARY} />
          <Text style={[styles.searchPlaceholder, { color: C.TEXT }]}>Hướng dẫn sử dụng app</Text>
          <Ionicons name="chevron-forward" size={16} color={C.TEXT_LIGHT} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        {/* Streak + Badges */}
        {streak.current > 0 && (
          <View style={[styles.streakCard, { backgroundColor: C.CARD }]}>
            <View style={styles.streakTop}>
              <View style={styles.streakFireWrap}>
                <Ionicons name="flame" size={24} color="#F59E0B" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.streakCount, { color: C.TEXT }]}>{streak.current} ngày liên tiếp</Text>
                <Text style={[styles.streakBest, { color: C.TEXT_LIGHT }]}>Kỷ lục: {streak.longest} ngày</Text>
              </View>
              <View style={[styles.streakNum, { backgroundColor: '#F59E0B' }]}>
                <Text style={styles.streakNumText}>{streak.current}</Text>
              </View>
            </View>
            {earnedBadges.length > 0 && (
              <View style={[styles.badgeRow, { borderTopWidth: 1, borderTopColor: C.BORDER, paddingTop: 10, marginTop: 10 }]}>
                <Text style={[styles.badgeLabel, { color: C.TEXT_LIGHT }]}>Huy hiệu:</Text>
                {ALL_BADGES.filter(b => earnedBadges.includes(b.id)).slice(-5).map(b => (
                  <Text key={b.id} style={styles.badgeEmoji}>{b.emoji}</Text>
                ))}
                {earnedBadges.length > 5 && (
                  <Text style={[styles.badgeMore, { color: C.TEXT_LIGHT }]}>+{earnedBadges.length - 5}</Text>
                )}
              </View>
            )}
          </View>
        )}

        {/* Cảnh báo khi dùng kiến thức cũ */}
        {isStaleCache && (
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', marginHorizontal: 16, marginTop: 12, padding: 16, borderRadius: 16, gap: 8 }}
            onPress={reload}
          >
            <Ionicons name="warning-outline" size={18} color="#D97706" />
            <Text style={{ flex: 1, fontSize: 13, color: '#92400E', lineHeight: 20 }}>
              Kiến thức AI đang dùng bản cũ (không có mạng). Nhấn để thử tải lại.
            </Text>
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: C.CARD }]}
            onPress={() => navigation.navigate('GhiAm')}
          >
            <LinearGradient
              colors={['#DC2626', '#F97316']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.actionIcon}
            >
              <Ionicons name="radio" size={22} color="#fff" />
            </LinearGradient>
            <Text style={[styles.actionText, { color: C.TEXT_SECONDARY }]}>Ghi âm</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: C.CARD }]}
            onPress={() => navigation.navigate('AiCoach')}
          >
            <LinearGradient
              colors={['#7C3AED', '#A78BFA']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.actionIcon}
            >
              <Ionicons name="sparkles" size={22} color="#fff" />
            </LinearGradient>
            <Text style={[styles.actionText, { color: C.TEXT_SECONDARY }]}>AI Coach</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: C.CARD }]}
            onPress={() => navigation.navigate('DaoTao')}
          >
            <LinearGradient
              colors={['#059669', '#34D399']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.actionIcon}
            >
              <Ionicons name="library" size={22} color="#fff" />
            </LinearGradient>
            <Text style={[styles.actionText, { color: C.TEXT_SECONDARY }]}>Đào tạo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: C.CARD }]}
            onPress={() => navigation.navigate('KhachHang')}
          >
            <LinearGradient
              colors={['#2563EB', '#60A5FA']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.actionIcon}
            >
              <Ionicons name="people" size={22} color="#fff" />
            </LinearGradient>
            <Text style={[styles.actionText, { color: C.TEXT_SECONDARY }]}>Khách hàng</Text>
          </TouchableOpacity>
        </View>

        {/* AI Tools */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: C.TEXT }]}>Công cụ AI</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 16, marginBottom: 16 }}>
          {[
            { key: 'script', label: 'Tạo kịch bản', icon: 'document-text', color: '#E67E22', nav: 'ScriptGenerator' },
            { key: 'precall', label: 'Chuẩn bị gặp', icon: 'clipboard', color: '#2563EB', nav: 'AITools', params: { tool: 'precall' } },
            { key: 'postcall', label: 'Tóm tắt sau gặp', icon: 'reader', color: '#059669', nav: 'AITools', params: { tool: 'postcall' } },
            { key: 'roleplay', label: 'Luyện đối đáp', icon: 'chatbubbles', color: '#7C3AED', nav: 'AITools', params: { tool: 'roleplay' } },
            { key: 'objection', label: 'Xử lý từ chối', icon: 'shield-checkmark', color: '#DC2626', nav: 'AITools', params: { tool: 'objection' } },
            { key: 'goals', label: 'Mục tiêu', icon: 'flag', color: '#F59E0B', nav: 'GoalSetting' },
            { key: 'commission', label: 'Hoa hồng', icon: 'calculator', color: '#10B981', nav: 'Commission' },
          ].map(tool => (
            <TouchableOpacity
              key={tool.key}
              style={[styles.toolCard, { backgroundColor: C.CARD }]}
              onPress={() => navigation.navigate(tool.nav as any, (tool as any).params)}
              activeOpacity={0.7}
            >
              <View style={[styles.toolIcon, { backgroundColor: tool.color + '12' }]}>
                <Ionicons name={tool.icon as any} size={20} color={tool.color} />
              </View>
              <Text style={[styles.toolLabel, { color: C.TEXT }]} numberOfLines={1}>{tool.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Daily Insight */}
        {dailyInsight && (
          <View style={[styles.tipCard, { backgroundColor: C.CARD }]}>
            <View style={styles.tipHeader}>
              <View style={[styles.tipBadge, { backgroundColor: dailyInsight.color + '18' }]}>
                <Ionicons name={dailyInsight.icon as any} size={12} color={dailyInsight.color} />
              </View>
              <Text style={[styles.tipTitle, { color: C.TEXT }]}>{dailyInsight.title}</Text>
              <Text style={{ fontSize: 9, fontWeight: '700', color: dailyInsight.color, letterSpacing: 1 }}>HÔM NAY</Text>
            </View>
            <Text style={[styles.tipText, { color: C.TEXT_SECONDARY }]}>{dailyInsight.body}</Text>
          </View>
        )}

        {/* Weekly Challenge */}
        {challenge && challengeProgress && (
          <View style={[styles.tipCard, { backgroundColor: C.CARD }]}>
            <View style={styles.tipHeader}>
              <View style={[styles.tipBadge, { backgroundColor: challenge.color + '18' }]}>
                <Ionicons name={challenge.icon as any} size={12} color={challenge.color} />
              </View>
              <Text style={[styles.tipTitle, { color: C.TEXT }]}>{challenge.title}</Text>
              <Text style={{ fontSize: 9, fontWeight: '700', color: challenge.color, letterSpacing: 1 }}>TUẦN NÀY</Text>
            </View>
            <Text style={[styles.tipText, { color: C.TEXT_SECONDARY, marginBottom: 10 }]}>{challenge.description}</Text>
            {challenge.tasks.map((task, i) => (
              <TouchableOpacity
                key={i}
                style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}
                onPress={async () => {
                  const updated = await toggleChallengeTask(i);
                  setChallengeProgress(updated);
                }}
              >
                <Ionicons
                  name={challengeProgress.tasksCompleted[i] ? 'checkmark-circle' : 'ellipse-outline'}
                  size={18}
                  color={challengeProgress.tasksCompleted[i] ? '#10B981' : C.TEXT_LIGHT}
                />
                <Text style={{
                  fontSize: 13, color: challengeProgress.tasksCompleted[i] ? C.TEXT_LIGHT : C.TEXT_SECONDARY,
                  textDecorationLine: challengeProgress.tasksCompleted[i] ? 'line-through' : 'none',
                  flex: 1, lineHeight: 20,
                }}>{task}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Progress Chart */}
        {sessions.length >= 2 && (
          <View style={[styles.chartCard, { backgroundColor: C.CARD }]}>
            <Text style={[styles.chartTitle, { color: C.TEXT }]}>Tiến bộ điểm số</Text>
            <View style={styles.chartContainer}>
              {sessions.slice(0, 10).reverse().map((s, i, arr) => {
                const barHeight = Math.max(8, (s.score / 10) * 100);
                const barColor = s.score >= 7 ? COLORS.SUCCESS : s.score >= 5 ? COLORS.WARNING : COLORS.DANGER;
                return (
                  <View key={s.id} style={styles.chartBarWrap}>
                    <Text style={styles.chartBarScore}>{s.score.toFixed(1)}</Text>
                    <View style={[styles.chartBar, { height: barHeight, backgroundColor: barColor }]} />
                    <Text style={styles.chartBarLabel}>{s.date.slice(0, 5)}</Text>
                  </View>
                );
              })}
            </View>
            {sessions.length >= 3 && (() => {
              const last3 = sessions.slice(0, 3);
              const prev3 = sessions.slice(3, 6);
              if (prev3.length === 0) return null;
              const avgRecent = last3.reduce((s, x) => s + x.score, 0) / last3.length;
              const avgPrev = prev3.reduce((s, x) => s + x.score, 0) / prev3.length;
              const diff = avgRecent - avgPrev;
              const trending = diff > 0.3 ? 'up' : diff < -0.3 ? 'down' : 'stable';
              return (
                <View style={styles.trendRow}>
                  <Ionicons
                    name={trending === 'up' ? 'trending-up' : trending === 'down' ? 'trending-down' : 'remove-outline'}
                    size={16}
                    color={trending === 'up' ? COLORS.SUCCESS : trending === 'down' ? COLORS.DANGER : COLORS.TEXT_LIGHT}
                  />
                  <Text style={[styles.trendText, {
                    color: trending === 'up' ? COLORS.SUCCESS : trending === 'down' ? COLORS.DANGER : COLORS.TEXT_LIGHT,
                  }]}>
                    {trending === 'up' ? `Tiến bộ +${diff.toFixed(1)} điểm` :
                     trending === 'down' ? `Giảm ${Math.abs(diff).toFixed(1)} điểm` :
                     'Ổn định'}
                  </Text>
                </View>
              );
            })()}
          </View>
        )}

        {/* Recent Sessions */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: C.TEXT }]}>Gần đây</Text>
          {sessions.length > 0 && (
            <TouchableOpacity onPress={() => navigation.navigate('LichSu')}>
              <Text style={[styles.seeAll, { color: C.PRIMARY }]}>Xem tất cả</Text>
            </TouchableOpacity>
          )}
        </View>

        {recent.length === 0 ? (
          <TouchableOpacity
            style={styles.emptyCard}
            onPress={() => navigation.navigate('GhiAm')}
          >
            <View style={[styles.emptyIconWrap, { backgroundColor: C.PRIMARY + '10' }]}>
              <Ionicons name="mic-outline" size={32} color={C.PRIMARY_LIGHT} />
            </View>
            <Text style={[styles.emptyTitle, { color: C.TEXT }]}>Chưa có buổi tư vấn nào</Text>
            <Text style={styles.emptyDesc}>Nhấn để ghi âm buổi đầu tiên</Text>
          </TouchableOpacity>
        ) : (
          recent.map(session => {
            const custId = customerMap['__sid__' + session.id] || customerMap[session.customerName?.toLowerCase().trim()];
            const displayName = customerMap['__sname__' + session.id] || session.customerName;
            return (
              <TouchableOpacity
                key={session.id}
                style={[styles.sessionCard, { backgroundColor: C.CARD }]}
                onPress={() => navigation.navigate('SessionDetail', { session })}
              >
                <View style={[styles.sessionScore, { backgroundColor: getScoreColor(session.score) }]}>
                  <Text style={styles.sessionScoreText}>{session.score.toFixed(1)}</Text>
                </View>
                <View style={styles.sessionInfo}>
                  <TouchableOpacity
                    onPress={() => custId && navigation.navigate('CustomerDetail', { customerId: custId })}
                    disabled={!custId}
                  >
                    <Text style={[styles.sessionName, { color: custId ? C.PRIMARY : C.TEXT }]}>{displayName}</Text>
                  </TouchableOpacity>
                  <Text style={styles.sessionMeta}>{session.date}  •  {formatTime(session.duration)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={C.TEXT_LIGHT} />
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  scroll: { flex: 1 },

  // Search
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.CARD, marginHorizontal: 16, marginTop: 12,
    paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  searchPlaceholder: { fontSize: 14, color: COLORS.TEXT_LIGHT },

  // AI Tools
  toolCard: {
    width: 90, borderRadius: 16, padding: 12, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  toolIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  toolLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },

  // Streak + Badges
  streakCard: {
    marginHorizontal: 16, marginTop: 12, marginBottom: 2,
    padding: 16, borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  streakTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  streakFireWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center',
  },
  streakCount: { fontSize: 15, fontWeight: '700' },
  streakBest: { fontSize: 11, marginTop: 1 },
  streakNum: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  streakNumText: { fontSize: 16, fontWeight: '900', color: '#fff' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  badgeLabel: { fontSize: 11, fontWeight: '600', marginRight: 2 },
  badgeEmoji: { fontSize: 18 },
  badgeMore: { fontSize: 11, fontWeight: '600', marginLeft: 2 },

  // Hero
  hero: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  heroGreeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    marginTop: 2,
  },
  heroTagline: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  heroAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroAvatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingVertical: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 4,
  },

  // Quick Actions
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.TEXT_SECONDARY,
  },

  // Tip
  tipCard: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.ACCENT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tipBadge: {
    backgroundColor: COLORS.WARNING_LIGHT,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  tipBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.WARNING,
    letterSpacing: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.TEXT,
    flex: 1,
  },
  tipText: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
  },

  // Section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.TEXT,
  },
  seeAll: {
    fontSize: 13,
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },

  // Empty State
  emptyCard: {
    marginHorizontal: 16,
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    borderStyle: 'dashed',
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.PRIMARY + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.TEXT,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 13,
    color: COLORS.TEXT_LIGHT,
    lineHeight: 20,
  },

  // Session Cards
  sessionCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sessionScore: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sessionScoreText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.TEXT,
    marginBottom: 2,
  },
  sessionMeta: {
    fontSize: 12,
    color: COLORS.TEXT_LIGHT,
  },
  // Chart styles
  chartCard: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.TEXT,
    marginBottom: 12,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 120,
    gap: 4,
  },
  chartBarWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: '70%',
    minWidth: 16,
    borderRadius: 4,
    marginVertical: 4,
  },
  chartBarScore: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.TEXT_SECONDARY,
  },
  chartBarLabel: {
    fontSize: 9,
    color: COLORS.TEXT_LIGHT,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  trendText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
