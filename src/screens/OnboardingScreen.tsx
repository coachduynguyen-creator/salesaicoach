import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface OnboardingProps {
  onComplete: () => void;
}

const SLIDES = [
  {
    gradient: ['#0F4C3A', '#1A7F64'] as [string, string],
    icon: 'shield-checkmark',
    iconBg: 'rgba(255,255,255,0.15)',
    badge: 'THE TRUSTED ADVISOR',
    title: 'Bán bằng Vị thế',
    subtitle: 'Phương pháp xây dựng vị thế cố vấn tin cậy, không dồn ép. Được phát triển bởi Coach Duy Nguyễn với 20 năm kinh nghiệm.',
    features: [
      { icon: 'school-outline', text: '32 bài học chuyên sâu' },
      { icon: 'people-outline', text: 'Đào tạo 5.000+ chuyên viên' },
      { icon: 'business-outline', text: 'Mobifone, ACB, AIA, Prudential...' },
    ],
  },
  {
    gradient: ['#1E3A5F', '#2563EB'] as [string, string],
    icon: 'radio',
    iconBg: 'rgba(255,255,255,0.15)',
    badge: 'AI-POWERED',
    title: 'Ghi âm & AI Phân tích',
    subtitle: 'Ghi âm buổi tư vấn, AI tự động chấm điểm, phân tích kỹ năng, và đề xuất cải thiện theo framework 3 Điểm Chạm.',
    features: [
      { icon: 'mic-outline', text: 'Ghi âm buổi tư vấn thực tế' },
      { icon: 'analytics-outline', text: 'AI chấm điểm 10 tiêu chí' },
      { icon: 'bulb-outline', text: 'Gợi ý kịch bản SAI/ĐÚNG cụ thể' },
    ],
  },
  {
    gradient: ['#5B21B6', '#8B5CF6'] as [string, string],
    icon: 'chatbubbles',
    iconBg: 'rgba(255,255,255,0.15)',
    badge: 'AI COACH',
    title: 'Coach AI 24/7',
    subtitle: 'Hỏi bất kỳ tình huống bán hàng nào. AI trả lời theo phương pháp THE TRUSTED ADVISOR của Coach Duy Nguyễn.',
    features: [
      { icon: 'flash-outline', text: 'Trả lời tức thì, mọi lúc' },
      { icon: 'library-outline', text: 'Kiến thức từ 5 tài liệu TTA' },
      { icon: 'person-outline', text: 'Cá nhân hóa theo ngành nghề' },
    ],
  },
  {
    gradient: ['#9D174D', '#E11D48'] as [string, string],
    icon: 'trophy',
    iconBg: 'rgba(255,255,255,0.15)',
    badge: 'CRM & TEAM',
    title: 'Quản lý Chuyên nghiệp',
    subtitle: 'Mini CRM theo dõi khách hàng, quản lý team sales, dashboard admin, và gamification giúp nhân viên tiến bộ mỗi ngày.',
    features: [
      { icon: 'people-circle-outline', text: 'CRM khách hàng + lead scoring' },
      { icon: 'bar-chart-outline', text: 'Admin dashboard + báo cáo' },
      { icon: 'flame-outline', text: 'Streak + 12 huy hiệu thành tựu' },
    ],
  },
  {
    gradient: ['#0F4C3A', '#1A7F64'] as [string, string],
    icon: 'rocket',
    iconBg: 'rgba(255,255,255,0.2)',
    badge: 'BẮT ĐẦU',
    title: 'Sẵn sàng nâng cấp\nkỹ năng bán hàng?',
    subtitle: 'Tham gia cùng hàng nghìn chuyên viên bán hàng đang sử dụng Sales Coach mỗi ngày.',
    features: [],
  },
];

export default function OnboardingScreen({ onComplete }: OnboardingProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  const isLast = currentIndex === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        keyExtractor={(_, i) => i.toString()}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        renderItem={({ item }) => (
          <LinearGradient colors={item.gradient} style={styles.slide}>
            {/* Icon */}
            <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>
              <View style={[styles.iconInner, { backgroundColor: item.iconBg }]}>
                <Ionicons name={item.icon as any} size={48} color="#fff" />
              </View>
            </View>

            {/* Badge */}
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>

            {/* Features */}
            {item.features.length > 0 && (
              <View style={styles.featureList}>
                {item.features.map((f: { icon: string; text: string }, i: number) => (
                  <View key={i} style={styles.featureRow}>
                    <View style={styles.featureIcon}>
                      <Ionicons name={f.icon as any} size={18} color="#fff" />
                    </View>
                    <Text style={styles.featureText}>{f.text}</Text>
                  </View>
                ))}
              </View>
            )}
          </LinearGradient>
        )}
      />

      {/* Bottom */}
      <View style={styles.bottom}>
        {/* Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentIndex ? styles.dotActive : {},
              ]}
            />
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.btnRow}>
          {!isLast ? (
            <>
              <TouchableOpacity onPress={onComplete} style={styles.skipBtn}>
                <Text style={styles.skipText}>Bỏ qua</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleNext} style={styles.nextBtn}>
                <Text style={styles.nextText}>Tiếp theo</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={onComplete} style={styles.startBtn}>
              <Text style={styles.startText}>Bắt đầu ngay</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Branding */}
        <Text style={styles.branding}>by Coach Duy Nguyễn</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F4C3A' },

  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 180,
  },

  iconCircle: {
    width: 120, height: 120, borderRadius: 60,
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  iconInner: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: 'center', justifyContent: 'center',
  },

  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16, paddingVertical: 5, borderRadius: 20,
    marginBottom: 16,
  },
  badgeText: {
    color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '800',
    letterSpacing: 2,
  },

  title: {
    fontSize: 30, fontWeight: '800', color: '#fff',
    textAlign: 'center', marginBottom: 12, lineHeight: 38,
  },
  subtitle: {
    fontSize: 15, color: 'rgba(255,255,255,0.75)',
    textAlign: 'center', lineHeight: 23, marginBottom: 28,
  },

  featureList: { width: '100%', gap: 12 },
  featureRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 18, paddingVertical: 14, borderRadius: 14,
  },
  featureIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  featureText: {
    fontSize: 14, color: '#fff', fontWeight: '600', flex: 1,
  },

  bottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 24, paddingBottom: 48, paddingTop: 16,
  },

  dotsRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    width: 28, backgroundColor: '#fff', borderRadius: 4,
  },

  btnRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  skipBtn: { paddingVertical: 14, paddingHorizontal: 8 },
  skipText: { fontSize: 15, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },

  nextBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14,
  },
  nextText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  startBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: '#fff',
    paddingVertical: 18, borderRadius: 16,
  },
  startText: { color: '#0F4C3A', fontWeight: '800', fontSize: 18 },

  branding: {
    textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.3)',
    marginTop: 16, fontWeight: '500',
  },
});
