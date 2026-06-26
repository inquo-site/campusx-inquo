import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Plus, Github, ExternalLink, X, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/projects")({
  component: Projects,
});

const SEED = [
  { title: "Quanta", italic: "vector db, in rust", desc: "Open-source vector database written in Rust with WASM bindings for in-browser similarity search.", stack: ["Rust", "WASM", "TypeScript"], price: "OSS" },
  { title: "nudge.dev", italic: "habit OS", desc: "A habit OS for engineers — calendar-aware, weekly retros, focus-mode browser extension.", stack: ["Next.js", "Postgres"], price: "Freemium" },
  { title: "Pitstop", italic: "peer code reviews", desc: "A peer code-review marketplace for student devs. Get senior eyes on your PR in under an hour.", stack: ["React", "Node", "Stripe"], price: "$5/PR" },
  { title: "Lumen Tutor", italic: "AI for JEE", desc: "AI tutor for JEE/NEET aspirants with adaptive question banks and voice-mode walkthroughs.", stack: ["Python", "FastAPI"], price: "Beta" },
  { title: "Mesh", italic: "realtime in 4kb", desc: "Lightweight realtime collaboration primitives — multiplayer cursors and shared state.", stack: ["TypeScript", "Yjs"], price: "OSS" },
  { title: "Greenhouse", italic: "climate tracker", desc: "Climate-action tracker for student clubs. Log campaigns, measure impact, generate reports.", stack: ["Vue", "Supabase"], price: "Free" },
];

function Projects() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <p className="max-w-xl text-sm text-muted-foreground">
        Live projects shipped by student builders. Hit{" "}
        <span className="italic-serif">view code</span> to peek under the hood, or request to join a team.
      </p>

      <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2">
        {SEED.map((p, i) => (
          <motion.article
            key={p.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
            className="card-noir-hover group relative flex flex-col bg-surface p-8"
          >
            <div className="mb-6 flex items-start justify-between">
              <div className="grid h-11 w-11 place-items-center rounded-lg border border-gold/25 bg-gold/5 font-display text-lg italic text-gold">
                {p.title[0]}
              </div>
              <span className="font-mono text-[11px] text-muted-foreground">{p.price}</span>
            </div>

            <h3 className="font-display text-3xl leading-tight">
              {p.title} <br />
              <span className="italic-serif text-xl">{p.italic}</span>
            </h3>

            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>

            <div className="mt-5 flex flex-wrap gap-1.5">
              {p.stack.map((s) => (
                <span key={s} className="rounded-md border border-border bg-background px-2 py-1 font-mono text-[10px] text-foreground/80">
                  {s}
                </span>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap gap-2">
              <a href="#" className="inline-flex items-center gap-1.5 rounded-full bg-gold px-4 py-2 text-xs font-medium text-primary-foreground transition hover:brightness-110">
                <ExternalLink className="h-3 w-3" /> Live Demo
              </a>
              <a href="#" className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-xs font-medium hover:border-gold/40">
                <Github className="h-3 w-3" /> View Code
              </a>
              <button className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-xs font-medium hover:border-gold/40">
                Join Team <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
          </motion.article>
        ))}
      </div>

      {/* FAB */}
      <motion.button
        whileHover={{ y: -2 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-8 right-8 z-40 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3.5 text-sm font-medium text-primary-foreground shadow-2xl shadow-gold/30"
      >
        <Plus className="h-4 w-4" /> Submit Project
      </motion.button>

      <AnimatePresence>{open && <SubmitModal onClose={() => setOpen(false)} />}</AnimatePresence>
    </div>
  );
}

function SubmitModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="card-noir w-full max-w-lg rounded-3xl p-8"
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              — New entry
            </div>
            <h3 className="mt-1 font-display text-3xl">
              Submit a <span className="italic-serif">project</span>
            </h3>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-muted">
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
          <Field label="Description" placeholder="What does it do, why does it matter?" textarea />
          <Field label="Tech Stack tags" placeholder="Rust, WASM, TypeScript" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="GitHub URL" placeholder="github.com/…" />
            <Field label="Live URL" placeholder="https://…" />
          </div>
          <button className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-3 text-sm font-medium text-primary-foreground transition hover:brightness-110">
            Publish to Project Hub <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function Field({ label, placeholder, textarea }: { label: string; placeholder?: string; textarea?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      {textarea ? (
        <textarea
          rows={3}
          placeholder={placeholder}
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-gold/60"
        />
      ) : (
        <input
          placeholder={placeholder}
          className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-gold/60"
        />
      )}
    </label>
  );
}
