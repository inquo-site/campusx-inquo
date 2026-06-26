import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Github, Globe, MapPin, Pencil } from "lucide-react";

export const Route = createFileRoute("/profile")({
  component: Profile,
});

function Profile() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="card-noir relative overflow-hidden rounded-3xl p-8"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl border border-gold/30 bg-gold/10 font-display text-4xl italic text-gold">
            A
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              — CSE '26 · IIT Bombay
            </div>
            <h2 className="mt-1 font-display text-4xl leading-tight">
              Ananya <span className="italic-serif">Krishnan</span>
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Building Mesh OS. Open to startup co-founder roles in systems & infra.
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-3 w-3" /> Mumbai, IN</span>
              <a href="#" className="inline-flex items-center gap-1.5 hover:text-gold"><Github className="h-3 w-3" /> ananyak</a>
              <a href="#" className="inline-flex items-center gap-1.5 hover:text-gold"><Globe className="h-3 w-3" /> ananya.dev</a>
            </div>
          </div>
          <button className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium hover:border-gold/40">
            <Pencil className="h-3.5 w-3.5" /> Edit
          </button>
        </div>
      </motion.section>

      <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
        {[
          { k: "Skills", v: ["TypeScript", "Rust", "Systems", "Product"] },
          { k: "Currently shipping", v: ["Mesh OS v0.4", "Open-source CRDT lib"] },
          { k: "Looking for", v: ["Co-founder", "Backend collaborator"] },
        ].map((b, i) => (
          <motion.div
            key={b.k}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="bg-surface p-6"
          >
            <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              — {b.k}
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {b.v.map((t) => (
                <span key={t} className="rounded-md border border-border bg-background px-2 py-1 font-mono text-[10px] text-foreground/80">
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <section className="card-noir rounded-2xl p-7">
        <h3 className="font-display text-2xl">
          Recent <span className="italic-serif">activity</span>
        </h3>
        <ul className="mt-5 space-y-3 text-sm">
          {[
            { l: "Joined team at", italic: "Lumen.ai", t: "2 days ago" },
            { l: "Posted", italic: "Mesh OS v0.4", t: "5 days ago" },
            { l: "Applied to", italic: "Razorpay SDE Internship", t: "1 week ago" },
          ].map((row, i) => (
            <li key={i} className="flex justify-between border-b border-border pb-3 last:border-0 last:pb-0">
              <span>{row.l} <span className="italic-serif">{row.italic}</span></span>
              <span className="font-mono text-xs text-muted-foreground">{row.t}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
