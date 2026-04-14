import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { useColors } from '../contexts/ThemeContext';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

interface BugReport {
  id: string;
  user_id: string;
  action: string;
  metadata: {
    description?: string;
    message?: string;
    screen?: string;
    reporter?: string;
    context?: string;
    platform?: string;
    timestamp?: string;
    stack?: string;
    status?: string;
  };
  created_at: string;
}

export default function BugReportsScreen() {
  const C = useColors();
  const navigation = useNavigation<any>();
  const { team } = useAuth();
  const [reports, setReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'bug_report' | 'app_crash' | 'app_warning'>('all');

  const loadReports = useCallback(async () => {
    try {
      let query = supabase
        .from('activity_logs')
        .select('*')
        .in('action', ['bug_report', 'app_crash', 'app_warning'])
        .order('created_at', { ascending: false })
        .limit(100);

      if (filter !== 'all') {
        query = query.eq('action', filter);
      }

      const { data } = await query;
      setReports((data || []) as BugReport[]);
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    loadReports();
  }, [loadReports]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const getActionInfo = (action: string) => {
    switch (action) {
      case 'bug_report': return { label: 'Báo lỗi', color: '#EF4444', icon: 'bug' };
      case 'app_crash': return { label: 'Crash', color: '#DC2626', icon: 'alert-circle' };
      case 'app_warning': return { label: 'Cảnh báo', color: '#F59E0B', icon: 'warning' };
      default: return { label: action, color: COLORS.TEXT_LIGHT, icon: 'information-circle' };
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diffMin < 1) return 'Vừa xong';
    if (diffMin < 60) return `${diffMin} phút trước`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} giờ trước`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay} ngày trước`;
    return d.toLocaleDateString('vi-VN');
  };

  const filters: { key: typeof filter; label: string }[] = [
    { key: 'all', label: 'Tất cả' },
    { key: 'bug_report', label: 'Báo lỗi' },
    { key: 'app_crash', label: 'Crash' },
    { key: 'app_warning', label: 'Cảnh báo' },
  ];

  const renderItem = ({ item }: { item: BugReport }) => {
    const info = getActionInfo(item.action);
    const meta = item.metadata || {};
    const content = meta.description || meta.message || 'Không có mô tả';
    const reporter = meta.reporter || 'Ẩn danh';
    const screen = meta.screen || meta.context || '';
    const platform = meta.platform || '';
    const time = meta.timestamp || item.created_at;

    return (
      <View style={[styles.card, { backgroundColor: C.CARD }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.typeBadge, { backgroundColor: info.color + '15' }]}>
            <Ionicons name={info.icon as any} size={14} color={info.color} />
            <Text style={[styles.typeText, { color: info.color }]}>{info.label}</Text>
          </View>
          <Text style={[styles.time, { color: C.TEXT_LIGHT }]}>{formatTime(time)}</Text>
        </View>

        <Text style={[styles.content, { color: C.TEXT }]} numberOfLines={4}>{content}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="person-outline" size={12} color={C.TEXT_LIGHT} />
            <Text style={[styles.metaText, { color: C.TEXT_LIGHT }]}>{reporter}</Text>
          </View>
          {screen ? (
            <View style={styles.metaItem}>
              <Ionicons name="phone-portrait-outline" size={12} color={C.TEXT_LIGHT} />
              <Text style={[styles.metaText, { color: C.TEXT_LIGHT }]}>{screen}</Text>
            </View>
          ) : null}
          {platform ? (
            <View style={styles.metaItem}>
              <Ionicons name="hardware-chip-outline" size={12} color={C.TEXT_LIGHT} />
              <Text style={[styles.metaText, { color: C.TEXT_LIGHT }]}>{platform}</Text>
            </View>
          ) : null}
        </View>

        {meta.stack ? (
          <Text style={[styles.stack, { color: C.TEXT_LIGHT, backgroundColor: C.SURFACE }]} numberOfLines={3}>
            {meta.stack}
          </Text>
        ) : null}

        {/* Admin status controls */}
        <View style={styles.statusRow}>
          {(['urgent', 'in_progress', 'resolved'] as const).map(status => {
            const currentStatus = meta.status || '';
            const isActive = currentStatus === status;
            const statusInfo = {
              urgent: { label: 'Ưu tiên', color: '#EF4444', icon: 'flag' },
              in_progress: { label: 'Đang xử lý', color: '#F59E0B', icon: 'hourglass' },
              resolved: { label: 'Đã xong', color: '#10B981', icon: 'checkmark-circle' },
            }[status];
            return (
              <TouchableOpacity
                key={status}
                style={[styles.statusBtn, isActive && { backgroundColor: statusInfo.color + '18', borderColor: statusInfo.color }]}
                onPress={async () => {
                  const newMeta = { ...meta, status: isActive ? '' : status };
                  await supabase.from('activity_logs').update({ metadata: newMeta }).eq('id', item.id);
                  setReports(prev => prev.map(r => r.id === item.id ? { ...r, metadata: newMeta } : r));
                }}
              >
                <Ionicons name={statusInfo.icon as any} size={12} color={isActive ? statusInfo.color : C.TEXT_LIGHT} />
                <Text style={[styles.statusBtnText, { color: isActive ? statusInfo.color : C.TEXT_LIGHT }]}>{statusInfo.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const bugCount = reports.filter(r => r.action === 'bug_report').length;
  const crashCount = reports.filter(r => r.action === 'app_crash').length;
  const warningCount = reports.filter(r => r.action === 'app_warning').length;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: C.BACKGROUND }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: C.BACKGROUND }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={C.TEXT} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: C.TEXT }]}>Báo Lỗi & Crash</Text>
          <Text style={[styles.headerSub, { color: C.TEXT_LIGHT }]}>{reports.length} báo cáo</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statBadge, { backgroundColor: '#EF4444' + '15' }]}>
          <Ionicons name="bug" size={14} color="#EF4444" />
          <Text style={[styles.statNum, { color: '#EF4444' }]}>{bugCount}</Text>
          <Text style={styles.statLabel}>Báo lỗi</Text>
        </View>
        <View style={[styles.statBadge, { backgroundColor: '#DC2626' + '15' }]}>
          <Ionicons name="alert-circle" size={14} color="#DC2626" />
          <Text style={[styles.statNum, { color: '#DC2626' }]}>{crashCount}</Text>
          <Text style={styles.statLabel}>Crash</Text>
        </View>
        <View style={[styles.statBadge, { backgroundColor: '#F59E0B' + '15' }]}>
          <Ionicons name="warning" size={14} color="#F59E0B" />
          <Text style={[styles.statNum, { color: '#F59E0B' }]}>{warningCount}</Text>
          <Text style={styles.statLabel}>Cảnh báo</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {filters.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterTab, filter === f.key && { backgroundColor: C.PRIMARY }]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && { color: '#fff' }]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={reports}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.PRIMARY} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={48} color={C.BORDER} />
            <Text style={[styles.emptyTitle, { color: C.TEXT }]}>Không có báo cáo</Text>
            <Text style={[styles.emptySub, { color: C.TEXT_LIGHT }]}>
              {loading ? 'Đang tải...' : 'Chưa có báo lỗi hoặc crash nào được ghi nhận.'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  headerTitle: { fontSize: 26, fontWeight: '800' },
  headerSub: { fontSize: 13, marginTop: 2 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 12 },
  statBadge: {
    flex: 1, borderRadius: 12, padding: 12, alignItems: 'center', gap: 4,
  },
  statNum: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 11, color: COLORS.TEXT_LIGHT },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 6, marginBottom: 12 },
  filterTab: {
    flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 12,
    backgroundColor: COLORS.SURFACE,
  },
  filterText: { fontSize: 12, fontWeight: '600', color: COLORS.TEXT_SECONDARY },
  listContent: { padding: 16, paddingTop: 4, gap: 12, paddingBottom: 30 },
  card: {
    borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  typeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  typeText: { fontSize: 12, fontWeight: '700' },
  time: { fontSize: 11 },
  content: { fontSize: 14, lineHeight: 20, marginBottom: 10 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11 },
  stack: { fontSize: 10, fontFamily: 'monospace', marginTop: 10, padding: 8, borderRadius: 8, lineHeight: 14 },
  statusRow: { flexDirection: 'row', gap: 6, marginTop: 10 },
  statusBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: COLORS.BORDER },
  statusBtnText: { fontSize: 11, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 17, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  emptySub: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
});
