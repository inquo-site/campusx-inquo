import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Clock, IndianRupee, Building2 } from "lucide-react";

export const Route = createFileRoute("/internships")({
  component: Internships,
});

const JOBS = [
  {
    id: 1,
    title: "SDE Intern, Payments",
    company: "Razorpay",
    stipend: "₹80,000/mo",
    duration: "6 months",
    location: "Bangalore / Remote",
    closes: "6 days",
    summary: "Work on the next iteration of Razorpay's checkout SDK and global merchant onboarding.",
    requirements: [
      "Strong in TypeScript and React",
      "Built and shipped at least one real-world project",
      "Comfortable with REST and async systems",
      "Open to a 6-month full-time engagement",
    ],
  },
  {
    id: 2,
    title: "ML Research Intern",
    company: "Sarvam AI",
    stipend: "₹1,20,000/mo",
    duration: "3-6 months",
    location: "Bangalore",
    closes: "12 days",
    summary: "Train and evaluate multilingual LLMs for Indic languages with a small research team.",
    requirements: ["PyTorch", "Strong ML fundamentals", "Paper-reading habit", "Hugging Face experience preferred"],
  },
  {
    id: 3,
    title: "Founding Designer Intern",
    company: "Lumen.ai",
    stipend: "₹40,000/mo + equity",
    duration: "4 months",
    location: "Remote",
    closes: "3 days",
    summary: "Own the visual system end-to-end for an AI tutoring product used by 10k+ students.",
    requirements: ["Figma fluency", "Portfolio of shipped product work", "Comfort with motion + prototyping"],
  },
  {
    id: 4,
    title: "Backend Engineer Intern",
    company: "Zerodha",
    stipend: "₹70,000/mo",
    duration: "6 months",
    location: "Bangalore",
    closes: "9 days",
    summary: "Build internal tooling and trading-platform services in Go and Postgres.",
    requirements: ["Go or Rust", "SQL proficiency", "Curious about financial markets"],
  },
  {
    id: 5,
    title: "Growth Intern",
    company: "Cred",
    stipend: "₹50,000/mo",
    duration: "3 months",
    location: "Bangalore / Remote",
    closes: "14 days",
    summary: "Run experiments across acquisition channels and own weekly funnel reports.",
    requirements: ["SQL + analytics", "Writing samples", "Bias to action"],
  },
];

function Internships() {
  const [active, setActive] = useState(JOBS[0]);

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_1.4fr]">
      {/* List */}
      <div className="space-y-2">
        {JOBS.map((j) => {
          const isActive = active.id === j.id;
          return (
            <button
              key={j.id}
              onClick={() => setActive(j)}
              className={
                "block w-full rounded-2xl border p-4 text-left transition " +
                (isActive
                  ? "border-foreground bg-ink text-ink-foreground"
                  : "border-border bg-surface hover:border-foreground/30")
              }
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-display text-base font-semibold">{j.title}</h3>
                  <div className={"mt-0.5 flex items-center gap-1.5 text-xs " + (isActive ? "text-white/70" : "text-muted-foreground")}>
                    <Building2 className="h-3 w-3" />
                    <span className="truncate">{j.company}</span>
                  </div>
                </div>
                <span className={"shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold " + (isActive ? "bg-lime text-lime-foreground" : "bg-muted")}>
                  {j.closes}
                </span>
              </div>
              <div className={"mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs " + (isActive ? "text-white/80" : "text-muted-foreground")}>
                <span className="inline-flex items-center gap-1"><IndianRupee className="h-3 w-3" />{j.stipend}</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{j.duration}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail pane */}
      <article className="sticky top-28 self-start rounded-3xl border border-border bg-surface p-7">
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{active.company}</div>
        <h2 className="mt-1 font-display text-2xl font-bold">{active.title}</h2>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5"><IndianRupee className="h-3 w-3" />{active.stipend}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5"><Clock className="h-3 w-3" />{active.duration}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5"><MapPin className="h-3 w-3" />{active.location}</span>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{active.summary}</p>

        <h4 className="mt-6 font-display text-sm font-bold">Requirements</h4>
        <ul className="mt-2 space-y-2">
          {active.requirements.map((r) => (
            <li key={r} className="flex gap-2 text-sm">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-foreground" />
              <span>{r}</span>
            </li>
          ))}
        </ul>

        <div className="mt-7 flex gap-2">
          <button className="flex-1 rounded-xl bg-lime py-3 text-sm font-bold text-lime-foreground transition hover:brightness-95">
            Apply Now
          </button>
          <button className="rounded-xl border border-border px-5 py-3 text-sm font-semibold transition hover:bg-muted">
            Save
          </button>
        </div>
      </article>
    </div>
  );
}
