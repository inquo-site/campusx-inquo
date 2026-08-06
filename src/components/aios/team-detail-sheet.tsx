import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, ArrowUpRight, Check, ChevronRight, Sparkles, Users } from "lucide-react";
import type { AiTeam } from "@/lib/aios-teams";
import { inr } from "@/lib/aios-teams";

/**
 * Full-screen "road trip" through a team: every agent is a stop on the route,
 * clicking a stop reveals that agent's complete ability set.
 */
export function TeamDetailSheet({
  team,
  cycle,
  onClose,
  onHire,
}: {
  team: AiTeam | null;
  cycle: "monthly" | "yearly";
  onClose: () => void;
  onHire: (slug: string) => void;
}) {
  const [active, setActive] = useState(0);

  return (
    <AnimatePresence>
      {team && (
        <motion.div
          key="sheet"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 overflow-y-auto bg-background/95 backdrop-blur-xl"
        >
          <div className="mx-auto min-h-full max-w-6xl px-4 py-10 md:px-8">
            <div className="flex items-start justify-between gap-6">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-[10px] uppercase tracking-widest text-gold">
                  <Users className="h-3 w-3" /> {team.category} · {team.agents.length} agents
                </div>
                <h2 className="mt-4 font-display text-3xl leading-tight md:text-5xl">{team.name}</h2>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">{team.tagline}</p>
              </motion.div>
              <button
                onClick={onClose}
                className="shrink-0 rounded-full border border-border bg-surface p-2 text-muted-foreground transition hover:text-foreground"
                aria-label="Close team detail"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,340px)_1fr]">
              {/* The route */}
              <div className="relative">
                <div className="absolute bottom-4 left-[19px] top-4 w-px bg-gradient-to-b from-gold/60 via-border to-transparent" />
                <ul className="space-y-1">
                  {team.agents.map((a, i) => {
                    const on = i === active;
                    return (
                      <li key={a.name}>
                        <button
                          onClick={() => setActive(i)}
                          className={`group relative flex w-full items-center gap-4 rounded-xl px-2 py-3 text-left transition ${
                            on ? "bg-surface" : "hover:bg-surface/60"
                          }`}
                        >
                          <span
                            className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border text-[11px] font-mono transition ${
                              on
                                ? "border-gold bg-gold text-background"
                                : "border-border bg-background text-muted-foreground group-hover:border-gold/50"
                            }`}
                          >
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span
                              className={`block truncate text-sm font-medium ${on ? "text-foreground" : "text-foreground/75"}`}
                            >
                              {a.name}
                            </span>
                            <span className="block truncate text-[11px] text-muted-foreground">{a.role}</span>
                          </span>
                          <ChevronRight
                            className={`h-4 w-4 shrink-0 transition ${on ? "text-gold" : "text-muted-foreground/40"}`}
                          />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* The stop */}
              <div className="lg:sticky lg:top-10 lg:self-start">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={team.agents[active]?.name}
                    initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="ambient-glow rounded-3xl border border-gold/20 bg-surface p-7 md:p-9"
                  >
                    <div className="text-[10px] uppercase tracking-[0.22em] text-gold">
                      — Stop {active + 1} of {team.agents.length}
                    </div>
                    <h3 className="mt-3 font-display text-3xl">{team.agents[active]?.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{team.agents[active]?.role}</p>

                    <div className="mt-7 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      What this agent can do
                    </div>
                    <ul className="mt-4 space-y-2.5">
                      {team.agents[active]?.abilities.map((c, i) => (
                        <motion.li
                          key={c}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.08 + i * 0.06, duration: 0.3 }}
                          className="flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm"
                        >
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                          <span>{c}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </AnimatePresence>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      Hire the whole team
                    </div>
                    <div className="mt-1 font-display text-3xl">
                      {inr(cycle === "yearly" ? team.yearly : team.monthly)}
                      <span className="ml-1 text-xs text-muted-foreground">
                        / {cycle === "yearly" ? "yr" : "mo"}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => onHire(team.slug)} className="btn-ink group">
                    <Sparkles className="h-3.5 w-3.5" /> Hire this team
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
