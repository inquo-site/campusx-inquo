import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Copy, Check, Linkedin } from "lucide-react";
import {
  optimizeLinkedIn,
  linkedInRoleCategories,
  type OptimizerResult,
} from "@/lib/linkedin-optimizer.functions";

export const Route = createFileRoute("/_authenticated/linkedin-optimizer")({
  component: LinkedInOptimizerPage,
  head: () => ({
    meta: [
      { title: "LinkedIn Optimizer — Campus X" },
      { name: "description", content: "Paste your LinkedIn profile and get an AI rewrite tuned to recruiter keywords for your target role." },
    ],
  }),
});

const ROLE_LABELS: Record<string, string> = {
  "swe-frontend": "Frontend Engineer",
  "swe-backend": "Backend Engineer",
  "swe-fullstack": "Full-Stack Engineer",
  "data-ml": "Data / ML Engineer",
  "devops-sre": "DevOps / SRE",
  "product": "Product Manager",
  "design": "Product Designer",
};

function LinkedInOptimizerPage() {
  const run = useServerFn(optimizeLinkedIn);
  const [role, setRole] = useState("swe-fullstack");
  const [raw, setRaw] = useState("");
  const mutation = useMutation({
    mutationFn: () => run({ data: { role, raw } }),
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-[10px] uppercase tracking-widest text-gold">
            <Sparkles className="h-3 w-3" /> New
          </div>
          <h1 className="mt-3 font-display text-4xl md:text-5xl">
            LinkedIn <span className="italic-serif">Optimizer</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Paste your headline, about, and experience. We match them against a recruiter keyword bank
            for your target role and rewrite each section.
          </p>
        </div>
        <Linkedin className="hidden h-10 w-10 text-gold md:block" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (raw.trim().length < 20) return;
            mutation.mutate();
          }}
          className="rounded-3xl border border-border bg-card p-5 space-y-4"
        >
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Target role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            >
              {linkedInRoleCategories.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r] ?? r}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">
              Your LinkedIn text
            </label>
            <textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder={"Paste like:\n\nHeadline: ...\n\nAbout: ...\n\nExperience:\n- ..."}
              rows={16}
              className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono leading-relaxed"
            />
            <p className="text-[11px] text-muted-foreground">
              Tip: label sections with "Headline:", "About:", "Experience:" for the best split.
            </p>
          </div>
          <button
            type="submit"
            disabled={mutation.isPending || raw.trim().length < 20}
            className="w-full rounded-lg bg-gold py-2.5 text-sm font-medium text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
          >
            {mutation.isPending ? "Analyzing…" : "Optimize with AI"}
          </button>
          {mutation.error && (
            <p className="text-xs text-destructive">{(mutation.error as Error).message}</p>
          )}
        </form>

        <div className="space-y-4">
          {mutation.data ? (
            <Results data={mutation.data} />
          ) : (
            <div className="rounded-3xl border border-dashed border-border bg-card/40 p-10 text-center text-sm text-muted-foreground">
              Your rewrite suggestions will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Results({ data }: { data: OptimizerResult }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      <div className="rounded-3xl border border-border bg-card p-5">
        <div className="flex items-baseline justify-between">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Recruiter readiness</p>
          <p className="font-display text-4xl">{data.score}<span className="text-lg text-muted-foreground">/100</span></p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-gold transition-all"
            style={{ width: `${Math.max(0, Math.min(100, data.score))}%` }}
          />
        </div>
        <p className="mt-4 text-sm">{data.overall_advice}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <KeywordList title="Matched" items={data.matched_keywords} tone="ok" />
          <KeywordList title="Missing" items={data.missing_keywords} tone="warn" />
        </div>
      </div>

      <SectionCard label="Headline" section={data.headline} />
      <SectionCard label="About" section={data.about} />
      <SectionCard label="Experience" section={data.experience} />
    </motion.div>
  );
}

function KeywordList({ title, items, tone }: { title: string; items: string[]; tone: "ok" | "warn" }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{title}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
        {items.map((k) => (
          <span
            key={k}
            className={`rounded-full px-2.5 py-0.5 text-[11px] ${
              tone === "ok"
                ? "border border-gold/30 bg-gold/10 text-gold"
                : "border border-destructive/30 bg-destructive/10 text-destructive"
            }`}
          >
            {k}
          </span>
        ))}
      </div>
    </div>
  );
}

function SectionCard({
  label,
  section,
}: {
  label: string;
  section: OptimizerResult["headline"];
}) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(section.rewrite);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl">{label}</h3>
        <button
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs hover:bg-accent transition"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy rewrite"}
        </button>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Original</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
            {section.original || "—"}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gold">Suggested rewrite</p>
          <p className="mt-2 whitespace-pre-wrap text-sm">{section.rewrite}</p>
        </div>
      </div>
      <p className="mt-4 border-t border-border/60 pt-3 text-xs text-muted-foreground">
        <span className="text-foreground">Why:</span> {section.reasoning}
      </p>
    </div>
  );
}
