-- ============================================================
-- SUBSCRIPTIONS TABLE — Server-side subscription management
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'bds_pro', 'team_s', 'team_m', 'team_l')),
  expires_at TIMESTAMPTZ,
  activated_by UUID REFERENCES public.profiles(id),  -- admin who activated
  payment_note TEXT DEFAULT '',                       -- ghi chú thanh toán
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)  -- mỗi user chỉ có 1 subscription
);

-- RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- User đọc subscription mình
CREATE POLICY "sub_select" ON public.subscriptions FOR SELECT
  USING (user_id = auth.uid() OR public.is_team_admin_or_manager());

-- Admin insert/update subscription cho user cùng team
CREATE POLICY "sub_insert" ON public.subscriptions FOR INSERT
  WITH CHECK (public.is_team_admin_or_manager());

CREATE POLICY "sub_update" ON public.subscriptions FOR UPDATE
  USING (public.is_team_admin_or_manager());

-- Index
CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_team ON public.subscriptions(team_id);

-- ── Helper: lấy tier hiện tại của user ──
CREATE OR REPLACE FUNCTION public.get_user_tier(p_user_id UUID)
RETURNS TEXT AS $$
  SELECT COALESCE(
    (SELECT tier FROM public.subscriptions
     WHERE user_id = p_user_id
       AND (expires_at IS NULL OR expires_at > now())
     LIMIT 1),
    'free'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── Helper: đếm số lần dùng AI trong tháng ──
CREATE OR REPLACE FUNCTION public.get_ai_usage_count(p_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(COUNT(*)::INTEGER, 0)
  FROM public.ai_usage_logs
  WHERE user_id = p_user_id
    AND created_at >= date_trunc('month', now());
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── Helper: đếm số recording trong tháng ──
CREATE OR REPLACE FUNCTION public.get_recording_count(p_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(COUNT(*)::INTEGER, 0)
  FROM public.sessions
  WHERE user_id = p_user_id
    AND created_at >= date_trunc('month', now());
$$ LANGUAGE sql SECURITY DEFINER STABLE;
