
-- Tracks
CREATE TABLE public.prep_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  tagline text,
  description text,
  icon text,
  accent text DEFAULT '#c9a84c',
  sort_order int NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.prep_tracks TO anon, authenticated;
GRANT ALL ON public.prep_tracks TO service_role;
ALTER TABLE public.prep_tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prep_tracks read published" ON public.prep_tracks
  FOR SELECT USING (is_published = true);

-- Nodes
CREATE TABLE public.prep_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid NOT NULL REFERENCES public.prep_tracks(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  summary text,
  detail_md text,
  difficulty text NOT NULL DEFAULT 'beginner', -- beginner|intermediate|advanced
  xp int NOT NULL DEFAULT 10,
  sort_order int NOT NULL DEFAULT 0,
  depends_on uuid[] NOT NULL DEFAULT '{}',
  resources jsonb NOT NULL DEFAULT '[]'::jsonb, -- [{title,url,type}]
  mcqs jsonb NOT NULL DEFAULT '[]'::jsonb,     -- [{q,options:[],answer:int,why}]
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (track_id, slug)
);
CREATE INDEX prep_nodes_track_idx ON public.prep_nodes(track_id, sort_order);
GRANT SELECT ON public.prep_nodes TO anon, authenticated;
GRANT ALL ON public.prep_nodes TO service_role;
ALTER TABLE public.prep_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prep_nodes read all" ON public.prep_nodes FOR SELECT USING (true);

-- Progress
CREATE TABLE public.prep_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  node_id uuid NOT NULL REFERENCES public.prep_nodes(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'in_progress', -- in_progress|completed
  best_score int NOT NULL DEFAULT 0,
  attempts int NOT NULL DEFAULT 0,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, node_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prep_progress TO authenticated;
GRANT ALL ON public.prep_progress TO service_role;
ALTER TABLE public.prep_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prep_progress own read" ON public.prep_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "prep_progress own insert" ON public.prep_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "prep_progress own update" ON public.prep_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "prep_progress own delete" ON public.prep_progress FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER trg_prep_tracks_updated BEFORE UPDATE ON public.prep_tracks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_prep_nodes_updated BEFORE UPDATE ON public.prep_nodes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_prep_progress_updated BEFORE UPDATE ON public.prep_progress FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed tracks
INSERT INTO public.prep_tracks (slug, title, tagline, description, icon, accent, sort_order) VALUES
  ('dsa', 'DSA & Interview', 'Crack coding rounds — arrays to graphs.', 'Data Structures & Algorithms roadmap for MAANG-style interviews with concept, quiz, and curated practice.', 'Brackets', '#c9a84c', 1),
  ('web-dev', 'Full-Stack Web', 'HTML → React → Backend → Ship.', 'Learn to build & deploy real products. Project-driven web development track.', 'Layout', '#3b82f6', 2),
  ('system-design', 'System Design', 'Scale like the big kids.', 'HLD/LLD fundamentals — caching, queues, sharding, real-world case studies.', 'Network', '#a78bfa', 3),
  ('data-ai', 'Data & AI', 'From pandas to production ML.', 'Python, statistics, ML foundations, and building AI-powered products.', 'Sparkles', '#22d3ee', 4),
  ('product-design', 'Product Design', 'Think in flows & pixels.', 'UX fundamentals, Figma craft, and shipping delightful interfaces.', 'PenTool', '#f472b6', 5),
  ('placements', 'Placement Bootcamp', 'Aptitude, HR, resume — all-in-one.', 'The non-technical half — resume, HR rounds, aptitude, group discussions.', 'Trophy', '#f59e0b', 6);

-- Seed a few DSA nodes so it feels alive
WITH t AS (SELECT id FROM public.prep_tracks WHERE slug = 'dsa')
INSERT INTO public.prep_nodes (track_id, slug, title, summary, detail_md, difficulty, xp, sort_order, resources, mcqs) VALUES
  ((SELECT id FROM t), 'big-o', 'Big-O & Complexity', 'Time & space complexity — the language of performance.',
   E'## Why it matters\nEvery interviewer asks it. Every optimization starts here.\n\n- **O(1)** — constant\n- **O(log n)** — binary search style\n- **O(n)** — linear scan\n- **O(n log n)** — good sorts\n- **O(n²)** — nested loops\n\n### Rule of thumb\nDrop constants, keep the dominant term.',
   'beginner', 20, 1,
   '[{"title":"Big-O Cheatsheet","url":"https://www.bigocheatsheet.com/","type":"reference"},{"title":"MIT 6.006 — Intro","url":"https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/","type":"course"}]'::jsonb,
   '[{"q":"What is the time complexity of binary search on a sorted array?","options":["O(n)","O(log n)","O(n log n)","O(1)"],"answer":1,"why":"Each step halves the search space."},{"q":"Which is faster for large n?","options":["O(n^2)","O(n log n)","O(2^n)","O(n!)"],"answer":1,"why":"n log n grows much slower than the others."}]'::jsonb),
  ((SELECT id FROM t), 'arrays', 'Arrays & Two Pointers', 'The bread-and-butter of interview questions.',
   E'## Arrays\nContiguous memory, O(1) access by index.\n\n## Two Pointers\nA classic trick — one from left, one from right, meet in the middle. Solves reverse, palindrome, pair-sum, container-with-most-water.',
   'beginner', 25, 2,
   '[{"title":"NeetCode — Two Pointers","url":"https://neetcode.io/roadmap","type":"practice"}]'::jsonb,
   '[{"q":"Two Sum on a sorted array is optimally solved with?","options":["Hash map","Two pointers","Sorting","Recursion"],"answer":1,"why":"Sorted → two pointers gives O(n) time & O(1) space."}]'::jsonb),
  ((SELECT id FROM t), 'hashing', 'Hash Maps', 'O(1) lookups — the interview superpower.',
   E'## Hash maps\nWhenever you see "count", "seen before", or "pair sum", think hash map.\n\n**Watch out for**: hash collisions, ordering (use LinkedHashMap for insertion order).',
   'beginner', 25, 3,
   '[{"title":"LeetCode — Hash Map tag","url":"https://leetcode.com/tag/hash-table/","type":"practice"}]'::jsonb,
   '[{"q":"Average lookup time in a well-designed hash map?","options":["O(1)","O(log n)","O(n)","O(n log n)"],"answer":0,"why":"Amortized O(1). Worst case O(n) with bad hashing."}]'::jsonb);

WITH t AS (SELECT id FROM public.prep_tracks WHERE slug = 'web-dev')
INSERT INTO public.prep_nodes (track_id, slug, title, summary, detail_md, difficulty, xp, sort_order, resources, mcqs) VALUES
  ((SELECT id FROM t), 'html-css', 'HTML & CSS foundations', 'Semantic markup and modern CSS.',
   E'## Learn\n- Semantic HTML5 tags\n- Flexbox & Grid\n- Responsive units (rem, %, vh)\n- CSS variables & modern selectors',
   'beginner', 15, 1,
   '[{"title":"MDN — HTML","url":"https://developer.mozilla.org/en-US/docs/Web/HTML","type":"reference"},{"title":"CSS Tricks — Flexbox","url":"https://css-tricks.com/snippets/css/a-guide-to-flexbox/","type":"guide"}]'::jsonb,
   '[{"q":"Which is a semantic HTML tag?","options":["<div>","<span>","<article>","<b>"],"answer":2,"why":"<article> conveys meaning; <div> is generic."}]'::jsonb),
  ((SELECT id FROM t), 'javascript', 'Modern JavaScript', 'ES2020+ language essentials.',
   E'## Must know\n- let/const, arrow functions\n- Promises, async/await\n- Destructuring, spread/rest\n- Modules (import/export)',
   'beginner', 25, 2,
   '[{"title":"JavaScript.info","url":"https://javascript.info/","type":"course"}]'::jsonb,
   '[{"q":"What does async/await do?","options":["Runs code in parallel threads","Syntactic sugar over Promises","Blocks the main thread","Same as setTimeout"],"answer":1,"why":"async/await is Promise syntax that reads like sync code."}]'::jsonb),
  ((SELECT id FROM t), 'react', 'React fundamentals', 'Components, state, props, hooks.',
   E'## The core mental model\nUI = f(state). Learn:\n- JSX & components\n- useState, useEffect\n- Lifting state up\n- Keys in lists',
   'intermediate', 35, 3,
   '[{"title":"React Docs (new)","url":"https://react.dev/learn","type":"course"}]'::jsonb,
   '[{"q":"When does useEffect run by default?","options":["Before render","After every render","Only on mount","Never"],"answer":1,"why":"By default it runs after every commit. Pass a deps array to control it."}]'::jsonb);
