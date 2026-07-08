import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Lock,
  PlayCircle,
  Zap,
  Flag,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/prep_/$track")({
  component: TrackJourney,
  head: ({ params }) => ({
    meta: [
      { title: `${params.track} · Prep Roadmap · Campus X` },
      { name: "description", content: `Learning journey for ${params.track} on Campus X.` },
    ],
  }),
});

type Node = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  difficulty: string;
  xp: number;
  sort_order: number;
  depends_on: string[];
};

function TrackJourney() {
  const { track } = Route.useParams();
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["prep-track", track, user?.id],
    queryFn: async () => {
      const { data: trackRow } = await supabase
        .from("prep_tracks")
        .select("id,slug,title,tagline,description,accent")
        .eq("slug", track)
        .maybeSingle();
      if (!trackRow) throw notFound();
      const { data: nodes } = await supabase
        .from("prep_nodes")
        .select("id,slug,title,summary,difficulty,xp,sort_order,depends_on")
        .eq("track_id", trackRow.id)
        .order("sort_order");
      const progMap: Record<string, { status: string; best_score: number }> = {};
      if (user) {
        const ids = (nodes ?? []).map((n) => n.id);
        if (ids.length) {
          const { data: prog } = await supabase
            .from("prep_progress")
            .select("node_id,status,best_score")
            .eq("user_id", user.id)
            .in("node_id", ids);
          (prog ?? []).forEach((p) => {
            progMap[p.node_id] = { status: p.status, best_score: p.best_score };
          });
        }
      }
      return { track: trackRow, nodes: (nodes ?? []) as Node[], progMap };
    },
  });

  if (isLoading) {
    return <div className="mx-auto max-w-3xl py-20 text-center text-sm text-muted-foreground">Loading journey…</div>;
  }
  if (!data) return null;

  const { track: t, nodes, progMap } = data;
  const accent = t.accent ?? "#c9a84c";
  const completed = nodes.filter((n) => progMap[n.id]?.status === "completed").length;
  const totalXp = nodes.filter((n) => progMap[n.id]?.status === "completed").reduce((a, n) => a + n.xp, 0);
  const pct = nodes.length ? Math.round((completed / nodes.length) * 100) : 0;

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div>
        <Link
          to="/prep"
          className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> All tracks
        </Link>
        <h1 className="mt-4 font-display text-4xl leading-[1.05] md:text-5xl" style={{ color: "inherit" }}>
          {t.title}
        </h1>
        {t.tagline && <p className="mt-2 italic text-muted-foreground">{t.tagline}</p>}

        {/* Progress bar */}
        <div className="mt-6 rounded-2xl border border-border bg-surface/60 p-4">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-muted-foreground">
            <span>{completed}/{nodes.length} cleared</span>
            <span className="inline-flex items-center gap-1 text-gold">
              <Zap className="h-3 w-3" /> {totalXp} XP
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background/60">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: accent }}
            />
          </div>
        </div>
      </div>

      {/* Journey path — zig-zag */}
      <section className="relative">
        <div
          aria-hidden
          className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-border to-transparent"
        />
        <ol className="relative space-y-6">
          {nodes.map((n, i) => {
            const prog = progMap[n.id];
            const doneDeps = n.depends_on.every(
              (d) => progMap[d]?.status === "completed",
            );
            const locked = !!user && !doneDeps && !prog;
            const status = prog?.status ?? (locked ? "locked" : "open");
            const side = i % 2 === 0 ? "left" : "right";
            return (
              <NodeCard
                key={n.id}
                node={n}
                track={t.slug}
                index={i}
                side={side}
                status={status}
                bestScore={prog?.best_score ?? 0}
                accent={accent}
              />
            );
          })}
          {nodes.length > 0 && (
            <li className="relative flex justify-center">
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/5 px-4 py-2 text-[11px] uppercase tracking-widest text-gold">
                <Flag className="h-3 w-3" /> Track finish
              </div>
            </li>
          )}
        </ol>
      </section>

      {nodes.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Nodes for this track are coming soon.
        </div>
      )}
    </div>
  );
}

function NodeCard({
  node,
  track,
  index,
  side,
  status,
  bestScore,
  accent,
}: {
  node: Node;
  track: string;
  index: number;
  side: "left" | "right";
  status: string;
  bestScore: number;
  accent: string;
}) {
  const completed = status === "completed";
  const locked = status === "locked";
  const inProgress = status === "in_progress";

  const StatusIcon = completed ? Check : locked ? Lock : PlayCircle;

  const body = (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.04, 0.4) }}
      className={
        "relative w-full rounded-2xl border bg-card p-5 transition " +
        (locked
          ? "border-border/60 opacity-60"
          : "border-border hover:border-gold/40")
      }
    >
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
        <span className="font-mono">Node {String(index + 1).padStart(2, "0")}</span>
        <span>·</span>
        <span>{node.difficulty}</span>
        <span className="ml-auto inline-flex items-center gap-1 text-gold">
          <Zap className="h-3 w-3" /> {node.xp} XP
        </span>
      </div>
      <h3 className="mt-2 font-display text-xl leading-tight">{node.title}</h3>
      {node.summary && (
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{node.summary}</p>
      )}
      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-[11px]">
        <span
          className={
            "inline-flex items-center gap-1.5 uppercase tracking-widest " +
            (completed
              ? "text-emerald-400"
              : inProgress
                ? "text-sky-400"
                : locked
                  ? "text-muted-foreground"
                  : "text-gold")
          }
        >
          <StatusIcon className="h-3 w-3" />
          {completed ? `Cleared · ${bestScore}%` : locked ? "Locked" : inProgress ? "Resume" : "Open"}
        </span>
        {!locked && (
          <span className="inline-flex items-center gap-1 text-foreground/80">
            {completed ? "Revisit" : "Enter"}
            <ArrowUpRight className="h-3 w-3" />
          </span>
        )}
      </div>
    </motion.div>
  );

  return (
    <li className="relative grid grid-cols-9 items-center gap-2">
      <div className={side === "left" ? "col-span-4" : "col-span-4 col-start-6"}>
        {locked ? (
          <div>{body}</div>
        ) : (
          <Link to="/prep/$track/$node" params={{ track, node: node.slug }}>
            {body}
          </Link>
        )}
      </div>
      {/* center dot */}
      <div className="col-start-5 flex justify-center">
        <span
          className="grid h-8 w-8 place-items-center rounded-full border-2"
          style={{
            borderColor: completed ? accent : "hsl(var(--border))",
            background: completed ? accent : "hsl(var(--background))",
            color: completed ? "#0a0a0a" : "inherit",
          }}
        >
          {completed ? <Check className="h-3.5 w-3.5" /> : locked ? <Lock className="h-3 w-3" /> : <span className="text-[10px] font-mono">{index + 1}</span>}
        </span>
      </div>
    </li>
  );
}
