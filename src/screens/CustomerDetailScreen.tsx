import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { useColors } from '../contexts/ThemeContext';
import {
  loadCustomers, updateCustomer, loadSessions, CustomerProfile, Session,
} from '../services/storageService';

type RouteParams = { CustomerDetail: { customerId: string } };

function InfoRow({ label, value, icon }: { label: string; value: string; icon: string }) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon as any} size={16} color={COLORS.TEXT_LIGHT} />
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function CustomerDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'CustomerDetail'>>();
  const C = useColors();
  const { customerId } = route.params;

  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [editing, setEditing] = useState(false);
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadCustomers().then(all => {
        const found = all.find(c => c.id === customerId);
        if (found) {
          setCustomer(found);
          setEditPhone(found.phone);
          setEditEmail(found.email);
          // Load linked sessions
          if (found.sessionIds?.length) {
            loadSessions().then(allSessions => {
              setSessions(allSessions.filter(s => found.sessionIds.includes(s.id)));
            });
          }
        }
      });
    }, [customerId])
  );

  if (!customer) return null;

  const handleSaveContact = async () => {
    await updateCustomer(customer.id, { phone: editPhone.trim(), email: editEmail.trim() });
    setCustomer(prev => prev ? { ...prev, phone: editPhone.trim(), email: editEmail.trim() } : prev);
    setEditing(false);
  };

  const handleShare = () => {
    const lines = [
      `👤 ${customer.name}${customer.company ? ` — ${customer.company}` : ''}`,
      customer.phone ? `📞 ${customer.phone}` : '',
      customer.email ? `📧 ${customer.email}` : '',
      '',
      customer.stage ? `📊 Giai đoạn: ${customer.stage}` : '',
      customer.needs ? `🎯 Nhu cầu: ${customer.needs}` : '',
      customer.budget ? `💰 Ngân sách: ${customer.budget}` : '',
      customer.concerns ? `⚠️ Lo ngại: ${customer.concerns}` : '',
      customer.decisionFactors ? `🔑 Yếu tố QĐ: ${customer.decisionFactors}` : '',
      customer.personality ? `🧠 Tính cách: ${customer.personality}` : '',
      customer.nextStep ? `➡️ Bước tiếp: ${customer.nextStep}` : '',
    ].filter(Boolean);

    if (customer.notes?.length) {
      lines.push('', '📝 GHI CHÚ');
      customer.notes.forEach(n => lines.push(`[${n.date}] ${n.content}`));
    }
    lines.push('', '— Sales Coach CRM');
    Share.share({ message: lines.join('\n') });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.TEXT} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>{customer.name}</Text>
        <TouchableOpacity onPress={handleShare} style={styles.backBtn}>
          <Ionicons name="share-outline" size={20} color={COLORS.TEXT} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={[styles.avatar, { backgroundColor: C.PRIMARY + '14' }]}>
            <Text style={[styles.avatarText, { color: C.PRIMARY }]}>
              {customer.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.heroName}>{customer.name}</Text>
          {customer.company ? <Text style={styles.heroCompany}>{customer.company}</Text> : null}
          {customer.stage ? (
            <View style={[styles.stageBadge, { backgroundColor: C.PRIMARY + '15' }]}>
              <Text style={[styles.stageText, { color: C.PRIMARY }]}>{customer.stage}</Text>
            </View>
          ) : null}
        </View>

        {/* Contact Info */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Liên hệ</Text>
            <TouchableOpacity onPress={() => editing ? handleSaveContact() : setEditing(true)}>
              <Text style={[styles.editBtn, { color: C.PRIMARY }]}>{editing ? 'Lưu' : 'Sửa'}</Text>
            </TouchableOpacity>
          </View>
          {editing ? (
            <>
              <TextInput style={styles.editInput} placeholder="Số điện thoại" value={editPhone} onChangeText={setEditPhone} keyboardType="phone-pad" />
              <TextInput style={styles.editInput} placeholder="Email" value={editEmail} onChangeText={setEditEmail} keyboardType="email-address" />
            </>
          ) : (
            <>
              <InfoRow label="Điện thoại" value={customer.phone} icon="call-outline" />
              <InfoRow label="Email" value={customer.email} icon="mail-outline" />
              {!customer.phone && !customer.email && (
                <Text style={styles.emptyHint}>Nhấn "Sửa" để thêm thông tin liên hệ</Text>
              )}
            </>
          )}
        </View>

        {/* AI Insights */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Thông tin từ AI</Text>
          <InfoRow label="Nhu cầu chính" value={customer.needs} icon="flag-outline" />
          <InfoRow label="Ngân sách" value={customer.budget} icon="cash-outline" />
          <InfoRow label="Lo ngại / phản đối" value={customer.concerns} icon="alert-circle-outline" />
          <InfoRow label="Yếu tố quyết định" value={customer.decisionFactors} icon="key-outline" />
          <InfoRow label="Tính cách giao tiếp" value={customer.personality} icon="person-outline" />
          <InfoRow label="Bước tiếp theo" value={customer.nextStep} icon="arrow-forward-outline" />
          {!customer.needs && !customer.concerns && (
            <Text style={styles.emptyHint}>Ghi âm cuộc gọi để AI tự trích xuất thông tin</Text>
          )}
        </View>

        {/* Call History Notes */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Lịch sử ghi chú ({customer.notes?.length || 0})</Text>
          {(!customer.notes || customer.notes.length === 0) ? (
            <Text style={styles.emptyHint}>Chưa có ghi chú. Ghi âm cuộc gọi để tự động tạo.</Text>
          ) : (
            customer.notes.map((note, i) => (
              <View key={i} style={styles.noteItem}>
                <Text style={styles.noteDate}>{note.date}</Text>
                <Text style={styles.noteContent}>{note.content}</Text>
              </View>
            ))
          )}
        </View>

        {/* Linked Sessions */}
        {sessions.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Cuộc gọi ({sessions.length})</Text>
            {sessions.map(s => (
              <TouchableOpacity
                key={s.id}
                style={styles.sessionRow}
                onPress={() => navigation.navigate('SessionDetail', { session: s })}
              >
                <View style={[styles.sessionDot, {
                  backgroundColor: s.score >= 7 ? COLORS.SUCCESS : s.score >= 5 ? COLORS.WARNING : COLORS.DANGER,
                }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.sessionDate}>{s.date} — {s.score.toFixed(1)}/10</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={COLORS.TEXT_LIGHT} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Quick Record */}
        <TouchableOpacity
          style={[styles.recordBtn, { backgroundColor: C.PRIMARY }]}
          onPress={() => navigation.navigate('GhiAm', { customerName: customer.name, companyName: customer.company })}
        >
          <Ionicons name="mic" size={18} color="#fff" />
          <Text style={styles.recordBtnText}>Ghi âm cuộc gọi mới</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10, backgroundColor: COLORS.CARD,
    borderBottomWidth: 1, borderBottomColor: COLORS.BORDER,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.BACKGROUND,
    alignItems: 'center', justifyContent: 'center',
  },
  topBarTitle: { fontSize: 16, fontWeight: '700', color: COLORS.TEXT, flex: 1, textAlign: 'center' },
  scroll: { padding: 16, paddingBottom: 40 },
  heroCard: {
    backgroundColor: COLORS.CARD, borderRadius: 16, padding: 24, alignItems: 'center',
    marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 28, fontWeight: '800' },
  heroName: { fontSize: 22, fontWeight: '800', color: COLORS.TEXT },
  heroCompany: { fontSize: 14, color: COLORS.TEXT_LIGHT, marginTop: 2 },
  stageBadge: { paddingHorizontal: 14, paddingVertical: 4, borderRadius: 12, marginTop: 10 },
  stageText: { fontSize: 12, fontWeight: '700' },
  sectionCard: {
    backgroundColor: COLORS.CARD, borderRadius: 14, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.TEXT, marginBottom: 12 },
  editBtn: { fontSize: 14, fontWeight: '600' },
  editInput: {
    backgroundColor: COLORS.BACKGROUND, borderRadius: 10, padding: 12, fontSize: 14,
    color: COLORS.TEXT, marginBottom: 8, borderWidth: 1, borderColor: COLORS.BORDER,
  },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 8 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, fontWeight: '600', color: COLORS.TEXT_LIGHT, textTransform: 'uppercase', letterSpacing: 0.3 },
  infoValue: { fontSize: 14, color: COLORS.TEXT, lineHeight: 20, marginTop: 2 },
  emptyHint: { fontSize: 13, color: COLORS.TEXT_LIGHT, fontStyle: 'italic', lineHeight: 19 },
  noteItem: {
    borderLeftWidth: 3, borderLeftColor: COLORS.PRIMARY, paddingLeft: 12, paddingVertical: 8, marginBottom: 8,
  },
  noteDate: { fontSize: 11, fontWeight: '600', color: COLORS.TEXT_LIGHT },
  noteContent: { fontSize: 13, color: COLORS.TEXT, lineHeight: 19, marginTop: 2 },
  sessionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: COLORS.BORDER,
  },
  sessionDot: { width: 8, height: 8, borderRadius: 4 },
  sessionDate: { fontSize: 13, color: COLORS.TEXT, fontWeight: '500' },
  recordBtn: {
    borderRadius: 14, paddingVertical: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4,
  },
  recordBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
