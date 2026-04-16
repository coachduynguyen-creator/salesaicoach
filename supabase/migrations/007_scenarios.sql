-- ============================================================
-- SCENARIOS — Knowledge base of 125 BĐS scenarios (TTA methodology)
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE TABLE public.scenarios (
  id TEXT PRIMARY KEY,  -- th_023, th_024...
  doc_ref TEXT NOT NULL,  -- TL01, TL02, TL03...
  section_code TEXT,  -- A, B, C, D...
  section_title TEXT,  -- "Từ chối về giá"
  title TEXT NOT NULL,  -- "Giá cao quá"
  objection_verbatim TEXT,  -- Câu khách nói nguyên văn

  -- Methodology
  methodology_tools TEXT[] DEFAULT '{}',  -- [REFLECT, DIQ]
  active_stages INTEGER[] DEFAULT '{}',  -- [2, 3]

  -- Structured content (JSONB để flexible)
  analysis TEXT,
  customer_psychology JSONB DEFAULT '{}',  -- {surface, middle, root}
  approach JSONB DEFAULT '{}',  -- {reflect, diq}
  script JSONB DEFAULT '[]',  -- [{speaker, content, note}]
  warnings JSONB DEFAULT '[]',
  skills_required TEXT,

  -- Search & categorization
  tags TEXT[] DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',

  -- Access control
  tier_access TEXT[] DEFAULT ARRAY['bds_pro'],  -- scenarios này chỉ cho bds_pro

  -- Relations
  related_ids TEXT[] DEFAULT '{}',

  -- Full text search content (để search nhanh)
  search_content TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Full text search index (Vietnamese-friendly với simple tokenizer)
CREATE INDEX idx_scenarios_search ON public.scenarios USING GIN (to_tsvector('simple', search_content));
CREATE INDEX idx_scenarios_tags ON public.scenarios USING GIN (tags);
CREATE INDEX idx_scenarios_keywords ON public.scenarios USING GIN (keywords);
CREATE INDEX idx_scenarios_section ON public.scenarios(section_code);

-- RLS
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;

-- Ai cũng đọc được scenarios (filter theo tier ở application layer)
CREATE POLICY "scenarios_select" ON public.scenarios FOR SELECT USING (true);

-- Chỉ admin update/insert
CREATE POLICY "scenarios_admin_insert" ON public.scenarios FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "scenarios_admin_update" ON public.scenarios FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "scenarios_admin_delete" ON public.scenarios FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── Function: search scenarios by keywords/tags ──
CREATE OR REPLACE FUNCTION public.search_scenarios(
  query_text TEXT,
  max_results INTEGER DEFAULT 3
)
RETURNS TABLE (
  id TEXT,
  title TEXT,
  section_title TEXT,
  rank REAL
) AS $$
  SELECT
    s.id,
    s.title,
    s.section_title,
    ts_rank(to_tsvector('simple', s.search_content), plainto_tsquery('simple', query_text)) AS rank
  FROM public.scenarios s
  WHERE to_tsvector('simple', s.search_content) @@ plainto_tsquery('simple', query_text)
     OR s.keywords && string_to_array(lower(query_text), ' ')
  ORDER BY rank DESC
  LIMIT max_results;
$$ LANGUAGE sql STABLE;
