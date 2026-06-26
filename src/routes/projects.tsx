import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Github, ExternalLink, UserPlus, X } from "lucide-react";

export const Route = createFileRoute("/projects")({
  component: Projects,
});

const SEED = [
  {
    title: "Quanta",
    desc: "An open-source vector database written in Rust with WASM bindings for in-browser similarity search.",
    stack: ["Rust", "WASM", "TypeScript"],
    live: "https://quanta.dev",
    code: "https://github.com",
  },
  {
    title: "nudge.dev",
    desc: "A habit OS for engineers — calendar-aware, with weekly retros and a focus-mode browser extension.",
    stack: ["Next.js", "Postgres", "Tailwind"],
    live: "https://nudge.dev",
    code: "https://github.com",
  },
  {
    title: "Pitstop",
    desc: "A peer code-review marketplace for student devs. Get senior eyes on your PR in under an hour.",
    stack: ["React", "Node", "Stripe"],
    live: "https://pitstop.app",
    code: "https://github.com",
  },
  {
    title: "Lumen Tutor",
    desc: "AI tutor for JEE/NEET aspirants with adaptive question banks and voice-mode walkthroughs.",
    stack: ["Python", "FastAPI", "OpenAI"],
    live: "https://lumen.ai",
    code: "https://github.com",
  },
  {
    title: "Mesh",
    desc: "Lightweight realtime collaboration primitives — multiplayer cursors and shared state in 4kb.",
    stack: ["TypeScript", "Yjs", "WebRTC"],
    live: "https://mesh.io",
    code: "https://github.com",
  },
  {
    title: "Greenhouse",
    desc: "Climate-action tracker for student clubs. Log campaigns, measure impact, generate impact reports.",
    stack: ["Vue", "Supabase"],
    live: "https://greenhouse.eco",
    code: "https://github.com",
  },
];

function Projects() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{SEED.length} projects shipped by student builders</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {SEED.map((p) => (
          <article
            key={p.title}
            className="group flex flex-col rounded-2xl border border-border bg-surface p-6 transition hover:border-foreground/30"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">{p.title}</h3>
              <button className="rounded-full border border-border bg-background p-1.5 text-muted-foreground transition hover:text-foreground" aria-label="Join team">
                <UserPlus className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {p.stack.map((s) => (
                <span key={s} className="rounded-md bg-muted px-2 py-1 font-mono text-[11px] font-medium">
                  {s}
                </span>
              ))}
            </div>

            <div className="mt-5 flex gap-2">
              <a href={p.live} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-ink px-3 py-2 text-xs font-semibold text-ink-foreground transition hover:bg-ink/90">
                <ExternalLink className="h-3.5 w-3.5" /> Live Demo
              </a>
              <a href={p.code} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold transition hover:bg-muted">
                <Github className="h-3.5 w-3.5" /> Code
              </a>
              <button className="inline-flex items-center justify-center rounded-xl bg-lime px-3 py-2 text-xs font-semibold text-lime-foreground transition hover:brightness-95">
                Join Team
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* FAB */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-8 right-8 z-40 inline-flex items-center gap-2 rounded-full bg-lime px-5 py-3.5 font-display text-sm font-bold text-lime-foreground shadow-lg shadow-lime/40 transition hover:-translate-y-0.5"
      >
        <Plus className="h-4 w-4" /> Submit Project
      </button>

      {open && <SubmitModal onClose={() => setOpen(false)} />}
    </div>
  );
}

function SubmitModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-3xl border border-border bg-surface p-7 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-xl font-bold">Submit a project</h3>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onClose();
          }}
        >
          <Field label="Title" placeholder="e.g. Quanta" />
          <Field label="Description" placeholder="What does it do and why does it matter?" textarea />
          <Field label="Tech Stack tags" placeholder="Rust, WASM, TypeScript" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="GitHub URL" placeholder="github.com/..." />
            <Field label="Live URL" placeholder="https://..." />
          </div>
          <button className="mt-2 w-full rounded-xl bg-ink py-3 text-sm font-semibold text-ink-foreground transition hover:bg-ink/90">
            Publish to Project Hub
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, placeholder, textarea }: { label: string; placeholder?: string; textarea?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {textarea ? (
        <textarea
          rows={3}
          placeholder={placeholder}
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
        />
      ) : (
        <input
          placeholder={placeholder}
          className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
        />
      )}
    </label>
  );
}
