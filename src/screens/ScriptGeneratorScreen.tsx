import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, Share, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Markdown from 'react-native-markdown-display';
import { COLORS } from '../constants/colors';
import { useColors } from '../contexts/ThemeContext';
import { chatWithCoach } from '../services/aiService';
import { SALES_KNOWLEDGE_BASE } from '../constants/knowledgeBase';

const SCENARIOS = [
  { key: 'cold_call', label: 'Gọi lạnh', icon: 'call-outline' },
  { key: 'follow_up', label: 'Theo dõi sau', icon: 'refresh-outline' },
  { key: 'objection', label: 'Xử lý từ chối', icon: 'shield-outline' },
  { key: 'closing', label: 'Chốt deal', icon: 'checkmark-done-outline' },
  { key: 'referral', label: 'Xin giới thiệu', icon: 'people-outline' },
  { key: 'reactivate', label: 'Kích hoạt lại', icon: 'arrow-redo-outline' },
];

export default function ScriptGeneratorScreen() {
  const C = useColors();
  const navigation = useNavigation();
  const [customerName, setCustomerName] = useState('');
  const [industry, setIndustry] = useState('');
  const [scenario, setScenario] = useState('cold_call');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleGenerate = async () => {
    if (!customerName.trim()) return;
    setLoading(true);
    setResult('');
    try {
      const prompt = `Tạo kịch bản tư vấn theo phương pháp THE TRUSTED ADVISOR cho tình huống sau:

Tên khách hàng: ${customerName}
Ngành nghề: ${industry || 'Chưa rõ'}
Tình huống: ${SCENARIOS.find(s => s.key === scenario)?.label || scenario}
Bối cảnh thêm: ${context || 'Không có'}

Yêu cầu:
1. Viết kịch bản đối thoại cụ thể (Sales nói gì, dự đoán khách trả lời gì)
2. Áp dụng 3 Điểm Chạm: Động Lực → Điểm Nghẽn → Con Đường
3. Gợi ý 3-5 câu hỏi mở hay nhất cho tình huống này
4. Cảnh báo lỗi thường gặp
5. Đưa ra 2 phiên bản: ĐÚNG và SAI

Trình bày dễ đọc, có heading, bullet points.`;

      const response = await chatWithCoach(
        [{ role: 'user', content: prompt }],
        SALES_KNOWLEDGE_BASE
      );
      setResult(response);
    } catch (err: any) {
      setResult('Không thể tạo kịch bản. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (result) Share.share({ message: result, title: `Kịch bản: ${customerName}` });
  };

  const mdStyles = StyleSheet.create({
    body: { fontSize: 14, color: C.TEXT, lineHeight: 22 },
    strong: { fontWeight: '700' },
    heading2: { fontSize: 16, fontWeight: '700', color: C.TEXT, marginTop: 12, marginBottom: 6 },
    heading3: { fontSize: 14, fontWeight: '700', color: C.PRIMARY, marginTop: 10, marginBottom: 4 },
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.BACKGROUND }]} edges={['top']}>
      <View style={[styles.topBar, { backgroundColor: C.CARD, borderBottomColor: C.BORDER }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: C.SURFACE }]}>
          <Ionicons name="arrow-back" size={22} color={C.TEXT} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: C.TEXT }]}>Tạo kịch bản</Text>
        {result ? (
          <TouchableOpacity onPress={handleShare} style={[styles.backBtn, { backgroundColor: C.SURFACE }]}>
            <Ionicons name="share-outline" size={20} color={C.TEXT} />
          </TouchableOpacity>
        ) : <View style={{ width: 40 }} />}
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {!result ? (
          <>
            <View style={[styles.card, { backgroundColor: C.CARD }]}>
              <Text style={[styles.label, { color: C.TEXT_SECONDARY }]}>Tên khách hàng *</Text>
              <TextInput style={[styles.input, { color: C.TEXT, borderColor: C.BORDER }]} placeholder="VD: Anh Minh" placeholderTextColor={C.TEXT_LIGHT} value={customerName} onChangeText={setCustomerName} />

              <Text style={[styles.label, { color: C.TEXT_SECONDARY }]}>Ngành nghề</Text>
              <TextInput style={[styles.input, { color: C.TEXT, borderColor: C.BORDER }]} placeholder="VD: Bất động sản, Bảo hiểm..." placeholderTextColor={C.TEXT_LIGHT} value={industry} onChangeText={setIndustry} />

              <Text style={[styles.label, { color: C.TEXT_SECONDARY }]}>Tình huống</Text>
              <View style={styles.scenarioGrid}>
                {SCENARIOS.map(s => (
                  <TouchableOpacity
                    key={s.key}
                    style={[styles.scenarioBtn, { borderColor: C.BORDER }, scenario === s.key && { backgroundColor: C.PRIMARY + '15', borderColor: C.PRIMARY }]}
                    onPress={() => setScenario(s.key)}
                  >
                    <Ionicons name={s.icon as any} size={16} color={scenario === s.key ? C.PRIMARY : C.TEXT_LIGHT} />
                    <Text style={[styles.scenarioText, { color: C.TEXT_SECONDARY }, scenario === s.key && { color: C.PRIMARY, fontWeight: '700' }]}>{s.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: C.TEXT_SECONDARY }]}>Bối cảnh thêm</Text>
              <TextInput style={[styles.input, styles.textArea, { color: C.TEXT, borderColor: C.BORDER }]} placeholder="VD: Khách đã gặp 1 lần, nói giá cao..." placeholderTextColor={C.TEXT_LIGHT} value={context} onChangeText={setContext} multiline numberOfLines={3} />
            </View>

            <TouchableOpacity
              style={[styles.generateBtn, { backgroundColor: C.PRIMARY }]}
              onPress={handleGenerate}
              disabled={loading || !customerName.trim()}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={18} color="#fff" />
                  <Text style={styles.generateText}>Tạo kịch bản AI</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={[styles.card, { backgroundColor: C.CARD }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Ionicons name="document-text" size={18} color={C.PRIMARY} />
                <Text style={[styles.resultTitle, { color: C.TEXT }]}>Kịch bản: {customerName}</Text>
              </View>
              <Markdown style={mdStyles}>{result}</Markdown>
            </View>

            <TouchableOpacity
              style={[styles.generateBtn, { backgroundColor: C.CARD, borderWidth: 1, borderColor: C.BORDER }]}
              onPress={() => setResult('')}
            >
              <Ionicons name="refresh" size={18} color={C.TEXT} />
              <Text style={[styles.generateText, { color: C.TEXT }]}>Tạo kịch bản mới</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: COLORS.SURFACE },
  topBarTitle: { fontSize: 15, fontWeight: '600', flex: 1, textAlign: 'center' },
  scroll: { padding: 16, paddingBottom: 40 },
  card: { borderRadius: 14, padding: 16, marginBottom: 14 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6, marginTop: 10 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14 },
  textArea: { minHeight: 70, textAlignVertical: 'top' },
  scenarioGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  scenarioBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: COLORS.BORDER },
  scenarioText: { fontSize: 12, fontWeight: '500', color: COLORS.TEXT_SECONDARY },
  generateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14 },
  generateText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  resultTitle: { fontSize: 16, fontWeight: '700' },
});
