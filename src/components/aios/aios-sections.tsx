import { useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Brain,
  Check,
  Crown,
  GitBranch,
  Layers,
  Network,
  Sparkles,
  Workflow,
  Shield,
  Rocket,
  Users,
} from "lucide-react";
import {
  AI_TEAMS,
  BUNDLE,
  ENTERPRISE_FEATURES,
  MEMORY_LAYERS,
  TASK_LIFECYCLE,
  TEAM_CATEGORIES,
  TOTAL_AGENTS,
  inr,
  type AiTeam,
} from "@/lib/aios-teams";
import { TeamPurchaseDialog, type PurchaseTarget } from "@/components/aios/team-purchase-dialog";
import { TeamDetailSheet } from "@/components/aios/team-detail-sheet";

/* ---------------- Hero ---------------- */

export function AiosHero() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-28 md:px-8 md:pt-36">
      <div className="ambient-glow pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative mx-auto max-w-5xl text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-[10px] uppercase tracking-widest text-gold">
          <Sparkles className="h-3 w-3" /> Autonomous AI Company
        </div>
        <h1 className="mt-6 font-display text-5xl leading-[1.05] md:text-7xl">
          Hire an entire <span className="italic-serif">AI company</span>, not a chatbot.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
          An AI CEO plans the work, a coordinator assigns it, and specialised AI teams —
          engineering, design, QA, marketing, security, finance — execute it end to end.
          You approve. They ship.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <a href="#teams" className="btn-ink group">
            Build your AI company
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
          <Link
            to="/agents"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-3 text-sm font-medium hover:border-gold/40"
          >
            Open workspace
          </Link>
        </div>
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-4">
          {[
            [String(AI_TEAMS.length), "AI teams"],
            [`${TOTAL_AGENTS}`, "Specialised agents"],
            ["24×7", "Autonomous execution"],
            ["100%", "Human approval control"],
          ].map(([v, l]) => (
            <div key={l} className="bg-surface px-4 py-5">
              <div className="font-display text-2xl text-gold">{v}</div>
              <div className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Scroll road-trip: how the autonomous org works ---------------- */

const STOPS = [
  {
    icon: Crown,
    layer: "Layer 01",
    title: "AI CEO reads the goal",
    body:
      "You drop one line — “grow signups” or “ship the referral feature”. The CEO agent breaks it into initiatives, sets priority, budget and deadline, and owns the outcome.",
    signals: ["Goal intake", "Initiative split", "Priority + budget", "Outcome ownership"],
  },
  {
    icon: Network,
    layer: "Layer 02",
    title: "Coordinator assigns the route",
    body:
      "The coordinator picks which teams are needed, orders the dependencies, and hands each initiative to the right specialists with context attached.",
    signals: ["Team routing", "Dependency order", "Context handoff", "Blocker tracking"],
  },
  {
    icon: Users,
    layer: "Layer 03",
    title: "Teams execute in parallel",
    body:
      "Design, engineering, QA, marketing and finance run at the same time, writing to a shared memory so nobody repeats work or contradicts a decision.",
    signals: ["Parallel execution", "Shared memory", "Cross-team handoff", "Live progress"],
  },
  {
    icon: Shield,
    layer: "Layer 04",
    title: "You approve the risky moves",
    body:
      "Code merges, deploys and spend pause at the approval gate until you confirm. Everything else keeps moving. Flip autonomous mode on when you trust the loop.",
    signals: ["Approval gate", "Autonomous mode", "Audit trail", "Rollback ready"],
  },
  {
    icon: Rocket,
    layer: "Layer 05",
    title: "It ships and reports back",
    body:
      "Work lands, QA signs off, and the CEO agent returns a summary: what shipped, what it cost, what moved, and what the org should do next.",
    signals: ["Delivery", "QA sign-off", "Cost report", "Next-cycle plan"],
  },
];

const ROAD =
  "M 40 320 C 180 320 180 90 330 90 C 480 90 480 320 630 320 C 760 320 760 110 900 110 C 950 110 970 140 980 170";

export function AiosJourney() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [index, setIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 70, damping: 22, mass: 0.5 });

  const mx = useMotionValue(40);
  const my = useMotionValue(320);
  const glow = useTransform(smooth, [0, 1], [0.25, 1]);
  const drift = useTransform(smooth, [0, 1], [30, -30]);

  useMotionValueEvent(smooth, "change", (v) => {
    const p = pathRef.current;
    if (p) {
      const pt = p.getPointAtLength(p.getTotalLength() * Math.min(Math.max(v, 0), 1));
      mx.set(pt.x);
      my.set(pt.y);
    }
    const next = Math.min(STOPS.length - 1, Math.floor(v * STOPS.length + 0.0001));
    setIndex((cur) => (cur === next ? cur : next));
  });

  const Stop = STOPS[index] ?? STOPS[0]!;
  const StopIcon = Stop.icon;

  return (
    <section id="how" ref={wrapRef} className="relative" style={{ height: `${STOPS.length * 90}vh` }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden px-4 md:px-8">
        <motion.div
          style={{ opacity: glow }}
          className="pointer-events-none absolute left-1/2 top-1/2 h-[60vh] w-[60vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-[120px]"
        />
        <div className="relative mx-auto w-full max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-gold">— How it works</div>
              <h2 className="mt-3 font-display text-3xl leading-tight md:text-5xl">
                One road, <span className="italic-serif">five layers</span>, zero hand-holding
              </h2>
            </div>
            <div className="font-mono text-xs text-muted-foreground">
              {String(index + 1).padStart(2, "0")} / {String(STOPS.length).padStart(2, "0")}
            </div>
          </div>

          {/* The road */}
          <div className="relative mt-8">
            <svg viewBox="0 0 1000 400" className="h-[38vh] w-full md:h-[42vh]" fill="none">
              <defs>
                <linearGradient id="roadGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="var(--gold)" stopOpacity="0.9" />
                </linearGradient>
              </defs>

              {/* ghost road */}
              <path
                ref={pathRef}
                d={ROAD}
                stroke="currentColor"
                className="text-border"
                strokeWidth={2}
                strokeLinecap="round"
                strokeDasharray="1 10"
              />
              {/* travelled road */}
              <motion.path
                d={ROAD}
                stroke="url(#roadGrad)"
                strokeWidth={3}
                strokeLinecap="round"
                style={{ pathLength: smooth }}
              />

              {/* milestone markers along the route */}
              {STOPS.map((s, i) => {
                const t = i / (STOPS.length - 1);
                const p = pathRef.current;
                const pt = p ? p.getPointAtLength(p.getTotalLength() * t) : { x: 40 + t * 940, y: 320 };
                const reached = i <= index;
                return (
                  <g key={s.layer}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={reached ? 9 : 6}
                      className={reached ? "fill-[var(--gold)]" : "fill-transparent"}
                      stroke="currentColor"
                      strokeWidth={1.5}
                      style={{ color: "var(--gold)", opacity: reached ? 1 : 0.35 }}
                    />
                    <text
                      x={pt.x}
                      y={pt.y - 20}
                      textAnchor="middle"
                      className="fill-current font-mono"
                      style={{ fontSize: 13, opacity: reached ? 0.9 : 0.35 }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </text>
                  </g>
                );
              })}

              {/* the traveller */}
              <motion.g style={{ x: mx, y: my }}>
                <motion.circle
                  r={20}
                  className="fill-[var(--gold)]"
                  style={{ opacity: 0.16 }}
                  animate={{ scale: [1, 1.35, 1] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                />
                <circle r={7} className="fill-[var(--gold)]" />
                <circle r={3} className="fill-background" />
              </motion.g>
            </svg>
          </div>

          {/* The stop card */}
          <div className="mt-2 grid gap-6 md:grid-cols-[1.1fr_1fr]">
            <AnimatePresence mode="wait">
              <motion.div
                key={Stop.layer}
                initial={{ opacity: 0, y: 26, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-3xl border border-gold/20 bg-surface p-6 md:p-8"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg border border-gold/30 bg-gold/5 text-gold">
                    <StopIcon className="h-4 w-4" />
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.22em] text-gold">{Stop.layer}</span>
                </div>
                <h3 className="mt-4 font-display text-2xl md:text-3xl">{Stop.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{Stop.body}</p>
              </motion.div>
            </AnimatePresence>

            <motion.div style={{ y: drift }} className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-border bg-border">
              <AnimatePresence mode="popLayout">
                {Stop.signals.map((s, i) => (
                  <motion.div
                    key={Stop.layer + s}
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.3, delay: i * 0.06 }}
                    className="bg-card px-4 py-5"
                  >
                    <Check className="h-3.5 w-3.5 text-gold" />
                    <div className="mt-2 text-xs text-foreground/80">{s}</div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Workflow + memory ---------------- */

export function AiosWorkflow() {
  return (
    <section className="px-4 py-24 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <div className="text-[10px] uppercase tracking-[0.22em] text-gold">— Inside the machine</div>
          <h2 className="mt-4 font-display text-4xl md:text-5xl">
            Every task moves through a <span className="italic-serif">real pipeline</span>
          </h2>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-6 md:p-10">
          <div className="flex flex-wrap items-center gap-2">
            {TASK_LIFECYCLE.map((s, i) => (
              <motion.div
                key={s}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground/80"
              >
                {s}
              </motion.div>
            ))}
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Workflow,
                t: "Multi-agent workflows",
                b: "Sequential, parallel and conditional execution with automatic retries and escalation.",
              },
              {
                icon: Brain,
                t: "Shared organizational memory",
                b: "Every team writes to and reads from the same long-term knowledge graph.",
              },
              {
                icon: GitBranch,
                t: "Cross-team handoffs",
                b: "Design hands to engineering, engineering to QA, QA to deploy — automatically.",
              },
            ].map((x, i) => {
              const Icon = x.icon;
              return (
                <motion.div
                  key={x.t}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="rounded-2xl border border-border bg-card p-6"
                >
                  <Icon className="h-5 w-5 text-gold" />
                  <h3 className="mt-3 font-display text-lg">{x.t}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{x.b}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-10">
            <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">— Memory layers</div>
            <div className="mt-4 flex flex-wrap gap-2">
              {MEMORY_LAYERS.map((m, i) => (
                <motion.span
                  key={m}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                  className="rounded-full border border-gold/20 bg-gold/5 px-3 py-1 text-[11px] text-gold"
                >
                  {m}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Teams + pricing ---------------- */

export function AiosTeamsPricing() {
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");
  const [cat, setCat] = useState<(typeof TEAM_CATEGORIES)[number]>("All");
  const [target, setTarget] = useState<PurchaseTarget>(null);
  const [openTeam, setOpenTeam] = useState<AiTeam | null>(null);

  const teams = useMemo(
    () => (cat === "All" ? AI_TEAMS : AI_TEAMS.filter((t) => t.category === cat)),
    [cat],
  );

  return (
    <section id="teams" className="px-4 py-24 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <div className="text-[10px] uppercase tracking-[0.22em] text-gold">— Team based pricing</div>
          <h2 className="mt-4 font-display text-4xl md:text-5xl">
            Hire only the <span className="italic-serif">teams you need</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground md:text-base">
            Tap any team to walk its roster — every agent, and exactly what it can do for you.
            Billed in INR, paid over UPI, verified by admin.
          </p>

          <div className="mt-7 inline-flex items-center gap-1 rounded-full border border-border bg-surface p-1">
            {(["monthly", "yearly"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCycle(c)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium capitalize transition ${
                  cycle === c ? "bg-gold text-background" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
                {c === "yearly" && <span className="ml-1 text-[10px] opacity-80">save 20%</span>}
              </button>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {TEAM_CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`rounded-full border px-3 py-1 text-[11px] transition ${
                  cat === c
                    ? "border-gold/50 bg-gold/10 text-gold"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Bundle */}
        <div className="ambient-glow mb-10 grid gap-6 rounded-3xl border border-gold/25 bg-surface p-8 md:grid-cols-[1.05fr_1fr] md:p-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-[10px] uppercase tracking-widest text-gold">
              <Crown className="h-3 w-3" /> Most complete
            </div>
            <h3 className="mt-4 font-display text-3xl md:text-4xl">{BUNDLE.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{BUNDLE.tagline}</p>
            <div className="mt-6 flex items-baseline gap-2">
              <span className="font-display text-6xl">
                {inr(cycle === "yearly" ? BUNDLE.yearly : BUNDLE.monthly)}
              </span>
              <span className="text-sm text-muted-foreground">/ {cycle === "yearly" ? "year" : "month"}</span>
            </div>
            <button onClick={() => setTarget({ slug: BUNDLE.slug, cycle })} className="btn-ink group mt-7">
              Hire the full company
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </button>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {BUNDLE.includes.map((f) => (
              <li key={f} className="flex items-start gap-2 text-xs">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Team grid */}
        <div className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {teams.map((t, i) => (
            <motion.div
              key={t.slug}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: (i % 6) * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="card-noir-hover flex flex-col bg-surface p-6"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                  {t.category}
                </span>
                <Layers className="h-4 w-4 text-gold" />
              </div>
              <h3 className="mt-4 font-display text-xl leading-tight">{t.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t.tagline}</p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {t.agents.slice(0, 4).map((a) => (
                  <span key={a.name} className="rounded-full bg-card px-2 py-0.5 text-[10px] text-foreground/70">
                    {a.name}
                  </span>
                ))}
                {t.agents.length > 4 && (
                  <span className="rounded-full bg-card px-2 py-0.5 text-[10px] text-gold">
                    +{t.agents.length - 4} more
                  </span>
                )}
              </div>

              <ul className="mt-4 space-y-1.5">
                {t.capabilities.slice(0, 5).map((c) => (
                  <li key={c} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Check className="mt-0.5 h-3 w-3 shrink-0 text-gold" />
                    {c}
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-6">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-3xl">
                    {inr(cycle === "yearly" ? t.yearly : t.monthly)}
                  </span>
                  <span className="text-xs text-muted-foreground">/ {cycle === "yearly" ? "yr" : "mo"}</span>
                </div>
                <button
                  onClick={() => setOpenTeam(t)}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-2.5 text-sm font-medium text-gold transition hover:bg-gold/15"
                >
                  <Users className="h-3.5 w-3.5" /> Meet the {t.agents.length} agents
                </button>
                <button
                  onClick={() => setTarget({ slug: t.slug, cycle })}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-medium transition hover:border-gold/40"
                >
                  Hire this team <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enterprise */}
        <div className="mt-10 rounded-3xl border border-border bg-card p-8 md:p-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-gold">— Enterprise</div>
              <h3 className="mt-3 font-display text-3xl">Custom AI organization</h3>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Dedicated infrastructure, private deployment and custom teams built around your workflows.
              </p>
            </div>
            <a
              href="mailto:cartooninverse5@gmail.com?subject=Enterprise%20AI%20Company%20OS"
              className="btn-ink group"
            >
              Talk to us
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {ENTERPRISE_FEATURES.map((f) => (
              <span key={f} className="rounded-full border border-border px-3 py-1 text-[11px] text-muted-foreground">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      <TeamDetailSheet
        team={openTeam}
        cycle={cycle}
        onClose={() => setOpenTeam(null)}
        onHire={(slug) => {
          setOpenTeam(null);
          setTarget({ slug, cycle });
        }}
      />
      <TeamPurchaseDialog target={target} onClose={() => setTarget(null)} />
    </section>
  );
}

/* ---------------- FAQ ---------------- */

const FAQS = [
  ["How is this different from a normal AI chatbot?", "A chatbot answers. An AI company plans, assigns, executes, reviews and reports — across multiple specialised teams that hand work to each other."],
  ["Do I have to buy everything?", "No. Hire a single team, or take the AI Company Bundle for the full organization at a much lower blended price."],
  ["How do I pay?", "All plans are priced in INR and paid manually over UPI. You submit the transaction ID, admin verifies, and the team activates on your workspace."],
  ["Can the agents act without me?", "Only if you let them. Every code, deploy or spend action can be held behind the human approval layer."],
  ["Can I cancel?", "Yes — teams are billed per cycle with no lock-in. Stop renewing and the team leaves your org at cycle end."],
];

export function AiosFaq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="px-4 pb-28 md:px-8">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center font-display text-4xl md:text-5xl">
          Questions, <span className="italic-serif">answered</span>
        </h2>
        <div className="mt-10 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          {FAQS.map(([q, a], i) => (
            <button
              key={q}
              onClick={() => setOpen(open === i ? null : i)}
              className="block w-full px-6 py-5 text-left transition hover:bg-card"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium">{q}</span>
                <span className="text-gold">{open === i ? "−" : "+"}</span>
              </div>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden text-sm text-muted-foreground"
                  >
                    <span className="mt-3 block">{a}</span>
                  </motion.p>
                )}
              </AnimatePresence>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Compact teaser (landing + dashboard) ---------------- */

export function AiosTeaser() {
  return (
    <section id="ai-company" className="px-4 py-24 md:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="ambient-glow grid gap-8 rounded-3xl border border-gold/20 bg-surface p-8 md:grid-cols-[1.05fr_1fr] md:p-12"
        >
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-[10px] uppercase tracking-widest text-gold">
              <Sparkles className="h-3 w-3" /> Autonomous AI Company
            </div>
            <h2 className="mt-5 font-display text-4xl leading-tight md:text-5xl">
              Hire an entire <span className="italic-serif">AI company</span>
            </h2>
            <p className="mt-4 max-w-lg text-sm text-muted-foreground md:text-base">
              An AI CEO plans, a coordinator assigns, and {AI_TEAMS.length} specialised teams —
              {" "}{TOTAL_AGENTS} agents in total — execute across engineering, design, QA, marketing,
              security and finance.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/ai-company" className="btn-ink group">
                Take the tour
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/agents"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-medium hover:border-gold/40"
              >
                Open workspace
              </Link>
            </div>
            <p className="mt-4 text-[11px] text-muted-foreground">
              Teams from {inr(749)}/month · Full company bundle {inr(BUNDLE.monthly)}/month · INR, UPI payment.
            </p>
          </div>

          <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
            {AI_TEAMS.slice(0, 6).map((t, i) => (
              <motion.div
                key={t.slug}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="bg-card p-4"
              >
                <div className="text-[10px] uppercase tracking-widest text-gold">{t.category}</div>
                <div className="mt-1.5 font-display text-sm leading-tight">{t.name}</div>
                <div className="mt-2 text-[11px] text-muted-foreground">
                  {t.agents.length} agents · {inr(t.monthly)}/mo
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
