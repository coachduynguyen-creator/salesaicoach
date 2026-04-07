import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { loadTeamMembers, addTeamMember, removeTeamMember, TeamMember, loadSessions } from '../services/storageService';
import { useColors } from '../contexts/ThemeContext';
import { COLORS } from '../constants/colors';
import { useAlert } from '../contexts/AlertContext';

export default function TeamDashboardScreen() {
  const navigation = useNavigation<any>();
  const C = useColors();
  const { showAlert } = useAlert();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [avgScore, setAvgScore] = useState(0);
  const [winRate, setWinRate] = useState(0);

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Sales');

  const loadData = useCallback(async () => {
    const [loadedMembers, sessions] = await Promise.all([
      loadTeamMembers(),
      loadSessions(),
    ]);
    setMembers(loadedMembers);

    if (sessions.length > 0) {
      const total = sessions.reduce((sum, s) => sum + s.score, 0);
      setAvgScore(Math.round((total / sessions.length) * 10) / 10);

      const wonCount = sessions.filter(s => s.outcome === 'won').length;
      const decidedCount = sessions.filter(s => s.outcome === 'won' || s.outcome === 'lost').length;
      setWinRate(decidedCount > 0 ? Math.round((wonCount / decidedCount) * 100) : 0);
    } else {
      setAvgScore(0);
      setWinRate(0);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleAddMember = () => {
    setNewName('');
    setNewRole('Sales');
    setShowAddModal(true);
  };

  const handleSaveMember = async () => {
    const name = newName.trim();
    if (!name) return;
    const role = newRole.trim() || 'Sales';
    await addTeamMember(name, role);
    setShowAddModal(false);
    loadData();
  };

  const handleDeleteMember = (member: TeamMember) => {
    showAlert({
      title: 'Xóa thành viên',
      message: `Bạn có chắc muốn xóa "${member.name}" khỏi team?`,
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

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  const renderMember = ({ item }: { item: TeamMember }) => (
    <TouchableOpacity
      style={[styles.memberRow, { backgroundColor: C.CARD }]}
      onLongPress={() => handleDeleteMember(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.memberAvatar, { backgroundColor: C.PRIMARY + '14' }]}>
        <Ionicons name="person" size={20} color={C.PRIMARY} />
      </View>
      <View style={styles.memberInfo}>
        <Text style={[styles.memberName, { color: C.TEXT }]}>{item.name}</Text>
        <Text style={[styles.memberMeta, { color: C.TEXT_LIGHT }]}>{item.role}  ·  Tham gia: {formatDate(item.joinedAt)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={C.TEXT_LIGHT} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: C.BACKGROUND }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: C.BACKGROUND }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: C.CARD }]}>
          <Ionicons name="arrow-back" size={22} color={C.TEXT} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerTitle, { color: C.TEXT }]}>Quản lý Team</Text>
          <Text style={[styles.headerSubtitle, { color: C.TEXT_LIGHT }]}>Theo dõi hiệu suất đội ngũ</Text>
        </View>
      </View>

      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        renderItem={renderMember}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Team Stats Overview */}
            <View style={[styles.statsStrip, { backgroundColor: C.PRIMARY }]}>
              <View style={styles.stripItem}>
                <Text style={styles.stripValue}>{members.length}</Text>
                <Text style={styles.stripLabel}>Tổng thành viên</Text>
              </View>
              <View style={styles.stripDivider} />
              <View style={styles.stripItem}>
                <Text style={styles.stripValue}>{avgScore}</Text>
                <Text style={styles.stripLabel}>Điểm TB team</Text>
              </View>
              <View style={styles.stripDivider} />
              <View style={styles.stripItem}>
                <Text style={styles.stripValue}>{winRate}%</Text>
                <Text style={styles.stripLabel}>Tỷ lệ chốt team</Text>
              </View>
            </View>

            {/* Add Member Button */}
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: C.PRIMARY }]}
              onPress={handleAddMember}
              activeOpacity={0.8}
            >
              <Ionicons name="person-add" size={18} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Thêm thành viên</Text>
            </TouchableOpacity>

            {/* Member List Header */}
            <View style={[styles.sectionCard, { backgroundColor: C.CARD }]}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="people-outline" size={18} color={C.PRIMARY} />
                <Text style={[styles.sectionTitle, { color: C.TEXT }]}>Danh sách thành viên</Text>
              </View>
              {members.length === 0 && (
                <Text style={[styles.emptyText, { color: C.TEXT_LIGHT }]}>Chưa có thành viên nào. Nhấn nút trên để thêm.</Text>
              )}
            </View>
          </>
        }
        ListFooterComponent={
          <View style={styles.noteBanner}>
            <Ionicons name="information-circle-outline" size={16} color={C.TEXT_LIGHT} />
            <Text style={[styles.noteText, { color: C.TEXT_LIGHT }]}>
              Nhấn giữ thành viên để xóa
            </Text>
          </View>
        }
      />

      {/* Add Member Modal — hoạt động trên cả iOS và Android */}
      <Modal visible={showAddModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: C.CARD }]}>
            <Text style={[styles.modalTitle, { color: C.TEXT }]}>Thêm thành viên</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: C.BACKGROUND, color: C.TEXT, borderColor: C.BORDER }]}
              placeholder="Tên thành viên"
              placeholderTextColor={C.TEXT_LIGHT}
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />
            <TextInput
              style={[styles.modalInput, { backgroundColor: C.BACKGROUND, color: C.TEXT, borderColor: C.BORDER }]}
              placeholder="Vai trò (VD: Sales, Leader, Manager)"
              placeholderTextColor={C.TEXT_LIGHT}
              value={newRole}
              onChangeText={setNewRole}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { borderColor: C.BORDER }]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={[styles.modalCancelText, { color: C.TEXT_LIGHT }]}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveBtn, { backgroundColor: C.PRIMARY }, !newName.trim() && { opacity: 0.5 }]}
                onPress={handleSaveMember}
                disabled={!newName.trim()}
              >
                <Text style={styles.modalSaveText}>Thêm</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.CARD,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: COLORS.TEXT },
  headerSubtitle: { fontSize: 13, color: COLORS.TEXT_LIGHT, marginTop: 2 },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  statsStrip: {
    borderRadius: 16,
    flexDirection: 'row',
    paddingVertical: 16,
    marginBottom: 16,
  },
  stripItem: { flex: 1, alignItems: 'center' },
  stripValue: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  stripLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 3 },
  stripDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },
  addButton: {
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  addButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  sectionCard: {
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.TEXT },
  emptyText: { fontSize: 13, color: COLORS.TEXT_LIGHT, marginTop: 8, lineHeight: 20 },
  memberRow: {
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 15, fontWeight: '600', color: COLORS.TEXT },
  memberMeta: { fontSize: 12, color: COLORS.TEXT_LIGHT, marginTop: 3 },
  noteBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
    marginTop: 8,
  },
  noteText: { fontSize: 12, color: COLORS.TEXT_LIGHT, fontStyle: 'italic' },
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
