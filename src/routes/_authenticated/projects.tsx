import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Plus, Github, ExternalLink, X, ArrowUpRight, Loader2, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/projects")({
  component: Projects,
});

type Project = {
  id: string; owner_id: string; title: string; description: string; tech_stack: string[];
  github_url: string | null; live_url: string | null; roles_needed: string[]; tag: string | null; created_at: string;
};

function Projects() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Project[];
    },
  });

  const { data: myRequests } = useQuery({
    queryKey: ["my-join-projects", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("join_requests").select("target_id").eq("requester_id", user!.id).eq("target_type", "project");
      return new Set((data ?? []).map((r) => r.target_id));
    },
  });

  const join = useMutation({
    mutationFn: async (project_id: string) => {
      const { error } = await supabase.from("join_requests").insert({ requester_id: user!.id, target_type: "project", target_id: project_id, message: "I'd love to contribute." });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Join request sent to the project owner");
      qc.invalidateQueries({ queryKey: ["my-join-projects"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Project removed"); qc.invalidateQueries({ queryKey: ["projects"] }); },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <p className="max-w-xl text-sm text-muted-foreground">
        Live projects shipped by student builders. Request to join a team or <span className="italic-serif">submit your own</span>.
      </p>

      {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}

      <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2">
        {(projects ?? []).map((p, i) => {
          const mine = p.owner_id === user?.id;
          const requested = myRequests?.has(p.id);
          return (
            <motion.article key={p.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: (i % 4) * 0.06 }} className="card-noir-hover group relative flex flex-col bg-surface p-8">
              <div className="mb-6 flex items-start justify-between">
                <div className="grid h-11 w-11 place-items-center rounded-lg border border-gold/25 bg-gold/5 font-display text-lg italic text-gold">{p.title[0]}</div>
                <div className="flex items-center gap-2">
                  {p.tag && <span className="font-mono text-[11px] text-muted-foreground">{p.tag}</span>}
                  {mine && (
                    <button onClick={() => remove.mutate(p.id)} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-red-400" title="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <h3 className="font-display text-3xl leading-tight">{p.title}</h3>
              <p className="mt-3 flex-1 text-sm text-muted-foreground">{p.description}</p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {(p.tech_stack ?? []).map((s) => (
                  <span key={s} className="rounded-md border border-border bg-background px-2 py-1 font-mono text-[10px] text-foreground/80">{s}</span>
                ))}
              </div>
              {(p.roles_needed ?? []).length > 0 && (
                <div className="mt-3 text-[11px] text-muted-foreground">
                  Looking for: <span className="text-foreground/80">{p.roles_needed.join(", ")}</span>
                </div>
              )}
              <div className="mt-6 flex flex-wrap gap-2">
                {p.live_url && (
                  <a href={p.live_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-gold px-4 py-2 text-xs font-medium text-primary-foreground hover:brightness-110">
                    <ExternalLink className="h-3 w-3" /> Live Demo
                  </a>
                )}
                {p.github_url && (
                  <a href={p.github_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-xs font-medium hover:border-gold/40">
                    <Github className="h-3 w-3" /> View Code
                  </a>
                )}
                {!mine && (
                  <button disabled={requested || join.isPending} onClick={() => join.mutate(p.id)} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-xs font-medium hover:border-gold/40 disabled:opacity-60">
                    {requested ? "Requested" : "Join Team"} <ArrowUpRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            </motion.article>
          );
        })}
        {!isLoading && (projects?.length ?? 0) === 0 && (
          <div className="col-span-full bg-surface p-12 text-center text-sm text-muted-foreground">
            No projects yet. Be the first to submit one.
          </div>
        )}
      </div>

      <motion.button whileHover={{ y: -2 }} onClick={() => setOpen(true)} className="fixed bottom-8 right-8 z-40 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3.5 text-sm font-medium text-primary-foreground shadow-2xl shadow-gold/30">
        <Plus className="h-4 w-4" /> Submit Project
      </motion.button>

      <AnimatePresence>{open && <SubmitModal onClose={() => setOpen(false)} />}</AnimatePresence>
    </div>
  );
}

function SubmitModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stack, setStack] = useState("");
  const [roles, setRoles] = useState("");
  const [github, setGithub] = useState("");
  const [live, setLive] = useState("");
  const [tag, setTag] = useState("");

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("projects").insert({
        owner_id: user!.id,
        title, description,
        tech_stack: stack.split(",").map((s) => s.trim()).filter(Boolean),
        roles_needed: roles.split(",").map((s) => s.trim()).filter(Boolean),
        github_url: github || null,
        live_url: live || null,
        tag: tag || null,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Project published"); qc.invalidateQueries({ queryKey: ["projects"] }); onClose(); },
    onError: (e: any) => toast.error(e.message ?? "Failed"),
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md" onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.97 }} onClick={(e) => e.stopPropagation()} className="card-noir w-full max-w-lg rounded-3xl p-8">
        <div className="mb-6 flex items-start justify-between">
          <h3 className="font-display text-3xl">Submit a <span className="italic-serif">project</span></h3>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); create.mutate(); }}>
          <Field label="Title" value={title} onChange={setTitle} required />
          <Field label="Description" value={description} onChange={setDescription} required textarea />
          <Field label="Tech Stack (comma-separated)" value={stack} onChange={setStack} placeholder="React, Postgres, Rust" />
          <Field label="Roles Needed (optional)" value={roles} onChange={setRoles} placeholder="Frontend, Designer" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="GitHub URL" value={github} onChange={setGithub} placeholder="https://github.com/…" />
            <Field label="Live URL" value={live} onChange={setLive} placeholder="https://…" />
          </div>
          <Field label="Tag (optional)" value={tag} onChange={setTag} placeholder="OSS, MVP, Freemium…" />
          <button disabled={create.isPending} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-3 text-sm font-medium text-primary-foreground hover:brightness-110 disabled:opacity-60">
            {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish to Project Hub"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function Field({ label, value, onChange, placeholder, textarea, required }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; textarea?: boolean; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      {textarea ? (
        <textarea required={required} rows={3} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-gold/60" />
      ) : (
        <input required={required} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-gold/60" />
      )}
    </label>
  );
}
