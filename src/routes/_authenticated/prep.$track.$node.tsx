import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  ArrowLeft,
  BookOpen,
  Link2,
  ListChecks,
  Check,
  X,
  Sparkles,
  Zap,
  ArrowUpRight,
  RotateCcw,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/prep/$track/$node")({
  component: NodePage,
  head: ({ params }) => ({
    meta: [{ title: `${params.node} · Prep · Campus X` }],
  }),
});

type Resource = { title: string; url: string; type?: string };
type Mcq = { q: string; options: string[]; answer: number; why?: string };

type Node = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  detail_md: string | null;
  difficulty: string;
  xp: number;
  resources: Resource[];
  mcqs: Mcq[];
};

type Tab = "concept" | "resources" | "quiz";

function NodePage() {
  const { track, node: nodeSlug } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("concept");

  const { data } = useQuery({
    queryKey: ["prep-node", track, nodeSlug, user?.id],
    queryFn: async () => {
      const { data: t } = await supabase
        .from("prep_tracks")
        .select("id,slug,title,accent")
        .eq("slug", track)
        .maybeSingle();
      if (!t) return null;
      const { data: n } = await supabase
        .from("prep_nodes")
        .select("id,slug,title,summary,detail_md,difficulty,xp,resources,mcqs")
        .eq("track_id", t.id)
        .eq("slug", nodeSlug)
        .maybeSingle();
      if (!n) return null;
      let progress: { status: string; best_score: number } | null = null;
      if (user) {
        const { data: p } = await supabase
          .from("prep_progress")
          .select("status,best_score")
          .eq("user_id", user.id)
          .eq("node_id", n.id)
          .maybeSingle();
        progress = p;
      }
      return { track: t, node: n as unknown as Node, progress };
    },
  });

  const saveProgress = useMutation({
    mutationFn: async (payload: { node_id: string; status: string; score: number }) => {
      if (!user) return;
      // fetch current for best score / attempt count
      const { data: existing } = await supabase
        .from("prep_progress")
        .select("id,best_score,attempts")
        .eq("user_id", user.id)
        .eq("node_id", payload.node_id)
        .maybeSingle();
      const best = Math.max(existing?.best_score ?? 0, payload.score);
      const attempts = (existing?.attempts ?? 0) + 1;
      await supabase.from("prep_progress").upsert(
        {
          user_id: user.id,
          node_id: payload.node_id,
          status: payload.status,
          best_score: best,
          attempts,
          completed_at: payload.status === "completed" ? new Date().toISOString() : null,
        },
        { onConflict: "user_id,node_id" },
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prep-node", track, nodeSlug] });
      qc.invalidateQueries({ queryKey: ["prep-track", track] });
      qc.invalidateQueries({ queryKey: ["prep-stats"] });
    },
  });

  if (!data) return <div className="py-20 text-center text-sm text-muted-foreground">Loading…</div>;
  const { node, progress } = data;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <Link
          to="/prep/$track"
          params={{ track }}
          className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Back to journey
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
          <span className="rounded-full border border-border px-2 py-0.5">{node.difficulty}</span>
          <span className="inline-flex items-center gap-1 text-gold">
            <Zap className="h-3 w-3" /> {node.xp} XP
          </span>
          {progress?.status === "completed" && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/5 px-2 py-0.5 text-emerald-400">
              <Check className="h-3 w-3" /> Cleared · {progress.best_score}%
            </span>
          )}
        </div>
        <h1 className="mt-3 font-display text-4xl leading-[1.05] md:text-5xl">{node.title}</h1>
        {node.summary && <p className="mt-3 text-muted-foreground">{node.summary}</p>}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 rounded-full border border-border bg-surface/60 p-1">
        <TabBtn active={tab === "concept"} onClick={() => setTab("concept")} icon={BookOpen} label="Concept" />
        <TabBtn
          active={tab === "resources"}
          onClick={() => setTab("resources")}
          icon={Link2}
          label={`Resources · ${node.resources?.length ?? 0}`}
        />
        <TabBtn
          active={tab === "quiz"}
          onClick={() => setTab("quiz")}
          icon={ListChecks}
          label={`Quiz · ${node.mcqs?.length ?? 0}`}
        />
      </div>

      <AnimatePresence mode="wait">
        {tab === "concept" && (
          <motion.section
            key="concept"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="prose prose-invert prose-sm max-w-none rounded-2xl border border-border bg-card p-6"
          >
            {node.detail_md ? (
              <ReactMarkdown>{node.detail_md}</ReactMarkdown>
            ) : (
              <p className="text-muted-foreground">Concept notes coming soon.</p>
            )}
          </motion.section>
        )}

        {tab === "resources" && (
          <motion.section
            key="resources"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {(node.resources ?? []).length === 0 && (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                Curated resources coming soon.
              </div>
            )}
            {(node.resources ?? []).map((r, i) => (
              <a
                key={i}
                href={r.url}
                target="_blank"
                rel="noreferrer noopener"
                className="group flex items-center justify-between rounded-2xl border border-border bg-card p-4 transition hover:border-gold/40"
              >
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-widest text-gold">
                    {r.type ?? "link"}
                  </div>
                  <div className="mt-1 truncate text-sm font-medium">{r.title}</div>
                  <div className="mt-0.5 truncate text-[11px] text-muted-foreground">{r.url}</div>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            ))}
          </motion.section>
        )}

        {tab === "quiz" && (
          <motion.section
            key="quiz"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <QuizPanel
              nodeId={node.id}
              mcqs={node.mcqs ?? []}
              xp={node.xp}
              onComplete={(score) =>
                saveProgress.mutate({
                  node_id: node.id,
                  status: score >= 70 ? "completed" : "in_progress",
                  score,
                })
              }
            />
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof BookOpen;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[11px] uppercase tracking-widest transition " +
        (active
          ? "bg-gold text-primary-foreground"
          : "text-muted-foreground hover:text-foreground")
      }
    >
      <Icon className="h-3 w-3" /> {label}
    </button>
  );
}

function QuizPanel({
  nodeId,
  mcqs,
  xp,
  onComplete,
}: {
  nodeId: string;
  mcqs: Mcq[];
  xp: number;
  onComplete: (score: number) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [done, setDone] = useState(false);

  if (mcqs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No quiz for this node yet. Read the concept and jump to the next one.
      </div>
    );
  }

  const q = mcqs[idx];

  if (done) {
    const correct = answers.filter((a, i) => a === mcqs[i].answer).length;
    const score = Math.round((correct / mcqs.length) * 100);
    const passed = score >= 70;
    return (
      <div className="rounded-3xl border border-border bg-card p-8 text-center">
        <div
          className={
            "mx-auto grid h-14 w-14 place-items-center rounded-full " +
            (passed ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400")
          }
        >
          {passed ? <Sparkles className="h-6 w-6" /> : <RotateCcw className="h-6 w-6" />}
        </div>
        <h3 className="mt-4 font-display text-3xl">
          {passed ? "Cleared." : "So close."}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          You got {correct}/{mcqs.length} · {score}%. {passed ? `+${xp} XP earned.` : "70% to clear this node."}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => {
              setIdx(0);
              setPicked(null);
              setAnswers([]);
              setDone(false);
            }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm hover:border-gold/40"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      </div>
    );
  }

  const commitAndNext = () => {
    if (picked === null) return;
    const nextAnswers = [...answers, picked];
    setAnswers(nextAnswers);
    setPicked(null);
    if (idx + 1 >= mcqs.length) {
      const correct = nextAnswers.filter((a, i) => a === mcqs[i].answer).length;
      const score = Math.round((correct / mcqs.length) * 100);
      onComplete(score);
      setDone(true);
    } else {
      setIdx(idx + 1);
    }
  };

  const revealed = picked !== null;
  const isRight = revealed && picked === q.answer;

  return (
    <div className="space-y-5 rounded-3xl border border-border bg-card p-6">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
        <span>Question {idx + 1} / {mcqs.length}</span>
        <span className="font-mono">{Math.round(((idx) / mcqs.length) * 100)}%</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-background/60">
        <div
          className="h-full bg-gold transition-all"
          style={{ width: `${((idx) / mcqs.length) * 100}%` }}
        />
      </div>

      <h3 className="font-display text-xl leading-snug">{q.q}</h3>
      <div className="space-y-2">
        {q.options.map((opt, i) => {
          const chosen = picked === i;
          const correct = revealed && i === q.answer;
          const wrong = revealed && chosen && i !== q.answer;
          return (
            <button
              key={i}
              onClick={() => !revealed && setPicked(i)}
              disabled={revealed}
              className={
                "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition " +
                (correct
                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-100"
                  : wrong
                    ? "border-rose-500/50 bg-rose-500/10 text-rose-100"
                    : chosen
                      ? "border-gold/50 bg-gold/5"
                      : "border-border hover:border-gold/30")
              }
            >
              <span className="grid h-6 w-6 place-items-center rounded-full border border-current text-[10px] font-mono">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{opt}</span>
              {correct && <Check className="h-4 w-4" />}
              {wrong && <X className="h-4 w-4" />}
            </button>
          );
        })}
      </div>

      {revealed && q.why && (
        <div
          className={
            "rounded-xl border p-3 text-xs " +
            (isRight
              ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-200"
              : "border-amber-500/30 bg-amber-500/5 text-amber-200")
          }
        >
          <span className="font-medium">Why: </span>
          {q.why}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={commitAndNext}
          disabled={picked === null}
          className="btn-ink group disabled:opacity-40"
        >
          {idx + 1 === mcqs.length ? "Finish" : "Next"}
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
