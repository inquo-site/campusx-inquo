import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  Brackets,
  Layout,
  Network,
  Sparkles,
  PenTool,
  Trophy,
  Map,
  ArrowUpRight,
  Flame,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/prep")({
  component: PrepHub,
  head: () => ({
    meta: [
      { title: "Prep Roadmap · Campus X" },
      {
        name: "description",
        content:
          "Interactive prep roadmap — DSA, Web Dev, System Design, Data & AI, Product Design, and Placements — with concept, resources and quiz-locked progression.",
      },
    ],
  }),
});

const ICONS: Record<string, LucideIcon> = {
  Brackets,
  Layout,
  Network,
  Sparkles,
  PenTool,
  Trophy,
  Map,
};

type Track = {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string | null;
  icon: string | null;
  accent: string | null;
  sort_order: number;
};

function PrepHub() {
  const { user } = useAuth();

  const { data: tracks } = useQuery({
    queryKey: ["prep-tracks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prep_tracks")
        .select("id,slug,title,tagline,description,icon,accent,sort_order")
        .eq("is_published", true)
        .order("sort_order");
      if (error) throw error;
      return (data ?? []) as Track[];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["prep-stats", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [{ data: prog }, { count: nodeCount }] = await Promise.all([
        supabase
          .from("prep_progress")
          .select("node_id,status,best_score")
          .eq("user_id", user!.id),
        supabase.from("prep_nodes").select("*", { count: "exact", head: true }),
      ]);
      const completed = (prog ?? []).filter((p) => p.status === "completed").length;
      const attempts = (prog ?? []).length;
      const xp = completed * 20; // rough — real XP tallied per node
      return { completed, attempts, xp, total: nodeCount ?? 0 };
    },
  });

  const { data: nodeCounts } = useQuery({
    queryKey: ["prep-node-counts"],
    queryFn: async () => {
      const { data } = await supabase.from("prep_nodes").select("track_id");
      const map: Record<string, number> = {};
      (data ?? []).forEach((r) => {
        map[r.track_id] = (map[r.track_id] ?? 0) + 1;
      });
      return map;
    },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            <span className="h-px w-6 bg-gold/60" /> Prep roadmap
          </div>
          <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight md:text-5xl">
            Not a checklist. <span className="italic-serif">A journey.</span>
          </h1>
          <p className="mt-4 text-sm text-muted-foreground md:text-base">
            Pick a track. Read the concept. Skim curated resources. Prove it with a quiz.
            Unlock the next node. Every checkpoint is scored, not skipped.
          </p>
        </div>

        {/* Stats card */}
        <div className="grid grid-cols-3 gap-2 rounded-2xl border border-border bg-surface/60 p-3">
          <StatCell icon={Zap} label="XP" value={stats?.xp ?? 0} accent="text-gold" />
          <StatCell icon={Flame} label="Cleared" value={`${stats?.completed ?? 0}/${stats?.total ?? 0}`} accent="text-emerald-400" />
          <StatCell icon={Map} label="Started" value={stats?.attempts ?? 0} accent="text-sky-400" />
        </div>
      </header>

      {/* Tracks constellation */}
      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            — Choose your track
          </div>
          <div className="text-[11px] text-muted-foreground">{tracks?.length ?? 0} tracks live</div>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {(tracks ?? []).map((t, i) => {
            const Icon = ICONS[t.icon ?? "Map"] ?? Map;
            const count = nodeCounts?.[t.id] ?? 0;
            const accent = t.accent ?? "#c9a84c";
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <Link
                  to="/prep/$track"
                  params={{ track: t.slug }}
                  className="group relative block h-full overflow-hidden rounded-3xl border border-border bg-card p-6 transition hover:border-gold/40"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full opacity-20 blur-3xl transition group-hover:opacity-40"
                    style={{ background: accent }}
                  />
                  <div
                    className="grid h-12 w-12 place-items-center rounded-xl border"
                    style={{ borderColor: `${accent}66`, background: `${accent}12`, color: accent }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-display text-2xl leading-tight">{t.title}</h3>
                  {t.tagline && (
                    <p className="mt-1.5 text-sm italic text-muted-foreground">{t.tagline}</p>
                  )}
                  {t.description && (
                    <p className="mt-4 line-clamp-3 text-sm text-foreground/70">{t.description}</p>
                  )}
                  <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4 text-[11px] uppercase tracking-widest">
                    <span className="text-muted-foreground">{count} nodes</span>
                    <span className="inline-flex items-center gap-1 text-gold">
                      Begin
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function StatCell({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 px-3 py-2">
      <div className={`flex items-center gap-1.5 text-[10px] uppercase tracking-widest ${accent}`}>
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="mt-1 font-display text-xl leading-none">{value}</div>
    </div>
  );
}
