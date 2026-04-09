import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseClient';

const CACHE_KEY = '@salescoach_knowledge_cache';
const CACHE_TIME_KEY = '@salescoach_knowledge_cache_time';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 giờ

const KNOWLEDGE_FILES = [
  'TTA-TL1.md',
  'TTA-TL2.md',
  'TTA-TL3.md',
  'TTA-TL4.md',
  'TTA-TL5.md',
];

export type KnowledgeSource = 'cloud' | 'cache' | 'stale_cache';

interface KnowledgeResult {
  content: string;
  source: KnowledgeSource;
}

/**
 * Tải toàn bộ knowledge base từ Supabase Storage
 * Có cache local 24h để không tải lại mỗi lần mở app
 */
export const loadKnowledgeBase = async (): Promise<KnowledgeResult> => {
  // Kiểm tra cache còn hạn
  try {
    const cachedTime = await AsyncStorage.getItem(CACHE_TIME_KEY);
    if (cachedTime) {
      const elapsed = Date.now() - parseInt(cachedTime, 10);
      if (elapsed < CACHE_DURATION) {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          return { content: cached, source: 'cache' };
        }
      }
    }
  } catch {
    // Cache lỗi thì tải mới
  }

  // Tải từ Supabase — dùng public URL (nhanh hơn, không cần auth)
  try {
    const contents: string[] = [];
    const baseUrl = 'https://zylhbymktdtmitxsunqv.supabase.co/storage/v1/object/public/knowledge';

    for (const fileName of KNOWLEDGE_FILES) {
      try {
        const response = await fetch(`${baseUrl}/${fileName}`);
        if (!response.ok) continue;
        const text = await response.text();
        if (text && text.length > 100) contents.push(text);
      } catch {
        continue;
      }
    }

    if (contents.length === 0) {
      throw new Error('Không tải được file kiến thức nào');
    }

    const fullKnowledge = contents.join('\n\n---\n\n');

    // Lưu cache
    await AsyncStorage.setItem(CACHE_KEY, fullKnowledge);
    await AsyncStorage.setItem(CACHE_TIME_KEY, Date.now().toString());

    console.log(`Knowledge loaded from cloud: ${contents.length} files, ${fullKnowledge.length} chars`);
    return { content: fullKnowledge, source: 'cloud' };
  } catch (error) {
    // Fallback về cache cũ (hết hạn) — báo cho user biết
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      return { content: cached, source: 'stale_cache' };
    }

    throw new Error('Không có kiến thức. Kiểm tra kết nối internet.');
  }
};

/**
 * Xóa cache để buộc tải lại từ cloud
 */
export const clearKnowledgeCache = async (): Promise<void> => {
  await AsyncStorage.multiRemove([CACHE_KEY, CACHE_TIME_KEY]);
};

/**
 * Lấy danh sách files trên cloud
 */
export const listKnowledgeFiles = async (): Promise<{ name: string; size: number; updatedAt: string }[]> => {
  const { data, error } = await supabase.storage
    .from('knowledge')
    .list('', { sortBy: { column: 'name', order: 'asc' } });

  if (error) throw error;

  return (data || []).map(f => ({
    name: f.name,
    size: f.metadata?.size || 0,
    updatedAt: f.updated_at || '',
  }));
};
