-- ============================================================
-- SALES COACH APP — PHASE 1 DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================================

-- ── Teams ───────────────────────────────────────────────────
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL,
  invite_code TEXT UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
  business_profile JSONB DEFAULT '{}',
  customer_statuses JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Profiles ────────────────────────────────────────────────
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'manager', 'member')),
  avatar_url TEXT,
  job_title TEXT DEFAULT '',
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add FK from teams.owner_id to profiles after profiles exists
ALTER TABLE public.teams
  ADD CONSTRAINT teams_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id);

-- ── Team Invitations ────────────────────────────────────────
CREATE TABLE public.team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  invited_email TEXT,
  invited_by UUID NOT NULL REFERENCES public.profiles(id),
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('manager', 'member')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '7 days',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Customers ───────────────────────────────────────────────
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  name TEXT NOT NULL,
  company TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  photo_url TEXT,
  status_id TEXT DEFAULT 'new',
  needs TEXT DEFAULT '',
  budget TEXT DEFAULT '',
  concerns TEXT DEFAULT '',
  stage TEXT DEFAULT '',
  decision_factors TEXT DEFAULT '',
  personality TEXT DEFAULT '',
  next_step TEXT DEFAULT '',
  icp JSONB DEFAULT '{}',
  decision_makers JSONB DEFAULT '[]',
  lead_score INTEGER DEFAULT 0,
  scoring JSONB DEFAULT '{}',
  ai_recommendation TEXT DEFAULT '',
  custom_fields JSONB DEFAULT '{}',
  notes JSONB DEFAULT '[]',
  session_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Sessions ────────────────────────────────────────────────
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  customer_name TEXT NOT NULL,
  company_name TEXT DEFAULT '',
  date TEXT NOT NULL,
  duration INTEGER NOT NULL,
  score NUMERIC(3,1) NOT NULL,
  outcome TEXT CHECK (outcome IN ('won', 'lost', 'pending')),
  analysis JSONB NOT NULL,
  audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Conversations ───────────────────────────────────────────
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  preview TEXT DEFAULT '',
  messages JSONB DEFAULT '[]',
  customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── AI Usage Logs ───────────────────────────────────────────
CREATE TABLE public.ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  team_id UUID REFERENCES public.teams(id),
  action TEXT NOT NULL,
  model TEXT NOT NULL,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  duration_ms INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Lesson Progress ─────────────────────────────────────────
CREATE TABLE public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- ── Activity Log (for admin tracking) ───────────────────────
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  team_id UUID REFERENCES public.teams(id),
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_profiles_team ON public.profiles(team_id);
CREATE INDEX idx_customers_team ON public.customers(team_id);
CREATE INDEX idx_sessions_team ON public.sessions(team_id);
CREATE INDEX idx_sessions_user ON public.sessions(user_id);
CREATE INDEX idx_conversations_user ON public.conversations(user_id);
CREATE INDEX idx_ai_usage_team ON public.ai_usage_logs(team_id);
CREATE INDEX idx_ai_usage_user ON public.ai_usage_logs(user_id);
CREATE INDEX idx_ai_usage_created ON public.ai_usage_logs(created_at);
CREATE INDEX idx_activity_team ON public.activity_logs(team_id);
CREATE INDEX idx_activity_user ON public.activity_logs(user_id);
CREATE INDEX idx_lesson_progress_user ON public.lesson_progress(user_id);
CREATE INDEX idx_invitations_email ON public.team_invitations(invited_email);

-- ============================================================
-- TRIGGER: Auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TRIGGER: Auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- RPC: Change user role (admin only)
-- ============================================================
CREATE OR REPLACE FUNCTION public.change_user_role(target_user_id UUID, new_role TEXT)
RETURNS VOID AS $$
BEGIN
  IF new_role NOT IN ('admin', 'manager', 'member') THEN
    RAISE EXCEPTION 'Invalid role';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
      AND team_id = (SELECT team_id FROM public.profiles WHERE id = target_user_id)
  ) THEN
    RAISE EXCEPTION 'Only admin can change roles';
  END IF;
  UPDATE public.profiles SET role = new_role WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RPC: Regenerate invite code
-- ============================================================
CREATE OR REPLACE FUNCTION public.regenerate_invite_code(p_team_id UUID)
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'manager') AND team_id = p_team_id
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  new_code := substr(md5(random()::text), 1, 8);
  UPDATE public.teams SET invite_code = new_code WHERE id = p_team_id;
  RETURN new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RPC: Get team stats (for admin dashboard)
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_team_stats(p_team_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_members', (SELECT count(*) FROM profiles WHERE team_id = p_team_id),
    'total_sessions', (SELECT count(*) FROM sessions WHERE team_id = p_team_id),
    'avg_score', (SELECT COALESCE(round(avg(score)::numeric, 1), 0) FROM sessions WHERE team_id = p_team_id),
    'won_deals', (SELECT count(*) FROM sessions WHERE team_id = p_team_id AND outcome = 'won'),
    'lost_deals', (SELECT count(*) FROM sessions WHERE team_id = p_team_id AND outcome = 'lost'),
    'ai_calls_today', (SELECT count(*) FROM ai_usage_logs WHERE team_id = p_team_id AND created_at > now() - INTERVAL '1 day'),
    'ai_calls_month', (SELECT count(*) FROM ai_usage_logs WHERE team_id = p_team_id AND created_at > now() - INTERVAL '30 days'),
    'total_tokens_month', (SELECT COALESCE(sum(input_tokens + output_tokens), 0) FROM ai_usage_logs WHERE team_id = p_team_id AND created_at > now() - INTERVAL '30 days'),
    'lessons_completed', (
      SELECT jsonb_agg(jsonb_build_object('user_id', lp.user_id, 'count', lp.cnt))
      FROM (SELECT user_id, count(*) as cnt FROM lesson_progress lp2 JOIN profiles p ON p.id = lp2.user_id WHERE p.team_id = p_team_id GROUP BY user_id) lp
    )
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RPC: Get member stats (per user detail)
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_member_stats(p_team_id UUID)
RETURNS JSONB AS $$
BEGIN
  RETURN (
    SELECT COALESCE(jsonb_agg(row_data), '[]'::jsonb)
    FROM (
      SELECT jsonb_build_object(
        'user_id', p.id,
        'full_name', p.full_name,
        'role', p.role,
        'avatar_url', p.avatar_url,
        'job_title', p.job_title,
        'total_sessions', (SELECT count(*) FROM sessions s WHERE s.user_id = p.id AND s.team_id = p_team_id),
        'avg_score', (SELECT COALESCE(round(avg(s.score)::numeric, 1), 0) FROM sessions s WHERE s.user_id = p.id AND s.team_id = p_team_id),
        'won', (SELECT count(*) FROM sessions s WHERE s.user_id = p.id AND s.team_id = p_team_id AND s.outcome = 'won'),
        'lost', (SELECT count(*) FROM sessions s WHERE s.user_id = p.id AND s.team_id = p_team_id AND s.outcome = 'lost'),
        'lessons_done', (SELECT count(*) FROM lesson_progress lp WHERE lp.user_id = p.id),
        'ai_calls_month', (SELECT count(*) FROM ai_usage_logs a WHERE a.user_id = p.id AND a.team_id = p_team_id AND a.created_at > now() - INTERVAL '30 days'),
        'last_active', (SELECT max(s.created_at) FROM sessions s WHERE s.user_id = p.id)
      ) as row_data
      FROM profiles p
      WHERE p.team_id = p_team_id
      ORDER BY p.full_name
    ) sub
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users read team profiles" ON public.profiles FOR SELECT USING (team_id IN (SELECT team_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());

-- Teams
CREATE POLICY "Team members read" ON public.teams FOR SELECT USING (id IN (SELECT team_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Authenticated create team" ON public.teams FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admin/manager update team" ON public.teams FOR UPDATE USING (
  id IN (SELECT team_id FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

-- Invitations
CREATE POLICY "Inviter read" ON public.team_invitations FOR SELECT USING (invited_by = auth.uid());
CREATE POLICY "Invited read" ON public.team_invitations FOR SELECT USING (invited_email = (SELECT email FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Admin/manager invite" ON public.team_invitations FOR INSERT WITH CHECK (
  team_id IN (SELECT team_id FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);
CREATE POLICY "Invited accept" ON public.team_invitations FOR UPDATE USING (
  invited_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
);

-- Customers
CREATE POLICY "Team read customers" ON public.customers FOR SELECT USING (team_id IN (SELECT team_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Team insert customers" ON public.customers FOR INSERT WITH CHECK (team_id IN (SELECT team_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Team update customers" ON public.customers FOR UPDATE USING (team_id IN (SELECT team_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Admin delete customers" ON public.customers FOR DELETE USING (
  created_by = auth.uid() OR team_id IN (SELECT team_id FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

-- Sessions
CREATE POLICY "Team read sessions" ON public.sessions FOR SELECT USING (team_id IN (SELECT team_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "User insert sessions" ON public.sessions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "User update own sessions" ON public.sessions FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "User delete own sessions" ON public.sessions FOR DELETE USING (user_id = auth.uid());

-- Conversations (private)
CREATE POLICY "User own conversations" ON public.conversations FOR ALL USING (user_id = auth.uid());

-- AI Usage
CREATE POLICY "User insert usage" ON public.ai_usage_logs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "User read own usage" ON public.ai_usage_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admin read team usage" ON public.ai_usage_logs FOR SELECT USING (
  team_id IN (SELECT team_id FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

-- Lesson Progress
CREATE POLICY "User own progress" ON public.lesson_progress FOR ALL USING (user_id = auth.uid());

-- Activity Logs
CREATE POLICY "User insert activity" ON public.activity_logs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admin read team activity" ON public.activity_logs FOR SELECT USING (
  team_id IN (SELECT team_id FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);
