// ─── Config ─────────────────────────────────────────────────────────────────
import { Platform } from 'react-native';
import { DEFAULT_CLAUDE_KEY, DEFAULT_OPENAI_KEY } from '../config/defaultKeys';
import { logAIUsage, checkAIQuota } from './databaseService';
import { supabase } from './supabaseClient';
import { AITier, getAnalysisPrompt, getCoachPrompt, getMaxTokens } from '../config/systemPrompts';
import { getAITier } from './subscriptionService';

const EDGE_FUNCTION_URL = 'https://zylhbymktdtmitxsunqv.supabase.co/functions/v1/ai-proxy';

let OPENAI_API_KEY = DEFAULT_OPENAI_KEY;    // Fallback khi chưa login
let CLAUDE_API_KEY = DEFAULT_CLAUDE_KEY;    // Fallback khi chưa login
let USE_PROXY = false;                       // Dùng Edge Function proxy khi có auth

// Sync context cho AI usage logging
let _aiUserId: string | null = null;
let _aiTeamId: string | null = null;

export const setAISyncContext = (userId: string | null, teamId: string | null) => {
  _aiUserId = userId;
  _aiTeamId = teamId;
  USE_PROXY = !!userId; // Dùng proxy khi đã login (bảo mật API key)
};

const checkQuota = async () => {
  if (!_aiUserId || !_aiTeamId) return;
  const { allowed, used, limit } = await checkAIQuota(_aiUserId, _aiTeamId);
  if (!allowed) {
    throw new Error(`Bạn đã sử dụng hết ${limit} lượt AI trong tháng này (đã dùng ${used}). Liên hệ admin để tăng hạn mức.`);
  }
};

const logUsage = (action: string, model: string, durationMs: number, inputTokens = 0, outputTokens = 0) => {
  if (!_aiUserId) return;
  logAIUsage({
    user_id: _aiUserId,
    team_id: _aiTeamId,
    action: action as any,
    model,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    duration_ms: durationMs,
  }).catch(() => {});
};

/** Gọi Claude qua Edge Function proxy (bảo mật, key trên server) */
const callClaudeProxy = async (payload: any): Promise<any> => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('Chưa đăng nhập');

  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ action: payload.action || 'chat', payload: payload.body }),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => '');
    throw new Error(`Proxy error ${response.status}: ${err}`);
  }
  return response.json();
};

const fetchWithRetry = async (url: string, options: RequestInit, maxRetries = 2): Promise<Response> => {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      // Timeout 3 phút cho mỗi request (ghi âm dài cần thời gian)
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 180000);
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeout);
      if (response.status === 429 && i < maxRetries) {
        await new Promise(r => setTimeout(r, Math.pow(2, i) * 1500));
        continue;
      }
      return response;
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        throw new Error('Xử lý quá lâu. Thử ghi âm ngắn hơn hoặc kiểm tra kết nối mạng.');
      }
      if (i === maxRetries) throw err;
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
  throw new Error('Không thể kết nối. Kiểm tra kết nối mạng.');
};

export const setApiKeys = (openaiKey: string, claudeKey: string) => {
  OPENAI_API_KEY = openaiKey || DEFAULT_OPENAI_KEY;
  CLAUDE_API_KEY = claudeKey || DEFAULT_CLAUDE_KEY;
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AnalysisResult {
  score: number;
  summary: string[];
  strengths: string[];
  improvements: string[];
  strategies: string[];
  // Mới: phân tích sâu hơn
  communication?: {
    tone: string;         // Đánh giá tác phong, giọng nói
    listening: string;    // Kỹ năng lắng nghe
    questioning: string;  // Kỹ năng đặt câu hỏi
  };
  scenario?: {
    situation: string;    // Tình huống đã xảy ra
    wrong: string;        // Sales đã làm gì sai / chưa tốt
    correct: string;      // Nên làm gì thay thế (kịch bản mẫu)
  };
  nextActions?: string[]; // Hành động cụ thể sau cuộc gọi
  transcript?: string;
}

// ─── Step 1: Whisper — chuyển audio thành văn bản ─────────────────────────────

export const transcribeAudio = async (audioUri: string): Promise<string> => {
  await checkQuota();
  if (!OPENAI_API_KEY) {
    throw new Error('Chưa cấu hình OpenAI API key. Vui lòng liên hệ admin.');
  }

  if (Platform.OS === 'web') {
    throw new Error('Tính năng ghi âm không hỗ trợ trên trình duyệt web. Vui lòng dùng app trên điện thoại.');
  }

  if (!audioUri) {
    throw new Error('Không có file ghi âm. Vui lòng thử ghi âm lại.');
  }

  const formData = new FormData();
  formData.append('file', {
    uri: audioUri,
    type: 'audio/m4a',
    name: 'recording.m4a',
  } as any);
  formData.append('model', 'whisper-1');
  formData.append('language', 'vi');

  // Timeout dài hơn cho file lớn (5 phút)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300000);

  try {
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Hệ thống đang quá tải. Vui lòng thử lại sau vài phút.');
    }
    if (response.status === 401) {
      throw new Error('OpenAI API key không hợp lệ. Vui lòng liên hệ admin.');
    }
    if (response.status === 413) {
      throw new Error('File ghi âm quá lớn (tối đa 25MB). Thử ghi âm ngắn hơn hoặc tải file nhỏ hơn.');
    }
    const err = await response.text();
    throw new Error(`Lỗi chuyển giọng nói (${response.status}). Vui lòng thử lại.`);
  }

  const data = await response.json();
  logUsage('transcribe', 'whisper-1', 0);
  return data.text as string;

  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Ghi âm quá dài, hệ thống hết thời gian xử lý. Thử ghi âm ngắn hơn (dưới 10 phút).');
    }
    throw err;
  }
};

// ─── Step 2: Claude Haiku — phân tích transcript ─────────────────────────────

export const analyzeTranscript = async (transcript: string, knowledgeBase?: string, tier?: AITier): Promise<AnalysisResult> => {
  if (!CLAUDE_API_KEY) {
    throw new Error('Chưa cấu hình Claude API key. Vui lòng liên hệ admin.');
  }

  // Lấy tier từ subscription nếu không truyền vào
  const effectiveTier = tier || await getAITier();
  const systemPrompt = getAnalysisPrompt(effectiveTier, knowledgeBase ? trimKnowledge(knowledgeBase) : undefined);
  const maxTokens = getMaxTokens(effectiveTier, 'analysis');

  const userPrompt = `Phân tích buổi tư vấn sau và trả về JSON:

${transcript}

JSON (chỉ JSON, không giải thích):
{
  "score": <1.0-10.0>,
  "summary": [<2-3 ý chính>],
  "strengths": [<2-3 điểm làm tốt, trích dẫn câu nói cụ thể nếu có>],
  "improvements": [<2-3 điểm cần sửa, giải thích ngắn tại sao>],
  "communication": {
    "tone": "<nhận xét về tác phong, giọng nói, thái độ — tự tin hay rụt rè, chuyên nghiệp hay quá casual, nhịp nói nhanh/chậm>",
    "listening": "<sales có lắng nghe không, có ngắt lời không, tỷ lệ nói/nghe ước tính>",
    "questioning": "<có đặt câu hỏi mở không, câu hỏi dẫn dắt hay thẩm vấn, có đào sâu không>"
  },
  "scenario": {
    "situation": "<1 tình huống nổi bật nhất trong buổi tư vấn cần cải thiện>",
    "wrong": "<sales đã xử lý thế nào — trích dẫn lời nói nếu có>",
    "correct": "<viết lại kịch bản mẫu đúng cách, lời thoại cụ thể giữa sales và khách>"
  },
  "nextActions": [
    "<hành động 1 sales cần làm ngay sau cuộc gọi này — cụ thể, có thời gian>",
    "<hành động 2 — ví dụ: gửi gì, chuẩn bị gì cho lần gặp sau>",
    "<hành động 3 — ví dụ: luyện tập kỹ năng gì>"
  ],
  "strategies": [<2 chiến lược cho buổi gặp tiếp theo, theo phương pháp 3 Điểm Chạm>]
}`;

  // Thử proxy trước
  if (USE_PROXY) {
    try {
      const data = await callClaudeProxy({
        action: 'analyze',
        body: { model: 'claude-haiku-4-5-20251001', max_tokens: maxTokens, system: systemPrompt, messages: [{ role: 'user', content: userPrompt }, { role: 'assistant', content: '{' }] },
      });
      logUsage('analyze', 'claude-haiku-4-5-20251001', 0);
      const rawText = '{' + (data.content[0].text as string);
      const cleaned = rawText.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim();
      const start = cleaned.indexOf('{'); const end = cleaned.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) {
        const result = JSON.parse(cleaned.slice(start, end + 1)) as AnalysisResult;
        if (!result.score) result.score = 5;
        if (!result.summary) result.summary = [];
        if (!result.strengths) result.strengths = [];
        if (!result.improvements) result.improvements = [];
        if (!result.strategies) result.strategies = [];
        return result;
      }
    } catch { /* fallback to direct */ }
  }

  const response = await fetchWithRetry('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt },
        { role: 'assistant', content: '{' },
      ],
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Claude API key không hợp lệ. Vui lòng liên hệ admin.');
    }
    throw new Error('Lỗi phân tích. Vui lòng thử lại.');
  }

  const data = await response.json();
  const rawText = '{' + (data.content[0].text as string);

  try {
    const cleaned = rawText
      .replace(/```(?:json)?\s*/gi, '')
      .replace(/```/g, '')
      .trim();

    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');

    // Thử parse JSON hoàn chỉnh
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1)) as AnalysisResult;
    }

    // JSON bị cắt — cố gắng recovery
    return recoverTruncatedJSON(cleaned);
  } catch (e) {
    // Nếu parse fail, thử recovery
    try {
      return recoverTruncatedJSON(rawText);
    } catch {
      throw new Error(`Lỗi phân tích. AI trả về không đủ dữ liệu. Vui lòng thử lại.`);
    }
  }
};

// Khôi phục JSON bị cắt ngắn do hết max_tokens
function recoverTruncatedJSON(text: string): AnalysisResult {
  let json = text.trim();
  // Tìm vị trí bắt đầu JSON
  const start = json.indexOf('{');
  if (start === -1) throw new Error('No JSON');
  json = json.slice(start);

  // Đóng mọi ngoặc còn thiếu
  const openBrackets = (json.match(/\[/g) || []).length;
  const closeBrackets = (json.match(/\]/g) || []).length;
  const openBraces = (json.match(/\{/g) || []).length;
  const closeBraces = (json.match(/\}/g) || []).length;

  // Cắt bỏ value bị dở dang (string không đóng, trailing comma)
  json = json.replace(/,\s*$/, '');
  json = json.replace(/,\s*"[^"]*$/, '');
  json = json.replace(/:\s*"[^"]*$/, ': ""');
  json = json.replace(/:\s*\[\s*"[^"]*$/, ': []');

  for (let i = 0; i < openBrackets - closeBrackets; i++) json += ']';
  for (let i = 0; i < openBraces - closeBraces; i++) json += '}';

  const result = JSON.parse(json) as AnalysisResult;

  // Đảm bảo các field bắt buộc tồn tại
  if (!result.score) result.score = 5;
  if (!result.summary) result.summary = [];
  if (!result.strengths) result.strengths = [];
  if (!result.improvements) result.improvements = [];
  if (!result.strategies) result.strategies = [];

  logUsage('analyze', 'claude-haiku-4-5-20251001', 0);
  return result;
}

// ─── AI Coach Chat ────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Giới hạn knowledge base tối đa ~120K chars (~30K tokens) để không vượt context window
const trimKnowledge = (kb: string, maxChars = 120000): string => {
  if (kb.length <= maxChars) return kb;
  return kb.slice(0, maxChars) + '\n\n[... kiến thức đã được rút gọn để phù hợp giới hạn AI ...]';
};

const COACH_SYSTEM = (knowledgeBase: string) => `${trimKnowledge(knowledgeBase)}

---
Bạn là Coach Duy Nguyễn — sáng lập phương pháp "Bán bằng vị thế" / THE TRUSTED ADVISOR. Xưng "Duy", gọi người hỏi "bạn".

NGUYÊN TẮC:
- Chỉ trả lời dựa trên kiến thức TTA ở trên. Ngoài phạm vi thì nói thẳng và kéo về bán hàng. KHÔNG bịa.
- Trả lời ĐẦY ĐỦ, CHI TIẾT theo phương pháp 3 Điểm Chạm (Chạm Động Lực → Chạm Điểm Nghẽn → Chạm Con Đường).
- Mỗi câu trả lời bao gồm: phân tích gốc rễ vấn đề, hướng xử lý cụ thể, kịch bản mẫu (lời thoại thật giữa sales và khách), và bước tiếp theo.
- Kịch bản mẫu PHẢI có: câu mở đầu, câu hỏi dẫn dắt, cách phản hồi, câu chốt — tất cả theo framework TTA.
- Áp dụng công thức Trust: T = (Uy tín + Tin cậy + Kết nối cảm xúc) / Tập trung bản thân.

GIỌNG VĂN:
- Viết như người Việt nói chuyện thật — tự nhiên, gần gũi, dễ hiểu.
- Câu ngắn, rõ ràng. KHÔNG viết kiểu dịch từ tiếng Anh.
- KHÔNG dùng từ Hán-Việt phức tạp khi có từ thuần Việt thay thế.
- Dùng từ ngữ bán hàng thực tế tại Việt Nam.
- KHÔNG dùng emoji, KHÔNG sáo rỗng.

QUY TẮC NGÔN NGỮ (BẮT BUỘC):
- 100% TIẾNG VIỆT. TUYỆT ĐỐI KHÔNG dùng từ tiếng Anh.
- Thay "trigger" bằng "yếu tố thúc đẩy". Thay "pain point" bằng "vấn đề đang gặp".
- Thay "awareness" bằng "nhận thức". Thay "objection" bằng "phản đối/từ chối".
- Thay "follow-up" bằng "theo dõi sau". Thay "closing" bằng "chốt deal/chốt giao dịch".
- Thay "pipeline" bằng "phễu bán hàng". Thay "lead" bằng "khách tiềm năng".
- Thay "insight" bằng "góc nhìn". Thay "feedback" bằng "phản hồi".
- Thay "script" bằng "kịch bản". Thay "roleplay" bằng "luyện đối đáp".
- Nếu BUỘC phải dùng thuật ngữ chuyên môn quốc tế, viết tiếng Việt trước rồi ghi chú trong ngoặc.
- Kịch bản mẫu PHẢI theo phong cách 3 Điểm Chạm: Chạm Động Lực → Chạm Điểm Nghẽn → Chạm Con Đường.

CHÍNH TẢ TIẾNG VIỆT (RẤT QUAN TRỌNG):
- Viết đúng dấu thanh: sắc (á), huyền (à), hỏi (ả), ngã (ã), nặng (ạ).
- Phân biệt: "dẫn dắt" (không phải "dẩn dắt"), "quyết định" (không phải "quyết đính"), "phương pháp" (không phải "phương phát").
- Phân biệt: d/gi/r, s/x, ch/tr, n/ng theo chuẩn chính tả miền Bắc.
- Kiểm tra lại chính tả trước khi trả lời. Nếu không chắc chắn về 1 từ, dùng từ khác thay thế.

TRÌNH BÀY: Dùng markdown nhẹ: **in đậm** cho ý chính, xuống dòng cho dễ đọc. Hạn chế dùng heading ##.`;

export const chatWithCoach = async (
  messages: ChatMessage[],
  knowledgeBase: string,
  tier?: AITier
): Promise<string> => {
  const effectiveTier = tier || await getAITier();
  const coachSystemPrompt = getCoachPrompt(effectiveTier, trimKnowledge(knowledgeBase));
  const chatMaxTokens = getMaxTokens(effectiveTier, 'chat');

  // Thử proxy trước (bảo mật), fallback sang direct
  if (USE_PROXY) {
    try {
      const data = await callClaudeProxy({
        action: 'chat',
        body: {
          model: 'claude-haiku-4-5-20251001',
          max_tokens: chatMaxTokens,
          system: coachSystemPrompt,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
        },
      });
      logUsage('chat', 'claude-haiku-4-5-20251001', 0, data.usage?.input_tokens || 0, data.usage?.output_tokens || 0);
      return data.content[0].text as string;
    } catch {
      // Fallback sang direct nếu proxy lỗi
    }
  }

  if (!CLAUDE_API_KEY) {
    throw new Error('Chưa cấu hình Claude API key. Vui lòng liên hệ admin.');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: chatMaxTokens,
      system: coachSystemPrompt,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    console.error('Claude API error:', response.status, errText);
    throw new Error(`Lỗi API (${response.status}). Vui lòng thử lại.`);
  }

  const data = await response.json();
  logUsage('chat', 'claude-haiku-4-5-20251001', 0, data.usage?.input_tokens || 0, data.usage?.output_tokens || 0);
  return data.content[0].text as string;
};

// ─── Streaming Chat — hiện từng chữ real-time ───────────────────────────────

export const streamChatWithCoach = async (
  messages: ChatMessage[],
  knowledgeBase: string,
  onChunk: (textSoFar: string) => void,
): Promise<string> => {
  if (!CLAUDE_API_KEY) {
    throw new Error('Chưa cấu hình Claude API key. Vui lòng liên hệ admin.');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      stream: true,
      system: COACH_SYSTEM(knowledgeBase),
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Claude API key không hợp lệ. Vui lòng liên hệ admin.');
    }
    if (response.status === 429) {
      throw new Error('Hệ thống đang quá tải. Vui lòng thử lại sau vài phút.');
    }
    throw new Error('Lỗi phân tích. Vui lòng thử lại.');
  }

  // Thử streaming qua ReadableStream
  const reader = response.body?.getReader();
  if (!reader) {
    // Fallback: đọc toàn bộ response nếu không hỗ trợ stream
    const text = await response.text();
    let fullText = '';
    const lines = text.split('\n');
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (!data || data === '[DONE]') continue;
      try {
        const parsed = JSON.parse(data);
        if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
          fullText += parsed.delta.text;
        }
      } catch {}
    }
    onChunk(fullText);
    return fullText;
  }

  let fullText = '';
  let buffer = '';
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (!data || data === '[DONE]') continue;
      try {
        const parsed = JSON.parse(data);
        if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
          fullText += parsed.delta.text;
          onChunk(fullText);
        }
      } catch {}
    }
  }

  logUsage('chat', 'claude-haiku-4-5-20251001', 0);
  return fullText;
};

const getMockChatResponse = (userMessage: string): string => {
  const lower = userMessage.toLowerCase();
  if (lower.includes('tin nhắn') || lower.includes('nhắn tin')) {
    return `Duy nói thẳng nhé — tin nhắn tiếp cận khách lạnh mà mở đầu bằng giới thiệu sản phẩm là mất vị thế ngay.\n\nThử như này:\n\n"Chào anh [Tên], em thấy anh đang [tình huống cụ thể]. Em có một góc nhìn khác về vấn đề này mà nhiều người trong ngành anh đang áp dụng. Anh có 5 phút để em chia sẻ không?"\n\nĐiểm mấu chốt là đặt mình ở vị thế người chia sẻ giá trị, không phải người bán hàng.`;
  }
  if (lower.includes('từ chối') || lower.includes('giá cao') || lower.includes('đắt')) {
    return `Khi khách nói "giá cao" — đây là tín hiệu, không phải từ chối.\n\nTheo phương pháp 3 Điểm Chạm, bạn cần quay lại Điểm Chạm nhận thức trước. Đừng giảm giá, đừng giải thích. Hỏi lại: "Anh thấy cao so với điều gì ạ?"\n\nNếu khách so với ngân sách — giúp khách tính giá trị đầu tư. Nếu so với đối thủ — phân tích khác biệt về giá trị, không phải giá cả.\n\nCâu mẫu: "Em hiểu anh đang cân nhắc về chi phí. Nếu giải pháp này giúp anh đạt được [kết quả cụ thể], thì đầu tư này có xứng đáng với anh không?"`;
  }
  return `Hiện tại chưa kết nối được tới hệ thống AI. Vui lòng kiểm tra kết nối mạng rồi thử lại.`;
};

// ─── Step 1.5: Sửa lỗi chính tả transcript tiếng Việt ──────────────────────

export const correctTranscript = async (rawTranscript: string): Promise<string> => {
  if (!CLAUDE_API_KEY || rawTranscript.length < 20) return rawTranscript;

  try {
    const response = await fetchWithRetry('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        system: `Bạn là công cụ sửa lỗi chính tả tiếng Việt cho transcript từ Whisper.
CHỈ sửa lỗi chính tả, dấu thanh, từ nghe nhầm. KHÔNG thay đổi nội dung, ý nghĩa, hoặc cách nói.
Giữ nguyên xưng hô, giọng văn, câu cú. Trả về transcript đã sửa, không giải thích.`,
        messages: [{ role: 'user', content: rawTranscript }],
      }),
    });

    if (!response.ok) return rawTranscript;

    const data = await response.json();
    return data.content[0].text as string;
  } catch {
    return rawTranscript;
  }
};

// ─── Step 3: Trích xuất thông tin khách hàng từ transcript (CRM) ────────────

export interface ExtractedCustomerInfo {
  // Core
  needs: string;
  budget: string;
  concerns: string;
  stage: string;
  decisionFactors: string;
  personality: string;
  nextStep: string;
  callSummary: string;
  // ICP mở rộng
  icp: {
    role?: string;
    painPoints?: string;
    deepFears?: string;
    desires?: string;
    emotionStyle?: string;
    decisionStyle?: string;
    functionalJob?: string;
    awarenessLevel?: string;
    influencers?: string;
    buyingBarriers?: string;
    buyingTriggers?: string;
    investBudget?: string;
    biggestRisk?: string;
    fitLevel?: string;
  };
  decisionMaker?: {
    name: string;
    role: string;
    attitude: string;
  };
}

const EMPTY_EXTRACTED: ExtractedCustomerInfo = {
  needs: '', budget: '', concerns: '', stage: '', decisionFactors: '',
  personality: '', nextStep: '', callSummary: '', icp: {},
};

export const extractCustomerInfo = async (transcript: string): Promise<ExtractedCustomerInfo> => {
  if (!CLAUDE_API_KEY) return EMPTY_EXTRACTED;

  try {
    const response = await fetchWithRetry('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        system: `Trích xuất chân dung khách hàng (ICP) từ transcript cuộc gọi sales.
Điền tất cả thông tin có thể suy ra được. Nếu không có dữ liệu thì để "".
100% tiếng Việt, ngắn gọn 1-2 câu mỗi field. CHỈ trả về JSON.`,
        messages: [
          { role: 'user', content: `Transcript:\n${transcript}\n\nJSON:
{
  "needs":"<nhu cầu chính>",
  "budget":"<ngân sách đề cập>",
  "concerns":"<lo ngại, phản đối>",
  "stage":"<mới tiếp cận / đang tìm hiểu / đang so sánh / sắp chốt / đã chốt>",
  "decisionFactors":"<yếu tố quyết định>",
  "personality":"<phong cách: nóng vội, cẩn thận, thân thiện, hoài nghi...>",
  "nextStep":"<bước tiếp theo>",
  "callSummary":"<tóm tắt 1-2 câu>",
  "icp":{
    "role":"<vai trò/nghề nghiệp>",
    "painPoints":"<3-5 vấn đề trăn trở>",
    "deepFears":"<nỗi sợ không nói ra: sợ mất tiền, mất mặt, thất bại...>",
    "desires":"<ước mơ, khát vọng>",
    "emotionStyle":"<cảm xúc chủ đạo khi quyết định: lo lắng, hứng khởi, tò mò...>",
    "decisionStyle":"<cảm xúc trước hay lý trí trước>",
    "functionalJob":"<điều muốn làm tốt hơn>",
    "awarenessLevel":"<1-5: 1=chưa biết vấn đề, 5=sẵn sàng mua>",
    "influencers":"<ai ảnh hưởng: vợ/chồng, sếp, đồng nghiệp...>",
    "buyingBarriers":"<rào cản: thiếu tiền, thiếu thời gian, thiếu niềm tin...>",
    "buyingTriggers":"<yếu tố kích hoạt mua>",
    "investBudget":"<mức sẵn sàng chi>",
    "biggestRisk":"<rủi ro sợ nhất>",
    "fitLevel":"<Kim Cương / Vàng / Bạc / Đồng — dựa trên nhu cầu + nguồn lực + mức phù hợp>"
  },
  "decisionMaker":{"name":"<tên người QĐ nếu đề cập>","role":"<vai trò>","attitude":"<ủng hộ/trung lập/phản đối>"}
}` },
          { role: 'assistant', content: '{' },
        ],
      }),
    });

    if (!response.ok) return EMPTY_EXTRACTED;

    const data = await response.json();
    const rawText = '{' + (data.content[0].text as string);
    const cleaned = rawText.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      logUsage('extract_customer', 'claude-haiku-4-5-20251001', 0);
      return JSON.parse(cleaned.slice(start, end + 1)) as ExtractedCustomerInfo;
    }
    logUsage('extract_customer', 'claude-haiku-4-5-20251001', 0);
    return recoverTruncatedJSON(cleaned) as any;
  } catch {
    return EMPTY_EXTRACTED;
  }
};

// ─── Step 4: AI chấm điểm tiềm năng + đề xuất hành động ────────────────────

export interface AIScoreResult {
  productFit: { score: number; level: string; detail: string };
  financialFit: { score: number; level: string; detail: string };
  decisionMakerAccess: { score: number; level: string; detail: string };
  timeline: { score: number; level: string; detail: string };
  recommendation: string;
}

export const scoreCustomerWithAI = async (profileSummary: string, knowledgeBase?: string): Promise<AIScoreResult | null> => {
  if (!CLAUDE_API_KEY) return null;

  try {
    const knowledgePrefix = knowledgeBase ? trimKnowledge(knowledgeBase) + '\n\n---\n' : '';
    const response = await fetchWithRetry('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        system: `${knowledgePrefix}Bạn là chuyên gia đánh giá khách hàng tiềm năng theo phương pháp "Bán bằng Vị thế" — THE TRUSTED ADVISOR.
Chấm điểm 4 tiêu chí (0-20 mỗi tiêu chí) dựa trên thông tin hồ sơ khách hàng và kiến thức TTA.
Mỗi tiêu chí có 4 mức: 0-5 (Chưa rõ), 6-10 (Thấp), 11-15 (Trung bình), 16-20 (Cao).
Đưa ra đề xuất hành động cụ thể theo phương pháp 3 Điểm Chạm (2-3 câu, tiếng Việt tự nhiên).
CHỈ trả về JSON.`,
        messages: [
          { role: 'user', content: `Hồ sơ khách hàng:\n${profileSummary}\n\nJSON:
{
  "productFit":{"score":<0-20>,"level":"<Rất phù hợp/Phù hợp/Chưa rõ/Không phù hợp>","detail":"<1 câu giải thích>"},
  "financialFit":{"score":<0-20>,"level":"<Đủ ngân sách/Có thể/Hạn chế/Chưa rõ>","detail":"<1 câu>"},
  "decisionMakerAccess":{"score":<0-20>,"level":"<Đã gặp/Gián tiếp/Chưa gặp/Không rõ>","detail":"<1 câu>"},
  "timeline":{"score":<0-20>,"level":"<Gấp/1-3 tháng/3-6 tháng/Chưa rõ>","detail":"<1 câu>"},
  "recommendation":"<2-3 câu: phân tích tổng quan + đề xuất hành động cụ thể tiếp theo>"
}` },
          { role: 'assistant', content: '{' },
        ],
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const rawText = '{' + (data.content[0].text as string);
    const cleaned = rawText.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      logUsage('score_customer', 'claude-haiku-4-5-20251001', 0);
      return JSON.parse(cleaned.slice(start, end + 1)) as AIScoreResult;
    }
    return null;
  } catch {
    return null;
  }
};

// ─── Step 5: Đề xuất chi tiết từ Trợ lý AI Coach Duy Nguyễn ─────────────────

export const generateDetailedRecommendation = async (
  customerSummary: string,
  knowledgeBase: string,
): Promise<string> => {
  if (!CLAUDE_API_KEY) return '';

  try {
    const response = await fetchWithRetry('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4096,
        system: `${trimKnowledge(knowledgeBase)}

---
Bạn là Trợ lý AI của Coach Duy Nguyễn — người sáng lập phương pháp "Bán bằng vị thế" / THE TRUSTED ADVISOR.

Nhiệm vụ: Dựa trên TOÀN BỘ thông tin khách hàng bên dưới (hồ sơ, ghi chú, cuộc gọi, sản phẩm), đưa ra hướng dẫn chi tiết cho sales theo phương pháp TTA.

Trả lời bằng markdown, 100% tiếng Việt, theo cấu trúc:

## Đánh giá tổng quan
Phân tích vị thế hiện tại của sales với khách hàng này. Khách đang ở giai đoạn nào? Tâm lý ra sao?

## Chiến lược tiếp cận theo TTA
Dựa trên phương pháp 3 Điểm Chạm và Trust Formula, phân tích cho từng điểm chạm:

### Điểm Chạm 1 — Động lực
Tình trạng hiện tại + sales cần làm gì (viết dạng đoạn văn ngắn, KHÔNG dùng bảng)

### Điểm Chạm 2 — Điểm nghẽn
Tình trạng hiện tại + sales cần làm gì

### Điểm Chạm 3 — Con đường
Tình trạng hiện tại + sales cần làm gì

QUAN TRỌNG VỀ FORMAT: KHÔNG dùng bảng markdown (|---|). Dùng ### heading + đoạn văn + bullet points. Bảng hiển thị rất xấu trên mobile.

## Kịch bản chi tiết
Viết kịch bản cụ thể cho cuộc gọi/gặp mặt tiếp theo. Bao gồm:
- Câu mở đầu (dựa trên context khách hàng thật)
- Câu hỏi dẫn dắt
- Cách giới thiệu sản phẩm theo vị thế cố vấn
- Xử lý phản đối có thể gặp
- Câu chốt bước tiếp theo

## Phân tích Giá trị theo công thức TTA
Áp dụng: **Giá trị = (Kết quả đạt được × Khả năng thành công) / (Thời gian × Rủi ro × Công sức)**

Phân tích CỤ THỂ cho sản phẩm đang tư vấn:
- **Kết quả đạt được**: Khách sẽ đạt được gì? Lượng hóa nếu có thể.
- **Khả năng thành công**: Tại sao khách tin sẽ đạt kết quả?
- **Thời gian**: Trình bày để khách thấy thời gian hợp lý.
- **Rủi ro**: Cách giảm cảm nhận rủi ro (bảo hành, cam kết, case study...).
- **Công sức**: Cách cho khách thấy quy trình đơn giản.

Đưa ra câu nói cụ thể để TĂNG tử số (kết quả + khả năng) và GIẢM mẫu số (thời gian + rủi ro + công sức).

## Trình bày giải pháp theo "Chạm Con Đường" (Điểm Chạm 3)
Chạm Con Đường là trình bày giải pháp như một CON ĐƯỜNG PHÙ HỢP — có bản đồ, có người dẫn đường. Không phải bán sản phẩm, mà là đề xuất một lộ trình.

Dựa trên sản phẩm đang tư vấn cho khách hàng này, hướng dẫn sales theo đúng phương pháp:

**1. Kiểm tra FIT trước khi trình bày:**
- FIT với động lực: Con đường này có phục vụ đúng điều khách đang hướng tới? (dựa trên Điểm Chạm 1)
- FIT với điểm nghẽn: Con đường này có giải quyết đúng rào cản đã xác định? (dựa trên Điểm Chạm 2)
- FIT với bối cảnh: Con đường này có vượt quá nguồn lực, thời gian, cam kết mà khách sẵn sàng?

**2. Cách trình bày (3 bước):**
- Bước 1 — Kết nối lại: "Dựa trên những gì anh/chị chia sẻ về [X] và [Y]..."
- Bước 2 — Đề xuất con đường: "Hướng tiếp cận mà em thấy phù hợp nhất là..." (dùng đúng ngôn ngữ khách dùng ở Điểm Chạm 1-2)
- Bước 3 — Để khách tự đánh giá: "Anh/chị thấy hướng này có phù hợp không?"

**3. Nguyên tắc Loại trừ (Disqualification):**
Nếu sau khi đánh giá FIT, con đường không phù hợp với khách → phải nói thẳng. Đây là ranh giới quan trọng nhất giữa Cố vấn và Người bán hàng.

Viết kịch bản cụ thể cho khách hàng này: sales nên nói gì ở từng bước, dùng ngôn ngữ nào (dựa trên thông tin thật của khách).

## Những lỗi cần tránh
Dựa trên lịch sử tương tác, chỉ ra sai lầm cần tránh.

## 3 bước hành động tiếp theo
Cụ thể, có thời gian, có thể làm ngay.

QUAN TRỌNG: Sử dụng thông tin THỰC TẾ về khách hàng và sản phẩm được cung cấp. Không generic.`,
        messages: [
          { role: 'user', content: customerSummary },
        ],
      }),
    });

    if (!response.ok) return '';
    const data = await response.json();
    return data.content[0].text as string;
  } catch {
    return '';
  }
};

// ─── Full pipeline: audio → transcript → sửa lỗi → analysis ────────────────

export const analyzeRecording = async (audioUri: string, knowledgeBase?: string): Promise<AnalysisResult> => {
  const rawTranscript = await transcribeAudio(audioUri);

  // Ghi âm ngắn (<3000 ký tự): sửa lỗi trước, phân tích sau
  // Ghi âm dài (>3000 ký tự): bỏ qua sửa lỗi, phân tích trực tiếp (tiết kiệm 30-60s)
  let transcript: string;
  if (rawTranscript.length < 3000) {
    transcript = await correctTranscript(rawTranscript);
  } else {
    transcript = rawTranscript;
  }

  // Giới hạn transcript gửi Claude (tối đa 15000 ký tự ≈ 4000 tokens input)
  const trimmedTranscript = transcript.length > 15000
    ? transcript.slice(0, 8000) + '\n\n[... phần giữa được lược bỏ ...]\n\n' + transcript.slice(-7000)
    : transcript;

  const analysis = await analyzeTranscript(trimmedTranscript, knowledgeBase);
  analysis.transcript = transcript; // Lưu full transcript, chỉ gửi AI bản rút gọn
  return analysis;
};

// ─── Mock data (dùng khi chưa có API key) ────────────────────────────────────

const MOCK_TRANSCRIPT = `Sales: Chào anh Minh, em là Hương từ công ty ABC. Hôm nay em muốn giới thiệu giải pháp CRM mới nhất của bên em.

Khách: Ừ, tôi nghe rồi. Nói nhanh đi, tôi bận lắm.

Sales: Dạ vâng, giải pháp của em có rất nhiều tính năng như quản lý khách hàng, theo dõi doanh số, báo cáo tự động...

Khách: Bên tôi đang dùng Excel, vẫn ổn mà.

Sales: Dạ nhưng Excel không có những tính năng này anh ơi. Bên em có bản demo miễn phí 30 ngày.

Khách: Giá bao nhiêu?

Sales: Dạ 500 nghìn một tháng một user ạ.

Khách: Hơi cao đấy. Để tôi nghĩ thêm đã.

Sales: Dạ vâng, anh cứ nghĩ thêm ạ.`;

const getMockAnalysis = (): AnalysisResult => ({
  score: 4.5,
  summary: [
    'Sales đang ở vị thế người bán hàng, không phải cố vấn tin cậy — mở đầu bằng giới thiệu sản phẩm thay vì tìm hiểu khách',
    'Khách hàng tỏ ra thiếu thời gian và không thấy giá trị ngay từ đầu — dấu hiệu cho thấy Sales chưa tạo được kết nối cảm xúc',
    'Không đọc được tín hiệu khi khách nói "Excel vẫn ổn" — đây là cơ hội đặt câu hỏi dẫn dắt, không phải lúc liệt kê tính năng',
    'Cuộc gặp kết thúc ở "để tôi nghĩ thêm" — Sales chấp nhận thụ động, mất quyền dẫn dắt',
  ],
  strengths: [
    'Đề xuất bản dùng thử miễn phí 30 ngày — giảm rào cản cho khách trải nghiệm',
    'Trả lời giá rõ ràng, không lúng túng — thể hiện sự tự tin về sản phẩm',
  ],
  improvements: [
    'Mở đầu sai vị thế: "em muốn giới thiệu giải pháp" — đặt mình ở vị thế người bán. Nên mở bằng câu hỏi: "Anh đang gặp khó khăn gì nhất trong việc quản lý khách hàng?"',
    'Khi khách nói "Excel vẫn ổn" — đây là nỗi sợ thay đổi. Cần hỏi dẫn dắt: "Anh thấy khó nhất khi dùng Excel là điều gì?" thay vì phản bác',
    'Khi khách nói "giá cao" — đây là tín hiệu cần quay lại Điểm Chạm nhận thức. Hỏi: "Anh thấy cao so với điều gì ạ?" trước khi giải thích',
    'Kết thúc mất quyền dẫn dắt — cần đề xuất bước tiếp theo cụ thể với thời gian rõ ràng',
  ],
  strategies: [
    'Buổi tới mở đầu bằng vị thế cố vấn: "Anh đang quản lý team bao nhiêu người? Khó nhất hiện tại là gì?" — lắng nghe 70%, nói 30%',
    'Chuẩn bị một câu chuyện thực tế về doanh nghiệp tương tự đã giải quyết đúng vấn đề khách đang gặp — dẫn chứng bằng kết quả, không liệt kê tính năng',
    'Chốt bước tiếp theo ngay trong buổi gặp: "Em gửi anh bản dùng thử và hẹn thứ Tư tuần sau mình cùng xem kết quả nhé?"',
  ],
  transcript: MOCK_TRANSCRIPT,
});
