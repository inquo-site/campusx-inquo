import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Briefcase, MapPin, IndianRupee, Search, ExternalLink, Plus, BookmarkPlus, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/jobs")({
  component: JobsPage,
});

type Job = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  role_type: string;
  experience: string | null;
  salary: string | null;
  tech_stack: string[];
  apply_url: string | null;
  source: string | null;
  description: string | null;
  is_featured: boolean;
};

const FILTERS = [
  { key: "all", label: "All roles" },
  { key: "full-time", label: "Full-time" },
  { key: "internship", label: "Internship" },
] as const;

function JobsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [showPost, setShowPost] = useState(false);

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Job[];
    },
  });

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (jobs ?? []).filter((j) => {
      if (filter !== "all" && j.role_type !== filter) return false;
      if (!needle) return true;
      return [j.title, j.company, j.location ?? "", j.tech_stack.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [jobs, q, filter]);

  const track = useMutation({
    mutationFn: async (job: Job) => {
      const { error } = await supabase.from("applications").insert({
        user_id: user!.id,
        company: job.company,
        role: job.title,
        source: "job",
        link: job.apply_url,
        status: "saved",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Saved to your Application Tracker");
      qc.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-gold">
            <Briefcase className="h-3 w-3" /> Off-campus jobs
          </div>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            Curated off-campus roles for freshers and interns. Save any role to your tracker in one click.
          </p>
        </div>
        <button
          onClick={() => setShowPost(true)}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-gold px-4 py-2 text-xs font-medium text-primary-foreground hover:brightness-110"
        >
          <Plus className="h-3.5 w-3.5" /> Post a role
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search role, company or stack…"
            className="h-10 w-full rounded-full border border-border bg-surface pl-10 pr-4 text-sm outline-none focus:border-gold/60"
          />
        </div>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={
              "rounded-full border px-3.5 py-2 text-xs transition " +
              (filter === f.key
                ? "border-gold/60 bg-gold/10 text-gold"
                : "border-border bg-surface text-muted-foreground hover:text-foreground")
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="mt-10 flex justify-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      )}

      <div className="mt-6 space-y-3">
        {list.map((j, i) => (
          <motion.article
            key={j.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.04, 0.3), duration: 0.35 }}
            className="rounded-2xl border border-border bg-surface p-5 transition hover:border-gold/40"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-xl leading-tight">{j.title}</h3>
                  {j.is_featured && (
                    <span className="rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-gold">
                      Featured
                    </span>
                  )}
                  <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                    {j.role_type}
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>{j.company}</span>
                  {j.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {j.location}
                    </span>
                  )}
                  {j.salary && (
                    <span className="inline-flex items-center gap-1">
                      <IndianRupee className="h-3 w-3" /> {j.salary}
                    </span>
                  )}
                  {j.experience && <span>{j.experience}</span>}
                </div>
              </div>
            </div>

            {j.description && <p className="mt-3 text-sm text-muted-foreground">{j.description}</p>}

            {j.tech_stack.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {j.tech_stack.map((t) => (
                  <span key={t} className="rounded-md border border-border bg-card px-2 py-0.5 text-[11px] text-foreground/70">
                    {t}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {j.apply_url && (
                <a
                  href={j.apply_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-gold px-4 py-2 text-xs font-medium text-primary-foreground hover:brightness-110"
                >
                  Apply <ExternalLink className="h-3 w-3" />
                </a>
              )}
              <button
                onClick={() => track.mutate(j)}
                disabled={track.isPending}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs text-foreground/80 hover:border-gold/40 hover:text-foreground"
              >
                <BookmarkPlus className="h-3.5 w-3.5" /> Track
              </button>
              {j.source && <span className="text-[11px] text-muted-foreground">via {j.source}</span>}
            </div>
          </motion.article>
        ))}

        {!isLoading && list.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No roles match that search yet.
          </div>
        )}
      </div>

      {showPost && <PostJobDialog onClose={() => setShowPost(false)} userId={user?.id} />}
    </div>
  );
}

function PostJobDialog({ onClose, userId }: { onClose: () => void; userId?: string }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    role_type: "full-time",
    salary: "",
    apply_url: "",
    tech: "",
    description: "",
  });

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("jobs").insert({
        title: form.title,
        company: form.company,
        location: form.location || null,
        role_type: form.role_type,
        salary: form.salary || null,
        apply_url: form.apply_url || null,
        description: form.description || null,
        tech_stack: form.tech.split(",").map((s) => s.trim()).filter(Boolean),
        source: "Campus X community",
        posted_by: userId!,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Role posted");
      qc.invalidateQueries({ queryKey: ["jobs"] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const field = "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-gold/60";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 p-4 backdrop-blur-sm sm:items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-border bg-surface p-6"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl">Post an off-campus role</h3>
          <button onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-5 space-y-3">
          <input className={field} placeholder="Role title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className={field} placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <input className={field} placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <select className={field} value={form.role_type} onChange={(e) => setForm({ ...form, role_type: e.target.value })}>
              <option value="full-time">Full-time</option>
              <option value="internship">Internship</option>
            </select>
          </div>
          <input className={field} placeholder="Salary / stipend" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
          <input className={field} placeholder="Apply URL" value={form.apply_url} onChange={(e) => setForm({ ...form, apply_url: e.target.value })} />
          <input className={field} placeholder="Tech stack (comma separated)" value={form.tech} onChange={(e) => setForm({ ...form, tech: e.target.value })} />
          <textarea className={field + " min-h-24"} placeholder="What's the role about?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <button
          onClick={() => save.mutate()}
          disabled={!form.title || !form.company || save.isPending}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Publish role
        </button>
      </motion.div>
    </div>
  );
}
