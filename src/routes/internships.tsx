import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { MapPin, Clock, IndianRupee, Building2, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/internships")({
  component: Internships,
});

const JOBS = [
  { id: 1, title: "SDE Intern, Payments", company: "Razorpay", stipend: "₹80k/mo", duration: "6 months", location: "Bangalore / Remote", closes: "6d", summary: "Work on the next iteration of Razorpay's checkout SDK and global merchant onboarding.", requirements: ["Strong in TypeScript and React", "Built and shipped at least one real-world project", "Comfortable with REST and async systems", "Open to a 6-month full-time engagement"] },
  { id: 2, title: "ML Research Intern", company: "Sarvam AI", stipend: "₹1.2L/mo", duration: "3-6 months", location: "Bangalore", closes: "12d", summary: "Train and evaluate multilingual LLMs for Indic languages with a small research team.", requirements: ["PyTorch", "Strong ML fundamentals", "Paper-reading habit", "Hugging Face experience preferred"] },
  { id: 3, title: "Founding Designer", company: "Lumen.ai", stipend: "₹40k + equity", duration: "4 months", location: "Remote", closes: "3d", summary: "Own the visual system end-to-end for an AI tutoring product used by 10k+ students.", requirements: ["Figma fluency", "Portfolio of shipped product work", "Comfort with motion + prototyping"] },
  { id: 4, title: "Backend Engineer", company: "Zerodha", stipend: "₹70k/mo", duration: "6 months", location: "Bangalore", closes: "9d", summary: "Build internal tooling and trading-platform services in Go and Postgres.", requirements: ["Go or Rust", "SQL proficiency", "Curious about financial markets"] },
  { id: 5, title: "Growth Intern", company: "Cred", stipend: "₹50k/mo", duration: "3 months", location: "Bangalore / Remote", closes: "14d", summary: "Run experiments across acquisition channels and own weekly funnel reports.", requirements: ["SQL + analytics", "Writing samples", "Bias to action"] },
];

function Internships() {
  const [active, setActive] = useState(JOBS[0]);

  return (
    <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_1.4fr]">
      <div className="space-y-2">
        <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          — Open roles / {String(JOBS.length).padStart(2, "0")}
        </div>
        {JOBS.map((j, i) => {
          const isActive = active.id === j.id;
          return (
            <motion.button
              key={j.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              onClick={() => setActive(j)}
              className={
                "card-noir-hover relative block w-full rounded-2xl p-5 text-left transition " +
                (isActive
                  ? "border border-gold/40 bg-surface-2"
                  : "border border-border bg-surface hover:border-gold/30")
              }
            >
              {isActive && (
                <motion.span layoutId="active-job" className="absolute left-0 top-1/2 h-8 w-0.5 -translate-y-1/2 rounded-r-full bg-gold" />
              )}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-display text-lg leading-tight">{j.title}</h3>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Building2 className="h-3 w-3" />
                    <span className="truncate">{j.company}</span>
                  </div>
                </div>
                <span className="shrink-0 font-mono text-[10px] text-gold">{j.closes}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1"><IndianRupee className="h-3 w-3" />{j.stipend}</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{j.duration}</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Detail */}
      <AnimatePresence mode="wait">
        <motion.article
          key={active.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="card-noir sticky top-28 self-start rounded-3xl p-8"
        >
          <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            — {active.company}
          </div>
          <h2 className="mt-2 font-display text-4xl leading-tight">
            {active.title.split(" ").slice(0, -1).join(" ")}{" "}
            <span className="italic-serif">{active.title.split(" ").slice(-1)}</span>
          </h2>

          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/5 px-3 py-1.5 text-gold"><IndianRupee className="h-3 w-3" />{active.stipend}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5"><Clock className="h-3 w-3" />{active.duration}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5"><MapPin className="h-3 w-3" />{active.location}</span>
          </div>

          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{active.summary}</p>

          <div className="hairline my-7" />

          <h4 className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            — Requirements
          </h4>
          <ul className="mt-3 space-y-2.5">
            {active.requirements.map((r) => (
              <li key={r} className="flex gap-3 text-sm">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                <span>{r}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex gap-2">
            <button className="group inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gold py-3 text-sm font-medium text-primary-foreground transition hover:brightness-110">
              Apply Now <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </button>
            <button className="rounded-full border border-border px-5 py-3 text-sm font-medium transition hover:border-gold/40">
              Save
            </button>
          </div>
        </motion.article>
      </AnimatePresence>
    </div>
  );
}
