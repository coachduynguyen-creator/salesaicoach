import { supabase } from './supabaseClient';
import { Profile, Team } from '../types/database';
import { applyReferralCode } from './referralService';

export async function verifyInviteCode(code: string): Promise<boolean> {
  const { data } = await supabase
    .from('teams')
    .select('id')
    .eq('invite_code', code.trim().toLowerCase())
    .single();
  return !!data;
}

export async function signUp(
  email: string,
  password: string,
  fullName: string,
  inviteCode?: string,
  referralCode?: string,
) {
  // Invite-only: phải có mã mời hợp lệ
  if (!inviteCode?.trim()) {
    throw new Error('Cần có mã mời để đăng ký. Liên hệ quản lý team để nhận mã.');
  }
  const valid = await verifyInviteCode(inviteCode);
  if (!valid) {
    throw new Error('Mã mời không hợp lệ. Vui lòng kiểm tra lại hoặc liên hệ quản lý team.');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, invite_code: inviteCode.trim().toLowerCase() } },
  });
  if (error) throw error;

  // Gán mã giới thiệu nếu có — không chặn signup nếu lỗi
  if (data.user && referralCode?.trim()) {
    await applyReferralCode(data.user.id, referralCode).catch(() => {});
  }

  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  // Xoá push token với timeout 3s — nếu offline, không chặn signOut local
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { clearPushToken } = await import('./notificationService');
      await Promise.race([
        clearPushToken(user.id),
        new Promise(resolve => setTimeout(resolve, 3000)),
      ]);
    }
  } catch { /* không chặn signOut */ }

  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return data as Profile | null;
}

export async function updateProfile(updates: Partial<Profile>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
  if (error) throw error;
}

export async function createTeam(name: string): Promise<Team> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: team, error: teamError } = await supabase
    .from('teams')
    .insert({ name, owner_id: user.id })
    .select()
    .single();
  if (teamError) throw teamError;

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ team_id: team.id, role: 'admin' })
    .eq('id', user.id);
  if (profileError) throw profileError;

  return team as Team;
}

const TIER_MEMBER_LIMITS: Record<string, number> = {
  free: 1, pro: 1, bds_pro: 1, team_s: 5, team_m: 10, team_l: 20,
};

export async function joinTeamByCode(code: string): Promise<Team> {
  const { data: team, error } = await supabase
    .from('teams')
    .select('*')
    .eq('invite_code', code.trim().toLowerCase())
    .single();
  if (error || !team) throw new Error('Mã mời không hợp lệ');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Chưa đăng nhập');

  // Kiểm tra member limit dựa trên subscription của owner
  const { data: ownerSub } = await supabase
    .from('subscriptions')
    .select('tier, expires_at')
    .eq('user_id', team.owner_id)
    .maybeSingle();

  const ownerTier = ownerSub && (!ownerSub.expires_at || new Date(ownerSub.expires_at) > new Date())
    ? ownerSub.tier : 'free';
  const limit = TIER_MEMBER_LIMITS[ownerTier] || 1;

  // Đếm số thành viên hiện tại
  const { count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('team_id', team.id);

  if ((count || 0) >= limit) {
    throw new Error(`Team đã đầy (${count}/${limit} người). Yêu cầu quản lý nâng cấp gói lớn hơn.`);
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ team_id: team.id, role: 'member' })
    .eq('id', user.id);
  if (profileError) throw profileError;

  return team as Team;
}

export async function getTeam(teamId: string): Promise<Team | null> {
  const { data } = await supabase.from('teams').select('*').eq('id', teamId).single();
  return data as Team | null;
}

export async function checkPendingInvitations(): Promise<any[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from('team_invitations')
    .select('*, teams(name)')
    .eq('invited_email', user.email)
    .eq('status', 'pending');
  return data || [];
}

export async function acceptInvitation(invitationId: string, teamId: string, role: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  await supabase.from('team_invitations').update({ status: 'accepted' }).eq('id', invitationId);
  await supabase.from('profiles').update({ team_id: teamId, role }).eq('id', user.id);
}

export async function sendInvitation(teamId: string, email: string, role: 'manager' | 'member') {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { error } = await supabase.from('team_invitations').insert({
    team_id: teamId,
    invited_email: email.toLowerCase().trim(),
    invited_by: user.id,
    role,
  });
  if (error) throw error;
}

export async function changeUserRole(targetUserId: string, newRole: string) {
  const { error } = await supabase.rpc('change_user_role', {
    target_user_id: targetUserId,
    new_role: newRole,
  });
  if (error) throw error;
}

export async function regenerateInviteCode(teamId: string): Promise<string> {
  const { data, error } = await supabase.rpc('regenerate_invite_code', { p_team_id: teamId });
  if (error) throw error;
  return data as string;
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}

/** Xóa tài khoản và toàn bộ dữ liệu */
export async function deleteAccount() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Xóa dữ liệu user trên cloud
  await supabase.from('ai_usage_logs').delete().eq('user_id', user.id);
  await supabase.from('activity_logs').delete().eq('user_id', user.id);
  await supabase.from('lesson_progress').delete().eq('user_id', user.id);
  await supabase.from('conversations').delete().eq('user_id', user.id);
  await supabase.from('sessions').delete().eq('user_id', user.id);

  // Xóa profile (sẽ cascade)
  await supabase.from('profiles').delete().eq('id', user.id);

  // Sign out
  await supabase.auth.signOut();
}
