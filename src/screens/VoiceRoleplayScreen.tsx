import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList,
  ActivityIndicator, ScrollView, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import Markdown from 'react-native-markdown-display';
import { COLORS } from '../constants/colors';
import { useColors } from '../contexts/ThemeContext';
import { useAlert } from '../contexts/AlertContext';
import { chatWithCoach, streamChatWithCoach, transcribeAudio, ChatMessage } from '../services/aiService';
import { startRecording, stopRecording } from '../services/audioService';
import { speakVietnamese, stopSpeaking } from '../services/ttsService';
import { SALES_KNOWLEDGE_BASE } from '../constants/knowledgeBase';
import { useKnowledge } from '../contexts/KnowledgeContext';
import { useBusiness } from '../contexts/BusinessContext';

// ─── Types ──────────────────────────────────────────────────────────────────

type Phase = 'setup' | 'roleplay' | 'feedback';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const PRESET_SCENARIOS = [
  'Khách nói "để suy nghĩ thêm" sau khi nghe giá',
  'Khách so sánh với đối thủ, nói bên kia rẻ hơn',
  'Khách hàng lạnh, lần đầu gọi điện giới thiệu',
  'Khách hẹn gặp nhưng liên tục hủy, né tránh',
];

// ─── Prompts ────────────────────────────────────────────────────────────────

const getRoleplayPrompt = (scenario: string) =>
  `Bạn đang đóng vai KHÁCH HÀNG trong buổi luyện đối đáp bán hàng.

TÌNH HUỐNG: ${scenario}

QUY TẮC BẮT BUỘC:
- Bạn là KHÁCH HÀNG, KHÔNG phải coach. KHÔNG bao giờ dạy hay hướng dẫn.
- Trả lời ngắn gọn, tự nhiên như người Việt nói chuyện thật (1-3 câu).
- Xưng "tôi". Gọi sales là "em" hoặc "bạn".
- Phản ứng THẬT: có thể từ chối, hỏi ngược, tỏ ra nghi ngờ, không hào hứng.
- Nếu sales hỏi đúng câu theo phương pháp 3 Điểm Chạm → mở lòng dần.
- Nếu sales bán hàng truyền thống (liệt kê tính năng, ép mua) → phòng thủ hơn.
- KHÔNG dùng emoji. KHÔNG viết dài. Nói như khách thật.
- 100% tiếng Việt tự nhiên.`;

const getFeedbackPrompt = (scenario: string) =>
  `Bạn là Coach Duy Nguyễn. Vừa rồi bạn quan sát một buổi luyện đối đáp bán hàng.
Phân tích TOÀN BỘ cuộc hội thoại và đưa ra đánh giá chi tiết.

TÌNH HUỐNG GỐC: ${scenario}

Trả về đánh giá theo format:

## Điểm tổng: X/10

## Sales đã làm tốt
- (trích dẫn câu nói cụ thể + giải thích tại sao tốt)

## Cần cải thiện
- (trích dẫn câu nói cụ thể + nên nói gì thay thế)

## Phân tích theo 3 Điểm Chạm
- Chạm Động Lực: đã/chưa khai thác được gì
- Chạm Điểm Nghẽn: đã/chưa tìm ra rào cản gì
- Chạm Con Đường: đã/chưa đề xuất giải pháp phù hợp

## Kịch bản mẫu
Viết lại 2-3 lượt trao đổi hay nhất theo đúng phương pháp TTA.

## 3 điều cần luyện tập tiếp
(cụ thể, có thể làm ngay)`;

// ─── Component ──────────────────────────────────────────────────────────────

export default function VoiceRoleplayScreen() {
  const C = useColors();
  const { showAlert } = useAlert();
  const { knowledgeBase } = useKnowledge();
  const { businessContext } = useBusiness();
  const kb = knowledgeBase || SALES_KNOWLEDGE_BASE;

  // State
  const [phase, setPhase] = useState<Phase>('setup');
  const [scenario, setScenario] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [feedbackResult, setFeedbackResult] = useState('');
  const [turnCount, setTurnCount] = useState(0);

  // Loading states
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [isSetupRecording, setIsSetupRecording] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; stopSpeaking(); };
  }, []);

  // ─── Setup Phase ────────────────────────────────────────────────────────

  const handleSetupVoice = async () => {
    if (isSetupRecording) {
      try {
        setIsSetupRecording(false);
        setIsTranscribing(true);
        const result = await stopRecording();
        const text = await transcribeAudio(result.uri);
        if (text.trim()) setScenario(prev => prev ? prev + ' ' + text.trim() : text.trim());
      } catch {
        showAlert({ title: 'Lỗi', message: 'Không thể nhận diện giọng nói.', type: 'error' });
      } finally {
        setIsTranscribing(false);
      }
    } else {
      try {
        await startRecording();
        setIsSetupRecording(true);
      } catch {
        showAlert({ title: 'Lỗi', message: 'Không thể ghi âm. Kiểm tra quyền microphone.', type: 'error' });
      }
    }
  };

  const startRoleplay = useCallback(async () => {
    if (!scenario.trim()) return;
    setPhase('roleplay');
    setMessages([]);
    setTurnCount(0);

    // AI mở đầu (đóng vai khách)
    setIsAIThinking(true);
    try {
      const reply = await chatWithCoach(
        [{ role: 'user', content: 'Bắt đầu cuộc hội thoại. Sales gọi điện hoặc gặp mặt.' }],
        getRoleplayPrompt(scenario) + '\n\n' + kb + '\n\n' + businessContext,
      );
      if (!isMountedRef.current) return;
      const aiMsg: Message = { id: '1', role: 'assistant', content: reply };
      setMessages([aiMsg]);
      setIsSpeaking(true);
      await speakVietnamese(reply);
      if (isMountedRef.current) setIsSpeaking(false);
    } catch {
      if (isMountedRef.current) {
        showAlert({ title: 'Lỗi', message: 'Không thể kết nối AI.', type: 'error' });
        setPhase('setup');
      }
    } finally {
      if (isMountedRef.current) setIsAIThinking(false);
    }
  }, [scenario, kb, businessContext, showAlert]);

  // ─── Roleplay Phase ─────────────────────────────────────────────────────

  const handleMicPress = async () => {
    if (isRecording) {
      // Stop recording → transcribe → send to AI → speak
      try {
        setIsRecording(false);
        setIsTranscribing(true);
        const result = await stopRecording();
        const text = await transcribeAudio(result.uri);
        if (!text.trim()) { setIsTranscribing(false); return; }
        setIsTranscribing(false);

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text.trim() };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setTurnCount(prev => prev + 1);

        // Get AI response
        setIsAIThinking(true);
        const history: ChatMessage[] = newMessages.map(m => ({ role: m.role, content: m.content }));
        const reply = await chatWithCoach(
          history,
          getRoleplayPrompt(scenario) + '\n\n' + kb + '\n\n' + businessContext,
        );
        if (!isMountedRef.current) return;

        const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: reply };
        setMessages(prev => [...prev, aiMsg]);
        setIsAIThinking(false);

        // Speak AI response
        setIsSpeaking(true);
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
        await speakVietnamese(reply);
        if (isMountedRef.current) setIsSpeaking(false);
      } catch {
        if (isMountedRef.current) {
          setIsTranscribing(false);
          setIsAIThinking(false);
          setIsSpeaking(false);
          showAlert({ title: 'Lỗi', message: 'Có lỗi xảy ra. Thử lại.', type: 'error' });
        }
      }
    } else {
      // Start recording
      try {
        stopSpeaking();
        setIsSpeaking(false);
        await startRecording();
        setIsRecording(true);
      } catch {
        showAlert({ title: 'Lỗi', message: 'Không thể ghi âm.', type: 'error' });
      }
    }
  };

  // ─── Feedback Phase ─────────────────────────────────────────────────────

  const endAndGetFeedback = useCallback(async () => {
    if (messages.length < 2) {
      showAlert({ title: 'Chưa đủ', message: 'Hãy luyện ít nhất 1 lượt trước khi kết thúc.', type: 'warning' });
      return;
    }
    stopSpeaking();
    setPhase('feedback');
    setIsFeedbackLoading(true);
    setFeedbackResult('');

    try {
      const history: ChatMessage[] = messages.map(m => ({
        role: m.role,
        content: m.role === 'assistant' ? `[Khách hàng]: ${m.content}` : `[Sales]: ${m.content}`,
      }));
      history.push({ role: 'user', content: 'Kết thúc buổi luyện tập. Hãy đánh giá toàn bộ cuộc hội thoại trên.' });

      const reply = await chatWithCoach(
        history,
        getFeedbackPrompt(scenario) + '\n\n' + kb + '\n\n' + businessContext,
      );
      if (isMountedRef.current) setFeedbackResult(reply);
    } catch {
      if (isMountedRef.current) setFeedbackResult('Không thể tạo đánh giá. Vui lòng thử lại.');
    } finally {
      if (isMountedRef.current) setIsFeedbackLoading(false);
    }
  }, [messages, scenario, kb, businessContext, showAlert]);

  const resetAll = () => {
    stopSpeaking();
    setPhase('setup');
    setScenario('');
    setMessages([]);
    setFeedbackResult('');
    setTurnCount(0);
  };

  // ─── Render ─────────────────────────────────────────────────────────────

  const mdStyles = StyleSheet.create({
    body: { fontSize: 14, color: C.TEXT, lineHeight: 22 },
    strong: { fontWeight: '700' as const },
    heading2: { fontSize: 16, fontWeight: '700' as const, color: C.PRIMARY, marginTop: 14, marginBottom: 6 },
  });

  const busy = isRecording || isTranscribing || isAIThinking || isSpeaking;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.BACKGROUND }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: C.CARD, borderBottomColor: C.BORDER }]}>
        <View style={[styles.headerIcon, { backgroundColor: '#7C3AED15' }]}>
          <Ionicons name="mic-circle" size={28} color="#7C3AED" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: C.TEXT }]}>Luyện Đối Đáp</Text>
          <Text style={[styles.headerSub, { color: C.TEXT_LIGHT }]}>
            {phase === 'setup' ? 'Mô tả tình huống để bắt đầu' :
             phase === 'roleplay' ? `Lượt ${turnCount} — Đang luyện tập` :
             'Đánh giá kết quả'}
          </Text>
        </View>
        {phase === 'roleplay' && (
          <TouchableOpacity
            style={[styles.endBtn, { backgroundColor: '#DC262615', borderColor: '#DC262630' }]}
            onPress={endAndGetFeedback}
            disabled={busy}
          >
            <Text style={{ color: '#DC2626', fontSize: 13, fontWeight: '700' }}>Kết thúc</Text>
          </TouchableOpacity>
        )}
        {phase === 'feedback' && (
          <TouchableOpacity
            style={[styles.endBtn, { backgroundColor: '#7C3AED15', borderColor: '#7C3AED30' }]}
            onPress={resetAll}
          >
            <Text style={{ color: '#7C3AED', fontSize: 13, fontWeight: '700' }}>Luyện lại</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ─── Setup Phase ─────────────────────────────────────────── */}
      {phase === 'setup' && (
        <ScrollView contentContainerStyle={styles.setupScroll} keyboardShouldPersistTaps="handled">
          <Text style={[styles.setupTitle, { color: C.TEXT }]}>Bạn muốn luyện tình huống gì?</Text>
          <Text style={[styles.setupHint, { color: C.TEXT_LIGHT }]}>
            Mô tả khách hàng và tình huống. AI sẽ đóng vai khách và trò chuyện bằng giọng nói.
          </Text>

          <View style={[styles.setupInput, { backgroundColor: C.CARD, borderColor: C.BORDER }]}>
            <TextInput
              style={[styles.setupTextInput, { color: C.TEXT }]}
              placeholder="VD: Khách là giám đốc, 45 tuổi, đang dùng giải pháp đối thủ, nghe giá xong nói để suy nghĩ..."
              placeholderTextColor={C.TEXT_LIGHT}
              value={scenario}
              onChangeText={setScenario}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.setupMicBtn, isSetupRecording && { backgroundColor: '#DC2626' }]}
              onPress={handleSetupVoice}
              disabled={isTranscribing}
            >
              {isTranscribing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name={isSetupRecording ? 'stop' : 'mic'} size={18} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

          <Text style={[styles.presetLabel, { color: C.TEXT_SECONDARY }]}>Hoặc chọn tình huống mẫu:</Text>
          <View style={styles.presetWrap}>
            {PRESET_SCENARIOS.map((s, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.presetChip, { backgroundColor: C.CARD, borderColor: C.BORDER }]}
                onPress={() => setScenario(s)}
              >
                <Text style={[styles.presetText, { color: C.TEXT_SECONDARY }]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.startBtn, !scenario.trim() && { opacity: 0.5 }]}
            onPress={startRoleplay}
            disabled={!scenario.trim() || isAIThinking}
          >
            {isAIThinking ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="play" size={20} color="#fff" />
                <Text style={styles.startBtnText}>Bắt đầu luyện tập</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* ─── Roleplay Phase ──────────────────────────────────────── */}
      {phase === 'roleplay' && (
        <View style={{ flex: 1 }}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={[styles.bubbleRow, item.role === 'user' ? styles.bubbleRowUser : styles.bubbleRowAI]}>
                {item.role === 'assistant' && (
                  <View style={[styles.avatar, { backgroundColor: '#7C3AED20' }]}>
                    <Ionicons name="person" size={14} color="#7C3AED" />
                  </View>
                )}
                <View style={[
                  styles.bubble,
                  item.role === 'user'
                    ? [styles.bubbleUser, { backgroundColor: C.PRIMARY }]
                    : [styles.bubbleAI, { backgroundColor: C.CARD }],
                ]}>
                  <Text style={[
                    styles.bubbleText,
                    item.role === 'user' ? { color: '#fff' } : { color: C.TEXT },
                  ]}>
                    {item.content}
                  </Text>
                </View>
              </View>
            )}
            contentContainerStyle={styles.chatList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListFooterComponent={
              isAIThinking ? (
                <View style={styles.thinkingRow}>
                  <ActivityIndicator size="small" color="#7C3AED" />
                  <Text style={[styles.thinkingText, { color: C.TEXT_LIGHT }]}>Khách đang nghĩ...</Text>
                </View>
              ) : null
            }
          />

          {/* Status bar */}
          {(isTranscribing || isSpeaking) && (
            <View style={[styles.statusBar, { backgroundColor: C.CARD, borderTopColor: C.BORDER }]}>
              <ActivityIndicator size="small" color="#7C3AED" />
              <Text style={[styles.statusText, { color: '#7C3AED' }]}>
                {isTranscribing ? 'Đang nhận diện giọng nói...' : 'Khách đang nói...'}
              </Text>
              {isSpeaking && (
                <TouchableOpacity onPress={() => { stopSpeaking(); setIsSpeaking(false); }}>
                  <Ionicons name="stop-circle" size={22} color="#DC2626" />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Mic button */}
          <View style={[styles.micBar, { backgroundColor: C.CARD, borderTopColor: C.BORDER }]}>
            <TouchableOpacity
              style={[
                styles.bigMicBtn,
                isRecording ? { backgroundColor: '#DC2626' } : { backgroundColor: '#7C3AED' },
                (isTranscribing || isAIThinking || isSpeaking) && { opacity: 0.4 },
              ]}
              onPress={handleMicPress}
              disabled={isTranscribing || isAIThinking || isSpeaking}
            >
              <Ionicons name={isRecording ? 'stop' : 'mic'} size={32} color="#fff" />
            </TouchableOpacity>
            <Text style={[styles.micHint, { color: C.TEXT_LIGHT }]}>
              {isRecording ? 'Đang nghe... Nhấn để dừng' :
               isSpeaking ? 'Đợi khách nói xong...' :
               'Nhấn mic để trả lời'}
            </Text>
          </View>
        </View>
      )}

      {/* ─── Feedback Phase ──────────────────────────────────────── */}
      {phase === 'feedback' && (
        <ScrollView contentContainerStyle={styles.feedbackScroll}>
          {isFeedbackLoading ? (
            <View style={styles.feedbackLoading}>
              <ActivityIndicator size="large" color="#7C3AED" />
              <Text style={[styles.feedbackLoadingText, { color: C.TEXT_LIGHT }]}>
                Coach Duy Nguyễn đang đánh giá...
              </Text>
            </View>
          ) : (
            <>
              <View style={[styles.feedbackCard, { backgroundColor: C.CARD }]}>
                <Markdown style={mdStyles}>{feedbackResult}</Markdown>
              </View>
              <View style={styles.feedbackActions}>
                <TouchableOpacity
                  style={[styles.feedbackBtn, { backgroundColor: '#7C3AED' }]}
                  onPress={resetAll}
                >
                  <Ionicons name="refresh" size={18} color="#fff" />
                  <Text style={styles.feedbackBtnText}>Luyện tình huống mới</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.feedbackBtn, { backgroundColor: C.CARD, borderWidth: 1, borderColor: C.BORDER }]}
                  onPress={() => Share.share({ message: feedbackResult })}
                >
                  <Ionicons name="share-outline" size={18} color={C.TEXT} />
                  <Text style={[styles.feedbackBtnText, { color: C.TEXT }]}>Chia sẻ</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  headerSub: { fontSize: 12, marginTop: 2 },
  endBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },

  // Setup
  setupScroll: { padding: 20, paddingBottom: 40 },
  setupTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  setupHint: { fontSize: 14, lineHeight: 21, marginBottom: 20 },
  setupInput: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 16, flexDirection: 'row' },
  setupTextInput: { flex: 1, fontSize: 15, lineHeight: 22, minHeight: 80, textAlignVertical: 'top' },
  setupMicBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: '#7C3AED',
    alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end',
  },
  presetLabel: { fontSize: 13, fontWeight: '600', marginBottom: 10 },
  presetWrap: { gap: 8, marginBottom: 24 },
  presetChip: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  presetText: { fontSize: 14, lineHeight: 20 },
  startBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#7C3AED', borderRadius: 16, paddingVertical: 18,
  },
  startBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },

  // Roleplay
  chatList: { padding: 16, paddingBottom: 8, gap: 12 },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  bubbleRowUser: { justifyContent: 'flex-end' },
  bubbleRowAI: { justifyContent: 'flex-start' },
  avatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  bubble: { maxWidth: '80%', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12 },
  bubbleUser: { borderBottomRightRadius: 6 },
  bubbleAI: { borderBottomLeftRadius: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  thinkingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  thinkingText: { fontSize: 13, fontStyle: 'italic' },
  statusBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1 },
  statusText: { flex: 1, fontSize: 13, fontWeight: '500' },
  micBar: { alignItems: 'center', paddingVertical: 20, borderTopWidth: 1 },
  bigMicBtn: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  micHint: { fontSize: 13, marginTop: 10 },

  // Feedback
  feedbackScroll: { padding: 20, paddingBottom: 40 },
  feedbackLoading: { alignItems: 'center', paddingTop: 60, gap: 16 },
  feedbackLoadingText: { fontSize: 15, fontStyle: 'italic' },
  feedbackCard: { borderRadius: 16, padding: 20, marginBottom: 16 },
  feedbackActions: { gap: 10 },
  feedbackBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14 },
  feedbackBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
