import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl,
  Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { useColors } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../contexts/AlertContext';
import {
  loadMyPacks, loadTemplates, setActivePack, deletePack, copyTemplate,
  getPackLimit, ProjectPack,
} from '../services/projectPackService';
import { getSubscription } from '../services/subscriptionService';

export default function ProjectPackListScreen() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const navigation = useNavigation<any>();
  const { profile } = useAuth();
  const { showAlert } = useAlert();

  const [myPacks, setMyPacks] = useState<ProjectPack[]>([]);
  const [templates, setTemplates] = useState<ProjectPack[]>([]);
  const [activePackId, setActivePackId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tier, setTier] = useState('free');

  const load = useCallback(async () => {
    try {
      const [packs, tpls, sub] = await Promise.all([
        loadMyPacks(),
        loadTemplates(),
        getSubscription(),
      ]);
      setMyPacks(packs.filter(p => !p.is_template));
      setTemplates(tpls);
      setActivePackId((profile as any)?.active_pack_id || null);
      setTier(sub.tier);
    } catch (err: any) {
      showAlert({ title: 'Lỗi', message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [profile, showAlert]);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    load();
  }, [load]));

  const limit = getPackLimit(tier);
  const canCreate = myPacks.filter(p => p.owner_id === profile?.id).length < limit;

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleActivate = async (packId: string) => {
    try {
      await setActivePack(packId);
      setActivePackId(packId);
      showAlert({ title: 'Đã kích hoạt', message: 'Pack này giờ là active. AI sẽ dùng data này.', type: 'success' });
    } catch (err: any) {
      showAlert({ title: 'Lỗi', message: err.message, type: 'error' });
    }
  };

  const handleDelete = (pack: ProjectPack) => {
    Alert.alert('Xóa pack?', `Xóa "${pack.name}" vĩnh viễn?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa', style: 'destructive', onPress: async () => {
          try {
            await deletePack(pack.id);
            if (activePackId === pack.id) await setActivePack(null);
            load();
          } catch (err: any) {
            showAlert({ title: 'Lỗi', message: err.message, type: 'error' });
          }
        },
      },
    ]);
  };

  const handleUseTemplate = async (tpl: ProjectPack) => {
    if (!profile?.id) return;
    if (!canCreate) {
      showAlert({
        title: 'Hết slot',
        message: `Gói ${tier} cho phép ${limit} pack. Nâng cấp BĐS Pro để tạo không giới hạn.`,
        type: 'warning',
        buttons: [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Nâng cấp', onPress: () => navigation.navigate('Paywall') },
        ],
      });
      return;
    }
    try {
      const newPack = await copyTemplate(tpl.id, profile.id);
      await setActivePack(newPack.id);
      load();
      showAlert({ title: 'Đã sao chép', message: `${tpl.name} đã được thêm vào pack của bạn.`, type: 'success' });
    } catch (err: any) {
      showAlert({ title: 'Lỗi', message: err.message, type: 'error' });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe]} edges={['top']}>
        <ActivityIndicator size="large" color={C.PRIMARY} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe]} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={C.TEXT} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Dự án của tôi</Text>
        <TouchableOpacity
          onPress={() => {
            if (!canCreate) {
              showAlert({
                title: 'Hết slot',
                message: `Gói ${tier} cho phép ${limit} pack. Nâng cấp BĐS Pro để tạo không giới hạn.`,
                type: 'warning',
                buttons: [
                  { text: 'Để sau', style: 'cancel' },
                  { text: 'Nâng cấp', onPress: () => navigation.navigate('Paywall') },
                ],
              });
              return;
            }
            navigation.navigate('ProjectPackEdit', {});
          }}
          style={styles.addBtn}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.PRIMARY} />}
      >
        {/* Quota info */}
        <View style={styles.quotaBar}>
          <Text style={styles.quotaText}>
            {myPacks.filter(p => p.owner_id === profile?.id).length}/{limit === 999 ? '∞' : limit} pack ({tier.toUpperCase()})
          </Text>
          {tier === 'free' && (
            <TouchableOpacity onPress={() => navigation.navigate('Paywall')}>
              <Text style={styles.upgradeLink}>Nâng cấp →</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* My packs */}
        {myPacks.length > 0 && (
          <>
            <Text style={styles.section}>Pack của tôi</Text>
            {myPacks.map(pack => {
              const isActive = activePackId === pack.id;
              const isOwn = pack.owner_id === profile?.id;
              return (
                <View key={pack.id} style={[styles.card, isActive && styles.cardActive]}>
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.packName}>{pack.name}</Text>
                      <View style={styles.metaRow}>
                        {isActive && (
                          <View style={styles.activeBadge}>
                            <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                            <Text style={styles.activeText}>Đang dùng</Text>
                          </View>
                        )}
                        {pack.is_team_shared && (
                          <View style={styles.teamBadge}>
                            <Ionicons name="people" size={11} color="#3B82F6" />
                            <Text style={styles.teamText}>Team</Text>
                          </View>
                        )}
                        {!isOwn && (
                          <Text style={styles.ownerHint}>Do admin team tạo</Text>
                        )}
                      </View>
                    </View>
                  </View>
                  <View style={styles.actions}>
                    {!isActive && (
                      <TouchableOpacity style={styles.actBtn} onPress={() => handleActivate(pack.id)}>
                        <Ionicons name="power" size={14} color={C.PRIMARY} />
                        <Text style={[styles.actText, { color: C.PRIMARY }]}>Kích hoạt</Text>
                      </TouchableOpacity>
                    )}
                    {isOwn && (
                      <>
                        <TouchableOpacity style={styles.actBtn} onPress={() => navigation.navigate('ProjectPackEdit', { packId: pack.id })}>
                          <Ionicons name="create-outline" size={14} color={C.TEXT_SECONDARY} />
                          <Text style={styles.actText}>Sửa</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actBtn} onPress={() => handleDelete(pack)}>
                          <Ionicons name="trash-outline" size={14} color="#EF4444" />
                          <Text style={[styles.actText, { color: '#EF4444' }]}>Xóa</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/* Templates */}
        {templates.length > 0 && (
          <>
            <Text style={[styles.section, { marginTop: 24 }]}>Template có sẵn</Text>
            <Text style={styles.sectionHint}>Sao chép để dùng ngay, chỉnh sửa theo nhu cầu</Text>
            {templates.map(tpl => (
              <View key={tpl.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.packName}>{tpl.name}</Text>
                      {tpl.is_verified && <Ionicons name="shield-checkmark" size={14} color="#3B82F6" />}
                    </View>
                    <Text style={styles.tplHint}>Template chính thức, verified bởi Coach Duy</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.copyBtn, { backgroundColor: C.PRIMARY }]}
                    onPress={() => handleUseTemplate(tpl)}
                  >
                    <Ionicons name="copy-outline" size={14} color="#fff" />
                    <Text style={styles.copyText}>Dùng</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {myPacks.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="folder-open-outline" size={48} color={C.TEXT_LIGHT} />
            <Text style={styles.emptyTitle}>Chưa có pack nào</Text>
            <Text style={styles.emptyDesc}>Chọn template hoặc tạo mới để AI trả lời đúng dự án bạn đang làm</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (C: any) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.BACKGROUND },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: C.CARD,
    borderBottomWidth: 1, borderBottomColor: C.BORDER,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: C.SURFACE },
  topBarTitle: { fontSize: 17, fontWeight: '700', color: C.TEXT, flex: 1, textAlign: 'center' },
  addBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: C.PRIMARY },
  scroll: { padding: 16 },
  quotaBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: C.CARD, padding: 12, borderRadius: 10, marginBottom: 16,
  },
  quotaText: { fontSize: 13, fontWeight: '600', color: C.TEXT_SECONDARY },
  upgradeLink: { fontSize: 13, fontWeight: '700', color: C.PRIMARY },
  section: { fontSize: 14, fontWeight: '700', color: C.TEXT, marginBottom: 8 },
  sectionHint: { fontSize: 12, color: C.TEXT_LIGHT, marginBottom: 12 },
  card: {
    backgroundColor: C.CARD, borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  cardActive: { borderColor: '#10B981' },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  packName: { fontSize: 15, fontWeight: '700', color: C.TEXT },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  activeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#D1FAE5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  activeText: { fontSize: 10, fontWeight: '700', color: '#10B981' },
  teamBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#DBEAFE', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  teamText: { fontSize: 10, fontWeight: '700', color: '#3B82F6' },
  ownerHint: { fontSize: 11, color: C.TEXT_LIGHT, fontStyle: 'italic' },
  tplHint: { fontSize: 11, color: C.TEXT_LIGHT, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 16, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.BORDER },
  actBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actText: { fontSize: 12, fontWeight: '600', color: C.TEXT_SECONDARY },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  copyText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: C.TEXT, marginTop: 12 },
  emptyDesc: { fontSize: 12, color: C.TEXT_LIGHT, textAlign: 'center', marginTop: 6, paddingHorizontal: 40 },
});
