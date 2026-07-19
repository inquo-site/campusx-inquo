import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Compass,
  Loader2,
  BookOpen,
  Video,
  FileText,
  Hammer,
  GraduationCap,
  Flag,
  Zap,
  RefreshCw,
  Printer,
} from "lucide-react";
import { generateRoadmap } from "@/lib/roadmap-maker.functions";

export const Route = createFileRoute("/_authenticated/roadmap-maker")({
  component: RoadmapMaker,
  head: () => ({
    meta: [
      { title: "Roadmap Maker · Campus X" },
      {
        name: "description",
        content:
          "Type any goal — get an AI-crafted, visual learning roadmap with phases, tasks, and curated resources.",
      },
    ],
  }),
});

type Roadmap = Awaited<ReturnType<typeof generateRoadmap>>;

const PHASE_ACCENTS = ["#c9a84c", "#7dd3fc", "#f472b6", "#a78bfa", "#4ade80", "#fb923c"];

const SAMPLE_GOALS = [
  "Become a full-stack dev in 6 months",
  "Crack DSA for FAANG interviews",
  "Ship my first AI SaaS product",
  "Land a Google Summer of Code slot",
  "Master system design from scratch",
];

function RoadmapMaker() {
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState("beginner");
  const [hours, setHours] = useState(10);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const generateFn = useServerFn(generateRoadmap);

  const mutation = useMutation({
    mutationFn: (input: { goal: string; level: string; hoursPerWeek: number }) =>
      generateFn({ data: input }),
    onSuccess: (data) => setRoadmap(data),
    onError: (e: Error) => window.alert(e.message),
  });

  const submit = () => {
    if (!goal.trim()) return;
    setRoadmap(null);
    mutation.mutate({ goal: goal.trim(), level, hoursPerWeek: hours });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      {/* Intro */}
      <header className="max-w-2xl">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          <span className="h-px w-6 bg-gold/60" /> Roadmap maker
        </div>
        <h1 className="mt-3 font-display text-4xl leading-[1.05] md:text-5xl">
          Any goal, mapped as a{" "}
          <span className="italic-serif">flowing journey.</span>
        </h1>
        <p className="mt-4 text-sm text-muted-foreground md:text-base">
          Tell the AI what you want to master. It builds phases, tasks, and curated
          resources — visualised as a river of milestones, not a boring list.
        </p>
      </header>

      {/* Prompt card */}
      <section className="rounded-3xl border border-border bg-card p-6 md:p-8">
        <div className="grid gap-4 md:grid-cols-[1fr_auto_auto]">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Your goal
            </label>
            <div className="relative">
              <Compass className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gold" />
              <input
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="e.g. Become a Rust backend engineer in 4 months"
                className="h-12 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-gold/60"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Level
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="h-12 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-gold/60"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Hrs / week
            </label>
            <input
              type="number"
              min={1}
              max={80}
              value={hours}
              onChange={(e) => setHours(parseInt(e.target.value) || 10)}
              className="h-12 w-24 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-gold/60"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Try —
          </span>
          {SAMPLE_GOALS.map((g) => (
            <button
              key={g}
              onClick={() => setGoal(g)}
              className="rounded-full border border-border bg-background/40 px-3 py-1 text-[11px] text-foreground/70 transition hover:border-gold/40 hover:text-foreground"
            >
              {g}
            </button>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-5">
          <div className="text-[11px] text-muted-foreground">
            Powered by Campus X AI · takes ~10–15s
          </div>
          <button
            onClick={submit}
            disabled={mutation.isPending || !goal.trim()}
            className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:brightness-95 disabled:opacity-50"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Charting your journey…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Generate roadmap
              </>
            )}
          </button>
        </div>
      </section>

      {/* Result */}
      <AnimatePresence mode="wait">
        {roadmap && (
          <motion.section
            key="roadmap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8"
          >
            <RoadmapHeader roadmap={roadmap} onRegen={submit} regenerating={mutation.isPending} />
            <RiverVisualization roadmap={roadmap} />
            <PhasesDetail roadmap={roadmap} />
            <Finisher text={roadmap.finisher} />
          </motion.section>
        )}
      </AnimatePresence>

      {!roadmap && !mutation.isPending && <EmptyIllustration />}
    </div>
  );
}

function RoadmapHeader({
  roadmap,
  onRegen,
  regenerating,
}: {
  roadmap: Roadmap;
  onRegen: () => void;
  regenerating: boolean;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="text-[10px] uppercase tracking-[0.22em] text-gold">
          {roadmap.totalWeeks} weeks · {roadmap.phases.length} phases
        </div>
        <h2 className="mt-2 font-display text-3xl md:text-4xl">{roadmap.title}</h2>
        <p className="mt-1 max-w-2xl text-sm italic text-muted-foreground">
          {roadmap.tagline}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onRegen}
          disabled={regenerating}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-4 py-2 text-xs hover:border-gold/40"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Regenerate
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-4 py-2 text-xs hover:border-gold/40"
        >
          <Printer className="h-3.5 w-3.5" /> Print
        </button>
      </div>
    </div>
  );
}

/** Unique visualisation — curved SVG "river" with orbiting phase planets */
function RiverVisualization({ roadmap }: { roadmap: Roadmap }) {
  const n = roadmap.phases.length;
  const width = 1000;
  const height = 340;
  const step = width / (n + 1);
  const points = roadmap.phases.map((_, i) => ({
    x: step * (i + 1),
    y: 170 + Math.sin(i * 1.1) * 90,
  }));
  const path = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `S ${p.x - step / 2} ${points[i - 1].y}, ${p.x} ${p.y}`))
    .join(" ");

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-card to-background p-6">
      <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
        <span className="h-px w-6 bg-gold/60" /> Your journey · river view
      </div>
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[720px]"
          role="img"
          aria-label="Roadmap river visualisation"
        >
          <defs>
            <linearGradient id="riverStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#c9a84c" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#c9a84c" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#c9a84c" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* River */}
          <motion.path
            d={path}
            fill="none"
            stroke="url(#riverStroke)"
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray="6 8"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.6, ease: "easeInOut" }}
          />

          {/* Planets */}
          {roadmap.phases.map((phase, i) => {
            const p = points[i];
            const accent = PHASE_ACCENTS[i % PHASE_ACCENTS.length];
            return (
              <motion.g
                key={phase.name}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.15, type: "spring", stiffness: 120 }}
              >
                {/* orbit */}
                <motion.circle
                  cx={p.x}
                  cy={p.y}
                  r={44}
                  fill="none"
                  stroke={accent}
                  strokeOpacity={0.25}
                  strokeDasharray="2 4"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20 + i * 3, repeat: Infinity, ease: "linear" }}
                  style={{ transformOrigin: `${p.x}px ${p.y}px` }}
                />
                {/* glow */}
                <circle cx={p.x} cy={p.y} r={38} fill={accent} opacity={0.08} />
                {/* planet */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={30}
                  fill="hsl(var(--card))"
                  stroke={accent}
                  strokeWidth={1.5}
                />
                <text
                  x={p.x}
                  y={p.y + 8}
                  textAnchor="middle"
                  fontSize="22"
                >
                  {phase.emoji || "★"}
                </text>
                {/* label */}
                <text
                  x={p.x}
                  y={p.y - 44}
                  textAnchor="middle"
                  fontSize="11"
                  fill="hsl(var(--muted-foreground))"
                  style={{ textTransform: "uppercase", letterSpacing: "0.2em" }}
                >
                  Phase {i + 1}
                </text>
                <text
                  x={p.x}
                  y={p.y + 60}
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="600"
                  fill="hsl(var(--foreground))"
                >
                  {phase.name}
                </text>
                <text
                  x={p.x}
                  y={p.y + 78}
                  textAnchor="middle"
                  fontSize="10"
                  fill={accent}
                >
                  {phase.weeks}w · {phase.difficulty}
                </text>
              </motion.g>
            );
          })}
        </svg>
      </div>
      <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
        <span>Start</span>
        <span>Finish · {roadmap.totalWeeks} weeks</span>
      </div>
    </div>
  );
}

function PhasesDetail({ roadmap }: { roadmap: Roadmap }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {roadmap.phases.map((phase, i) => {
        const accent = PHASE_ACCENTS[i % PHASE_ACCENTS.length];
        return (
          <motion.div
            key={phase.name + i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="relative overflow-hidden rounded-2xl border border-border bg-card p-6"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full opacity-15 blur-3xl"
              style={{ background: accent }}
            />
            <div className="flex items-start gap-3">
              <div
                className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-2xl"
                style={{
                  background: `${accent}18`,
                  border: `1px solid ${accent}55`,
                }}
              >
                {phase.emoji || "★"}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-widest" style={{ color: accent }}>
                  Phase {i + 1} · {phase.weeks} weeks · {phase.difficulty}
                </div>
                <h3 className="mt-1 font-display text-xl leading-tight">{phase.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{phase.outcome}</p>
              </div>
            </div>

            {/* Tasks */}
            <div className="mt-5">
              <div className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                <Zap className="h-3 w-3" /> Tasks
              </div>
              <ul className="space-y-1.5">
                {phase.tasks.map((t, k) => (
                  <li
                    key={k}
                    className="flex items-start gap-2 rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-sm"
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: accent }}
                    />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div className="mt-5">
              <div className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                <BookOpen className="h-3 w-3" /> Resources
              </div>
              <div className="flex flex-wrap gap-1.5">
                {phase.resources.map((r, k) => (
                  <span
                    key={k}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/50 px-2.5 py-1 text-[11px]"
                  >
                    <ResourceIcon type={r.type} />
                    {r.name}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function ResourceIcon({ type }: { type: string }) {
  const cls = "h-3 w-3 text-gold";
  if (type === "video") return <Video className={cls} />;
  if (type === "book") return <BookOpen className={cls} />;
  if (type === "course") return <GraduationCap className={cls} />;
  if (type === "project") return <Hammer className={cls} />;
  return <FileText className={cls} />;
}

function Finisher({ text }: { text: string }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-gold/40 bg-gold/5 p-8 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold/20 text-gold">
        <Flag className="h-6 w-6" />
      </div>
      <div className="mt-3 text-[10px] uppercase tracking-[0.22em] text-gold">
        Capstone finisher
      </div>
      <p className="mx-auto mt-2 max-w-2xl font-display text-2xl leading-tight">
        {text}
      </p>
    </div>
  );
}

function EmptyIllustration() {
  return (
    <div className="rounded-3xl border border-dashed border-border p-12 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-gold/40 bg-gold/10 text-gold">
        <Compass className="h-6 w-6" />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Drop a goal above — get a river of milestones back in seconds.
      </p>
    </div>
  );
}
