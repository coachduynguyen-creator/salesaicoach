import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { useColors } from '../contexts/ThemeContext';
import { analyzeRecording, analyzeTranscript, extractCustomerInfo, AnalysisResult } from '../services/aiService';
import { addSession, findCustomerByName, addCustomer, updateCustomer } from '../services/storageService';
import { useKnowledge } from '../contexts/KnowledgeContext';
import { useBusiness } from '../contexts/BusinessContext';
import { useAlert } from '../contexts/AlertContext';

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
  { label: 'Sửa lỗi chính tả tiếng Việt...', icon: 'create-outline' },
  { label: 'AI đang phân tích chuyên sâu...', icon: 'bulb-outline' },
  { label: 'Hoàn tất! Đang tạo báo cáo...', icon: 'checkmark-circle-outline' },
] as const;

function LoadingScreen() {
  const C = useColors();
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
          <ActivityIndicator size="large" color={C.PRIMARY} />
        </View>
        <Text style={styles.loadingTitle}>Đang phân tích...</Text>

        {/* Progress bar */}
        <View style={styles.progressBarBg}>
          <Animated.View style={[styles.progressBarFill, { width: progressWidth, backgroundColor: C.PRIMARY }]} />
        </View>

        {/* Steps */}
        <View style={styles.stepsContainer}>
          {LOADING_STEPS.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <Ionicons
                name={i < currentStep ? 'checkmark-circle' : i === currentStep ? step.icon : 'ellipse-outline'}
                size={18}
                color={i <= currentStep ? C.PRIMARY : COLORS.BORDER}
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
  const C = useColors();
  const [text, setText] = useState('');
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={{ flex: 1, padding: 20 }}>
          <Text style={[styles.manualTitle, { color: C.PRIMARY }]}>Nhập nội dung cuộc tư vấn</Text>
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
            style={[styles.manualBtn, { backgroundColor: C.PRIMARY }, !text.trim() && { opacity: 0.4 }]}
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
  const C = useColors();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ResultRouteParams, 'ResultScreen'>>();
  const { audioUri, manualMode = false, duration = 0, customerName = 'Khách hàng' } = route.params ?? {};
  const { knowledgeBase } = useKnowledge();
  const { businessContext } = useBusiness();
  const { showAlert } = useAlert();

  const [loading, setLoading] = useState(!manualMode);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const runAnalysis = async (transcript?: string) => {
    setLoading(true);
    try {
      const analysis = transcript
        ? await analyzeTranscript(transcript, knowledgeBase + businessContext)
        : await analyzeRecording(audioUri ?? '', knowledgeBase + businessContext);
      setResult(analysis);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      const buttons: any[] = [{ text: 'Quay lại', onPress: () => navigation.goBack(), style: 'cancel' }];
      // Cho phép lưu bản ghi dù phân tích lỗi
      if (audioUri) {
        buttons.push({
          text: 'Lưu bản ghi',
          onPress: async () => {
            try {
              const now = new Date();
              const date = `${now.getDate().toString().padStart(2,'0')}/${(now.getMonth()+1).toString().padStart(2,'0')}/${now.getFullYear()}`;
              await addSession({
                customerName: customerName || 'Chưa nhập tên',
                companyName: (route.params as any)?.companyName ?? '',
                date,
                duration,
                score: 0,
                analysis: { score: 0, summary: ['Chưa phân tích — có lỗi khi phân tích, bản ghi đã lưu'], strengths: [], improvements: [], strategies: [] },
                audioUri,
              });
              showAlert({
                title: 'Đã lưu',
                message: 'Bản ghi đã lưu. Bạn có thể nghe lại và phân tích lại sau.',
                type: 'success',
                buttons: [{ text: 'OK', style: 'default', onPress: () => navigation.goBack() }],
              });
            } catch {
              navigation.goBack();
            }
          },
        });
      }
      // Cho phép thử lại
      buttons.push({ text: 'Thử lại', onPress: () => runAnalysis(transcript) });
      showAlert({ title: 'Lỗi phân tích', message: msg, type: 'error', buttons });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!manualMode) runAnalysis();
  }, []);

  const handleShare = async () => {
    if (!result) return;
    const lines: string[] = [
      `📊 BÁO CÁO PHÂN TÍCH — ${customerName}`,
      `📅 ${getTodayString()}${duration > 0 ? ` | ⏱ ${formatTime(duration)}` : ''}`,
      `⭐ Điểm: ${result.score}/10 — ${getScoreLabel(result.score)}`,
      '',
      '📋 TÓM TẮT',
      ...result.summary.map(s => `• ${s}`),
    ];
    if (result.communication) {
      lines.push('', '🎙️ TÁC PHONG & GIAO TIẾP');
      lines.push(`• Giọng nói: ${result.communication.tone}`);
      lines.push(`• Lắng nghe: ${result.communication.listening}`);
      lines.push(`• Đặt câu hỏi: ${result.communication.questioning}`);
    }
    lines.push('', '💪 ĐIỂM MẠNH', ...result.strengths.map(s => `• ${s}`));
    lines.push('', '⚠️ CẦN CẢI THIỆN', ...result.improvements.map(s => `• ${s}`));
    if (result.scenario) {
      lines.push('', '🎬 KỊCH BẢN CẢI THIỆN');
      lines.push(`Tình huống: ${result.scenario.situation}`);
      lines.push(`❌ Đã làm: ${result.scenario.wrong}`);
      lines.push(`✅ Nên làm: ${result.scenario.correct}`);
    }
    if (result.nextActions?.length) {
      lines.push('', '✅ VIỆC CẦN LÀM NGAY', ...result.nextActions.map(s => `• ${s}`));
    }
    lines.push('', '🎯 CHIẾN LƯỢC LẦN SAU', ...result.strategies.map(s => `• ${s}`));
    lines.push('', '— Sales Coach App (TTA)');

    try {
      await Share.share({ message: lines.join('\n') });
    } catch {}
  };

  const handleSave = async () => {
    if (!result) return;
    try {
      const now = new Date();
      const date = `${now.getDate().toString().padStart(2,'0')}/${(now.getMonth()+1).toString().padStart(2,'0')}/${now.getFullYear()}`;
      const session = await addSession({
        customerName,
        companyName: (route.params as any)?.companyName ?? '',
        date,
        duration,
        score: result.score,
        analysis: result,
        audioUri: audioUri ?? undefined,
      });

      // Auto CRM: trích xuất thông tin khách và lưu profile
      if (customerName && customerName !== 'Khách hàng' && result.transcript) {
        try {
          const info = await extractCustomerInfo(result.transcript);
          const existing = await findCustomerByName(customerName);

          // Merge ICP data
          const icpData = info.icp || {};
          const dmData = info.decisionMaker?.name ? [info.decisionMaker as any] : [];

          if (existing) {
            const mergedIcp = { ...(existing.icp || {}), ...Object.fromEntries(Object.entries(icpData).filter(([_, v]) => v)) };
            const mergedDMs = [...(existing.decisionMakers || [])];
            if (dmData.length && !mergedDMs.some(d => d.name === dmData[0].name)) {
              mergedDMs.push({ ...dmData[0], notes: '' });
            }
            const updatedNotes = [...(existing.notes || []), {
              date,
              content: info.callSummary || `Điểm: ${result.score}/10`,
              sessionId: session.id,
            }];
            await updateCustomer(existing.id, {
              needs: info.needs || existing.needs,
              budget: info.budget || existing.budget,
              concerns: info.concerns || existing.concerns,
              stage: info.stage || existing.stage,
              decisionFactors: info.decisionFactors || existing.decisionFactors,
              personality: info.personality || existing.personality,
              nextStep: info.nextStep || existing.nextStep,
              icp: mergedIcp,
              decisionMakers: mergedDMs,
              notes: updatedNotes,
              sessionIds: [...(existing.sessionIds || []), session.id],
            });
          } else {
            const newCustomer = await addCustomer({
              name: customerName,
              company: (route.params as any)?.companyName ?? '',
              phone: '', email: '',
              needs: info.needs, budget: info.budget,
              concerns: info.concerns, stage: info.stage,
              statusId: 'new',
              decisionFactors: info.decisionFactors,
              personality: info.personality, nextStep: info.nextStep,
              icp: icpData,
            });
            await updateCustomer(newCustomer.id, {
              decisionMakers: dmData.map((d: any) => ({ ...d, notes: '' })),
              notes: [{ date, content: info.callSummary || `Điểm: ${result.score}/10`, sessionId: session.id }],
              sessionIds: [session.id],
            });
          }
        } catch {
          // CRM extraction fail — không block việc lưu session
        }
      }

      showAlert({
        title: 'Đã lưu',
        message: 'Kết quả và thông tin khách hàng đã được cập nhật!',
        type: 'success',
        buttons: [{ text: 'OK', style: 'default', onPress: () => navigation.goBack() }],
      });
    } catch {
      showAlert({ title: 'Lỗi', message: 'Không thể lưu. Vui lòng thử lại.', type: 'error' });
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
          accentColor={C.PRIMARY}
        />

        {/* Communication Skills */}
        {result.communication && (
          <View style={[styles.sectionCard, { backgroundColor: '#F5F3FF' }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEmoji}>🎙️</Text>
              <Text style={[styles.sectionTitle, { color: '#7C3AED' }]}>Tác phong & Giao tiếp</Text>
            </View>
            <View style={styles.commRow}>
              <Text style={styles.commLabel}>Giọng nói & thái độ</Text>
              <Text style={styles.commValue}>{result.communication.tone}</Text>
            </View>
            <View style={styles.commDivider} />
            <View style={styles.commRow}>
              <Text style={styles.commLabel}>Kỹ năng lắng nghe</Text>
              <Text style={styles.commValue}>{result.communication.listening}</Text>
            </View>
            <View style={styles.commDivider} />
            <View style={styles.commRow}>
              <Text style={styles.commLabel}>Kỹ năng đặt câu hỏi</Text>
              <Text style={styles.commValue}>{result.communication.questioning}</Text>
            </View>
          </View>
        )}

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

        {/* Scenario - Kịch bản mẫu */}
        {result.scenario && (
          <View style={[styles.sectionCard, { backgroundColor: '#FFF5F5' }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEmoji}>🎬</Text>
              <Text style={[styles.sectionTitle, { color: '#E53E3E' }]}>Kịch bản cải thiện</Text>
            </View>
            <Text style={styles.scenarioLabel}>Tình huống:</Text>
            <Text style={styles.scenarioText}>{result.scenario.situation}</Text>
            <View style={styles.commDivider} />
            <Text style={[styles.scenarioLabel, { color: COLORS.DANGER }]}>Sales đã làm:</Text>
            <Text style={styles.scenarioText}>{result.scenario.wrong}</Text>
            <View style={styles.commDivider} />
            <Text style={[styles.scenarioLabel, { color: COLORS.SUCCESS }]}>Nên làm thay:</Text>
            <Text style={[styles.scenarioText, { fontStyle: 'italic' }]}>{result.scenario.correct}</Text>
          </View>
        )}

        {/* Next Actions */}
        {result.nextActions && result.nextActions.length > 0 && (
          <SectionCard
            emoji="✅"
            title="Việc cần làm ngay"
            items={result.nextActions}
            backgroundColor="#F0FFF4"
            accentColor="#2B6CB0"
          />
        )}

        {/* Strategies */}
        <SectionCard
          emoji="🎯"
          title="Chiến lược lần sau"
          items={result.strategies}
          backgroundColor="#EBF8FF"
          accentColor={C.PRIMARY}
        />

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
          <TouchableOpacity style={[styles.saveButton, { backgroundColor: C.PRIMARY, shadowColor: C.PRIMARY, flex: 1 }]} onPress={handleSave}>
            <Ionicons name="save-outline" size={18} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Lưu kết quả</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: '#4A5568', shadowColor: '#4A5568', flex: 1 }]}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={18} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Chia sẻ</Text>
          </TouchableOpacity>
        </View>

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
  commRow: {
    paddingVertical: 10,
  },
  commLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  commValue: {
    fontSize: 13,
    color: COLORS.TEXT,
    lineHeight: 20,
  },
  commDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  scenarioLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 4,
    marginTop: 8,
  },
  scenarioText: {
    fontSize: 13,
    color: COLORS.TEXT,
    lineHeight: 21,
    marginBottom: 4,
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
