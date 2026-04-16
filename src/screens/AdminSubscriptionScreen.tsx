import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { useColors } from '../contexts/ThemeContext';
import { useAlert } from '../contexts/AlertContext';
import { supabase } from '../services/supabaseClient';
import { PLAN_LABELS, PLAN_PRICES, formatPrice, PlanTier } from '../services/subscriptionService';

interface UserSub {
  user_id: string;
  email: string;
  full_name: string;
  tier: string;
  expires_at: string | null;
  payment_note: string;
}

const TIERS: { key: PlanTier; color: string }[] = [
  { key: 'free', color: '#94A3B8' },
  { key: 'pro', color: '#3B82F6' },
  { key: 'bds_pro', color: '#8B5CF6' },
  { key: 'team_s', color: '#10B981' },
  { key: 'team_m', color: '#F59E0B' },
  { key: 'team_l', color: '#EF4444' },
];

export default function AdminSubscriptionScreen() {
  const C = useColors();
  const navigation = useNavigation();
  const { showAlert } = useAlert();
  const [searchEmail, setSearchEmail] = useState('');
  const [recentSubs, setRecentSubs] = useState<UserSub[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activating, setActivating] = useState<string | null>(null);

  // Modal state
  const [selectedUser, setSelectedUser] = useState<{ id: string; email: string; name: string } | null>(null);
  const [selectedTier, setSelectedTier] = useState<PlanTier>('pro');
  const [duration, setDuration] = useState<'1' | '3' | '6' | '12'>('1');
  const [paymentNote, setPaymentNote] = useState('');

  const loadRecentSubs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('user_id, tier, expires_at, payment_note')
        .order('updated_at', { ascending: false })
        .limit(20);

      if (error) {
        showAlert({ title: 'Lỗi', message: `Không tải được danh sách: ${error.message}`, type: 'error' });
        setRecentSubs([]);
        return;
      }
      if (!data) { setRecentSubs([]); return; }

    // Lấy thêm email + name từ profiles
    const userIds = data.map(s => s.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .in('id', userIds);

    const profileMap: Record<string, { email: string; full_name: string }> = {};
    for (const p of profiles || []) {
      profileMap[p.id] = { email: p.email, full_name: p.full_name };
    }

      setRecentSubs(data.map(s => ({
        ...s,
        email: profileMap[s.user_id]?.email || '',
        full_name: profileMap[s.user_id]?.full_name || '',
      })));
    } catch (err: any) {
      showAlert({ title: 'Lỗi', message: err?.message || 'Không tải được danh sách', type: 'error' });
      setRecentSubs([]);
    }
  }, [showAlert]);

  useFocusEffect(useCallback(() => { loadRecentSubs(); }, [loadRecentSubs]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecentSubs();
    setRefreshing(false);
  };

  const handleSearch = async () => {
    if (!searchEmail.trim()) return;
    setLoading(true);

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .ilike('email', `%${searchEmail.trim()}%`)
      .limit(5);

    setLoading(false);

    if (!profiles || profiles.length === 0) {
      showAlert({ title: 'Không tìm thấy', message: `Không có user với email "${searchEmail}"`, type: 'warning' });
      return;
    }

    if (profiles.length === 1) {
      setSelectedUser({ id: profiles[0].id, email: profiles[0].email, name: profiles[0].full_name });
    } else {
      // Hiện danh sách chọn
      Alert.alert(
        'Chọn user',
        profiles.map((p, i) => `${i + 1}. ${p.full_name || 'Chưa tên'} (${p.email})`).join('\n'),
        profiles.map((p, i) => ({
          text: `${i + 1}. ${p.email}`,
          onPress: () => setSelectedUser({ id: p.id, email: p.email, name: p.full_name }),
        })),
      );
    }
  };

  const handleActivate = async () => {
    if (!selectedUser) return;
    setActivating(selectedUser.id);

    const months = parseInt(duration);
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + months);

    const { data: { user: adminUser } } = await supabase.auth.getUser();
    if (!adminUser) {
      setActivating(null);
      showAlert({ title: 'Lỗi', message: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', type: 'error' });
      return;
    }

    const { error } = await supabase.from('subscriptions').upsert({
      user_id: selectedUser.id,
      tier: selectedTier,
      expires_at: expiresAt.toISOString(),
      activated_by: adminUser.id,
      payment_note: paymentNote || `Admin kích hoạt ${PLAN_LABELS[selectedTier]} ${months} tháng`,
    }, { onConflict: 'user_id' });

    setActivating(null);

    if (error) {
      showAlert({ title: 'Lỗi', message: error.message, type: 'error' });
      return;
    }

    showAlert({
      title: 'Kích hoạt thành công!',
      message: `${selectedUser.email}\nGói: ${PLAN_LABELS[selectedTier]}\nHết hạn: ${expiresAt.toLocaleDateString('vi-VN')}`,
      type: 'success',
    });

    setSelectedUser(null);
    setPaymentNote('');
    loadRecentSubs();
  };

  const tierColor = (tier: string) => TIERS.find(t => t.key === tier)?.color || '#94A3B8';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.BACKGROUND }]} edges={['top']}>
      <View style={[styles.topBar, { backgroundColor: C.CARD, borderBottomColor: C.BORDER }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: C.SURFACE }]}>
          <Ionicons name="arrow-back" size={22} color={C.TEXT} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: C.TEXT }]}>Kích Hoạt Subscription</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.PRIMARY} />}
      >
        {/* Search */}
        <View style={[styles.searchCard, { backgroundColor: C.CARD }]}>
          <Text style={[styles.sectionLabel, { color: C.TEXT }]}>Tìm user theo email</Text>
          <View style={styles.searchRow}>
            <TextInput
              style={[styles.searchInput, { color: C.TEXT, backgroundColor: C.SURFACE, borderColor: C.BORDER }]}
              value={searchEmail}
              onChangeText={setSearchEmail}
              placeholder="email@example.com"
              placeholderTextColor={C.TEXT_LIGHT}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity style={[styles.searchBtn, { backgroundColor: C.PRIMARY }]} onPress={handleSearch}>
              {loading ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="search" size={20} color="#fff" />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Activation Form */}
        {selectedUser && (
          <View style={[styles.activateCard, { backgroundColor: C.CARD }]}>
            <View style={styles.userInfo}>
              <Ionicons name="person-circle" size={40} color={C.PRIMARY} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.userName, { color: C.TEXT }]}>{selectedUser.name || 'Chưa tên'}</Text>
                <Text style={[styles.userEmail, { color: C.TEXT_LIGHT }]}>{selectedUser.email}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedUser(null)}>
                <Ionicons name="close-circle" size={24} color={C.TEXT_LIGHT} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.fieldLabel, { color: C.TEXT_SECONDARY }]}>Chọn gói</Text>
            <View style={styles.tierGrid}>
              {TIERS.filter(t => t.key !== 'free').map(t => (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.tierOption, selectedTier === t.key && { backgroundColor: t.color, borderColor: t.color }]}
                  onPress={() => setSelectedTier(t.key)}
                >
                  <Text style={[styles.tierOptionText, selectedTier === t.key && { color: '#fff' }]}>
                    {PLAN_LABELS[t.key]?.replace(' (5 người)', '').replace(' (10 người)', '').replace(' (20 người)', '')}
                  </Text>
                  {PLAN_PRICES[t.key] && (
                    <Text style={[styles.tierPrice, selectedTier === t.key && { color: 'rgba(255,255,255,0.8)' }]}>
                      {formatPrice(PLAN_PRICES[t.key].monthly)}/th
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.fieldLabel, { color: C.TEXT_SECONDARY }]}>Thời hạn</Text>
            <View style={styles.durationRow}>
              {(['1', '3', '6', '12'] as const).map(d => (
                <TouchableOpacity
                  key={d}
                  style={[styles.durationBtn, duration === d && { backgroundColor: C.PRIMARY, borderColor: C.PRIMARY }]}
                  onPress={() => setDuration(d)}
                >
                  <Text style={[styles.durationText, duration === d && { color: '#fff' }]}>{d} tháng</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.fieldLabel, { color: C.TEXT_SECONDARY }]}>Ghi chú thanh toán</Text>
            <TextInput
              style={[styles.noteInput, { color: C.TEXT, backgroundColor: C.SURFACE, borderColor: C.BORDER }]}
              value={paymentNote}
              onChangeText={setPaymentNote}
              placeholder="VD: CK MB Bank 499k ngày 14/04"
              placeholderTextColor={C.TEXT_LIGHT}
            />

            <TouchableOpacity
              style={[styles.activateBtn, { backgroundColor: tierColor(selectedTier) }]}
              onPress={handleActivate}
              disabled={activating === selectedUser.id}
            >
              {activating === selectedUser.id ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.activateBtnText}>
                    Kích hoạt {PLAN_LABELS[selectedTier]} — {duration} tháng
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Recent subscriptions */}
        <Text style={[styles.sectionLabel, { color: C.TEXT, marginTop: 20 }]}>Subscription gần đây</Text>
        {recentSubs.length === 0 ? (
          <Text style={[styles.emptyText, { color: C.TEXT_LIGHT }]}>Chưa có subscription nào</Text>
        ) : (
          recentSubs.map(s => {
            const expired = s.expires_at && new Date(s.expires_at) < new Date();
            return (
              <View key={s.user_id} style={[styles.subRow, { backgroundColor: C.CARD }]}>
                <View style={[styles.tierDot, { backgroundColor: tierColor(s.tier) }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.subName, { color: C.TEXT }]}>{s.full_name || s.email}</Text>
                  <Text style={[styles.subMeta, { color: C.TEXT_LIGHT }]}>
                    {PLAN_LABELS[s.tier as PlanTier] || s.tier}
                    {s.expires_at ? ` — HH: ${new Date(s.expires_at).toLocaleDateString('vi-VN')}` : ''}
                    {expired ? ' (hết hạn)' : ''}
                  </Text>
                  {s.payment_note ? <Text style={[styles.subNote, { color: C.TEXT_LIGHT }]}>{s.payment_note}</Text> : null}
                </View>
                <TouchableOpacity onPress={() => {
                  setSelectedUser({ id: s.user_id, email: s.email, name: s.full_name });
                  setSelectedTier((s.tier as PlanTier) || 'pro');
                }}>
                  <Ionicons name="create-outline" size={18} color={C.PRIMARY} />
                </TouchableOpacity>
              </View>
            );
          })
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  topBarTitle: { fontSize: 17, fontWeight: '700', flex: 1, textAlign: 'center' },
  scroll: { padding: 16 },

  searchCard: { borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionLabel: { fontSize: 15, fontWeight: '700', marginBottom: 10 },
  searchRow: { flexDirection: 'row', gap: 8 },
  searchInput: { flex: 1, height: 44, borderRadius: 10, paddingHorizontal: 14, fontSize: 15, borderWidth: 1 },
  searchBtn: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },

  activateCard: { borderRadius: 16, padding: 16, marginBottom: 16 },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  userName: { fontSize: 16, fontWeight: '700' },
  userEmail: { fontSize: 13 },

  fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  tierGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tierOption: {
    minWidth: '30%', flex: 1, paddingVertical: 10, paddingHorizontal: 8,
    borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.BORDER, alignItems: 'center',
  },
  tierOptionText: { fontSize: 12, fontWeight: '700', color: COLORS.TEXT_SECONDARY },
  tierPrice: { fontSize: 10, color: COLORS.TEXT_LIGHT, marginTop: 2 },

  durationRow: { flexDirection: 'row', gap: 8 },
  durationBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.BORDER,
  },
  durationText: { fontSize: 13, fontWeight: '600', color: COLORS.TEXT_SECONDARY },

  noteInput: { height: 44, borderRadius: 10, paddingHorizontal: 14, fontSize: 14, borderWidth: 1, marginTop: 4 },

  activateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: 12, marginTop: 16,
  },
  activateBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  subRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 14, borderRadius: 12, marginBottom: 8,
  },
  tierDot: { width: 10, height: 10, borderRadius: 5 },
  subName: { fontSize: 14, fontWeight: '600' },
  subMeta: { fontSize: 11, marginTop: 2 },
  subNote: { fontSize: 10, marginTop: 2, fontStyle: 'italic' },
  emptyText: { fontSize: 13, textAlign: 'center', paddingVertical: 20 },
});
