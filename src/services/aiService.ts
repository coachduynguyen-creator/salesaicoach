// ─── Config — điền API key vào đây hoặc lấy từ AsyncStorage ─────────────────
import { Platform } from 'react-native';

let OPENAI_API_KEY = '';    // Dùng cho Whisper (speech-to-text)
let CLAUDE_API_KEY = '';    // Dùng cho phân tích coaching

export const setApiKeys = (openaiKey: string, claudeKey: string) => {
  OPENAI_API_KEY = openaiKey;
  CLAUDE_API_KEY = claudeKey;
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AnalysisResult {
  score: number;
  summary: string[];
  strengths: string[];
  improvements: string[];
  strategies: string[];
  transcript?: string;
}

// ─── Step 1: Whisper — chuyển audio thành văn bản ─────────────────────────────

export const transcribeAudio = async (audioUri: string): Promise<string> => {
  if (!OPENAI_API_KEY) {
    console.warn('Chưa có OpenAI API key — dùng transcript mẫu');
    return MOCK_TRANSCRIPT;
  }

  // Web không hỗ trợ upload file âm thanh trực tiếp — dùng mock để test
  if (Platform.OS === 'web') {
    console.warn('Web không hỗ trợ Whisper upload — dùng transcript mẫu');
    return MOCK_TRANSCRIPT;
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
      console.warn('Whisper quota hết — dùng transcript mẫu để test');
      return MOCK_TRANSCRIPT;
    }
    const err = await response.text();
    throw new Error(`Whisper API lỗi (${response.status}): ${err}`);
  }

  const data = await response.json();
  return data.text as string;
};

// ─── Step 2: Claude Haiku — phân tích transcript ─────────────────────────────

export const analyzeTranscript = async (transcript: string, knowledgeBase?: string): Promise<AnalysisResult> => {
  if (!CLAUDE_API_KEY) {
    console.warn('Chưa có Claude API key — dùng kết quả mẫu');
    return getMockAnalysis();
  }

  const systemPrompt = `${knowledgeBase ? knowledgeBase + '\n\n---\n' : ''}Bạn là Coach Duy Nguyễn, chuyên gia huấn luyện bán hàng theo phương pháp "Bán bằng vị thế" — THE TRUSTED ADVISOR.

Dựa trên toàn bộ kiến thức TTA ở trên, phân tích buổi tư vấn theo 5 tiêu chí:
1. Xây dựng vị thế cố vấn tin cậy — Sales có đặt mình ở vị thế cố vấn hay đang "bán hàng"? Có tạo được niềm tin qua Uy tín, Độ tin cậy, Kết nối cảm xúc không? Mức độ tập trung vào bản thân (Sf) có cao không?
2. Đọc tín hiệu và tâm lý khách — Sales có nhận ra khách đang ở giai đoạn nào trong hành trình ra quyết định? Có đọc được nỗi sợ, thiên lệch nhận thức của khách không?
3. Dẫn dắt qua 3 Điểm Chạm — Sales có dẫn dắt khách qua các điểm chạm nhận thức, cảm xúc, hành động không? Hay đang cố thuyết phục?
4. Kỹ năng lắng nghe và đặt câu hỏi — Sales có lắng nghe chiến lược, đặt câu hỏi dẫn dắt, hay đang nói quá nhiều và liệt kê tính năng?
5. Xử lý tình huống và giữ vị thế — Khi khách từ chối, so sánh đối thủ, hoặc đặt câu hỏi khó, Sales có giữ được vị thế cố vấn không? Có mắc lỗi mất vị thế không?

100% tiếng Việt. Không dùng tiếng Anh. Không dùng thuật ngữ tiếng Anh.
QUAN TRỌNG: Chỉ trả về JSON hợp lệ, không có text thừa bên ngoài.`;

  const userPrompt = `Phân tích buổi tư vấn sau theo phương pháp TTA và trả về JSON:

NỘI DUNG BUỔI TƯ VẤN:
${transcript}

Trả về JSON (chỉ JSON, không giải thích):
{
  "score": <số thực 1.0-10.0>,
  "summary": [<3-5 ý chính của buổi tư vấn, bằng tiếng Việt>],
  "strengths": [<2-4 điểm làm tốt theo tiêu chí TTA, có trích dẫn câu nói cụ thể>],
  "improvements": [<2-4 điểm cần cải thiện theo TTA, giải thích tại sao và nên làm gì thay thế>],
  "strategies": [<2-3 hướng hành động cụ thể cho buổi gặp tiếp theo, theo phương pháp 3 Điểm Chạm>]
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
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt },
        { role: 'assistant', content: '{' },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API lỗi: ${err}`);
  }

  const data = await response.json();
  const rawText = '{' + (data.content[0].text as string);

  try {
    // Xoá markdown code block nếu có
    const cleaned = rawText
      .replace(/```(?:json)?\s*/gi, '')
      .replace(/```/g, '')
      .trim();

    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('Không tìm thấy JSON');

    return JSON.parse(cleaned.slice(start, end + 1)) as AnalysisResult;
  } catch (e) {
    throw new Error(`Parse lỗi: ${e instanceof Error ? e.message : String(e)}\n\nRaw: ${rawText.slice(0, 200)}`);
  }
};

// ─── AI Coach Chat ────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const chatWithCoach = async (
  messages: ChatMessage[],
  knowledgeBase: string
): Promise<string> => {
  if (!CLAUDE_API_KEY) {
    // Mock response khi chưa có key
    return getMockChatResponse(messages[messages.length - 1]?.content ?? '');
  }

  const systemPrompt = `${knowledgeBase}

---
BẠN LÀ AI:
Bạn là Coach Duy Nguyễn — người sáng lập phương pháp "Bán bằng vị thế" và chương trình THE TRUSTED ADVISOR. Xưng "Duy" khi nói về bản thân. Gọi người hỏi là "bạn".

NGUYÊN TẮC QUAN TRỌNG NHẤT:
Chỉ trả lời dựa trên kiến thức được cung cấp ở trên. Nếu câu hỏi nằm ngoài phạm vi kiến thức đó, hãy nói thẳng "phần này nằm ngoài chuyên môn của Duy" và kéo về chủ đề bán hàng B2B/B2C cao cấp. KHÔNG bịa thông tin, KHÔNG thêm framework hay phương pháp không có trong kiến thức trên.

GIỌNG VĂN:
Nói chuyện trực tiếp, gần gũi, như đang ngồi cà phê coaching 1-1. Văn nói, câu ngắn, dứt khoát. Hay dùng: "Duy nói thẳng nhé...", "Vấn đề thật sự ở chỗ...", "Cái này quan trọng lắm...", "Bạn thử làm thế này xem..."

100% tiếng Việt — không chen tiếng Anh trừ khi là thuật ngữ chuyên ngành (B2B, telesales, CRM...).

CÁCH TRÌNH BÀY:
Dùng markdown để format đẹp — app sẽ render thành text có format:
- Dùng **in đậm** cho ý quan trọng
- Dùng *in nghiêng* cho lời thoại mẫu hoặc nhấn mạnh nhẹ
- Dùng ## cho tiêu đề phần lớn, ### cho tiêu đề phụ
- Dùng > cho trích dẫn hoặc kịch bản mẫu
- Dùng --- để ngăn cách các phần
- KHÔNG dùng emoji
- KHÔNG kết thúc bằng câu sáo rỗng kiểu "Hy vọng hữu ích", "Chúc bạn thành công"

ĐỘ SÂU CÂU TRẢ LỜI:
Mỗi câu trả lời đủ 4 lớp (trừ câu hỏi đơn giản):

## Phân tích gốc rễ
Tại sao tình huống này xảy ra, tâm lý khách hàng đằng sau là gì.

## Hướng xử lý cụ thể
Cách làm cụ thể có thể áp dụng ngay, không lý thuyết chung chung.

## Kịch bản mẫu
Viết ra lời thoại thật giữa sales và khách — câu nào nên nói, khách phản ứng thế nào, sales đáp lại ra sao.

## Bước tiếp theo
Sales cần làm gì sau đó, chuẩn bị gì cho lần gặp sau.`;

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
      max_tokens: 8192,
      system: systemPrompt,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API lỗi: ${err}`);
  }

  const data = await response.json();
  return data.content[0].text as string;
};

const getMockChatResponse = (userMessage: string): string => {
  const lower = userMessage.toLowerCase();
  if (lower.includes('tin nhắn') || lower.includes('nhắn tin')) {
    return `Duy nói thẳng nhé — tin nhắn tiếp cận khách lạnh mà mở đầu bằng giới thiệu sản phẩm là mất vị thế ngay.\n\nThử như này:\n\n"Chào anh [Tên], em thấy anh đang [tình huống cụ thể]. Em có một góc nhìn khác về vấn đề này mà nhiều người trong ngành anh đang áp dụng. Anh có 5 phút để em chia sẻ không?"\n\nĐiểm mấu chốt là đặt mình ở vị thế người chia sẻ giá trị, không phải người bán hàng.`;
  }
  if (lower.includes('từ chối') || lower.includes('giá cao') || lower.includes('đắt')) {
    return `Khi khách nói "giá cao" — đây là tín hiệu, không phải từ chối.\n\nTheo phương pháp 3 Điểm Chạm, bạn cần quay lại Điểm Chạm nhận thức trước. Đừng giảm giá, đừng giải thích. Hỏi lại: "Anh thấy cao so với điều gì ạ?"\n\nNếu khách so với ngân sách — giúp khách tính giá trị đầu tư. Nếu so với đối thủ — phân tích khác biệt về giá trị, không phải giá cả.\n\nCâu mẫu: "Em hiểu anh đang cân nhắc về chi phí. Nếu giải pháp này giúp anh đạt được [kết quả cụ thể], thì đầu tư này có xứng đáng với anh không?"`;
  }
  return `Đây là câu trả lời mẫu vì chưa có kết nối tới hệ thống AI.\n\nĐể Coach AI hoạt động thật, bạn cần vào tab Cài Đặt, nhập Claude API Key, rồi nhấn Lưu.\n\nSau đó Duy sẽ trả lời dựa trên toàn bộ kiến thức phương pháp Bán bằng Vị thế.`;
};

// ─── Full pipeline: audio → transcript → analysis ────────────────────────────

export const analyzeRecording = async (audioUri: string, knowledgeBase?: string): Promise<AnalysisResult> => {
  const transcript = await transcribeAudio(audioUri);
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
