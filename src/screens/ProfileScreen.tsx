import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors';
import { useTheme, THEME_OPTIONS } from '../contexts/ThemeContext';
import { loadSessions, Session, loadCustomerStatuses, saveCustomerStatuses, CustomerStatus, DEFAULT_STATUSES } from '../services/storageService';
import { useAlert } from '../contexts/AlertContext';

const USER_NAME_KEY = '@salescoach_user_name';
const USER_ROLE_KEY = '@salescoach_user_role';

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

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { showAlert } = useAlert();
  const { theme, setThemeById } = useTheme();
  const C = { ...COLORS, PRIMARY: theme.colors.PRIMARY, PRIMARY_LIGHT: theme.colors.PRIMARY_LIGHT, PRIMARY_DARK: theme.colors.PRIMARY_DARK };

  const [sessions, setSessions] = useState<Session[]>([]);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [showNameModal, setShowNameModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  // Status management
  const [statuses, setStatuses] = useState<CustomerStatus[]>([]);
  const [showStatusManager, setShowStatusManager] = useState(false);
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const [statusLabel, setStatusLabel] = useState('');
  const [statusColor, setStatusColor] = useState('#3B82F6');

  useFocusEffect(
    useCallback(() => {
      loadSessions().then(setSessions);
      loadCustomerStatuses().then(setStatuses);
      AsyncStorage.getItem(USER_NAME_KEY).then(v => setUserName(v || ''));
      AsyncStorage.getItem(USER_ROLE_KEY).then(v => setUserRole(v || ''));
    }, [])
  );

  const handleSaveProfile = async () => {
    const name = editName.trim();
    const role = editRole.trim();
    if (name) await AsyncStorage.setItem(USER_NAME_KEY, name);
    if (role) await AsyncStorage.setItem(USER_ROLE_KEY, role);
    setUserName(name);
    setUserRole(role);
    setShowNameModal(false);
  };

  const handleDeleteAllData = () => {
    showAlert({
      title: 'Xóa tất cả dữ liệu',
      message: 'Hành động này sẽ xóa toàn bộ lịch sử ghi âm, hội thoại AI Coach, và cài đặt. Không thể hoàn tác.',
      type: 'warning',
      buttons: [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa tất cả',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            setSessions([]);
            setUserName('');
            setUserRole('');
            showAlert({ title: 'Đã xóa', message: 'Tất cả dữ liệu đã được xóa. Khởi động lại app để áp dụng.', type: 'success' });
          },
        },
      ],
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cài Đặt</Text>
          <Text style={styles.headerSubtitle}>Quản lý tài khoản</Text>
        </View>

        {/* Profile Card */}
        <TouchableOpacity
          style={styles.profileCard}
          onPress={() => {
            setEditName(userName);
            setEditRole(userRole);
            setShowNameModal(true);
          }}
          activeOpacity={0.7}
        >
          <View style={[styles.avatarCircle, { backgroundColor: C.PRIMARY + '12' }]}>
            <Ionicons name="person" size={36} color={C.PRIMARY} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {userName || 'Nhấn để nhập tên'}
            </Text>
            <Text style={styles.profileRole}>
              {userRole || 'Nhấn để nhập vai trò'}
            </Text>
          </View>
          <Ionicons name="create-outline" size={18} color={COLORS.TEXT_LIGHT} />
        </TouchableOpacity>

        {/* Stats Strip — dữ liệu thật */}
        <View style={[styles.statsStrip, { backgroundColor: C.PRIMARY }]}>
          <View style={styles.stripItem}>
            <Text style={styles.stripValue}>{sessions.length}</Text>
            <Text style={styles.stripLabel}>Buổi ghi</Text>
          </View>
          <View style={styles.stripDivider} />
          <View style={styles.stripItem}>
            <Text style={styles.stripValue}>{getAvgScore(sessions)}</Text>
            <Text style={styles.stripLabel}>Điểm TB</Text>
          </View>
          <View style={styles.stripDivider} />
          <View style={styles.stripItem}>
            <Text style={styles.stripValue}>{getThisWeekCount(sessions)}</Text>
            <Text style={styles.stripLabel}>Tuần này</Text>
          </View>
        </View>

        {/* Theme Color Picker */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="color-palette-outline" size={18} color={C.PRIMARY} />
            <Text style={styles.sectionTitle}>Màu giao diện</Text>
          </View>
          <Text style={styles.sectionDesc}>
            Chọn màu chủ đạo cho ứng dụng
          </Text>
          <View style={styles.colorGrid}>
            {THEME_OPTIONS.map(opt => {
              const isActive = theme.id === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={styles.colorOption}
                  onPress={() => setThemeById(opt.id)}
                >
                  <View style={[
                    styles.colorCircle,
                    { backgroundColor: opt.colors.PRIMARY },
                    isActive && styles.colorCircleActive,
                  ]}>
                    {isActive && (
                      <Ionicons name="checkmark" size={18} color="#fff" />
                    )}
                  </View>
                  <Text style={[
                    styles.colorLabel,
                    isActive && { color: opt.colors.PRIMARY, fontWeight: '700' },
                  ]}>
                    {opt.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Business Profile */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="briefcase-outline" size={18} color={C.PRIMARY} />
            <Text style={styles.sectionTitle}>Thông tin doanh nghiệp</Text>
          </View>
          <Text style={styles.sectionDesc}>
            Nhập thông tin công ty, sản phẩm, khách hàng để AI Coach cá nhân hóa
          </Text>
          <TouchableOpacity style={[styles.saveButton, { backgroundColor: C.PRIMARY }]} onPress={() => navigation.navigate('BusinessProfile')}>
            <Ionicons name="create-outline" size={18} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Cập nhật thông tin</Text>
          </TouchableOpacity>
        </View>

        {/* Team Management */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="people-outline" size={18} color={C.PRIMARY} />
            <Text style={styles.sectionTitle}>Quản lý Team</Text>
          </View>
          <Text style={styles.sectionDesc}>
            Theo dõi hiệu suất và quản lý đội ngũ sales của bạn
          </Text>
          <TouchableOpacity style={[styles.saveButton, { backgroundColor: C.PRIMARY }]} onPress={() => navigation.navigate('TeamDashboard')}>
            <Ionicons name="people" size={18} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Mở Dashboard Team</Text>
          </TouchableOpacity>
        </View>

        {/* Status Management */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="flag-outline" size={18} color={C.PRIMARY} />
            <Text style={styles.sectionTitle}>Trạng thái khách hàng</Text>
          </View>
          <Text style={styles.sectionDesc}>
            Quản lý các trạng thái trong CRM. Kéo để sắp xếp thứ tự.
          </Text>

          {statuses.sort((a, b) => a.order - b.order).map((s, idx) => (
            <View key={s.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: idx < statuses.length - 1 ? 1 : 0, borderBottomColor: COLORS.BORDER }}>
              <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: s.color, marginRight: 10 }} />
              <Text style={{ flex: 1, fontSize: 14, color: COLORS.TEXT, fontWeight: '500' }}>{s.label}</Text>
              <TouchableOpacity onPress={() => {
                setEditingStatusId(s.id);
                setStatusLabel(s.label);
                setStatusColor(s.color);
                setShowStatusManager(true);
              }} style={{ padding: 6 }}>
                <Ionicons name="create-outline" size={16} color={COLORS.TEXT_LIGHT} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                const updated = statuses.filter(x => x.id !== s.id);
                setStatuses(updated);
                saveCustomerStatuses(updated);
              }} style={{ padding: 6 }}>
                <Ionicons name="trash-outline" size={16} color={COLORS.DANGER} />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: C.PRIMARY, marginTop: 12 }]}
            onPress={() => {
              setEditingStatusId(null);
              setStatusLabel('');
              setStatusColor('#3B82F6');
              setShowStatusManager(true);
            }}
          >
            <Ionicons name="add-circle-outline" size={18} color="#fff" />
            <Text style={styles.saveButtonText}>Thêm trạng thái</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ marginTop: 8, alignItems: 'center', paddingVertical: 8 }}
            onPress={() => {
              setStatuses(DEFAULT_STATUSES);
              saveCustomerStatuses(DEFAULT_STATUSES);
            }}
          >
            <Text style={{ fontSize: 12, color: COLORS.TEXT_LIGHT }}>Khôi phục mặc định</Text>
          </TouchableOpacity>
        </View>

        {/* App Settings — chỉ giữ tính năng hoạt động */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="options-outline" size={18} color={C.PRIMARY} />
            <Text style={styles.sectionTitle}>Ứng dụng</Text>
          </View>

          <TouchableOpacity style={styles.settingsRow} onPress={handleDeleteAllData}>
            <View style={styles.settingsRowLeft}>
              <Ionicons name="trash-outline" size={18} color={COLORS.DANGER} />
              <Text style={[styles.settingsRowText, { color: COLORS.DANGER }]}>Xóa tất cả dữ liệu</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.TEXT_LIGHT} />
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Ionicons name="information-circle-outline" size={14} color={COLORS.TEXT_LIGHT} />
          <Text style={styles.versionText}>Sales Coach App v1.0.0</Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Status Edit Modal */}
      <Modal visible={showStatusManager} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingStatusId ? 'Sửa trạng thái' : 'Thêm trạng thái'}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Tên trạng thái (VD: Đang demo, Chờ phê duyệt...)"
              placeholderTextColor={COLORS.TEXT_LIGHT}
              value={statusLabel}
              onChangeText={setStatusLabel}
              autoFocus
            />
            <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.TEXT_SECONDARY, marginBottom: 8 }}>Màu sắc:</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
              {['#9F7AEA', '#3B82F6', '#10B981', '#F59E0B', '#F97316', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280', '#059669'].map(color => (
                <TouchableOpacity key={color} onPress={() => setStatusColor(color)}
                  style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: color, alignItems: 'center', justifyContent: 'center', borderWidth: statusColor === color ? 3 : 0, borderColor: '#fff', shadowColor: statusColor === color ? color : 'transparent', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4, elevation: statusColor === color ? 4 : 0 }}>
                  {statusColor === color && <Ionicons name="checkmark" size={18} color="#fff" />}
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowStatusManager(false)}>
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveBtn, { backgroundColor: C.PRIMARY }]}
                onPress={() => {
                  if (!statusLabel.trim()) return;
                  let updated: CustomerStatus[];
                  if (editingStatusId) {
                    updated = statuses.map(s => s.id === editingStatusId ? { ...s, label: statusLabel.trim(), color: statusColor } : s);
                  } else {
                    const newStatus: CustomerStatus = {
                      id: Date.now().toString(),
                      label: statusLabel.trim(),
                      color: statusColor,
                      order: statuses.length,
                    };
                    updated = [...statuses, newStatus];
                  }
                  setStatuses(updated);
                  saveCustomerStatuses(updated);
                  setShowStatusManager(false);
                }}
              >
                <Text style={styles.modalSaveText}>{editingStatusId ? 'Lưu' : 'Thêm'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Name Modal */}
      <Modal visible={showNameModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thông tin cá nhân</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Tên của bạn"
              placeholderTextColor={COLORS.TEXT_LIGHT}
              value={editName}
              onChangeText={setEditName}
              autoFocus
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Vai trò (VD: Sales Manager, Team Lead)"
              placeholderTextColor={COLORS.TEXT_LIGHT}
              value={editRole}
              onChangeText={setEditRole}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowNameModal(false)}
              >
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveBtn, { backgroundColor: C.PRIMARY }]}
                onPress={handleSaveProfile}
              >
                <Text style={styles.modalSaveText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { paddingTop: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: COLORS.TEXT },
  headerSubtitle: { fontSize: 13, color: COLORS.TEXT_LIGHT, marginTop: 2 },
  profileCard: {
    backgroundColor: COLORS.CARD, borderRadius: 14, padding: 18,
    flexDirection: 'row', alignItems: 'center', marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  avatarCircle: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '700', color: COLORS.TEXT },
  profileRole: { fontSize: 13, color: COLORS.TEXT_LIGHT, marginTop: 3 },
  statsStrip: {
    borderRadius: 16, flexDirection: 'row', paddingVertical: 16, marginBottom: 16,
  },
  stripItem: { flex: 1, alignItems: 'center' },
  stripValue: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  stripLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 3 },
  stripDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },
  sectionCard: {
    backgroundColor: COLORS.CARD, borderRadius: 14, padding: 16, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.TEXT },
  sectionDesc: { fontSize: 12, color: COLORS.TEXT_LIGHT, marginBottom: 16, lineHeight: 18 },
  colorGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'flex-start',
  },
  colorOption: { alignItems: 'center', width: 64 },
  colorCircle: {
    width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
  },
  colorCircleActive: {
    borderWidth: 3, borderColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 4, elevation: 5,
  },
  colorLabel: { fontSize: 11, color: COLORS.TEXT_SECONDARY, fontWeight: '500', textAlign: 'center' },
  saveButton: {
    borderRadius: 12, paddingVertical: 14, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4,
  },
  saveButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  settingsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12,
  },
  settingsRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  settingsRowText: { fontSize: 14, color: COLORS.TEXT, fontWeight: '500' },
  settingsRowRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  settingsRowValue: { fontSize: 13, color: COLORS.TEXT_LIGHT },
  rowDivider: { height: 1, backgroundColor: COLORS.BORDER },
  versionContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 4,
  },
  versionText: { fontSize: 12, color: COLORS.TEXT_LIGHT },
  // Modal styles
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modalContent: {
    backgroundColor: COLORS.CARD, borderRadius: 16, padding: 24, width: '100%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.TEXT, marginBottom: 16 },
  modalInput: {
    backgroundColor: COLORS.BACKGROUND, borderRadius: 10, padding: 14,
    fontSize: 15, color: COLORS.TEXT, marginBottom: 12,
    borderWidth: 1, borderColor: COLORS.BORDER,
  },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalCancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 10,
    borderWidth: 1, borderColor: COLORS.BORDER, alignItems: 'center',
  },
  modalCancelText: { fontSize: 15, fontWeight: '600', color: COLORS.TEXT_LIGHT },
  modalSaveBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center',
  },
  modalSaveText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});
