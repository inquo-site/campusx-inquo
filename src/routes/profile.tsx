import { createFileRoute } from "@tanstack/react-router";
import { Github, Globe, MapPin, Pencil } from "lucide-react";

export const Route = createFileRoute("/profile")({
  component: Profile,
});

function Profile() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-surface p-8">
        <div className="grid-bg absolute inset-0 opacity-50" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
          <div className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-ink font-display text-3xl font-bold text-ink-foreground">
            AK
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-3xl font-bold">Ananya Krishnan</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              CSE '26 · IIT Bombay · Building Mesh OS · Open to startup co-founder roles
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-3 w-3" /> Mumbai, IN</span>
              <a href="#" className="inline-flex items-center gap-1.5 hover:text-foreground"><Github className="h-3 w-3" /> ananyak</a>
              <a href="#" className="inline-flex items-center gap-1.5 hover:text-foreground"><Globe className="h-3 w-3" /> ananya.dev</a>
            </div>
          </div>
          <button className="inline-flex items-center gap-2 self-start rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold hover:bg-muted">
            <Pencil className="h-3.5 w-3.5" /> Edit profile
          </button>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-3">
        {[
          { k: "Skills", v: ["TypeScript", "Rust", "Systems", "Product"] },
          { k: "Currently shipping", v: ["Mesh OS v0.4", "Open-source CRDT lib"] },
          { k: "Looking for", v: ["Co-founder", "Backend collaborator"] },
        ].map((b) => (
          <div key={b.k} className="rounded-2xl border border-border bg-surface p-5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{b.k}</div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {b.v.map((t) => (
                <span key={t} className="rounded-md bg-muted px-2 py-1 text-xs font-medium">{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <h3 className="font-display text-lg font-bold">Recent activity</h3>
        <ul className="mt-4 space-y-3 text-sm">
          <li className="flex justify-between border-b border-border pb-3">
            <span>Joined team at <strong>Lumen.ai</strong></span>
            <span className="text-muted-foreground">2 days ago</span>
          </li>
          <li className="flex justify-between border-b border-border pb-3">
            <span>Posted <strong>Mesh OS v0.4</strong> to Project Hub</span>
            <span className="text-muted-foreground">5 days ago</span>
          </li>
          <li className="flex justify-between">
            <span>Applied to <strong>Razorpay SDE Internship</strong></span>
            <span className="text-muted-foreground">1 week ago</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
