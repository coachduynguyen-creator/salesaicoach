import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Image,
  ActionSheetIOS,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors';
import { useTheme, useColors, THEME_OPTIONS } from '../contexts/ThemeContext';
import { loadSessions, Session, loadCustomerStatuses, saveCustomerStatuses, CustomerStatus, DEFAULT_STATUSES } from '../services/storageService';
import { useAlert } from '../contexts/AlertContext';
import { useAuth } from '../contexts/AuthContext';
import { getSubscription, adminSetTier, PlanTier } from '../services/subscriptionService';
import { getTierLabel } from '../config/systemPrompts';
import { signOut, deleteAccount } from '../services/authService';
import { pickFromGallery, takePhoto, saveUserAvatar, loadUserAvatar, removeUserAvatar } from '../services/imageService';
import { shareReferral } from '../services/referralService';
import { enableDailyReminders, disableReminders, isRemindersEnabled } from '../services/notificationService';

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
  const { theme, setThemeById, darkMode, setDarkMode } = useTheme();
  const { profile: authProfile, team } = useAuth();
  const Cdyn = useColors();
  const C = { ...Cdyn, PRIMARY: theme.colors.PRIMARY, PRIMARY_LIGHT: theme.colors.PRIMARY_LIGHT, PRIMARY_DARK: theme.colors.PRIMARY_DARK };

  const [sessions, setSessions] = useState<Session[]>([]);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [showNameModal, setShowNameModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [remindersOn, setRemindersOn] = useState(false);
  const [themeExpanded, setThemeExpanded] = useState(false);
  const [statusExpanded, setStatusExpanded] = useState(false);
  const [currentTier, setCurrentTier] = useState<PlanTier>('free');
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
      loadUserAvatar().then(setAvatarUri);
      isRemindersEnabled().then(setRemindersOn);
      getSubscription().then(sub => setCurrentTier(sub.tier));
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

  const handlePickAvatar = async (mode: 'gallery' | 'camera') => {
    setShowAvatarModal(false);
    const uri = mode === 'gallery' ? await pickFromGallery() : await takePhoto();
    if (uri) {
      const saved = await saveUserAvatar(uri);
      setAvatarUri(saved);
    }
  };

  const handleRemoveAvatar = async () => {
    setShowAvatarModal(false);
    await removeUserAvatar();
    setAvatarUri(null);
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: C.BACKGROUND }]}>
      <ScrollView style={[styles.container, { backgroundColor: C.BACKGROUND }]} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: C.TEXT }]}>Cài Đặt</Text>
          <Text style={[styles.headerSubtitle, { color: C.TEXT_LIGHT }]}>Quản lý tài khoản</Text>
        </View>

        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: C.CARD }]}>
          <TouchableOpacity
            onPress={() => setShowAvatarModal(true)}
            activeOpacity={0.7}
          >
            <View style={[styles.avatarCircle, { backgroundColor: C.PRIMARY + '12' }]}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={36} color={C.PRIMARY} />
              )}
              <View style={[styles.cameraBadge, { backgroundColor: C.PRIMARY }]}>
                <Ionicons name="camera" size={12} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.profileInfo}
            onPress={() => {
              setEditName(userName);
              setEditRole(userRole);
              setShowNameModal(true);
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.profileName, { color: C.TEXT }]}>
              {userName || 'Nhấn để nhập tên'}
            </Text>
            <Text style={styles.profileRole}>
              {userRole || 'Nhấn để nhập vai trò'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            setEditName(userName);
            setEditRole(userRole);
            setShowNameModal(true);
          }}>
            <Ionicons name="create-outline" size={18} color={COLORS.TEXT_LIGHT} />
          </TouchableOpacity>
        </View>

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
        <View style={[styles.sectionCard, { backgroundColor: C.CARD }]}>
          <TouchableOpacity style={styles.sectionTitleRow} onPress={() => setThemeExpanded(!themeExpanded)} activeOpacity={0.7}>
            <Ionicons name="color-palette-outline" size={18} color={C.PRIMARY} />
            <Text style={[styles.sectionTitle, { color: C.TEXT, flex: 1 }]}>Giao diện</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: C.PRIMARY }} />
              <Text style={{ fontSize: 11, color: C.TEXT_LIGHT }}>{darkMode === 'dark' ? 'Tối' : darkMode === 'system' ? 'Auto' : 'Sáng'}</Text>
              <Ionicons name={themeExpanded ? 'chevron-up' : 'chevron-down'} size={14} color={C.TEXT_LIGHT} />
            </View>
          </TouchableOpacity>
          {themeExpanded && (
            <>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 12, marginBottom: 12 }}>
                {([['light', 'Sáng'], ['dark', 'Tối'], ['system', 'Hệ thống']] as const).map(([mode, label]) => (
                  <TouchableOpacity
                    key={mode}
                    style={[{
                      flex: 1, paddingVertical: 8, borderRadius: 12, alignItems: 'center',
                      borderWidth: 1, borderColor: darkMode === mode ? C.PRIMARY : COLORS.BORDER,
                      backgroundColor: darkMode === mode ? C.PRIMARY : 'transparent',
                    }]}
                    onPress={() => setDarkMode(mode)}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '600', color: darkMode === mode ? '#fff' : COLORS.TEXT_SECONDARY }}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.colorGrid}>
                {THEME_OPTIONS.map(opt => {
                  const isActive = theme.id === opt.id;
                  return (
                    <TouchableOpacity key={opt.id} style={styles.colorOption} onPress={() => setThemeById(opt.id)}>
                      <View style={[styles.colorCircle, { backgroundColor: opt.colors.PRIMARY }, isActive && styles.colorCircleActive]}>
                        {isActive && <Ionicons name="checkmark" size={16} color="#fff" />}
                      </View>
                      <Text style={[styles.colorLabel, isActive && { color: opt.colors.PRIMARY, fontWeight: '700' }]}>{opt.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}
        </View>

        {/* Business Profile */}
        <View style={[styles.sectionCard, { backgroundColor: C.CARD }]}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="briefcase-outline" size={18} color={C.PRIMARY} />
            <Text style={[styles.sectionTitle, { color: C.TEXT }]}>Thông tin doanh nghiệp</Text>
          </View>
          <Text style={styles.sectionDesc}>
            Nhập thông tin công ty, sản phẩm, khách hàng để AI Coach cá nhân hóa
          </Text>
          <TouchableOpacity style={[styles.saveButton, { backgroundColor: C.PRIMARY }]} onPress={() => navigation.navigate('BusinessProfile')}>
            <Ionicons name="create-outline" size={18} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Cập nhật thông tin</Text>
          </TouchableOpacity>
        </View>

        {/* Referral */}
        <TouchableOpacity
          style={[styles.sectionCard, { backgroundColor: C.CARD, borderWidth: 1, borderColor: '#10B98130' }]}
          onPress={() => shareReferral(userName || 'Bạn', team?.invite_code)}
          activeOpacity={0.7}
        >
          <View style={[styles.sectionTitleRow, { marginBottom: 0 }]}>
            <Ionicons name="gift" size={18} color="#10B981" />
            <Text style={[styles.sectionTitle, { color: '#10B981' }]}>Mời bạn bè dùng app</Text>
            <Ionicons name="share-outline" size={16} color="#10B981" style={{ marginLeft: 'auto' }} />
          </View>
        </TouchableOpacity>

        {/* Upgrade */}
        <TouchableOpacity
          style={[styles.sectionCard, { backgroundColor: C.CARD, borderWidth: 1, borderColor: '#7C3AED30' }]}
          onPress={() => navigation.navigate('Paywall')}
          activeOpacity={0.7}
        >
          <View style={[styles.sectionTitleRow, { marginBottom: 0 }]}>
            <Ionicons name="diamond" size={18} color="#7C3AED" />
            <Text style={[styles.sectionTitle, { color: '#7C3AED' }]}>Nâng cấp Pro</Text>
            <Ionicons name="chevron-forward" size={16} color="#7C3AED" style={{ marginLeft: 'auto' }} />
          </View>
        </TouchableOpacity>

        {/* Admin: Switch AI Tier */}
        {authProfile?.role === 'admin' && (
          <View style={[styles.sectionCard, { backgroundColor: C.CARD }]}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="flask-outline" size={18} color="#E67E22" />
              <Text style={[styles.sectionTitle, { color: C.TEXT }]}>AI Tier (Admin)</Text>
            </View>
            <Text style={[styles.sectionDesc, { color: C.TEXT_LIGHT }]}>Chuyển tier để test AI. Hiện tại: {getTierLabel(currentTier === 'team' ? 'pro' : currentTier === 'bds_pro' ? 'bds_pro' : currentTier as any)}</Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {([['free', 'Free'], ['pro', 'Pro'], ['bds_pro', 'BĐS Pro']] as const).map(([t, label]) => (
                <TouchableOpacity
                  key={t}
                  style={[{
                    flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
                    borderWidth: 1, borderColor: currentTier === t ? C.PRIMARY : COLORS.BORDER,
                    backgroundColor: currentTier === t ? C.PRIMARY : 'transparent',
                  }]}
                  onPress={async () => {
                    await adminSetTier(t);
                    setCurrentTier(t);
                    showAlert({ title: 'Đã chuyển', message: `AI tier: ${label}. Tất cả AI call sẽ dùng prompt ${label}.`, type: 'success' });
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '700', color: currentTier === t ? '#fff' : C.TEXT_SECONDARY }}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Admin Dashboard - chỉ hiện cho admin/manager */}
        {(authProfile?.role === 'admin' || authProfile?.role === 'manager') && (
          <View style={[styles.sectionCard, { backgroundColor: C.CARD }]}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="analytics-outline" size={18} color={C.PRIMARY} />
              <Text style={[styles.sectionTitle, { color: C.TEXT }]}>Admin Dashboard</Text>
            </View>
            <Text style={styles.sectionDesc}>
              Theo dõi hiệu suất team, AI usage, tiến độ đào tạo, bảng xếp hạng
            </Text>
            <TouchableOpacity style={[styles.saveButton, { backgroundColor: C.PRIMARY }]} onPress={() => navigation.navigate('AdminDashboard')}>
              <Ionicons name="bar-chart" size={18} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Mở Dashboard</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Team Management */}
        <View style={[styles.sectionCard, { backgroundColor: C.CARD }]}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="people-outline" size={18} color={C.PRIMARY} />
            <Text style={[styles.sectionTitle, { color: C.TEXT }]}>Quản lý Team</Text>
          </View>
          <Text style={styles.sectionDesc}>
            {team ? `Team: ${team.name} | Mã mời: ${team.invite_code}` : 'Chưa tham gia team'}
          </Text>
          <TouchableOpacity style={[styles.saveButton, { backgroundColor: C.PRIMARY }]} onPress={() => navigation.navigate('TeamManage')}>
            <Ionicons name="people" size={18} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Quản lý Team</Text>
          </TouchableOpacity>
        </View>

        {/* Status Management */}
        <View style={[styles.sectionCard, { backgroundColor: C.CARD }]}>
          <TouchableOpacity style={styles.sectionTitleRow} onPress={() => setStatusExpanded(!statusExpanded)} activeOpacity={0.7}>
            <Ionicons name="flag-outline" size={18} color={C.PRIMARY} />
            <Text style={[styles.sectionTitle, { color: C.TEXT, flex: 1 }]}>Trạng thái khách hàng</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 11, color: C.TEXT_LIGHT }}>{statuses.length} trạng thái</Text>
              <Ionicons name={statusExpanded ? 'chevron-up' : 'chevron-down'} size={14} color={C.TEXT_LIGHT} />
            </View>
          </TouchableOpacity>

          {statusExpanded && (
            <>
              {statuses.sort((a, b) => a.order - b.order).map((s, idx) => (
                <View key={s.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: idx < statuses.length - 1 ? 1 : 0, borderBottomColor: C.BORDER }}>
                  <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: s.color, marginRight: 10 }} />
                  <Text style={{ flex: 1, fontSize: 14, color: C.TEXT, fontWeight: '500' }}>{s.label}</Text>
                  <TouchableOpacity onPress={() => {
                    setEditingStatusId(s.id);
                    setStatusLabel(s.label);
                    setStatusColor(s.color);
                    setShowStatusManager(true);
                  }} style={{ padding: 6 }}>
                    <Ionicons name="create-outline" size={16} color={C.TEXT_LIGHT} />
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
                <Text style={{ fontSize: 12, color: C.TEXT_LIGHT }}>Khôi phục mặc định</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Notification */}
        <View style={[styles.sectionCard, { backgroundColor: C.CARD }]}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="notifications-outline" size={18} color={C.PRIMARY} />
            <Text style={[styles.sectionTitle, { color: C.TEXT }]}>Nhắc nhở</Text>
          </View>
          <Text style={styles.sectionDesc}>
            Nhận thông báo nhắc học bài (8h sáng) và ghi âm buổi tư vấn (5h chiều)
          </Text>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: remindersOn ? COLORS.DANGER : C.PRIMARY }]}
            onPress={async () => {
              if (remindersOn) {
                await disableReminders();
                setRemindersOn(false);
                showAlert({ title: 'Đã tắt', message: 'Đã tắt nhắc nhở hàng ngày.', type: 'success' });
              } else {
                await enableDailyReminders();
                setRemindersOn(true);
                showAlert({ title: 'Đã bật', message: 'Bạn sẽ nhận nhắc nhở lúc 8h sáng và 5h chiều.', type: 'success' });
              }
            }}
          >
            <Ionicons name={remindersOn ? 'notifications-off' : 'notifications'} size={18} color="#fff" />
            <Text style={styles.saveButtonText}>{remindersOn ? 'Tắt nhắc nhở' : 'Bật nhắc nhở'}</Text>
          </TouchableOpacity>
        </View>

        {/* App Settings — chỉ giữ tính năng hoạt động */}
        <View style={[styles.sectionCard, { backgroundColor: C.CARD }]}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="options-outline" size={18} color={C.PRIMARY} />
            <Text style={[styles.sectionTitle, { color: C.TEXT }]}>Ứng dụng</Text>
          </View>

          <TouchableOpacity style={styles.settingsRow} onPress={handleDeleteAllData}>
            <View style={styles.settingsRowLeft}>
              <Ionicons name="trash-outline" size={18} color={COLORS.DANGER} />
              <Text style={[styles.settingsRowText, { color: COLORS.DANGER }]}>Xóa tất cả dữ liệu</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.TEXT_LIGHT} />
          </TouchableOpacity>
        </View>

        {/* User Guide */}
        <TouchableOpacity
          style={[styles.sectionCard, { backgroundColor: C.CARD }]}
          onPress={() => navigation.navigate('UserGuide')}
          activeOpacity={0.7}
        >
          <View style={[styles.sectionTitleRow, { marginBottom: 0 }]}>
            <Ionicons name="book-outline" size={18} color={C.PRIMARY} />
            <Text style={[styles.sectionTitle, { color: C.TEXT, flex: 1 }]}>Hướng dẫn sử dụng</Text>
            <Ionicons name="chevron-forward" size={16} color={C.TEXT_LIGHT} />
          </View>
        </TouchableOpacity>

        {/* About */}
        <View style={[styles.sectionCard, { backgroundColor: C.CARD }]}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="information-circle-outline" size={18} color={C.PRIMARY} />
            <Text style={[styles.sectionTitle, { color: C.TEXT }]}>Giới thiệu</Text>
          </View>
          <Text style={styles.sectionDesc}>
            Về ứng dụng, tác giả Coach Duy Nguyễn, bản quyền và điều khoản pháp lý
          </Text>
          <TouchableOpacity style={[styles.saveButton, { backgroundColor: C.PRIMARY }]} onPress={() => navigation.navigate('About')}>
            <Ionicons name="book-outline" size={18} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Xem giới thiệu</Text>
          </TouchableOpacity>
        </View>

        {/* Account Info & Logout */}
        <View style={[styles.sectionCard, { backgroundColor: C.CARD }]}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="log-out-outline" size={18} color={COLORS.DANGER} />
            <Text style={[styles.sectionTitle, { color: C.TEXT }]}>Tài khoản</Text>
          </View>
          {authProfile && (
            <Text style={[styles.sectionDesc, { marginBottom: 8 }]}>
              {authProfile.email} | Vai trò: {authProfile.role === 'admin' ? 'Admin' : authProfile.role === 'manager' ? 'Quản lý' : 'Thành viên'}
            </Text>
          )}
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: COLORS.DANGER }]}
            onPress={() => {
              showAlert({
                title: 'Đăng xuất',
                message: 'Bạn có chắc muốn đăng xuất?',
                type: 'warning',
                buttons: [
                  { text: 'Hủy', style: 'cancel' },
                  { text: 'Đăng xuất', style: 'destructive', onPress: () => signOut() },
                ],
              });
            }}
          >
            <Ionicons name="log-out-outline" size={18} color="#fff" />
            <Text style={styles.saveButtonText}>Đăng xuất</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ marginTop: 12, alignItems: 'center', paddingVertical: 10 }}
            onPress={() => {
              showAlert({
                title: 'Xóa tài khoản',
                message: 'Hành động này sẽ xóa VĨNH VIỄN tài khoản và toàn bộ dữ liệu của bạn (sessions, khách hàng, hội thoại AI). Không thể hoàn tác.',
                type: 'warning',
                buttons: [
                  { text: 'Hủy', style: 'cancel' },
                  {
                    text: 'Xóa vĩnh viễn',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await AsyncStorage.clear();
                        await deleteAccount();
                      } catch (err: any) {
                        showAlert({ title: 'Lỗi', message: err.message || 'Không thể xóa tài khoản.', type: 'error' });
                      }
                    },
                  },
                ],
              });
            }}
          >
            <Text style={{ fontSize: 13, color: COLORS.DANGER, textDecorationLine: 'underline' }}>
              Xóa tài khoản vĩnh viễn
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Ionicons name="information-circle-outline" size={14} color={COLORS.TEXT_LIGHT} />
          <Text style={styles.versionText}>Sales Coach v1.0.0 | THE TRUSTED ADVISOR</Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Status Edit Modal */}
      <Modal visible={showStatusManager} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
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
        </KeyboardAvoidingView>
      </Modal>

      {/* Avatar Picker Modal */}
      <Modal visible={showAvatarModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowAvatarModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ảnh đại diện</Text>
            <TouchableOpacity style={styles.avatarOption} onPress={() => handlePickAvatar('gallery')}>
              <Ionicons name="images-outline" size={22} color={C.PRIMARY} />
              <Text style={styles.avatarOptionText}>Chọn từ thư viện</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatarOption} onPress={() => handlePickAvatar('camera')}>
              <Ionicons name="camera-outline" size={22} color={C.PRIMARY} />
              <Text style={styles.avatarOptionText}>Chụp ảnh mới</Text>
            </TouchableOpacity>
            {avatarUri && (
              <TouchableOpacity style={styles.avatarOption} onPress={handleRemoveAvatar}>
                <Ionicons name="trash-outline" size={22} color={COLORS.DANGER} />
                <Text style={[styles.avatarOptionText, { color: COLORS.DANGER }]}>Xóa ảnh</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.modalCancelBtn, { marginTop: 12 }]} onPress={() => setShowAvatarModal(false)}>
              <Text style={styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Edit Name Modal */}
      <Modal visible={showNameModal} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
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
        </KeyboardAvoidingView>
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
    backgroundColor: COLORS.CARD, borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  avatarCircle: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
    overflow: 'hidden',
  },
  avatarImage: { width: 64, height: 64, borderRadius: 32 },
  cameraBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.CARD,
  },
  avatarOption: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.BORDER,
  },
  avatarOptionText: { fontSize: 15, fontWeight: '500', color: COLORS.TEXT },
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
    backgroundColor: COLORS.CARD, borderRadius: 16, padding: 16, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
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
    backgroundColor: COLORS.BACKGROUND, borderRadius: 12, padding: 14,
    fontSize: 15, color: COLORS.TEXT, marginBottom: 12,
    borderWidth: 1, borderColor: COLORS.BORDER,
  },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalCancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.BORDER, alignItems: 'center',
  },
  modalCancelText: { fontSize: 15, fontWeight: '600', color: COLORS.TEXT_LIGHT },
  modalSaveBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center',
  },
  modalSaveText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});
