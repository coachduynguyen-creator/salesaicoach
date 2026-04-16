import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  Switch, Alert, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { useColors } from '../contexts/ThemeContext';
import { fetchAllConfig, updateConfig, invalidateCache } from '../services/remoteConfigService';
import { formatPrice } from '../services/subscriptionService';

type ConfigSection = 'pricing' | 'trial' | 'announcement' | 'maintenance' | 'features' | 'app_info';

// ── Helper components (outside main component to avoid re-mount) ──

function SectionHeader({ title, icon, section, color, expanded, onToggle, C }: {
  title: string; icon: string; section: ConfigSection; color: string;
  expanded: boolean; onToggle: (s: ConfigSection) => void; C: any;
}) {
  return (
    <TouchableOpacity
      style={[styles.sectionHeader, { backgroundColor: C.CARD }]}
      onPress={() => onToggle(section)}
    >
      <View style={[styles.sectionIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon as any} size={18} color={color} />
      </View>
      <Text style={[styles.sectionTitle, { color: C.TEXT }]}>{title}</Text>
      <Ionicons
        name={expanded ? 'chevron-up' : 'chevron-down'}
        size={18} color={C.TEXT_LIGHT}
      />
    </TouchableOpacity>
  );
}

function SaveButton({ onPress, saving, C }: { onPress: () => void; saving: boolean; C: any }) {
  return (
    <TouchableOpacity
      style={[styles.saveBtn, { backgroundColor: C.PRIMARY }]}
      onPress={onPress}
      disabled={saving}
    >
      {saving ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <>
          <Ionicons name="cloud-upload-outline" size={16} color="#fff" />
          <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

function InputRow({ label, value, onChangeText, placeholder, keyboardType, C }: {
  label: string; value: string; onChangeText: (t: string) => void;
  placeholder?: string; keyboardType?: 'numeric' | 'default'; C: any;
}) {
  return (
    <View style={styles.inputRow}>
      <Text style={[styles.inputLabel, { color: C.TEXT_SECONDARY }]}>{label}</Text>
      <TextInput
        style={[styles.input, { color: C.TEXT, backgroundColor: C.SURFACE, borderColor: C.BORDER }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.TEXT_LIGHT}
        keyboardType={keyboardType || 'default'}
      />
    </View>
  );
}

function SwitchRow({ label, value, onValueChange, description, C }: {
  label: string; value: boolean; onValueChange: (v: boolean) => void; description?: string; C: any;
}) {
  return (
    <View style={styles.switchRow}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.switchLabel, { color: C.TEXT }]}>{label}</Text>
        {description ? <Text style={[styles.switchDesc, { color: C.TEXT_LIGHT }]}>{description}</Text> : null}
      </View>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ true: C.PRIMARY }} />
    </View>
  );
}

// ── Main component ──

export default function AdminConfigScreen() {
  const C = useColors();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSection, setExpandedSection] = useState<ConfigSection | null>(null);

  // Editable states
  const [pricing, setPricing] = useState({
    pro:     { monthly: '499000',  yearly: '4790000' },
    bds_pro: { monthly: '1000000', yearly: '9600000' },
    team_s:  { monthly: '1999000', yearly: '19190000' },
    team_m:  { monthly: '3499000', yearly: '33590000' },
    team_l:  { monthly: '5999000', yearly: '57590000' },
  });
  const [trial, setTrial] = useState({ enabled: true, days: '7', tier: 'pro' });
  const [announcement, setAnnouncement] = useState({
    enabled: false, title: '', message: '', type: 'info' as string, dismissable: true,
  });
  const [maintenance, setMaintenance] = useState({ enabled: false, message: '' });
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [appInfo, setAppInfo] = useState({
    min_version: '1.0.0', latest_version: '1.0.0', update_url: '', force_update: false,
  });

  const loadConfig = useCallback(async () => {
    try {
      invalidateCache();
      const all = await fetchAllConfig();

      if (all.pricing) {
        const p = all.pricing;
        setPricing({
          pro:     { monthly: String(p.pro?.monthly || 499000),     yearly: String(p.pro?.yearly || 4790000) },
          bds_pro: { monthly: String(p.bds_pro?.monthly || 1000000), yearly: String(p.bds_pro?.yearly || 9600000) },
          team_s:  { monthly: String(p.team_s?.monthly || 1999000),  yearly: String(p.team_s?.yearly || 19190000) },
          team_m:  { monthly: String(p.team_m?.monthly || 3499000),  yearly: String(p.team_m?.yearly || 33590000) },
          team_l:  { monthly: String(p.team_l?.monthly || 5999000),  yearly: String(p.team_l?.yearly || 57590000) },
        });
      }
      if (all.trial) {
        setTrial({
          enabled: all.trial.enabled ?? true,
          days: String(all.trial.days || 7),
          tier: all.trial.tier || 'pro',
        });
      }
      if (all.announcement) setAnnouncement(all.announcement);
      if (all.maintenance) setMaintenance(all.maintenance);
      if (all.feature_flags) setFeatures(all.feature_flags);
      if (all.app_info) setAppInfo(all.app_info);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    loadConfig();
  }, [loadConfig]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConfig();
    setRefreshing(false);
  };

  const saveSection = async (key: string, value: any) => {
    setSaving(key);
    const ok = await updateConfig(key, value);
    setSaving(null);
    if (ok) {
      Alert.alert('Thành công', 'Đã lưu cấu hình.');
    } else {
      Alert.alert('Lỗi', 'Không thể lưu. Kiểm tra quyền admin.');
    }
  };

  const toggleSection = useCallback((s: ConfigSection) => {
    setExpandedSection(prev => prev === s ? null : s);
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: C.BACKGROUND }]} edges={['top']}>
        <ActivityIndicator size="large" color={C.PRIMARY} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.BACKGROUND }]} edges={['top']}>
      <View style={[styles.topBar, { backgroundColor: C.CARD, borderBottomColor: C.BORDER }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: C.SURFACE }]}>
          <Ionicons name="arrow-back" size={22} color={C.TEXT} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: C.TEXT }]}>Cấu Hình App</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.PRIMARY} />}
      >
        {/* ── PRICING ─────────────────────────────── */}
        <SectionHeader title="Bảng giá" icon="pricetag" section="pricing" color="#10B981"
          expanded={expandedSection === 'pricing'} onToggle={toggleSection} C={C} />
        {expandedSection === 'pricing' && (
          <View style={[styles.sectionBody, { backgroundColor: C.CARD }]}>
            {([
              { key: 'pro',     label: 'Gói Pro',           color: '#3B82F6' },
              { key: 'bds_pro', label: 'Gói BĐS Pro',      color: '#8B5CF6' },
              { key: 'team_s',  label: 'Team S (5 người)',  color: '#10B981' },
              { key: 'team_m',  label: 'Team M (10 người)', color: '#F59E0B' },
              { key: 'team_l',  label: 'Team L (20 người)', color: '#EF4444' },
            ] as const).map((tier, idx) => (
              <View key={tier.key}>
                {idx > 0 && <View style={[styles.divider, { backgroundColor: C.BORDER }]} />}
                <Text style={[styles.tierTitle, { color: tier.color }]}>{tier.label}</Text>
                <InputRow C={C} label="Tháng (VND)" value={pricing[tier.key].monthly} keyboardType="numeric"
                  onChangeText={t => setPricing(p => ({ ...p, [tier.key]: { ...p[tier.key], monthly: t } }))} />
                <InputRow C={C} label="Năm (VND)" value={pricing[tier.key].yearly} keyboardType="numeric"
                  onChangeText={t => setPricing(p => ({ ...p, [tier.key]: { ...p[tier.key], yearly: t } }))} />
                <Text style={[styles.previewPrice, { color: C.TEXT_LIGHT }]}>
                  Hiển thị: {formatPrice(Number(pricing[tier.key].monthly) || 0)}/tháng | {formatPrice(Number(pricing[tier.key].yearly) || 0)}/năm
                </Text>
              </View>
            ))}

            <SaveButton saving={saving === 'pricing'} C={C}
              onPress={() => {
                const result: Record<string, any> = {};
                for (const k of Object.keys(pricing) as Array<keyof typeof pricing>) {
                  result[k] = { monthly: Number(pricing[k].monthly), yearly: Number(pricing[k].yearly) };
                }
                saveSection('pricing', result);
              }} />
          </View>
        )}

        {/* ── TRIAL ─────────────────────────────── */}
        <SectionHeader title="Dùng thử" icon="time" section="trial" color="#3B82F6"
          expanded={expandedSection === 'trial'} onToggle={toggleSection} C={C} />
        {expandedSection === 'trial' && (
          <View style={[styles.sectionBody, { backgroundColor: C.CARD }]}>
            <SwitchRow C={C} label="Cho phép dùng thử" value={trial.enabled}
              onValueChange={v => setTrial(t => ({ ...t, enabled: v }))} />
            <InputRow C={C} label="Số ngày dùng thử" value={trial.days} keyboardType="numeric"
              onChangeText={t => setTrial(tr => ({ ...tr, days: t }))} />
            <View style={styles.tierPicker}>
              <Text style={[styles.inputLabel, { color: C.TEXT_SECONDARY }]}>Gói dùng thử</Text>
              <View style={styles.tierBtns}>
                {(['pro', 'bds_pro'] as const).map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.tierBtn, trial.tier === t && { backgroundColor: C.PRIMARY }]}
                    onPress={() => setTrial(tr => ({ ...tr, tier: t }))}
                  >
                    <Text style={[styles.tierBtnText, trial.tier === t && { color: '#fff' }]}>
                      {t === 'pro' ? 'Pro' : 'BĐS Pro'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <SaveButton saving={saving === 'trial'} C={C}
              onPress={() => saveSection('trial', {
                enabled: trial.enabled, days: Number(trial.days) || 7, tier: trial.tier,
              })} />
          </View>
        )}

        {/* ── ANNOUNCEMENT ─────────────────────────────── */}
        <SectionHeader title="Thông báo" icon="megaphone" section="announcement" color="#F59E0B"
          expanded={expandedSection === 'announcement'} onToggle={toggleSection} C={C} />
        {expandedSection === 'announcement' && (
          <View style={[styles.sectionBody, { backgroundColor: C.CARD }]}>
            <SwitchRow C={C} label="Hiển thị thông báo" value={announcement.enabled}
              onValueChange={v => setAnnouncement(a => ({ ...a, enabled: v }))}
              description="Thông báo sẽ hiện trên Trang Chủ cho tất cả user" />
            <InputRow C={C} label="Tiêu đề" value={announcement.title}
              onChangeText={t => setAnnouncement(a => ({ ...a, title: t }))}
              placeholder="VD: Khuyến mãi đặc biệt!" />
            <InputRow C={C} label="Nội dung" value={announcement.message}
              onChangeText={t => setAnnouncement(a => ({ ...a, message: t }))}
              placeholder="Nội dung thông báo..." />
            <View style={styles.tierPicker}>
              <Text style={[styles.inputLabel, { color: C.TEXT_SECONDARY }]}>Loại</Text>
              <View style={styles.tierBtns}>
                {([
                  { key: 'info', label: 'Thông tin', color: '#3B82F6' },
                  { key: 'warning', label: 'Cảnh báo', color: '#F59E0B' },
                  { key: 'success', label: 'Thành công', color: '#10B981' },
                ]).map(t => (
                  <TouchableOpacity
                    key={t.key}
                    style={[styles.tierBtn, announcement.type === t.key && { backgroundColor: t.color }]}
                    onPress={() => setAnnouncement(a => ({ ...a, type: t.key }))}
                  >
                    <Text style={[styles.tierBtnText, announcement.type === t.key && { color: '#fff' }]}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <SwitchRow C={C} label="Cho phép tắt" value={announcement.dismissable}
              onValueChange={v => setAnnouncement(a => ({ ...a, dismissable: v }))} />
            <SaveButton saving={saving === 'announcement'} C={C}
              onPress={() => saveSection('announcement', announcement)} />
          </View>
        )}

        {/* ── MAINTENANCE ─────────────────────────────── */}
        <SectionHeader title="Bảo trì" icon="construct" section="maintenance" color="#EF4444"
          expanded={expandedSection === 'maintenance'} onToggle={toggleSection} C={C} />
        {expandedSection === 'maintenance' && (
          <View style={[styles.sectionBody, { backgroundColor: C.CARD }]}>
            <SwitchRow C={C} label="Chế độ bảo trì" value={maintenance.enabled}
              onValueChange={v => setMaintenance(m => ({ ...m, enabled: v }))}
              description="Khi bật, user sẽ thấy thông báo bảo trì thay vì dùng app" />
            <InputRow C={C} label="Thông báo bảo trì" value={maintenance.message}
              onChangeText={t => setMaintenance(m => ({ ...m, message: t }))}
              placeholder="Hệ thống đang bảo trì..." />
            <SaveButton saving={saving === 'maintenance'} C={C}
              onPress={() => {
                if (maintenance.enabled) {
                  Alert.alert(
                    'Xác nhận bật bảo trì',
                    'Tất cả người dùng sẽ không thể sử dụng app. Bạn chắc chắn?',
                    [
                      { text: 'Hủy', style: 'cancel' },
                      { text: 'Bật bảo trì', style: 'destructive', onPress: () => saveSection('maintenance', maintenance) },
                    ]
                  );
                } else {
                  saveSection('maintenance', maintenance);
                }
              }} />
          </View>
        )}

        {/* ── FEATURE FLAGS ─────────────────────────────── */}
        <SectionHeader title="Tính năng" icon="toggle" section="features" color="#8B5CF6"
          expanded={expandedSection === 'features'} onToggle={toggleSection} C={C} />
        {expandedSection === 'features' && (
          <View style={[styles.sectionBody, { backgroundColor: C.CARD }]}>
            {Object.entries({
              ai_coach: 'AI Coach Chat',
              recording: 'Ghi âm cuộc gọi',
              crm: 'Quản lý khách hàng',
              training: 'Đào tạo bài học',
              script_generator: 'Tạo kịch bản AI',
              goal_setting: 'Thiết lập mục tiêu',
            }).map(([key, label]) => (
              <SwitchRow C={C} key={key} label={label} value={features[key] ?? true}
                onValueChange={v => setFeatures(f => ({ ...f, [key]: v }))} />
            ))}
            <SaveButton saving={saving === 'feature_flags'} C={C}
              onPress={() => saveSection('feature_flags', features)} />
          </View>
        )}

        {/* ── APP INFO ─────────────────────────────── */}
        <SectionHeader title="Phiên bản" icon="information-circle" section="app_info" color="#64748B"
          expanded={expandedSection === 'app_info'} onToggle={toggleSection} C={C} />
        {expandedSection === 'app_info' && (
          <View style={[styles.sectionBody, { backgroundColor: C.CARD }]}>
            <InputRow C={C} label="Phiên bản tối thiểu" value={appInfo.min_version}
              onChangeText={t => setAppInfo(a => ({ ...a, min_version: t }))} placeholder="1.0.0" />
            <InputRow C={C} label="Phiên bản mới nhất" value={appInfo.latest_version}
              onChangeText={t => setAppInfo(a => ({ ...a, latest_version: t }))} placeholder="1.0.0" />
            <InputRow C={C} label="Link cập nhật" value={appInfo.update_url}
              onChangeText={t => setAppInfo(a => ({ ...a, update_url: t }))}
              placeholder="https://play.google.com/store/apps/details?id=..." />
            <SwitchRow C={C} label="Bắt buộc cập nhật" value={appInfo.force_update}
              onValueChange={v => setAppInfo(a => ({ ...a, force_update: v }))}
              description="User phải cập nhật mới dùng được app" />
            <SaveButton saving={saving === 'app_info'} C={C}
              onPress={() => saveSection('app_info', appInfo)} />
          </View>
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
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  topBarTitle: { fontSize: 17, fontWeight: '700', flex: 1, textAlign: 'center' },
  scroll: { padding: 16, gap: 2 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    borderRadius: 14, marginTop: 10, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  sectionIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', flex: 1 },
  sectionBody: {
    padding: 16, borderBottomLeftRadius: 14, borderBottomRightRadius: 14,
    marginTop: -2,
  },
  tierTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8, marginTop: 4 },
  inputRow: { marginBottom: 12 },
  inputLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: {
    height: 44, borderRadius: 10, paddingHorizontal: 14,
    fontSize: 15, borderWidth: 1,
  },
  previewPrice: { fontSize: 12, marginBottom: 8, fontStyle: 'italic' },
  divider: { height: 1, marginVertical: 12 },
  switchRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12,
  },
  switchLabel: { fontSize: 14, fontWeight: '600' },
  switchDesc: { fontSize: 11, marginTop: 2 },
  tierPicker: { marginBottom: 12 },
  tierBtns: { flexDirection: 'row', gap: 8, marginTop: 6 },
  tierBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10,
    backgroundColor: COLORS.SURFACE,
  },
  tierBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.TEXT_SECONDARY },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 12, marginTop: 16,
  },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
