-- JOBS
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  role_type TEXT NOT NULL DEFAULT 'full-time',
  experience TEXT,
  salary TEXT,
  tech_stack TEXT[] NOT NULL DEFAULT '{}',
  apply_url TEXT,
  source TEXT,
  description TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  posted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.jobs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated;
GRANT ALL ON public.jobs TO service_role;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jobs_public_read" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "jobs_insert_own" ON public.jobs FOR INSERT TO authenticated WITH CHECK (auth.uid() = posted_by);
CREATE POLICY "jobs_update_own" ON public.jobs FOR UPDATE TO authenticated USING (auth.uid() = posted_by) WITH CHECK (auth.uid() = posted_by);
CREATE POLICY "jobs_delete_own" ON public.jobs FOR DELETE TO authenticated USING (auth.uid() = posted_by);

-- HACKATHONS
CREATE TABLE public.hackathons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  organiser TEXT,
  mode TEXT NOT NULL DEFAULT 'online',
  location TEXT,
  theme TEXT,
  prize_pool TEXT,
  team_size TEXT,
  starts_at DATE,
  ends_at DATE,
  register_url TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  posted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.hackathons TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hackathons TO authenticated;
GRANT ALL ON public.hackathons TO service_role;
ALTER TABLE public.hackathons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hackathons_public_read" ON public.hackathons FOR SELECT USING (true);
CREATE POLICY "hackathons_insert_own" ON public.hackathons FOR INSERT TO authenticated WITH CHECK (auth.uid() = posted_by);
CREATE POLICY "hackathons_update_own" ON public.hackathons FOR UPDATE TO authenticated USING (auth.uid() = posted_by) WITH CHECK (auth.uid() = posted_by);
CREATE POLICY "hackathons_delete_own" ON public.hackathons FOR DELETE TO authenticated USING (auth.uid() = posted_by);

-- ALUMNI
CREATE TABLE public.alumni_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  role TEXT,
  batch TEXT,
  college TEXT,
  linkedin_url TEXT,
  domains TEXT[] NOT NULL DEFAULT '{}',
  open_to_referrals BOOLEAN NOT NULL DEFAULT true,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.alumni_profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alumni_profiles TO authenticated;
GRANT ALL ON public.alumni_profiles TO service_role;
ALTER TABLE public.alumni_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alumni_public_read" ON public.alumni_profiles FOR SELECT USING (true);
CREATE POLICY "alumni_insert_own" ON public.alumni_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "alumni_update_own" ON public.alumni_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "alumni_delete_own" ON public.alumni_profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- APPLICATION TRACKER
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'manual',
  link TEXT,
  status TEXT NOT NULL DEFAULT 'saved',
  applied_on DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "applications_own" ON public.applications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER applications_set_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- SEED
INSERT INTO public.jobs (title, company, location, role_type, experience, salary, tech_stack, apply_url, source, description, is_featured) VALUES
('Software Engineer I', 'Zoho', 'Chennai, India', 'full-time', '0-1 yrs', '₹6.5 - 9 LPA', ARRAY['Java','SQL','REST'], 'https://careers.zohocorp.com', 'Company careers page', 'Off-campus drive for 2025/2026 graduates. Written test followed by two technical rounds.', true),
('Frontend Developer Intern', 'Zepto', 'Bengaluru, India', 'internship', 'Student', '₹40,000 / month', ARRAY['React','TypeScript','Tailwind'], 'https://zepto.co.in/careers', 'Wellfound', '6-month internship with PPO potential. Ship customer-facing screens from week one.', true),
('Backend Engineer (New Grad)', 'Razorpay', 'Bengaluru, India', 'full-time', '0-2 yrs', '₹16 - 22 LPA', ARRAY['Go','Postgres','Kafka'], 'https://razorpay.com/jobs', 'Company careers page', 'Payments infrastructure team. Strong DSA plus one production project expected.', false),
('Data Analyst Trainee', 'Swiggy', 'Remote, India', 'internship', 'Student', '₹25,000 / month', ARRAY['SQL','Python','Excel'], 'https://careers.swiggy.com', 'LinkedIn', 'Work with the supply analytics pod on dashboards and cohort reports.', false),
('Full Stack Developer', 'Freshworks', 'Hyderabad, India', 'full-time', '0-2 yrs', '₹12 - 18 LPA', ARRAY['Node.js','React','MySQL'], 'https://careers.freshworks.com', 'Naukri', 'Product engineering role across CRM modules. Hiring 2024-2026 batches.', false),
('SDE Intern', 'Atlassian', 'Remote, India', 'internship', 'Student', '₹1,00,000 / month', ARRAY['Java','Spring','AWS'], 'https://atlassian.com/careers', 'Company careers page', 'Summer internship programme. Applications open for pre-final year students.', true);

INSERT INTO public.hackathons (name, organiser, mode, location, theme, prize_pool, team_size, starts_at, ends_at, register_url, tags, is_featured) VALUES
('Smart India Hackathon', 'Ministry of Education, GoI', 'hybrid', 'Multiple nodal centres', 'Government problem statements', '₹1,00,000 per winning team', '6 members', '2026-09-12', '2026-09-14', 'https://sih.gov.in', ARRAY['Government','Open innovation'], true),
('HackWithInfy', 'Infosys', 'online', 'Remote', 'Coding + system design', 'Pre-placement offers', 'Solo', '2026-08-20', '2026-08-22', 'https://infosys.com/careers/hackwithinfy', ARRAY['PPO','Algorithms'], true),
('ETHIndia', 'Devfolio', 'offline', 'Bengaluru, India', 'Web3 and on-chain apps', '$100,000 pool', '2-4 members', '2026-12-05', '2026-12-07', 'https://ethindia.co', ARRAY['Web3','Blockchain'], false),
('Google Solution Challenge', 'Google Developers', 'online', 'Remote', 'UN Sustainable Development Goals', 'Global winner prizes', '1-4 members', '2026-01-15', '2026-03-31', 'https://developers.google.com/community/gdsc-solution-challenge', ARRAY['Social impact','Android','Cloud'], false),
('Flipkart GRiD', 'Flipkart', 'online', 'Remote', 'E-commerce engineering challenges', '₹5,00,000 + internships', '1-3 members', '2026-07-01', '2026-08-15', 'https://unstop.com/flipkart-grid', ARRAY['Internship','Software'], true);

INSERT INTO public.alumni_profiles (name, company, role, batch, college, linkedin_url, domains, open_to_referrals, note) VALUES
('Ankit Raj', 'Amazon', 'SDE II', '2021', 'NIT Patna', 'https://linkedin.com', ARRAY['Backend','Distributed systems'], true, 'Happy to refer for SDE I roles. Send resume + one project you actually shipped.'),
('Sneha Verma', 'Microsoft', 'Software Engineer', '2022', 'IIIT Bhagalpur', 'https://linkedin.com', ARRAY['Frontend','Azure'], true, 'Referrals open twice a month. Mention the exact job ID.'),
('Rohit Kumar', 'Zomato', 'Data Scientist', '2020', 'Purnea College of Engineering', 'https://linkedin.com', ARRAY['Data science','Python'], true, 'Prefer candidates with a public analytics project or Kaggle notebook.'),
('Priya Nair', 'Razorpay', 'Product Manager', '2019', 'BIT Mesra', 'https://linkedin.com', ARRAY['Product','Fintech'], false, 'Not referring right now, but open to 20-minute career chats.'),
('Md Saif', 'Google', 'Site Reliability Engineer', '2018', 'NIT Jamshedpur', 'https://linkedin.com', ARRAY['SRE','Infrastructure'], true, 'Referral window opens with each quarterly hiring cycle.');