import { motion, useInView, useMotionValue, useTransform, animate } from "motion/react";
import { useEffect, useRef } from "react";
import { Users, FolderGit2, Rocket, GitCommit, Zap } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Hero Orbit — animated builder constellation                         */
/* ------------------------------------------------------------------ */
export function HeroOrbit() {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true });

  // orbiting nodes — name + emoji-less label
  const orbit1 = [
    { a: 0, label: "Priya · React" },
    { a: 90, label: "Arjun · Rust" },
    { a: 180, label: "Meera · ML" },
    { a: 270, label: "Rohan · Go" },
  ];
  const orbit2 = [
    { a: 45, label: "Aman · UI" },
    { a: 135, label: "Sara · DevOps" },
    { a: 225, label: "Vivek · iOS" },
    { a: 315, label: "Tara · Data" },
  ];

  const polar = (cx: number, cy: number, r: number, deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  return (
    <div className="relative mx-auto mt-12 w-full max-w-3xl">
      {/* radial glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 mx-auto h-[420px] w-[420px] translate-y-8 rounded-full bg-gold/15 blur-[100px]" />

      <svg
        ref={ref}
        viewBox="0 0 600 420"
        className="w-full"
        style={{ filter: "drop-shadow(0 0 24px oklch(0.82 0.12 82 / 0.15))" }}
      >
        <defs>
          <radialGradient id="core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.82 0.12 82)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="oklch(0.82 0.12 82)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ring" x1="0" x2="1">
            <stop offset="0%" stopColor="oklch(0.82 0.12 82 / 0.6)" />
            <stop offset="100%" stopColor="oklch(0.82 0.12 82 / 0)" />
          </linearGradient>
        </defs>

        {/* concentric rings */}
        {[80, 140, 200].map((r, i) => (
          <motion.circle
            key={r}
            cx={300}
            cy={210}
            r={r}
            fill="none"
            stroke="oklch(0.82 0.12 82 / 0.18)"
            strokeWidth={1}
            strokeDasharray="2 6"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={inView ? { pathLength: 1, opacity: 1 } : {}}
            transition={{ duration: 1.2, delay: i * 0.15 }}
          />
        ))}

        {/* rotating orbit groups */}
        <motion.g
          style={{ transformOrigin: "300px 210px" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
          {orbit1.map((n, i) => {
            const p = polar(300, 210, 140, n.a);
            return (
              <g key={`o1-${i}`}>
                <circle cx={p.x} cy={p.y} r={6} fill="oklch(0.82 0.12 82)" />
                <circle cx={p.x} cy={p.y} r={14} fill="oklch(0.82 0.12 82 / 0.15)" />
              </g>
            );
          })}
        </motion.g>

        <motion.g
          style={{ transformOrigin: "300px 210px" }}
          animate={{ rotate: -360 }}
          transition={{ duration: 55, repeat: Infinity, ease: "linear" }}
        >
          {orbit2.map((n, i) => {
            const p = polar(300, 210, 200, n.a);
            return (
              <g key={`o2-${i}`}>
                <circle cx={p.x} cy={p.y} r={4} fill="oklch(0.94 0.025 85)" opacity={0.7} />
              </g>
            );
          })}
        </motion.g>

        {/* center core */}
        <circle cx={300} cy={210} r={80} fill="url(#core)" />
        <motion.circle
          cx={300}
          cy={210}
          r={28}
          fill="oklch(0.82 0.12 82)"
          stroke="oklch(0.94 0.025 85)"
          strokeWidth={1.5}
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          style={{ transformOrigin: "300px 210px" }}
        />
        <text
          x={300}
          y={214}
          textAnchor="middle"
          fontSize={11}
          fontWeight={700}
          fill="oklch(0.16 0.012 60)"
          fontFamily="Geist, system-ui"
        >
          CAMPUS X
        </text>

        {/* pulse */}
        <motion.circle
          cx={300}
          cy={210}
          r={28}
          fill="none"
          stroke="oklch(0.82 0.12 82)"
          strokeWidth={1.5}
          animate={{ r: [28, 90], opacity: [0.6, 0] }}
          transition={{ duration: 2.6, repeat: Infinity }}
        />

        {/* labels — fixed, not rotating */}
        {[
          { x: 80, y: 90, t: "shipped · realtime-chat" },
          { x: 460, y: 90, t: "open · backend role" },
          { x: 70, y: 340, t: "hiring · 2 interns" },
          { x: 450, y: 340, t: "joined · 4 teams" },
        ].map((l, i) => (
          <motion.g
            key={`lbl-${i}`}
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.6 + i * 0.15 }}
          >
            <line
              x1={l.x < 300 ? l.x + 90 : l.x}
              y1={l.y + 6}
              x2={300}
              y2={210}
              stroke="oklch(0.82 0.12 82 / 0.25)"
              strokeWidth={0.5}
              strokeDasharray="2 4"
            />
            <rect
              x={l.x}
              y={l.y - 8}
              rx={4}
              width={90}
              height={18}
              fill="oklch(0.18 0.012 60 / 0.9)"
              stroke="oklch(0.82 0.12 82 / 0.3)"
              strokeWidth={0.6}
            />
            <text
              x={l.x + 45}
              y={l.y + 4}
              textAnchor="middle"
              fontSize={8}
              fill="oklch(0.94 0.015 80)"
              fontFamily="Geist Mono, monospace"
            >
              {l.t}
            </text>
          </motion.g>
        ))}
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tech marquee — scrolling stack ticker                               */
/* ------------------------------------------------------------------ */
const STACK = [
  "React", "TypeScript", "Next.js", "Rust", "Go", "Python", "Postgres",
  "Tailwind", "Node.js", "GraphQL", "Docker", "Kubernetes", "AWS",
  "Solidity", "Three.js", "PyTorch", "FastAPI", "Supabase", "Vite", "Bun",
];

export function TechMarquee() {
  const row = [...STACK, ...STACK];
  return (
    <section className="relative overflow-hidden border-y border-border bg-surface/40 py-8">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-background to-transparent" />
      <motion.div
        className="flex gap-10 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
      >
        {row.map((s, i) => (
          <div
            key={`${s}-${i}`}
            className="flex items-center gap-3 font-display text-2xl text-muted-foreground/70"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            <span>{s}</span>
          </div>
        ))}
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Animated counter                                                    */
/* ------------------------------------------------------------------ */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    if (inView) {
      const controls = animate(mv, to, { duration: 1.8, ease: [0.22, 1, 0.36, 1] });
      return () => controls.stop();
    }
  }, [inView, to, mv]);

  return (
    <span ref={ref} className="font-display text-5xl md:text-6xl">
      <motion.span>{rounded}</motion.span>
      <span className="text-gold">{suffix}</span>
    </span>
  );
}

export function LiveStats() {
  const stats = [
    { n: 4200, suffix: "+", label: "student builders", icon: Users },
    { n: 860, suffix: "", label: "projects shipped", icon: FolderGit2 },
    { n: 120, suffix: "", label: "startup teams forming", icon: Rocket },
    { n: 99, suffix: "%", label: "uptime · edge deployed", icon: Zap },
  ];

  return (
    <section className="relative px-4 py-20 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-surface p-8">
                <Icon className="h-4 w-4 text-gold" />
                <div className="mt-4">
                  <Counter to={s.n} suffix={s.suffix} />
                </div>
                <div className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Live commit ticker — terminal-style activity                        */
/* ------------------------------------------------------------------ */
const COMMITS = [
  { who: "priya", repo: "climate-graph", msg: "feat: add live emissions map", t: "2m" },
  { who: "arjun", repo: "rust-chat", msg: "perf: shave 40ms off ws frame", t: "6m" },
  { who: "meera", repo: "vision-bot", repoTag: "ml", msg: "train: 0.92 → 0.94 acc", t: "11m" },
  { who: "rohan", repo: "edge-cron", msg: "ship: v0.4 deployed to edge", t: "18m" },
  { who: "aman", repo: "design-kit", msg: "ui: refine card-noir tokens", t: "24m" },
  { who: "tara", repo: "data-lake", msg: "etl: nightly snapshot job", t: "31m" },
];

export function LiveTicker() {
  return (
    <section className="px-4 py-20 md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              — Live on Campus X
            </div>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">
              Right now, builders are <span className="italic-serif">shipping.</span>
            </h2>
          </div>
          <div className="hidden items-center gap-2 font-mono text-xs text-muted-foreground md:flex">
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              className="h-2 w-2 rounded-full bg-[#28c840] shadow-[0_0_8px_#28c840]"
            />
            live feed
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-[oklch(0.13_0.012_60)] font-mono text-xs shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/5 bg-black/30 px-4 py-2.5">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            </div>
            <div className="text-[10px] text-muted-foreground">~/campus-x · git log --live</div>
            <div className="text-[10px] text-gold">main</div>
          </div>
          <ul className="divide-y divide-white/5">
            {COMMITS.map((c, i) => (
              <motion.li
                key={c.repo + i}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 px-5 py-3"
              >
                <GitCommit className="h-3.5 w-3.5 text-gold" />
                <span className="text-[#82aaff]">{c.who}</span>
                <span className="text-muted-foreground/60">/</span>
                <span className="text-foreground/80">{c.repo}</span>
                <span className="flex-1 truncate text-muted-foreground">
                  <span className="text-[#c3e88d]">›</span> {c.msg}
                </span>
                <span className="text-[10px] text-muted-foreground/60">{c.t} ago</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
