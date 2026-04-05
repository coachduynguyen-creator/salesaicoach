import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { useColors } from '../contexts/ThemeContext';
import { loadSessions, Session } from '../services/storageService';
import { useKnowledge } from '../contexts/KnowledgeContext';

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
  const { isStaleCache, reload } = useKnowledge();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const tip = TIPS[new Date().getDay() % TIPS.length];

  useFocusEffect(
    useCallback(() => { loadSessions().then(setSessions); }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSessions().then(setSessions);
    await reload();
    setRefreshing(false);
  }, [reload]);

  const recent = sessions.slice(0, 3);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
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
              <Text style={styles.heroTitle}>Sales Coach</Text>
            </View>
            <TouchableOpacity
              style={styles.heroAvatar}
              onPress={() => navigation.navigate('CaiDat')}
            >
              <Ionicons name="person" size={22} color={C.PRIMARY} />
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

        {/* Cảnh báo khi dùng kiến thức cũ */}
        {isStaleCache && (
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', marginHorizontal: 16, marginTop: 12, padding: 12, borderRadius: 10, gap: 8 }}
            onPress={reload}
          >
            <Ionicons name="warning-outline" size={18} color="#D97706" />
            <Text style={{ flex: 1, fontSize: 12, color: '#92400E', lineHeight: 17 }}>
              Kiến thức AI đang dùng bản cũ (không có mạng). Nhấn để thử tải lại.
            </Text>
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('GhiAm')}
          >
            <LinearGradient
              colors={[COLORS.DANGER, '#F97316']}
              style={styles.actionIcon}
            >
              <Ionicons name="mic" size={22} color="#fff" />
            </LinearGradient>
            <Text style={styles.actionText}>Ghi âm</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('AiCoach')}
          >
            <LinearGradient
              colors={[C.PRIMARY, C.PRIMARY_LIGHT]}
              style={styles.actionIcon}
            >
              <Ionicons name="sparkles" size={22} color="#fff" />
            </LinearGradient>
            <Text style={styles.actionText}>AI Coach</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('DaoTao')}
          >
            <LinearGradient
              colors={[COLORS.SUCCESS, '#34D399']}
              style={styles.actionIcon}
            >
              <Ionicons name="book" size={22} color="#fff" />
            </LinearGradient>
            <Text style={styles.actionText}>Đào tạo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('LichSu')}
          >
            <LinearGradient
              colors={[COLORS.WARNING, COLORS.ACCENT_LIGHT]}
              style={styles.actionIcon}
            >
              <Ionicons name="time" size={22} color="#fff" />
            </LinearGradient>
            <Text style={styles.actionText}>Lịch sử</Text>
          </TouchableOpacity>
        </View>

        {/* Tip Card */}
        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <View style={styles.tipBadge}>
              <Text style={styles.tipBadgeText}>TIP</Text>
            </View>
            <Text style={styles.tipTitle}>Mẹo hôm nay</Text>
          </View>
          <Text style={styles.tipText}>{tip}</Text>
        </View>

        {/* Progress Chart */}
        {sessions.length >= 2 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Tiến bộ điểm số</Text>
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
          <Text style={styles.sectionTitle}>Gần đây</Text>
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
            <Text style={styles.emptyTitle}>Chưa có buổi tư vấn nào</Text>
            <Text style={styles.emptyDesc}>Nhấn để ghi âm buổi đầu tiên</Text>
          </TouchableOpacity>
        ) : (
          recent.map(session => (
            <TouchableOpacity
              key={session.id}
              style={styles.sessionCard}
              onPress={() => navigation.navigate('SessionDetail', { session })}
            >
              <View style={[styles.sessionScore, { backgroundColor: getScoreColor(session.score) }]}>
                <Text style={styles.sessionScoreText}>{session.score.toFixed(1)}</Text>
              </View>
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionName}>{session.customerName}</Text>
                <Text style={styles.sessionMeta}>{session.date}  •  {formatTime(session.duration)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.TEXT_LIGHT} />
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  scroll: { flex: 1 },

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
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginTop: 2,
  },
  heroAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
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
    marginTop: -12,
    gap: 10,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.TEXT_SECONDARY,
  },

  // Tip
  tipCard: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.ACCENT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
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
    borderRadius: 6,
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
    fontSize: 18,
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
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.TEXT,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 13,
    color: COLORS.TEXT_LIGHT,
  },

  // Session Cards
  sessionCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sessionScore: {
    width: 44,
    height: 44,
    borderRadius: 14,
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
    marginTop: 16,
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 15,
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
