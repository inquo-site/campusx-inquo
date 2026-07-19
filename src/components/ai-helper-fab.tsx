import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X, Loader2, Copy, Check, Wand2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { aiFixText } from "@/lib/ai-fix.functions";
import { toast } from "sonner";

const CONTEXTS: { id: string; label: string }[] = [
  { id: "generic", label: "General text" },
  { id: "bio", label: "Bio / About" },
  { id: "name", label: "Name" },
  { id: "college", label: "College" },
  { id: "skills", label: "Skills list" },
  { id: "title", label: "Title / Headline" },
  { id: "description", label: "Description" },
  { id: "bullet", label: "Resume bullet" },
  { id: "message", label: "Chat message" },
  { id: "blog", label: "Blog body" },
];

/**
 * Global floating "Fix with AI" helper. Available on every authenticated page.
 * User pastes any text (form input, bio, resume line, blog draft), picks a
 * context, and gets it cleaned — case, spelling, grammar. Copy or replace.
 */
export function AiHelperFab() {
  const fix = useServerFn(aiFixText);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [fixed, setFixed] = useState("");
  const [context, setContext] = useState("generic");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  // On open: try to grab whatever the user has selected on the page.
  useEffect(() => {
    if (open) {
      const sel = window.getSelection?.()?.toString?.() ?? "";
      if (sel.trim() && !text) setText(sel);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function run() {
    if (!text.trim()) {
      toast.info("Paste or type some text first.");
      return;
    }
    setBusy(true);
    setFixed("");
    try {
      const { fixed: out } = await fix({ data: { text, context } });
      setFixed(out);
    } catch (e) {
      toast.error((e as Error).message ?? "AI fix failed");
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (!fixed) return;
    await navigator.clipboard.writeText(fixed);
    setCopied(true);
    toast.success("Copied cleaned text");
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
        onClick={() => setOpen(true)}
        title="Fix anything with AI"
        className="fixed bottom-5 right-5 z-40 grid h-12 w-12 place-items-center rounded-full border border-gold/40 bg-gold text-primary-foreground shadow-lg shadow-gold/20 transition hover:scale-105 hover:shadow-gold/40 md:h-14 md:w-14"
      >
        <Wand2 className="h-5 w-5" />
        <span className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-gold/40 blur-lg" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-md md:items-center"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="card-noir my-8 w-full max-w-2xl rounded-3xl p-6 md:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-[10px] uppercase tracking-widest text-gold">
                    <Sparkles className="h-3 w-3" /> AI Fix-it Agent
                  </div>
                  <h3 className="mt-3 font-display text-2xl md:text-3xl">
                    Clean up <span className="italic-serif">anything</span> you type
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Case, spelling, grammar — paste text from any form, pick a context, get a clean version back.
                  </p>
                </div>
                <button onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-muted">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 space-y-3">
                <div>
                  <div className="mb-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">— Context</div>
                  <div className="flex flex-wrap gap-1.5">
                    {CONTEXTS.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setContext(c.id)}
                        className={
                          "rounded-full border px-3 py-1 text-[11px] transition " +
                          (context === c.id
                            ? "border-gold/60 bg-gold/15 text-gold"
                            : "border-border bg-background text-muted-foreground hover:border-gold/30 hover:text-foreground")
                        }
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">— Your text</div>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={5}
                    placeholder="paste anything — a bio, a resume line, a project title, a chat message…"
                    className="w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-gold/60"
                  />
                </div>

                <button
                  onClick={run}
                  disabled={busy}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-3 text-sm font-medium text-primary-foreground hover:brightness-110 disabled:opacity-60"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {busy ? "Fixing…" : "Fix with AI"}
                </button>

                {fixed && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-gold/30 bg-gold/5 p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-gold">— Cleaned</div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={copy}
                          className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[11px] hover:border-gold/40"
                        >
                          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          {copied ? "Copied" : "Copy"}
                        </button>
                        <button
                          onClick={() => setText(fixed)}
                          className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[11px] hover:border-gold/40"
                        >
                          Use as input
                        </button>
                      </div>
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{fixed}</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
