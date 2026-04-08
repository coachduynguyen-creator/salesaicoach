import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { useColors } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { getTeamStats, getMemberStats, getAIUsageSummary } from '../services/databaseService';
import { TeamStats, MemberStats } from '../types/database';
import { shareTeamReport } from '../services/reportService';

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MemberRow({ m, rank }: { m: MemberStats; rank: number }) {
  const winRate = (m.won + m.lost) > 0 ? Math.round((m.won / (m.won + m.lost)) * 100) : 0;
  const scoreColor = m.avg_score >= 7 ? '#10B981' : m.avg_score >= 5 ? '#F59E0B' : '#EF4444';
  return (
    <View style={styles.memberRow}>
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>{rank}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.memberName}>{m.full_name || 'Chưa tên'}</Text>
        <Text style={styles.memberMeta}>
          {m.total_sessions} buổi | Win: {winRate}% | AI: {m.ai_calls_month} | Bài học: {m.lessons_done}/32
        </Text>
      </View>
      <View style={[styles.scoreBadge, { backgroundColor: scoreColor + '15' }]}>
        <Text style={[styles.scoreText, { color: scoreColor }]}>{m.avg_score}</Text>
      </View>
    </View>
  );
}

export default function AdminDashboardScreen() {
  const navigation = useNavigation();
  const C = useColors();
  const { team } = useAuth();
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [members, setMembers] = useState<MemberStats[]>([]);
  const [aiUsage, setAiUsage] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!team) return;
    const [s, m, a] = await Promise.all([
      getTeamStats(team.id),
      getMemberStats(team.id),
      getAIUsageSummary(team.id, 30),
    ]);
    setStats(s);
    setMembers(m);
    setAiUsage(a);
  }, [team]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Tính AI usage breakdown
  const aiByAction: Record<string, number> = {};
  const aiByUser: Record<string, number> = {};
  for (const log of aiUsage) {
    aiByAction[log.action] = (aiByAction[log.action] || 0) + 1;
    const userName = members.find(m => m.user_id === log.user_id)?.full_name || 'Unknown';
    aiByUser[userName] = (aiByUser[userName] || 0) + 1;
  }

  const totalTokens = stats?.total_tokens_month || 0;
  const estimatedCost = ((totalTokens / 1000000) * 0.25).toFixed(2); // Claude Haiku ~$0.25/1M tokens

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.BACKGROUND }]} edges={['top']}>
      <View style={[styles.topBar, { backgroundColor: C.CARD, borderBottomColor: C.BORDER }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={C.TEXT} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: C.TEXT }]}>Admin Dashboard</Text>
        <TouchableOpacity
          onPress={() => {
            if (stats && team) shareTeamReport(team.name, stats, members);
          }}
          style={styles.backBtn}
        >
          <Ionicons name="share-outline" size={20} color={COLORS.TEXT} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.PRIMARY} />}
      >
        {/* Overview Stats */}
        <Text style={styles.sectionTitle}>Tổng quan Team</Text>
        <View style={styles.statsGrid}>
          <StatCard label="Thành viên" value={stats?.total_members || 0} icon="people" color="#3B82F6" />
          <StatCard label="Buổi ghi" value={stats?.total_sessions || 0} icon="radio" color="#10B981" />
          <StatCard label="Điểm TB" value={stats?.avg_score || 0} icon="star" color="#F59E0B" />
          <StatCard label="Won" value={stats?.won_deals || 0} icon="trophy" color="#10B981" />
          <StatCard label="Lost" value={stats?.lost_deals || 0} icon="close-circle" color="#EF4444" />
          <StatCard
            label="Win Rate"
            value={((stats?.won_deals || 0) + (stats?.lost_deals || 0)) > 0
              ? Math.round(((stats?.won_deals || 0) / ((stats?.won_deals || 0) + (stats?.lost_deals || 0))) * 100) + '%'
              : '0%'}
            icon="trending-up"
            color="#8B5CF6"
          />
        </View>

        {/* AI Usage */}
        <Text style={styles.sectionTitle}>AI Usage (30 ngày)</Text>
        <View style={styles.card}>
          <View style={styles.aiRow}>
            <Text style={styles.aiLabel}>Tổng lượt gọi AI</Text>
            <Text style={styles.aiValue}>{stats?.ai_calls_month || 0}</Text>
          </View>
          <View style={styles.aiRow}>
            <Text style={styles.aiLabel}>Hôm nay</Text>
            <Text style={styles.aiValue}>{stats?.ai_calls_today || 0}</Text>
          </View>
          <View style={styles.aiRow}>
            <Text style={styles.aiLabel}>Tổng tokens</Text>
            <Text style={styles.aiValue}>{totalTokens.toLocaleString()}</Text>
          </View>
          <View style={styles.aiRow}>
            <Text style={styles.aiLabel}>Chi phí ước tính</Text>
            <Text style={[styles.aiValue, { color: '#E67E22' }]}>${estimatedCost}</Text>
          </View>

          {Object.keys(aiByAction).length > 0 && (
            <>
              <View style={styles.divider} />
              <Text style={styles.subTitle}>Theo loại</Text>
              {Object.entries(aiByAction).sort((a, b) => b[1] - a[1]).map(([action, count]) => (
                <View key={action} style={styles.aiRow}>
                  <Text style={styles.aiLabel}>
                    {action === 'transcribe' ? 'Chuyển giọng nói' :
                     action === 'analyze' ? 'Phân tích buổi tư vấn' :
                     action === 'chat' ? 'AI Coach chat' :
                     action === 'extract_customer' ? 'Trích xuất khách hàng' :
                     action === 'score_customer' ? 'Chấm điểm khách' : action}
                  </Text>
                  <Text style={styles.aiValue}>{count}</Text>
                </View>
              ))}
            </>
          )}

          {Object.keys(aiByUser).length > 0 && (
            <>
              <View style={styles.divider} />
              <Text style={styles.subTitle}>Theo nhân viên</Text>
              {Object.entries(aiByUser).sort((a, b) => b[1] - a[1]).map(([name, count]) => (
                <View key={name} style={styles.aiRow}>
                  <Text style={styles.aiLabel}>{name}</Text>
                  <Text style={styles.aiValue}>{count}</Text>
                </View>
              ))}
            </>
          )}
        </View>

        {/* Score Chart (custom bars) */}
        {members.length > 0 && (() => {
          const maxScore = Math.max(...members.map(m => m.avg_score || 0), 1);
          return (
            <>
              <Text style={styles.sectionTitle}>Điểm trung bình</Text>
              <View style={styles.card}>
                {members.slice(0, 8).map(m => {
                  const pct = maxScore > 0 ? ((m.avg_score || 0) / 10) * 100 : 0;
                  const color = m.avg_score >= 7 ? '#10B981' : m.avg_score >= 5 ? '#F59E0B' : '#EF4444';
                  return (
                    <View key={m.user_id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 }}>
                      <Text style={{ fontSize: 11, fontWeight: '600', color: COLORS.TEXT_SECONDARY, width: 60 }} numberOfLines={1}>{(m.full_name || '?').slice(0, 8)}</Text>
                      <View style={{ flex: 1, height: 20, backgroundColor: COLORS.SURFACE, borderRadius: 4, overflow: 'hidden' }}>
                        <View style={{ width: `${pct}%`, height: '100%', backgroundColor: color + '40', borderRadius: 4, justifyContent: 'center', paddingLeft: 6 }}>
                          <Text style={{ fontSize: 10, fontWeight: '800', color }}>{m.avg_score}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </>
          );
        })()}

        {/* Deal Summary (custom) */}
        {(stats?.won_deals || 0) + (stats?.lost_deals || 0) > 0 && (() => {
          const total = (stats?.won_deals || 0) + (stats?.lost_deals || 0);
          const pending = Math.max(0, (stats?.total_sessions || 0) - total);
          const data = [
            { label: 'Won', count: stats?.won_deals || 0, color: '#10B981' },
            { label: 'Lost', count: stats?.lost_deals || 0, color: '#EF4444' },
            { label: 'Pending', count: pending, color: '#F59E0B' },
          ];
          const maxDeal = Math.max(...data.map(d => d.count), 1);
          return (
            <>
              <Text style={styles.sectionTitle}>Tỷ lệ Deal</Text>
              <View style={styles.card}>
                {data.map(d => (
                  <View key={d.label} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 }}>
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: d.color }} />
                    <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.TEXT_SECONDARY, width: 55 }}>{d.label}</Text>
                    <View style={{ flex: 1, height: 22, backgroundColor: COLORS.SURFACE, borderRadius: 4, overflow: 'hidden' }}>
                      <View style={{ width: `${(d.count / maxDeal) * 100}%`, height: '100%', backgroundColor: d.color + '35', borderRadius: 4, justifyContent: 'center', paddingLeft: 8 }}>
                        <Text style={{ fontSize: 11, fontWeight: '800', color: d.color }}>{d.count}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </>
          );
        })()}

        {/* Member Rankings */}
        <Text style={styles.sectionTitle}>Bảng xếp hạng nhân viên</Text>
        <View style={styles.card}>
          {members.length === 0 ? (
            <Text style={styles.emptyText}>Chưa có dữ liệu</Text>
          ) : (
            members
              .sort((a, b) => b.avg_score - a.avg_score)
              .map((m, idx) => <MemberRow key={m.user_id} m={m} rank={idx + 1} />)
          )}
        </View>

        {/* Training Progress */}
        <Text style={styles.sectionTitle}>Tiến độ đào tạo</Text>
        <View style={styles.card}>
          {members.length === 0 ? (
            <Text style={styles.emptyText}>Chưa có dữ liệu</Text>
          ) : (
            members.map(m => {
              const pct = Math.round((m.lessons_done / 32) * 100);
              return (
                <View key={m.user_id} style={styles.progressRow}>
                  <Text style={styles.progressName}>{m.full_name || 'Chưa tên'}</Text>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${pct}%`, backgroundColor: pct >= 80 ? '#10B981' : pct >= 40 ? '#F59E0B' : '#EF4444' }]} />
                  </View>
                  <Text style={styles.progressPct}>{m.lessons_done}/32</Text>
                </View>
              );
            })
          )}
        </View>

        {/* Bug Reports */}
        <TouchableOpacity
          style={[styles.bugReportBtn, { borderColor: '#EF4444' }]}
          onPress={() => (navigation as any).navigate('BugReports')}
        >
          <Ionicons name="bug" size={18} color="#EF4444" />
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#EF4444', flex: 1 }}>Xem báo lỗi & Crash</Text>
          <Ionicons name="chevron-forward" size={16} color="#EF4444" />
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.CARD, paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.BORDER,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: COLORS.SURFACE },
  topBarTitle: { fontSize: 15, fontWeight: '600', color: COLORS.TEXT, flex: 1, textAlign: 'center' },
  scroll: { padding: 16, paddingBottom: 40 },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.TEXT, marginBottom: 10, marginTop: 8 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statCard: {
    backgroundColor: COLORS.CARD, borderRadius: 14, padding: 14, alignItems: 'center',
    width: '31%', flexGrow: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  statValue: { fontSize: 20, fontWeight: '800', color: COLORS.TEXT },
  statLabel: { fontSize: 10, color: COLORS.TEXT_LIGHT, marginTop: 2 },

  card: {
    backgroundColor: COLORS.CARD, borderRadius: 14, padding: 16, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },

  aiRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  aiLabel: { fontSize: 13, color: COLORS.TEXT_SECONDARY, flex: 1 },
  aiValue: { fontSize: 14, fontWeight: '700', color: COLORS.TEXT },
  subTitle: { fontSize: 13, fontWeight: '600', color: COLORS.TEXT, marginBottom: 4, marginTop: 4 },
  divider: { height: 1, backgroundColor: COLORS.BORDER, marginVertical: 8 },

  memberRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10,
    borderBottomWidth: 1, borderBottomColor: COLORS.BORDER,
  },
  rankBadge: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.SURFACE,
    alignItems: 'center', justifyContent: 'center',
  },
  rankText: { fontSize: 13, fontWeight: '700', color: COLORS.TEXT_SECONDARY },
  memberName: { fontSize: 14, fontWeight: '600', color: COLORS.TEXT },
  memberMeta: { fontSize: 11, color: COLORS.TEXT_LIGHT, marginTop: 2 },
  scoreBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  scoreText: { fontSize: 16, fontWeight: '800' },

  progressRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10 },
  progressName: { fontSize: 13, fontWeight: '500', color: COLORS.TEXT, width: 80 },
  progressBarBg: { flex: 1, height: 8, backgroundColor: COLORS.SURFACE, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  progressPct: { fontSize: 12, fontWeight: '600', color: COLORS.TEXT_SECONDARY, width: 40, textAlign: 'right' },

  emptyText: { fontSize: 13, color: COLORS.TEXT_LIGHT, textAlign: 'center', paddingVertical: 20 },
  bugReportBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16,
    borderRadius: 16, borderWidth: 1.5, marginTop: 12,
  },
});
