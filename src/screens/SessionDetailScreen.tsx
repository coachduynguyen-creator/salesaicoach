import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Dimensions } from 'react-native';
import { Audio } from 'expo-av';
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

  // Audio player
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  const handleOutcome = async (value: SessionOutcome) => {
    setOutcome(value);
    await updateSessionOutcome(session.id, value);
  };

  useEffect(() => {
    return () => { soundRef.current?.unloadAsync(); };
  }, []);

  const handlePlayPause = async () => {
    if (!session.audioUri) return;

    if (isPlaying && soundRef.current) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
      return;
    }

    if (soundRef.current) {
      await soundRef.current.playAsync();
      setIsPlaying(true);
      return;
    }

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: session.audioUri },
        { shouldPlay: true },
        (status) => {
          if (!status.isLoaded) return;
          setPosition(status.positionMillis || 0);
          setAudioDuration(status.durationMillis || 0);
          if (status.didJustFinish) {
            setIsPlaying(false);
            setPosition(0);
            soundRef.current?.setPositionAsync(0);
          }
        },
      );
      soundRef.current = sound;
      setIsPlaying(true);
    } catch {
      // Audio file not found or can't play
    }
  };

  const handleSeek = async (ratio: number) => {
    if (!soundRef.current || audioDuration === 0) return;
    const pos = Math.floor(ratio * audioDuration);
    await soundRef.current.setPositionAsync(pos);
    setPosition(pos);
  };

  const formatMs = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
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

        {/* Audio Player */}
        {session.audioUri && (
          <View style={[styles.sectionCard, { backgroundColor: COLORS.CARD }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEmoji}>🎧</Text>
              <Text style={[styles.sectionTitle, { color: COLORS.TEXT }]}>Nghe lại</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <TouchableOpacity
                style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: C.PRIMARY, alignItems: 'center', justifyContent: 'center' }}
                onPress={handlePlayPause}
              >
                <Ionicons name={isPlaying ? 'pause' : 'play'} size={22} color="#fff" />
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                {/* Seek bar bằng View thuần */}
                <TouchableOpacity
                  activeOpacity={1}
                  style={{ height: 24, justifyContent: 'center' }}
                  onPress={(e) => {
                    const { locationX } = e.nativeEvent;
                    const width = Dimensions.get('window').width - 16 * 2 - 16 * 2 - 44 - 12;
                    handleSeek(Math.max(0, Math.min(1, locationX / width)));
                  }}
                >
                  <View style={{ height: 4, backgroundColor: COLORS.BORDER, borderRadius: 2 }}>
                    <View style={{
                      height: 4, borderRadius: 2, backgroundColor: C.PRIMARY,
                      width: audioDuration > 0 ? `${(position / audioDuration) * 100}%` : '0%',
                    }} />
                  </View>
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                  <Text style={{ fontSize: 11, color: COLORS.TEXT_LIGHT }}>{formatMs(position)}</Text>
                  <Text style={{ fontSize: 11, color: COLORS.TEXT_LIGHT }}>{formatMs(audioDuration)}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Outcome */}
        <View style={styles.outcomeCard}>
          <Text style={styles.outcomeTitle}>Kết quả deal</Text>
          <View style={styles.outcomeRow}>
            {([
              { value: 'won' as SessionOutcome, label: 'Chốt', icon: 'checkmark-circle', color: '#10B981', bg: '#ECFDF5' },
              { value: 'pending' as SessionOutcome, label: 'Đang theo', icon: 'time', color: '#F59E0B', bg: '#FFFBEB' },
              { value: 'lost' as SessionOutcome, label: 'Mất deal', icon: 'close-circle', color: '#EF4444', bg: '#FEF2F2' },
            ]).map(opt => {
              const isActive = outcome === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.outcomeBtn,
                    { backgroundColor: isActive ? opt.color : opt.bg },
                    isActive && styles.outcomeBtnActive,
                  ]}
                  onPress={() => handleOutcome(opt.value)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={opt.icon as any}
                    size={22}
                    color={isActive ? '#fff' : opt.color}
                  />
                  <Text style={[
                    styles.outcomeBtnText,
                    { color: isActive ? '#fff' : opt.color },
                  ]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
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
    backgroundColor: COLORS.CARD, borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  outcomeTitle: { fontSize: 15, fontWeight: '700', color: COLORS.TEXT, marginBottom: 14 },
  outcomeRow: { flexDirection: 'row', gap: 10 },
  outcomeBtn: {
    flex: 1, borderRadius: 14,
    paddingVertical: 14, alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  outcomeBtnActive: {
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,
  },
  outcomeBtnText: { fontSize: 13, fontWeight: '700' },
});
