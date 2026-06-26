
-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  college TEXT,
  location TEXT,
  bio TEXT,
  avatar_url TEXT,
  skills TEXT[] DEFAULT '{}',
  looking_for TEXT[] DEFAULT '{}',
  open_to_collab BOOLEAN DEFAULT true,
  github_url TEXT,
  linkedin_url TEXT,
  website_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are publicly readable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users delete own profile" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Projects
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tech_stack TEXT[] DEFAULT '{}',
  github_url TEXT,
  live_url TEXT,
  roles_needed TEXT[] DEFAULT '{}',
  tag TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
GRANT SELECT ON public.projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Projects public read" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Owners write projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners update projects" ON public.projects FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners delete projects" ON public.projects FOR DELETE USING (auth.uid() = owner_id);

-- Startup ideas
CREATE TABLE public.startup_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  pitch TEXT NOT NULL,
  roles_needed TEXT[] DEFAULT '{}',
  stage TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
GRANT SELECT ON public.startup_ideas TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.startup_ideas TO authenticated;
GRANT ALL ON public.startup_ideas TO service_role;
ALTER TABLE public.startup_ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Startups public read" ON public.startup_ideas FOR SELECT USING (true);
CREATE POLICY "Founder insert" ON public.startup_ideas FOR INSERT WITH CHECK (auth.uid() = founder_id);
CREATE POLICY "Founder update" ON public.startup_ideas FOR UPDATE USING (auth.uid() = founder_id);
CREATE POLICY "Founder delete" ON public.startup_ideas FOR DELETE USING (auth.uid() = founder_id);

-- Internships (admin-seeded; anyone can read)
CREATE TABLE public.internships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  stipend TEXT,
  duration TEXT,
  description TEXT,
  requirements TEXT[] DEFAULT '{}',
  tech_stack TEXT[] DEFAULT '{}',
  apply_url TEXT,
  posted_by UUID REFERENCES auth.users ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
GRANT SELECT ON public.internships TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.internships TO authenticated;
GRANT ALL ON public.internships TO service_role;
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Internships public read" ON public.internships FOR SELECT USING (true);
CREATE POLICY "Auth insert internships" ON public.internships FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Join requests for projects/startups
CREATE TABLE public.join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('project','startup')),
  target_id UUID NOT NULL,
  message TEXT,
  role TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(requester_id, target_type, target_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.join_requests TO authenticated;
GRANT ALL ON public.join_requests TO service_role;
ALTER TABLE public.join_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Requester reads own" ON public.join_requests FOR SELECT USING (auth.uid() = requester_id);
CREATE POLICY "Owner reads incoming projects" ON public.join_requests FOR SELECT USING (
  target_type = 'project' AND EXISTS (SELECT 1 FROM public.projects p WHERE p.id = target_id AND p.owner_id = auth.uid())
);
CREATE POLICY "Owner reads incoming startups" ON public.join_requests FOR SELECT USING (
  target_type = 'startup' AND EXISTS (SELECT 1 FROM public.startup_ideas s WHERE s.id = target_id AND s.founder_id = auth.uid())
);
CREATE POLICY "Requester creates" ON public.join_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Owner updates project requests" ON public.join_requests FOR UPDATE USING (
  target_type = 'project' AND EXISTS (SELECT 1 FROM public.projects p WHERE p.id = target_id AND p.owner_id = auth.uid())
);
CREATE POLICY "Owner updates startup requests" ON public.join_requests FOR UPDATE USING (
  target_type = 'startup' AND EXISTS (SELECT 1 FROM public.startup_ideas s WHERE s.id = target_id AND s.founder_id = auth.uid())
);

-- Connections (peer-to-peer)
CREATE TABLE public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(requester_id, addressee_id),
  CHECK (requester_id <> addressee_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.connections TO authenticated;
GRANT ALL ON public.connections TO service_role;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Involved read connections" ON public.connections FOR SELECT USING (auth.uid() IN (requester_id, addressee_id));
CREATE POLICY "Requester creates connection" ON public.connections FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Addressee updates connection" ON public.connections FOR UPDATE USING (auth.uid() = addressee_id);

-- Internship applications
CREATE TABLE public.internship_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  internship_id UUID NOT NULL REFERENCES public.internships ON DELETE CASCADE,
  cover_note TEXT,
  resume_snapshot JSONB,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','reviewing','accepted','rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(applicant_id, internship_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.internship_applications TO authenticated;
GRANT ALL ON public.internship_applications TO service_role;
ALTER TABLE public.internship_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Applicant read own apps" ON public.internship_applications FOR SELECT USING (auth.uid() = applicant_id);
CREATE POLICY "Applicant insert app" ON public.internship_applications FOR INSERT WITH CHECK (auth.uid() = applicant_id);
CREATE POLICY "Applicant delete app" ON public.internship_applications FOR DELETE USING (auth.uid() = applicant_id);

-- Resumes (one per user)
CREATE TABLE public.resumes (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  headline TEXT,
  summary TEXT,
  email TEXT,
  phone TEXT,
  location TEXT,
  links JSONB DEFAULT '{}'::jsonb,
  experiences JSONB DEFAULT '[]'::jsonb,
  education JSONB DEFAULT '[]'::jsonb,
  projects JSONB DEFAULT '[]'::jsonb,
  skills TEXT[] DEFAULT '{}',
  achievements JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resumes TO authenticated;
GRANT ALL ON public.resumes TO service_role;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner read resume" ON public.resumes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owner write resume" ON public.resumes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner update resume" ON public.resumes FOR UPDATE USING (auth.uid() = user_id);

-- AI mentor conversations
CREATE TABLE public.ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_messages TO authenticated;
GRANT ALL ON public.ai_messages TO service_role;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner read msgs" ON public.ai_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owner insert msgs" ON public.ai_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner delete msgs" ON public.ai_messages FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_ai_messages_user ON public.ai_messages(user_id, created_at);
CREATE INDEX idx_projects_owner ON public.projects(owner_id);
CREATE INDEX idx_startups_founder ON public.startup_ideas(founder_id);
