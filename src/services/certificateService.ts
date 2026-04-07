import { Share } from 'react-native';

export async function shareCertificate(userName: string, lessonsCompleted: number, totalLessons: number): Promise<void> {
  const pct = Math.round((lessonsCompleted / totalLessons) * 100);
  const level = pct >= 100 ? 'Tốt nghiệp' : pct >= 75 ? 'Nâng cao' : pct >= 50 ? 'Trung cấp' : 'Sơ cấp';

  const text = `${'='.repeat(36)}
  CHỨNG NHẬN HOÀN THÀNH
  THE TRUSTED ADVISOR
${'='.repeat(36)}

Học viên: ${userName}
Trình độ: ${level}
Tiến độ: ${lessonsCompleted}/${totalLessons} bài học (${pct}%)

Phương pháp: Bán bằng Vị thế
Framework: 3 Điểm Chạm
Giảng viên: Coach Duy Nguyễn

${'─'.repeat(36)}
Sales Coach App
AI Coaching cho Sales
${'─'.repeat(36)}

#SalesCoach #TheTrustedAdvisor #CoachDuyNguyen`;

  await Share.share({
    message: text,
    title: 'Chứng nhận hoàn thành khóa học',
  });
}
