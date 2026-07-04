import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Github, RefreshCw, ExternalLink, Trophy, Star, GitFork, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getMyDevProfile, saveDevProfile, syncDevProfile } from "@/lib/dev-profile.functions";

export const Route = createFileRoute("/_authenticated/devprofile")({
  component: DevProfileEditor,
});

type FormState = {
  handle: string;
  display_name: string;
  headline: string;
  bio: string;
  github_username: string;
  codeforces_handle: string;
  leetcode_url: string;
  linkedin_url: string;
  portfolio_url: string;
  location: string;
};

const EMPTY: FormState = {
  handle: "", display_name: "", headline: "", bio: "",
  github_username: "", codeforces_handle: "",
  leetcode_url: "", linkedin_url: "", portfolio_url: "", location: "",
};

function DevProfileEditor() {
  const qc = useQueryClient();
  const fetchProfile = useServerFn(getMyDevProfile);
  const save = useServerFn(saveDevProfile);
  const sync = useServerFn(syncDevProfile);

  const { data, isLoading } = useQuery({
    queryKey: ["my-dev-profile"],
    queryFn: () => fetchProfile(),
  });

  const [form, setForm] = useState<FormState>(EMPTY);
  useEffect(() => {
    if (data?.profile) {
      const p = data.profile;
      setForm({
        handle: p.handle ?? "",
        display_name: p.display_name ?? "",
        headline: p.headline ?? "",
        bio: p.bio ?? "",
        github_username: p.github_username ?? "",
        codeforces_handle: p.codeforces_handle ?? "",
        leetcode_url: p.leetcode_url ?? "",
        linkedin_url: p.linkedin_url ?? "",
        portfolio_url: p.portfolio_url ?? "",
        location: p.location ?? "",
      });
    }
  }, [data?.profile]);

  const saveMut = useMutation({
    mutationFn: () => save({
      data: {
        handle: form.handle.toLowerCase(),
        display_name: form.display_name || null,
        headline: form.headline || null,
        bio: form.bio || null,
        github_username: form.github_username || null,
        codeforces_handle: form.codeforces_handle || null,
        leetcode_url: form.leetcode_url || null,
        linkedin_url: form.linkedin_url || null,
        portfolio_url: form.portfolio_url || null,
        location: form.location || null,
      },
    }),
    onSuccess: () => {
      toast.success("Report card saved");
      qc.invalidateQueries({ queryKey: ["my-dev-profile"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Save failed"),
  });

  const syncMut = useMutation({
    mutationFn: () => sync(),
    onSuccess: (r: any) => {
      if (r.errors?.length) toast.warning(`Synced with warnings: ${r.errors.join(" · ")}`);
      else toast.success("GitHub + Codeforces synced");
      qc.invalidateQueries({ queryKey: ["my-dev-profile"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Sync failed"),
  });

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading report card…</div>;

  const gh: any = data?.profile?.github_data;
  const cf: any = data?.profile?.codeforces_data;

  const field = (k: keyof FormState) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value })),
  });

  return (
    <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_1.2fr]">
      {/* Editor */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card-noir rounded-3xl p-7">
        <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">— Editable fields</div>
        <h2 className="mt-2 font-display text-3xl">Your <span className="italic-serif">report card</span></h2>

        <div className="mt-6 space-y-4">
          <Row label="Public handle" hint="campusx.dev/u/your-handle">
            <input {...field("handle")} placeholder="suman-kumar" className="input-ink" />
          </Row>
          <div className="grid gap-4 md:grid-cols-2">
            <Row label="Display name"><input {...field("display_name")} className="input-ink" /></Row>
            <Row label="Location"><input {...field("location")} placeholder="Purnia, Bihar" className="input-ink" /></Row>
          </div>
          <Row label="Headline"><input {...field("headline")} placeholder="Full-stack builder · GSoC hopeful" className="input-ink" /></Row>
          <Row label="Bio"><textarea {...field("bio")} rows={4} className="input-ink" /></Row>

          <div className="hairline my-2" />
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">— Auto-sync sources</div>
          <div className="grid gap-4 md:grid-cols-2">
            <Row label="GitHub username"><input {...field("github_username")} placeholder="octocat" className="input-ink" /></Row>
            <Row label="Codeforces handle"><input {...field("codeforces_handle")} placeholder="tourist" className="input-ink" /></Row>
          </div>

          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">— Manual links</div>
          <Row label="LeetCode URL"><input {...field("leetcode_url")} placeholder="https://leetcode.com/u/..." className="input-ink" /></Row>
          <Row label="LinkedIn URL"><input {...field("linkedin_url")} placeholder="https://linkedin.com/in/..." className="input-ink" /></Row>
          <Row label="Portfolio URL"><input {...field("portfolio_url")} placeholder="https://yourdomain.dev" className="input-ink" /></Row>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button onClick={() => saveMut.mutate()} disabled={saveMut.isPending || !form.handle} className="btn-ink">
            {saveMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </button>
          <button onClick={() => syncMut.mutate()} disabled={syncMut.isPending || !data?.profile} className="btn-ghost">
            {syncMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Sync GitHub + Codeforces
          </button>
          {form.handle && (
            <Link to="/u/$handle" params={{ handle: form.handle }} className="btn-ghost">
              View public card <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
        {data?.profile?.synced_at && (
          <div className="mt-3 text-xs text-muted-foreground">
            Last synced {new Date(data.profile.synced_at).toLocaleString()}
          </div>
        )}
      </motion.div>

      {/* Preview */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-5">
        <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">— Live preview</div>

        {gh && (
          <div className="card-noir rounded-2xl p-6">
            <div className="flex items-center gap-4">
              {gh.avatar_url && <img src={gh.avatar_url} alt="" className="h-14 w-14 rounded-full border border-border" />}
              <div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><Github className="h-3 w-3" /> GitHub</div>
                <div className="font-display text-xl">{gh.name ?? gh.login}</div>
                <div className="text-xs text-muted-foreground">@{gh.login} · {gh.public_repos} repos · {gh.followers} followers</div>
              </div>
            </div>
            <div className="mt-5 space-y-2">
              {gh.top_repos?.map((r: any) => (
                <a key={r.name} href={r.html_url} target="_blank" rel="noreferrer" className="block rounded-lg border border-border bg-background p-3 text-sm hover:border-gold/40">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{r.name}</span>
                    <span className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Star className="h-3 w-3" />{r.stars}</span>
                      <span className="inline-flex items-center gap-1"><GitFork className="h-3 w-3" />{r.forks}</span>
                    </span>
                  </div>
                  {r.description && <p className="mt-1 text-xs text-muted-foreground">{r.description}</p>}
                </a>
              ))}
            </div>
          </div>
        )}

        {cf && (
          <div className="card-noir rounded-2xl p-6">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Trophy className="h-3 w-3" /> Codeforces</div>
            <div className="mt-1 font-display text-xl">{cf.handle} · <span className="italic-serif text-gold">{cf.rank ?? "unrated"}</span></div>
            <div className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-border bg-border text-center">
              <Stat label="Rating" value={cf.rating ?? "—"} />
              <Stat label="Max" value={cf.maxRating ?? "—"} />
              <Stat label="Contests" value={cf.contests_count ?? 0} />
            </div>
          </div>
        )}

        {!gh && !cf && (
          <div className="card-noir rounded-2xl p-6 text-sm text-muted-foreground">
            Save your card with a GitHub or Codeforces handle, then hit <span className="italic-serif text-gold">Sync</span> to fetch stats.
          </div>
        )}
      </motion.div>
    </div>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        {hint && <span className="italic-serif text-gold/80">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-surface p-4">
      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-lg">{value}</div>
    </div>
  );
}
