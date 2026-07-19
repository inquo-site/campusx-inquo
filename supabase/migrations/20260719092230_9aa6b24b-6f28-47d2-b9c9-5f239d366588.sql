
ALTER TABLE public.admin_agent_tasks
  ADD COLUMN IF NOT EXISTS requires_approval boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'auto',
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_by text,
  ADD COLUMN IF NOT EXISTS email_status text,
  ADD COLUMN IF NOT EXISTS email_attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS email_last_error text,
  ADD COLUMN IF NOT EXISTS email_last_attempt_at timestamptz,
  ADD COLUMN IF NOT EXISTS run_id uuid;

CREATE INDEX IF NOT EXISTS admin_agent_tasks_approval_idx
  ON public.admin_agent_tasks (approval_status, created_at DESC);
CREATE INDEX IF NOT EXISTS admin_agent_tasks_run_idx
  ON public.admin_agent_tasks (run_id);

CREATE TABLE IF NOT EXISTS public.admin_agent_tool_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid,
  task_id uuid REFERENCES public.admin_agent_tasks(id) ON DELETE SET NULL,
  agent_role text,
  tool_name text NOT NULL,
  input jsonb NOT NULL DEFAULT '{}'::jsonb,
  output jsonb,
  error text,
  duration_ms integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS admin_agent_tool_calls_run_idx ON public.admin_agent_tool_calls (run_id, created_at);
CREATE INDEX IF NOT EXISTS admin_agent_tool_calls_task_idx ON public.admin_agent_tool_calls (task_id, created_at);

GRANT ALL ON public.admin_agent_tool_calls TO service_role;
ALTER TABLE public.admin_agent_tool_calls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role manages tool calls"
  ON public.admin_agent_tool_calls FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.admin_email_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES public.admin_agent_tasks(id) ON DELETE CASCADE,
  recipient text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0,
  provider text,
  provider_message_id text,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS admin_email_deliveries_task_idx ON public.admin_email_deliveries (task_id, created_at DESC);

GRANT ALL ON public.admin_email_deliveries TO service_role;
ALTER TABLE public.admin_email_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role manages email deliveries"
  ON public.admin_email_deliveries FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TRIGGER admin_email_deliveries_updated_at
  BEFORE UPDATE ON public.admin_email_deliveries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
