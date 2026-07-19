
CREATE TABLE public.admin_agent_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES public.admin_agent_tasks(id) ON DELETE CASCADE,
  agent_role text NOT NULL,
  assigned_by text NOT NULL DEFAULT 'ceo',
  title text NOT NULL,
  brief text,
  plan text,
  execution_output text,
  status text NOT NULL DEFAULT 'planned',
  priority text NOT NULL DEFAULT 'normal',
  email_to text,
  emailed_at timestamptz,
  tags text[] NOT NULL DEFAULT '{}',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

GRANT ALL ON public.admin_agent_tasks TO service_role;

ALTER TABLE public.admin_agent_tasks ENABLE ROW LEVEL SECURITY;

-- Admin-only via service role; no policies grant regular users access.
CREATE POLICY "service role manages admin tasks" ON public.admin_agent_tasks
FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX admin_agent_tasks_status_idx ON public.admin_agent_tasks (status, created_at DESC);
CREATE INDEX admin_agent_tasks_role_idx ON public.admin_agent_tasks (agent_role, created_at DESC);
CREATE INDEX admin_agent_tasks_parent_idx ON public.admin_agent_tasks (parent_id);

CREATE TRIGGER admin_agent_tasks_updated_at
BEFORE UPDATE ON public.admin_agent_tasks
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
