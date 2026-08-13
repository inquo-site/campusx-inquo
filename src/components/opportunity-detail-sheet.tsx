import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  X,
  ExternalLink,
  BookmarkPlus,
  CheckCircle2,
  Circle,
  ChevronDown,
  Loader2,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  ListChecks,
  CalendarClock,
  MessageCircleQuestion,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { fmtDate, timeAgo, type Opportunity } from "@/lib/opportunity";

function SectionHead({ icon: Icon, title, hint }: { icon: typeof ListChecks; title: string; hint?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-gold" /> {title}
      </div>
      {hint && <span className="text-[10px] text-muted-foreground">{hint}</span>}
    </div>
  );
}

export function OpportunityDetailSheet({
  item,
  onClose,
}: {
  item: Opportunity;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [note, setNote] = useState("");
  const [applied, setApplied] = useState(false);
  const [tracked, setTracked] = useState(false);

  const checklist = useMemo(
    () => (item.eligibility.length ? item.eligibility : item.requirements),
    [item.eligibility, item.requirements],
  );
  const readiness = checklist.length
    ? Math.round((checklist.filter((c) => checked[c]).length / checklist.length) * 100)
    : 100;

  const track = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("applications").insert({
        user_id: user!.id,
        company: item.org || item.title,
        role: item.title,
        source: item.kind,
        link: item.applyUrl,
        status: "saved",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setTracked(true);
      toast.success("Saved to your Application Tracker");
      qc.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const applyInApp = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("internship_applications").insert({
        applicant_id: user!.id,
        internship_id: item.id,
        cover_note: note || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setApplied(true);
      toast.success("Application submitted");
      qc.invalidateQueries({ queryKey: ["my-apps"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-background/85 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl border border-border bg-surface sm:rounded-3xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-border bg-surface/95 px-6 py-5 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.2em] text-gold">
                {item.kind === "job" ? "Off-campus role" : item.kind === "internship" ? "Internship" : "Hackathon"}
              </div>
              <h2 className="mt-2 truncate font-display text-2xl leading-tight sm:text-3xl">{item.title}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.org}
                {item.subtitle ? ` · ${item.subtitle}` : ""}
              </p>
            </div>
            <button onClick={onClose} aria-label="Close" className="shrink-0 text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>

          {item.facts.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {item.facts.map((f) => (
                <span
                  key={f.label}
                  className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-foreground/80"
                >
                  <span className="text-muted-foreground">{f.label}:</span> {f.value}
                </span>
              ))}
            </div>
          )}
          {item.enrichedAt && (
            <p className="mt-3 inline-flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <RefreshCw className="h-3 w-3 text-gold" /> Details auto-refreshed {timeAgo(item.enrichedAt)}
            </p>
          )}
        </div>

        <div className="space-y-7 px-6 py-6">
          {item.description && (
            <section className="space-y-2">
              <SectionHead icon={Sparkles} title="About this opportunity" />
              <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </section>
          )}

          {item.skills.length > 0 && (
            <section className="space-y-2.5">
              <SectionHead icon={GraduationCap} title="Skills you need" hint={`${item.skills.length} skills`} />
              <div className="flex flex-wrap gap-1.5">
                {item.skills.map((s) => (
                  <span
                    key={s}
                    className="rounded-md border border-gold/25 bg-gold/5 px-2 py-0.5 text-[11px] text-foreground/85"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}

          {checklist.length > 0 && (
            <section className="space-y-3">
              <SectionHead icon={ShieldCheck} title="Eligibility check" hint={`${readiness}% ready`} />
              <div className="h-1 w-full overflow-hidden rounded-full bg-card">
                <motion.div
                  className="h-full rounded-full bg-gold"
                  animate={{ width: `${readiness}%` }}
                  transition={{ duration: 0.35 }}
                />
              </div>
              <ul className="space-y-1.5">
                {checklist.map((c) => {
                  const on = !!checked[c];
                  return (
                    <li key={c}>
                      <button
                        onClick={() => setChecked((p) => ({ ...p, [c]: !p[c] }))}
                        className="flex w-full items-start gap-2.5 rounded-xl border border-border bg-card px-3 py-2 text-left text-sm transition hover:border-gold/40"
                      >
                        {on ? (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                        ) : (
                          <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        )}
                        <span className={on ? "text-foreground" : "text-foreground/75"}>{c}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {item.requirements.length > 0 && checklist !== item.requirements && (
            <section className="space-y-2.5">
              <SectionHead icon={ListChecks} title="What they expect" />
              <ul className="space-y-2">
                {item.requirements.map((r) => (
                  <li key={r} className="flex gap-3 text-sm text-foreground/85">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {item.timeline.length > 0 && (
            <section className="space-y-3">
              <SectionHead icon={CalendarClock} title="Process timeline" />
              <ol className="relative space-y-4 border-l border-border pl-5">
                {item.timeline.map((t, i) => (
                  <li key={`${t.label}-${i}`} className="relative">
                    <span className="absolute -left-[1.4rem] top-1.5 h-2 w-2 rounded-full bg-gold" />
                    <div className="text-sm font-medium">{t.label}</div>
                    {t.date && <div className="text-[11px] text-gold">{fmtDate(t.date)}</div>}
                    {t.detail && <p className="mt-0.5 text-xs text-muted-foreground">{t.detail}</p>}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {item.faq.length > 0 && (
            <section className="space-y-2">
              <SectionHead icon={MessageCircleQuestion} title="FAQ" />
              <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
                {item.faq.map((f, i) => (
                  <div key={f.q}>
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm hover:bg-card"
                    >
                      <span>{f.q}</span>
                      <ChevronDown
                        className={"h-4 w-4 shrink-0 text-muted-foreground transition " + (openFaq === i ? "rotate-180" : "")}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {openFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22 }}
                          className="overflow-hidden"
                        >
                          <p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Apply flow */}
          <section className="space-y-3 rounded-2xl border border-gold/25 bg-gold/[0.04] p-5">
            <SectionHead
              icon={Sparkles}
              title="Apply now"
              hint={item.deadline ? `Closes ${fmtDate(item.deadline)}` : undefined}
            />
            {item.canApplyInApp && !applied && (
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                maxLength={1000}
                placeholder="Cover note — why you're the right fit (optional, max 1000 chars)"
                className="w-full rounded-xl border border-border bg-card p-3 text-sm outline-none focus:border-gold/60"
              />
            )}
            <div className="flex flex-wrap gap-2">
              {item.canApplyInApp ? (
                applied ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-2.5 text-sm text-gold">
                    <CheckCircle2 className="h-4 w-4" /> Application submitted
                  </span>
                ) : (
                  <button
                    onClick={() => applyInApp.mutate()}
                    disabled={applyInApp.isPending || !user}
                    className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-primary-foreground hover:brightness-110 disabled:opacity-60"
                  >
                    {applyInApp.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Submit application
                  </button>
                )
              ) : null}

              {item.applyUrl && (
                <a
                  href={item.applyUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => {
                    if (user && !tracked) track.mutate();
                  }}
                  className={
                    "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium " +
                    (item.canApplyInApp
                      ? "border border-border bg-card text-foreground/85 hover:border-gold/40"
                      : "bg-gold text-primary-foreground hover:brightness-110")
                  }
                >
                  {item.kind === "hackathon" ? "Register" : "Apply on site"} <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}

              <button
                onClick={() => track.mutate()}
                disabled={track.isPending || tracked || !user}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm text-foreground/85 hover:border-gold/40 disabled:opacity-60"
              >
                {track.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookmarkPlus className="h-4 w-4" />}
                {tracked ? "In your tracker" : "Save to tracker"}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Saving adds it to your Application Tracker so you can follow every round without losing the thread.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
