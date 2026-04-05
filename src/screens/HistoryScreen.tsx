import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { useColors } from '../contexts/ThemeContext';
import { loadSessions, deleteSession, Session } from '../services/storageService';
import { useAlert } from '../contexts/AlertContext';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_HORIZONTAL_PADDING = 16;
const CHART_INNER_PADDING = 12;
const CHART_HEIGHT = 160;
const BAR_RADIUS = 6;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function getScoreColor(score: number): string {
  if (score >= 7) return COLORS.SUCCESS;
  if (score >= 5) return COLORS.WARNING;
  return COLORS.DANGER;
}

function getScoreLabel(score: number): string {
  if (score >= 8) return 'Xuất sắc';
  if (score >= 7) return 'Tốt';
  if (score >= 5) return 'Trung bình';
  return 'Cần cải thiện';
}

function getBarColor(score: number): string {
  if (score >= 8) return '#10B981';
  if (score >= 6) return '#34D399';
  if (score >= 4) return '#FBBF24';
  if (score >= 2) return '#F97316';
  return '#EF4444';
}

function abbreviateDate(dateStr: string): string {
  // dateStr is "dd/mm/yyyy"
  const parts = dateStr.split('/');
  if (parts.length < 2) return dateStr;
  return `${parts[0]}/${parts[1]}`;
}

const OUTCOME_CONFIG: Record<string, { label: string; color: string }> = {
  won: { label: 'Chốt', color: COLORS.SUCCESS },
  lost: { label: 'Không chốt', color: COLORS.DANGER },
  pending: { label: 'Đang theo', color: COLORS.WARNING },
};

// ─── Stats Summary ────────────────────────────────────────────────────────────

function StatsSummary({ sessions, colors }: { sessions: Session[]; colors: ReturnType<typeof useColors> }) {
  const totalSessions = sessions.length;

  const bestSession = useMemo(() => {
    if (sessions.length === 0) return null;
    return sessions.reduce((best, s) => (s.score > best.score ? s : best), sessions[0]);
  }, [sessions]);

  const trendInfo = useMemo(() => {
    if (sessions.length < 2) return null;
    // sessions are sorted newest-first; reverse for chronological order
    const chronological = [...sessions].reverse();
    const lastFive = chronological.slice(-5);
    const prevFive = chronological.slice(-10, -5);

    const avgLast = lastFive.reduce((sum, s) => sum + s.score, 0) / lastFive.length;

    if (prevFive.length === 0) return { direction: 'neutral' as const, avgLast, diff: 0 };

    const avgPrev = prevFive.reduce((sum, s) => sum + s.score, 0) / prevFive.length;
    const diff = avgLast - avgPrev;

    if (diff > 0.3) return { direction: 'up' as const, avgLast, avgPrev, diff };
    if (diff < -0.3) return { direction: 'down' as const, avgLast, avgPrev, diff };
    return { direction: 'neutral' as const, avgLast, avgPrev, diff: 0 };
  }, [sessions]);

  if (totalSessions === 0) return null;

  return (
    <View style={statStyles.container}>
      <Text style={statStyles.sectionTitle}>Tổng quan</Text>
      <View style={statStyles.row}>
        {/* Total Sessions */}
        <View style={[statStyles.statCard, { borderColor: colors.BORDER }]}>
          <View style={[statStyles.statIcon, { backgroundColor: colors.PRIMARY + '15' }]}>
            <Ionicons name="albums-outline" size={18} color={colors.PRIMARY} />
          </View>
          <Text style={statStyles.statValue}>{totalSessions}</Text>
          <Text style={statStyles.statLabel}>Tổng buổi</Text>
        </View>

        {/* Best Session */}
        {bestSession && (
          <View style={[statStyles.statCard, { borderColor: colors.BORDER }]}>
            <View style={[statStyles.statIcon, { backgroundColor: COLORS.SUCCESS + '15' }]}>
              <Ionicons name="trophy-outline" size={18} color={COLORS.SUCCESS} />
            </View>
            <Text style={statStyles.statValue}>{bestSession.score.toFixed(1)}</Text>
            <Text style={statStyles.statLabel} numberOfLines={1}>
              {bestSession.customerName}
            </Text>
          </View>
        )}

        {/* Trend */}
        <View style={[statStyles.statCard, { borderColor: colors.BORDER }]}>
          <View style={[statStyles.statIcon, {
            backgroundColor: trendInfo?.direction === 'up'
              ? COLORS.SUCCESS + '15'
              : trendInfo?.direction === 'down'
                ? COLORS.DANGER + '15'
                : colors.PRIMARY + '15',
          }]}>
            <Ionicons
              name={
                trendInfo?.direction === 'up'
                  ? 'trending-up'
                  : trendInfo?.direction === 'down'
                    ? 'trending-down'
                    : 'remove-outline'
              }
              size={18}
              color={
                trendInfo?.direction === 'up'
                  ? COLORS.SUCCESS
                  : trendInfo?.direction === 'down'
                    ? COLORS.DANGER
                    : colors.PRIMARY
              }
            />
          </View>
          <Text style={[statStyles.statValue, {
            color: trendInfo?.direction === 'up'
              ? COLORS.SUCCESS
              : trendInfo?.direction === 'down'
                ? COLORS.DANGER
                : COLORS.TEXT,
          }]}>
            {trendInfo
              ? `${trendInfo.direction === 'up' ? '+' : ''}${(trendInfo.diff ?? 0).toFixed(1)}`
              : '--'}
          </Text>
          <Text style={statStyles.statLabel}>Xu hướng</Text>
        </View>
      </View>
    </View>
  );
}

const statStyles = StyleSheet.create({
  container: { marginBottom: 8 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.TEXT,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.CARD,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.TEXT,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.TEXT_LIGHT,
    fontWeight: '500',
  },
});

// ─── Bar Chart ────────────────────────────────────────────────────────────────

function ScoreBarChart({ sessions, colors }: { sessions: Session[]; colors: ReturnType<typeof useColors> }) {
  const chartData = useMemo(() => {
    // Take last 10 sessions in chronological order (oldest first)
    const chronological = [...sessions].reverse();
    return chronological.slice(-10);
  }, [sessions]);

  if (chartData.length < 2) {
    return (
      <View style={chartStyles.noDataContainer}>
        <View style={[chartStyles.noDataIcon, { backgroundColor: colors.PRIMARY + '15' }]}>
          <Ionicons name="bar-chart-outline" size={28} color={colors.PRIMARY} />
        </View>
        <Text style={chartStyles.noDataText}>
          Cần ít nhất 2 buổi ghi để xem xu hướng
        </Text>
      </View>
    );
  }

  const containerWidth = SCREEN_WIDTH - CHART_HORIZONTAL_PADDING * 2;
  const chartInnerWidth = containerWidth - CHART_INNER_PADDING * 2 - 28; // 28 = yAxis width
  const barCount = chartData.length;
  const barGap = 6;
  const barWidth = Math.min(28, (chartInnerWidth - barGap * (barCount - 1)) / barCount);
  const totalBarsWidth = barCount * barWidth + (barCount - 1) * barGap;
  const startOffset = (chartInnerWidth - totalBarsWidth) / 2;

  return (
    <View style={chartStyles.container}>
      <Text style={chartStyles.sectionTitle}>Xu hướng điểm số</Text>
      <View style={[chartStyles.chartCard, { borderColor: colors.BORDER }]}>
        {/* Y-axis labels */}
        <View style={chartStyles.yAxisLabels}>
          <Text style={chartStyles.yLabel}>10</Text>
          <Text style={chartStyles.yLabel}>5</Text>
          <Text style={chartStyles.yLabel}>0</Text>
        </View>

        <View style={chartStyles.chartArea}>
          {/* Grid lines */}
          <View style={[chartStyles.gridLine, { top: 0 }]} />
          <View style={[chartStyles.gridLine, { top: '50%' }]} />
          <View style={[chartStyles.gridLine, { bottom: 0 }]} />

          {/* Bars */}
          {chartData.map((session, index) => {
            const barHeight = Math.max(4, (session.score / 10) * CHART_HEIGHT);
            const barColor = getBarColor(session.score);
            const xPos = startOffset + index * (barWidth + barGap);

            return (
              <View
                key={session.id}
                style={[
                  chartStyles.barWrapper,
                  {
                    left: xPos,
                    width: barWidth,
                    height: CHART_HEIGHT,
                  },
                ]}
              >
                {/* Score label on top */}
                <Text style={[chartStyles.barScore, { bottom: barHeight + 4 }]}>
                  {session.score.toFixed(1)}
                </Text>

                {/* The bar itself */}
                <View
                  style={[
                    chartStyles.bar,
                    {
                      height: barHeight,
                      backgroundColor: barColor,
                      width: barWidth,
                      borderTopLeftRadius: BAR_RADIUS,
                      borderTopRightRadius: BAR_RADIUS,
                    },
                  ]}
                />
              </View>
            );
          })}
        </View>
      </View>

      {/* X-axis date labels */}
      <View style={[chartStyles.xAxisRow, { paddingLeft: 28 + CHART_INNER_PADDING }]}>
        {chartData.map((session, index) => {
          const xPos = startOffset + index * (barWidth + barGap);
          return (
            <Text
              key={session.id}
              style={[
                chartStyles.xLabel,
                {
                  position: 'absolute',
                  left: xPos + 28 + CHART_INNER_PADDING,
                  width: barWidth + barGap,
                },
              ]}
              numberOfLines={1}
            >
              {abbreviateDate(session.date)}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

const chartStyles = StyleSheet.create({
  container: { marginBottom: 12 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.TEXT,
    marginBottom: 10,
  },
  chartCard: {
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: CHART_INNER_PADDING,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  yAxisLabels: {
    width: 22,
    height: CHART_HEIGHT,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginRight: 6,
  },
  yLabel: {
    fontSize: 10,
    color: COLORS.TEXT_LIGHT,
    fontWeight: '500',
  },
  chartArea: {
    flex: 1,
    height: CHART_HEIGHT,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: COLORS.DIVIDER,
  },
  barWrapper: {
    position: 'absolute',
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '100%',
  },
  barScore: {
    position: 'absolute',
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    width: '100%',
  },
  xAxisRow: {
    height: 20,
    position: 'relative',
    marginTop: 4,
  },
  xLabel: {
    fontSize: 8,
    color: COLORS.TEXT_LIGHT,
    textAlign: 'center',
    fontWeight: '500',
  },
  noDataContainer: {
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  noDataIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  noDataText: {
    fontSize: 13,
    color: COLORS.TEXT_LIGHT,
    textAlign: 'center',
  },
});

// ─── Session Card ─────────────────────────────────────────────────────────────

function SessionCard({ session, onPress, onDelete }: {
  session: Session;
  onPress: () => void;
  onDelete: () => void;
}) {
  const scoreColor = getScoreColor(session.score);
  const outcomeInfo = session.outcome ? OUTCOME_CONFIG[session.outcome] : null;

  return (
    <TouchableOpacity style={styles.sessionCard} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.iconWrap, { backgroundColor: scoreColor + '20' }]}>
        <Ionicons name="person" size={20} color={scoreColor} />
      </View>

      <View style={styles.sessionInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.customerName}>{session.customerName}</Text>
          {outcomeInfo && (
            <View style={[styles.outcomeBadge, { backgroundColor: outcomeInfo.color + '18' }]}>
              <View style={[styles.outcomeDot, { backgroundColor: outcomeInfo.color }]} />
              <Text style={[styles.outcomeLabel, { color: outcomeInfo.color }]}>
                {outcomeInfo.label}
              </Text>
            </View>
          )}
        </View>
        {session.companyName ? (
          <Text style={styles.companyName}>{session.companyName}</Text>
        ) : null}
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={12} color={COLORS.TEXT_LIGHT} />
          <Text style={styles.metaText}>{session.date}</Text>
          <View style={styles.metaDivider} />
          <Ionicons name="time-outline" size={12} color={COLORS.TEXT_LIGHT} />
          <Text style={styles.metaText}>{formatTime(session.duration)}</Text>
        </View>
      </View>

      <View style={styles.cardRight}>
        <View style={[styles.scoreBadge, { backgroundColor: scoreColor }]}>
          <Text style={styles.scoreNumber}>{session.score.toFixed(1)}</Text>
        </View>
        <Text style={[styles.scoreLabel, { color: scoreColor }]}>
          {getScoreLabel(session.score)}
        </Text>
        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="trash-outline" size={15} color={COLORS.TEXT_LIGHT} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// ─── History Screen ───────────────────────────────────────────────────────────

export default function HistoryScreen() {
  const C = useColors();
  const navigation = useNavigation<any>();
  const { showAlert } = useAlert();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadSessions().then(setSessions);
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSessions().then(setSessions);
    setRefreshing(false);
  }, []);

  const handleDelete = (id: string, name: string) => {
    showAlert({
      title: 'Xoá phiên tư vấn',
      message: `Xoá phiên với ${name}?`,
      type: 'warning',
      buttons: [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xoá',
          style: 'destructive',
          onPress: async () => {
            await deleteSession(id);
            setSessions(prev => prev.filter(s => s.id !== id));
          },
        },
      ],
    });
  };

  const renderListHeader = useCallback(() => {
    if (sessions.length === 0) return null;
    return (
      <View>
        <StatsSummary sessions={sessions} colors={C} />
        <ScoreBarChart sessions={sessions} colors={C} />
        <Text style={styles.listSectionTitle}>Tất cả phiên tư vấn</Text>
      </View>
    );
  }, [sessions, C]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Lịch sử tư vấn</Text>
          <Text style={styles.headerSubtitle}>{sessions.length} buổi đã ghi</Text>
        </View>

        {sessions.length > 0 ? (
          <FlatList
            data={sessions}
            keyExtractor={item => item.id}
            ListHeaderComponent={renderListHeader}
            renderItem={({ item }) => (
              <SessionCard
                session={item}
                onPress={() => navigation.navigate('SessionDetail', { session: item })}
                onDelete={() => handleDelete(item.id, item.customerName)}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.PRIMARY} colors={[C.PRIMARY]} />}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={COLORS.BORDER} />
            <Text style={styles.emptyTitle}>Chưa có lịch sử</Text>
            <Text style={styles.emptySubtitle}>
              Ghi âm một phiên tư vấn và nhấn "Lưu kết quả" — sẽ xuất hiện ở đây.
            </Text>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: C.PRIMARY }]}
              onPress={() => navigation.navigate('GhiAm')}
            >
              <Ionicons name="mic-outline" size={16} color="#fff" />
              <Text style={styles.emptyBtnText}>Bắt đầu ghi âm</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { paddingTop: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: COLORS.TEXT },
  headerSubtitle: { fontSize: 13, color: COLORS.TEXT_LIGHT, marginTop: 2 },
  listContent: { paddingBottom: 20 },
  listSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.TEXT,
    marginBottom: 10,
    marginTop: 4,
  },
  sessionCard: {
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrap: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  sessionInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  outcomeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  outcomeDot: { width: 6, height: 6, borderRadius: 3 },
  outcomeLabel: { fontSize: 10, fontWeight: '700' },
  customerName: { fontSize: 15, fontWeight: '600', color: COLORS.TEXT },
  companyName: { fontSize: 12, color: COLORS.TEXT_LIGHT, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 12, color: COLORS.TEXT_LIGHT },
  metaDivider: { width: 1, height: 10, backgroundColor: COLORS.BORDER, marginHorizontal: 4 },
  cardRight: { alignItems: 'center', marginLeft: 8, gap: 3 },
  scoreBadge: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center',
  },
  scoreNumber: { color: '#fff', fontWeight: '700', fontSize: 13 },
  scoreLabel: { fontSize: 10, fontWeight: '600' },
  deleteBtn: { marginTop: 4 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.TEXT, marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: COLORS.TEXT_LIGHT, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.PRIMARY, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 25,
  },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
