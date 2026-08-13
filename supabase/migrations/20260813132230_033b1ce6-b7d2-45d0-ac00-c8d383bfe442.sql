-- Rich detail fields
ALTER TABLE public.internships
  ADD COLUMN IF NOT EXISTS eligibility text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS skills text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS faq jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS timeline jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS deadline date,
  ADD COLUMN IF NOT EXISTS enriched_at timestamptz;

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS requirements text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS eligibility text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS skills text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS faq jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS timeline jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS deadline date,
  ADD COLUMN IF NOT EXISTS enriched_at timestamptz;

ALTER TABLE public.hackathons
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS eligibility text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS skills text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS requirements text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS faq jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS timeline jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS enriched_at timestamptz;

-- Auto-update run log
CREATE TABLE IF NOT EXISTS public.opportunity_sync_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  status text NOT NULL DEFAULT 'running',
  enriched_count integer NOT NULL DEFAULT 0,
  archived_count integer NOT NULL DEFAULT 0,
  note text,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz
);

GRANT SELECT ON public.opportunity_sync_runs TO authenticated;
GRANT SELECT ON public.opportunity_sync_runs TO anon;
GRANT ALL ON public.opportunity_sync_runs TO service_role;

ALTER TABLE public.opportunity_sync_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sync runs are readable by everyone"
  ON public.opportunity_sync_runs FOR SELECT USING (true);

-- Daily auto-refresh of opportunity pages
SELECT cron.unschedule('opportunities-daily-refresh')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'opportunities-daily-refresh');

SELECT cron.schedule(
  'opportunities-daily-refresh',
  '30 1 * * *',
  $$SELECT net.http_post(
      url := 'https://project--1d9778e6-2419-43b2-abbb-54ef30157979.lovable.app/api/public/hooks/refresh-opportunities',
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := '{}'::jsonb
    );$$
);