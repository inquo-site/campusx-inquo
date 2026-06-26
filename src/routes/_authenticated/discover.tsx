import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { Search, ChevronDown, Check, ArrowUpRight, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/discover")({
  component: Discover,
});

const ALL_SKILLS = ["React", "TypeScript", "Python", "Go", "Rust", "ML/AI", "Design", "Product", "Solidity", "Unity", "Node.js", "Postgres"];

function Discover() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [query, setQuery] = useState("");
  const [openOnly, setOpenOnly] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [skillsOpen, setSkillsOpen] = useState(false);

  const { data: peers, isLoading } = useQuery({
    queryKey: ["peers"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, college, skills, open_to_collab")
        .order("updated_at", { ascending: false })
        .limit(60);
      return data ?? [];
    },
  });

  const { data: connections } = useQuery({
    queryKey: ["my-connections", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("connections")
        .select("addressee_id, requester_id, status")
        .or(`requester_id.eq.${user!.id},addressee_id.eq.${user!.id}`);
      return data ?? [];
    },
  });

  const connect = useMutation({
    mutationFn: async (addressee_id: string) => {
      const { error } = await supabase.from("connections").insert({ requester_id: user!.id, addressee_id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Connection request sent");
      qc.invalidateQueries({ queryKey: ["my-connections"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed"),
  });

  const isConnected = (id: string) =>
    connections?.some((c) => c.addressee_id === id || c.requester_id === id);

  const filtered = (peers ?? []).filter((p) => {
    if (p.id === user?.id) return false;
    if (openOnly && !p.open_to_collab) return false;
    if (query && !`${p.full_name ?? ""} ${p.college ?? ""}`.toLowerCase().includes(query.toLowerCase())) return false;
    if (selected.length && !selected.every((s) => (p.skills ?? []).includes(s))) return false;
    return true;
  });

  const toggleSkill = (s: string) => setSelected((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <p className="max-w-xl text-sm text-muted-foreground">
        Real student builders on Campus X. Filter by skills, find who's <span className="italic-serif">open to collaborate</span>, send a connection request.
      </p>

      <div className="card-noir flex flex-col gap-3 rounded-2xl p-3 md:flex-row md:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or college" className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-gold/60" />
        </div>

        <div className="relative">
          <button onClick={() => setSkillsOpen((o) => !o)} className="flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-border bg-background px-4 text-sm font-medium md:w-56">
            <span className="truncate">{selected.length ? `${selected.length} skill${selected.length > 1 ? "s" : ""}` : "Filter by skills"}</span>
            <ChevronDown className="h-4 w-4 opacity-60" />
          </button>
          {skillsOpen && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="absolute right-0 z-20 mt-2 max-h-72 w-64 overflow-y-auto rounded-xl border border-border bg-popover p-2 shadow-2xl shadow-black/40">
              {ALL_SKILLS.map((s) => {
                const on = selected.includes(s);
                return (
                  <button key={s} onClick={() => toggleSkill(s)} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-muted">
                    <span className={on ? "text-gold" : ""}>{s}</span>
                    {on && <Check className="h-4 w-4 text-gold" />}
                  </button>
                );
              })}
            </motion.div>
          )}
        </div>

        <label className="flex h-11 cursor-pointer items-center gap-3 rounded-xl border border-border bg-background px-4 text-sm font-medium">
          <span>Open to collaborate</span>
          <span onClick={() => setOpenOnly((o) => !o)} className={"relative inline-block h-5 w-9 rounded-full transition " + (openOnly ? "bg-gold" : "bg-muted")}>
            <motion.span layout transition={{ type: "spring", stiffness: 500, damping: 30 }} className={"absolute top-0.5 h-4 w-4 rounded-full bg-background shadow " + (openOnly ? "left-[18px]" : "left-0.5")} />
          </span>
        </label>
      </div>

      <div className="font-mono text-xs text-muted-foreground">
        {isLoading ? "loading…" : `${String(filtered.length).padStart(3, "0")} / ${String((peers?.length ?? 0)).padStart(3, "0")} peers`}
      </div>

      <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p, i) => {
          const connected = isConnected(p.id);
          return (
            <motion.article key={p.id} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-30px" }} transition={{ duration: 0.45, delay: (i % 6) * 0.05 }} className="card-noir-hover group flex flex-col bg-surface p-7">
              <div className="mb-6 flex items-start justify-between">
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">— Builder</div>
                {p.open_to_collab && <span className="rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-gold">Open</span>}
              </div>
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-gold/30 bg-gold/10 font-display text-lg italic text-gold">
                  {(p.full_name ?? "B").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-display text-xl leading-tight">{p.full_name ?? "Builder"}</h3>
                  <p className="truncate text-xs text-muted-foreground">{p.college ?? "—"}</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {(p.skills ?? []).slice(0, 6).map((s: string) => (
                  <span key={s} className="rounded-md border border-border bg-background px-2 py-1 font-mono text-[10px] text-foreground/80">{s}</span>
                ))}
                {(p.skills ?? []).length === 0 && <span className="text-[11px] text-muted-foreground">No skills yet</span>}
              </div>
              <button
                disabled={connected || connect.isPending}
                onClick={() => connect.mutate(p.id)}
                className="mt-6 inline-flex items-center justify-between gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium transition group-hover:border-gold/40 disabled:opacity-60"
              >
                {connect.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : connected ? "Connected / Pending" : "Connect"}
                {!connected && <ArrowUpRight className="h-3.5 w-3.5" />}
              </button>
            </motion.article>
          );
        })}
        {!isLoading && filtered.length === 0 && (
          <div className="col-span-full bg-surface p-12 text-center text-sm text-muted-foreground">No peers match. Try clearing filters.</div>
        )}
      </div>
    </div>
  );
}
