import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { useColors } from '../contexts/ThemeContext';
import { loadLessonProgress } from '../services/storageService';
import { ALL_LESSONS, CATEGORY_INFO, LessonCategory, LessonItem } from '../constants/lessonContent';
import { analyzeSkillGaps, SkillProfile } from '../services/skillAnalysisService';
import { shareCertificate } from '../services/certificateService';

type Filter = 'all' | LessonCategory;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'tl1', label: 'Nền tảng' },
  { key: 'tl2', label: 'Tâm lý' },
  { key: 'tl3', label: 'Điểm Chạm' },
  { key: 'tl4', label: 'Kỹ năng' },
  { key: 'tl5', label: 'Tình huống' },
];

export default function TrainingCenterScreen() {
  const C = useColors();
  const [activeFilter, setActiveFilter] = useState<Filter>('all');
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [skillProfile, setSkillProfile] = useState<SkillProfile | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<any>();

  useFocusEffect(
    useCallback(() => {
      loadLessonProgress().then(setCompletedIds);
      analyzeSkillGaps().then(setSkillProfile);
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLessonProgress().then(setCompletedIds);
    setRefreshing(false);
  }, []);

  const completedCount = completedIds.length;
  const totalCount = ALL_LESSONS.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filtered = activeFilter === 'all'
    ? ALL_LESSONS
    : ALL_LESSONS.filter(l => l.category === activeFilter);

  const renderLesson = ({ item }: { item: LessonItem }) => {
    const cat = CATEGORY_INFO[item.category];
    return (
      <TouchableOpacity
        style={[styles.lessonCard, { backgroundColor: C.CARD }]}
        onPress={() => navigation.navigate('LessonDetail', { lesson: item })}
        activeOpacity={0.7}
      >
        <View style={[styles.lessonEmoji, { backgroundColor: cat.color + '12' }]}>
          <Ionicons name={(item.icon || 'book') as any} size={22} color={cat.color} />
        </View>

        <View style={styles.lessonContent}>
          <View style={styles.lessonHeader}>
            <View style={[styles.tag, { backgroundColor: cat.color + '18' }]}>
              <Text style={[styles.tagText, { color: cat.color }]}>{cat.label}</Text>
            </View>
            {completedIds.includes(item.id) && (
              <View style={[styles.doneBadge, { backgroundColor: COLORS.SUCCESS }]}>
                <Text style={styles.doneBadgeText}>XONG</Text>
              </View>
            )}
          </View>

          <Text style={[styles.lessonTitle, { color: C.TEXT }]} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.lessonDesc} numberOfLines={2}>{item.description}</Text>
          <Text style={styles.lessonDuration}>{item.duration}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: C.BACKGROUND }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: C.BACKGROUND }]}>
        <Text style={[styles.headerTitle, { color: C.TEXT }]}>Đào Tạo</Text>
        <Text style={[styles.headerSub, { color: C.TEXT_LIGHT }]}>Phương pháp Bán bằng Vị thế: THE TRUSTED ADVISOR</Text>
      </View>

      <TouchableOpacity
        style={[styles.progressBanner, { backgroundColor: C.PRIMARY }]}
        onPress={() => completedCount > 0 && shareCertificate('Học viên', completedCount, totalCount)}
        activeOpacity={0.8}
      >
        <View>
          <Text style={styles.progressTitle}>Tiến độ của bạn</Text>
          <Text style={styles.progressSub}>{completedCount} / {totalCount} bài đã hoàn thành</Text>
        </View>
        <View style={styles.progressBarWrap}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPct}%` }]} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <Text style={styles.progressPct}>{progressPct}%</Text>
            {completedCount > 0 && <Ionicons name="share-outline" size={12} color="rgba(255,255,255,0.6)" />}
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.filterRow}>
        {FILTERS.map(f => {
          const active = activeFilter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => setActiveFilter(f.key)}
              style={[styles.filterTab, active && { backgroundColor: C.PRIMARY }]}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderLesson}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.PRIMARY} colors={[C.PRIMARY]} />}
        ListHeaderComponent={
          <>
          {/* Giới thiệu TTA — nổi bật nhất */}
          {activeFilter === 'all' && (
            <TouchableOpacity
              style={[styles.ttaHero, { backgroundColor: C.PRIMARY }]}
              onPress={() => {
                const ttaLesson = ALL_LESSONS.find(l => l.id === 'tta-intro');
                if (ttaLesson) navigation.navigate('LessonDetail', { lesson: ttaLesson });
              }}
              activeOpacity={0.8}
            >
              <View style={styles.ttaBadge}>
                <Ionicons name="shield-checkmark" size={14} color={C.PRIMARY} />
                <Text style={[styles.ttaBadgeText, { color: C.PRIMARY }]}>ĐỘC QUYỀN — COACH DUY NGUYỄN</Text>
              </View>

              <Text style={styles.ttaTitle}>Tư duy Bán bằng Vị Thế</Text>
              <Text style={styles.ttaSubtitle}>& Phương pháp Dẫn Quyết Định 3 Điểm Chạm</Text>

              <View style={styles.ttaDivider} />

              <Text style={styles.ttaDesc}>
                Nâng tầm người bán hàng thành Cố vấn Tin cậy. Không thuyết phục — dẫn dắt khách hàng tự ra quyết định qua 3 Điểm Chạm: Động Lực → Điểm Nghẽn → Con Đường.
              </Text>

              <View style={styles.ttaPoints}>
                <View style={styles.ttaPoint}>
                  <View style={styles.ttaPointDot}><Text style={styles.ttaPointNum}>1</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ttaPointTitle}>Chạm Động Lực</Text>
                    <Text style={styles.ttaPointDesc}>Khơi gợi mục tiêu thật sự của khách</Text>
                  </View>
                </View>
                <View style={styles.ttaPoint}>
                  <View style={styles.ttaPointDot}><Text style={styles.ttaPointNum}>2</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ttaPointTitle}>Chạm Điểm Nghẽn</Text>
                    <Text style={styles.ttaPointDesc}>Giúp khách nhận ra rào cản cốt lõi</Text>
                  </View>
                </View>
                <View style={styles.ttaPoint}>
                  <View style={styles.ttaPointDot}><Text style={styles.ttaPointNum}>3</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ttaPointTitle}>Chạm Con Đường</Text>
                    <Text style={styles.ttaPointDesc}>Đề xuất lộ trình phù hợp — khách tự chọn</Text>
                  </View>
                </View>
              </View>

              <View style={styles.ttaCta}>
                <Text style={styles.ttaCtaText}>Tìm hiểu chi tiết</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </View>
            </TouchableOpacity>
          )}

          {skillProfile && skillProfile.recommendedLessons.length > 0 && activeFilter === 'all' ? (
            <View style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Ionicons name="sparkles" size={16} color={C.PRIMARY} />
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.TEXT }}>Đề xuất cho bạn</Text>
                {skillProfile.weakAreas.length > 0 && (
                  <Text style={{ fontSize: 10, color: C.TEXT_LIGHT, marginLeft: 'auto' }}>
                    Cần cải thiện: {skillProfile.weakAreas.join(', ')}
                  </Text>
                )}
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                {skillProfile.recommendedLessons.map(lesson => {
                  const cat = CATEGORY_INFO[lesson.category];
                  return (
                    <TouchableOpacity
                      key={lesson.id}
                      style={{ width: 160, backgroundColor: C.CARD, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: cat.color + '20' }}
                      onPress={() => navigation.navigate('LessonDetail', { lesson })}
                    >
                      <Ionicons name={(lesson.icon || 'book') as any} size={20} color={cat.color} />
                      <Text style={{ fontSize: 12, fontWeight: '700', color: C.TEXT, marginTop: 6 }} numberOfLines={2}>{lesson.title}</Text>
                      <Text style={{ fontSize: 10, color: cat.color, fontWeight: '600', marginTop: 4 }}>{cat.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}
          </>
        }
      />
    </SafeAreaView>
  );
}

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
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8, gap: 4 },
  filterTab: {
    flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 12,
    backgroundColor: COLORS.SURFACE,
  },
  filterText: { fontSize: 11, fontWeight: '600', color: COLORS.TEXT_SECONDARY },
  filterTextActive: { color: '#fff', fontWeight: '700' },
  listContent: { padding: 16, paddingTop: 8, gap: 12, paddingBottom: 30 },
  lessonCard: {
    backgroundColor: COLORS.CARD, borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'flex-start',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  lessonEmoji: {
    width: 48, height: 48, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginRight: 14, flexShrink: 0,
  },
  emojiText: { fontSize: 24 },
  lessonContent: { flex: 1 },
  lessonHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  tagText: { fontSize: 11, fontWeight: '600' },
  doneBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  doneBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  lessonTitle: { fontSize: 14, fontWeight: '700', color: COLORS.TEXT, lineHeight: 20, marginBottom: 4 },
  lessonDesc: { fontSize: 12, color: COLORS.TEXT_LIGHT, lineHeight: 17, marginBottom: 8 },
  lessonDuration: { fontSize: 12, color: COLORS.TEXT_LIGHT },
  // TTA Hero
  ttaHero: {
    borderRadius: 20, padding: 20, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 6,
  },
  ttaBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5, alignSelf: 'flex-start', marginBottom: 14,
  },
  ttaBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  ttaTitle: { fontSize: 22, fontWeight: '900', color: '#fff', lineHeight: 28 },
  ttaSubtitle: { fontSize: 15, fontWeight: '600', color: 'rgba(255,255,255,0.85)', marginTop: 4, lineHeight: 21 },
  ttaDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 16 },
  ttaDesc: { fontSize: 13, color: 'rgba(255,255,255,0.9)', lineHeight: 20, marginBottom: 16 },
  ttaPoints: { gap: 12, marginBottom: 16 },
  ttaPoint: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ttaPointDot: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  ttaPointNum: { fontSize: 14, fontWeight: '800', color: '#fff' },
  ttaPointTitle: { fontSize: 14, fontWeight: '700', color: '#fff' },
  ttaPointDesc: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 1 },
  ttaCta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingVertical: 12,
  },
  ttaCtaText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
