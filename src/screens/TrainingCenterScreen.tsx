import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/colors';

// ─── Types ───────────────────────────────────────────────────────────────────

type Category = 'all' | 'mindset' | 'skill' | 'situation';

interface Lesson {
  id: string;
  category: Category;
  title: string;
  description: string;
  duration: string;
  tag: string;
  tagColor: string;
  emoji: string;
  isNew?: boolean;
  isComingSoon?: boolean;
}

// ─── TTA Lessons ─────────────────────────────────────────────────────────────

const LESSONS: Lesson[] = [
  {
    id: 'tl1',
    category: 'mindset',
    title: 'Chân dung Cố vấn Tin cậy',
    description: 'Công thức Trust T=(C+R+E)/Sf, Tam giác vàng, 10 khác biệt giữa cố vấn và người bán hàng.',
    duration: '10 phút đọc',
    tag: 'Tư duy',
    tagColor: COLORS.PRIMARY,
    emoji: '🎯',
    isNew: true,
  },
  {
    id: 'tl2',
    category: 'mindset',
    title: 'Tâm lý học khách hàng cao cấp',
    description: '2 hệ thống nhận thức Kahneman, 6 nỗi sợ cốt lõi, 5 giai đoạn cảm xúc khi ra quyết định.',
    duration: '12 phút đọc',
    tag: 'Tư duy',
    tagColor: COLORS.PRIMARY,
    emoji: '🧠',
    isNew: true,
  },
  {
    id: 'tl3',
    category: 'skill',
    title: 'Phương pháp Dẫn Quyết Định 3 Điểm Chạm',
    description: '3 nguyên tắc nền tảng, 3 sai lầm phổ biến, và cách dẫn khách tự ra quyết định.',
    duration: '8 phút đọc',
    tag: 'Kỹ năng',
    tagColor: COLORS.ACCENT,
    emoji: '👆',
  },
  {
    id: 'tl4',
    category: 'skill',
    title: 'Bộ kỹ năng Cố vấn Tin cậy',
    description: '6 nhóm kỹ năng từ lắng nghe chiến lược đến đọc tín hiệu và đặt câu hỏi dẫn dắt.',
    duration: '9 phút đọc',
    tag: 'Kỹ năng',
    tagColor: COLORS.ACCENT,
    emoji: '🛠',
  },
  {
    id: 'tl5',
    category: 'situation',
    title: 'Xử lý tình huống chuẩn — Phương pháp REFLECT',
    description: 'Kịch bản SAI/ĐÚNG thực tế: so sánh đối thủ, bên thứ 3 vào cuộc, khách kiểm tra năng lực.',
    duration: '11 phút đọc',
    tag: 'Tình huống',
    tagColor: COLORS.SUCCESS,
    emoji: '💬',
    isNew: true,
  },
  {
    id: 'tl5b',
    category: 'situation',
    title: '6 lỗi mất vị thế cố vấn',
    description: 'Những lỗi khiến bạn mất vị thế ngay lập tức: phản ứng cảm xúc, hạ giá, nói quá nhiều...',
    duration: '6 phút đọc',
    tag: 'Tình huống',
    tagColor: COLORS.SUCCESS,
    emoji: '⚠️',
  },
];

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'mindset', label: 'Tư duy' },
  { key: 'skill', label: 'Kỹ năng' },
  { key: 'situation', label: 'Tình huống' },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TrainingCenterScreen() {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const navigation = useNavigation<any>();

  const filtered = activeCategory === 'all'
    ? LESSONS
    : LESSONS.filter(l => l.category === activeCategory);

  const renderLesson = ({ item }: { item: Lesson }) => (
    <TouchableOpacity
      style={styles.lessonCard}
      onPress={() => {
        if (!item.isComingSoon) {
          navigation.navigate('LessonDetail', { lesson: item });
        }
      }}
      activeOpacity={item.isComingSoon ? 1 : 0.7}
    >
      <View style={[styles.lessonEmoji, { backgroundColor: item.tagColor + '15' }]}>
        <Text style={styles.emojiText}>{item.emoji}</Text>
      </View>

      <View style={styles.lessonContent}>
        <View style={styles.lessonHeader}>
          <View style={[styles.tag, { backgroundColor: item.tagColor + '18' }]}>
            <Text style={[styles.tagText, { color: item.tagColor }]}>{item.tag}</Text>
          </View>
          {item.isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>MỚI</Text>
            </View>
          )}
          {item.isComingSoon && (
            <View style={styles.soonBadge}>
              <Text style={styles.soonBadgeText}>SẮP RA</Text>
            </View>
          )}
        </View>

        <Text style={styles.lessonTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.lessonDesc} numberOfLines={2}>{item.description}</Text>

        <Text style={styles.lessonDuration}>{item.duration}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Đào Tạo</Text>
        <Text style={styles.headerSub}>Phương pháp Bán bằng Vị thế — THE TRUSTED ADVISOR</Text>
      </View>

      {/* Progress */}
      <View style={styles.progressBanner}>
        <View>
          <Text style={styles.progressTitle}>Tiến độ của bạn</Text>
          <Text style={styles.progressSub}>0 / {LESSONS.length} bài đã hoàn thành</Text>
        </View>
        <View style={styles.progressBarWrap}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '0%' }]} />
          </View>
          <Text style={styles.progressPct}>0%</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {CATEGORIES.map(cat => {
          const active = activeCategory === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              onPress={() => setActiveCategory(cat.key)}
              style={[styles.filterTab, active && styles.filterTabActive]}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Lessons */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderLesson}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.TEXT,
  },
  headerSub: {
    fontSize: 13,
    color: COLORS.TEXT_LIGHT,
    marginTop: 2,
  },
  progressBanner: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressTitle: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  progressSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 2,
  },
  progressBarWrap: {
    alignItems: 'flex-end',
  },
  progressBarBg: {
    width: 80,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F6AD55',
    borderRadius: 3,
  },
  progressPct: {
    color: '#F6AD55',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 6,
  },
  filterTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: COLORS.SURFACE,
  },
  filterTabActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_SECONDARY,
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    gap: 12,
    paddingBottom: 30,
  },
  lessonCard: {
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  lessonEmoji: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    flexShrink: 0,
  },
  emojiText: {
    fontSize: 24,
  },
  lessonContent: {
    flex: 1,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  newBadge: {
    backgroundColor: COLORS.SUCCESS,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  newBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  soonBadge: {
    backgroundColor: '#9F7AEA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  soonBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  lessonTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.TEXT,
    lineHeight: 20,
    marginBottom: 4,
  },
  lessonDesc: {
    fontSize: 12,
    color: COLORS.TEXT_LIGHT,
    lineHeight: 17,
    marginBottom: 8,
  },
  lessonDuration: {
    fontSize: 12,
    color: COLORS.TEXT_LIGHT,
  },
});
