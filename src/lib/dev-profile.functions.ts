import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

const HANDLE_RE = /^[a-z0-9][a-z0-9-]{1,38}$/;
const URL_OR_EMPTY = z.string().trim().max(300).optional().nullable();

const SaveSchema = z.object({
  handle: z.string().trim().toLowerCase().regex(HANDLE_RE, "Handle: 2-39 chars, lowercase, digits, hyphens"),
  display_name: z.string().trim().max(80).optional().nullable(),
  headline: z.string().trim().max(140).optional().nullable(),
  bio: z.string().trim().max(1000).optional().nullable(),
  github_username: z.string().trim().max(39).optional().nullable(),
  codeforces_handle: z.string().trim().max(24).optional().nullable(),
  leetcode_url: URL_OR_EMPTY,
  linkedin_url: URL_OR_EMPTY,
  portfolio_url: URL_OR_EMPTY,
  location: z.string().trim().max(80).optional().nullable(),
});

function serverPublicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

async function fetchGitHub(username: string) {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
  const [uRes, rRes] = await Promise.all([
    fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, { headers }),
    fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=6`, { headers }),
  ]);
  if (!uRes.ok) throw new Error(`GitHub user "${username}" not found`);
  const user = await uRes.json();
  const repos = rRes.ok ? await rRes.json() : [];
  return {
    login: user.login,
    name: user.name,
    avatar_url: user.avatar_url,
    bio: user.bio,
    followers: user.followers,
    following: user.following,
    public_repos: user.public_repos,
    html_url: user.html_url,
    company: user.company,
    location: user.location,
    top_repos: (repos as any[]).slice(0, 6).map((r) => ({
      name: r.name,
      description: r.description,
      html_url: r.html_url,
      stars: r.stargazers_count,
      forks: r.forks_count,
      language: r.language,
      updated_at: r.updated_at,
    })),
  };
}

async function fetchCodeforces(handle: string) {
  const [infoRes, ratingRes] = await Promise.all([
    fetch(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`),
    fetch(`https://codeforces.com/api/user.rating?handle=${encodeURIComponent(handle)}`),
  ]);
  const info = await infoRes.json();
  if (info.status !== "OK") throw new Error(`Codeforces handle "${handle}" not found`);
  const rating = await ratingRes.json();
  const u = info.result[0];
  const contests: any[] = rating.status === "OK" ? rating.result : [];
  return {
    handle: u.handle,
    rank: u.rank,
    maxRank: u.maxRank,
    rating: u.rating,
    maxRating: u.maxRating,
    avatar: u.titlePhoto,
    country: u.country,
    contests_count: contests.length,
    recent_contests: contests.slice(-5).reverse().map((c) => ({
      name: c.contestName,
      rank: c.rank,
      newRating: c.newRating,
      oldRating: c.oldRating,
    })),
  };
}

export const saveDevProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => SaveSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("dev_profiles")
      .upsert({ user_id: context.userId, ...data }, { onConflict: "user_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const syncDevProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: row, error } = await context.supabase
      .from("dev_profiles")
      .select("github_username, codeforces_handle")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Create your report card first.");

    const errors: string[] = [];
    let github_data: any = null;
    let codeforces_data: any = null;

    if (row.github_username) {
      try { github_data = await fetchGitHub(row.github_username); }
      catch (e: any) { errors.push(e.message); }
    }
    if (row.codeforces_handle) {
      try { codeforces_data = await fetchCodeforces(row.codeforces_handle); }
      catch (e: any) { errors.push(e.message); }
    }

    const { error: upErr } = await context.supabase
      .from("dev_profiles")
      .update({
        github_data,
        codeforces_data,
        synced_at: new Date().toISOString(),
      })
      .eq("user_id", context.userId);
    if (upErr) throw new Error(upErr.message);

    return { ok: true, errors };
  });

export const getMyDevProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("dev_profiles")
      .select("*")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { profile: data };
  });

export const getDevProfileByHandle = createServerFn({ method: "GET" })
  .inputValidator((data: { handle: string }) => ({
    handle: z.string().trim().toLowerCase().regex(HANDLE_RE).parse(data.handle),
  }))
  .handler(async ({ data }) => {
    const supabase = serverPublicClient();
    const { data: profile, error } = await supabase
      .from("dev_profiles")
      .select("handle, display_name, headline, bio, github_username, codeforces_handle, leetcode_url, linkedin_url, portfolio_url, location, github_data, codeforces_data, synced_at")
      .eq("handle", data.handle)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { profile };
  });
