import { Share } from 'react-native';
import { TeamStats, MemberStats } from '../types/database';

export function generateTeamReport(
  teamName: string,
  stats: TeamStats,
  members: MemberStats[],
): string {
  const now = new Date();
  const month = `${now.getMonth() + 1}/${now.getFullYear()}`;
  const winRate = (stats.won_deals + stats.lost_deals) > 0
    ? Math.round((stats.won_deals / (stats.won_deals + stats.lost_deals)) * 100)
    : 0;

  let report = `BÁO CÁO HIỆU SUẤT TEAM\n`;
  report += `${teamName} | Tháng ${month}\n`;
  report += `${'='.repeat(40)}\n\n`;

  report += `TỔNG QUAN\n`;
  report += `- Thành viên: ${stats.total_members}\n`;
  report += `- Tổng buổi ghi âm: ${stats.total_sessions}\n`;
  report += `- Điểm trung bình: ${stats.avg_score}/10\n`;
  report += `- Deal Won: ${stats.won_deals} | Lost: ${stats.lost_deals} | Win Rate: ${winRate}%\n`;
  report += `- AI calls tháng này: ${stats.ai_calls_month}\n`;
  report += `- Tokens sử dụng: ${stats.total_tokens_month?.toLocaleString() || 0}\n\n`;

  report += `BẢNG XẾP HẠNG NHÂN VIÊN\n`;
  report += `${'-'.repeat(40)}\n`;

  const sorted = [...members].sort((a, b) => b.avg_score - a.avg_score);
  sorted.forEach((m, idx) => {
    const mWinRate = (m.won + m.lost) > 0 ? Math.round((m.won / (m.won + m.lost)) * 100) : 0;
    report += `${idx + 1}. ${m.full_name || 'Chưa tên'}\n`;
    report += `   Điểm TB: ${m.avg_score} | Buổi: ${m.total_sessions} | Won: ${m.won} | Win: ${mWinRate}%\n`;
    report += `   Bài học: ${m.lessons_done}/32 | AI calls: ${m.ai_calls_month}\n\n`;
  });

  report += `${'='.repeat(40)}\n`;
  report += `Xuất bởi Sales Coach App | THE TRUSTED ADVISOR\n`;
  report += `Coach Duy Nguyễn\n`;

  return report;
}

export async function shareTeamReport(
  teamName: string,
  stats: TeamStats,
  members: MemberStats[],
): Promise<void> {
  const report = generateTeamReport(teamName, stats, members);
  await Share.share({
    message: report,
    title: `Báo cáo Team ${teamName}`,
  });
}
