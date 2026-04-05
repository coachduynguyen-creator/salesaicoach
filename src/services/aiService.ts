// ─── Config ─────────────────────────────────────────────────────────────────
import { Platform } from 'react-native';
import { DEFAULT_CLAUDE_KEY, DEFAULT_OPENAI_KEY } from '../config/defaultKeys';

let OPENAI_API_KEY = DEFAULT_OPENAI_KEY;    // Dùng cho Whisper (speech-to-text)
let CLAUDE_API_KEY = DEFAULT_CLAUDE_KEY;    // Dùng cho phân tích coaching

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
    type: 'audio/mp4',
    name: 'recording.m4a',
  } as any);
  formData.append('model', 'whisper-1');
  formData.append('language', 'vi');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Hệ thống đang quá tải. Vui lòng thử lại sau vài phút.');
    }
    if (response.status === 401) {
      throw new Error('OpenAI API key không hợp lệ. Vui lòng liên hệ admin.');
    }
    const err = await response.text();
    throw new Error(`Lỗi chuyển giọng nói (${response.status}). Vui lòng thử lại.`);
  }

  const data = await response.json();
  return data.text as string;
};

// ─── Step 2: Claude Haiku — phân tích transcript ─────────────────────────────

export const analyzeTranscript = async (transcript: string, knowledgeBase?: string): Promise<AnalysisResult> => {
  if (!CLAUDE_API_KEY) {
    throw new Error('Chưa cấu hình Claude API key. Vui lòng liên hệ admin.');
  }

  const systemPrompt = `${knowledgeBase ? knowledgeBase + '\n\n---\n' : ''}Bạn là Coach Duy Nguyễn, chuyên gia huấn luyện bán hàng theo phương pháp "Bán bằng vị thế" — THE TRUSTED ADVISOR.

Phân tích chuyên sâu buổi tư vấn theo TTA, bao gồm:
1. Vị thế cố vấn tin cậy (công thức Trust T=(C+R+E)/Sf)
2. Tác phong, giọng nói, thái độ giao tiếp
3. Kỹ năng lắng nghe (quy tắc 70/30, lắng nghe 3 tầng)
4. Kỹ năng đặt câu hỏi (dẫn dắt vs thẩm vấn)
5. Đọc tín hiệu tâm lý khách (6 nỗi sợ, 5 giai đoạn)
6. Dẫn dắt qua 3 Điểm Chạm (nhận thức, cảm xúc, hành động)
7. Xử lý tình huống và giữ vị thế

YÊU CẦU:
- 100% tiếng Việt tự nhiên, viết như người Việt nói chuyện.
- Câu ngắn, rõ, dễ hiểu. Không sáo rỗng.
- Kịch bản mẫu phải viết đúng giọng Việt Nam, dùng xưng hô "anh/chị", "em".
- QUAN TRỌNG: Chỉ trả về JSON hợp lệ, không có text thừa.`;

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
      max_tokens: 4096,
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
    if (response.status === 429) {
      throw new Error('Hệ thống đang quá tải. Vui lòng thử lại sau vài phút.');
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

  return result;
}

// ─── AI Coach Chat ────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const COACH_SYSTEM = (knowledgeBase: string) => `${knowledgeBase}

---
Bạn là Coach Duy Nguyễn — sáng lập phương pháp "Bán bằng vị thế" / THE TRUSTED ADVISOR. Xưng "Duy", gọi người hỏi "bạn".

NGUYÊN TẮC:
- Chỉ trả lời dựa trên kiến thức TTA ở trên. Ngoài phạm vi thì nói thẳng và kéo về bán hàng. KHÔNG bịa.
- Trả lời NGẮN GỌN, đi thẳng vào vấn đề. Tối đa 150-200 từ.
- Đưa ra định hướng và giải pháp cốt lõi trước. Cuối câu trả lời, hỏi người dùng có cần đi sâu hơn không (ví dụ: kịch bản mẫu, phân tích chi tiết, bước tiếp theo).
- Chỉ khi người dùng yêu cầu thêm thì mới triển khai chi tiết.

GIỌNG VĂN:
- Viết như người Việt nói chuyện thật — tự nhiên, gần gũi, dễ hiểu.
- Câu ngắn, rõ ràng. KHÔNG viết kiểu dịch từ tiếng Anh.
- KHÔNG dùng từ Hán-Việt phức tạp khi có từ thuần Việt thay thế.
- Dùng từ ngữ bán hàng thực tế tại Việt Nam.
- KHÔNG dùng emoji, KHÔNG sáo rỗng.

TRÌNH BÀY: Dùng markdown nhẹ: **in đậm** cho ý chính, xuống dòng cho dễ đọc. Hạn chế dùng heading ##.`;

export const chatWithCoach = async (
  messages: ChatMessage[],
  knowledgeBase: string
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
      max_tokens: 1024,
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

  const data = await response.json();
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
      max_tokens: 1024,
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
  needs: string;
  budget: string;
  concerns: string;
  stage: string;
  decisionFactors: string;
  personality: string;
  nextStep: string;
  callSummary: string;
}

export const extractCustomerInfo = async (transcript: string): Promise<ExtractedCustomerInfo> => {
  if (!CLAUDE_API_KEY) {
    return { needs: '', budget: '', concerns: '', stage: '', decisionFactors: '', personality: '', nextStep: '', callSummary: '' };
  }

  try {
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
        max_tokens: 1024,
        system: `Trích xuất thông tin khách hàng từ transcript cuộc gọi sales.
100% tiếng Việt, ngắn gọn. Nếu không có thông tin thì để trống "".
CHỈ trả về JSON, không giải thích.`,
        messages: [
          { role: 'user', content: `Từ cuộc gọi sau, trích xuất thông tin khách hàng:\n\n${transcript}\n\nJSON:\n{"needs":"<nhu cầu chính của khách>","budget":"<ngân sách hoặc mức đầu tư khách đề cập>","concerns":"<lo ngại, phản đối, lý do chần chừ>","stage":"<giai đoạn: mới tiếp cận / đang tìm hiểu / đang so sánh / sắp chốt / đã chốt>","decisionFactors":"<yếu tố khách quan tâm nhất khi ra quyết định>","personality":"<phong cách giao tiếp: nóng vội, cẩn thận, thân thiện, hoài nghi...>","nextStep":"<bước tiếp theo đã thống nhất hoặc cần làm>","callSummary":"<tóm tắt 1-2 câu về cuộc gọi này>"}` },
          { role: 'assistant', content: '{' },
        ],
      }),
    });

    if (!response.ok) {
      return { needs: '', budget: '', concerns: '', stage: '', decisionFactors: '', personality: '', nextStep: '', callSummary: '' };
    }

    const data = await response.json();
    const rawText = '{' + (data.content[0].text as string);
    const cleaned = rawText.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('No JSON');
    return JSON.parse(cleaned.slice(start, end + 1)) as ExtractedCustomerInfo;
  } catch {
    return { needs: '', budget: '', concerns: '', stage: '', decisionFactors: '', personality: '', nextStep: '', callSummary: '' };
  }
};

// ─── Full pipeline: audio → transcript → sửa lỗi → analysis ────────────────

export const analyzeRecording = async (audioUri: string, knowledgeBase?: string): Promise<AnalysisResult> => {
  const rawTranscript = await transcribeAudio(audioUri);
  const transcript = await correctTranscript(rawTranscript);
  const analysis = await analyzeTranscript(transcript, knowledgeBase);
  analysis.transcript = transcript;
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
