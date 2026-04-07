import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColors } from '../contexts/ThemeContext';
import { analyzeTranscript } from '../services/aiService';
import { SALES_KNOWLEDGE_BASE } from '../constants/knowledgeBase';

const FIRST_EXP_KEY = '@salescoach_first_exp_done';

const DEMO_TRANSCRIPT = `Sales: Chào anh Minh, em là Hương từ công ty ABC. Hôm nay em muốn giới thiệu giải pháp CRM mới nhất của bên em.

Khách: Ừ, tôi nghe rồi. Nói nhanh đi, tôi bận lắm.

Sales: Dạ vâng, bên em có gói CRM giá rất tốt, chỉ 5 triệu/tháng, có thể quản lý 1000 khách hàng, tích hợp email marketing, báo cáo tự động...

Khách: Giá cao quá. Bên kia có gói 2 triệu thôi.

Sales: Dạ nhưng bên em có nhiều tính năng hơn anh ạ. Bên kia không có báo cáo tự động đâu.

Khách: Để tôi nghĩ thêm đã.

Sales: Dạ vâng, anh nghĩ xong liên hệ em nhé. Em gửi anh brochure qua email ạ.`;

interface Props {
  onComplete: () => void;
}

export default function FirstExperienceScreen({ onComplete }: Props) {
  const C = useColors();
  const [step, setStep] = useState<'intro' | 'analyzing' | 'result'>('intro');
  const [result, setResult] = useState<any>(null);

  const handleDemo = async () => {
    setStep('analyzing');
    try {
      const analysis = await analyzeTranscript(DEMO_TRANSCRIPT, SALES_KNOWLEDGE_BASE);
      setResult(analysis);
      setStep('result');
    } catch {
      setResult({
        score: 4.5,
        summary: ['Sales tập trung vào sản phẩm thay vì vấn đề của khách', 'Không đặt câu hỏi khám phá', 'Kết thúc thụ động'],
        strengths: ['Lịch sự, chào hỏi đúng cách'],
        improvements: ['Cần hỏi vấn đề khách đang gặp trước khi giới thiệu', 'Khi khách nói "giá cao", cần hỏi "cao so với điều gì?"', 'Không kết thúc bằng "nghĩ xong liên hệ em"'],
      });
      setStep('result');
    }
  };

  const handleFinish = async () => {
    await AsyncStorage.setItem(FIRST_EXP_KEY, 'true');
    onComplete();
  };

  if (step === 'analyzing') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: C.BACKGROUND }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.PRIMARY} />
          <Text style={[styles.analyzingTitle, { color: C.TEXT }]}>AI đang phân tích...</Text>
          <Text style={[styles.analyzingDesc, { color: C.TEXT_LIGHT }]}>
            Phân tích buổi tư vấn theo phương pháp THE TRUSTED ADVISOR
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (step === 'result' && result) {
    const scoreColor = result.score >= 7 ? '#10B981' : result.score >= 5 ? '#F59E0B' : '#EF4444';
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: C.BACKGROUND }]}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.resultHeader}>
            <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
              <Text style={[styles.scoreNum, { color: scoreColor }]}>{result.score?.toFixed(1) || '4.5'}</Text>
              <Text style={styles.scoreOf}>/10</Text>
            </View>
            <Text style={[styles.resultTitle, { color: C.TEXT }]}>Kết quả phân tích</Text>
            <Text style={[styles.resultDesc, { color: C.TEXT_LIGHT }]}>
              AI đã chấm điểm buổi tư vấn mẫu này
            </Text>
          </View>

          {result.improvements?.length > 0 && (
            <View style={[styles.resultCard, { backgroundColor: C.CARD }]}>
              <View style={styles.resultCardHeader}>
                <Ionicons name="arrow-up-circle" size={18} color="#F59E0B" />
                <Text style={[styles.resultCardTitle, { color: C.TEXT }]}>Cần cải thiện</Text>
              </View>
              {result.improvements.slice(0, 3).map((item: string, i: number) => (
                <View key={i} style={styles.resultItem}>
                  <View style={[styles.resultDot, { backgroundColor: '#F59E0B' }]} />
                  <Text style={[styles.resultText, { color: C.TEXT_SECONDARY }]}>{item}</Text>
                </View>
              ))}
            </View>
          )}

          {result.strengths?.length > 0 && (
            <View style={[styles.resultCard, { backgroundColor: C.CARD }]}>
              <View style={styles.resultCardHeader}>
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                <Text style={[styles.resultCardTitle, { color: C.TEXT }]}>Điểm tốt</Text>
              </View>
              {result.strengths.slice(0, 2).map((item: string, i: number) => (
                <View key={i} style={styles.resultItem}>
                  <View style={[styles.resultDot, { backgroundColor: '#10B981' }]} />
                  <Text style={[styles.resultText, { color: C.TEXT_SECONDARY }]}>{item}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={[styles.ctaCard, { backgroundColor: C.PRIMARY + '10', borderColor: C.PRIMARY + '20' }]}>
            <Ionicons name="sparkles" size={24} color={C.PRIMARY} />
            <Text style={[styles.ctaTitle, { color: C.TEXT }]}>Đây chỉ là demo!</Text>
            <Text style={[styles.ctaDesc, { color: C.TEXT_SECONDARY }]}>
              Ghi âm buổi tư vấn THẬT của bạn để nhận phân tích chi tiết hơn, với kịch bản mẫu SAI/ĐÚNG cụ thể.
            </Text>
          </View>

          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: C.PRIMARY }]} onPress={handleFinish}>
            <Text style={styles.primaryBtnText}>Bắt đầu dùng app</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipBtn} onPress={handleFinish}>
            <Text style={[styles.skipText, { color: C.TEXT_LIGHT }]}>Khám phá thêm sau</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Step: intro
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.BACKGROUND }]}>
      <ScrollView contentContainerStyle={styles.introScroll}>
        <LinearGradient colors={[C.PRIMARY, '#0F4C3A']} style={styles.introHero}>
          <Ionicons name="radio" size={48} color="#fff" />
          <Text style={styles.introTitle}>Xem AI phân tích{'\n'}buổi tư vấn như thế nào</Text>
          <Text style={styles.introDesc}>
            Chúng tôi sẽ cho bạn xem kết quả phân tích một buổi tư vấn mẫu.
            Chỉ mất 10 giây.
          </Text>
        </LinearGradient>

        <View style={styles.introSteps}>
          <View style={styles.introStep}>
            <View style={[styles.stepIcon, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="mic" size={20} color="#7C3AED" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.stepTitle, { color: C.TEXT }]}>1. Ghi âm buổi tư vấn</Text>
              <Text style={[styles.stepDesc, { color: C.TEXT_LIGHT }]}>Hoặc nhập nội dung cuộc trò chuyện</Text>
            </View>
          </View>
          <View style={styles.introStep}>
            <View style={[styles.stepIcon, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="sparkles" size={20} color="#2563EB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.stepTitle, { color: C.TEXT }]}>2. AI phân tích tự động</Text>
              <Text style={[styles.stepDesc, { color: C.TEXT_LIGHT }]}>Chấm điểm theo 10 tiêu chí TTA</Text>
            </View>
          </View>
          <View style={styles.introStep}>
            <View style={[styles.stepIcon, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="trending-up" size={20} color="#059669" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.stepTitle, { color: C.TEXT }]}>3. Nhận feedback cải thiện</Text>
              <Text style={[styles.stepDesc, { color: C.TEXT_LIGHT }]}>Kịch bản SAI/ĐÚNG, hành động cụ thể</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: C.PRIMARY }]} onPress={handleDemo}>
          <Ionicons name="play" size={18} color="#fff" />
          <Text style={styles.primaryBtnText}>Xem demo phân tích</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipBtn} onPress={handleFinish}>
          <Text style={[styles.skipText, { color: C.TEXT_LIGHT }]}>Bỏ qua, vào app luôn</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

export async function shouldShowFirstExperience(): Promise<boolean> {
  const val = await AsyncStorage.getItem(FIRST_EXP_KEY);
  return val !== 'true';
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  scroll: { padding: 20, paddingBottom: 40 },
  introScroll: { paddingBottom: 40 },

  analyzingTitle: { fontSize: 20, fontWeight: '700', marginTop: 20 },
  analyzingDesc: { fontSize: 14, marginTop: 8, textAlign: 'center' },

  introHero: {
    padding: 32, paddingTop: 48, paddingBottom: 36, alignItems: 'center',
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  introTitle: { fontSize: 24, fontWeight: '800', color: '#fff', textAlign: 'center', marginTop: 16, lineHeight: 32 },
  introDesc: { fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 10, lineHeight: 22 },

  introSteps: { padding: 20, gap: 16 },
  introStep: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  stepTitle: { fontSize: 14, fontWeight: '700' },
  stepDesc: { fontSize: 12, marginTop: 2 },

  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: 20, paddingVertical: 16, borderRadius: 14,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  skipBtn: { alignItems: 'center', paddingVertical: 16 },
  skipText: { fontSize: 13, fontWeight: '500' },

  resultHeader: { alignItems: 'center', marginBottom: 24, marginTop: 12 },
  scoreCircle: {
    width: 80, height: 80, borderRadius: 40, borderWidth: 4,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  scoreNum: { fontSize: 28, fontWeight: '900' },
  scoreOf: { fontSize: 12, color: '#94A3B8', marginTop: -4 },
  resultTitle: { fontSize: 20, fontWeight: '800' },
  resultDesc: { fontSize: 13, marginTop: 4 },

  resultCard: {
    borderRadius: 14, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  resultCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  resultCardTitle: { fontSize: 14, fontWeight: '700' },
  resultItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  resultDot: { width: 6, height: 6, borderRadius: 3, marginTop: 6, flexShrink: 0 },
  resultText: { fontSize: 13, lineHeight: 20, flex: 1 },

  ctaCard: {
    borderRadius: 14, padding: 18, marginBottom: 16, alignItems: 'center',
    borderWidth: 1, gap: 8,
  },
  ctaTitle: { fontSize: 15, fontWeight: '700' },
  ctaDesc: { fontSize: 12, textAlign: 'center', lineHeight: 20 },
});
