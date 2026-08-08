ALTER TABLE public.blogs
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS subcategory text,
  ADD COLUMN IF NOT EXISTS series text,
  ADD COLUMN IF NOT EXISTS keywords text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS faq jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS blocks jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS typography jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS scheduled_at timestamptz,
  ADD COLUMN IF NOT EXISTS image_alt text,
  ADD COLUMN IF NOT EXISTS image_caption text,
  ADD COLUMN IF NOT EXISTS show_toc boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS author_bio text,
  ADD COLUMN IF NOT EXISTS author_avatar text;

CREATE INDEX IF NOT EXISTS blogs_category_idx ON public.blogs (category);
CREATE INDEX IF NOT EXISTS blogs_scheduled_idx ON public.blogs (scheduled_at) WHERE status = 'scheduled';

CREATE TABLE IF NOT EXISTS public.blog_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.blog_templates TO service_role;

ALTER TABLE public.blog_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "No public access to blog templates" ON public.blog_templates;
CREATE POLICY "No public access to blog templates"
  ON public.blog_templates FOR SELECT TO authenticated USING (false);

DROP TRIGGER IF EXISTS blog_templates_set_updated_at ON public.blog_templates;
CREATE TRIGGER blog_templates_set_updated_at
  BEFORE UPDATE ON public.blog_templates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION public.publish_scheduled_blogs()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.blogs
  SET status = 'published',
      published_at = COALESCE(published_at, scheduled_at, now())
  WHERE status = 'scheduled'
    AND scheduled_at IS NOT NULL
    AND scheduled_at <= now();
$$;

REVOKE EXECUTE ON FUNCTION public.publish_scheduled_blogs() FROM anon, authenticated;

SELECT cron.unschedule('publish-scheduled-blogs')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'publish-scheduled-blogs');

SELECT cron.schedule(
  'publish-scheduled-blogs',
  '*/5 * * * *',
  $$SELECT public.publish_scheduled_blogs();$$
);