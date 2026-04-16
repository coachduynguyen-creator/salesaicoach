import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal,
  RefreshControl, Share, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { useColors } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../contexts/AlertContext';
import {
  getTeamMembers, getTeamInvitations, removeTeamMember, cancelInvitation,
  getTeamStats, getMemberStats, getAIUsageSummary,
} from '../services/databaseService';
import { sendInvitation, changeUserRole, regenerateInviteCode } from '../services/authService';
import { TeamStats, MemberStats } from '../types/database';

export default function TeamManageScreen() {
  const navigation = useNavigation();
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const { profile, team, refreshProfile } = useAuth();
  const { showAlert } = useAlert();

  const [members, setMembers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [memberStats, setMemberStats] = useState<MemberStats[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'member' | 'manager'>('member');
  const [loading, setLoading] = useState(false);

  const isAdmin = profile?.role === 'admin';
  const isManager = profile?.role === 'admin' || profile?.role === 'manager';

  const loadData = useCallback(async () => {
    if (!team) return;
    const [m, inv, s, ms] = await Promise.all([
      getTeamMembers(team.id),
      isManager ? getTeamInvitations(team.id) : Promise.resolve([]),
      getTeamStats(team.id),
      getMemberStats(team.id),
    ]);
    setMembers(m);
    setInvitations(inv);
    setStats(s);
    setMemberStats(ms);
  }, [team, isManager]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !team) return;
    setLoading(true);
    try {
      await sendInvitation(team.id, inviteEmail.trim(), inviteRole);
      showAlert({ title: 'Đã mời', message: `Lời mời đã gửi tới ${inviteEmail}.`, type: 'success' });
      setInviteEmail('');
      setShowInviteModal(false);
      await loadData();
    } catch (err: any) {
      showAlert({ title: 'Lỗi', message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleShareCode = async () => {
    if (!team) return;
    await Share.share({
      message: `Tham gia team "${team.name}" trên Sales Coach App!\nMã mời: ${team.invite_code}`,
    });
  };

  const handleRemoveMember = (member: any) => {
    if (member.id === profile?.id) return;
    showAlert({
      title: 'Xóa thành viên',
      message: `Xóa ${member.full_name} khỏi team?`,
      type: 'warning',
      buttons: [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            await removeTeamMember(member.id);
            loadData();
          },
        },
      ],
    });
  };

  const handleChangeRole = async (memberId: string, newRole: string) => {
    try {
      await changeUserRole(memberId, newRole);
      await loadData();
      showAlert({ title: 'Cập nhật', message: 'Đã thay đổi vai trò.', type: 'success' });
    } catch (err: any) {
      showAlert({ title: 'Lỗi', message: err.message, type: 'error' });
    }
  };

  const getRoleLabel = (role: string) => {
    if (role === 'admin') return 'Admin';
    if (role === 'manager') return 'Quản lý';
    return 'Thành viên';
  };

  const getRoleColor = (role: string) => {
    if (role === 'admin') return '#E74C3C';
    if (role === 'manager') return '#E67E22';
    return '#3B82F6';
  };

  if (!team) return null;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.BACKGROUND }]} edges={['top']}>
      <View style={[styles.topBar, { backgroundColor: C.CARD, borderBottomColor: C.BORDER }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={C.TEXT} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: C.TEXT }]}>Quản lý Team</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Team Info */}
        <View style={[styles.card, { backgroundColor: C.CARD }]}>
          <Text style={styles.teamName}>{team.name}</Text>
          <View style={styles.codeRow}>
            <Text style={styles.codeLabel}>Mã mời:</Text>
            <Text style={styles.codeValue}>{team.invite_code}</Text>
            <TouchableOpacity onPress={handleShareCode} style={styles.shareBtn}>
              <Ionicons name="share-outline" size={18} color={C.PRIMARY} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        {stats && (
          <View style={[styles.statsStrip, { backgroundColor: C.PRIMARY }]}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.total_members}</Text>
              <Text style={styles.statLabel}>Thành viên</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.total_sessions}</Text>
              <Text style={styles.statLabel}>Buổi ghi</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.avg_score}</Text>
              <Text style={styles.statLabel}>Điểm TB</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.ai_calls_month}</Text>
              <Text style={styles.statLabel}>AI/tháng</Text>
            </View>
          </View>
        )}

        {/* Members */}
        <View style={[styles.card, { backgroundColor: C.CARD }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Thành viên ({members.length})</Text>
            {isManager && (
              <TouchableOpacity onPress={() => setShowInviteModal(true)}>
                <Ionicons name="person-add" size={22} color={C.PRIMARY} />
              </TouchableOpacity>
            )}
          </View>

          {memberStats.map(m => (
            <View key={m.user_id} style={styles.memberRow}>
              <View style={[styles.memberAvatar, { backgroundColor: getRoleColor(m.role) + '18' }]}>
                <Text style={[styles.memberInitial, { color: getRoleColor(m.role) }]}>
                  {m.full_name?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.memberName}>{m.full_name || 'Chưa có tên'}</Text>
                  <View style={[styles.roleBadge, { backgroundColor: getRoleColor(m.role) + '18' }]}>
                    <Text style={[styles.roleText, { color: getRoleColor(m.role) }]}>{getRoleLabel(m.role)}</Text>
                  </View>
                </View>
                <Text style={styles.memberMeta}>
                  {m.total_sessions} buổi | Điểm TB: {m.avg_score} | Won: {m.won} | AI: {m.ai_calls_month}/th
                </Text>
                <Text style={styles.memberMeta}>
                  Bài học: {m.lessons_done}/32 hoàn thành
                </Text>
              </View>
              {isAdmin && m.user_id !== profile?.id && (
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  <TouchableOpacity
                    onPress={() => handleChangeRole(m.user_id, m.role === 'member' ? 'manager' : 'member')}
                    style={{ padding: 6 }}
                  >
                    <Ionicons name="swap-horizontal" size={16} color={C.TEXT_LIGHT} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleRemoveMember({ id: m.user_id, full_name: m.full_name })}
                    style={{ padding: 6 }}
                  >
                    <Ionicons name="close-circle-outline" size={16} color={COLORS.DANGER} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Pending Invitations */}
        {isManager && invitations.length > 0 && (
          <View style={[styles.card, { backgroundColor: C.CARD }]}>
            <Text style={styles.sectionTitle}>Lời mời chờ ({invitations.length})</Text>
            {invitations.map(inv => (
              <View key={inv.id} style={styles.inviteRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inviteEmail}>{inv.invited_email}</Text>
                  <Text style={styles.inviteRole}>{getRoleLabel(inv.role)}</Text>
                </View>
                <TouchableOpacity onPress={() => cancelInvitation(inv.id).then(loadData)}>
                  <Ionicons name="close" size={18} color={COLORS.DANGER} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Invite Modal */}
      <Modal visible={showInviteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Mời thành viên</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Email người được mời"
              placeholderTextColor={C.TEXT_LIGHT}
              value={inviteEmail}
              onChangeText={setInviteEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus
            />
            <Text style={{ fontSize: 13, fontWeight: '600', color: C.TEXT_SECONDARY, marginBottom: 8 }}>Vai trò:</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              {(['member', 'manager'] as const).map(r => (
                <TouchableOpacity
                  key={r}
                  style={[styles.roleOption, inviteRole === r && { backgroundColor: C.PRIMARY, borderColor: C.PRIMARY }]}
                  onPress={() => setInviteRole(r)}
                >
                  <Text style={[styles.roleOptionText, inviteRole === r && { color: '#fff' }]}>
                    {r === 'manager' ? 'Quản lý' : 'Thành viên'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowInviteModal(false)}>
                <Text style={styles.cancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.submitBtn, { backgroundColor: C.PRIMARY }]} onPress={handleInvite} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Gửi lời mời</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const makeStyles = (C: any) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.BACKGROUND },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: C.CARD, paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: C.BORDER,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: C.SURFACE },
  topBarTitle: { fontSize: 15, fontWeight: '600', color: C.TEXT, flex: 1, textAlign: 'center' },
  scroll: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: C.CARD, borderRadius: 16, padding: 16, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  teamName: { fontSize: 20, fontWeight: '800', color: C.TEXT, marginBottom: 8 },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  codeLabel: { fontSize: 13, color: C.TEXT_LIGHT },
  codeValue: { fontSize: 18, fontWeight: '700', color: C.TEXT, letterSpacing: 2 },
  shareBtn: { padding: 6 },
  statsStrip: { borderRadius: 14, flexDirection: 'row', paddingVertical: 16, marginBottom: 14 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: C.TEXT },
  memberRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12,
    borderBottomWidth: 1, borderBottomColor: C.BORDER,
  },
  memberAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  memberInitial: { fontSize: 16, fontWeight: '700' },
  memberName: { fontSize: 14, fontWeight: '600', color: C.TEXT },
  memberMeta: { fontSize: 11, color: C.TEXT_LIGHT, marginTop: 2 },
  roleBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  roleText: { fontSize: 10, fontWeight: '700' },
  inviteRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.BORDER },
  inviteEmail: { fontSize: 14, color: C.TEXT },
  inviteRole: { fontSize: 11, color: C.TEXT_LIGHT, marginTop: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: C.CARD, borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: C.TEXT, marginBottom: 16 },
  modalInput: {
    backgroundColor: C.BACKGROUND, borderRadius: 10, padding: 14,
    fontSize: 15, color: C.TEXT, borderWidth: 1, borderColor: C.BORDER, marginBottom: 12,
  },
  roleOption: {
    flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center',
    borderWidth: 1, borderColor: C.BORDER,
  },
  roleOptionText: { fontSize: 14, fontWeight: '600', color: C.TEXT },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: C.BORDER, alignItems: 'center' },
  cancelText: { fontSize: 15, fontWeight: '600', color: C.TEXT_LIGHT },
  submitBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  submitText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
