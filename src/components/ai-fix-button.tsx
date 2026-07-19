import { useState } from "react";
import { Sparkles, Loader2, Check } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { aiFixText } from "@/lib/ai-fix.functions";
import { toast } from "sonner";

type Props = {
  value: string;
  onChange: (v: string) => void;
  context: string;
  className?: string;
  label?: string;
};

/**
 * Inline "Fix with AI" button. Cleans up capitalization, spelling, grammar
 * for the given field value based on `context` (e.g. "bio", "title", "bullet").
 */
export function AiFixButton({ value, onChange, context, className = "", label }: Props) {
  const fix = useServerFn(aiFixText);
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);

  async function handle() {
    const text = (value ?? "").trim();
    if (!text) {
      toast.info("Nothing to fix yet — type something first.");
      return;
    }
    setBusy(true);
    try {
      const { fixed, changed } = await fix({ data: { text: value, context } });
      if (!changed) {
        toast.success("Looks clean already ✨");
      } else {
        onChange(fixed);
        toast.success("Fixed with AI");
      }
      setOk(true);
      setTimeout(() => setOk(false), 1400);
    } catch (e) {
      toast.error((e as Error).message ?? "AI fix failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handle}
      disabled={busy}
      title={label ?? "Fix with AI (capitalization, spelling, grammar)"}
      className={
        "inline-flex items-center gap-1 rounded-md border border-gold/30 bg-gold/10 px-2 py-1 text-[10px] font-medium uppercase tracking-widest text-gold transition hover:border-gold/60 hover:bg-gold/15 disabled:opacity-60 " +
        className
      }
    >
      {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : ok ? <Check className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
      {label ?? "Fix"}
    </button>
  );
}
