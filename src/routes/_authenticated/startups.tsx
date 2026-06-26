import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { Flame, ArrowUpRight, Plus, X, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/startups")({
  component: Startups,
});

type Idea = { id: string; founder_id: string; title: string; pitch: string; roles_needed: string[]; stage: string | null; created_at: string };

function Startups() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: ideas } = useQuery({
    queryKey: ["startups"],
    queryFn: async () => {
      const { data } = await supabase.from("startup_ideas").select("*").order("created_at", { ascending: false });
      return (data ?? []) as Idea[];
    },
  });

  const { data: myReqs } = useQuery({
    queryKey: ["my-startup-reqs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("join_requests").select("target_id").eq("requester_id", user!.id).eq("target_type", "startup");
      return new Set((data ?? []).map((r) => r.target_id));
    },
  });

  const join = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("join_requests").insert({ requester_id: user!.id, target_type: "startup", target_id: id, message: "I'd love to co-build." });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Request sent to founder"); qc.invalidateQueries({ queryKey: ["my-startup-reqs"] }); },
    onError: (e: any) => toast.error(e.message ?? "Failed"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("startup_ideas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Removed"); qc.invalidateQueries({ queryKey: ["startups"] }); },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="max-w-md text-sm text-muted-foreground">
          {(ideas?.length ?? 0)} founders looking for <span className="italic-serif">teammates</span>. Read the pitch, request to join, build the thing.
        </p>
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-xs font-medium text-primary-foreground hover:brightness-110">
          <Plus className="h-3 w-3" /> Pitch your idea
        </button>
      </div>

      <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2">
        {(ideas ?? []).map((idea, i) => {
          const mine = idea.founder_id === user?.id;
          const requested = myReqs?.has(idea.id);
          return (
            <motion.article key={idea.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: (i % 2) * 0.08 }} className="card-noir-hover group relative flex flex-col bg-surface p-8">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {idea.stage && <span className="rounded-full border border-gold/30 px-2 py-0.5 text-gold">{idea.stage}</span>}
                    <span>{new Date(idea.created_at).toLocaleDateString()}</span>
                  </div>
                  <h3 className="mt-3 font-display text-4xl leading-tight">{idea.title}</h3>
                </div>
                <motion.div whileHover={{ rotate: 12 }} className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-gold/30 bg-gold/10 text-gold">
                  <Flame className="h-4 w-4" />
                </motion.div>
              </div>
              <p className="mt-5 flex-1 text-sm text-muted-foreground">{idea.pitch}</p>
              <div className="mt-6">
                <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">— Roles needed</div>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {(idea.roles_needed ?? []).map((r) => (
                    <span key={r} className="rounded-md border border-border bg-background px-2.5 py-1 font-mono text-[10px] text-foreground/80">{r}</span>
                  ))}
                </div>
              </div>
              <div className="mt-7 flex gap-2">
                {mine ? (
                  <button onClick={() => remove.mutate(idea.id)} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2.5 text-xs text-muted-foreground hover:text-red-400">
                    <Trash2 className="h-3 w-3" /> Remove
                  </button>
                ) : (
                  <button disabled={requested || join.isPending} onClick={() => join.mutate(idea.id)} className="inline-flex flex-1 items-center justify-between gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-medium group-hover:border-gold/40 group-hover:bg-gold group-hover:text-primary-foreground disabled:opacity-60">
                    {requested ? "Requested" : "Request to Join"} <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </motion.article>
          );
        })}
        {ideas && ideas.length === 0 && (
          <div className="col-span-full bg-surface p-12 text-center text-sm text-muted-foreground">No pitches yet. Be the first founder.</div>
        )}
      </div>

      <AnimatePresence>{open && <PitchModal onClose={() => setOpen(false)} />}</AnimatePresence>
    </div>
  );
}

function PitchModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [pitch, setPitch] = useState("");
  const [roles, setRoles] = useState("");
  const [stage, setStage] = useState("Idea");

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("startup_ideas").insert({
        founder_id: user!.id, title, pitch,
        roles_needed: roles.split(",").map((s) => s.trim()).filter(Boolean),
        stage,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Pitch published"); qc.invalidateQueries({ queryKey: ["startups"] }); onClose(); },
    onError: (e: any) => toast.error(e.message ?? "Failed"),
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md" onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} onClick={(e) => e.stopPropagation()} className="card-noir w-full max-w-lg rounded-3xl p-8">
        <div className="mb-6 flex items-start justify-between">
          <h3 className="font-display text-3xl">Pitch your <span className="italic-serif">idea</span></h3>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); create.mutate(); }}>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Idea title" className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-gold/60" />
          <textarea required rows={4} value={pitch} onChange={(e) => setPitch(e.target.value)} placeholder="2-3 sentence pitch" className="w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-gold/60" />
          <input value={roles} onChange={(e) => setRoles(e.target.value)} placeholder="Roles needed (Backend, Design, Growth)" className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-gold/60" />
          <select value={stage} onChange={(e) => setStage(e.target.value)} className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-gold/60">
            <option>Idea</option><option>Pre-seed</option><option>Building</option><option>MVP</option><option>Launched</option>
          </select>
          <button disabled={create.isPending} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-3 text-sm font-medium text-primary-foreground hover:brightness-110 disabled:opacity-60">
            {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish pitch"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
