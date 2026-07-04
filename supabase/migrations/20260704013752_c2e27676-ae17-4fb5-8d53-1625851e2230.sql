
-- 1. promo_codes table
CREATE TABLE public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text,
  discount_percent integer NOT NULL DEFAULT 0 CHECK (discount_percent BETWEEN 0 AND 100),
  max_uses integer,
  uses integer NOT NULL DEFAULT 0,
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.promo_codes TO authenticated;
GRANT ALL ON public.promo_codes TO service_role;

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view active promo codes"
  ON public.promo_codes FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE TRIGGER promo_codes_set_updated_at
  BEFORE UPDATE ON public.promo_codes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. Featured flags
ALTER TABLE public.dev_profiles ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;
ALTER TABLE public.internships ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;
