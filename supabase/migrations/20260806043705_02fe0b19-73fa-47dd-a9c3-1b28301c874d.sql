CREATE TABLE public.ai_team_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_slug text NOT NULL,
  billing_cycle text NOT NULL DEFAULT 'monthly',
  amount_inr integer NOT NULL,
  upi_txn_id text NOT NULL,
  screenshot_url text,
  status text NOT NULL DEFAULT 'pending',
  admin_note text,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  active_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.ai_team_subscriptions TO authenticated;
GRANT ALL ON public.ai_team_subscriptions TO service_role;

ALTER TABLE public.ai_team_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own subs select" ON public.ai_team_subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own subs insert" ON public.ai_team_subscriptions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE TRIGGER trg_ai_team_subs_updated
  BEFORE UPDATE ON public.ai_team_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_ai_team_subs_user ON public.ai_team_subscriptions(user_id, team_slug, status);

CREATE OR REPLACE FUNCTION public.has_team_access(_user_id uuid, _team_slug text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.ai_team_subscriptions
    WHERE user_id = _user_id
      AND status = 'approved'
      AND (active_until IS NULL OR active_until > now())
      AND (team_slug = _team_slug OR team_slug = 'company-bundle')
  );
$$;

INSERT INTO public.ai_team_subscriptions (user_id, team_slug, billing_cycle, amount_inr, upi_txn_id, screenshot_url, status, admin_note, reviewed_by, reviewed_at, active_until, created_at)
SELECT user_id, 'company-bundle', 'monthly', amount_inr, upi_txn_id, screenshot_url, 'approved',
       COALESCE(admin_note, '') || ' [migrated from ₹999 Autopilot plan]', reviewed_by, reviewed_at, active_until, created_at
FROM public.agent_subscriptions
WHERE status = 'approved';