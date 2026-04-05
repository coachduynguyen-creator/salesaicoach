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

/**
 * Tải toàn bộ knowledge base từ Supabase Storage
 * Có cache local 24h để không tải lại mỗi lần mở app
 */
export const loadKnowledgeBase = async (): Promise<string> => {
  // Kiểm tra cache
  try {
    const cachedTime = await AsyncStorage.getItem(CACHE_TIME_KEY);
    if (cachedTime) {
      const elapsed = Date.now() - parseInt(cachedTime, 10);
      if (elapsed < CACHE_DURATION) {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          console.log('Knowledge base loaded from cache');
          return cached;
        }
      }
    }
  } catch {
    // Cache lỗi thì tải mới
  }

  // Tải từ Supabase
  try {
    const contents: string[] = [];

    for (const fileName of KNOWLEDGE_FILES) {
      const { data, error } = await supabase.storage
        .from('knowledge')
        .download(fileName);

      if (error) {
        console.warn(`Không tải được ${fileName}:`, error.message);
        continue;
      }

      const text = await data.text();
      contents.push(text);
    }

    if (contents.length === 0) {
      throw new Error('Không tải được file kiến thức nào');
    }

    const fullKnowledge = contents.join('\n\n---\n\n');

    // Lưu cache
    await AsyncStorage.setItem(CACHE_KEY, fullKnowledge);
    await AsyncStorage.setItem(CACHE_TIME_KEY, Date.now().toString());

    console.log(`Knowledge base loaded from cloud: ${contents.length} files, ${fullKnowledge.length} chars`);
    return fullKnowledge;
  } catch (error) {
    console.warn('Lỗi tải knowledge từ cloud, dùng cache cũ nếu có:', error);

    // Fallback về cache cũ (kể cả hết hạn)
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) return cached;

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
