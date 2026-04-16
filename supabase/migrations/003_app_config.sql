-- ============================================================
-- APP CONFIG TABLE — Remote configuration
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE TABLE public.app_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  description TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- Everyone can read config
CREATE POLICY "Anyone can read config"
  ON public.app_config FOR SELECT
  USING (true);

-- Only admins can update config
CREATE POLICY "Admins can manage config"
  ON public.app_config FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER config_updated
  BEFORE UPDATE ON public.app_config
  FOR EACH ROW EXECUTE FUNCTION update_config_timestamp();

-- ── Insert default config values ────────────────────────────

INSERT INTO public.app_config (key, value, description) VALUES
  ('pricing', '{
    "pro":    {"monthly":  499000, "yearly":  4790000},
    "bds_pro":{"monthly": 1000000, "yearly":  9600000},
    "team_s": {"monthly": 1999000, "yearly": 19190000},
    "team_m": {"monthly": 3499000, "yearly": 33590000},
    "team_l": {"monthly": 5999000, "yearly": 57590000}
  }', 'Bảng giá các gói subscription (VND)'),

  ('plan_limits', '{
    "free":    {"recordingsPerMonth": 3,   "aiChatsPerMonth": 10,  "lessonsAccess": 5,  "teamMembers": 1},
    "pro":     {"recordingsPerMonth": 999, "aiChatsPerMonth": 999, "lessonsAccess": 32, "teamMembers": 1},
    "bds_pro": {"recordingsPerMonth": 999, "aiChatsPerMonth": 999, "lessonsAccess": 32, "teamMembers": 1},
    "team_s":  {"recordingsPerMonth": 999, "aiChatsPerMonth": 999, "lessonsAccess": 32, "teamMembers": 5},
    "team_m":  {"recordingsPerMonth": 999, "aiChatsPerMonth": 999, "lessonsAccess": 32, "teamMembers": 10},
    "team_l":  {"recordingsPerMonth": 999, "aiChatsPerMonth": 999, "lessonsAccess": 32, "teamMembers": 20}
  }', 'Giới hạn tính năng theo gói'),

  ('trial', '{
    "enabled": true,
    "days": 7,
    "tier": "pro"
  }', 'Cấu hình dùng thử'),

  ('announcement', '{
    "enabled": false,
    "title": "",
    "message": "",
    "type": "info",
    "dismissable": true
  }', 'Thông báo hiển thị cho tất cả user'),

  ('maintenance', '{
    "enabled": false,
    "message": "Hệ thống đang bảo trì, vui lòng quay lại sau."
  }', 'Chế độ bảo trì'),

  ('feature_flags', '{
    "ai_coach": true,
    "recording": true,
    "crm": true,
    "training": true,
    "script_generator": true,
    "commission_calculator": true,
    "goal_setting": true
  }', 'Bật/tắt tính năng từ xa'),

  ('app_info', '{
    "min_version": "1.0.0",
    "latest_version": "1.0.0",
    "update_url": "",
    "force_update": false
  }', 'Thông tin phiên bản app');
