import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { useColors } from '../contexts/ThemeContext';
import { Session, updateSessionOutcome, SessionOutcome } from '../services/storageService';

type RouteParams = { SessionDetail: { session: Session } };

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
  if (score >= 8.5) return 'Xuất sắc';
  if (score >= 7) return 'Tốt';
  if (score >= 5) return 'Trung bình';
  return 'Cần cải thiện';
}

function SectionCard({ emoji, title, items, backgroundColor, accentColor }: {
  emoji: string; title: string; items: string[];
  backgroundColor: string; accentColor: string;
}) {
  return (
    <View style={[styles.sectionCard, { backgroundColor }]}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionEmoji}>{emoji}</Text>
        <Text style={[styles.sectionTitle, { color: accentColor }]}>{title}</Text>
      </View>
      {items.map((item, i) => (
        <View key={i} style={styles.bulletRow}>
          <View style={[styles.bullet, { backgroundColor: accentColor }]} />
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export default function SessionDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'SessionDetail'>>();
  const C = useColors();
  const { session } = route.params;
  const { analysis } = session;
  const scoreColor = getScoreColor(session.score);
  const [outcome, setOutcome] = useState<SessionOutcome | undefined>(session.outcome);

  const handleOutcome = async (value: SessionOutcome) => {
    setOutcome(value);
    await updateSessionOutcome(session.id, value);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={COLORS.TEXT} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>{session.customerName}</Text>
        <TouchableOpacity onPress={() => {
          const lines: string[] = [
            `📊 BÁO CÁO — ${session.customerName}`,
            `📅 ${session.date} | ⏱ ${formatTime(session.duration)} | ⭐ ${session.score}/10`,
            '', '📋 TÓM TẮT', ...analysis.summary.map(s => `• ${s}`),
          ];
          if (analysis.communication) {
            lines.push('', '🎙️ TÁC PHONG', `• ${analysis.communication.tone}`, `• ${analysis.communication.listening}`);
          }
          lines.push('', '💪 ĐIỂM MẠNH', ...analysis.strengths.map(s => `• ${s}`));
          lines.push('', '⚠️ CẦN CẢI THIỆN', ...analysis.improvements.map(s => `• ${s}`));
          if (analysis.scenario) {
            lines.push('', '🎬 KỊCH BẢN', `❌ ${analysis.scenario.wrong}`, `✅ ${analysis.scenario.correct}`);
          }
          if (analysis.nextActions?.length) lines.push('', '✅ LÀM NGAY', ...analysis.nextActions.map(s => `• ${s}`));
          lines.push('', '— Sales Coach App');
          Share.share({ message: lines.join('\n') });
        }} style={styles.backButton}>
          <Ionicons name="share-outline" size={20} color={COLORS.TEXT} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Score Hero */}
        <View style={styles.heroCard}>
          <View style={[styles.scoreRing, { borderColor: scoreColor }]}>
            <Text style={[styles.scoreNumber, { color: scoreColor }]}>{session.score.toFixed(1)}</Text>
            <Text style={styles.scoreOutOf}>/10</Text>
          </View>
          <Text style={[styles.scoreLabel, { color: scoreColor }]}>{getScoreLabel(session.score)}</Text>
          <Text style={styles.heroCustomer}>{session.customerName}</Text>
          {session.companyName ? (
            <Text style={styles.heroCompany}>{session.companyName}</Text>
          ) : null}
          <View style={styles.heroMeta}>
            <Ionicons name="calendar-outline" size={13} color={COLORS.TEXT_LIGHT} />
            <Text style={styles.heroMetaText}>{session.date}</Text>
            <View style={styles.heroDivider} />
            <Ionicons name="time-outline" size={13} color={COLORS.TEXT_LIGHT} />
            <Text style={styles.heroMetaText}>{formatTime(session.duration)}</Text>
          </View>
        </View>

        {/* Outcome */}
        <View style={styles.outcomeCard}>
          <Text style={styles.outcomeTitle}>Kết quả</Text>
          <View style={styles.outcomeRow}>
            <TouchableOpacity
              style={[
                styles.outcomeBtn,
                { borderColor: C.SUCCESS },
                outcome === 'won' && { backgroundColor: C.SUCCESS },
              ]}
              onPress={() => handleOutcome('won')}
            >
              <Text style={[styles.outcomeBtnText, { color: outcome === 'won' ? '#fff' : C.SUCCESS }]}>
                Chốt thành công
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.outcomeBtn,
                { borderColor: C.DANGER },
                outcome === 'lost' && { backgroundColor: C.DANGER },
              ]}
              onPress={() => handleOutcome('lost')}
            >
              <Text style={[styles.outcomeBtnText, { color: outcome === 'lost' ? '#fff' : C.DANGER }]}>
                Không chốt
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.outcomeBtn,
                { borderColor: C.WARNING },
                outcome === 'pending' && { backgroundColor: C.WARNING },
              ]}
              onPress={() => handleOutcome('pending')}
            >
              <Text style={[styles.outcomeBtnText, { color: outcome === 'pending' ? '#fff' : C.WARNING }]}>
                Đang theo
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <SectionCard emoji="📋" title="Tóm tắt" items={analysis.summary}
          backgroundColor={COLORS.CARD} accentColor={COLORS.PRIMARY} />

        {/* Communication Skills */}
        {analysis.communication && (
          <View style={[styles.sectionCard, { backgroundColor: '#F5F3FF' }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEmoji}>🎙️</Text>
              <Text style={[styles.sectionTitle, { color: '#7C3AED' }]}>Tác phong & Giao tiếp</Text>
            </View>
            <View style={{ paddingVertical: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.TEXT_SECONDARY, marginBottom: 4 }}>Giọng nói & thái độ</Text>
              <Text style={{ fontSize: 13, color: COLORS.TEXT, lineHeight: 20 }}>{analysis.communication.tone}</Text>
            </View>
            <View style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.06)' }} />
            <View style={{ paddingVertical: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.TEXT_SECONDARY, marginBottom: 4 }}>Kỹ năng lắng nghe</Text>
              <Text style={{ fontSize: 13, color: COLORS.TEXT, lineHeight: 20 }}>{analysis.communication.listening}</Text>
            </View>
            <View style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.06)' }} />
            <View style={{ paddingVertical: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.TEXT_SECONDARY, marginBottom: 4 }}>Kỹ năng đặt câu hỏi</Text>
              <Text style={{ fontSize: 13, color: COLORS.TEXT, lineHeight: 20 }}>{analysis.communication.questioning}</Text>
            </View>
          </View>
        )}

        <SectionCard emoji="💪" title="Điểm mạnh" items={analysis.strengths}
          backgroundColor="#F0FFF4" accentColor={COLORS.SUCCESS} />
        <SectionCard emoji="⚠️" title="Cần cải thiện" items={analysis.improvements}
          backgroundColor="#FFFAF0" accentColor={COLORS.WARNING} />

        {/* Scenario */}
        {analysis.scenario && (
          <View style={[styles.sectionCard, { backgroundColor: '#FFF5F5' }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEmoji}>🎬</Text>
              <Text style={[styles.sectionTitle, { color: '#E53E3E' }]}>Kịch bản cải thiện</Text>
            </View>
            <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.TEXT_SECONDARY, marginBottom: 4, marginTop: 4 }}>Tình huống:</Text>
            <Text style={{ fontSize: 13, color: COLORS.TEXT, lineHeight: 21, marginBottom: 8 }}>{analysis.scenario.situation}</Text>
            <View style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.06)' }} />
            <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.DANGER, marginBottom: 4, marginTop: 8 }}>Sales đã làm:</Text>
            <Text style={{ fontSize: 13, color: COLORS.TEXT, lineHeight: 21, marginBottom: 8 }}>{analysis.scenario.wrong}</Text>
            <View style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.06)' }} />
            <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.SUCCESS, marginBottom: 4, marginTop: 8 }}>Nên làm thay:</Text>
            <Text style={{ fontSize: 13, color: COLORS.TEXT, lineHeight: 21, fontStyle: 'italic' }}>{analysis.scenario.correct}</Text>
          </View>
        )}

        {/* Next Actions */}
        {analysis.nextActions && analysis.nextActions.length > 0 && (
          <SectionCard emoji="✅" title="Việc cần làm ngay" items={analysis.nextActions}
            backgroundColor="#F0FFF4" accentColor="#2B6CB0" />
        )}

        <SectionCard emoji="🎯" title="Chiến lược lần sau" items={analysis.strategies}
          backgroundColor="#EBF8FF" accentColor={COLORS.PRIMARY} />

        {analysis.transcript ? (
          <View style={[styles.sectionCard, { backgroundColor: COLORS.CARD }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEmoji}>📝</Text>
              <Text style={[styles.sectionTitle, { color: COLORS.TEXT }]}>Transcript</Text>
            </View>
            <Text style={styles.transcriptText}>{analysis.transcript}</Text>
          </View>
        ) : null}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: COLORS.CARD, borderBottomWidth: 1, borderBottomColor: COLORS.BORDER,
  },
  backButton: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: COLORS.BACKGROUND, alignItems: 'center', justifyContent: 'center',
  },
  topBarTitle: { fontSize: 16, fontWeight: '700', color: COLORS.TEXT, flex: 1, textAlign: 'center' },
  scrollView: { flex: 1, paddingHorizontal: 16 },
  heroCard: {
    backgroundColor: COLORS.CARD, borderRadius: 16, padding: 24,
    alignItems: 'center', marginTop: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
  },
  scoreRing: {
    width: 110, height: 110, borderRadius: 55, borderWidth: 6,
    alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', marginBottom: 12,
  },
  scoreNumber: { fontSize: 36, fontWeight: '800' },
  scoreOutOf: { fontSize: 16, color: COLORS.TEXT_LIGHT, fontWeight: '600', alignSelf: 'flex-end', marginBottom: 4 },
  scoreLabel: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  heroCustomer: { fontSize: 18, fontWeight: '700', color: COLORS.TEXT, marginBottom: 2 },
  heroCompany: { fontSize: 13, color: COLORS.TEXT_LIGHT, marginBottom: 6 },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroMetaText: { fontSize: 13, color: COLORS.TEXT_LIGHT },
  heroDivider: { width: 1, height: 12, backgroundColor: COLORS.BORDER, marginHorizontal: 4 },
  sectionCard: { borderRadius: 14, padding: 16, marginBottom: 12, elevation: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionEmoji: { fontSize: 18 },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, paddingRight: 4 },
  bullet: { width: 6, height: 6, borderRadius: 3, marginTop: 7, marginRight: 10, flexShrink: 0 },
  bulletText: { fontSize: 13, color: COLORS.TEXT, flex: 1, lineHeight: 20 },
  transcriptText: { fontSize: 13, color: COLORS.TEXT, lineHeight: 21 },
  outcomeCard: {
    backgroundColor: COLORS.CARD, borderRadius: 14, padding: 16, marginBottom: 12,
    elevation: 1,
  },
  outcomeTitle: { fontSize: 15, fontWeight: '700', color: COLORS.TEXT, marginBottom: 12 },
  outcomeRow: { flexDirection: 'row', gap: 8 },
  outcomeBtn: {
    flex: 1, borderWidth: 1.5, borderRadius: 10,
    paddingVertical: 10, alignItems: 'center', justifyContent: 'center',
  },
  outcomeBtnText: { fontSize: 12, fontWeight: '700' },
});
