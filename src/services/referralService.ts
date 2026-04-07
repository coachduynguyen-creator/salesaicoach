import { Share } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const REFERRAL_KEY = '@salescoach_referrals';

export async function shareReferral(userName: string, teamInviteCode?: string): Promise<void> {
  const message = `${userName} mời bạn dùng Sales Coach App!

AI Coaching cho Sales theo phương pháp THE TRUSTED ADVISOR của Coach Duy Nguyễn.

Tính năng:
- Ghi âm buổi tư vấn, AI chấm điểm tự động
- AI Coach trả lời mọi tình huống bán hàng
- 32 bài học chuyên sâu
- CRM quản lý khách hàng

${teamInviteCode ? `Mã mời team: ${teamInviteCode}\n` : ''}Tải app: https://expo.dev/accounts/coachduynguyen/projects/SalesCoachApp

#SalesCoach #TheTrustedAdvisor`;

  await Share.share({ message, title: 'Mời dùng Sales Coach App' });

  // Track referral
  const raw = await AsyncStorage.getItem(REFERRAL_KEY);
  const count = raw ? parseInt(raw) + 1 : 1;
  await AsyncStorage.setItem(REFERRAL_KEY, count.toString());
}

export async function getReferralCount(): Promise<number> {
  const raw = await AsyncStorage.getItem(REFERRAL_KEY);
  return raw ? parseInt(raw) : 0;
}
