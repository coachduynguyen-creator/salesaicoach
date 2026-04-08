import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnalysisResult } from './aiService';
import { pushSession, pushCustomer, pushConversation, pushLessonProgress, pushSessionOutcome } from './syncService';

// ─── Sync Helper: lấy userId/teamId hiện tại ────────────────────────────────
let _syncUserId: string | null = null;
let _syncTeamId: string | null = null;

export function setSyncContext(userId: string | null, teamId: string | null) {
  _syncUserId = userId;
  _syncTeamId = teamId;
}

const KEYS = {
  CLAUDE_API_KEY: '@salescoach_claude_key',
  OPENAI_API_KEY: '@salescoach_openai_key',
  SESSIONS: '@salescoach_sessions',
  BUSINESS_PROFILE: '@salescoach_business_profile',
  CONVERSATIONS: '@salescoach_conversations',
  LESSON_PROGRESS: '@salescoach_lesson_progress',
  TEAM_MEMBERS: '@salescoach_team_members',
  CUSTOMERS: '@salescoach_customers',
  CUSTOMER_STATUSES: '@salescoach_customer_statuses',
};

// ─── Customer Status (tùy chỉnh được) ──────────────────────────────────────

export interface CustomerStatus {
  id: string;
  label: string;
  color: string;
  order: number;
}

export const DEFAULT_STATUSES: CustomerStatus[] = [
  { id: 'new', label: 'Mới tiếp cận', color: '#9F7AEA', order: 0 },
  { id: 'callback', label: 'Bận — gọi lại', color: '#F59E0B', order: 1 },
  { id: 'interested', label: 'Đang tìm hiểu', color: '#3B82F6', order: 2 },
  { id: 'comparing', label: 'Đang so sánh', color: '#F97316', order: 3 },
  { id: 'negotiating', label: 'Đang thương lượng', color: '#8B5CF6', order: 4 },
  { id: 'closing', label: 'Sắp chốt', color: '#10B981', order: 5 },
  { id: 'won', label: 'Đã chốt', color: '#059669', order: 6 },
  { id: 'lost', label: 'Mất deal', color: '#EF4444', order: 7 },
  { id: 'nurturing', label: 'Chăm sóc dài hạn', color: '#6B7280', order: 8 },
];

export const loadCustomerStatuses = async (): Promise<CustomerStatus[]> => {
  const raw = await AsyncStorage.getItem(KEYS.CUSTOMER_STATUSES);
  if (!raw) return DEFAULT_STATUSES;
  try { return JSON.parse(raw) as CustomerStatus[]; } catch { return DEFAULT_STATUSES; }
};

export const saveCustomerStatuses = async (statuses: CustomerStatus[]): Promise<void> => {
  await AsyncStorage.setItem(KEYS.CUSTOMER_STATUSES, JSON.stringify(statuses));
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
  if (_syncUserId && _syncTeamId) pushSession(newSession, _syncUserId, _syncTeamId);
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
  if (_syncTeamId) pushSessionOutcome(sessions[idx].date, sessions[idx].customerName, outcome, _syncTeamId);
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
    if (_syncUserId) pushLessonProgress(lessonId, _syncUserId);
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
  customerId?: string;  // Liên kết với khách hàng CRM
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

export const addConversation = async (title: string, customerId?: string): Promise<Conversation> => {
  const conversations = await loadConversations();
  const now = new Date().toISOString();
  const newConv: Conversation = {
    id: Date.now().toString(),
    title,
    preview: '',
    createdAt: now,
    updatedAt: now,
    messages: [],
    customerId,
  };
  await saveConversations([newConv, ...conversations]);
  if (_syncUserId) pushConversation(newConv, _syncUserId, _syncTeamId);
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
  if (_syncUserId) pushConversation(conversations[idx], _syncUserId, _syncTeamId);
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

// Hệ thống chấm điểm tiềm năng — 5 tiêu chí, mỗi tiêu chí 0-20 điểm
export interface LeadScoringCriteria {
  score: number;       // 0-20
  level: string;       // Mô tả mức (VD: "Rất phù hợp", "Chưa rõ"...)
  detail: string;      // Giải thích ngắn
}

export interface LeadScoring {
  productFit: LeadScoringCriteria;      // Sản phẩm phù hợp
  financialFit: LeadScoringCriteria;    // Tài chính phù hợp
  decisionMakerAccess: LeadScoringCriteria; // Gặp được người QĐ
  timeline: LeadScoringCriteria;        // Thời gian ra quyết định
  engagement: LeadScoringCriteria;      // Số lần tương tác
}

export const EMPTY_SCORING: LeadScoring = {
  productFit: { score: 0, level: 'Chưa đánh giá', detail: '' },
  financialFit: { score: 0, level: 'Chưa đánh giá', detail: '' },
  decisionMakerAccess: { score: 0, level: 'Chưa đánh giá', detail: '' },
  timeline: { score: 0, level: 'Chưa đánh giá', detail: '' },
  engagement: { score: 0, level: 'Chưa đánh giá', detail: '' },
};

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
  photoUri?: string;           // Ảnh khách hàng (local file URI)
  // AI-extracted core fields
  needs: string;
  budget: string;
  concerns: string;
  stage: string;             // Giai đoạn text (legacy / AI-generated)
  statusId: string;          // ID trạng thái CRM (tùy chỉnh được)
  decisionFactors: string;
  personality: string;
  nextStep: string;
  productOffered?: string;    // Sản phẩm/dịch vụ đang tư vấn cho khách này
  // ICP mở rộng
  icp: Partial<ICPProfile>;
  decisionMakers: DecisionMaker[];
  leadScore: number;         // 0-100 tổng điểm
  scoring: LeadScoring;      // Chi tiết từng tiêu chí
  aiRecommendation: string;  // Đề xuất AI dựa trên hồ sơ
  customFields: Record<string, string>;
  // Metadata
  notes: CustomerNote[];
  sessionIds: string[];
  lastContactAt?: string;  // ISO string — lần tương tác gần nhất (gọi, ghi chú, chat)
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

export const addCustomer = async (customer: Omit<CustomerProfile, 'id' | 'createdAt' | 'updatedAt' | 'notes' | 'sessionIds' | 'icp' | 'decisionMakers' | 'leadScore' | 'scoring' | 'aiRecommendation' | 'customFields'> & { icp?: Partial<ICPProfile> }): Promise<CustomerProfile> => {
  const customers = await loadCustomers();
  const now = new Date().toISOString();
  const newCustomer: CustomerProfile = {
    ...customer,
    id: Date.now().toString(),
    icp: customer.icp || {},
    decisionMakers: [],
    leadScore: 0,
    scoring: EMPTY_SCORING,
    aiRecommendation: '',
    customFields: {},
    notes: [],
    sessionIds: [],
    createdAt: now,
    updatedAt: now,
  };
  await saveCustomers([newCustomer, ...customers]);
  if (_syncUserId && _syncTeamId) pushCustomer(newCustomer, _syncUserId, _syncTeamId);
  return newCustomer;
};

export const updateCustomer = async (id: string, updates: Partial<CustomerProfile>): Promise<void> => {
  const customers = await loadCustomers();
  const idx = customers.findIndex(c => c.id === id);
  if (idx === -1) return;
  customers[idx] = { ...customers[idx], ...updates, updatedAt: new Date().toISOString() };
  await saveCustomers(customers);
  if (_syncUserId && _syncTeamId) pushCustomer(customers[idx], _syncUserId, _syncTeamId);
};

// Thêm ghi chú thủ công + cập nhật lastContactAt
export const addCustomerNote = async (id: string, content: string, type?: string): Promise<void> => {
  const customers = await loadCustomers();
  const idx = customers.findIndex(c => c.id === id);
  if (idx === -1) return;
  const now = new Date();
  const note: CustomerNote = {
    date: now.toLocaleDateString('vi-VN'),
    content: type ? `[${type}] ${content}` : content,
  };
  customers[idx].notes = [note, ...(customers[idx].notes || [])];
  customers[idx].lastContactAt = now.toISOString();
  customers[idx].updatedAt = now.toISOString();
  await saveCustomers(customers);
  if (_syncUserId && _syncTeamId) pushCustomer(customers[idx], _syncUserId, _syncTeamId);
};

// Cập nhật lastContactAt khi có bất kỳ tương tác nào
export const touchCustomerContact = async (id: string): Promise<void> => {
  const customers = await loadCustomers();
  const idx = customers.findIndex(c => c.id === id);
  if (idx === -1) return;
  customers[idx].lastContactAt = new Date().toISOString();
  customers[idx].updatedAt = new Date().toISOString();
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

// Tính tổng điểm từ 5 tiêu chí scoring
export const calculateLeadScore = (customer: CustomerProfile): number => {
  const s = customer.scoring || EMPTY_SCORING;
  return s.productFit.score + s.financialFit.score + s.decisionMakerAccess.score + s.timeline.score + s.engagement.score;
};

// Tự động tính engagement score từ dữ liệu
export const autoUpdateEngagement = (customer: CustomerProfile): LeadScoringCriteria => {
  const count = customer.sessionIds?.length || 0;
  if (count >= 5) return { score: 20, level: 'Rất tích cực', detail: `${count} cuộc gọi — khách rất quan tâm` };
  if (count >= 3) return { score: 15, level: 'Tích cực', detail: `${count} cuộc gọi — đang tương tác tốt` };
  if (count >= 2) return { score: 10, level: 'Trung bình', detail: `${count} cuộc gọi` };
  if (count >= 1) return { score: 5, level: 'Mới bắt đầu', detail: `${count} cuộc gọi — cần tương tác thêm` };
  return { score: 0, level: 'Chưa tương tác', detail: 'Chưa có cuộc gọi nào' };
};
