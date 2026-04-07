// TypeScript types matching Supabase schema

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'manager' | 'member';
  avatar_url: string | null;
  job_title: string;
  team_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  owner_id: string;
  invite_code: string;
  business_profile: Record<string, any>;
  customer_statuses: any[];
  created_at: string;
  updated_at: string;
}

export interface TeamInvitation {
  id: string;
  team_id: string;
  invited_email: string | null;
  invited_by: string;
  role: 'manager' | 'member';
  status: 'pending' | 'accepted' | 'expired';
  expires_at: string;
  created_at: string;
}

export interface CloudCustomer {
  id: string;
  team_id: string;
  created_by: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  photo_url: string | null;
  status_id: string;
  needs: string;
  budget: string;
  concerns: string;
  stage: string;
  decision_factors: string;
  personality: string;
  next_step: string;
  icp: Record<string, any>;
  decision_makers: any[];
  lead_score: number;
  scoring: Record<string, any>;
  ai_recommendation: string;
  custom_fields: Record<string, string>;
  notes: any[];
  session_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface CloudSession {
  id: string;
  team_id: string;
  user_id: string;
  customer_name: string;
  company_name: string;
  date: string;
  duration: number;
  score: number;
  outcome: 'won' | 'lost' | 'pending' | null;
  analysis: Record<string, any>;
  audio_url: string | null;
  created_at: string;
}

export interface CloudConversation {
  id: string;
  user_id: string;
  team_id: string | null;
  title: string;
  preview: string;
  messages: any[];
  customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AIUsageLog {
  id?: string;
  user_id: string;
  team_id: string | null;
  action: 'transcribe' | 'analyze' | 'chat' | 'score_customer' | 'extract_customer';
  model: string;
  input_tokens: number;
  output_tokens: number;
  duration_ms: number;
  created_at?: string;
}

export interface LessonProgressRecord {
  id?: string;
  user_id: string;
  lesson_id: string;
  completed_at?: string;
}

export interface ActivityLog {
  id?: string;
  user_id: string;
  team_id: string | null;
  action: string;
  metadata: Record<string, any>;
  created_at?: string;
}

export interface TeamStats {
  total_members: number;
  total_sessions: number;
  avg_score: number;
  won_deals: number;
  lost_deals: number;
  ai_calls_today: number;
  ai_calls_month: number;
  total_tokens_month: number;
  lessons_completed: { user_id: string; count: number }[] | null;
}

export interface MemberStats {
  user_id: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
  job_title: string;
  total_sessions: number;
  avg_score: number;
  won: number;
  lost: number;
  lessons_done: number;
  ai_calls_month: number;
  last_active: string | null;
}
