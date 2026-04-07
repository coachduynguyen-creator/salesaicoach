import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Markdown from 'react-native-markdown-display';
import { COLORS } from '../constants/colors';
import { useColors } from '../contexts/ThemeContext';
import { chatWithCoach } from '../services/aiService';
import { SALES_KNOWLEDGE_BASE } from '../constants/knowledgeBase';

type ToolType = 'precall' | 'postcall' | 'roleplay' | 'objection';

const TOOLS: Record<ToolType, { title: string; icon: string; color: string; placeholder: string; prompt: string }> = {
  precall: {
    title: 'Chuẩn bị trước buổi gặp',
    icon: 'clipboard-outline',
    color: '#2563EB',
    placeholder: 'Nhập thông tin khách: tên, ngành, lần gặp trước nói gì, mục tiêu buổi này...',
    prompt: `Với vai trò Coach Duy Nguyễn, hãy tạo briefing chuẩn bị trước buổi tư vấn:

1. Phân tích tâm lý khách (dựa trên info): dự đoán nỗi sợ, phong cách quyết định
2. 5 câu hỏi mở cần hỏi (theo 3 Điểm Chạm)
3. Kịch bản mở đầu 30 giây đầu tiên
4. Cảnh báo lỗi cần tránh
5. Quy trình Neo vững 5 phút trước buổi gặp

Thông tin khách:`,
  },
  postcall: {
    title: 'Tóm tắt sau buổi gặp',
    icon: 'document-text-outline',
    color: '#059669',
    placeholder: 'Paste nội dung buổi tư vấn hoặc ghi chú nhanh: khách nói gì, mình nói gì, kết quả...',
    prompt: `Hãy tóm tắt buổi tư vấn và tạo action plan:

1. Tóm tắt 3-5 điểm chính
2. Điểm Chạm nào đã hoàn thành, điểm nào chưa
3. Nỗi sợ/rào cản khách đang có
4. 3 action items cụ thể (ai làm gì, deadline)
5. Nội dung tin nhắn follow-up 24h

Nội dung buổi tư vấn:`,
  },
  roleplay: {
    title: 'Luyện đối đáp với AI',
    icon: 'chatbubbles-outline',
    color: '#7C3AED',
    placeholder: 'Mô tả tình huống: VD "Khách là giám đốc IT, 45 tuổi, đang dùng giải pháp đối thủ, nghe giá xong nói để suy nghĩ"',
    prompt: `Đóng vai khách hàng trong tình huống dưới đây. Hãy phản ứng THẬT như khách thật:

- Trả lời ngắn gọn, tự nhiên (không giải thích lý thuyết)
- Có thể từ chối, hỏi ngược, im lặng
- Nếu sales hỏi đúng câu → mở lòng dần
- Nếu sales bán hàng truyền thống → phòng thủ hơn
- Cuối cùng đưa feedback: sales đã làm tốt/chưa tốt gì

Tình huống:`,
  },
  objection: {
    title: 'Xử lý phản đối',
    icon: 'shield-checkmark-outline',
    color: '#DC2626',
    placeholder: 'Nhập câu phản đối của khách: VD "Giá cao quá", "Để suy nghĩ thêm", "Bên kia rẻ hơn"...',
    prompt: `Với vai trò Coach Duy Nguyễn, phân tích câu phản đối và đưa hướng xử lý theo REFLECT:

1. Phân tích: nỗi sợ thật đằng sau câu nói này là gì?
2. Điểm Chạm nào chưa hoàn tất?
3. Cách phản chiếu đúng (câu nói cụ thể)
4. Cách phản chiếu SAI (ví dụ thường gặp)
5. Kịch bản đối thoại mẫu (3-4 lượt trao đổi)

Câu phản đối:`,
  },
};

type RouteParams = { AITools: { tool: ToolType } };

export default function AIToolsScreen() {
  const C = useColors();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'AITools'>>();
  const toolType = route.params?.tool || 'precall';
  const tool = TOOLS[toolType];

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult('');
    try {
      const response = await chatWithCoach(
        [{ role: 'user', content: tool.prompt + '\n\n' + input }],
        SALES_KNOWLEDGE_BASE
      );
      setResult(response);
    } catch {
      setResult('Không thể xử lý. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const mdStyles = StyleSheet.create({
    body: { fontSize: 14, color: C.TEXT, lineHeight: 22 },
    strong: { fontWeight: '700' },
    heading2: { fontSize: 16, fontWeight: '700', color: C.TEXT, marginTop: 12, marginBottom: 6 },
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.BACKGROUND }]} edges={['top']}>
      <View style={[styles.topBar, { backgroundColor: C.CARD, borderBottomColor: C.BORDER }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: C.SURFACE }]}>
          <Ionicons name="arrow-back" size={22} color={C.TEXT} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: C.TEXT }]}>{tool.title}</Text>
        {result ? (
          <TouchableOpacity onPress={() => Share.share({ message: result })} style={[styles.backBtn, { backgroundColor: C.SURFACE }]}>
            <Ionicons name="share-outline" size={20} color={C.TEXT} />
          </TouchableOpacity>
        ) : <View style={{ width: 40 }} />}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {!result ? (
          <>
            <View style={[styles.heroTag, { backgroundColor: tool.color + '12' }]}>
              <Ionicons name={tool.icon as any} size={20} color={tool.color} />
              <Text style={[styles.heroTagText, { color: tool.color }]}>{tool.title}</Text>
            </View>

            <TextInput
              style={[styles.textArea, { backgroundColor: C.CARD, color: C.TEXT, borderColor: C.BORDER }]}
              placeholder={tool.placeholder}
              placeholderTextColor={C.TEXT_LIGHT}
              value={input}
              onChangeText={setInput}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.btn, { backgroundColor: tool.color }]}
              onPress={handleGenerate}
              disabled={loading || !input.trim()}
            >
              {loading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Ionicons name="sparkles" size={18} color="#fff" />
                  <Text style={styles.btnText}>AI Phân tích</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={[styles.resultCard, { backgroundColor: C.CARD }]}>
              <Markdown style={mdStyles}>{result}</Markdown>
            </View>
            <TouchableOpacity style={[styles.btn, { backgroundColor: C.CARD, borderWidth: 1, borderColor: C.BORDER }]} onPress={() => setResult('')}>
              <Ionicons name="refresh" size={18} color={C.TEXT} />
              <Text style={[styles.btnText, { color: C.TEXT }]}>Thử lại</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: COLORS.SURFACE },
  topBarTitle: { fontSize: 15, fontWeight: '600', flex: 1, textAlign: 'center' },
  scroll: { padding: 16, paddingBottom: 40 },
  heroTag: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginBottom: 16 },
  heroTagText: { fontSize: 13, fontWeight: '700' },
  textArea: { borderWidth: 1, borderRadius: 14, padding: 16, fontSize: 14, minHeight: 140, marginBottom: 16, lineHeight: 22 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  resultCard: { borderRadius: 14, padding: 16, marginBottom: 14 },
});
