import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Markdown from 'react-native-markdown-display';
import { COLORS } from '../constants/colors';
import { useColors } from '../contexts/ThemeContext';
import { markLessonComplete, loadLessonProgress } from '../services/storageService';
import { CATEGORY_INFO, LessonItem } from '../constants/lessonContent';

type LessonDetailRouteParams = {
  LessonDetail: {
    lesson: LessonItem;
  };
};

export default function LessonDetailScreen() {
  const C = useColors();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<LessonDetailRouteParams, 'LessonDetail'>>();
  const { lesson } = route.params;

  const cat = CATEGORY_INFO[lesson.category];
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    loadLessonProgress().then(ids => setCompleted(ids.includes(lesson.id)));
  }, [lesson.id]);

  const handleComplete = async () => {
    await markLessonComplete(lesson.id);
    setCompleted(true);
  };

  const mdStyles = StyleSheet.create({
    body: { fontSize: 15, color: COLORS.TEXT, lineHeight: 24 },
    strong: { fontWeight: '700', color: COLORS.TEXT },
    paragraph: { marginBottom: 10 },
    bullet_list: { marginBottom: 8 },
    ordered_list: { marginBottom: 8 },
    list_item: { marginBottom: 4 },
    blockquote: {
      backgroundColor: cat.color + '08',
      borderLeftColor: cat.color,
      borderLeftWidth: 3,
      paddingLeft: 12,
      paddingVertical: 8,
      marginVertical: 8,
      borderRadius: 4,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.TEXT} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>{cat.label}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={[styles.heroEmoji, { backgroundColor: cat.color + '15' }]}>
            <Text style={styles.emojiText}>{lesson.emoji}</Text>
          </View>
          <View style={[styles.tagBadge, { backgroundColor: cat.color + '18' }]}>
            <Text style={[styles.tagBadgeText, { color: cat.color }]}>{cat.label}</Text>
          </View>
          <Text style={styles.heroTitle}>{lesson.title}</Text>
          <Text style={styles.heroMeta}>{lesson.duration}</Text>
        </View>

        {/* Content */}
        <View style={styles.contentCard}>
          <Markdown style={mdStyles}>{lesson.content}</Markdown>
        </View>

        {/* Key Lesson */}
        <View style={[styles.keyLessonBox, { backgroundColor: cat.color + '08', borderColor: cat.color + '20' }]}>
          <Text style={[styles.keyLessonTitle, { color: cat.color }]}>Bài học lớn nhất</Text>
          <Text style={styles.keyLessonText}>{lesson.keyLesson}</Text>
        </View>

        {/* Mark Complete */}
        {!completed ? (
          <TouchableOpacity
            style={[styles.completeBtn, { backgroundColor: C.PRIMARY }]}
            onPress={handleComplete}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
            <Text style={styles.completeBtnText}>Đã hiểu, hoàn thành bài này</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.completeBtn, { backgroundColor: COLORS.SUCCESS }]}>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.completeBtnText}>Đã hoàn thành</Text>
          </View>
        )}

        {/* Practice */}
        <TouchableOpacity
          style={[styles.practiceBox, { backgroundColor: C.PRIMARY + '10', borderColor: C.PRIMARY + '20' }]}
          onPress={() => navigation.navigate('GhiAm' as never)}
        >
          <Text style={[styles.practiceTitle, { color: C.PRIMARY }]}>Thực hành ngay</Text>
          <Text style={styles.practiceText}>Ghi âm buổi tư vấn, AI sẽ đánh giá theo TTA</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.CARD, paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.BORDER,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: COLORS.SURFACE },
  topBarTitle: { fontSize: 15, fontWeight: '600', color: COLORS.TEXT, flex: 1, textAlign: 'center' },
  scroll: { padding: 20, paddingBottom: 40 },

  hero: { alignItems: 'center', marginBottom: 24 },
  heroEmoji: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  emojiText: { fontSize: 40 },
  tagBadge: { paddingHorizontal: 14, paddingVertical: 4, borderRadius: 12, marginBottom: 10 },
  tagBadgeText: { fontSize: 12, fontWeight: '700' },
  heroTitle: { fontSize: 22, fontWeight: '800', color: COLORS.TEXT, textAlign: 'center', lineHeight: 30, marginBottom: 6 },
  heroMeta: { fontSize: 13, color: COLORS.TEXT_LIGHT },

  contentCard: {
    backgroundColor: COLORS.CARD, borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },

  keyLessonBox: { borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1 },
  keyLessonTitle: { fontSize: 15, fontWeight: '700', marginBottom: 8 },
  keyLessonText: { fontSize: 14, color: COLORS.TEXT, lineHeight: 22, fontWeight: '600' },

  completeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 12, paddingVertical: 14, marginBottom: 12,
  },
  completeBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  practiceBox: {
    borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1,
  },
  practiceTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  practiceText: { fontSize: 12, color: COLORS.TEXT_LIGHT, textAlign: 'center' },
});
