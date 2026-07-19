import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Github, Globe, MapPin, Pencil, Save, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { AiFixButton } from "@/components/ai-fix-button";

export const Route = createFileRoute("/_authenticated/profile")({
  component: Profile,
});

function Profile() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
  });

  const [form, setForm] = useState({
    full_name: "", college: "", location: "", bio: "", github_url: "", linkedin_url: "", website_url: "",
    skills: "", looking_for: "", open_to_collab: true,
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? "",
        college: profile.college ?? "",
        location: profile.location ?? "",
        bio: profile.bio ?? "",
        github_url: profile.github_url ?? "",
        linkedin_url: profile.linkedin_url ?? "",
        website_url: profile.website_url ?? "",
        skills: (profile.skills ?? []).join(", "),
        looking_for: (profile.looking_for ?? []).join(", "),
        open_to_collab: profile.open_to_collab ?? true,
      });
    }
  }, [profile]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("profiles").update({
        full_name: form.full_name, college: form.college, location: form.location, bio: form.bio,
        github_url: form.github_url || null, linkedin_url: form.linkedin_url || null, website_url: form.website_url || null,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        looking_for: form.looking_for.split(",").map((s) => s.trim()).filter(Boolean),
        open_to_collab: form.open_to_collab,
        updated_at: new Date().toISOString(),
      }).eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Profile saved"); qc.invalidateQueries({ queryKey: ["profile"] }); qc.invalidateQueries({ queryKey: ["peers"] }); setEditing(false); },
    onError: (e: any) => toast.error(e.message ?? "Failed"),
  });

  if (!profile) return <div className="text-sm text-muted-foreground">Loading profile…</div>;

  const initial = (profile.full_name ?? user?.email ?? "B").charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="card-noir relative overflow-hidden rounded-3xl p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl border border-gold/30 bg-gold/10 font-display text-4xl italic text-gold">{initial}</div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">— {profile.college || "Add your college"}</div>
            <h2 className="mt-1 font-display text-4xl leading-tight">{profile.full_name || "Set your name"}</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">{profile.bio || "Tell other builders what you're working on."}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
              {profile.location && <span className="inline-flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {profile.location}</span>}
              {profile.github_url && <a href={profile.github_url} className="inline-flex items-center gap-1.5 hover:text-gold"><Github className="h-3 w-3" /> GitHub</a>}
              {profile.website_url && <a href={profile.website_url} className="inline-flex items-center gap-1.5 hover:text-gold"><Globe className="h-3 w-3" /> Site</a>}
              <span className={"inline-flex items-center gap-1.5 " + (profile.open_to_collab ? "text-gold" : "")}>
                <span className={"h-1.5 w-1.5 rounded-full " + (profile.open_to_collab ? "bg-gold animate-pulse" : "bg-muted")} />
                {profile.open_to_collab ? "Open to collaborate" : "Heads down"}
              </span>
            </div>
          </div>
          <button onClick={() => setEditing(true)} className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium hover:border-gold/40">
            <Pencil className="h-3.5 w-3.5" /> Edit
          </button>
        </div>
      </motion.section>

      <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2">
        <div className="bg-surface p-6">
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">— Skills</div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {(profile.skills ?? []).length === 0 && <span className="text-sm text-muted-foreground">Add skills via Edit.</span>}
            {(profile.skills ?? []).map((t: string) => (
              <span key={t} className="rounded-md border border-border bg-background px-2 py-1 font-mono text-[10px] text-foreground/80">{t}</span>
            ))}
          </div>
        </div>
        <div className="bg-surface p-6">
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">— Looking for</div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {(profile.looking_for ?? []).length === 0 && <span className="text-sm text-muted-foreground">Co-founder? Internship? Add it.</span>}
            {(profile.looking_for ?? []).map((t: string) => (
              <span key={t} className="rounded-md border border-border bg-background px-2 py-1 font-mono text-[10px] text-foreground/80">{t}</span>
            ))}
          </div>
        </div>
      </div>

      {editing && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-md" onClick={() => setEditing(false)}>
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} onClick={(e) => e.stopPropagation()} className="card-noir my-12 w-full max-w-2xl rounded-3xl p-8">
            <div className="flex items-start justify-between">
              <h3 className="font-display text-3xl">Edit <span className="italic-serif">profile</span></h3>
              <button onClick={() => setEditing(false)} className="rounded-full p-2 hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <form className="mt-5 space-y-3" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
              <Row><Inp label="Full name" v={form.full_name} on={(v) => setForm({ ...form, full_name: v })} aiContext="name" /></Row>
              <Row>
                <Inp label="College" v={form.college} on={(v) => setForm({ ...form, college: v })} aiContext="college" />
                <Inp label="Location" v={form.location} on={(v) => setForm({ ...form, location: v })} aiContext="location" />
              </Row>
              <Row><Inp label="Bio" v={form.bio} on={(v) => setForm({ ...form, bio: v })} textarea aiContext="bio" /></Row>
              <Row><Inp label="Skills (comma-separated)" v={form.skills} on={(v) => setForm({ ...form, skills: v })} placeholder="React, TypeScript, Rust" aiContext="skills" /></Row>
              <Row><Inp label="Looking for (comma-separated)" v={form.looking_for} on={(v) => setForm({ ...form, looking_for: v })} placeholder="Co-founder, Internship, Hackathon team" aiContext="looking_for" /></Row>
              <Row>
                <Inp label="GitHub URL" v={form.github_url} on={(v) => setForm({ ...form, github_url: v })} aiContext="url" />
                <Inp label="LinkedIn URL" v={form.linkedin_url} on={(v) => setForm({ ...form, linkedin_url: v })} aiContext="url" />
              </Row>
              <Row><Inp label="Website" v={form.website_url} on={(v) => setForm({ ...form, website_url: v })} aiContext="url" /></Row>
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" checked={form.open_to_collab} onChange={(e) => setForm({ ...form, open_to_collab: e.target.checked })} className="h-4 w-4 accent-[--gold]" />
                <span>Open to collaborate</span>
              </label>
              <button disabled={save.isPending} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-3 text-sm font-medium text-primary-foreground hover:brightness-110 disabled:opacity-60">
                {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Save profile</>}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{children}</div>;
}
function Inp({ label, v, on, placeholder, textarea, aiContext }: { label: string; v: string; on: (v: string) => void; placeholder?: string; textarea?: boolean; aiContext?: string }) {
  return (
    <label className="block md:col-span-2">
      <span className="mb-1.5 flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        <span>{label}</span>
        {aiContext && <AiFixButton value={v} onChange={on} context={aiContext} />}
      </span>
      {textarea ? (
        <textarea rows={3} value={v} onChange={(e) => on(e.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-gold/60" />
      ) : (
        <input value={v} onChange={(e) => on(e.target.value)} placeholder={placeholder} className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-gold/60" />
      )}
    </label>
  );
}
