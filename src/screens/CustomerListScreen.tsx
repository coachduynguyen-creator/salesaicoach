import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput,
  RefreshControl, Image, ScrollView, Modal, Dimensions,
  KeyboardAvoidingView, Platform,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { useColors } from '../contexts/ThemeContext';
import {
  loadCustomers, deleteCustomer, CustomerProfile, loadSessions,
  addCustomer, updateCustomer, loadCustomerStatuses, CustomerStatus,
} from '../services/storageService';
import { useAlert } from '../contexts/AlertContext';

export default function CustomerListScreen() {
  const navigation = useNavigation<any>();
  const C = useColors();
  const { showAlert } = useAlert();
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [statuses, setStatuses] = useState<CustomerStatus[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [showDropdown, setShowDropdown] = useState(false);
  const [funnelExpanded, setFunnelExpanded] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCompany, setNewCompany] = useState('');

  const syncCustomersFromSessions = useCallback(async () => {
    loadCustomerStatuses().then(setStatuses);
    const [existingCustomers, sessions] = await Promise.all([loadCustomers(), loadSessions()]);

    // Tập hợp tất cả sessionId đã thuộc khách nào đó — tránh tạo trùng
    const allAssignedSessionIds = new Set(existingCustomers.flatMap(c => c.sessionIds || []));
    const customerNames = new Set(existingCustomers.map(c => c.name.toLowerCase().trim()));
    const toCreate: Record<string, { name: string; company: string; sessionIds: string[]; dates: string[]; scores: number[] }> = {};

    for (const s of sessions) {
      const name = s.customerName?.trim();
      if (!name) continue;

      // Nếu session đã thuộc 1 khách nào rồi → skip (không tạo mới dù tên khác)
      if (allAssignedSessionIds.has(s.id)) continue;

      const key = name.toLowerCase();
      if (customerNames.has(key)) {
        const existing = existingCustomers.find(c => c.name.toLowerCase().trim() === key);
        if (existing && !(existing.sessionIds || []).includes(s.id)) {
          await updateCustomer(existing.id, { sessionIds: [...(existing.sessionIds || []), s.id] });
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
      const newCustomer = await addCustomer({
        name: data.name, company: data.company,
        phone: '', email: '', needs: '', budget: '', concerns: '',
        stage: '', statusId: 'new', decisionFactors: '', personality: '', nextStep: '',
      });
      await updateCustomer(newCustomer.id, {
        sessionIds: data.sessionIds,
        notes: data.dates.map((d, i) => ({
          date: d, content: `Điểm: ${data.scores[i]?.toFixed(1) || '?'}/10`, sessionId: data.sessionIds[i],
        })),
      });
    }

    setCustomers(await loadCustomers());
  }, []);

  useFocusEffect(useCallback(() => {
    syncCustomersFromSessions();
  }, [syncCustomersFromSessions]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await syncCustomersFromSessions();
    setRefreshing(false);
  }, [syncCustomersFromSessions]);

  const getLastContactInfo = (c: CustomerProfile) => {
    const lastContact = c.lastContactAt ? new Date(c.lastContactAt) : (c.notes?.[0] ? new Date(c.notes[0].date.split('/').reverse().join('-')) : null);
    const daysSince = lastContact ? Math.floor((Date.now() - lastContact.getTime()) / 86400000) : null;
    const needsAttention = daysSince === null || daysSince > 7;
    const timeAgoText = daysSince === null ? 'Chưa liên hệ' : daysSince === 0 ? 'Hôm nay' : daysSince === 1 ? 'Hôm qua' : `${daysSince} ngày trước`;
    return { daysSince, needsAttention, timeAgoText };
  };

  const attentionCount = customers.filter(c => getLastContactInfo(c).needsAttention).length;

  const searchFiltered = search.trim()
    ? customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.company.toLowerCase().includes(search.toLowerCase()))
    : customers;

  const filtered = activeFilter === 'attention'
    ? searchFiltered.filter(c => getLastContactInfo(c).needsAttention)
    : activeFilter === 'all'
      ? searchFiltered
      : searchFiltered.filter(c => c.statusId === activeFilter);

  const sortedStatuses = [...statuses].sort((a, b) => a.order - b.order);
  const activeStatusObj = sortedStatuses.find(s => s.id === activeFilter);

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
    const statusObj = statuses.find(s => s.id === item.statusId);
    const stageColor = statusObj?.color || COLORS.TEXT_LIGHT;
    const stageLabel = statusObj?.label || item.stage || '';
    const sessionCount = item.sessionIds?.length || 0;
    const score = item.leadScore || 0;
    const { needsAttention, timeAgoText } = getLastContactInfo(item);

    return (
      <TouchableOpacity
        style={[styles.customerCard, { backgroundColor: C.CARD }]}
        onPress={() => navigation.navigate('CustomerDetail', { customerId: item.id })}
        onLongPress={() => handleDelete(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.cardLeft, { borderLeftColor: stageColor }]} />
        <View style={[styles.avatar, { backgroundColor: C.PRIMARY + '12' }]}>
          {item.photoUri ? (
            <Image source={{ uri: item.photoUri }} style={styles.avatarImg} />
          ) : (
            <Text style={[styles.avatarText, { color: C.PRIMARY }]}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>

        <View style={styles.info}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.name, { color: C.TEXT, flex: 1 }]} numberOfLines={1}>{item.name}</Text>
            {needsAttention && (
              <View style={styles.attentionBadge}>
                <Ionicons name="alert-circle" size={14} color="#EF4444" />
              </View>
            )}
          </View>
          <Text style={[styles.lastContact, needsAttention && styles.lastContactWarning]}>
            {timeAgoText}
          </Text>
          {item.company ? <Text style={styles.company} numberOfLines={1}>{item.company}</Text> : null}
          <View style={styles.metaRow}>
            {stageLabel ? (
              <View style={[styles.stageBadge, { backgroundColor: stageColor + '15' }]}>
                <View style={[styles.stageDot, { backgroundColor: stageColor }]} />
                <Text style={[styles.stageText, { color: stageColor }]}>{stageLabel}</Text>
              </View>
            ) : null}
            {score > 0 && (
              <Text style={[styles.scoreVal, { color: score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444' }]}>
                {score}đ
              </Text>
            )}
            <Text style={styles.metaText}>{sessionCount} cuộc gọi</Text>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={16} color={COLORS.BORDER} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: C.BACKGROUND }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: C.BACKGROUND }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: C.TEXT }]}>Khách Hàng</Text>
          <Text style={[styles.headerSub, { color: C.TEXT_LIGHT }]}>{customers.length} khách hàng</Text>
        </View>
        <TouchableOpacity
          style={[styles.addCustomerBtn, { backgroundColor: C.PRIMARY }]}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Attention Banner */}
      {attentionCount > 0 && (
        <TouchableOpacity style={styles.attentionBanner} onPress={() => setActiveFilter(activeFilter === 'attention' ? 'all' : 'attention')}>
          <Ionicons name="warning" size={16} color="#EF4444" />
          <Text style={styles.attentionText}>{attentionCount} khách hàng cần chăm lại ({'>'}7 ngày)</Text>
          {activeFilter === 'attention' && <Ionicons name="checkmark-circle" size={16} color="#EF4444" />}
        </TouchableOpacity>
      )}

      {/* Sales Funnel */}
      {customers.length > 0 && sortedStatuses.length > 0 && (() => {
        const funnelData = sortedStatuses.map(status => ({
          ...status,
          count: customers.filter(c => c.statusId === status.id).length,
        }));
        const maxCount = Math.max(...funnelData.map(d => d.count), 1);

        return (
          <View style={[styles.funnelCard, { backgroundColor: C.CARD }]}>
            <TouchableOpacity style={styles.funnelHeader} onPress={() => setFunnelExpanded(!funnelExpanded)} activeOpacity={0.7}>
              <Ionicons name="funnel" size={16} color={C.PRIMARY} />
              <Text style={[styles.funnelTitle, { color: C.TEXT }]}>Sales Funnel</Text>
              <Text style={[styles.funnelTotal, { color: C.TEXT_LIGHT }]}>{customers.length} khách</Text>
              <Ionicons name={funnelExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.TEXT_LIGHT} />
            </TouchableOpacity>
            {funnelExpanded && funnelData.map((stage, idx) => {
              const pct = idx === 0
                ? '100%'
                : funnelData[idx - 1].count > 0
                  ? (Math.round((stage.count / funnelData[idx - 1].count) * 100)) + '%'
                  : '0%';
              const barWidth = maxCount > 0 ? Math.max((stage.count / maxCount) * 100, 8) : 8;

              return (
                <TouchableOpacity
                  key={stage.id}
                  style={styles.funnelRow}
                  onPress={() => setActiveFilter(activeFilter === stage.id ? 'all' : stage.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.funnelLabel, { color: C.TEXT_SECONDARY }]} numberOfLines={1}>{stage.label}</Text>
                  <View style={styles.funnelBarWrap}>
                    <View style={[styles.funnelBar, { width: `${barWidth}%`, backgroundColor: stage.color + '35' }]}>
                      {stage.count > 0 && (
                        <Text style={[styles.funnelBarText, { color: stage.color }]}>{stage.count}</Text>
                      )}
                    </View>
                  </View>
                  <Text style={[styles.funnelPct, { color: stage.color }]}>{pct}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        );
      })()}

      {/* Search + Dropdown Filter */}
      <View style={styles.searchRow}>
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={16} color={COLORS.TEXT_LIGHT} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm tên, công ty..."
            placeholderTextColor={COLORS.TEXT_LIGHT}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={COLORS.TEXT_LIGHT} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.filterBtn, activeFilter !== 'all' && { borderColor: activeFilter === 'attention' ? '#EF4444' : (activeStatusObj?.color || C.PRIMARY) }]}
          onPress={() => setShowDropdown(true)}
        >
          {activeFilter !== 'all' && (
            <View style={[styles.filterDot, { backgroundColor: activeStatusObj?.color }]} />
          )}
          <Text style={[styles.filterBtnText, activeFilter !== 'all' && { color: activeFilter === 'attention' ? '#EF4444' : activeStatusObj?.color }]} numberOfLines={1}>
            {activeFilter === 'all' ? 'Tất cả' : activeFilter === 'attention' ? 'Cần chăm' : activeStatusObj?.label || 'Lọc'}
          </Text>
          <Ionicons name="chevron-down" size={14} color={activeFilter === 'attention' ? '#EF4444' : activeFilter !== 'all' ? activeStatusObj?.color : COLORS.TEXT_LIGHT} />
        </TouchableOpacity>
      </View>

      {/* List */}
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
              {search || activeFilter !== 'all' ? 'Không tìm thấy' : 'Chưa có khách hàng'}
            </Text>
            <Text style={styles.emptyDesc}>
              {search ? 'Thử từ khóa khác' : activeFilter === 'attention' ? 'Không có khách cần chăm lại' : activeFilter !== 'all' ? 'Không có khách ở giai đoạn này' : 'Ghi âm cuộc gọi đầu tiên, AI sẽ tự tạo profile khách'}
            </Text>
          </View>
        }
      />

      {/* Dropdown Modal */}
      <Modal visible={showDropdown} transparent animationType="fade">
        <TouchableOpacity style={styles.dropdownOverlay} activeOpacity={1} onPress={() => setShowDropdown(false)}>
          <View style={styles.dropdownBox}>
            <Text style={styles.dropdownTitle}>Lọc theo giai đoạn</Text>

            <TouchableOpacity
              style={[styles.dropdownItem, activeFilter === 'all' && styles.dropdownItemActive]}
              onPress={() => { setActiveFilter('all'); setShowDropdown(false); }}
            >
              <Text style={[styles.dropdownItemText, activeFilter === 'all' && { color: C.PRIMARY, fontWeight: '700' }]}>
                Tất cả ({customers.length})
              </Text>
              {activeFilter === 'all' && <Ionicons name="checkmark" size={18} color={C.PRIMARY} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dropdownItem, activeFilter === 'attention' && styles.dropdownItemActive]}
              onPress={() => { setActiveFilter('attention'); setShowDropdown(false); }}
            >
              <Ionicons name="alert-circle" size={14} color="#EF4444" />
              <Text style={[styles.dropdownItemText, activeFilter === 'attention' && { color: '#EF4444', fontWeight: '700' }]}>
                Cần chăm lại ({attentionCount})
              </Text>
              {activeFilter === 'attention' && <Ionicons name="checkmark" size={18} color="#EF4444" />}
            </TouchableOpacity>

            {sortedStatuses.map(status => {
              const count = customers.filter(c => c.statusId === status.id).length;
              const isActive = activeFilter === status.id;
              return (
                <TouchableOpacity
                  key={status.id}
                  style={[styles.dropdownItem, isActive && styles.dropdownItemActive]}
                  onPress={() => { setActiveFilter(status.id); setShowDropdown(false); }}
                >
                  <View style={[styles.dropdownDot, { backgroundColor: status.color }]} />
                  <Text style={[styles.dropdownItemText, isActive && { color: status.color, fontWeight: '700' }]}>
                    {status.label} ({count})
                  </Text>
                  {isActive && <Ionicons name="checkmark" size={18} color={status.color} />}
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity style={styles.dropdownClose} onPress={() => setShowDropdown(false)}>
              <Text style={styles.dropdownCloseText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      {/* Add Customer Modal */}
      <Modal visible={showAddModal} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowAddModal(false)}>
          <View style={[styles.addModalContent, { backgroundColor: C.CARD }]}>
            <Text style={[styles.addModalTitle, { color: C.TEXT }]}>Thêm khách hàng mới</Text>

            <Text style={[styles.addModalLabel, { color: C.TEXT_SECONDARY }]}>Tên khách hàng *</Text>
            <TextInput
              style={[styles.addModalInput, { color: C.TEXT, borderColor: C.BORDER, backgroundColor: C.SURFACE }]}
              placeholder="VD: Anh Minh, Chị Lan..."
              placeholderTextColor={COLORS.TEXT_LIGHT}
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />

            <Text style={[styles.addModalLabel, { color: C.TEXT_SECONDARY }]}>Công ty (không bắt buộc)</Text>
            <TextInput
              style={[styles.addModalInput, { color: C.TEXT, borderColor: C.BORDER, backgroundColor: C.SURFACE }]}
              placeholder="VD: Công ty ABC"
              placeholderTextColor={COLORS.TEXT_LIGHT}
              value={newCompany}
              onChangeText={setNewCompany}
            />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
              <TouchableOpacity
                style={[styles.addModalCancelBtn, { backgroundColor: C.SURFACE }]}
                onPress={() => { setShowAddModal(false); setNewName(''); setNewCompany(''); }}
              >
                <Text style={{ color: C.TEXT, fontWeight: '600', fontSize: 15 }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addModalSaveBtn, { backgroundColor: C.PRIMARY }, !newName.trim() && { opacity: 0.5 }]}
                disabled={!newName.trim()}
                onPress={async () => {
                  if (!newName.trim()) return;
                  const newCustomer = await addCustomer({
                    name: newName.trim(),
                    company: newCompany.trim(),
                    phone: '', email: '', needs: '', budget: '', concerns: '',
                    stage: '', statusId: 'new', decisionFactors: '', personality: '', nextStep: '',
                  });
                  setShowAddModal(false);
                  setNewName('');
                  setNewCompany('');
                  setCustomers(await loadCustomers());
                  navigation.navigate('CustomerDetail', { customerId: newCustomer.id });
                }}
              >
                <Ionicons name="add" size={18} color="#fff" />
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Thêm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: COLORS.TEXT },
  headerSub: { fontSize: 13, color: COLORS.TEXT_LIGHT, marginTop: 2 },

  // Funnel
  funnelCard: {
    marginHorizontal: 16, marginBottom: 10, backgroundColor: COLORS.CARD,
    borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  funnelHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14,
  },
  funnelTitle: { fontSize: 14, fontWeight: '700', color: COLORS.TEXT, flex: 1 },
  funnelTotal: { fontSize: 12, color: COLORS.TEXT_LIGHT },
  funnelRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8,
  },
  funnelLabel: { width: 72, fontSize: 11, fontWeight: '600', color: COLORS.TEXT_SECONDARY },
  funnelBarWrap: { flex: 1, height: 30, justifyContent: 'center' },
  funnelBar: {
    height: 30, borderRadius: 6, justifyContent: 'center', paddingHorizontal: 10,
  },
  funnelBarText: { fontSize: 12, fontWeight: '800' },
  funnelPct: { width: 38, fontSize: 11, fontWeight: '700', textAlign: 'right' },

  // Search + Filter
  searchRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8, gap: 8 },
  searchWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.CARD, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: COLORS.BORDER,
  },
  searchInput: { flex: 1, fontSize: 13, color: COLORS.TEXT },
  filterBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.CARD, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: COLORS.BORDER, minWidth: 80,
  },
  filterDot: { width: 8, height: 8, borderRadius: 4 },
  filterBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.TEXT_SECONDARY },

  // List
  listContent: { padding: 16, paddingTop: 4, gap: 12, paddingBottom: 30 },
  customerCard: {
    backgroundColor: COLORS.CARD, borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    overflow: 'hidden',
  },
  cardLeft: { width: 3, height: '100%', position: 'absolute', left: 0, top: 0, bottom: 0, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center', marginRight: 10, overflow: 'hidden',
  },
  avatarImg: { width: 42, height: 42, borderRadius: 21 },
  avatarText: { fontSize: 17, fontWeight: '800' },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '700', color: COLORS.TEXT },
  company: { fontSize: 11, color: COLORS.TEXT_LIGHT, marginTop: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  stageBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6,
  },
  stageDot: { width: 5, height: 5, borderRadius: 3, marginRight: 4 },
  stageText: { fontSize: 11, fontWeight: '700' },
  scoreVal: { fontSize: 11, fontWeight: '800' },
  metaText: { fontSize: 11, color: COLORS.TEXT_LIGHT },
  lastContact: { fontSize: 11, color: COLORS.TEXT_LIGHT },
  lastContactWarning: { color: '#EF4444', fontWeight: '600' },
  attentionBadge: { marginLeft: 4 },
  attentionBanner: {
    flexDirection: 'row', backgroundColor: '#FEE2E2', borderRadius: 12,
    padding: 12, marginHorizontal: 16, marginBottom: 12, gap: 8, alignItems: 'center',
  },
  attentionText: { fontSize: 13, color: '#EF4444', fontWeight: '600', flex: 1 },

  // Dropdown
  dropdownOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  dropdownBox: {
    backgroundColor: COLORS.CARD, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, paddingBottom: 36,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 8,
  },
  dropdownTitle: { fontSize: 16, fontWeight: '700', color: COLORS.TEXT, marginBottom: 14 },
  dropdownItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.BORDER,
  },
  dropdownItemActive: { backgroundColor: COLORS.SURFACE, marginHorizontal: -8, paddingHorizontal: 8, borderRadius: 12 },
  dropdownDot: { width: 10, height: 10, borderRadius: 5 },
  dropdownItemText: { fontSize: 14, color: COLORS.TEXT, flex: 1 },
  dropdownClose: { alignItems: 'center', paddingVertical: 14, marginTop: 8 },
  dropdownCloseText: { fontSize: 14, fontWeight: '600', color: COLORS.TEXT_LIGHT },

  emptyWrap: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: COLORS.TEXT },
  emptyDesc: { fontSize: 13, color: COLORS.TEXT_LIGHT, textAlign: 'center', paddingHorizontal: 40 },
  addCustomerBtn: {
    width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  addModalContent: { borderRadius: 16, padding: 24 },
  addModalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  addModalLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6, marginTop: 8 },
  addModalInput: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15 },
  addModalCancelBtn: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  addModalSaveBtn: { flex: 1, borderRadius: 12, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
});
