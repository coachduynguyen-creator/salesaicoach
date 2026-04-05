import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, RefreshControl, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { useColors } from '../contexts/ThemeContext';
import { loadCustomers, deleteCustomer, CustomerProfile, loadSessions, addCustomer, updateCustomer, loadCustomerStatuses, CustomerStatus } from '../services/storageService';
import { useAlert } from '../contexts/AlertContext';

const STAGE_COLORS: Record<string, string> = {
  'mới tiếp cận': '#9F7AEA',
  'đang tìm hiểu': COLORS.WARNING,
  'đang so sánh': '#ED8936',
  'sắp chốt': COLORS.PRIMARY,
  'đã chốt': COLORS.SUCCESS,
};

function getStageColor(stage: string): string {
  const lower = stage.toLowerCase();
  for (const [key, color] of Object.entries(STAGE_COLORS)) {
    if (lower.includes(key)) return color;
  }
  return COLORS.TEXT_LIGHT;
}

export default function CustomerListScreen() {
  const navigation = useNavigation<any>();
  const C = useColors();
  const { showAlert } = useAlert();
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [statuses, setStatuses] = useState<CustomerStatus[]>([]);

  // Sync khách hàng từ sessions cũ vào CRM
  const syncCustomersFromSessions = useCallback(async () => {
    loadCustomerStatuses().then(setStatuses);
    const [existingCustomers, sessions] = await Promise.all([loadCustomers(), loadSessions()]);

    const customerNames = new Set(existingCustomers.map(c => c.name.toLowerCase().trim()));
    const toCreate: Record<string, { name: string; company: string; sessionIds: string[]; dates: string[]; scores: number[] }> = {};

    for (const s of sessions) {
      const name = s.customerName?.trim();
      if (!name || name === 'Khách hàng' || name === 'Chưa nhập tên') continue;
      const key = name.toLowerCase();
      if (customerNames.has(key)) {
        // Khách đã có — thêm sessionId nếu chưa có
        const existing = existingCustomers.find(c => c.name.toLowerCase().trim() === key);
        if (existing && !(existing.sessionIds || []).includes(s.id)) {
          await updateCustomer(existing.id, {
            sessionIds: [...(existing.sessionIds || []), s.id],
          });
        }
        continue;
      }
      if (!toCreate[key]) {
        toCreate[key] = { name, company: s.companyName || '', sessionIds: [], dates: [], scores: [] };
      }
      toCreate[key].sessionIds.push(s.id);
      toCreate[key].dates.push(s.date);
      toCreate[key].scores.push(s.score);
    }

    for (const data of Object.values(toCreate)) {
      const avgScore = data.scores.length > 0
        ? (data.scores.reduce((a, b) => a + b, 0) / data.scores.length).toFixed(1)
        : '';
      const newCustomer = await addCustomer({
        name: data.name,
        company: data.company,
        phone: '',
        email: '',
        needs: '',
        budget: '',
        concerns: '',
        stage: '',
        decisionFactors: '',
        personality: '',
        nextStep: '',
      });
      await updateCustomer(newCustomer.id, {
        sessionIds: data.sessionIds,
        notes: data.dates.map((d, i) => ({
          date: d,
          content: `Điểm: ${data.scores[i]?.toFixed(1) || '?'}/10`,
          sessionId: data.sessionIds[i],
        })),
      });
    }

    // Reload
    const updated = await loadCustomers();
    setCustomers(updated);
  }, []);

  useFocusEffect(
    useCallback(() => {
      syncCustomersFromSessions();
    }, [syncCustomersFromSessions])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await syncCustomersFromSessions();
    setRefreshing(false);
  }, [syncCustomersFromSessions]);

  const filtered = search.trim()
    ? customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.company.toLowerCase().includes(search.toLowerCase())
      )
    : customers;

  const handleDelete = (customer: CustomerProfile) => {
    showAlert({
      title: 'Xóa khách hàng',
      message: `Xóa "${customer.name}" và toàn bộ ghi chú?`,
      type: 'warning',
      buttons: [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa', style: 'destructive',
          onPress: async () => {
            await deleteCustomer(customer.id);
            setCustomers(prev => prev.filter(c => c.id !== customer.id));
          },
        },
      ],
    });
  };

  const renderCustomer = ({ item }: { item: CustomerProfile }) => {
    // Ưu tiên statusId, fallback sang stage text cũ
    const statusObj = statuses.find(s => s.id === item.statusId);
    const stageColor = statusObj?.color || getStageColor(item.stage || '');
    const stageLabel = statusObj?.label || item.stage || '';
    const noteCount = item.notes?.length || 0;
    const sessionCount = item.sessionIds?.length || 0;
    const score = item.leadScore || 0;

    return (
      <TouchableOpacity
        style={styles.customerCard}
        onPress={() => navigation.navigate('CustomerDetail', { customerId: item.id })}
        onLongPress={() => handleDelete(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.avatar, { backgroundColor: C.PRIMARY + '14' }]}>
          <Text style={[styles.avatarText, { color: C.PRIMARY }]}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          {item.company ? (
            <Text style={styles.company} numberOfLines={1}>{item.company}</Text>
          ) : null}

          <View style={styles.metaRow}>
            {stageLabel ? (
              <View style={[styles.stageBadge, { backgroundColor: stageColor + '18' }]}>
                <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: stageColor, marginRight: 4 }} />
                <Text style={[styles.stageText, { color: stageColor }]}>{stageLabel}</Text>
              </View>
            ) : null}
            {score > 0 && (
              <Text style={[styles.metaText, { fontWeight: '700', color: score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444' }]}>
                {score}đ
              </Text>
            )}
            <Text style={styles.metaText}>
              {sessionCount} cuộc gọi
            </Text>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={16} color={COLORS.TEXT_LIGHT} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Khách Hàng</Text>
        <Text style={styles.headerSub}>{customers.length} khách hàng</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={COLORS.TEXT_LIGHT} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo tên hoặc công ty..."
          placeholderTextColor={COLORS.TEXT_LIGHT}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.TEXT_LIGHT} />
          </TouchableOpacity>
        )}
      </View>

      {/* Stage Summary */}
      {customers.length > 0 && statuses.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, marginBottom: 8 }}>
          {statuses.sort((a, b) => a.order - b.order).map(status => {
            const count = customers.filter(c => c.statusId === status.id).length;
            if (count === 0) return null;
            return (
              <View key={status.id} style={[styles.statusChip, { backgroundColor: status.color + '18' }]}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: status.color }} />
                <Text style={[styles.statusChipText, { color: status.color }]}>{status.label}</Text>
                <Text style={[styles.statusChipCount, { color: status.color }]}>{count}</Text>
              </View>
            );
          }).filter(Boolean)}
        </ScrollView>
      )}

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderCustomer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.PRIMARY} colors={[C.PRIMARY]} />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="people-outline" size={48} color={COLORS.TEXT_LIGHT} />
            <Text style={styles.emptyTitle}>
              {search ? 'Không tìm thấy' : 'Chưa có khách hàng'}
            </Text>
            <Text style={styles.emptyDesc}>
              {search ? 'Thử từ khóa khác' : 'Ghi âm cuộc gọi đầu tiên, AI sẽ tự tạo profile khách'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: COLORS.TEXT },
  headerSub: { fontSize: 13, color: COLORS.TEXT_LIGHT, marginTop: 2 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginVertical: 10, backgroundColor: COLORS.CARD,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: COLORS.BORDER,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.TEXT },
  statusChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
  },
  statusChipText: { fontSize: 12, fontWeight: '600' },
  statusChipCount: { fontSize: 12, fontWeight: '800' },
  listContent: { paddingHorizontal: 16, paddingBottom: 30 },
  customerCard: {
    backgroundColor: COLORS.CARD, borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: '800' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: COLORS.TEXT },
  company: { fontSize: 12, color: COLORS.TEXT_LIGHT, marginTop: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  stageBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  stageText: { fontSize: 10, fontWeight: '700' },
  metaText: { fontSize: 11, color: COLORS.TEXT_LIGHT },
  needsText: { fontSize: 11, color: COLORS.TEXT_SECONDARY, marginTop: 3, fontStyle: 'italic' },
  emptyWrap: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: COLORS.TEXT },
  emptyDesc: { fontSize: 13, color: COLORS.TEXT_LIGHT, textAlign: 'center', paddingHorizontal: 40 },
});
