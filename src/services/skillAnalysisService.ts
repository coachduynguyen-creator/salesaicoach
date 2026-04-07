import { Session, loadSessions } from './storageService';
import { ALL_LESSONS, LessonItem } from '../constants/lessonContent';

export interface SkillProfile {
  totalSessions: number;
  avgScore: number;
  weakAreas: string[];
  strongAreas: string[];
  recommendedLessons: LessonItem[];
  progressLevel: 'beginner' | 'intermediate' | 'advanced';
}

// Map từ analysis keywords sang lesson categories
const SKILL_MAP: Record<string, { category: string; lessonIds: string[] }> = {
  'lắng nghe': { category: 'tl4', lessonIds: ['tl4_01'] },
  'câu hỏi': { category: 'tl4', lessonIds: ['tl4_02'] },
  'phản chiếu': { category: 'tl4', lessonIds: ['tl4_03'] },
  'tín hiệu': { category: 'tl4', lessonIds: ['tl4_04'] },
  'im lặng': { category: 'tl4', lessonIds: ['tl4_05'] },
  'cảm xúc': { category: 'tl4', lessonIds: ['tl4_06'] },
  'giá cao': { category: 'tl5', lessonIds: ['tl5_04'] },
  'suy nghĩ': { category: 'tl5', lessonIds: ['tl5_05'] },
  'đối thủ': { category: 'tl5', lessonIds: ['tl5_06'] },
  'sản phẩm': { category: 'tl3', lessonIds: ['tl3_01', 'tl3_03'] },
  'trust': { category: 'tl1', lessonIds: ['tl1_01', 'tl1_02'] },
  'nỗi sợ': { category: 'tl2', lessonIds: ['tl2_06', 'tl2_07'] },
  'điểm chạm': { category: 'tl3', lessonIds: ['tl3_03', 'tl3_04', 'tl3_05'] },
};

export async function analyzeSkillGaps(): Promise<SkillProfile> {
  const sessions = await loadSessions();

  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      avgScore: 0,
      weakAreas: [],
      strongAreas: [],
      recommendedLessons: ALL_LESSONS.slice(0, 5),
      progressLevel: 'beginner',
    };
  }

  const avgScore = sessions.reduce((s, x) => s + x.score, 0) / sessions.length;

  // Phân tích improvements từ tất cả sessions
  const improvementCounts: Record<string, number> = {};
  const strengthCounts: Record<string, number> = {};

  for (const session of sessions) {
    const analysis = session.analysis;
    if (!analysis) continue;

    // Count improvement keywords
    const improvements = analysis.improvements || [];
    for (const imp of improvements) {
      const lower = (imp as string).toLowerCase();
      for (const [keyword] of Object.entries(SKILL_MAP)) {
        if (lower.includes(keyword)) {
          improvementCounts[keyword] = (improvementCounts[keyword] || 0) + 1;
        }
      }
    }

    // Count strength keywords
    const strengths = analysis.strengths || [];
    for (const str of strengths) {
      const lower = (str as string).toLowerCase();
      for (const [keyword] of Object.entries(SKILL_MAP)) {
        if (lower.includes(keyword)) {
          strengthCounts[keyword] = (strengthCounts[keyword] || 0) + 1;
        }
      }
    }
  }

  // Sort by frequency
  const weakAreas = Object.entries(improvementCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k]) => k);

  const strongAreas = Object.entries(strengthCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k]) => k);

  // Recommend lessons based on weak areas
  const recommendedIds = new Set<string>();
  for (const area of weakAreas) {
    const mapping = SKILL_MAP[area];
    if (mapping) {
      mapping.lessonIds.forEach(id => recommendedIds.add(id));
    }
  }

  // If not enough recommendations, add by score level
  if (recommendedIds.size < 3) {
    if (avgScore < 5) {
      ['tl1_01', 'tl1_02', 'tl1_03'].forEach(id => recommendedIds.add(id));
    } else if (avgScore < 7) {
      ['tl3_03', 'tl3_04', 'tl4_01'].forEach(id => recommendedIds.add(id));
    } else {
      ['tl5_01', 'tl5_02', 'tl5_04'].forEach(id => recommendedIds.add(id));
    }
  }

  const recommendedLessons = ALL_LESSONS.filter(l => recommendedIds.has(l.id)).slice(0, 5);

  const progressLevel: 'beginner' | 'intermediate' | 'advanced' =
    sessions.length < 5 ? 'beginner' :
    avgScore >= 7 ? 'advanced' : 'intermediate';

  return {
    totalSessions: sessions.length,
    avgScore: Math.round(avgScore * 10) / 10,
    weakAreas,
    strongAreas,
    recommendedLessons,
    progressLevel,
  };
}
