import { useMemo, useState } from "react";
import { motion } from "motion/react";
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
  Users,
} from "lucide-react";
import {
  AI_TEAMS,
  BUNDLE,
  ENTERPRISE_FEATURES,
  MEMORY_LAYERS,
  TASK_LIFECYCLE,
  TEAM_CATEGORIES,
  inr,
} from "@/lib/aios-teams";
import { TeamPurchaseDialog, type PurchaseTarget } from "@/components/aios/team-purchase-dialog";

/* ---------------- Hero ---------------- */

export function AiosHero() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-28 md:px-8 md:pt-36">
      <div className="ambient-glow pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative mx-auto max-w-5xl text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-[10px] uppercase tracking-widest text-gold">
          <Sparkles className="h-3 w-3" /> AI Company Operating System
        </div>
        <h1 className="mt-6 font-display text-5xl leading-[1.05] md:text-7xl">
          Hire an entire{" "}
          <span className="italic-serif">AI company</span>, not a chatbot.
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
            ["16", "AI teams"],
            ["60+", "Specialised agents"],
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

/* ---------------- Organization architecture ---------------- */

export function AiosArchitecture() {
  const layers = [
    {
      icon: Crown,
      title: "AI CEO",
      body: "Reads your goal, breaks it into initiatives, sets priority and owns the outcome.",
    },
    {
      icon: Network,
      title: "Team Coordinator",
      body: "Routes each initiative to the right team, resolves dependencies, tracks blockers.",
    },
    {
      icon: Users,
      title: "Specialised Teams",
      body: "Each team is a group of role-specific agents with their own tools and standards.",
    },
    {
      icon: Shield,
      title: "Human Approval Layer",
      body: "Code, deploys and spend wait for your confirmation — or run autonomously if you allow it.",
    },
  ];
  return (
    <section className="px-4 py-24 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <div className="text-[10px] uppercase tracking-[0.22em] text-gold">— Organization architecture</div>
          <h2 className="mt-4 font-display text-4xl md:text-5xl">
            A real org chart, <span className="italic-serif">staffed by AI</span>
          </h2>
        </div>
        <div className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
          {layers.map((l, i) => {
            const Icon = l.icon;
            return (
              <motion.div
                key={l.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="card-noir-hover bg-surface p-6"
              >
                <span className="grid h-9 w-9 place-items-center rounded-lg border border-gold/30 bg-gold/5 text-gold">
                  <Icon className="h-4 w-4" />
                </span>
                <h3 className="mt-4 font-display text-lg">{l.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{l.body}</p>
                <div className="mt-4 text-[10px] uppercase tracking-widest text-gold">Layer {i + 1}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Workflow visualisation ---------------- */

export function AiosWorkflow() {
  return (
    <section className="px-4 py-24 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <div className="text-[10px] uppercase tracking-[0.22em] text-gold">— How work flows</div>
          <h2 className="mt-4 font-display text-4xl md:text-5xl">
            One request → a <span className="italic-serif">full delivery pipeline</span>
          </h2>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-6 md:p-10">
          <div className="flex flex-wrap items-center gap-2">
            {TASK_LIFECYCLE.map((s, i) => (
              <motion.div
                key={s}
                initial={{ opacity: 0, scale: 0.94 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
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
            ].map((x) => {
              const Icon = x.icon;
              return (
                <div key={x.t} className="rounded-2xl border border-border bg-card p-6">
                  <Icon className="h-5 w-5 text-gold" />
                  <h3 className="mt-3 font-display text-lg">{x.t}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{x.b}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-10">
            <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              — Memory layers
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {MEMORY_LAYERS.map((m) => (
                <span
                  key={m}
                  className="rounded-full border border-gold/20 bg-gold/5 px-3 py-1 text-[11px] text-gold"
                >
                  {m}
                </span>
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
            Every team is billed in INR and paid manually over UPI. Admin verifies, the team joins your org.
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
            <button
              onClick={() => setTarget({ slug: BUNDLE.slug, cycle })}
              className="btn-ink group mt-7"
            >
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
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: (i % 6) * 0.04 }}
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
                  <span key={a} className="rounded-full bg-card px-2 py-0.5 text-[10px] text-foreground/70">
                    {a}
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
                  <span className="text-xs text-muted-foreground">
                    / {cycle === "yearly" ? "yr" : "mo"}
                  </span>
                </div>
                <button
                  onClick={() => setTarget({ slug: t.slug, cycle })}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-2.5 text-sm font-medium text-gold transition hover:bg-gold/15"
                >
                  Hire this team
                  <ArrowUpRight className="h-4 w-4" />
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
              {open === i && <p className="mt-3 text-sm text-muted-foreground">{a}</p>}
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
        <div className="ambient-glow grid gap-8 rounded-3xl border border-gold/20 bg-surface p-8 md:grid-cols-[1.05fr_1fr] md:p-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-[10px] uppercase tracking-widest text-gold">
              <Sparkles className="h-3 w-3" /> AI Company Operating System
            </div>
            <h2 className="mt-5 font-display text-4xl leading-tight md:text-5xl">
              Hire an entire <span className="italic-serif">AI company</span>
            </h2>
            <p className="mt-4 max-w-lg text-sm text-muted-foreground md:text-base">
              An AI CEO plans, a coordinator assigns, and 16 specialised teams execute — engineering,
              design, QA, marketing, security, finance and more. Pick single teams or the full bundle.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/ai-company" className="btn-ink group">
                Explore AI teams
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
            {AI_TEAMS.slice(0, 6).map((t) => (
              <div key={t.slug} className="bg-card p-4">
                <div className="text-[10px] uppercase tracking-widest text-gold">{t.category}</div>
                <div className="mt-1.5 font-display text-sm leading-tight">{t.name}</div>
                <div className="mt-2 text-[11px] text-muted-foreground">{inr(t.monthly)}/mo</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
