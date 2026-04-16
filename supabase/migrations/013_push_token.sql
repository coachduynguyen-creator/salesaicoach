-- ============================================================
-- Push notification token cho profiles
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS push_token TEXT,
  ADD COLUMN IF NOT EXISTS push_token_updated_at TIMESTAMPTZ;

-- Trigger tự động cập nhật push_token_updated_at khi token đổi
CREATE OR REPLACE FUNCTION public.touch_push_token() RETURNS trigger AS $$
BEGIN
  IF NEW.push_token IS DISTINCT FROM OLD.push_token THEN
    NEW.push_token_updated_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_touch_push_token ON public.profiles;
CREATE TRIGGER trg_touch_push_token
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_push_token();

CREATE INDEX IF NOT EXISTS idx_profiles_push_token ON public.profiles(push_token) WHERE push_token IS NOT NULL;
