import AsyncStorage from '@react-native-async-storage/async-storage';

const INSIGHT_KEY = '@salescoach_daily_insight';
const INSIGHT_DATE_KEY = '@salescoach_daily_insight_date';

// Pool các insight cá nhân hóa theo ngày
const INSIGHTS = [
  {
    title: 'Quy tắc 70/30',
    body: 'Hôm nay hãy thử: nghe 70%, nói 30%. Sau mỗi câu hỏi, đếm 5 giây trước khi nói tiếp.',
    icon: 'ear',
    color: '#2563EB',
  },
  {
    title: 'Chạm Động Lực',
    body: 'Trước buổi tư vấn hôm nay, hãy hỏi: "Điều gì khiến anh/chị quan tâm đến vấn đề này vào lúc này?"',
    icon: 'flame',
    color: '#E67E22',
  },
  {
    title: 'Im lặng là sức mạnh',
    body: 'Sau câu hỏi chiều sâu, im lặng ít nhất 5 giây. Đừng lấp đầy khoảng trống. Để khách suy nghĩ.',
    icon: 'volume-mute',
    color: '#8B5CF6',
  },
  {
    title: 'Đọc tín hiệu "nhưng"',
    body: 'Khi khách nói "hay lắm nhưng...", mọi thứ trước "nhưng" là lịch sự, sau "nhưng" mới là thật.',
    icon: 'scan',
    color: '#059669',
  },
  {
    title: 'Neo vững 5 phút',
    body: 'Trước buổi gặp: Nhận diện cảm xúc → Buông kỳ vọng → "Tôi là cố vấn" → Ý định hôm nay là gì?',
    icon: 'pulse',
    color: '#DC2626',
  },
  {
    title: 'Cái giá của trì hoãn',
    body: 'Thử hỏi khách: "Nếu tình trạng này tiếp tục thêm 6 tháng, điều đó ảnh hưởng thế nào đến anh/chị?"',
    icon: 'timer',
    color: '#D97706',
  },
  {
    title: 'Phản chiếu, không nhắc lại',
    body: 'Hôm nay hãy thử: "Nếu em hiểu đúng, điều anh/chị đang chia sẻ là [tóm tắt sâu hơn]. Đúng không?"',
    icon: 'eye',
    color: '#7C3AED',
  },
  {
    title: 'Đừng bán khi khách chưa sẵn sàng',
    body: 'Gật đầu nhiều không có nghĩa là sẵn sàng mua. Hãy tìm tín hiệu thật: hỏi triển khai, dùng ngôn ngữ sở hữu.',
    icon: 'alert-circle',
    color: '#EF4444',
  },
  {
    title: 'Câu hỏi dẫn dắt vs thẩm vấn',
    body: 'Thay vì "Ngân sách bao nhiêu?", thử "Anh mong đợi giải pháp mang lại kết quả gì?" Khác biệt rất lớn.',
    icon: 'help-circle',
    color: '#0891B2',
  },
  {
    title: 'Công thức Trust',
    body: 'T = (C + R + E) / Sf. Hôm nay tập trung giảm Sf: bớt nói về mình, KPI, hoa hồng. Đó là cách nhanh nhất tăng Trust.',
    icon: 'shield-checkmark',
    color: '#1A7F64',
  },
  {
    title: '30 giây đầu tiên',
    body: 'Khách xếp bạn vào ô "người bán" hay "người đáng nghe" trong 30 giây. Mở đầu bằng câu hỏi quan tâm, không phải giới thiệu.',
    icon: 'timer',
    color: '#F59E0B',
  },
  {
    title: 'REFLECT khi bị từ chối',
    body: 'Khách nói "để suy nghĩ thêm"? R: Tiếp nhận → E: Khám phá → F: Tìm gốc → L: Kết nối lại động lực.',
    icon: 'diamond',
    color: '#6366F1',
  },
];

export interface DailyInsight {
  title: string;
  body: string;
  icon: string;
  color: string;
}

export async function getDailyInsight(): Promise<DailyInsight> {
  const today = new Date().toISOString().split('T')[0];
  const savedDate = await AsyncStorage.getItem(INSIGHT_DATE_KEY);

  if (savedDate === today) {
    const cached = await AsyncStorage.getItem(INSIGHT_KEY);
    if (cached) return JSON.parse(cached);
  }

  // Chọn insight theo ngày (deterministic)
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const insight = INSIGHTS[dayOfYear % INSIGHTS.length];

  await AsyncStorage.setItem(INSIGHT_KEY, JSON.stringify(insight));
  await AsyncStorage.setItem(INSIGHT_DATE_KEY, today);

  return insight;
}
