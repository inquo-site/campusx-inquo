import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Loader2, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { chatWithMentor } from "@/lib/ai.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/mentor")({
  component: Mentor,
});

const SUGGESTIONS = [
  "Pick a side project that'll get me a top internship in 8 weeks",
  "Review my current stack and tell me what's missing",
  "Help me find a co-founder type that complements me",
  "Build a 4-week DSA + system design plan",
];

type Msg = { id?: string; role: "user" | "assistant"; content: string; created_at?: string };

function Mentor() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: history } = useQuery({
    queryKey: ["ai-history", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("ai_messages").select("id,role,content,created_at").eq("user_id", user!.id).order("created_at", { ascending: true }).limit(100);
      return (data ?? []) as Msg[];
    },
  });

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [history?.length]);

  const send = useMutation({
    mutationFn: async (message: string) => {
      const last = (history ?? []).slice(-12).map((m) => ({ role: m.role, content: m.content }));
      const res = await chatWithMentor({ data: { message, history: last } });
      return res.reply;
    },
    onMutate: (message) => {
      qc.setQueryData(["ai-history", user?.id], (old: Msg[] = []) => [...old, { role: "user", content: message }]);
    },
    onSuccess: (reply) => {
      qc.setQueryData(["ai-history", user?.id], (old: Msg[] = []) => [...old, { role: "assistant", content: reply }]);
      qc.invalidateQueries({ queryKey: ["ai-history"] });
    },
    onError: (e: any) => toast.error(e.message ?? "AI failed"),
  });

  const clear = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("ai_messages").delete().eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.setQueryData(["ai-history", user?.id], []); toast.success("Conversation cleared"); },
  });

  const submit = (text?: string) => {
    const t = (text ?? input).trim();
    if (!t || send.isPending) return;
    setInput("");
    send.mutate(t);
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="max-w-xl text-sm text-muted-foreground">
          A mentor that knows code, internships, and what a recruiter wants. <span className="italic-serif">Conversations are saved.</span>
        </p>
        {(history?.length ?? 0) > 0 && (
          <button onClick={() => clear.mutate()} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-[11px] text-muted-foreground hover:text-red-400">
            <Trash2 className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      {(history?.length ?? 0) === 0 && (
        <div className="card-noir rounded-2xl p-6">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground"><Sparkles className="h-3 w-3 text-gold" /> Try asking</div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => submit(s)} className="rounded-xl border border-border bg-background p-3 text-left text-sm hover:border-gold/40">{s}</button>
            ))}
          </div>
        </div>
      )}

      <div ref={scrollRef} className="card-noir max-h-[55vh] min-h-[40vh] overflow-y-auto rounded-2xl p-5">
        <AnimatePresence initial={false}>
          {(history ?? []).map((m, i) => (
            <motion.div key={m.id ?? i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={"mb-4 flex " + (m.role === "user" ? "justify-end" : "justify-start")}>
              <div className={"max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm " + (m.role === "user" ? "bg-gold text-primary-foreground" : "border border-border bg-background")}>
                {m.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {send.isPending && <div className="text-xs text-muted-foreground">mentor is thinking…</div>}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="card-noir flex items-center gap-2 rounded-2xl p-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask the mentor…" className="h-12 flex-1 rounded-xl bg-transparent px-3 text-sm outline-none" />
        <button disabled={send.isPending || !input.trim()} className="inline-flex h-12 items-center gap-2 rounded-xl bg-gold px-5 text-sm font-medium text-primary-foreground hover:brightness-110 disabled:opacity-60">
          {send.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Send
        </button>
      </form>
    </div>
  );
}
