import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnalysisResult } from './aiService';

const KEYS = {
  CLAUDE_API_KEY: '@salescoach_claude_key',
  OPENAI_API_KEY: '@salescoach_openai_key',
  SESSIONS: '@salescoach_sessions',
  BUSINESS_PROFILE: '@salescoach_business_profile',
  CONVERSATIONS: '@salescoach_conversations',
  LESSON_PROGRESS: '@salescoach_lesson_progress',
  TEAM_MEMBERS: '@salescoach_team_members',
  CUSTOMERS: '@salescoach_customers',
};

// ─── Business Profile ─────────────────────────────────────────────────────────

export interface BusinessProfile {
  companyName: string;
  industry: string;
  products: string;
  targetCustomer: string;
  competitors: string;
  uniqueValue: string;
  commonObjections: string;
  additionalContext: string;
}

export const EMPTY_PROFILE: BusinessProfile = {
  companyName: '',
  industry: '',
  products: '',
  targetCustomer: '',
  competitors: '',
  uniqueValue: '',
  commonObjections: '',
  additionalContext: '',
};

export const saveBusinessProfile = async (profile: BusinessProfile): Promise<void> => {
  await AsyncStorage.setItem(KEYS.BUSINESS_PROFILE, JSON.stringify(profile));
};

export const loadBusinessProfile = async (): Promise<BusinessProfile> => {
  const raw = await AsyncStorage.getItem(KEYS.BUSINESS_PROFILE);
  if (!raw) return EMPTY_PROFILE;
  try {
    return JSON.parse(raw) as BusinessProfile;
  } catch {
    return EMPTY_PROFILE;
  }
};

export const buildBusinessContext = (profile: BusinessProfile): string => {
  const parts: string[] = [];
  if (profile.companyName) parts.push(`Công ty: ${profile.companyName}`);
  if (profile.industry) parts.push(`Ngành: ${profile.industry}`);
  if (profile.products) parts.push(`Sản phẩm/Dịch vụ:\n${profile.products}`);
  if (profile.targetCustomer) parts.push(`Chân dung khách hàng mục tiêu:\n${profile.targetCustomer}`);
  if (profile.competitors) parts.push(`Đối thủ cạnh tranh:\n${profile.competitors}`);
  if (profile.uniqueValue) parts.push(`Giá trị khác biệt:\n${profile.uniqueValue}`);
  if (profile.commonObjections) parts.push(`Các phản đối thường gặp:\n${profile.commonObjections}`);
  if (profile.additionalContext) parts.push(`Thông tin bổ sung:\n${profile.additionalContext}`);

  if (parts.length === 0) return '';

  return `\n\n---\nTHÔNG TIN DOANH NGHIỆP CỦA NGƯỜI DÙNG (dùng để cá nhân hóa câu trả lời):\n\n${parts.join('\n\n')}`;
};

// ─── Session Types ────────────────────────────────────────────────────────────

export type SessionOutcome = 'won' | 'lost' | 'pending';

export interface Session {
  id: string;
  customerName: string;
  companyName: string;
  date: string;        // "dd/mm/yyyy"
  duration: number;    // giây
  score: number;
  analysis: AnalysisResult;
  outcome?: SessionOutcome;
  audioUri?: string;   // Lưu URI ghi âm để nghe lại
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

export const updateSessionOutcome = async (id: string, outcome: SessionOutcome): Promise<void> => {
  const sessions = await loadSessions();
  const idx = sessions.findIndex(s => s.id === id);
  if (idx === -1) return;
  sessions[idx].outcome = outcome;
  await saveSessions(sessions);
};

// ─── Lesson Progress ─────────────────────────────────────────────────────────

export const loadLessonProgress = async (): Promise<string[]> => {
  const raw = await AsyncStorage.getItem(KEYS.LESSON_PROGRESS);
  if (!raw) return [];
  try { return JSON.parse(raw) as string[]; } catch { return []; }
};

export const markLessonComplete = async (lessonId: string): Promise<string[]> => {
  const progress = await loadLessonProgress();
  if (!progress.includes(lessonId)) {
    progress.push(lessonId);
    await AsyncStorage.setItem(KEYS.LESSON_PROGRESS, JSON.stringify(progress));
  }
  return progress;
};

// ─── Team Members ────────────────────────────────────────────────────────────

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  joinedAt: string;
}

export const loadTeamMembers = async (): Promise<TeamMember[]> => {
  const raw = await AsyncStorage.getItem(KEYS.TEAM_MEMBERS);
  if (!raw) return [];
  try { return JSON.parse(raw) as TeamMember[]; } catch { return []; }
};

export const addTeamMember = async (name: string, role: string): Promise<TeamMember> => {
  const members = await loadTeamMembers();
  const member: TeamMember = { id: Date.now().toString(), name, role, joinedAt: new Date().toISOString() };
  await AsyncStorage.setItem(KEYS.TEAM_MEMBERS, JSON.stringify([...members, member]));
  return member;
};

export const removeTeamMember = async (id: string): Promise<void> => {
  const members = await loadTeamMembers();
  await AsyncStorage.setItem(KEYS.TEAM_MEMBERS, JSON.stringify(members.filter(m => m.id !== id)));
};

// ─── Conversations (AI Coach Chat History) ───────────────────────────────────

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO string
}

export interface Conversation {
  id: string;
  title: string;
  preview: string;
  createdAt: string;  // ISO string
  updatedAt: string;  // ISO string
  messages: ConversationMessage[];
}

export const loadConversations = async (): Promise<Conversation[]> => {
  const raw = await AsyncStorage.getItem(KEYS.CONVERSATIONS);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Conversation[];
  } catch {
    return [];
  }
};

export const saveConversations = async (conversations: Conversation[]): Promise<void> => {
  await AsyncStorage.setItem(KEYS.CONVERSATIONS, JSON.stringify(conversations));
};

export const addConversation = async (title: string): Promise<Conversation> => {
  const conversations = await loadConversations();
  const now = new Date().toISOString();
  const newConv: Conversation = {
    id: Date.now().toString(),
    title,
    preview: '',
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
  await saveConversations([newConv, ...conversations]);
  return newConv;
};

export const updateConversation = async (
  id: string,
  messages: ConversationMessage[],
  title?: string,
): Promise<void> => {
  const conversations = await loadConversations();
  const idx = conversations.findIndex(c => c.id === id);
  if (idx === -1) return;

  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
  conversations[idx].messages = messages;
  conversations[idx].updatedAt = new Date().toISOString();
  if (lastUserMsg) {
    conversations[idx].preview = lastUserMsg.content.slice(0, 80);
  }
  if (title) {
    conversations[idx].title = title;
  }
  await saveConversations(conversations);
};

export const deleteConversation = async (id: string): Promise<void> => {
  const conversations = await loadConversations();
  await saveConversations(conversations.filter(c => c.id !== id));
};

// ─── API Keys ────────────────────────────────────────────────────────────────

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

// ─── Customer CRM ──────────────────────────────────────────────────────────

export interface CustomerNote {
  date: string;
  content: string;
  sessionId?: string;
}

// ICP — Chân dung khách hàng theo 12 tiêu chí
export interface ICPProfile {
  // I. Tổng quan
  role: string;              // Vai trò / nghề nghiệp
  ageRange: string;          // Độ tuổi / giới tính / khu vực
  income: string;            // Thu nhập / doanh thu / quy mô
  experience: string;        // Trình độ / kinh nghiệm
  techLevel: string;         // Mức sử dụng công nghệ
  currentSituation: string;  // Tình trạng hiện tại

  // II. Tâm lý
  painPoints: string;        // Nỗi đau (3-5 vấn đề)
  deepFears: string;         // Nỗi sợ sâu nhất
  desires: string;           // Ước mơ / khát vọng
  limitingBeliefs: string;   // Niềm tin giới hạn
  emotionStyle: string;      // Cảm xúc chủ đạo khi ra quyết định
  decisionStyle: string;     // Phong cách ra quyết định

  // III. Jobs To Be Done
  functionalJob: string;     // Công việc chức năng muốn hoàn thành
  emotionalJob: string;      // Công việc cảm xúc
  socialJob: string;         // Công việc xã hội
  goals: string;             // Mục tiêu ngắn/trung/dài hạn

  // IV. Hành vi mua hàng
  awarenessLevel: string;    // 1-5 mức nhận thức
  preferredChannels: string; // Kênh tìm hiểu
  influencers: string;       // Người ảnh hưởng tới quyết định
  buyingBarriers: string;    // Rào cản ra quyết định
  buyingTriggers: string;    // Yếu tố kích hoạt mua
  proofType: string;         // Loại bằng chứng họ tin

  // V. Nguồn lực & rủi ro
  investBudget: string;      // Ngân sách đầu tư
  timeCommit: string;        // Thời gian có thể dành
  biggestRisk: string;       // Rủi ro sợ nhất

  // VIII. Phân loại
  fitLevel: string;          // Kim Cương / Vàng / Bạc / Đồng
}

export interface DecisionMaker {
  name: string;
  role: string;              // Vai trò trong quyết định (người quyết định, người ảnh hưởng, người sử dụng)
  attitude: string;          // Thái độ: ủng hộ / trung lập / phản đối
  notes: string;             // Ghi chú về người này
}

export interface CustomerProfile {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  // AI-extracted core fields
  needs: string;
  budget: string;
  concerns: string;
  stage: string;             // Giai đoạn: mới tiếp cận / đang tìm hiểu / đang so sánh / sắp chốt / đã chốt
  decisionFactors: string;
  personality: string;
  nextStep: string;
  // ICP mở rộng
  icp: Partial<ICPProfile>;
  decisionMakers: DecisionMaker[];
  leadScore: number;         // 0-100 điểm tiềm năng
  customFields: Record<string, string>; // Tiêu chí sales tự thêm
  // Metadata
  notes: CustomerNote[];
  sessionIds: string[];
  createdAt: string;
  updatedAt: string;
}

export const loadCustomers = async (): Promise<CustomerProfile[]> => {
  const raw = await AsyncStorage.getItem(KEYS.CUSTOMERS);
  if (!raw) return [];
  try { return JSON.parse(raw) as CustomerProfile[]; } catch { return []; }
};

export const saveCustomers = async (customers: CustomerProfile[]): Promise<void> => {
  await AsyncStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(customers));
};

export const addCustomer = async (customer: Omit<CustomerProfile, 'id' | 'createdAt' | 'updatedAt' | 'notes' | 'sessionIds' | 'icp' | 'decisionMakers' | 'leadScore' | 'customFields'> & { icp?: Partial<ICPProfile> }): Promise<CustomerProfile> => {
  const customers = await loadCustomers();
  const now = new Date().toISOString();
  const newCustomer: CustomerProfile = {
    ...customer,
    id: Date.now().toString(),
    icp: customer.icp || {},
    decisionMakers: [],
    leadScore: 0,
    customFields: {},
    notes: [],
    sessionIds: [],
    createdAt: now,
    updatedAt: now,
  };
  await saveCustomers([newCustomer, ...customers]);
  return newCustomer;
};

export const updateCustomer = async (id: string, updates: Partial<CustomerProfile>): Promise<void> => {
  const customers = await loadCustomers();
  const idx = customers.findIndex(c => c.id === id);
  if (idx === -1) return;
  customers[idx] = { ...customers[idx], ...updates, updatedAt: new Date().toISOString() };
  await saveCustomers(customers);
};

export const findCustomerByName = async (name: string): Promise<CustomerProfile | undefined> => {
  const customers = await loadCustomers();
  const lower = name.toLowerCase().trim();
  return customers.find(c => c.name.toLowerCase().trim() === lower);
};

export const deleteCustomer = async (id: string): Promise<void> => {
  const customers = await loadCustomers();
  await saveCustomers(customers.filter(c => c.id !== id));
};

// Tính điểm tiềm năng dựa trên thông tin đã thu thập
export const calculateLeadScore = (customer: CustomerProfile): number => {
  let score = 0;
  const max = 100;

  // Core fields (40 điểm)
  if (customer.needs) score += 8;
  if (customer.budget) score += 8;
  if (customer.stage) {
    const s = customer.stage.toLowerCase();
    if (s.includes('chốt') || s.includes('đã chốt')) score += 12;
    else if (s.includes('so sánh')) score += 10;
    else if (s.includes('tìm hiểu')) score += 6;
    else score += 3;
  }
  if (customer.decisionFactors) score += 6;
  if (customer.nextStep) score += 6;

  // ICP fields (40 điểm)
  const icp = customer.icp || {};
  const icpFields = [
    icp.painPoints, icp.deepFears, icp.desires, icp.buyingTriggers,
    icp.investBudget, icp.influencers, icp.functionalJob, icp.awarenessLevel,
  ];
  score += icpFields.filter(Boolean).length * 5;

  // Decision makers (10 điểm)
  if (customer.decisionMakers?.length) score += Math.min(10, customer.decisionMakers.length * 5);

  // Engagement (10 điểm)
  const sessions = customer.sessionIds?.length || 0;
  score += Math.min(10, sessions * 3);

  return Math.min(max, score);
};
