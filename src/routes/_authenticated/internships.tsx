import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { MapPin, Clock, IndianRupee, Building2, ArrowUpRight, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/internships")({
  component: Internships,
});

type Job = {
  id: string; title: string; company: string; location: string | null; stipend: string | null;
  duration: string | null; description: string | null; requirements: string[]; tech_stack: string[]; apply_url: string | null;
};

function Internships() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showApply, setShowApply] = useState(false);
  const [note, setNote] = useState("");

  const { data: jobs } = useQuery({
    queryKey: ["internships"],
    queryFn: async () => {
      const { data } = await supabase.from("internships").select("*").order("created_at", { ascending: false });
      return (data ?? []) as Job[];
    },
  });

  useEffect(() => { if (jobs?.[0] && !activeId) setActiveId(jobs[0].id); }, [jobs, activeId]);

  const active = jobs?.find((j) => j.id === activeId);

  const { data: applied } = useQuery({
    queryKey: ["my-apps", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("internship_applications").select("internship_id").eq("applicant_id", user!.id);
      return new Set((data ?? []).map((d) => d.internship_id));
    },
  });

  const apply = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("internship_applications").insert({
        applicant_id: user!.id, internship_id: active!.id, cover_note: note,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Application submitted");
      setShowApply(false); setNote("");
      qc.invalidateQueries({ queryKey: ["my-apps"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed"),
  });

  if (!jobs) return <div className="text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_1.4fr]">
      <div className="space-y-2">
        <div className="mb-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">— Open roles / {String(jobs.length).padStart(2, "0")}</div>
        {jobs.map((j, i) => {
          const isActive = active?.id === j.id;
          return (
            <motion.button key={j.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} onClick={() => setActiveId(j.id)} className={"card-noir-hover relative block w-full rounded-2xl p-5 text-left " + (isActive ? "border border-gold/40 bg-surface-2" : "border border-border bg-surface hover:border-gold/30")}>
              {isActive && <motion.span layoutId="active-job" className="absolute left-0 top-1/2 h-8 w-0.5 -translate-y-1/2 rounded-r-full bg-gold" />}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-display text-lg leading-tight">{j.title}</h3>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Building2 className="h-3 w-3" /><span className="truncate">{j.company}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                {j.stipend && <span className="inline-flex items-center gap-1"><IndianRupee className="h-3 w-3" />{j.stipend}</span>}
                {j.duration && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{j.duration}</span>}
              </div>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {active && (
          <motion.article key={active.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="card-noir sticky top-28 self-start rounded-3xl p-8">
            <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">— {active.company}</div>
            <h2 className="mt-2 font-display text-4xl leading-tight">{active.title}</h2>
            <div className="mt-5 flex flex-wrap gap-2 text-xs">
              {active.stipend && <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/5 px-3 py-1.5 text-gold"><IndianRupee className="h-3 w-3" />{active.stipend}</span>}
              {active.duration && <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5"><Clock className="h-3 w-3" />{active.duration}</span>}
              {active.location && <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5"><MapPin className="h-3 w-3" />{active.location}</span>}
            </div>
            <p className="mt-6 text-sm text-muted-foreground">{active.description}</p>
            <div className="hairline my-7" />
            <h4 className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">— Requirements</h4>
            <ul className="mt-3 space-y-2.5">
              {(active.requirements ?? []).map((r) => (
                <li key={r} className="flex gap-3 text-sm"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" /><span>{r}</span></li>
              ))}
            </ul>
            <div className="mt-8 flex gap-2">
              {applied?.has(active.id) ? (
                <span className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-gold/40 bg-gold/10 py-3 text-sm font-medium text-gold">Application submitted ✓</span>
              ) : (
                <button onClick={() => setShowApply(true)} className="group inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gold py-3 text-sm font-medium text-primary-foreground hover:brightness-110">
                  Apply Now <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              )}
              {active.apply_url && (
                <a href={active.apply_url} target="_blank" rel="noreferrer" className="rounded-full border border-border px-5 py-3 text-sm font-medium hover:border-gold/40">External</a>
              )}
            </div>
          </motion.article>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showApply && active && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md" onClick={() => setShowApply(false)}>
            <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="card-noir w-full max-w-md rounded-3xl p-8">
              <h3 className="font-display text-2xl">Apply to <span className="italic-serif">{active.title}</span></h3>
              <p className="mt-1 text-xs text-muted-foreground">at {active.company}</p>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={5} placeholder="Cover note — why you're the right fit (max 1000 chars)" maxLength={1000} className="mt-5 w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-gold/60" />
              <button disabled={apply.isPending} onClick={() => apply.mutate()} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-3 text-sm font-medium text-primary-foreground hover:brightness-110 disabled:opacity-60">
                {apply.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit application"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
