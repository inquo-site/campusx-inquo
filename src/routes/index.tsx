import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { TrendingUp, Eye, Send, ArrowUpRight, Sparkles, Rocket, Briefcase, FolderGit2 } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

const stats = [
  { label: "Active Collaborations", value: "12", delta: "+3 this week", icon: TrendingUp },
  { label: "Project Views", value: "1,284", delta: "+18% vs last week", icon: Eye },
  { label: "Applications Sent", value: "07", delta: "2 in review", icon: Send },
];

const feed = [
  {
    icon: FolderGit2,
    title: "Raghav Mehta shipped",
    italic: "Quanta",
    rest: "— an open-source vector DB in Rust",
    meta: "Project Hub · 12 min ago",
    body: "Looking for two frontend collaborators to build the playground UI. Stack: Next.js, WebAssembly.",
    tag: "New project",
  },
  {
    icon: Rocket,
    title: "Co-founder wanted at",
    italic: "Lumen",
    rest: "— AI tutor for JEE aspirants",
    meta: "Startup Incubator · 1 hr ago",
    body: "Roles needed: Backend (Go), Growth, Design. Pre-seed conversations already in motion.",
    tag: "Team forming",
  },
  {
    icon: Briefcase,
    title: "Razorpay opens",
    italic: "8 SDE internships",
    rest: "for summer '26",
    meta: "Internship Board · 3 hr ago",
    body: "₹80k stipend · Bangalore / Remote · Applications close in 6 days.",
    tag: "Trending",
  },
  {
    icon: FolderGit2,
    title: "Aisha Verma released v0.3 of",
    italic: "nudge.dev",
    rest: "— habit OS for builders",
    meta: "Project Hub · 5 hr ago",
    body: "Now with calendar sync and weekly retros. 248 stars on GitHub.",
    tag: "Update",
  },
];

function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl space-y-14">
      {/* Hero */}
      <section className="relative">
        <div className="flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          <span className="h-px w-6 bg-gold/60" /> Campus X / 026
        </div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 max-w-3xl font-display text-5xl leading-[1.05] tracking-tight md:text-6xl"
        >
          Good evening, Ananya. <br />
          <span className="italic-serif">build something real.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground"
        >
          Three new projects in your stack, two startups looking for your skills, one
          internship match — waiting in your feed.
        </motion.p>

        <div className="mt-7 flex flex-wrap gap-3">
          <button className="group inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-medium text-primary-foreground transition hover:brightness-110">
            <Sparkles className="h-3.5 w-3.5" /> Post a project
            <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </button>
          <button className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-3 text-sm font-medium hover:border-gold/40">
            Browse peers
          </button>
        </div>
      </section>

      {/* Stats */}
      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            — This week
          </div>
          <span className="font-mono text-xs text-muted-foreground">003</span>
        </div>
        <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="card-noir-hover bg-surface p-7"
              >
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    {s.label}
                  </div>
                  <Icon className="h-3.5 w-3.5 text-gold/70" />
                </div>
                <div className="mt-6 font-display text-5xl leading-none">{s.value}</div>
                <div className="mt-3 text-xs text-muted-foreground">{s.delta}</div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Activity */}
      <section>
        <div className="mb-5 flex items-baseline justify-between">
          <h3 className="font-display text-3xl">
            Activity <span className="italic-serif">stream</span>
          </h3>
          <button className="text-xs font-medium text-muted-foreground hover:text-gold">
            View all →
          </button>
        </div>

        <div className="space-y-3">
          {feed.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={i}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="card-noir card-noir-hover group grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-5 rounded-2xl p-6"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-gold/20 bg-gold/5 text-gold">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    <span className="rounded-full border border-gold/30 px-2 py-0.5 font-medium text-gold">
                      {item.tag}
                    </span>
                    <span>{item.meta}</span>
                  </div>
                  <h4 className="mt-2 font-display text-xl leading-snug">
                    {item.title} <span className="italic-serif">{item.italic}</span> {item.rest}
                  </h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
                <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold" />
              </motion.article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
