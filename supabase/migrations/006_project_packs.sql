-- ============================================================
-- PROJECT PACKS — User-uploaded project knowledge
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE TABLE public.project_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  is_team_shared BOOLEAN NOT NULL DEFAULT false,
  is_template BOOLEAN NOT NULL DEFAULT false,  -- do admin tạo, user copy được
  is_verified BOOLEAN NOT NULL DEFAULT false,  -- verified bởi Coach Duy
  name TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  copied_from_template UUID REFERENCES public.project_packs(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_project_packs_owner ON public.project_packs(owner_id);
CREATE INDEX idx_project_packs_team ON public.project_packs(team_id) WHERE is_team_shared = true;
CREATE INDEX idx_project_packs_template ON public.project_packs(is_template) WHERE is_template = true;

-- ── Active pack per user ──
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS active_pack_id UUID REFERENCES public.project_packs(id) ON DELETE SET NULL;

-- ── RLS ──
ALTER TABLE public.project_packs ENABLE ROW LEVEL SECURITY;

-- User đọc: pack của mình + team shared + templates
CREATE POLICY "packs_select" ON public.project_packs FOR SELECT
  USING (
    owner_id = auth.uid()
    OR (is_team_shared = true AND team_id = public.get_my_team_id())
    OR is_template = true
  );

-- User tạo pack cho chính mình hoặc team (nếu là admin/manager)
CREATE POLICY "packs_insert" ON public.project_packs FOR INSERT
  WITH CHECK (
    owner_id = auth.uid()
    AND (
      is_team_shared = false
      OR (is_team_shared = true AND public.is_team_admin_or_manager())
    )
    AND is_template = false  -- user không tạo được template (chỉ admin DB)
  );

-- User update pack của mình; team admin update pack team shared
CREATE POLICY "packs_update" ON public.project_packs FOR UPDATE
  USING (
    owner_id = auth.uid()
    OR (is_team_shared = true AND team_id = public.get_my_team_id() AND public.is_team_admin_or_manager())
  );

-- User xóa pack của mình
CREATE POLICY "packs_delete" ON public.project_packs FOR DELETE
  USING (owner_id = auth.uid());

-- Trigger update updated_at
CREATE OR REPLACE FUNCTION public.update_project_pack_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER project_pack_updated
  BEFORE UPDATE ON public.project_packs
  FOR EACH ROW EXECUTE FUNCTION public.update_project_pack_timestamp();

-- ── Helper: đếm pack của user ──
CREATE OR REPLACE FUNCTION public.count_user_packs(p_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(COUNT(*)::INTEGER, 0)
  FROM public.project_packs
  WHERE owner_id = p_user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── Template pack: Vinhomes Hạ Long Xanh (seed data) ──
INSERT INTO public.project_packs (id, owner_id, name, data, is_template, is_verified)
SELECT
  gen_random_uuid(),
  id,  -- owner = admin đầu tiên
  'Vinhomes Hạ Long Xanh',
  '{
    "project": {
      "name": "Vinhomes Hạ Long Xanh",
      "developer": "Vinhomes",
      "area": "Quảng Ninh",
      "location_detail": "Vịnh Hạ Long",
      "segment": "BĐS ven biển cao cấp",
      "product_types": ["shophouse", "biệt thự", "liền kề"],
      "price_range": "25-50 triệu/m²"
    },
    "market": {
      "data_source": "CBRE",
      "growth_rate": "15-20%",
      "growth_period": "2022-2024",
      "bank_rate": "5-5.5%",
      "bank_rate_type": "tiết kiệm 12 tháng"
    },
    "comparables": [
      {"name": "Ocean Park Gia Lâm", "note": "Vinhomes đã bàn giao 2019, giá thứ cấp 2023 tăng 45-55%"},
      {"name": "Smart City Tây Mỗ", "note": "Dự án Vinhomes đối chứng tại Hà Nội"},
      {"name": "Grand Park Long Biên", "note": "Minh chứng lịch sử tăng giá Vinhomes"}
    ],
    "rental": {
      "range": "15-25 triệu/tháng",
      "tenant_profile": "Doanh nhân trong nước + khách quốc tế"
    },
    "fees": {
      "service_annual": "30-50 triệu/năm",
      "service_note": "Thường được gộp vào giá thuê hoặc do người thuê chịu"
    },
    "unique_selling_points": [
      "Chuẩn vận hành Vinhomes",
      "Tiện ích đồng bộ",
      "Vị trí Vịnh Hạ Long di sản",
      "Thương hiệu CĐT uy tín"
    ]
  }'::jsonb,
  true,
  true
FROM public.profiles WHERE role = 'admin' LIMIT 1
ON CONFLICT DO NOTHING;
