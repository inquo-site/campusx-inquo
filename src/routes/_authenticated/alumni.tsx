import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GraduationCap, Building2, ExternalLink, Search, Loader2, Plus, X, BadgeCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/alumni")({
  component: AlumniPage,
});

type Alum = {
  id: string;
  user_id: string | null;
  name: string;
  company: string;
  role: string | null;
  batch: string | null;
  college: string | null;
  linkedin_url: string | null;
  domains: string[];
  open_to_referrals: boolean;
  note: string | null;
};

function AlumniPage() {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const { data: alumni, isLoading } = useQuery({
    queryKey: ["alumni"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alumni_profiles")
        .select("*")
        .order("open_to_referrals", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Alum[];
    },
  });

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (alumni ?? []).filter((a) => {
      if (onlyOpen && !a.open_to_referrals) return false;
      if (!needle) return true;
      return [a.name, a.company, a.role ?? "", a.college ?? "", a.domains.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [alumni, q, onlyOpen]);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-gold">
            <GraduationCap className="h-3 w-3" /> Alumni referrals
          </div>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            Seniors already inside the companies you're targeting. See who's open to referrals and what they expect.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-gold px-4 py-2 text-xs font-medium text-primary-foreground hover:brightness-110"
        >
          <Plus className="h-3.5 w-3.5" /> I'm an alum
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search company, college or domain…"
            className="h-10 w-full rounded-full border border-border bg-surface pl-10 pr-4 text-sm outline-none focus:border-gold/60"
          />
        </div>
        <button
          onClick={() => setOnlyOpen((v) => !v)}
          className={
            "rounded-full border px-3.5 py-2 text-xs transition " +
            (onlyOpen
              ? "border-gold/60 bg-gold/10 text-gold"
              : "border-border bg-surface text-muted-foreground hover:text-foreground")
          }
        >
          Open to referrals
        </button>
      </div>

      {isLoading && (
        <div className="mt-10 flex justify-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      )}

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {list.map((a, i) => (
          <motion.article
            key={a.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.05, 0.3), duration: 0.35 }}
            className="flex flex-col rounded-2xl border border-border bg-surface p-5 transition hover:border-gold/40"
          >
            <div className="flex min-w-0 items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-gold/30 bg-gold/10 font-display text-lg text-gold">
                {a.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <h3 className="truncate font-display text-lg leading-tight">{a.name}</h3>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="h-3 w-3" /> {a.role ? `${a.role} · ` : ""}{a.company}
                  </span>
                </div>
                {(a.college || a.batch) && (
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    {a.college}
                    {a.batch && ` · Batch ${a.batch}`}
                  </div>
                )}
              </div>
            </div>

            {a.note && <p className="mt-3 text-sm text-muted-foreground">{a.note}</p>}

            {a.domains.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {a.domains.map((d) => (
                  <span key={d} className="rounded-md border border-border bg-card px-2 py-0.5 text-[11px] text-foreground/70">
                    {d}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
              <span
                className={
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] " +
                  (a.open_to_referrals
                    ? "border-gold/40 bg-gold/10 text-gold"
                    : "border-border bg-card text-muted-foreground")
                }
              >
                <BadgeCheck className="h-3 w-3" />
                {a.open_to_referrals ? "Open to referrals" : "Chats only"}
              </span>
              {a.linkedin_url && (
                <a
                  href={a.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs text-foreground/80 hover:border-gold/40 hover:text-foreground"
                >
                  Reach out <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </motion.article>
        ))}

        {!isLoading && list.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground md:col-span-2">
            No alumni match that search yet.
          </div>
        )}
      </div>

      {showAdd && <AddAlumDialog onClose={() => setShowAdd(false)} userId={user?.id} />}
    </div>
  );
}

function AddAlumDialog({ onClose, userId }: { onClose: () => void; userId?: string }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: "",
    company: "",
    role: "",
    batch: "",
    college: "",
    linkedin_url: "",
    domains: "",
    note: "",
    open_to_referrals: true,
  });

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("alumni_profiles").insert({
        user_id: userId!,
        name: form.name,
        company: form.company,
        role: form.role || null,
        batch: form.batch || null,
        college: form.college || null,
        linkedin_url: form.linkedin_url || null,
        note: form.note || null,
        open_to_referrals: form.open_to_referrals,
        domains: form.domains.split(",").map((s) => s.trim()).filter(Boolean),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("You're listed — students can now reach you");
      qc.invalidateQueries({ queryKey: ["alumni"] });
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
          <h3 className="font-display text-2xl">List yourself as an alum</h3>
          <button onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-5 space-y-3">
          <input className={field} placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <input className={field} placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            <input className={field} placeholder="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input className={field} placeholder="College" value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} />
            <input className={field} placeholder="Batch (e.g. 2022)" value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })} />
          </div>
          <input className={field} placeholder="LinkedIn URL" value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} />
          <input className={field} placeholder="Domains (comma separated)" value={form.domains} onChange={(e) => setForm({ ...form, domains: e.target.value })} />
          <textarea className={field + " min-h-20"} placeholder="What should students send you?" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={form.open_to_referrals}
              onChange={(e) => setForm({ ...form, open_to_referrals: e.target.checked })}
            />
            I'm currently open to giving referrals
          </label>
        </div>
        <button
          onClick={() => save.mutate()}
          disabled={!form.name || !form.company || save.isPending}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Add me to the list
        </button>
      </motion.div>
    </div>
  );
}
