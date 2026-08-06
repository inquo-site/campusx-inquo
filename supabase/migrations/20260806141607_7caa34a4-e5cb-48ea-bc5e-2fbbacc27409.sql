CREATE TABLE public.team_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_slug text NOT NULL,
  agent_name text,
  title text NOT NULL,
  brief text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  plan text,
  output text,
  error text,
  model text,
  duration_ms integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_tasks TO authenticated;
GRANT ALL ON public.team_tasks TO service_role;

ALTER TABLE public.team_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own team tasks"
ON public.team_tasks FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX team_tasks_user_created_idx ON public.team_tasks (user_id, created_at DESC);

CREATE TRIGGER team_tasks_set_updated_at
BEFORE UPDATE ON public.team_tasks
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();