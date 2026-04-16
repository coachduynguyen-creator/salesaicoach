import { Share } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseClient';

const REFERRAL_SHARE_COUNT_KEY = '@salescoach_referral_shares';

/** Lấy mã giới thiệu của user hiện tại (trigger DB đã sinh sẵn khi tạo profile) */
export async function getMyReferralCode(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('profiles')
    .select('referral_code')
    .eq('id', user.id)
    .single();
  return data?.referral_code ?? null;
}

/** Đếm số người đã đăng ký nhờ mã của user hiện tại (từ DB) */
export async function getReferralSignupCount(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;
  const { data, error } = await supabase.rpc('get_referral_count', { for_user: user.id });
  if (error || data == null) return 0;
  return typeof data === 'number' ? data : 0;
}

/** Số lần user đã bấm "Chia sẻ" (local, không phải đăng ký thành công) */
export async function getReferralShareCount(): Promise<number> {
  const raw = await AsyncStorage.getItem(REFERRAL_SHARE_COUNT_KEY);
  return raw ? parseInt(raw, 10) || 0 : 0;
}

/** Gán mã giới thiệu — gọi RPC SECURITY DEFINER để bypass RLS & retry nếu profile
 *  chưa kịp được handle_new_user trigger tạo. */
export async function applyReferralCode(_newUserId: string, code: string): Promise<boolean> {
  if (!code.trim()) return false;
  // Chỉ chấp nhận charset trong ensure_referral_code (loại I/O/0/1)
  if (!/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/.test(code.trim().toUpperCase())) return false;

  for (let i = 0; i < 3; i++) {
    const { data, error } = await supabase.rpc('apply_referral', { p_code: code.trim().toUpperCase() });
    if (!error && data === true) return true;
    await new Promise(r => setTimeout(r, 500 * (i + 1)));
  }
  return false;
}

/** Chia sẻ link mời kèm mã của user */
export async function shareReferral(userName: string, teamInviteCode?: string): Promise<void> {
  const myCode = await getMyReferralCode();
  const parts = [
    `${userName} mời bạn dùng Sales Coach App!`,
    '',
    'AI Coaching cho Sales theo phương pháp THE TRUSTED ADVISOR của Coach Duy Nguyễn.',
    '',
    'Tính năng:',
    '- Ghi âm buổi tư vấn, AI chấm điểm tự động',
    '- AI Coach trả lời mọi tình huống bán hàng',
    '- 32 bài học chuyên sâu',
    '- CRM quản lý khách hàng',
    '',
  ];
  if (myCode) parts.push(`Mã giới thiệu của mình: ${myCode}`);
  if (teamInviteCode) parts.push(`Mã mời team: ${teamInviteCode}`);
  parts.push('Tải app: https://expo.dev/accounts/coachduynguyen/projects/SalesCoachApp');
  parts.push('', '#SalesCoach #TheTrustedAdvisor');

  await Share.share({ message: parts.join('\n'), title: 'Mời dùng Sales Coach App' });

  const raw = await AsyncStorage.getItem(REFERRAL_SHARE_COUNT_KEY);
  const count = (raw ? parseInt(raw, 10) || 0 : 0) + 1;
  await AsyncStorage.setItem(REFERRAL_SHARE_COUNT_KEY, count.toString());
}

/** @deprecated — alias cũ */
export async function getReferralCount(): Promise<number> {
  return getReferralShareCount();
}
