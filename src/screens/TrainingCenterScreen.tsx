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
import { ALL_LESSONS, CATEGORY_INFO, LessonCategory, LessonItem } from '../constants/lessonContent';

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
  const totalCount = ALL_LESSONS.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filtered = activeFilter === 'all'
    ? ALL_LESSONS
    : ALL_LESSONS.filter(l => l.category === activeFilter);

  const renderLesson = ({ item }: { item: LessonItem }) => {
    const cat = CATEGORY_INFO[item.category];
    return (
      <TouchableOpacity
        style={styles.lessonCard}
        onPress={() => navigation.navigate('LessonDetail', { lesson: item })}
        activeOpacity={0.7}
      >
        <View style={[styles.lessonEmoji, { backgroundColor: cat.color + '15' }]}>
          <Text style={styles.emojiText}>{item.emoji}</Text>
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

          <Text style={styles.lessonTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.lessonDesc} numberOfLines={2}>{item.description}</Text>
          <Text style={styles.lessonDuration}>{item.duration}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Đào Tạo</Text>
        <Text style={styles.headerSub}>Phương pháp Bán bằng Vị thế: THE TRUSTED ADVISOR</Text>
      </View>

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
    flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 10,
    backgroundColor: COLORS.SURFACE,
  },
  filterText: { fontSize: 11, fontWeight: '600', color: COLORS.TEXT_SECONDARY },
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
  doneBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  doneBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  lessonTitle: { fontSize: 14, fontWeight: '700', color: COLORS.TEXT, lineHeight: 20, marginBottom: 4 },
  lessonDesc: { fontSize: 12, color: COLORS.TEXT_LIGHT, lineHeight: 17, marginBottom: 8 },
  lessonDuration: { fontSize: 12, color: COLORS.TEXT_LIGHT },
});
