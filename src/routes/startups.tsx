import { createFileRoute } from "@tanstack/react-router";
import { Flame } from "lucide-react";

export const Route = createFileRoute("/startups")({
  component: Startups,
});

const IDEAS = [
  {
    title: "Lumen",
    pitch: "An AI tutor for JEE aspirants that adapts to each student's weakest topics in real-time. Already 800 weekly users from a beta in two coaching centers.",
    roles: ["Backend (Go)", "Growth", "UI/UX"],
    stage: "Pre-seed",
    founder: "Riya S.",
  },
  {
    title: "Patchwork",
    pitch: "A marketplace for student devs to bid on micro-tasks from indie founders. Think Fiverr but vetted, async, and code-first.",
    roles: ["Full-stack", "Ops", "Content"],
    stage: "Idea",
    founder: "Devansh K.",
  },
  {
    title: "Greenhouse",
    pitch: "SaaS for college sustainability clubs to measure and report campus-level climate action with a unified dashboard.",
    roles: ["Frontend", "Data", "Partnerships"],
    stage: "MVP",
    founder: "Aisha V.",
  },
  {
    title: "Mesh OS",
    pitch: "Privacy-first realtime infrastructure for collaborative software. Y-CRDTs, end-to-end encrypted, BYO-server.",
    roles: ["Systems (Rust)", "DevRel"],
    stage: "Building",
    founder: "Raghav M.",
  },
  {
    title: "Pitstop",
    pitch: "On-demand senior code reviews for student projects. Reviewers earn, juniors learn faster.",
    roles: ["Mobile", "Marketplace ops"],
    stage: "Pre-launch",
    founder: "Priya N.",
  },
  {
    title: "Vellum",
    pitch: "An open notebook for engineering interview prep — spaced repetition meets system-design whiteboards.",
    roles: ["Frontend", "Content"],
    stage: "Idea",
    founder: "Kenji T.",
  },
];

function Startups() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{IDEAS.length} founders looking for teammates this week</p>
        <button className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-ink-foreground hover:bg-ink/90">
          Pitch your idea
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {IDEAS.map((idea) => (
          <article
            key={idea.title}
            className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-surface p-7 transition hover:border-foreground/30"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-full bg-foreground text-background px-2 py-0.5 font-semibold">{idea.stage}</span>
                  <span className="text-muted-foreground">by {idea.founder}</span>
                </div>
                <h3 className="mt-2 font-display text-2xl font-bold">{idea.title}</h3>
              </div>
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-lime text-lime-foreground">
                <Flame className="h-4 w-4" />
              </div>
            </div>

            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{idea.pitch}</p>

            <div className="mt-5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Roles needed
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {idea.roles.map((r) => (
                  <span key={r} className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium">
                    {r}
                  </span>
                ))}
              </div>
            </div>

            <button className="mt-6 w-full rounded-xl bg-ink py-3 text-sm font-semibold text-ink-foreground transition hover:bg-ink/90">
              Request to Join
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
