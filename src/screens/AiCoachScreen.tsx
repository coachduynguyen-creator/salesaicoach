import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Markdown from 'react-native-markdown-display';
import { COLORS } from '../constants/colors';
import { useColors } from '../contexts/ThemeContext';
import { streamChatWithCoach, transcribeAudio, ChatMessage } from '../services/aiService';
import { startRecording, stopRecording } from '../services/audioService';
import { QUICK_SUGGESTIONS } from '../constants/knowledgeBase';
import { useKnowledge } from '../contexts/KnowledgeContext';
import { useBusiness } from '../contexts/BusinessContext';
import {
  ConversationMessage,
  loadConversations,
  updateConversation,
  loadCustomers,
  loadSessions,
  CustomerProfile,
} from '../services/storageService';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toStorageMsg = (m: Message): ConversationMessage => ({
  id: m.id,
  role: m.role,
  content: m.content,
  timestamp: m.timestamp.toISOString(),
});

const fromStorageMsg = (m: ConversationMessage): Message => ({
  id: m.id,
  role: m.role,
  content: m.content,
  timestamp: new Date(m.timestamp),
});

// ─── Bubble Component ─────────────────────────────────────────────────────────

function MessageBubble({ message, streaming }: { message: Message; streaming?: boolean }) {
  const C = useColors();
  const isUser = message.role === 'user';
  const timeStr = message.timestamp.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Khi đang streaming và chưa có nội dung, hiện indicator
  if (streaming && !message.content) {
    return (
      <View style={[styles.bubbleRow, styles.bubbleRowAI]}>
        <View style={[styles.aiAvatar, { backgroundColor: C.PRIMARY }]}>
          <Ionicons name="chatbubbles" size={14} color="#fff" />
        </View>
        <View style={[styles.bubble, styles.bubbleAI, styles.typingBubble]}>
          <ActivityIndicator size="small" color={COLORS.TEXT_LIGHT} />
          <Text style={styles.typingText}>Đang suy nghĩ...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.bubbleRow, isUser ? styles.bubbleRowUser : styles.bubbleRowAI]}>
      {!isUser && (
        <View style={[styles.aiAvatar, { backgroundColor: C.PRIMARY }]}>
          <Ionicons name="chatbubbles" size={14} color="#fff" />
        </View>
      )}
      <View style={[styles.bubble, isUser ? [styles.bubbleUser, { backgroundColor: C.PRIMARY }] : styles.bubbleAI]}>
        {isUser ? (
          <Text style={[styles.bubbleText, styles.bubbleTextUser]}>
            {message.content}
          </Text>
        ) : streaming ? (
          <Text style={[styles.bubbleText, styles.bubbleTextAI, { color: C.TEXT }]}>
            {message.content}
            <Text style={{ color: C.PRIMARY }}>{'▍'}</Text>
          </Text>
        ) : (
          <Markdown style={getMdStyles(C)}>{message.content}</Markdown>
        )}
        {!streaming && (
          <Text style={[styles.bubbleTime, isUser ? styles.bubbleTimeUser : styles.bubbleTimeAI]}>
            {timeStr}
          </Text>
        )}
      </View>
    </View>
  );
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  const C = useColors();
  return (
    <View style={[styles.bubbleRow, styles.bubbleRowAI]}>
      <View style={[styles.aiAvatar, { backgroundColor: C.PRIMARY }]}>
        <Ionicons name="chatbubbles" size={14} color="#fff" />
      </View>
      <View style={[styles.bubble, styles.bubbleAI, styles.typingBubble]}>
        <ActivityIndicator size="small" color={COLORS.TEXT_LIGHT} />
        <Text style={styles.typingText}>AI Coach đang soạn...</Text>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

const WELCOME_CONTENT = `Chào bạn!\n\nDuy đây — người xây dựng phương pháp "Bán bằng vị thế" và chương trình THE TRUSTED ADVISOR.\n\nDuy có thể giúp bạn xây dựng vị thế cố vấn tin cậy, dẫn dắt khách hàng cao cấp qua 3 Điểm Chạm, xử lý tình huống khó, viết kịch bản và tin nhắn có thể dùng ngay.\n\nBạn đang quan tâm điều gì nhất? Cứ hỏi thẳng.`;

const makeWelcome = (): Message => ({
  id: 'welcome',
  role: 'assistant',
  content: WELCOME_CONTENT,
  timestamp: new Date(),
});

export default function AiCoachScreen() {
  const C = useColors();
  const { knowledgeBase } = useKnowledge();
  const { businessContext } = useBusiness();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const conversationId: string | undefined = route.params?.conversationId;
  const conversationTitle: string | undefined = route.params?.title;
  const customerId: string | undefined = route.params?.customerId;

  const [messages, setMessages] = useState<Message[]>([makeWelcome()]);
  const [customerContext, setCustomerContext] = useState('');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const streamingMsgId = useRef<string | null>(null);

  // Load customer profile nếu có
  useEffect(() => {
    // Tìm customerId từ: route params → conversation data → title matching
    const resolveCustomer = async () => {
      const all = await loadCustomers();

      // 1. Từ route params
      if (customerId) {
        const found = all.find(c => c.id === customerId);
        if (found) return found;
      }

      // 2. Từ conversation data
      if (conversationId) {
        const convs = await loadConversations();
        const conv = convs.find(c => c.id === conversationId);
        if (conv?.customerId) {
          const found = all.find(c => c.id === conv.customerId);
          if (found) return found;
        }
      }

      // 3. Từ title matching (fallback)
      if (conversationTitle) {
        const titleLower = conversationTitle.toLowerCase();
        const found = all.find(c => titleLower.includes(c.name.toLowerCase()));
        if (found) return found;
      }

      return null;
    };

    resolveCustomer().then(async (customer) => {
      if (!customer) return;
      if (!customer) return;

      const parts: string[] = [
        `\n\n---\nTHÔNG TIN KHÁCH HÀNG ĐANG TƯ VẤN:`,
        `Tên: ${customer.name}`,
      ];
      if (customer.company) parts.push(`Công ty: ${customer.company}`);
      if (customer.needs) parts.push(`Nhu cầu: ${customer.needs}`);
      if (customer.budget) parts.push(`Ngân sách: ${customer.budget}`);
      if (customer.concerns) parts.push(`Lo ngại/phản đối: ${customer.concerns}`);
      if (customer.stage) parts.push(`Giai đoạn: ${customer.stage}`);
      if (customer.decisionFactors) parts.push(`Yếu tố quyết định: ${customer.decisionFactors}`);
      if (customer.personality) parts.push(`Tính cách giao tiếp: ${customer.personality}`);
      if (customer.nextStep) parts.push(`Bước tiếp theo: ${customer.nextStep}`);
      // Chân dung khách hàng
      const icp = customer.icp || {};
      if (icp.painPoints) parts.push(`Vấn đề đang gặp: ${icp.painPoints}`);
      if (icp.buyingTriggers) parts.push(`Yếu tố thúc đẩy mua: ${icp.buyingTriggers}`);
      if (icp.buyingBarriers) parts.push(`Rào cản mua hàng: ${icp.buyingBarriers}`);
      if (icp.awarenessLevel) parts.push(`Mức độ nhận thức: ${icp.awarenessLevel}/5`);
      if (icp.fitLevel) parts.push(`Mức độ phù hợp: ${icp.fitLevel}`);

      // Decision makers
      if (customer.decisionMakers?.length) {
        parts.push(`\nNGƯỜI RA QUYẾT ĐỊNH:`);
        customer.decisionMakers.forEach(d => parts.push(`- ${d.name} (${d.role}) - ${d.attitude}`));
      }

      // Ghi chú
      if (customer.notes?.length) {
        parts.push(`\nLỊCH SỬ GHI CHÚ:`);
        customer.notes.slice(-5).forEach(n => parts.push(`[${n.date}] ${n.content}`));
      }

      // Transcripts từ sessions
      const allSessions = await loadSessions();
      const custSessions = allSessions.filter(s => (customer.sessionIds || []).includes(s.id));
      if (custSessions.length) {
        parts.push(`\nLỊCH SỬ CUỘC GỌI (${custSessions.length} buổi):`);
        custSessions.slice(-3).forEach(s => {
          parts.push(`[${s.date}] Điểm: ${s.score}/10`);
          if (s.analysis?.transcript) {
            parts.push(`Nội dung: ${s.analysis.transcript.slice(0, 500)}`);
          }
          if (s.analysis?.improvements?.length) {
            parts.push(`Cần cải thiện: ${(s.analysis.improvements as string[]).slice(0, 3).join('; ')}`);
          }
        });
      }

      parts.push(`\nHãy tư vấn dựa trên TOÀN BỘ thông tin khách hàng ở trên. Khi sales hỏi về khách, trả lời chi tiết dựa trên dữ liệu thật. Nếu thiếu thông tin, gợi ý sales hỏi thêm khách điều gì.`);
      setCustomerContext(parts.join('\n'));

      // Thay welcome message cho phù hợp
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Duy đã xem hồ sơ của **${customer.name}**${customer.company ? ` (${customer.company})` : ''}.\n\n${customer.stage ? `Khách đang ở giai đoạn: **${customer.stage}**.\n` : ''}${customer.needs ? `Nhu cầu chính: ${customer.needs}\n` : ''}${customer.concerns ? `Lo ngại: ${customer.concerns}\n` : ''}\nBạn muốn trao đổi gì về khách này? Duy sẽ tư vấn dựa trên toàn bộ dữ liệu đã có.`,
        timestamp: new Date(),
      }]);
    });
  }, [customerId, conversationId, conversationTitle]);

  // Load tin nhắn cũ khi mở conversation
  useEffect(() => {
    if (!conversationId) return;
    loadConversations().then(convs => {
      const conv = convs.find(c => c.id === conversationId);
      if (conv && conv.messages.length > 0) {
        setMessages([makeWelcome(), ...conv.messages.map(fromStorageMsg)]);
        setShowSuggestions(false);
      }
    });
  }, [conversationId]);

  // Auto-save tin nhắn (bỏ welcome message)
  const saveMessages = useCallback(async (msgs: Message[]) => {
    if (!conversationId) return;
    const toSave = msgs.filter(m => m.id !== 'welcome').map(toStorageMsg);
    await updateConversation(conversationId, toSave);
  }, [conversationId]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    setInputText('');
    setShowSuggestions(false);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    const aiMsgId = (Date.now() + 1).toString();
    const aiMsg: Message = {
      id: aiMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };

    const updatedWithUser = [...messages, userMsg];
    setMessages([...updatedWithUser, aiMsg]);
    setIsTyping(true);
    setIsStreaming(true);
    streamingMsgId.current = aiMsgId;
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const history: ChatMessage[] = updatedWithUser
        .filter(m => m.id !== 'welcome')
        .slice(-10)
        .map(m => ({ role: m.role, content: m.content }));

      const fullText = await streamChatWithCoach(
        history,
        knowledgeBase + businessContext + customerContext,
        (textSoFar) => {
          setMessages(prev =>
            prev.map(m => m.id === aiMsgId ? { ...m, content: textSoFar } : m)
          );
          flatListRef.current?.scrollToEnd({ animated: false });
        },
      );

      const finalMessages = updatedWithUser.concat({
        ...aiMsg,
        content: fullText,
      });
      setMessages(finalMessages);
      await saveMessages(finalMessages);
    } catch {
      setMessages(prev =>
        prev.map(m => m.id === aiMsgId
          ? { ...m, content: 'Có lỗi xảy ra. Vui lòng kiểm tra kết nối mạng rồi thử lại nhé.' }
          : m)
      );
    } finally {
      setIsTyping(false);
      setIsStreaming(false);
      streamingMsgId.current = null;
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages, isTyping, knowledgeBase, businessContext, saveMessages]);

  const handleSuggestion = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleVoice = async () => {
    if (isRecording) {
      // Dừng ghi âm → chuyển thành text
      try {
        setIsRecording(false);
        setIsTranscribing(true);
        const result = await stopRecording();
        const text = await transcribeAudio(result.uri);
        setIsTranscribing(false);
        if (text && text.trim()) {
          sendMessage(text.trim());
        }
      } catch {
        setIsTranscribing(false);
      }
    } else {
      // Bắt đầu ghi âm
      try {
        await startRecording();
        setIsRecording(true);
      } catch {
        // Permission denied hoặc lỗi khác
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.BACKGROUND }]} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: C.CARD, borderBottomColor: C.BORDER }]}>
        {conversationId && (
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={C.TEXT} />
          </TouchableOpacity>
        )}
        <View style={styles.headerLeft}>
          <View style={[styles.headerAvatar, { backgroundColor: C.PRIMARY }]}>
            <Ionicons name="chatbubbles" size={20} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: C.TEXT }]} numberOfLines={1}>
              {conversationTitle || 'AI Sales Coach'}
            </Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Sẵn sàng hỗ trợ</Text>
            </View>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              streaming={isStreaming && item.id === streamingMsgId.current}
            />
          )}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {/* Quick Suggestions */}
        {showSuggestions && (
          <View style={styles.suggestionsWrap}>
            <Text style={styles.suggestionsLabel}>Câu hỏi gợi ý:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestionsScroll}
            >
              {QUICK_SUGGESTIONS.map((s, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.suggestionChip, { backgroundColor: C.PRIMARY + '10', borderColor: C.PRIMARY + '20' }]}
                  onPress={() => handleSuggestion(s)}
                >
                  <Text style={[styles.suggestionText, { color: C.PRIMARY }]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Transcribing indicator */}
        {isTranscribing && (
          <View style={styles.transcribingBar}>
            <ActivityIndicator size="small" color={C.PRIMARY} />
            <Text style={[styles.transcribingText, { color: C.PRIMARY }]}>Đang chuyển giọng nói...</Text>
          </View>
        )}

        {/* Input Bar */}
        <View style={[styles.inputBar, { backgroundColor: C.CARD, borderTopColor: C.BORDER }]}>
          {/* Mic button */}
          <TouchableOpacity
            style={[
              styles.micBtn,
              isRecording && { backgroundColor: COLORS.DANGER },
              !isRecording && { backgroundColor: C.PRIMARY + '15' },
            ]}
            onPress={handleVoice}
            disabled={isTyping || isStreaming || isTranscribing}
          >
            <Ionicons
              name={isRecording ? 'stop' : 'mic'}
              size={22}
              color={isRecording ? '#fff' : C.PRIMARY}
            />
          </TouchableOpacity>

          <View style={[styles.inputWrap, isRecording && { borderColor: COLORS.DANGER }]}>
            {isRecording ? (
              <Text style={styles.recordingHint}>Đang nghe... Nhấn nút đỏ để dừng</Text>
            ) : (
              <TextInput
                style={[styles.input, { color: C.TEXT }]}
                placeholder="Nhắn tin hoặc nhấn mic để nói..."
                placeholderTextColor={COLORS.TEXT_LIGHT}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
                returnKeyType="default"
              />
            )}
          </View>

          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: C.PRIMARY }, (!inputText.trim() || isTyping || isStreaming || isRecording) && styles.sendBtnDisabled]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isTyping || isStreaming || isRecording}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Markdown Styles ─────────────────────────────────────────────────────────

function getMdStyles(colors: any) {
  return StyleSheet.create({
    body: { fontSize: 14, lineHeight: 22, color: colors.TEXT },
    heading1: { fontSize: 17, fontWeight: '800', color: colors.PRIMARY, marginBottom: 6, marginTop: 10 },
    heading2: { fontSize: 15, fontWeight: '700', color: colors.PRIMARY, marginBottom: 4, marginTop: 8 },
    heading3: { fontSize: 14, fontWeight: '700', color: colors.TEXT, marginBottom: 4, marginTop: 6 },
    strong: { fontWeight: '700', color: colors.TEXT },
    em: { fontStyle: 'italic' },
    paragraph: { marginBottom: 6, marginTop: 0 },
    bullet_list: { marginBottom: 4 },
    ordered_list: { marginBottom: 4 },
    list_item: { marginBottom: 2 },
    blockquote: {
      backgroundColor: colors.PRIMARY + '10',
      borderLeftWidth: 3,
      borderLeftColor: colors.PRIMARY,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginVertical: 6,
      borderRadius: 8,
    },
    hr: { backgroundColor: colors.BORDER, height: 1, marginVertical: 10 },
  });
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.CARD,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.SUCCESS,
  },
  onlineText: {
    fontSize: 12,
    color: COLORS.SUCCESS,
    fontWeight: '500',
  },
  messageList: {
    padding: 16,
    paddingBottom: 8,
    gap: 12,
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  bubbleRowUser: {
    justifyContent: 'flex-end',
  },
  bubbleRowAI: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginBottom: 4,
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bubbleUser: {
    backgroundColor: COLORS.PRIMARY,
    borderBottomRightRadius: 6,
  },
  bubbleAI: {
    backgroundColor: COLORS.CARD,
    borderBottomLeftRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 21,
  },
  bubbleTextUser: {
    color: '#fff',
  },
  bubbleTextAI: {
  },
  bubbleTime: {
    fontSize: 10,
    marginTop: 4,
  },
  bubbleTimeUser: {
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'right',
  },
  bubbleTimeAI: {
    color: COLORS.TEXT_LIGHT,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  typingText: {
    fontSize: 13,
    color: COLORS.TEXT_LIGHT,
    fontStyle: 'italic',
  },
  suggestionsWrap: {
    backgroundColor: COLORS.CARD,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    paddingVertical: 10,
  },
  suggestionsLabel: {
    fontSize: 11,
    color: COLORS.TEXT_LIGHT,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  suggestionsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: COLORS.PRIMARY + '10',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY + '20',
  },
  suggestionText: {
    fontSize: 13,
    color: COLORS.PRIMARY,
    fontWeight: '500',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.CARD,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    gap: 10,
  },
  inputWrap: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 120,
    minHeight: 44,
    justifyContent: 'center',
  },
  input: {
    fontSize: 15,
    lineHeight: 20,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.BORDER,
    opacity: 0.5,
  },
  micBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  recordingHint: {
    fontSize: 14,
    color: COLORS.DANGER,
    fontWeight: '500' as const,
    fontStyle: 'italic' as const,
  },
  transcribingBar: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: COLORS.CARD,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  transcribingText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
});
