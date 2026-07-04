
-- ============ dev_profiles ============
CREATE TABLE public.dev_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  handle TEXT UNIQUE NOT NULL,
  display_name TEXT,
  headline TEXT,
  bio TEXT,
  github_username TEXT,
  codeforces_handle TEXT,
  leetcode_url TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  location TEXT,
  github_data JSONB,
  codeforces_data JSONB,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT dev_profiles_handle_format CHECK (handle ~ '^[a-z0-9][a-z0-9-]{1,38}$')
);

GRANT SELECT ON public.dev_profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dev_profiles TO authenticated;
GRANT ALL ON public.dev_profiles TO service_role;

ALTER TABLE public.dev_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view dev profiles"
  ON public.dev_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users insert own dev profile"
  ON public.dev_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own dev profile"
  ON public.dev_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own dev profile"
  ON public.dev_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============ rooms ============
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('college','interest')),
  topic TEXT,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT rooms_slug_format CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,48}$'),
  CONSTRAINT rooms_name_len CHECK (char_length(name) BETWEEN 2 AND 80)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.rooms TO authenticated;
GRANT ALL ON public.rooms TO service_role;

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated view rooms"
  ON public.rooms FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated create rooms"
  ON public.rooms FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creator updates room"
  ON public.rooms FOR UPDATE TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creator deletes room"
  ON public.rooms FOR DELETE TO authenticated
  USING (auth.uid() = created_by);

-- ============ room_members ============
CREATE TABLE public.room_members (
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (room_id, user_id)
);

GRANT SELECT, INSERT, DELETE ON public.room_members TO authenticated;
GRANT ALL ON public.room_members TO service_role;

ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated view members"
  ON public.room_members FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users join rooms as self"
  ON public.room_members FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users leave rooms"
  ON public.room_members FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============ security definer helper ============
CREATE OR REPLACE FUNCTION public.is_room_member(_room_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.room_members
    WHERE room_id = _room_id AND user_id = _user_id
  )
$$;

CREATE OR REPLACE FUNCTION public.is_room_creator(_room_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.rooms WHERE id = _room_id AND created_by = _user_id
  )
$$;

-- ============ room_messages ============
CREATE TABLE public.room_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT room_messages_body_len CHECK (char_length(body) BETWEEN 1 AND 4000)
);

CREATE INDEX room_messages_room_created_idx ON public.room_messages (room_id, created_at DESC);

GRANT SELECT, INSERT, DELETE ON public.room_messages TO authenticated;
GRANT ALL ON public.room_messages TO service_role;

ALTER TABLE public.room_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view messages"
  ON public.room_messages FOR SELECT TO authenticated
  USING (public.is_room_member(room_id, auth.uid()));

CREATE POLICY "Members post as self"
  ON public.room_messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND public.is_room_member(room_id, auth.uid())
  );

CREATE POLICY "Author or creator delete message"
  ON public.room_messages FOR DELETE TO authenticated
  USING (
    auth.uid() = user_id
    OR public.is_room_creator(room_id, auth.uid())
  );

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_messages;

-- ============ updated_at trigger ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER dev_profiles_set_updated_at
  BEFORE UPDATE ON public.dev_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
