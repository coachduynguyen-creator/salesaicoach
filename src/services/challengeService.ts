import AsyncStorage from '@react-native-async-storage/async-storage';

const CHALLENGE_KEY = '@salescoach_weekly_challenge';

export interface WeeklyChallenge {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  skill: string;
  tasks: string[];
}

const CHALLENGES: WeeklyChallenge[] = [
  {
    id: 1, title: 'Lắng nghe 3 tầng', icon: 'ear', color: '#2563EB', skill: 'Lắng nghe sâu',
    description: 'Tuần này tập trung nghe tầng 3: điều khách chưa nói ra.',
    tasks: ['Ghi âm ít nhất 2 buổi tư vấn', 'Sau mỗi buổi, ghi lại 1 điều khách chưa nói thẳng', 'Đạt điểm 7+ trong phần lắng nghe'],
  },
  {
    id: 2, title: 'Im lặng chiến lược', icon: 'volume-mute', color: '#8B5CF6', skill: 'Im lặng',
    description: 'Sau mỗi câu hỏi sâu, đợi ít nhất 5 giây trước khi nói.',
    tasks: ['Đếm 5 giây sau mỗi câu hỏi chiều sâu', 'Không lấp đầy khoảng lặng bằng thông tin sản phẩm', 'Ghi âm và xem AI chấm phần im lặng'],
  },
  {
    id: 3, title: 'Câu hỏi dẫn dắt', icon: 'help-circle', color: '#059669', skill: 'Đặt câu hỏi',
    description: 'Không hỏi có/không. Chỉ hỏi câu khiến khách dừng lại suy nghĩ.',
    tasks: ['Chuẩn bị 3 câu hỏi mở trước mỗi buổi', 'Tránh hỏi "Ngân sách bao nhiêu?" thay bằng "Anh mong đợi kết quả gì?"', 'Ghi nhận phản ứng khác biệt'],
  },
  {
    id: 4, title: 'Neo vững trước buổi gặp', icon: 'pulse', color: '#DC2626', skill: 'Quản trị cảm xúc',
    description: 'Thực hiện quy trình Neo vững 5 phút trước MỖI buổi tư vấn.',
    tasks: ['Nhận diện → Buông kỳ vọng → Xác nhận vai trò → Ý định', 'Làm ít nhất 3 lần trong tuần', 'Ghi nhận cảm giác khác biệt so với không neo vững'],
  },
  {
    id: 5, title: 'Phản chiếu', icon: 'eye', color: '#E67E22', skill: 'Phản chiếu',
    description: 'Tập phản chiếu: trả lại cho khách những gì họ nói, sắp xếp lại.',
    tasks: ['Dùng câu "Nếu em hiểu đúng..." ít nhất 2 lần mỗi buổi', 'Không kết luận thay khách', 'Xem AI đánh giá phần phản chiếu'],
  },
  {
    id: 6, title: 'Chạm Động Lực', icon: 'flame', color: '#F59E0B', skill: 'Điểm Chạm 1',
    description: 'Tập trung tìm động lực THẬT của khách, không phải động lực bề mặt.',
    tasks: ['Hỏi "Điều gì khiến anh/chị quan tâm vào lúc này?"', 'Đào sâu thêm 2-3 câu sau câu trả lời đầu', 'Ghi nhận khi khách chuyển từ trả lời chung sang cá nhân'],
  },
  {
    id: 7, title: 'Đọc tín hiệu mua', icon: 'scan', color: '#0891B2', skill: 'Đọc tín hiệu',
    description: 'Nhận biết khi nào khách sẵn sàng và khi nào cần quay lại.',
    tasks: ['Ghi nhận tín hiệu mở lòng vs phòng thủ', 'Khi thấy tín hiệu mua → DỪNG trình bày, bắt đầu cam kết', 'Khi thấy phòng thủ → quay về kết nối'],
  },
  {
    id: 8, title: 'REFLECT khi bị từ chối', icon: 'diamond', color: '#6366F1', skill: 'REFLECT',
    description: 'Khi khách từ chối, không vượt qua rào cản. Phản chiếu lại.',
    tasks: ['R: Tiếp nhận, không phản bác', 'E: Khám phá nỗi sợ phía sau', 'F: Tìm Điểm Chạm nào còn thiếu'],
  },
];

export interface SavedChallenge {
  challengeId: number;
  weekStart: string;
  tasksCompleted: boolean[];
}

export function getCurrentChallenge(): WeeklyChallenge {
  const weekOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (7 * 86400000));
  return CHALLENGES[weekOfYear % CHALLENGES.length];
}

export async function getChallengeProgress(): Promise<SavedChallenge> {
  const challenge = getCurrentChallenge();
  const raw = await AsyncStorage.getItem(CHALLENGE_KEY);
  if (raw) {
    const saved = JSON.parse(raw) as SavedChallenge;
    if (saved.challengeId === challenge.id) return saved;
  }
  const now = new Date();
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay())).toISOString().split('T')[0];
  return { challengeId: challenge.id, weekStart, tasksCompleted: challenge.tasks.map(() => false) };
}

export async function toggleChallengeTask(taskIndex: number): Promise<SavedChallenge> {
  const progress = await getChallengeProgress();
  progress.tasksCompleted[taskIndex] = !progress.tasksCompleted[taskIndex];
  await AsyncStorage.setItem(CHALLENGE_KEY, JSON.stringify(progress));
  return progress;
}
