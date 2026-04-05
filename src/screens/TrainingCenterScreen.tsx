import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { useColors } from '../contexts/ThemeContext';
import { loadLessonProgress } from '../services/storageService';

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
}

// ─── Bài học TTA — mỗi bài 1-2 ý chính, dễ nhớ ────────────────────────────

const LESSONS: Lesson[] = [
  // ── Tư duy (mindset) ──
  {
    id: 'm1',
    category: 'mindset',
    title: 'Công thức Trust',
    description: 'T = (Uy tín + Tin cậy + Kết nối) / Tập trung bản thân. Giảm Sf là cách nhanh nhất tăng Trust.',
    duration: '2 phút đọc',
    tag: 'Tư duy',
    tagColor: COLORS.PRIMARY,
    emoji: '🎯',
    isNew: true,
  },
  {
    id: 'm2',
    category: 'mindset',
    title: 'Tam giác vàng',
    description: 'Chuyên môn — Tin tưởng — Kết nối cảm xúc. Mất 1 cạnh = toàn bộ sụp đổ.',
    duration: '2 phút đọc',
    tag: 'Tư duy',
    tagColor: COLORS.PRIMARY,
    emoji: '🔺',
  },
  {
    id: 'm3',
    category: 'mindset',
    title: 'Bán hàng vs. Cố vấn',
    description: '10 khác biệt cốt lõi: tập trung sản phẩm vs. tập trung vấn đề, nói nhiều vs. nghe nhiều.',
    duration: '3 phút đọc',
    tag: 'Tư duy',
    tagColor: COLORS.PRIMARY,
    emoji: '🔄',
  },
  {
    id: 'm4',
    category: 'mindset',
    title: '2 hệ thống nhận thức',
    description: 'Kahneman: Hệ thống 1 (cảm xúc) quyết định mua, Hệ thống 2 (lý trí) chỉ hợp lý hóa sau.',
    duration: '2 phút đọc',
    tag: 'Tư duy',
    tagColor: COLORS.PRIMARY,
    emoji: '🧠',
    isNew: true,
  },
  {
    id: 'm5',
    category: 'mindset',
    title: '6 nỗi sợ khi mua hàng',
    description: 'Sợ mất tiền, mất mặt, thay đổi, bị lừa, mất kiểm soát, phức tạp — và cách nhận biết từng loại.',
    duration: '3 phút đọc',
    tag: 'Tư duy',
    tagColor: COLORS.PRIMARY,
    emoji: '😰',
  },
  {
    id: 'm6',
    category: 'mindset',
    title: '5 giai đoạn ra quyết định',
    description: 'Chưa biết → Nhận ra → Tìm giải pháp → So sánh → Quyết định. Song hành với 5 giai đoạn cảm xúc.',
    duration: '2 phút đọc',
    tag: 'Tư duy',
    tagColor: COLORS.PRIMARY,
    emoji: '📊',
  },

  // ── Kỹ năng (skill) ──
  {
    id: 's1',
    category: 'skill',
    title: 'Điểm Chạm 1: Nhận thức',
    description: 'Đặt câu hỏi để khách TỰ nhìn thấy vấn đề. Không phải bạn nói — mà khách tự nhận ra.',
    duration: '2 phút đọc',
    tag: 'Kỹ năng',
    tagColor: COLORS.ACCENT,
    emoji: '💡',
    isNew: true,
  },
  {
    id: 's2',
    category: 'skill',
    title: 'Điểm Chạm 2: Cảm xúc',
    description: 'Lắng nghe thật sự, phản hồi đồng cảm, kể câu chuyện thực tế. Không vội đưa giải pháp.',
    duration: '2 phút đọc',
    tag: 'Kỹ năng',
    tagColor: COLORS.ACCENT,
    emoji: '❤️',
  },
  {
    id: 's3',
    category: 'skill',
    title: 'Điểm Chạm 3: Hành động',
    description: 'Để khách TỰ đề xuất bước tiếp theo. Trao quyền chọn lựa, không ép timeline.',
    duration: '2 phút đọc',
    tag: 'Kỹ năng',
    tagColor: COLORS.ACCENT,
    emoji: '🚀',
  },
  {
    id: 's4',
    category: 'skill',
    title: 'Lắng nghe 3 tầng',
    description: 'Tầng 1: nghe lời nói. Tầng 2: nghe cảm xúc. Tầng 3: nghe điều chưa nói. Quy tắc 70/30.',
    duration: '2 phút đọc',
    tag: 'Kỹ năng',
    tagColor: COLORS.ACCENT,
    emoji: '👂',
  },
  {
    id: 's5',
    category: 'skill',
    title: 'Câu hỏi dẫn dắt',
    description: 'Thẩm vấn: "Ngân sách bao nhiêu?" vs. Dẫn dắt: "Anh mong đợi kết quả gì?" — khác biệt rất lớn.',
    duration: '2 phút đọc',
    tag: 'Kỹ năng',
    tagColor: COLORS.ACCENT,
    emoji: '❓',
  },
  {
    id: 's6',
    category: 'skill',
    title: 'Đọc tín hiệu mua',
    description: 'Tín hiệu mua: hỏi triển khai, timeline. Chưa sẵn sàng: trả lời ngắn, hỏi lại giá. Chữ "nhưng" = sự thật.',
    duration: '2 phút đọc',
    tag: 'Kỹ năng',
    tagColor: COLORS.ACCENT,
    emoji: '🔍',
  },

  // ── Tình huống (situation) ──
  {
    id: 'h1',
    category: 'situation',
    title: 'Phương pháp REFLECT',
    description: 'R-E-F-L-E-C-T: 7 bước xử lý tình huống khó — từ nhận diện đến theo dõi sau cuộc gặp.',
    duration: '3 phút đọc',
    tag: 'Tình huống',
    tagColor: COLORS.SUCCESS,
    emoji: '🪞',
    isNew: true,
  },
  {
    id: 'h2',
    category: 'situation',
    title: 'Khách so sánh đối thủ',
    description: 'SAI: nói xấu đối thủ. ĐÚNG: "Anh đang cân nhắc tiêu chí nào?" — dẫn khách tự phân tích.',
    duration: '2 phút đọc',
    tag: 'Tình huống',
    tagColor: COLORS.SUCCESS,
    emoji: '⚔️',
  },
  {
    id: 'h3',
    category: 'situation',
    title: 'Khách nói "giá cao"',
    description: 'Không giảm giá ngay. Hỏi "cao so với điều gì?" Quay lại Điểm Chạm nhận thức trước.',
    duration: '2 phút đọc',
    tag: 'Tình huống',
    tagColor: COLORS.SUCCESS,
    emoji: '💰',
  },
  {
    id: 'h4',
    category: 'situation',
    title: 'Có bên thứ 3 trong cuộc gặp',
    description: 'Hỏi ý kiến người đi cùng, biến họ thành đồng minh. Ai cũng cần cảm thấy được tôn trọng.',
    duration: '2 phút đọc',
    tag: 'Tình huống',
    tagColor: COLORS.SUCCESS,
    emoji: '👥',
  },
  {
    id: 'h5',
    category: 'situation',
    title: 'Khách kiểm tra năng lực',
    description: 'Không liệt kê thành tích. Kể 1 câu chuyện thật có kết quả cụ thể, hoặc để khách trải nghiệm.',
    duration: '2 phút đọc',
    tag: 'Tình huống',
    tagColor: COLORS.SUCCESS,
    emoji: '🎯',
  },
  {
    id: 'h6',
    category: 'situation',
    title: '6 lỗi mất vị thế',
    description: 'Phản ứng cảm xúc, hạ giá nhanh, nói quá nhiều, nói xấu đối thủ, hứa quá, bỏ rơi sau bán.',
    duration: '2 phút đọc',
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
  const C = useColors();
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<any>();

  useFocusEffect(
    useCallback(() => {
      loadLessonProgress().then(setCompletedIds);
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLessonProgress().then(setCompletedIds);
    setRefreshing(false);
  }, []);

  const completedCount = completedIds.length;
  const totalCount = LESSONS.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filtered = activeCategory === 'all'
    ? LESSONS
    : LESSONS.filter(l => l.category === activeCategory);

  const renderLesson = ({ item }: { item: Lesson }) => (
    <TouchableOpacity
      style={styles.lessonCard}
      onPress={() => navigation.navigate('LessonDetail', { lesson: item })}
      activeOpacity={0.7}
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
          {completedIds.includes(item.id) && (
            <View style={[styles.newBadge, { backgroundColor: COLORS.SUCCESS }]}>
              <Text style={styles.newBadgeText}>XONG</Text>
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
      <View style={[styles.progressBanner, { backgroundColor: C.PRIMARY }]}>
        <View>
          <Text style={styles.progressTitle}>Tiến độ của bạn</Text>
          <Text style={styles.progressSub}>{completedCount} / {totalCount} bài đã hoàn thành</Text>
        </View>
        <View style={styles.progressBarWrap}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPct}%` }]} />
          </View>
          <Text style={styles.progressPct}>{progressPct}%</Text>
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
              style={[styles.filterTab, active && { backgroundColor: C.PRIMARY }]}
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.PRIMARY} colors={[C.PRIMARY]} />}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: COLORS.TEXT },
  headerSub: { fontSize: 13, color: COLORS.TEXT_LIGHT, marginTop: 2 },
  progressBanner: {
    marginHorizontal: 16, marginBottom: 14, borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  progressTitle: { color: '#fff', fontWeight: '600', fontSize: 14 },
  progressSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  progressBarWrap: { alignItems: 'flex-end' },
  progressBarBg: { width: 80, height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#F6AD55', borderRadius: 3 },
  progressPct: { color: '#F6AD55', fontSize: 12, fontWeight: '700', marginTop: 4 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8, gap: 6 },
  filterTab: {
    flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 12,
    backgroundColor: COLORS.SURFACE,
  },
  filterText: { fontSize: 12, fontWeight: '600', color: COLORS.TEXT_SECONDARY },
  filterTextActive: { color: '#fff', fontWeight: '700' },
  listContent: { padding: 16, paddingTop: 8, gap: 12, paddingBottom: 30 },
  lessonCard: {
    backgroundColor: COLORS.CARD, borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'flex-start',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  lessonEmoji: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginRight: 14, flexShrink: 0,
  },
  emojiText: { fontSize: 24 },
  lessonContent: { flex: 1 },
  lessonHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  tagText: { fontSize: 11, fontWeight: '600' },
  newBadge: { backgroundColor: COLORS.SUCCESS, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  newBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  lessonTitle: { fontSize: 14, fontWeight: '700', color: COLORS.TEXT, lineHeight: 20, marginBottom: 4 },
  lessonDesc: { fontSize: 12, color: COLORS.TEXT_LIGHT, lineHeight: 17, marginBottom: 8 },
  lessonDuration: { fontSize: 12, color: COLORS.TEXT_LIGHT },
});
