import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../contexts/AlertContext';
import { createTeam, joinTeamByCode, checkPendingInvitations, acceptInvitation } from '../services/authService';

export default function TeamSetupScreen() {
  const { refreshProfile, profile } = useAuth();
  const { showAlert } = useAlert();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [invitations, setInvitations] = useState<any[]>([]);

  useEffect(() => {
    checkPendingInvitations().then(setInvitations);
  }, []);

  const handleCreate = async () => {
    if (!teamName.trim()) {
      showAlert({ title: 'Thiếu tên', message: 'Nhập tên đội nhóm của bạn.', type: 'warning' });
      return;
    }
    setLoading(true);
    try {
      await createTeam(teamName.trim());
      await refreshProfile();
    } catch (err: any) {
      showAlert({ title: 'Lỗi', message: err.message || 'Không thể tạo team.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) {
      showAlert({ title: 'Thiếu mã', message: 'Nhập mã mời từ quản lý của bạn.', type: 'warning' });
      return;
    }
    setLoading(true);
    try {
      await joinTeamByCode(inviteCode.trim());
      await refreshProfile();
    } catch (err: any) {
      showAlert({ title: 'Lỗi', message: err.message || 'Mã mời không hợp lệ.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvite = async (inv: any) => {
    setLoading(true);
    try {
      await acceptInvitation(inv.id, inv.team_id, inv.role);
      await refreshProfile();
    } catch (err: any) {
      showAlert({ title: 'Lỗi', message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <Ionicons name="people" size={64} color="#1A7F64" />
          <Text style={styles.welcome}>Chào {profile?.full_name || 'bạn'}!</Text>
          <Text style={styles.subtitle}>Nhập mã mời từ quản lý để tham gia team</Text>
        </View>

        {/* Lời mời qua email (nếu có) */}
        {invitations.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Lời mời tham gia</Text>
            {invitations.map(inv => (
              <View key={inv.id} style={styles.inviteRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inviteTeam}>{inv.teams?.name || 'Team'}</Text>
                  <Text style={styles.inviteRole}>Vai trò: {inv.role === 'manager' ? 'Quản lý' : 'Thành viên'}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.acceptBtn, { backgroundColor: '#1A7F64' }]}
                  onPress={() => handleAcceptInvite(inv)}
                >
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Tham gia</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Nhập mã mời */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tham gia team</Text>
          <Text style={styles.label}>Mã mời</Text>
          <TextInput
            style={[styles.input, { textAlign: 'center', fontSize: 20, letterSpacing: 4 }]}
            placeholder="abcd1234"
            placeholderTextColor={COLORS.TEXT_LIGHT}
            value={inviteCode}
            onChangeText={setInviteCode}
            autoCapitalize="none"
          />
          <Text style={styles.hint}>
            Hỏi quản lý của bạn để lấy mã mời team.
          </Text>
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: '#1A7F64' }]}
            onPress={handleJoin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Tham gia</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Tạo team (ẩn, dành cho quản lý) */}
        {!showCreateForm ? (
          <TouchableOpacity style={styles.createLink} onPress={() => setShowCreateForm(true)}>
            <Text style={styles.createLinkText}>Bạn là quản lý? Tạo team mới</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Tạo team mới</Text>
            <Text style={styles.label}>Tên team</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: Team Sales HCM"
              placeholderTextColor={COLORS.TEXT_LIGHT}
              value={teamName}
              onChangeText={setTeamName}
              autoFocus
            />
            <Text style={styles.hint}>
              Bạn sẽ là Admin của team. Sau khi tạo, bạn có thể mời thành viên bằng mã mời.
            </Text>
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: '#1A7F64' }]}
              onPress={handleCreate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Tạo team</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  scroll: { flexGrow: 1, padding: 24 },
  hero: { alignItems: 'center', marginVertical: 32 },
  welcome: { fontSize: 22, fontWeight: '800', color: COLORS.TEXT, marginTop: 16 },
  subtitle: { fontSize: 14, color: COLORS.TEXT_LIGHT, marginTop: 4, textAlign: 'center' },
  card: {
    backgroundColor: COLORS.CARD, borderRadius: 16, padding: 20, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: COLORS.TEXT, marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.TEXT_SECONDARY, marginBottom: 8 },
  input: {
    backgroundColor: COLORS.BACKGROUND, borderRadius: 12, padding: 14,
    fontSize: 15, color: COLORS.TEXT, borderWidth: 1, borderColor: COLORS.BORDER, marginBottom: 12,
  },
  hint: { fontSize: 12, color: COLORS.TEXT_LIGHT, lineHeight: 18, marginBottom: 16 },
  submitBtn: { borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  inviteRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.BORDER,
  },
  inviteTeam: { fontSize: 15, fontWeight: '600', color: COLORS.TEXT },
  inviteRole: { fontSize: 12, color: COLORS.TEXT_LIGHT, marginTop: 2 },
  acceptBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  createLink: { alignItems: 'center', paddingVertical: 16 },
  createLinkText: { fontSize: 13, color: COLORS.TEXT_LIGHT, textDecorationLine: 'underline' },
});
