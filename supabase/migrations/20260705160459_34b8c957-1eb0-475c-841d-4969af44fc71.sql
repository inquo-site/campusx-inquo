
CREATE TABLE public.agent_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  upi_txn_id text NOT NULL,
  screenshot_url text,
  amount_inr integer NOT NULL DEFAULT 999,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  admin_note text,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  active_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_subs_user ON public.agent_subscriptions(user_id);
CREATE INDEX idx_agent_subs_status ON public.agent_subscriptions(status);

GRANT SELECT, INSERT, UPDATE ON public.agent_subscriptions TO authenticated;
GRANT ALL ON public.agent_subscriptions TO service_role;

ALTER TABLE public.agent_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_select" ON public.agent_subscriptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "own_insert" ON public.agent_subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "admin_select_all" ON public.agent_subscriptions
  FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'email') IN ('inquosite@gmail.com','suman@campusx.in'));

CREATE POLICY "admin_update" ON public.agent_subscriptions
  FOR UPDATE TO authenticated
  USING ((auth.jwt() ->> 'email') IN ('inquosite@gmail.com','suman@campusx.in'))
  WITH CHECK ((auth.jwt() ->> 'email') IN ('inquosite@gmail.com','suman@campusx.in'));

CREATE TRIGGER trg_agent_subs_updated
  BEFORE UPDATE ON public.agent_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
