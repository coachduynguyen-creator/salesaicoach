import { supabase } from './supabaseClient';
import { AIUsageLog, ActivityLog, MemberStats, TeamStats } from '../types/database';

// ── AI Usage Logging ─────────────────────────────────────────
export async function logAIUsage(log: Omit<AIUsageLog, 'id' | 'created_at'>) {
  await supabase.from('ai_usage_logs').insert(log);
}

// ── Activity Logging ─────────────────────────────────────────
export async function logActivity(log: Omit<ActivityLog, 'id' | 'created_at'>) {
  await supabase.from('activity_logs').insert(log);
}

// ── Team Stats ───────────────────────────────────────────────
export async function getTeamStats(teamId: string): Promise<TeamStats | null> {
  const { data, error } = await supabase.rpc('get_team_stats', { p_team_id: teamId });
  if (error) return null;
  return data as TeamStats;
}

export async function getMemberStats(teamId: string): Promise<MemberStats[]> {
  const { data, error } = await supabase.rpc('get_member_stats', { p_team_id: teamId });
  if (error) return [];
  return (data as MemberStats[]) || [];
}

// ── Team Members ─────────────────────────────────────────────
export async function getTeamMembers(teamId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, avatar_url, job_title, created_at')
    .eq('team_id', teamId)
    .order('full_name');
  return data || [];
}

export async function removeTeamMember(userId: string) {
  // Kiểm tra nếu user này là owner — transfer ownership trước
  const { data: profile } = await supabase
    .from('profiles')
    .select('team_id, role')
    .eq('id', userId)
    .single();

  if (profile?.team_id) {
    const { data: team } = await supabase
      .from('teams')
      .select('owner_id')
      .eq('id', profile.team_id)
      .single();

    if (team?.owner_id === userId) {
      // Tìm admin/manager khác trong team
      const { data: nextOwner } = await supabase
        .from('profiles')
        .select('id')
        .eq('team_id', profile.team_id)
        .neq('id', userId)
        .in('role', ['admin', 'manager'])
        .limit(1)
        .maybeSingle();

      if (nextOwner) {
        // Transfer ownership + promote to admin
        await supabase.from('teams').update({ owner_id: nextOwner.id }).eq('id', profile.team_id);
        await supabase.from('profiles').update({ role: 'admin' }).eq('id', nextOwner.id);
      } else {
        // Không còn ai → tìm thành viên bất kỳ
        const { data: anyMember } = await supabase
          .from('profiles')
          .select('id')
          .eq('team_id', profile.team_id)
          .neq('id', userId)
          .limit(1)
          .maybeSingle();

        if (anyMember) {
          await supabase.from('teams').update({ owner_id: anyMember.id }).eq('id', profile.team_id);
          await supabase.from('profiles').update({ role: 'admin' }).eq('id', anyMember.id);
        } else {
          // Team trống → xóa team
          await supabase.from('teams').delete().eq('id', profile.team_id);
        }
      }
    }
  }

  await supabase.from('profiles').update({ team_id: null, role: 'member' }).eq('id', userId);
}

// ── Team Invitations ─────────────────────────────────────────
export async function getTeamInvitations(teamId: string) {
  const { data } = await supabase
    .from('team_invitations')
    .select('*')
    .eq('team_id', teamId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  return data || [];
}

export async function cancelInvitation(invitationId: string) {
  await supabase.from('team_invitations').delete().eq('id', invitationId);
}

// ── Cloud Sync: Sessions ─────────────────────────────────────
export async function syncSessionsUp(sessions: any[], teamId: string, userId: string) {
  for (const s of sessions) {
    await supabase.from('sessions').upsert({
      id: s.id,
      team_id: teamId,
      user_id: userId,
      customer_name: s.customerName || '',
      company_name: s.companyName || '',
      date: s.date,
      duration: s.duration || 0,
      score: s.score || 0,
      outcome: s.outcome || null,
      analysis: s.analysis || {},
    });
  }
}

export async function fetchTeamSessions(teamId: string) {
  const { data } = await supabase
    .from('sessions')
    .select('*')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false });
  return data || [];
}

// ── Cloud Sync: Customers ────────────────────────────────────
export async function syncCustomersUp(customers: any[], teamId: string, userId: string) {
  for (const c of customers) {
    await supabase.from('customers').upsert({
      id: c.id,
      team_id: teamId,
      created_by: userId,
      name: c.name,
      company: c.company || '',
      phone: c.phone || '',
      email: c.email || '',
      status_id: c.statusId || 'new',
      needs: c.needs || '',
      budget: c.budget || '',
      concerns: c.concerns || '',
      stage: c.stage || '',
      decision_factors: c.decisionFactors || '',
      personality: c.personality || '',
      next_step: c.nextStep || '',
      icp: c.icp || {},
      decision_makers: c.decisionMakers || [],
      lead_score: c.leadScore || 0,
      scoring: c.scoring || {},
      ai_recommendation: c.aiRecommendation || '',
      custom_fields: c.customFields || {},
      notes: c.notes || [],
      session_ids: c.sessionIds || [],
    });
  }
}

// ── Cloud Sync: Conversations ────────────────────────────────
export async function syncConversationsUp(conversations: any[], userId: string, teamId: string | null) {
  for (const c of conversations) {
    await supabase.from('conversations').upsert({
      id: c.id,
      user_id: userId,
      team_id: teamId,
      title: c.title || '',
      preview: c.preview || '',
      messages: c.messages || [],
      customer_id: c.customerId || null,
    });
  }
}

// ── Cloud Sync: Lesson Progress ──────────────────────────────
export async function syncLessonProgressUp(lessonIds: string[], userId: string) {
  for (const lid of lessonIds) {
    await supabase.from('lesson_progress').upsert(
      { user_id: userId, lesson_id: lid },
      { onConflict: 'user_id,lesson_id' }
    );
  }
}

// ── AI Quota Check (dựa trên subscription tier) ──────────────
const TIER_AI_LIMITS: Record<string, number> = {
  free: 10,
  pro: 999,
  bds_pro: 999,
  team_s: 999,
  team_m: 999,
  team_l: 999,
};

const TIER_RECORDING_LIMITS: Record<string, number> = {
  free: 3,
  pro: 999,
  bds_pro: 999,
  team_s: 999,
  team_m: 999,
  team_l: 999,
};

async function getUserTier(userId: string): Promise<string> {
  const { data } = await supabase
    .from('subscriptions')
    .select('tier, expires_at')
    .eq('user_id', userId)
    .single();

  if (!data) return 'free';
  if (data.expires_at && new Date(data.expires_at) < new Date()) return 'free';
  return data.tier || 'free';
}

export async function checkAIQuota(userId: string, _teamId: string): Promise<{ allowed: boolean; used: number; limit: number }> {
  const tier = await getUserTier(userId);
  const limit = TIER_AI_LIMITS[tier] || 10;

  const since = new Date();
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from('ai_usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', since.toISOString());

  const used = count || 0;
  return { allowed: used < limit, used, limit };
}

export async function checkRecordingQuota(userId: string): Promise<{ allowed: boolean; used: number; limit: number }> {
  const tier = await getUserTier(userId);
  const limit = TIER_RECORDING_LIMITS[tier] || 3;

  const since = new Date();
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', since.toISOString());

  const used = count || 0;
  return { allowed: used < limit, used, limit };
}

// ── AI Usage Summary (admin) ─────────────────────────────────
export async function getAIUsageSummary(teamId: string, days: number = 30) {
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const { data } = await supabase
    .from('ai_usage_logs')
    .select('user_id, action, model, input_tokens, output_tokens, created_at')
    .eq('team_id', teamId)
    .gte('created_at', since)
    .order('created_at', { ascending: false });
  return data || [];
}
