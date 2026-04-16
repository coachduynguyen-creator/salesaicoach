import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList,
  ActivityIndicator, ScrollView, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Markdown from 'react-native-markdown-display';
import { COLORS } from '../constants/colors';
import { useColors } from '../contexts/ThemeContext';
import { useAlert } from '../contexts/AlertContext';
import { chatWithCoach, transcribeAudio, ChatMessage } from '../services/aiService';
import { startRecording, stopRecording } from '../services/audioService';
import {
  speakVietnamese, stopSpeaking, setVoice, getSelectedVoice,
  VOICE_OPTIONS, VoiceOption,
} from '../services/ttsService';
import { SALES_KNOWLEDGE_BASE } from '../constants/knowledgeBase';
import { useKnowledge } from '../contexts/KnowledgeContext';
import { useBusiness } from '../contexts/BusinessContext';

// ─── Types ──────────────────────────────────────────────────────────────────

type Phase = 'setup' | 'roleplay' | 'feedback' | 'history';
type RoleplayRole = 'sales' | 'customer';
type RoleplayMode = 'voice' | 'text';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface SavedSession {
  id: string;
  date: string;
  scenario: string;
  userRole: RoleplayRole;
  messages: Message[];
  feedback: string;
  turnCount: number;
}

const STORAGE_KEY = '@salescoach_roleplay_history';
const MAX_SAVED = 20;

const PRESET_SCENARIOS = [
  'Khách nói "để suy nghĩ thêm" sau khi nghe giá',
  'Khách so sánh với đối thủ, nói bên kia rẻ hơn',
  'Khách hàng lạnh, lần đầu gọi điện giới thiệu',
  'Khách hẹn gặp nhưng liên tục hủy, né tránh',
];

// ─── Prompts ────────────────────────────────────────────────────────────────

const getPrompt = (scenario: string, userRole: RoleplayRole) => {
  if (userRole === 'sales') {
    return `Bạn đang đóng vai KHÁCH HÀNG. Đây là buổi luyện đối đáp bán hàng.

TÌNH HUỐNG: ${scenario}

QUY TẮC TUYỆT ĐỐI:
- CHỈ viết LỜI THOẠI của khách hàng. KHÔNG viết gì khác.
- KHÔNG viết heading (#), KHÔNG viết tiêu đề, KHÔNG viết ghi chú.
- KHÔNG mô tả cử chỉ, hành động, suy nghĩ (ví dụ KHÔNG viết *nhìn lạnh lùng*, *gật đầu*).
- KHÔNG viết hướng dẫn, phân tích, nhận xét, gợi ý cho sales.
- KHÔNG dùng markdown (**, *, ---, #). Chỉ text thuần.
- Xưng "tôi". Gọi sales là "em" hoặc "bạn".
- Trả lời 1-2 câu ngắn gọn, tự nhiên như người thật nói.
- Phản ứng thật: có thể từ chối, hỏi ngược, tỏ ra nghi ngờ.
- Nếu sales hỏi đúng theo 3 Điểm Chạm → mở lòng dần.
- Nếu sales ép mua, liệt kê tính năng → phòng thủ hơn.

VÍ DỤ ĐÚNG: "Ừ, tôi có nghe qua rồi. Nhưng tôi chưa hiểu nó khác gì Vũ Yên?"
VÍ DỤ SAI: "# Cuộc hội thoại bắt đầu\\n*Khách nhìn sales*\\nTôi có nghe..."`;
  }
  return `Bạn đang đóng vai NHÂN VIÊN TƯ VẤN BÁN HÀNG mẫu theo phương pháp THE TRUSTED ADVISOR.

TÌNH HUỐNG: ${scenario}

QUY TẮC TUYỆT ĐỐI:
- CHỈ viết LỜI THOẠI của sales. KHÔNG viết gì khác.
- KHÔNG viết heading (#), tiêu đề, ghi chú, phân tích, hướng dẫn.
- KHÔNG mô tả cử chỉ, hành động (KHÔNG viết *mỉm cười*, *gật đầu*).
- KHÔNG dùng markdown. Chỉ text thuần.
- Xưng "em". Gọi khách là "anh" hoặc "chị".
- Trả lời 1-2 câu ngắn gọn, tự nhiên. Đặt câu hỏi mở, lắng nghe.
- KHÔNG ép mua, KHÔNG liệt kê tính năng. Khám phá nỗi sợ và động lực.
- Thể hiện phong cách tư vấn ĐÚNG theo 3 Điểm Chạm.

VÍ DỤ ĐÚNG: "Dạ em chào anh. Em được biết anh đang tìm hiểu về Hạ Long Xanh, anh có thể chia sẻ thêm về mong muốn của anh không ạ?"
VÍ DỤ SAI: "## Lời mở đầu\\n*Sales mỉm cười*\\nEm chào anh..."`;
};

const getFeedbackPrompt = (scenario: string, userRole: RoleplayRole) => {
  const who = userRole === 'sales' ? 'sales' : 'người đóng vai khách hàng';
  return `Bạn là Coach Duy Nguyễn. Vừa rồi bạn quan sát một buổi luyện đối đáp bán hàng.
Người luyện tập đóng vai: ${userRole === 'sales' ? 'SALES' : 'KHÁCH HÀNG (để học cách tư vấn từ AI sales mẫu)'}

TÌNH HUỐNG GỐC: ${scenario}

Trả về đánh giá theo format:

## Điểm tổng: X/10

## ${userRole === 'sales' ? 'Sales' : 'Người luyện'} đã làm tốt
- (trích dẫn câu nói cụ thể + giải thích)

## Cần cải thiện
- (trích dẫn câu nói + nên nói gì thay thế)

## Phân tích theo 3 Điểm Chạm
- Chạm Động Lực: đã/chưa khai thác được gì
- Chạm Điểm Nghẽn: đã/chưa tìm ra rào cản gì
- Chạm Con Đường: đã/chưa đề xuất giải pháp phù hợp

## Kịch bản mẫu
Viết lại 2-3 lượt trao đổi hay nhất theo đúng phương pháp TTA.

## 3 điều cần luyện tập tiếp
(cụ thể, có thể làm ngay)`;
};

// ─── Storage ────────────────────────────────────────────────────────────────

async function loadSessions(): Promise<SavedSession[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

async function saveSession(session: SavedSession): Promise<void> {
  try {
    const sessions = await loadSessions();
    sessions.unshift(session);
    if (sessions.length > MAX_SAVED) sessions.length = MAX_SAVED;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch { /* ignore */ }
}

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
  const [userRole, setUserRole] = useState<RoleplayRole>('sales');
  const [mode, setMode] = useState<RoleplayMode>('voice');
  const [voice, setVoiceState] = useState<VoiceOption>(getSelectedVoice());
  const [messages, setMessages] = useState<Message[]>([]);
  const [feedbackResult, setFeedbackResult] = useState('');
  const [turnCount, setTurnCount] = useState(0);
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [viewingSession, setViewingSession] = useState<SavedSession | null>(null);

  // Loading states
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [isSpeakingState, setIsSpeakingState] = useState(false);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [isSetupRecording, setIsSetupRecording] = useState(false);
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [textInput, setTextInput] = useState('');

  const flatListRef = useRef<FlatList>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    loadSessions().then(s => setSavedSessions(s));
    return () => { isMountedRef.current = false; stopSpeaking(); };
  }, []);

  const handleVoiceSelect = (v: VoiceOption) => {
    setVoice(v);
    setVoiceState(v);
    setShowVoicePicker(false);
  };

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
      } finally { setIsTranscribing(false); }
    } else {
      try { await startRecording(); setIsSetupRecording(true); }
      catch { showAlert({ title: 'Lỗi', message: 'Không thể ghi âm.', type: 'error' }); }
    }
  };

  const startRoleplay = useCallback(async () => {
    if (!scenario.trim()) return;
    setPhase('roleplay');
    setMessages([]);
    setTurnCount(0);
    setFeedbackResult('');

    setIsAIThinking(true);
    try {
      const startMsg = userRole === 'sales'
        ? 'Xin chào, em muốn giới thiệu với anh về dự án.'
        : 'Tôi đang tìm hiểu về dự án này.';
      const reply = await chatWithCoach(
        [{ role: 'user', content: startMsg }],
        getPrompt(scenario, userRole) + '\n\n' + kb + '\n\n' + businessContext,
      );
      if (!isMountedRef.current) return;
      const aiMsg: Message = { id: '1', role: 'assistant', content: reply };
      setMessages([aiMsg]);
      if (mode === 'voice') {
        setIsSpeakingState(true);
        await speakVietnamese(reply);
        if (isMountedRef.current) setIsSpeakingState(false);
      }
    } catch {
      if (isMountedRef.current) {
        showAlert({ title: 'Lỗi', message: 'Không thể kết nối AI.', type: 'error' });
        setPhase('setup');
      }
    } finally { if (isMountedRef.current) setIsAIThinking(false); }
  }, [scenario, userRole, kb, businessContext, showAlert]);

  // ─── Roleplay Phase ─────────────────────────────────────────────────────

  const sendTextMessage = async () => {
    const trimmed = textInput.trim();
    if (!trimmed || isAIThinking) return;
    setTextInput('');

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setTurnCount(prev => prev + 1);

    setIsAIThinking(true);
    try {
      const history: ChatMessage[] = newMessages.map(m => ({ role: m.role, content: m.content }));
      const reply = await chatWithCoach(
        history,
        getPrompt(scenario, userRole) + '\n\n' + kb + '\n\n' + businessContext,
      );
      if (!isMountedRef.current) return;
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: reply };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      if (isMountedRef.current) showAlert({ title: 'Lỗi', message: 'Có lỗi xảy ra.', type: 'error' });
    } finally { if (isMountedRef.current) setIsAIThinking(false); }
  };

  const handleMicPress = async () => {
    if (isRecording) {
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

        setIsAIThinking(true);
        const history: ChatMessage[] = newMessages.map(m => ({ role: m.role, content: m.content }));
        const reply = await chatWithCoach(
          history,
          getPrompt(scenario, userRole) + '\n\n' + kb + '\n\n' + businessContext,
        );
        if (!isMountedRef.current) return;

        const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: reply };
        setMessages(prev => [...prev, aiMsg]);
        setIsAIThinking(false);

        if (mode === 'voice') {
          setIsSpeakingState(true);
          await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
          await speakVietnamese(reply);
          if (isMountedRef.current) setIsSpeakingState(false);
        }
      } catch {
        if (isMountedRef.current) {
          setIsTranscribing(false);
          setIsAIThinking(false);
          setIsSpeakingState(false);
          showAlert({ title: 'Lỗi', message: 'Có lỗi xảy ra. Thử lại.', type: 'error' });
        }
      }
    } else {
      try {
        stopSpeaking(); setIsSpeakingState(false);
        await startRecording(); setIsRecording(true);
      } catch { showAlert({ title: 'Lỗi', message: 'Không thể ghi âm.', type: 'error' }); }
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
      const roleLabels = userRole === 'sales'
        ? { user: '[Sales]', ai: '[Khách hàng]' }
        : { user: '[Khách hàng]', ai: '[Sales mẫu]' };
      const history: ChatMessage[] = messages.map(m => ({
        role: m.role,
        content: m.role === 'assistant' ? `${roleLabels.ai}: ${m.content}` : `${roleLabels.user}: ${m.content}`,
      }));
      history.push({ role: 'user', content: 'Kết thúc buổi luyện tập. Hãy đánh giá toàn bộ cuộc hội thoại.' });

      const reply = await chatWithCoach(
        history,
        getFeedbackPrompt(scenario, userRole) + '\n\n' + kb + '\n\n' + businessContext,
      );
      if (!isMountedRef.current) return;
      setFeedbackResult(reply);

      // Lưu session
      const session: SavedSession = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        scenario,
        userRole,
        messages,
        feedback: reply,
        turnCount,
      };
      await saveSession(session);
      const updated = await loadSessions();
      if (isMountedRef.current) setSavedSessions(updated);
    } catch {
      if (isMountedRef.current) setFeedbackResult('Không thể tạo đánh giá. Vui lòng thử lại.');
    } finally { if (isMountedRef.current) setIsFeedbackLoading(false); }
  }, [messages, scenario, userRole, turnCount, kb, businessContext, showAlert]);

  const resetAll = () => {
    stopSpeaking();
    setPhase('setup');
    setScenario('');
    setMessages([]);
    setFeedbackResult('');
    setTurnCount(0);
    setViewingSession(null);
  };

  // ─── Render helpers ─────────────────────────────────────────────────────

  const mdStyles = StyleSheet.create({
    body: { fontSize: 14, color: C.TEXT, lineHeight: 22 },
    strong: { fontWeight: '700' as const },
    heading2: { fontSize: 16, fontWeight: '700' as const, color: '#7C3AED', marginTop: 14, marginBottom: 6 },
  });

  const busy = isRecording || isTranscribing || isAIThinking || isSpeakingState;
  const aiRoleLabel = userRole === 'sales' ? 'Khách hàng' : 'Sales mẫu';
  const aiRoleIcon = userRole === 'sales' ? 'person' : 'briefcase';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.BACKGROUND }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: C.CARD, borderBottomColor: C.BORDER }]}>
        {(phase === 'history' || viewingSession) ? (
          <TouchableOpacity onPress={() => { setViewingSession(null); setPhase('setup'); }} style={styles.headerBackBtn}>
            <Ionicons name="arrow-back" size={22} color={C.TEXT} />
          </TouchableOpacity>
        ) : (
          <View style={[styles.headerIcon, { backgroundColor: '#7C3AED15' }]}>
            <Ionicons name="mic-circle" size={28} color="#7C3AED" />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: C.TEXT }]}>
            {viewingSession ? 'Chi tiết buổi luyện' : 'Luyện Đối Đáp'}
          </Text>
          <Text style={[styles.headerSub, { color: C.TEXT_LIGHT }]}>
            {phase === 'setup' && !viewingSession ? 'Mô tả tình huống để bắt đầu' :
             phase === 'roleplay' ? `Lượt ${turnCount} — Bạn: ${userRole === 'sales' ? 'Sales' : 'Khách'}` :
             phase === 'feedback' && !viewingSession ? 'Đánh giá kết quả' :
             phase === 'history' ? 'Lịch sử luyện tập' :
             viewingSession ? new Date(viewingSession.date).toLocaleDateString('vi-VN') : ''}
          </Text>
        </View>
        {phase === 'setup' && !viewingSession && savedSessions.length > 0 && (
          <TouchableOpacity
            style={[styles.historyBtn, { backgroundColor: C.SURFACE }]}
            onPress={() => setPhase('history')}
          >
            <Ionicons name="time-outline" size={18} color={C.TEXT_SECONDARY} />
          </TouchableOpacity>
        )}
        {phase === 'roleplay' && (
          <TouchableOpacity
            style={[styles.endBtn, { backgroundColor: '#DC262615', borderColor: '#DC262630' }]}
            onPress={endAndGetFeedback}
            disabled={busy}
          >
            <Text style={{ color: '#DC2626', fontSize: 13, fontWeight: '700' }}>Kết thúc</Text>
          </TouchableOpacity>
        )}
        {phase === 'feedback' && !viewingSession && (
          <TouchableOpacity
            style={[styles.endBtn, { backgroundColor: '#7C3AED15', borderColor: '#7C3AED30' }]}
            onPress={resetAll}
          >
            <Text style={{ color: '#7C3AED', fontSize: 13, fontWeight: '700' }}>Luyện lại</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ─── History Phase ─────────────────────────────────────────── */}
      {phase === 'history' && !viewingSession && (
        <FlatList
          data={savedSessions}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.historyCard, { backgroundColor: C.CARD }]}
              onPress={() => setViewingSession(item)}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.historyScenario, { color: C.TEXT }]} numberOfLines={2}>{item.scenario}</Text>
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 6 }}>
                  <Text style={[styles.historyMeta, { color: C.TEXT_LIGHT }]}>
                    {new Date(item.date).toLocaleDateString('vi-VN')}
                  </Text>
                  <Text style={[styles.historyMeta, { color: C.TEXT_LIGHT }]}>
                    {item.turnCount} lượt
                  </Text>
                  <Text style={[styles.historyMeta, { color: '#7C3AED' }]}>
                    {item.userRole === 'sales' ? 'Vai: Sales' : 'Vai: Khách'}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={C.TEXT_LIGHT} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: C.TEXT_LIGHT }]}>Chưa có buổi luyện tập nào.</Text>
          }
        />
      )}

      {/* ─── Viewing saved session ──────────────────────────────────── */}
      {viewingSession && (
        <ScrollView contentContainerStyle={styles.feedbackScroll}>
          <Text style={[styles.presetLabel, { color: C.TEXT_SECONDARY }]}>Tình huống:</Text>
          <Text style={[{ fontSize: 15, color: C.TEXT, marginBottom: 16, lineHeight: 22 }]}>{viewingSession.scenario}</Text>
          <View style={[styles.feedbackCard, { backgroundColor: C.CARD }]}>
            <Markdown style={mdStyles}>{viewingSession.feedback}</Markdown>
          </View>
          <TouchableOpacity
            style={[styles.feedbackBtn, { backgroundColor: C.CARD, borderWidth: 1, borderColor: C.BORDER }]}
            onPress={() => Share.share({ message: viewingSession.feedback })}
          >
            <Ionicons name="share-outline" size={18} color={C.TEXT} />
            <Text style={[styles.feedbackBtnText, { color: C.TEXT }]}>Chia sẻ đánh giá</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* ─── Setup Phase ─────────────────────────────────────────── */}
      {phase === 'setup' && !viewingSession && (
        <ScrollView contentContainerStyle={styles.setupScroll} keyboardShouldPersistTaps="handled">
          <Text style={[styles.setupTitle, { color: C.TEXT }]}>Bạn muốn luyện tình huống gì?</Text>

          {/* Chọn vai trò */}
          <Text style={[styles.presetLabel, { color: C.TEXT_SECONDARY, marginBottom: 8 }]}>Bạn muốn đóng vai:</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 18 }}>
            {([
              { key: 'sales' as RoleplayRole, label: 'Sales (tư vấn)', icon: 'briefcase-outline', desc: 'AI đóng vai khách' },
              { key: 'customer' as RoleplayRole, label: 'Khách hàng', icon: 'person-outline', desc: 'AI đóng vai sales mẫu TTA' },
            ]).map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.roleChip,
                  { backgroundColor: C.CARD, borderColor: userRole === opt.key ? '#7C3AED' : C.BORDER },
                  userRole === opt.key && { borderWidth: 2 },
                ]}
                onPress={() => setUserRole(opt.key)}
              >
                <Ionicons name={opt.icon as any} size={20} color={userRole === opt.key ? '#7C3AED' : C.TEXT_LIGHT} />
                <Text style={[styles.roleLabel, { color: userRole === opt.key ? '#7C3AED' : C.TEXT }]}>{opt.label}</Text>
                <Text style={{ fontSize: 11, color: C.TEXT_LIGHT }}>{opt.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Chọn mode */}
          <Text style={[styles.presetLabel, { color: C.TEXT_SECONDARY, marginBottom: 8 }]}>Hình thức luyện tập:</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 18 }}>
            <TouchableOpacity
              style={[styles.roleChip, { backgroundColor: C.CARD, borderColor: mode === 'voice' ? '#7C3AED' : C.BORDER }, mode === 'voice' && { borderWidth: 2 }]}
              onPress={() => setMode('voice')}
            >
              <Ionicons name="mic-outline" size={20} color={mode === 'voice' ? '#7C3AED' : C.TEXT_LIGHT} />
              <Text style={[styles.roleLabel, { color: mode === 'voice' ? '#7C3AED' : C.TEXT }]}>Giọng nói</Text>
              <Text style={{ fontSize: 11, color: C.TEXT_LIGHT }}>AI nói, bạn nói</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleChip, { backgroundColor: C.CARD, borderColor: mode === 'text' ? '#7C3AED' : C.BORDER }, mode === 'text' && { borderWidth: 2 }]}
              onPress={() => setMode('text')}
            >
              <Ionicons name="chatbox-outline" size={20} color={mode === 'text' ? '#7C3AED' : C.TEXT_LIGHT} />
              <Text style={[styles.roleLabel, { color: mode === 'text' ? '#7C3AED' : C.TEXT }]}>Nhắn tin</Text>
              <Text style={{ fontSize: 11, color: C.TEXT_LIGHT }}>Gõ text qua lại</Text>
            </TouchableOpacity>
          </View>

          {/* Chọn giọng nói (chỉ hiện khi mode voice) */}
          {mode === 'voice' && (<>
            <TouchableOpacity
              style={[styles.voicePickerBtn, { backgroundColor: C.CARD, borderColor: C.BORDER }]}
              onPress={() => setShowVoicePicker(!showVoicePicker)}
            >
              <Ionicons name="volume-medium-outline" size={18} color="#7C3AED" />
              <Text style={[{ flex: 1, fontSize: 14, color: C.TEXT }]}>Giọng AI: {voice.label}</Text>
              <Ionicons name={showVoicePicker ? 'chevron-up' : 'chevron-down'} size={16} color={C.TEXT_LIGHT} />
            </TouchableOpacity>
            {showVoicePicker && (
              <View style={[styles.voiceList, { backgroundColor: C.CARD, borderColor: C.BORDER }]}>
                {VOICE_OPTIONS.map(v => (
                  <TouchableOpacity
                    key={v.id}
                    style={[styles.voiceItem, voice.id === v.id && { backgroundColor: '#7C3AED10' }]}
                    onPress={() => handleVoiceSelect(v)}
                  >
                    <Ionicons
                      name={voice.id === v.id ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={voice.id === v.id ? '#7C3AED' : C.TEXT_LIGHT}
                    />
                    <Text style={[{ fontSize: 14, color: voice.id === v.id ? '#7C3AED' : C.TEXT }]}>{v.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>)}

          {/* Scenario input */}
          <View style={[styles.setupInput, { backgroundColor: C.CARD, borderColor: C.BORDER, marginTop: 16 }]}>
            <TextInput
              style={[styles.setupTextInput, { color: C.TEXT }]}
              placeholder="VD: Khách là giám đốc, 45 tuổi, nghe giá xong nói để suy nghĩ..."
              placeholderTextColor={C.TEXT_LIGHT}
              value={scenario}
              onChangeText={setScenario}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.setupMicBtn, isSetupRecording && { backgroundColor: '#DC2626' }]}
              onPress={handleSetupVoice}
              disabled={isTranscribing}
            >
              {isTranscribing ? <ActivityIndicator size="small" color="#fff" /> :
                <Ionicons name={isSetupRecording ? 'stop' : 'mic'} size={18} color="#fff" />}
            </TouchableOpacity>
          </View>

          <Text style={[styles.presetLabel, { color: C.TEXT_SECONDARY }]}>Hoặc chọn mẫu:</Text>
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
            {isAIThinking ? <ActivityIndicator color="#fff" /> : (
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
                    <Ionicons name={aiRoleIcon as any} size={14} color="#7C3AED" />
                  </View>
                )}
                <View style={[
                  styles.bubble,
                  item.role === 'user'
                    ? [styles.bubbleUser, { backgroundColor: C.PRIMARY }]
                    : [styles.bubbleAI, { backgroundColor: C.CARD }],
                ]}>
                  {item.role === 'assistant' && (
                    <Text style={{ fontSize: 10, color: '#7C3AED', fontWeight: '700', marginBottom: 4 }}>{aiRoleLabel}</Text>
                  )}
                  <Text style={[styles.bubbleText, item.role === 'user' ? { color: '#fff' } : { color: C.TEXT }]}>
                    {item.content}
                  </Text>
                </View>
              </View>
            )}
            contentContainerStyle={styles.chatList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListFooterComponent={isAIThinking ? (
              <View style={styles.thinkingRow}>
                <ActivityIndicator size="small" color="#7C3AED" />
                <Text style={[styles.thinkingText, { color: C.TEXT_LIGHT }]}>{aiRoleLabel} đang nghĩ...</Text>
              </View>
            ) : null}
          />

          {(isTranscribing || isSpeakingState) && (
            <View style={[styles.statusBar, { backgroundColor: C.CARD, borderTopColor: C.BORDER }]}>
              <ActivityIndicator size="small" color="#7C3AED" />
              <Text style={[styles.statusText, { color: '#7C3AED' }]}>
                {isTranscribing ? 'Đang nhận diện giọng nói...' : `${aiRoleLabel} đang nói...`}
              </Text>
              {isSpeakingState && (
                <TouchableOpacity onPress={() => { stopSpeaking(); setIsSpeakingState(false); }}>
                  <Ionicons name="stop-circle" size={22} color="#DC2626" />
                </TouchableOpacity>
              )}
            </View>
          )}

          {mode === 'voice' ? (
            <View style={[styles.micBar, { backgroundColor: C.CARD, borderTopColor: C.BORDER }]}>
              <TouchableOpacity
                style={[
                  styles.bigMicBtn,
                  isRecording ? { backgroundColor: '#DC2626' } : { backgroundColor: '#7C3AED' },
                  (isTranscribing || isAIThinking || isSpeakingState) && { opacity: 0.4 },
                ]}
                onPress={handleMicPress}
                disabled={isTranscribing || isAIThinking || isSpeakingState}
              >
                <Ionicons name={isRecording ? 'stop' : 'mic'} size={32} color="#fff" />
              </TouchableOpacity>
              <Text style={[styles.micHint, { color: C.TEXT_LIGHT }]}>
                {isRecording ? 'Đang nghe... Nhấn để dừng' :
                 isSpeakingState ? `Đợi ${aiRoleLabel.toLowerCase()} nói xong...` :
                 'Nhấn mic để trả lời'}
              </Text>
            </View>
          ) : (
            <View style={[styles.textBar, { backgroundColor: C.CARD, borderTopColor: C.BORDER }]}>
              <TextInput
                style={[styles.textBarInput, { backgroundColor: C.SURFACE, color: C.TEXT, borderColor: C.BORDER }]}
                placeholder="Nhập câu trả lời..."
                placeholderTextColor={C.TEXT_LIGHT}
                value={textInput}
                onChangeText={setTextInput}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[styles.textBarSend, { backgroundColor: '#7C3AED' }, (!textInput.trim() || isAIThinking) && { opacity: 0.4 }]}
                onPress={sendTextMessage}
                disabled={!textInput.trim() || isAIThinking}
              >
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* ─── Feedback Phase ──────────────────────────────────────── */}
      {phase === 'feedback' && !viewingSession && (
        <ScrollView contentContainerStyle={styles.feedbackScroll}>
          {isFeedbackLoading ? (
            <View style={styles.feedbackLoading}>
              <ActivityIndicator size="large" color="#7C3AED" />
              <Text style={[styles.feedbackLoadingText, { color: C.TEXT_LIGHT }]}>Coach Duy Nguyễn đang đánh giá...</Text>
            </View>
          ) : (
            <>
              <View style={[styles.feedbackCard, { backgroundColor: C.CARD }]}>
                <Markdown style={mdStyles}>{feedbackResult}</Markdown>
              </View>
              <View style={styles.feedbackActions}>
                <TouchableOpacity style={[styles.feedbackBtn, { backgroundColor: '#7C3AED' }]} onPress={resetAll}>
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
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  headerIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  headerBackBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  headerSub: { fontSize: 12, marginTop: 2 },
  historyBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  endBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },

  // Setup
  setupScroll: { padding: 20, paddingBottom: 40 },
  setupTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  roleChip: {
    flex: 1, alignItems: 'center', gap: 6,
    paddingVertical: 14, borderRadius: 14, borderWidth: 1,
  },
  roleLabel: { fontSize: 13, fontWeight: '700' },
  voicePickerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, borderWidth: 1,
  },
  voiceList: { borderWidth: 1, borderRadius: 12, marginTop: 6, overflow: 'hidden' },
  voiceItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12 },
  setupInput: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 16, flexDirection: 'row' },
  setupTextInput: { flex: 1, fontSize: 15, lineHeight: 22, minHeight: 70, textAlignVertical: 'top' },
  setupMicBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' },
  presetLabel: { fontSize: 13, fontWeight: '600', marginBottom: 10 },
  presetWrap: { gap: 8, marginBottom: 24 },
  presetChip: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  presetText: { fontSize: 14, lineHeight: 20 },
  startBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#7C3AED', borderRadius: 16, paddingVertical: 18 },
  startBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },

  // History
  historyCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14, gap: 12 },
  historyScenario: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  historyMeta: { fontSize: 12 },
  emptyText: { fontSize: 14, textAlign: 'center', marginTop: 40 },

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
  textBar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1 },
  textBarInput: { flex: 1, borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 100 },
  textBarSend: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },

  // Feedback
  feedbackScroll: { padding: 20, paddingBottom: 40 },
  feedbackLoading: { alignItems: 'center', paddingTop: 60, gap: 16 },
  feedbackLoadingText: { fontSize: 15, fontStyle: 'italic' },
  feedbackCard: { borderRadius: 16, padding: 20, marginBottom: 16 },
  feedbackActions: { gap: 10 },
  feedbackBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14 },
  feedbackBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
