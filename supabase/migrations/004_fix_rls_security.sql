-- ============================================================
-- FIX: RLS Security — Proper team-based isolation
-- Run this in Supabase SQL Editor
-- ============================================================

-- ── Helper function: lấy team_id của user hiện tại ──────────
-- Dùng SECURITY DEFINER để tránh RLS recursion khi query profiles
CREATE OR REPLACE FUNCTION public.get_my_team_id()
RETURNS UUID AS $$
  SELECT team_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── Helper function: kiểm tra user có phải admin/manager không ──
CREATE OR REPLACE FUNCTION public.is_team_admin_or_manager()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'manager')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- PROFILES — user đọc được profile cùng team + profile chính mình
-- ============================================================
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;

CREATE POLICY "profiles_select" ON public.profiles FOR SELECT
  USING (
    id = auth.uid()                           -- Đọc profile mình
    OR team_id = public.get_my_team_id()      -- Đọc profile cùng team
  );

CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE
  USING (id = auth.uid());                    -- Chỉ sửa profile mình

-- ============================================================
-- TEAMS — chỉ đọc team mình thuộc về
-- ============================================================
DROP POLICY IF EXISTS "teams_select" ON public.teams;
DROP POLICY IF EXISTS "teams_update" ON public.teams;

CREATE POLICY "teams_select" ON public.teams FOR SELECT
  USING (id = public.get_my_team_id());       -- Chỉ đọc team mình

CREATE POLICY "teams_update" ON public.teams FOR UPDATE
  USING (owner_id = auth.uid());              -- Chỉ owner sửa team

-- ============================================================
-- CUSTOMERS — chỉ đọc/sửa khách hàng cùng team
-- ============================================================
DROP POLICY IF EXISTS "customers_select" ON public.customers;
DROP POLICY IF EXISTS "customers_insert" ON public.customers;
DROP POLICY IF EXISTS "customers_update" ON public.customers;
DROP POLICY IF EXISTS "customers_delete" ON public.customers;

CREATE POLICY "customers_select" ON public.customers FOR SELECT
  USING (team_id = public.get_my_team_id());

CREATE POLICY "customers_insert" ON public.customers FOR INSERT
  WITH CHECK (team_id = public.get_my_team_id() AND created_by = auth.uid());

CREATE POLICY "customers_update" ON public.customers FOR UPDATE
  USING (team_id = public.get_my_team_id());

CREATE POLICY "customers_delete" ON public.customers FOR DELETE
  USING (team_id = public.get_my_team_id() AND (
    created_by = auth.uid() OR public.is_team_admin_or_manager()
  ));

-- ============================================================
-- SESSIONS — chỉ đọc session cùng team, sửa session mình tạo
-- ============================================================
DROP POLICY IF EXISTS "sessions_select" ON public.sessions;
DROP POLICY IF EXISTS "Own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Team insert sessions" ON public.sessions;
DROP POLICY IF EXISTS "Own update sessions" ON public.sessions;

CREATE POLICY "sessions_select" ON public.sessions FOR SELECT
  USING (team_id = public.get_my_team_id());

CREATE POLICY "sessions_insert" ON public.sessions FOR INSERT
  WITH CHECK (team_id = public.get_my_team_id() AND user_id = auth.uid());

CREATE POLICY "sessions_update" ON public.sessions FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================================
-- CONVERSATIONS — chỉ user tự đọc/sửa conversation mình
-- ============================================================
DROP POLICY IF EXISTS "User read own conversations" ON public.conversations;
DROP POLICY IF EXISTS "User insert own conversations" ON public.conversations;
DROP POLICY IF EXISTS "User update own conversations" ON public.conversations;
DROP POLICY IF EXISTS "User delete own conversations" ON public.conversations;

CREATE POLICY "conversations_select" ON public.conversations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "conversations_insert" ON public.conversations FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "conversations_update" ON public.conversations FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "conversations_delete" ON public.conversations FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================
-- AI USAGE LOGS — admin/manager đọc team, user đọc mình
-- ============================================================
DROP POLICY IF EXISTS "ai_usage_select_team" ON public.ai_usage_logs;
DROP POLICY IF EXISTS "ai_usage_insert" ON public.ai_usage_logs;

CREATE POLICY "ai_usage_select" ON public.ai_usage_logs FOR SELECT
  USING (
    user_id = auth.uid()                             -- Đọc usage mình
    OR (team_id = public.get_my_team_id()           -- Hoặc cùng team
        AND public.is_team_admin_or_manager())       -- Và là admin/manager
  );

CREATE POLICY "ai_usage_insert" ON public.ai_usage_logs FOR INSERT
  WITH CHECK (true);  -- Edge Function insert cho mọi user (auth đã verify ở function)

-- ============================================================
-- ACTIVITY LOGS — admin/manager đọc team, mọi user insert
-- ============================================================
DROP POLICY IF EXISTS "activity_select" ON public.activity_logs;
DROP POLICY IF EXISTS "User insert activity" ON public.activity_logs;

CREATE POLICY "activity_select" ON public.activity_logs FOR SELECT
  USING (
    user_id = auth.uid()
    OR (team_id = public.get_my_team_id() AND public.is_team_admin_or_manager())
  );

CREATE POLICY "activity_insert" ON public.activity_logs FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Cho phép admin update metadata (status bug report)
DROP POLICY IF EXISTS "activity_update" ON public.activity_logs;
CREATE POLICY "activity_update" ON public.activity_logs FOR UPDATE
  USING (public.is_team_admin_or_manager() AND team_id = public.get_my_team_id());

-- ============================================================
-- TEAM INVITATIONS — chỉ admin/manager tạo, invited user accept
-- ============================================================
DROP POLICY IF EXISTS "invitations_select" ON public.team_invitations;
DROP POLICY IF EXISTS "invitations_insert" ON public.team_invitations;
DROP POLICY IF EXISTS "invitations_update" ON public.team_invitations;

CREATE POLICY "invitations_select" ON public.team_invitations FOR SELECT
  USING (
    team_id = public.get_my_team_id()                  -- Cùng team
    OR invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())  -- Hoặc là người được mời
  );

CREATE POLICY "invitations_insert" ON public.team_invitations FOR INSERT
  WITH CHECK (
    team_id = public.get_my_team_id()
    AND public.is_team_admin_or_manager()
  );

CREATE POLICY "invitations_update" ON public.team_invitations FOR UPDATE
  USING (
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())  -- Người được mời accept
    OR (team_id = public.get_my_team_id() AND public.is_team_admin_or_manager())  -- Admin cancel
  );

-- ============================================================
-- LESSON PROGRESS — user chỉ đọc/sửa progress mình
-- ============================================================
DROP POLICY IF EXISTS "User read own progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "User insert own progress" ON public.lesson_progress;

CREATE POLICY "lesson_select" ON public.lesson_progress FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "lesson_insert" ON public.lesson_progress FOR INSERT
  WITH CHECK (user_id = auth.uid());
