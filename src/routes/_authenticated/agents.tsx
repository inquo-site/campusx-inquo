import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import {
  ShieldCheck,
  Clock,
  XCircle,
  Sparkles,
  Bot,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { AutopilotActivateDialog } from "@/components/autopilot-activate-dialog";

export const Route = createFileRoute("/_authenticated/agents")({
  component: MyAgentsPage,
  head: () => ({
    meta: [
      { title: "My Agents · Campus X" },
      { name: "description", content: "Your AI autopilot agents at work." },
    ],
  }),
});

type Run = {
  id: string;
  event_id: string;
  agent_name: string;
  event_type: string;
  status: string;
  output: string | null;
  error: string | null;
  duration_ms: number | null;
  created_at: string;
};

function MyAgentsPage() {
  const { user } = useAuth();
  const [openId, setOpenId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: sub, isLoading: subLoading } = useQuery({
    queryKey: ["my-autopilot-sub", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("agent_subscriptions")
        .select("status,active_until,created_at,upi_txn_id,admin_note")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const active = sub?.status === "approved";

  const { data: runs, isLoading: runsLoading } = useQuery({
    queryKey: ["my-agent-runs", user?.id],
    enabled: !!user && active,
    refetchInterval: 5000,
    queryFn: async () => {
      const { data: events } = await supabase
        .from("agent_events")
        .select("id")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50);
      const ids = (events ?? []).map((e) => e.id);
      if (ids.length === 0) return [] as Run[];
      const { data: r } = await supabase
        .from("agent_runs")
        .select("id,event_id,agent_name,event_type,status,output,error,duration_ms,created_at")
        .in("event_id", ids)
        .order("created_at", { ascending: false })
        .limit(50);
      return (r ?? []) as Run[];
    },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            <span className="h-px w-6 bg-gold/60" /> Autopilot workspace
          </div>
          <h1 className="mt-3 font-display text-3xl leading-[1.1] tracking-tight md:text-4xl">
            Your AI team, <span className="italic-serif">quietly shipping.</span>
          </h1>
        </div>
        <SubscriptionBadge sub={sub} loading={subLoading} onActivate={() => setDialogOpen(true)} />
      </header>

      {!active ? (
        <InactiveState onActivate={() => setDialogOpen(true)} sub={sub} />
      ) : (
        <>
          <ActiveAgentsGrid runs={runs ?? []} />
          <section>
            <div className="mb-5 flex items-baseline justify-between">
              <h2 className="font-display text-2xl">
                Recent <span className="italic-serif">runs</span>
              </h2>
              <span className="font-mono text-xs text-muted-foreground">
                {runs?.length ?? 0} logged
              </span>
            </div>
            {runsLoading ? (
              <div className="grid place-items-center rounded-2xl border border-border p-16">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : !runs || runs.length === 0 ? (
              <EmptyRuns />
            ) : (
              <div className="space-y-3">
                {runs.map((r, i) => (
                  <motion.article
                    key={r.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                    className="card-noir rounded-2xl border border-border p-5"
                  >
                    <button
                      onClick={() => setOpenId(openId === r.id ? null : r.id)}
                      className="flex w-full items-start justify-between gap-4 text-left"
                    >
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-gold/30 bg-gold/5 text-gold">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                            <StatusPill status={r.status} />
                            <span className="rounded-full border border-border px-2 py-0.5">
                              {r.event_type}
                            </span>
                            <span>{new Date(r.created_at).toLocaleString()}</span>
                            {r.duration_ms != null && (
                              <span className="font-mono">{(r.duration_ms / 1000).toFixed(2)}s</span>
                            )}
                          </div>
                          <h3 className="mt-2 font-display text-lg leading-tight">{r.agent_name}</h3>
                          {r.error && (
                            <p className="mt-2 line-clamp-2 text-xs text-rose-400">{r.error}</p>
                          )}
                        </div>
                      </div>
                      {openId === r.id ? (
                        <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                    </button>
                    {openId === r.id && r.output && (
                      <div className="prose prose-invert prose-sm mt-5 max-w-none border-t border-border/60 pt-5">
                        <ReactMarkdown>{r.output}</ReactMarkdown>
                      </div>
                    )}
                  </motion.article>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <AutopilotActivateDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}

function SubscriptionBadge({
  sub,
  loading,
  onActivate,
}: {
  sub: { status?: string; active_until?: string | null } | null | undefined;
  loading: boolean;
  onActivate: () => void;
}) {
  if (loading) return null;
  if (sub?.status === "approved") {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-emerald-400">
          <ShieldCheck className="h-3 w-3" /> Autopilot Active
        </div>
        {sub.active_until && (
          <div className="mt-1 text-xs text-muted-foreground">
            Renews {new Date(sub.active_until).toLocaleDateString()}
          </div>
        )}
      </div>
    );
  }
  if (sub?.status === "pending") {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-amber-400">
          <Clock className="h-3 w-3" /> Verification pending
        </div>
        <div className="mt-1 text-xs text-muted-foreground">Admin verifying payment</div>
      </div>
    );
  }
  return (
    <button onClick={onActivate} className="btn-ink group">
      <Sparkles className="h-3.5 w-3.5" /> Activate Autopilot
      <ArrowUpRight className="h-4 w-4" />
    </button>
  );
}

function StatusPill({ status }: { status: string }) {
  const cfg =
    status === "success"
      ? { cls: "bg-emerald-500/10 text-emerald-400", label: "Success" }
      : status === "running"
        ? { cls: "bg-sky-500/10 text-sky-400", label: "Running" }
        : status === "error"
          ? { cls: "bg-rose-500/10 text-rose-400", label: "Error" }
          : { cls: "bg-muted text-muted-foreground", label: status };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function ActiveAgentsGrid({ runs }: { runs: Run[] }) {
  const counts = runs.reduce<Record<string, number>>((acc, r) => {
    acc[r.agent_name] = (acc[r.agent_name] ?? 0) + 1;
    return acc;
  }, {});
  const agents = [
    "Builder Agent",
    "QA Agent",
    "Deploy Agent",
    "Feature-Discovery Agent",
    "Growth Agent",
    "Lead-Gen Agent",
    "Analytics Agent",
  ];
  return (
    <section>
      <div className="mb-5 flex items-baseline justify-between">
        <h2 className="font-display text-2xl">
          Live <span className="italic-serif">team</span>
        </h2>
        <span className="font-mono text-xs text-muted-foreground">7 agents · always on</span>
      </div>
      <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
        {agents.map((name) => (
          <div key={name} className="card-noir-hover flex items-center gap-3 bg-surface p-5">
            <div className="grid h-10 w-10 place-items-center rounded-lg border border-gold/30 bg-gold/5 text-gold">
              <Bot className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="truncate font-display text-sm">{name}</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {counts[name] ?? 0} runs
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function EmptyRuns() {
  return (
    <div className="card-noir rounded-2xl border border-border p-10 text-center">
      <Bot className="mx-auto h-8 w-8 text-gold/70" />
      <h3 className="mt-4 font-display text-lg">Agents standing by.</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Post a project, publish a blog, or a new user signs up — your autopilot team will react
        automatically. Runs appear here live.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link to="/projects" className="btn-ink group">
          Post a project <ArrowUpRight className="h-4 w-4" />
        </Link>
        <Link
          to="/blogs"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-3 text-sm font-medium hover:border-gold/40"
        >
          Publish a blog
        </Link>
      </div>
    </div>
  );
}

function InactiveState({
  onActivate,
  sub,
}: {
  onActivate: () => void;
  sub: { status?: string; admin_note?: string | null } | null | undefined;
}) {
  return (
    <div className="ambient-glow rounded-3xl border border-gold/20 bg-surface p-10 text-center">
      <Sparkles className="mx-auto h-8 w-8 text-gold" />
      <h2 className="mt-4 font-display text-3xl">
        Turn on <span className="italic-serif">autopilot</span> to unlock all 7 agents.
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
        ₹999/month. Manual UPI verification. Once approved, your agents start working on every
        blog you publish, every project you post, every signup on your workspace.
      </p>
      {sub?.status === "rejected" && sub.admin_note && (
        <div className="mx-auto mt-4 inline-flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/5 px-3 py-2 text-xs text-rose-400">
          <XCircle className="h-3.5 w-3.5" /> Rejected: {sub.admin_note}
        </div>
      )}
      <button onClick={onActivate} className="btn-ink group mt-8">
        {sub?.status === "pending" ? "View pending request" : "Activate Autopilot"}
        <ArrowUpRight className="h-4 w-4" />
      </button>
    </div>
  );
}
