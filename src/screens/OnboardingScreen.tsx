import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';

const { width } = Dimensions.get('window');

interface OnboardingProps {
  onComplete: () => void;
}

const SLIDES = [
  {
    emoji: '🎯',
    title: 'Bán bằng Vị thế',
    subtitle: 'Xây dựng vị thế cố vấn tin cậy\nthay vì "bán hàng" truyền thống',
    color: COLORS.PRIMARY,
  },
  {
    emoji: '🎙️',
    title: 'Ghi âm & Phân tích',
    subtitle: 'AI phân tích cuộc tư vấn của bạn\ntheo phương pháp THE TRUSTED ADVISOR',
    color: COLORS.DANGER,
  },
  {
    emoji: '🧠',
    title: 'AI Coach cá nhân',
    subtitle: 'Hỏi bất kỳ tình huống bán hàng nào\nCoach Duy trả lời ngay',
    color: COLORS.SUCCESS,
  },
];

export default function OnboardingScreen({ onComplete }: OnboardingProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

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
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.emojiWrap}>
              <Text style={styles.emoji}>{item.emoji}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.bottomRow}>
        {currentIndex < SLIDES.length - 1 ? (
          <>
            <TouchableOpacity onPress={onComplete}>
              <Text style={styles.skipText}>Bỏ qua</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNext}>
              <LinearGradient colors={[COLORS.PRIMARY, COLORS.GRADIENT_END]} style={styles.nextBtn}>
                <Text style={styles.nextText}>Tiếp theo</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity onPress={onComplete} style={{ flex: 1 }}>
            <LinearGradient colors={[COLORS.PRIMARY, COLORS.GRADIENT_END]} style={styles.startBtn}>
              <Text style={styles.startText}>Bắt đầu ngay</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emojiWrap: {
    width: 120,
    height: 120,
    borderRadius: 40,
    backgroundColor: COLORS.PRIMARY + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  emoji: {
    fontSize: 56,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.TEXT,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 24,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.BORDER,
  },
  dotActive: {
    width: 24,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  skipText: {
    fontSize: 15,
    color: COLORS.TEXT_LIGHT,
    fontWeight: '600',
  },
  nextBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
  },
  nextText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  startBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  startText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 17,
  },
});
