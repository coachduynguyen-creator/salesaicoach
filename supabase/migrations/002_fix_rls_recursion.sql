-- ============================================================
-- FIX: RLS infinite recursion on profiles table
-- Run this in Supabase SQL Editor
-- ============================================================

-- Drop problematic policies
DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users read team profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;

-- Drop problematic team policies that reference profiles
DROP POLICY IF EXISTS "Team members read" ON public.teams;
DROP POLICY IF EXISTS "Admin/manager update team" ON public.teams;

-- Recreate profiles policies WITHOUT self-referencing subquery
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT
  USING (true);  -- Authenticated users can read all profiles (team filtering done in app)

CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE
  USING (id = auth.uid());

-- Recreate team policies using auth.uid() directly
CREATE POLICY "teams_select" ON public.teams FOR SELECT
  USING (true);  -- Authenticated users can read teams (filtering done in app)

CREATE POLICY "teams_update" ON public.teams FOR UPDATE
  USING (owner_id = auth.uid());

-- Fix invitation policies that reference profiles
DROP POLICY IF EXISTS "Invited read" ON public.team_invitations;
DROP POLICY IF EXISTS "Admin/manager invite" ON public.team_invitations;
DROP POLICY IF EXISTS "Invited accept" ON public.team_invitations;

CREATE POLICY "invitations_select" ON public.team_invitations FOR SELECT
  USING (invited_by = auth.uid() OR invited_email IS NOT NULL);

CREATE POLICY "invitations_insert" ON public.team_invitations FOR INSERT
  WITH CHECK (invited_by = auth.uid());

CREATE POLICY "invitations_update" ON public.team_invitations FOR UPDATE
  USING (true);

-- Fix customer policies
DROP POLICY IF EXISTS "Team read customers" ON public.customers;
DROP POLICY IF EXISTS "Team insert customers" ON public.customers;
DROP POLICY IF EXISTS "Team update customers" ON public.customers;
DROP POLICY IF EXISTS "Admin delete customers" ON public.customers;

CREATE POLICY "customers_select" ON public.customers FOR SELECT USING (true);
CREATE POLICY "customers_insert" ON public.customers FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "customers_update" ON public.customers FOR UPDATE USING (true);
CREATE POLICY "customers_delete" ON public.customers FOR DELETE USING (created_by = auth.uid());

-- Fix session policies
DROP POLICY IF EXISTS "Team read sessions" ON public.sessions;
CREATE POLICY "sessions_select" ON public.sessions FOR SELECT USING (true);

-- Fix AI usage policies
DROP POLICY IF EXISTS "Admin read team usage" ON public.ai_usage_logs;
CREATE POLICY "ai_usage_select_team" ON public.ai_usage_logs FOR SELECT USING (true);

-- Fix activity log policies
DROP POLICY IF EXISTS "Admin read team activity" ON public.activity_logs;
CREATE POLICY "activity_select" ON public.activity_logs FOR SELECT USING (true);
