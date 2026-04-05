import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { analyzeRecording, analyzeTranscript, AnalysisResult } from '../services/aiService';
import { addSession } from '../services/storageService';
import { useKnowledge } from '../contexts/KnowledgeContext';

type ResultRouteParams = {
  ResultScreen: {
    audioUri?: string | null;
    manualMode?: boolean;
    duration?: number;
    customerName?: string;
  };
};

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

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function getTodayString(): string {
  const now = new Date();
  const d = now.getDate().toString().padStart(2, '0');
  const m = (now.getMonth() + 1).toString().padStart(2, '0');
  const y = now.getFullYear();
  return `${d}/${m}/${y}`;
}

interface SectionCardProps {
  emoji: string;
  title: string;
  items: string[];
  backgroundColor: string;
  accentColor: string;
}

function SectionCard({ emoji, title, items, backgroundColor, accentColor }: SectionCardProps) {
  return (
    <View style={[styles.sectionCard, { backgroundColor }]}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionEmoji}>{emoji}</Text>
        <Text style={[styles.sectionTitle, { color: accentColor }]}>{title}</Text>
      </View>
      {items.map((item, index) => (
        <View key={index} style={styles.bulletRow}>
          <View style={[styles.bullet, { backgroundColor: accentColor }]} />
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const LOADING_STEPS = [
  { label: 'Đang tải file âm thanh...', icon: 'cloud-upload-outline' },
  { label: 'Chuyển giọng nói thành văn bản...', icon: 'text-outline' },
  { label: 'AI đang phân tích cuộc tư vấn...', icon: 'bulb-outline' },
  { label: 'Hoàn tất! Đang tạo báo cáo...', icon: 'checkmark-circle-outline' },
] as const;

function LoadingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Tự động chuyển bước mỗi 1.8 giây
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 1800);

    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: LOADING_STEPS.length * 1800,
      useNativeDriver: false,
    }).start();

    return () => clearInterval(interval);
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.loadingContainer}>
        <View style={styles.loadingIconWrap}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        </View>
        <Text style={styles.loadingTitle}>Đang phân tích...</Text>

        {/* Progress bar */}
        <View style={styles.progressBarBg}>
          <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
        </View>

        {/* Steps */}
        <View style={styles.stepsContainer}>
          {LOADING_STEPS.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <Ionicons
                name={i < currentStep ? 'checkmark-circle' : i === currentStep ? step.icon : 'ellipse-outline'}
                size={18}
                color={i <= currentStep ? COLORS.PRIMARY : COLORS.BORDER}
              />
              <Text style={[styles.stepText, i <= currentStep && styles.stepTextActive]}>
                {step.label}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.loadingSubtitle}>Thường mất 20–40 giây</Text>
      </View>
    </SafeAreaView>
  );
}

// ─── Manual Input Screen ──────────────────────────────────────────────────────

function ManualInputScreen({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [text, setText] = useState('');
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={{ flex: 1, padding: 20 }}>
          <Text style={styles.manualTitle}>Nhập nội dung cuộc tư vấn</Text>
          <Text style={styles.manualSub}>
            Tóm tắt hoặc chép lại những gì sales và khách đã nói. AI sẽ phân tích dựa trên nội dung này.
          </Text>
          <TextInput
            style={styles.manualInput}
            placeholder="Ví dụ: Sales hỏi về nhu cầu, khách nói giá cao, sales xử lý bằng cách..."
            placeholderTextColor={COLORS.TEXT_LIGHT}
            value={text}
            onChangeText={setText}
            multiline
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[styles.manualBtn, !text.trim() && { opacity: 0.4 }]}
            onPress={() => onSubmit(text.trim())}
            disabled={!text.trim()}
          >
            <Ionicons name="sparkles-outline" size={18} color="#fff" />
            <Text style={styles.manualBtnText}>Phân tích với AI</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ResultScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ResultRouteParams, 'ResultScreen'>>();
  const { audioUri, manualMode = false, duration = 0, customerName = 'Khách hàng' } = route.params ?? {};
  const { knowledgeBase } = useKnowledge();

  const [loading, setLoading] = useState(!manualMode);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const runAnalysis = async (transcript?: string) => {
    setLoading(true);
    try {
      const analysis = transcript
        ? await analyzeTranscript(transcript, knowledgeBase)
        : await analyzeRecording(audioUri ?? '', knowledgeBase);
      setResult(analysis);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      Alert.alert('Lỗi phân tích', msg, [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!manualMode) runAnalysis();
  }, []);

  const handleSave = async () => {
    if (!result) return;
    try {
      const now = new Date();
      const date = `${now.getDate().toString().padStart(2,'0')}/${(now.getMonth()+1).toString().padStart(2,'0')}/${now.getFullYear()}`;
      await addSession({
        customerName,
        companyName: (route.params as any)?.companyName ?? '',
        date,
        duration,
        score: result.score,
        analysis: result,
      });
      Alert.alert('Đã lưu', 'Kết quả đã được lưu vào lịch sử!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Lỗi', 'Không thể lưu. Vui lòng thử lại.');
    }
  };

  if (!loading && !result && manualMode) {
    return <ManualInputScreen onSubmit={(text) => runAnalysis(text)} />;
  }

  if (loading) return <LoadingScreen />;

  if (!result) return null;

  const scoreColor = getScoreColor(result.score);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={COLORS.TEXT} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Kết quả phân tích</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Score Hero */}
        <View style={styles.heroCard}>
          <View style={[styles.scoreRing, { borderColor: scoreColor }]}>
            <Text style={[styles.scoreNumber, { color: scoreColor }]}>{result.score}</Text>
            <Text style={styles.scoreOutOf}>/10</Text>
          </View>
          <Text style={[styles.scoreLabel, { color: scoreColor }]}>
            {getScoreLabel(result.score)}
          </Text>
          <Text style={styles.heroCustomer}>{customerName}</Text>
          <View style={styles.heraMeta}>
            <Ionicons name="calendar-outline" size={13} color={COLORS.TEXT_LIGHT} />
            <Text style={styles.heroMetaText}>{getTodayString()}</Text>
            {duration > 0 && (
              <>
                <View style={styles.heroDivider} />
                <Ionicons name="time-outline" size={13} color={COLORS.TEXT_LIGHT} />
                <Text style={styles.heroMetaText}>{formatTime(duration)}</Text>
              </>
            )}
          </View>
        </View>

        {/* Summary */}
        <SectionCard
          emoji="📋"
          title="Tóm tắt"
          items={result.summary}
          backgroundColor={COLORS.CARD}
          accentColor={COLORS.PRIMARY}
        />

        {/* Strengths */}
        <SectionCard
          emoji="💪"
          title="Điểm mạnh"
          items={result.strengths}
          backgroundColor="#F0FFF4"
          accentColor={COLORS.SUCCESS}
        />

        {/* Improvements */}
        <SectionCard
          emoji="⚠️"
          title="Cần cải thiện"
          items={result.improvements}
          backgroundColor="#FFFAF0"
          accentColor={COLORS.WARNING}
        />

        {/* Strategies */}
        <SectionCard
          emoji="🎯"
          title="Chiến lược lần sau"
          items={result.strategies}
          backgroundColor="#EBF8FF"
          accentColor={COLORS.PRIMARY}
        />

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Ionicons name="save-outline" size={18} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>Lưu kết quả</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.TEXT,
    marginTop: 20,
  },
  loadingSubtitle: {
    fontSize: 13,
    color: COLORS.TEXT_LIGHT,
    marginTop: 16,
    textAlign: 'center',
  },
  loadingIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EBF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: COLORS.BORDER,
    borderRadius: 3,
    marginTop: 20,
    marginBottom: 24,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 3,
  },
  stepsContainer: {
    width: '100%',
    gap: 14,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepText: {
    fontSize: 14,
    color: COLORS.BORDER,
    fontWeight: '500',
  },
  stepTextActive: {
    color: COLORS.TEXT,
    fontWeight: '600',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.CARD,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.TEXT,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  heroCard: {
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  scoreRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  scoreNumber: {
    fontSize: 36,
    fontWeight: '800',
  },
  scoreOutOf: {
    fontSize: 16,
    color: COLORS.TEXT_LIGHT,
    fontWeight: '600',
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  heroCustomer: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.TEXT,
    marginBottom: 6,
  },
  heraMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroMetaText: {
    fontSize: 13,
    color: COLORS.TEXT_LIGHT,
  },
  heroDivider: {
    width: 1,
    height: 12,
    backgroundColor: COLORS.BORDER,
    marginHorizontal: 4,
  },
  sectionCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionEmoji: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingRight: 4,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    marginRight: 10,
    flexShrink: 0,
  },
  bulletText: {
    fontSize: 13,
    color: COLORS.TEXT,
    flex: 1,
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  manualTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.PRIMARY,
    marginBottom: 8,
  },
  manualSub: {
    fontSize: 14,
    color: COLORS.TEXT_LIGHT,
    lineHeight: 21,
    marginBottom: 20,
  },
  manualInput: {
    flex: 1,
    backgroundColor: COLORS.CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    padding: 16,
    fontSize: 15,
    color: COLORS.TEXT,
    lineHeight: 22,
    marginBottom: 16,
  },
  manualBtn: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  manualBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
