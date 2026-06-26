import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Flame, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/startups")({
  component: Startups,
});

const IDEAS = [
  { title: "Lumen", italic: "tutor for JEE", pitch: "An AI tutor that adapts to each student's weakest topics in real-time. Already 800 weekly users from a beta in two coaching centers.", roles: ["Backend (Go)", "Growth", "UI/UX"], stage: "Pre-seed", founder: "Riya S." },
  { title: "Patchwork", italic: "vetted micro-tasks", pitch: "Marketplace for student devs to bid on micro-tasks from indie founders. Think Fiverr but vetted, async, and code-first.", roles: ["Full-stack", "Ops", "Content"], stage: "Idea", founder: "Devansh K." },
  { title: "Greenhouse", italic: "climate SaaS", pitch: "SaaS for college sustainability clubs to measure and report campus-level climate action with a unified dashboard.", roles: ["Frontend", "Data", "Partnerships"], stage: "MVP", founder: "Aisha V." },
  { title: "Mesh OS", italic: "realtime, e2ee", pitch: "Privacy-first realtime infrastructure for collaborative software. Y-CRDTs, end-to-end encrypted, BYO-server.", roles: ["Systems (Rust)", "DevRel"], stage: "Building", founder: "Raghav M." },
  { title: "Pitstop", italic: "code review on demand", pitch: "On-demand senior code reviews for student projects. Reviewers earn, juniors learn faster.", roles: ["Mobile", "Marketplace ops"], stage: "Pre-launch", founder: "Priya N." },
  { title: "Vellum", italic: "open interview prep", pitch: "An open notebook for engineering interview prep — spaced repetition meets system-design whiteboards.", roles: ["Frontend", "Content"], stage: "Idea", founder: "Kenji T." },
];

function Startups() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="max-w-md text-sm text-muted-foreground">
          {IDEAS.length} founders looking for{" "}
          <span className="italic-serif">teammates</span> this week. Read the pitch, request to join, build the thing.
        </p>
        <button className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-xs font-medium text-primary-foreground hover:brightness-110">
          Pitch your idea <ArrowUpRight className="h-3 w-3" />
        </button>
      </div>

      <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2">
        {IDEAS.map((idea, i) => (
          <motion.article
            key={idea.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: (i % 2) * 0.1 }}
            className="card-noir-hover group relative flex flex-col bg-surface p-8"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  <span className="rounded-full border border-gold/30 px-2 py-0.5 text-gold">{idea.stage}</span>
                  <span>by {idea.founder}</span>
                </div>
                <h3 className="mt-3 font-display text-4xl leading-tight">
                  {idea.title} <br />
                  <span className="italic-serif text-2xl">{idea.italic}</span>
                </h3>
              </div>
              <motion.div
                whileHover={{ rotate: 12 }}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-gold/30 bg-gold/10 text-gold"
              >
                <Flame className="h-4 w-4" />
              </motion.div>
            </div>

            <p className="mt-5 flex-1 text-sm leading-relaxed text-muted-foreground">{idea.pitch}</p>

            <div className="mt-6">
              <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                — Roles needed
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {idea.roles.map((r) => (
                  <span key={r} className="rounded-md border border-border bg-background px-2.5 py-1 font-mono text-[10px] text-foreground/80">
                    {r}
                  </span>
                ))}
              </div>
            </div>

            <button className="mt-7 inline-flex items-center justify-between gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-medium transition group-hover:border-gold/40 group-hover:bg-gold group-hover:text-primary-foreground">
              Request to Join
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
