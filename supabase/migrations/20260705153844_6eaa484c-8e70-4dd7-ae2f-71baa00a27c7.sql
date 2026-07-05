
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Event log
CREATE TABLE public.agent_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- blog.published, blog.unpublished, user.signup, project.created, internship.created, cron.analytics_daily
  source_table TEXT,
  source_id TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, dispatched, done, error
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  dispatched_at TIMESTAMPTZ
);
GRANT ALL ON public.agent_events TO service_role;
ALTER TABLE public.agent_events ENABLE ROW LEVEL SECURITY;
-- No policies: only service_role reads/writes. Admin panel uses service role via server fn.

-- Agent runs (output)
CREATE TABLE public.agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.agent_events(id) ON DELETE SET NULL,
  agent_name TEXT NOT NULL, -- Builder, QA, Deploy, Feature-Discovery, Growth, Lead-Gen, Analytics
  event_type TEXT NOT NULL,
  input JSONB NOT NULL DEFAULT '{}'::jsonb,
  output TEXT,
  status TEXT NOT NULL DEFAULT 'running', -- running, success, error
  error TEXT,
  duration_ms INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.agent_runs TO service_role;
ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_agent_events_created ON public.agent_events (created_at DESC);
CREATE INDEX idx_agent_runs_created ON public.agent_runs (created_at DESC);

-- Dispatch: after event insert, call the /api/public/hooks/agent-dispatch endpoint
CREATE OR REPLACE FUNCTION public.dispatch_agent_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_secret TEXT;
  v_url TEXT := 'https://project--1d9778e6-2419-43b2-abbb-54ef30157979.lovable.app/api/public/hooks/agent-dispatch';
BEGIN
  -- Fire-and-forget HTTP call; the endpoint reads AGENT_DISPATCH_SECRET server-side.
  PERFORM net.http_post(
    url := v_url,
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object('event_id', NEW.id::text)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER agent_events_dispatch
AFTER INSERT ON public.agent_events
FOR EACH ROW EXECUTE FUNCTION public.dispatch_agent_event();

-- Trigger: blog publish/unpublish
CREATE OR REPLACE FUNCTION public.emit_blog_status_event()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.status = 'published') OR
     (TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status AND NEW.status = 'published') THEN
    INSERT INTO public.agent_events (event_type, source_table, source_id, payload)
    VALUES ('blog.published', 'blogs', NEW.id::text,
      jsonb_build_object('title', NEW.title, 'slug', NEW.slug, 'excerpt', NEW.excerpt, 'tags', NEW.tags));
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status AND OLD.status = 'published' THEN
    INSERT INTO public.agent_events (event_type, source_table, source_id, payload)
    VALUES ('blog.unpublished', 'blogs', NEW.id::text,
      jsonb_build_object('title', NEW.title, 'slug', NEW.slug));
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER blog_status_agent_event
AFTER INSERT OR UPDATE OF status ON public.blogs
FOR EACH ROW EXECUTE FUNCTION public.emit_blog_status_event();

-- Trigger: new profile (user signup)
CREATE OR REPLACE FUNCTION public.emit_profile_event()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.agent_events (event_type, source_table, source_id, payload)
  VALUES ('user.signup', 'profiles', NEW.id::text,
    jsonb_build_object('full_name', NEW.full_name, 'college', NEW.college));
  RETURN NEW;
END;
$$;
CREATE TRIGGER profile_signup_agent_event
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.emit_profile_event();

-- Trigger: new project
CREATE OR REPLACE FUNCTION public.emit_project_event()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.agent_events (event_type, source_table, source_id, payload)
  VALUES ('project.created', 'projects', NEW.id::text,
    jsonb_build_object('title', NEW.title, 'description', NEW.description, 'tech_stack', NEW.tech_stack, 'tag', NEW.tag));
  RETURN NEW;
END;
$$;
CREATE TRIGGER project_created_agent_event
AFTER INSERT ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.emit_project_event();

-- Trigger: new internship
CREATE OR REPLACE FUNCTION public.emit_internship_event()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.agent_events (event_type, source_table, source_id, payload)
  VALUES ('internship.created', 'internships', NEW.id::text,
    jsonb_build_object('title', NEW.title, 'company', NEW.company, 'location', NEW.location));
  RETURN NEW;
END;
$$;
CREATE TRIGGER internship_created_agent_event
AFTER INSERT ON public.internships
FOR EACH ROW EXECUTE FUNCTION public.emit_internship_event();
