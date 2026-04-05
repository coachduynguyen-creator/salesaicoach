import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors';
import { useTheme, THEME_OPTIONS } from '../contexts/ThemeContext';
import { loadSessions, Session } from '../services/storageService';

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
  const { theme, setThemeById } = useTheme();
  const C = { ...COLORS, PRIMARY: theme.colors.PRIMARY, PRIMARY_LIGHT: theme.colors.PRIMARY_LIGHT, PRIMARY_DARK: theme.colors.PRIMARY_DARK };

  const [sessions, setSessions] = useState<Session[]>([]);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [showNameModal, setShowNameModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadSessions().then(setSessions);
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
    Alert.alert(
      'Xóa tất cả dữ liệu',
      'Hành động này sẽ xóa toàn bộ lịch sử ghi âm, hội thoại AI Coach, và cài đặt. Không thể hoàn tác.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa tất cả',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            setSessions([]);
            setUserName('');
            setUserRole('');
            Alert.alert('Đã xóa', 'Tất cả dữ liệu đã được xóa. Khởi động lại app để áp dụng.');
          },
        },
      ],
    );
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
