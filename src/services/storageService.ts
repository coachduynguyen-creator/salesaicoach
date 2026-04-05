import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnalysisResult } from './aiService';

const KEYS = {
  CLAUDE_API_KEY: '@salescoach_claude_key',
  OPENAI_API_KEY: '@salescoach_openai_key',
  SESSIONS: '@salescoach_sessions',
};

// ─── Session Types ────────────────────────────────────────────────────────────

export interface Session {
  id: string;
  customerName: string;
  companyName: string;
  date: string;        // "dd/mm/yyyy"
  duration: number;    // giây
  score: number;
  analysis: AnalysisResult;
}

// ─── Session Storage ──────────────────────────────────────────────────────────

export const saveSessions = async (sessions: Session[]): Promise<void> => {
  await AsyncStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));
};

export const loadSessions = async (): Promise<Session[]> => {
  const raw = await AsyncStorage.getItem(KEYS.SESSIONS);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Session[];
  } catch {
    return [];
  }
};

export const addSession = async (session: Omit<Session, 'id'>): Promise<Session> => {
  const sessions = await loadSessions();
  const newSession: Session = { ...session, id: Date.now().toString() };
  await saveSessions([newSession, ...sessions]);
  return newSession;
};

export const deleteSession = async (id: string): Promise<void> => {
  const sessions = await loadSessions();
  await saveSessions(sessions.filter(s => s.id !== id));
};

export interface ApiKeys {
  claudeKey: string;
  openaiKey: string;
}

// Lưu API keys vào bộ nhớ điện thoại
export const saveApiKeys = async (keys: ApiKeys): Promise<void> => {
  await AsyncStorage.multiSet([
    [KEYS.CLAUDE_API_KEY, keys.claudeKey],
    [KEYS.OPENAI_API_KEY, keys.openaiKey],
  ]);
};

// Đọc API keys từ bộ nhớ điện thoại
export const loadApiKeys = async (): Promise<ApiKeys> => {
  const results = await AsyncStorage.multiGet([
    KEYS.CLAUDE_API_KEY,
    KEYS.OPENAI_API_KEY,
  ]);
  return {
    claudeKey: results[0][1] ?? '',
    openaiKey: results[1][1] ?? '',
  };
};

// Xóa toàn bộ API keys
export const clearApiKeys = async (): Promise<void> => {
  await AsyncStorage.multiRemove([KEYS.CLAUDE_API_KEY, KEYS.OPENAI_API_KEY]);
};
