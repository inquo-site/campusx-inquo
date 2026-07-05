
ALTER TABLE public.agent_events ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_agent_events_owner ON public.agent_events(owner_id);

-- Update emit triggers to include owner_id
CREATE OR REPLACE FUNCTION public.emit_blog_status_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.status = 'published') OR
     (TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status AND NEW.status = 'published') THEN
    INSERT INTO public.agent_events (event_type, source_table, source_id, owner_id, payload)
    VALUES ('blog.published', 'blogs', NEW.id::text, NEW.author_id,
      jsonb_build_object('title', NEW.title, 'slug', NEW.slug, 'excerpt', NEW.excerpt, 'tags', NEW.tags));
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status AND OLD.status = 'published' THEN
    INSERT INTO public.agent_events (event_type, source_table, source_id, owner_id, payload)
    VALUES ('blog.unpublished', 'blogs', NEW.id::text, NEW.author_id,
      jsonb_build_object('title', NEW.title, 'slug', NEW.slug));
  END IF;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.emit_project_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.agent_events (event_type, source_table, source_id, owner_id, payload)
  VALUES ('project.created', 'projects', NEW.id::text, NEW.owner_id,
    jsonb_build_object('title', NEW.title, 'description', NEW.description, 'tech_stack', NEW.tech_stack, 'tag', NEW.tag));
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.emit_internship_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.agent_events (event_type, source_table, source_id, owner_id, payload)
  VALUES ('internship.created', 'internships', NEW.id::text, NEW.posted_by,
    jsonb_build_object('title', NEW.title, 'company', NEW.company, 'location', NEW.location));
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.emit_profile_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.agent_events (event_type, source_table, source_id, owner_id, payload)
  VALUES ('user.signup', 'profiles', NEW.id::text, NEW.id,
    jsonb_build_object('full_name', NEW.full_name, 'college', NEW.college));
  RETURN NEW;
END; $$;

-- Active-subscription helper
CREATE OR REPLACE FUNCTION public.has_active_autopilot(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.agent_subscriptions
    WHERE user_id = _user_id
      AND status = 'approved'
      AND (active_until IS NULL OR active_until > now())
  );
$$;

REVOKE EXECUTE ON FUNCTION public.has_active_autopilot(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_active_autopilot(uuid) TO authenticated, service_role;

-- Let users read their own agent runs / events
CREATE POLICY "own_events_select" ON public.agent_events
  FOR SELECT TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "own_runs_select" ON public.agent_runs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.agent_events e
      WHERE e.id = agent_runs.event_id AND e.owner_id = auth.uid()
    )
  );
