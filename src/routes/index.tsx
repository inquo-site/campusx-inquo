import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp, Eye, Send, ArrowUpRight, Sparkles, Rocket, Briefcase, FolderGit2 } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

const stats = [
  { label: "Active Collaborations", value: "12", delta: "+3 this week", icon: TrendingUp, accent: true },
  { label: "Project Views", value: "1,284", delta: "+18% vs last week", icon: Eye, accent: false },
  { label: "Applications Sent", value: "07", delta: "2 in review", icon: Send, accent: false },
];

const feed = [
  {
    type: "project",
    icon: FolderGit2,
    title: "Raghav Mehta shipped Quanta — an open-source vector DB in Rust",
    meta: "Project Hub · 12 min ago",
    body: "Looking for two frontend collaborators to build the playground UI. Stack: Next.js, WebAssembly.",
    tag: "New project",
  },
  {
    type: "startup",
    icon: Rocket,
    title: "Co-founder wanted at Lumen — AI tutor for JEE aspirants",
    meta: "Startup Incubator · 1 hr ago",
    body: "Roles needed: Backend (Go), Growth, Design. Pre-seed conversations already in motion.",
    tag: "Team forming",
  },
  {
    type: "internship",
    icon: Briefcase,
    title: "Razorpay opens 8 SDE internships for summer '26",
    meta: "Internship Board · 3 hr ago",
    body: "₹80k stipend · Bangalore / Remote · Applications close in 6 days.",
    tag: "Trending",
  },
  {
    type: "project",
    icon: FolderGit2,
    title: "Aisha Verma released v0.3 of nudge.dev — habit OS for builders",
    meta: "Project Hub · 5 hr ago",
    body: "Now with calendar sync and weekly retros. 248 stars on GitHub.",
    tag: "Update",
  },
];

function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl space-y-10">
      {/* Hero strip */}
      <section className="relative overflow-hidden rounded-3xl bg-ink p-8 text-ink-foreground md:p-10">
        <div className="grid-bg absolute inset-0 opacity-10" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs font-medium">
              <Sparkles className="h-3 w-3 text-lime" /> 47 builders shipped this week
            </div>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight md:text-4xl">
              Good evening, Ananya. <span className="text-lime">Build something real.</span>
            </h2>
            <p className="mt-2 text-sm text-white/70">
              Three new projects in your stack, two startups looking for your skills, one internship match.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="rounded-full bg-lime px-5 py-2.5 text-sm font-semibold text-lime-foreground transition hover:brightness-95">
              Post a project
            </button>
            <button className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
              Browse peers
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className={
                "rounded-2xl border p-6 transition " +
                (s.accent
                  ? "border-transparent bg-lime text-lime-foreground"
                  : "border-border bg-surface")
              }
            >
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] opacity-70">
                  {s.label}
                </div>
                <Icon className="h-4 w-4 opacity-60" />
              </div>
              <div className="mt-4 font-display text-4xl font-bold">{s.value}</div>
              <div className="mt-1 text-xs opacity-70">{s.delta}</div>
            </div>
          );
        })}
      </section>

      {/* Activity feed */}
      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h3 className="font-display text-xl font-bold">Activity stream</h3>
          <button className="text-xs font-semibold text-muted-foreground hover:text-foreground">
            View all →
          </button>
        </div>
        <div className="space-y-3">
          {feed.map((item, i) => {
            const Icon = item.icon;
            return (
              <article
                key={i}
                className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-4 rounded-2xl border border-border bg-surface p-5 transition hover:border-foreground/30"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full bg-foreground/5 px-2 py-0.5 font-semibold text-foreground">
                      {item.tag}
                    </span>
                    <span>{item.meta}</span>
                  </div>
                  <h4 className="mt-1.5 font-display text-base font-semibold leading-snug">
                    {item.title}
                  </h4>
                  <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
                </div>
                <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
