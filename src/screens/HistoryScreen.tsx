import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { loadSessions, deleteSession, Session } from '../services/storageService';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function getScoreColor(score: number): string {
  if (score >= 7) return COLORS.SUCCESS;
  if (score >= 5) return COLORS.WARNING;
  return COLORS.DANGER;
}

function getScoreLabel(score: number): string {
  if (score >= 8) return 'Xuất sắc';
  if (score >= 7) return 'Tốt';
  if (score >= 5) return 'Trung bình';
  return 'Cần cải thiện';
}

function SessionCard({ session, onPress, onDelete }: {
  session: Session;
  onPress: () => void;
  onDelete: () => void;
}) {
  const scoreColor = getScoreColor(session.score);

  return (
    <TouchableOpacity style={styles.sessionCard} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.iconWrap, { backgroundColor: scoreColor + '20' }]}>
        <Ionicons name="person" size={20} color={scoreColor} />
      </View>

      <View style={styles.sessionInfo}>
        <Text style={styles.customerName}>{session.customerName}</Text>
        {session.companyName ? (
          <Text style={styles.companyName}>{session.companyName}</Text>
        ) : null}
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={12} color={COLORS.TEXT_LIGHT} />
          <Text style={styles.metaText}>{session.date}</Text>
          <View style={styles.metaDivider} />
          <Ionicons name="time-outline" size={12} color={COLORS.TEXT_LIGHT} />
          <Text style={styles.metaText}>{formatTime(session.duration)}</Text>
        </View>
      </View>

      <View style={styles.cardRight}>
        <View style={[styles.scoreBadge, { backgroundColor: scoreColor }]}>
          <Text style={styles.scoreNumber}>{session.score.toFixed(1)}</Text>
        </View>
        <Text style={[styles.scoreLabel, { color: scoreColor }]}>
          {getScoreLabel(session.score)}
        </Text>
        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="trash-outline" size={15} color={COLORS.TEXT_LIGHT} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function HistoryScreen() {
  const navigation = useNavigation<any>();
  const [sessions, setSessions] = useState<Session[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadSessions().then(setSessions);
    }, [])
  );

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Xoá phiên tư vấn',
      `Xoá phiên với ${name}?`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xoá',
          style: 'destructive',
          onPress: async () => {
            await deleteSession(id);
            setSessions(prev => prev.filter(s => s.id !== id));
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Lịch sử tư vấn</Text>
          <Text style={styles.headerSubtitle}>{sessions.length} buổi đã ghi</Text>
        </View>

        {sessions.length > 0 ? (
          <FlatList
            data={sessions}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <SessionCard
                session={item}
                onPress={() => navigation.navigate('SessionDetail', { session: item })}
                onDelete={() => handleDelete(item.id, item.customerName)}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={COLORS.BORDER} />
            <Text style={styles.emptyTitle}>Chưa có lịch sử</Text>
            <Text style={styles.emptySubtitle}>
              Ghi âm một phiên tư vấn và nhấn "Lưu kết quả" — sẽ xuất hiện ở đây.
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('GhiAm')}
            >
              <Ionicons name="mic-outline" size={16} color="#fff" />
              <Text style={styles.emptyBtnText}>Bắt đầu ghi âm</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { paddingTop: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: COLORS.TEXT },
  headerSubtitle: { fontSize: 13, color: COLORS.TEXT_LIGHT, marginTop: 2 },
  listContent: { paddingBottom: 20 },
  sessionCard: {
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrap: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  sessionInfo: { flex: 1 },
  customerName: { fontSize: 15, fontWeight: '600', color: COLORS.TEXT, marginBottom: 2 },
  companyName: { fontSize: 12, color: COLORS.TEXT_LIGHT, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 12, color: COLORS.TEXT_LIGHT },
  metaDivider: { width: 1, height: 10, backgroundColor: COLORS.BORDER, marginHorizontal: 4 },
  cardRight: { alignItems: 'center', marginLeft: 8, gap: 3 },
  scoreBadge: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center',
  },
  scoreNumber: { color: '#fff', fontWeight: '700', fontSize: 13 },
  scoreLabel: { fontSize: 10, fontWeight: '600' },
  deleteBtn: { marginTop: 4 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.TEXT, marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: COLORS.TEXT_LIGHT, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.PRIMARY, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 25,
  },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
