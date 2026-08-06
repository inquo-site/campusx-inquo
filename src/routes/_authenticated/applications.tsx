import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardList, ExternalLink, Loader2, Plus, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/applications")({
  component: ApplicationsPage,
});

type App = {
  id: string;
  company: string;
  role: string;
  source: string;
  link: string | null;
  status: string;
  applied_on: string | null;
  notes: string | null;
  created_at: string;
};

const STAGES = [
  { key: "saved", label: "Saved" },
  { key: "applied", label: "Applied" },
  { key: "interview", label: "Interviewing" },
  { key: "offer", label: "Offer" },
  { key: "rejected", label: "Closed" },
] as const;

function ApplicationsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);

  const { data: apps, isLoading } = useQuery({
    queryKey: ["applications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as App[];
    },
  });

  const move = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("applications")
        .update({ status, applied_on: status === "applied" ? new Date().toISOString().slice(0, 10) : undefined })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["applications"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("applications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Removed");
      qc.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const grouped = useMemo(() => {
    const map: Record<string, App[]> = {};
    for (const s of STAGES) map[s.key] = [];
    for (const a of apps ?? []) (map[a.status] ??= []).push(a);
    return map;
  }, [apps]);

  const total = apps?.length ?? 0;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-gold">
            <ClipboardList className="h-3 w-3" /> Application tracker
          </div>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            Every job, internship and hackathon you saved, in one pipeline. {total} tracked so far.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-gold px-4 py-2 text-xs font-medium text-primary-foreground hover:brightness-110"
        >
          <Plus className="h-3.5 w-3.5" /> Add manually
        </button>
      </div>

      {isLoading && (
        <div className="mt-10 flex justify-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        {STAGES.map((stage) => (
          <div key={stage.key} className="rounded-2xl border border-border bg-surface/60 p-3">
            <div className="flex items-center justify-between px-1 pb-2">
              <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">— {stage.label}</span>
              <span className="text-[11px] text-muted-foreground">{grouped[stage.key]?.length ?? 0}</span>
            </div>
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {(grouped[stage.key] ?? []).map((a) => (
                  <motion.div
                    key={a.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.25 }}
                    className="rounded-xl border border-border bg-card p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{a.role}</div>
                        <div className="truncate text-[11px] text-muted-foreground">{a.company}</div>
                      </div>
                      <button
                        onClick={() => remove.mutate(a.id)}
                        aria-label="Remove application"
                        className="shrink-0 text-muted-foreground/60 transition hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {a.notes && <p className="mt-2 text-[11px] text-muted-foreground">{a.notes}</p>}

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-md border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                        {a.source}
                      </span>
                      {a.applied_on && <span className="text-[10px] text-muted-foreground">{a.applied_on}</span>}
                      {a.link && (
                        <a
                          href={a.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-gold hover:underline"
                        >
                          Link <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </div>

                    <select
                      value={a.status}
                      onChange={(e) => move.mutate({ id: a.id, status: e.target.value })}
                      className="mt-3 w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-[11px] outline-none focus:border-gold/60"
                    >
                      {STAGES.map((s) => (
                        <option key={s.key} value={s.key}>
                          Move to {s.label}
                        </option>
                      ))}
                    </select>
                  </motion.div>
                ))}
              </AnimatePresence>

              {(grouped[stage.key]?.length ?? 0) === 0 && (
                <div className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-[11px] text-muted-foreground">
                  Empty
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showAdd && <AddAppDialog onClose={() => setShowAdd(false)} userId={user?.id} />}
    </div>
  );
}

function AddAppDialog({ onClose, userId }: { onClose: () => void; userId?: string }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ company: "", role: "", link: "", status: "applied", notes: "" });

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("applications").insert({
        user_id: userId!,
        company: form.company,
        role: form.role,
        link: form.link || null,
        notes: form.notes || null,
        status: form.status,
        source: "manual",
        applied_on: form.status === "saved" ? null : new Date().toISOString().slice(0, 10),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Added to tracker");
      qc.invalidateQueries({ queryKey: ["applications"] });
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
        className="w-full max-w-md rounded-3xl border border-border bg-surface p-6"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl">Track an application</h3>
          <button onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-5 space-y-3">
          <input className={field} placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <input className={field} placeholder="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          <input className={field} placeholder="Link (optional)" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
          <select className={field} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {STAGES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
          <textarea className={field + " min-h-20"} placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        <button
          onClick={() => save.mutate()}
          disabled={!form.company || !form.role || save.isPending}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Add to tracker
        </button>
      </motion.div>
    </div>
  );
}
