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

// ── AI Quota Check ───────────────────────────────────────────
const DEFAULT_MONTHLY_QUOTA = 500; // lượt gọi AI / người / tháng

export async function checkAIQuota(userId: string, teamId: string): Promise<{ allowed: boolean; used: number; limit: number }> {
  const since = new Date();
  since.setDate(1); // đầu tháng
  since.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from('ai_usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('team_id', teamId)
    .gte('created_at', since.toISOString());

  const used = count || 0;
  return { allowed: used < DEFAULT_MONTHLY_QUOTA, used, limit: DEFAULT_MONTHLY_QUOTA };
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
