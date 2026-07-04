import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: string;
  italic: string;
  body: string;
  icon: LucideIcon;
  highlights: { label: string; value: string }[];
  children?: ReactNode;
};

export function FeatureShell({ eyebrow, title, italic, body, icon: Icon, highlights, children }: Props) {
  return (
    <div className="mx-auto max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="card-noir relative overflow-hidden rounded-3xl p-8 md:p-12"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-gold">
          <Icon className="h-3 w-3" /> {eyebrow}
        </div>
        <h1 className="mt-5 font-display text-4xl leading-[1.05] md:text-6xl">
          {title} <span className="italic-serif">{italic}</span>
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">{body}</p>

        <div className="mt-9 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
          {highlights.map((h) => (
            <div key={h.label} className="bg-surface p-5">
              <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">— {h.label}</div>
              <div className="mt-2 font-display text-xl leading-tight">{h.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3 text-gold" />
          Rolling out to Campus X builders — early access soon.
        </div>
      </motion.div>

      {children}
    </div>
  );
}
