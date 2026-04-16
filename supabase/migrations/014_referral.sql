-- ============================================================
-- Referral tracking: code per user + tracking who referred whom
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Sinh referral_code ngẫu nhiên 6 ký tự (alpha-numeric uppercase, loại I/O/0/1 dễ nhầm)
CREATE OR REPLACE FUNCTION public.generate_referral_code() RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..6 LOOP
    code := code || substr(chars, (floor(random() * length(chars))::int + 1), 1);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Tự động gán code khi tạo profile mới — dùng advisory lock để tránh race
-- giữa 2 INSERT đồng thời sinh trùng code. 32^6 ≈ 1 tỷ tổ hợp, va chạm hiếm
-- nhưng vẫn cần khóa để đảm bảo uniqueness.
CREATE OR REPLACE FUNCTION public.ensure_referral_code() RETURNS trigger AS $$
DECLARE
  new_code TEXT;
  attempts INT := 0;
BEGIN
  IF NEW.referral_code IS NULL THEN
    -- Advisory lock trên namespace cố định (hash arbitrary constant)
    PERFORM pg_advisory_xact_lock(8472619301234567890);
    LOOP
      new_code := public.generate_referral_code();
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = new_code);
      attempts := attempts + 1;
      IF attempts > 20 THEN
        -- Fallback cực hiếm: nhúng timestamp vào 2 ký tự cuối để giữ đúng 6 chars
        new_code := substr(new_code, 1, 4) ||
                    substr(
                      translate(
                        to_hex((extract(epoch from clock_timestamp())::bigint * 1000 + (random()*1000)::int) % 1024),
                        '0123456789abcdef',
                        'ABCDEFGHIJKLMNOP'
                      ),
                      1, 2
                    );
        EXIT;
      END IF;
    END LOOP;
    NEW.referral_code := new_code;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ensure_referral_code ON public.profiles;
CREATE TRIGGER trg_ensure_referral_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.ensure_referral_code();

-- Backfill code cho profiles đã tồn tại
UPDATE public.profiles
  SET referral_code = public.generate_referral_code()
  WHERE referral_code IS NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON public.profiles(referred_by) WHERE referred_by IS NOT NULL;

-- RPC đếm số người đã được user này giới thiệu thành công
CREATE OR REPLACE FUNCTION public.get_referral_count(for_user UUID)
RETURNS INTEGER
LANGUAGE sql STABLE
AS $$
  SELECT COUNT(*)::int FROM public.profiles WHERE referred_by = for_user;
$$;

-- RPC gán mã giới thiệu cho user mới — SECURITY DEFINER để bypass RLS
-- khi profile vừa được handle_new_user trigger tạo và chưa cấp quyền UPDATE.
CREATE OR REPLACE FUNCTION public.apply_referral(p_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referrer UUID;
  v_current_referrer UUID;
  v_user UUID := auth.uid();
BEGIN
  IF v_user IS NULL OR p_code IS NULL OR trim(p_code) = '' THEN
    RETURN FALSE;
  END IF;

  SELECT id INTO v_referrer FROM public.profiles
    WHERE referral_code = upper(trim(p_code)) LIMIT 1;
  IF v_referrer IS NULL OR v_referrer = v_user THEN
    RETURN FALSE;
  END IF;

  -- Chỉ gán nếu user hiện tại chưa có referred_by
  SELECT referred_by INTO v_current_referrer FROM public.profiles WHERE id = v_user;
  IF v_current_referrer IS NOT NULL THEN
    RETURN FALSE;
  END IF;

  UPDATE public.profiles SET referred_by = v_referrer WHERE id = v_user;
  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.apply_referral(TEXT) TO authenticated;
