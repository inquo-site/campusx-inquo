import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { Loader2, Send, Trash2, Bot, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { toast } from "sonner";
import { AI_TEAMS } from "@/lib/aios-teams";
import {
  listTeamTasks,
  listMyTeamAccess,
  runTeamTask,
  deleteTeamTask,
} from "@/lib/ai-teams.functions";

export function TeamConsole() {
  const qc = useQueryClient();
  const fetchTasks = useServerFn(listTeamTasks);
  const fetchAccess = useServerFn(listMyTeamAccess);
  const run = useServerFn(runTeamTask);
  const remove = useServerFn(deleteTeamTask);

  const { data: access } = useQuery({
    queryKey: ["my-team-access"],
    queryFn: () => fetchAccess({ data: {} as never }),
  });

  const teams = useMemo(
    () => AI_TEAMS.filter((t) => access?.slugs?.includes(t.slug)),
    [access],
  );

  const [teamSlug, setTeamSlug] = useState<string>("");
  const [agentName, setAgentName] = useState<string>("");
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const activeTeam = teams.find((t) => t.slug === teamSlug) ?? teams[0];

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["team-tasks"],
    queryFn: () => fetchTasks({ data: { limit: 30 } }),
  });

  const runMutation = useMutation({
    mutationFn: () =>
      run({
        data: {
          teamSlug: activeTeam!.slug,
          agentName: agentName || undefined,
          title: title.trim(),
          brief: brief.trim(),
        },
      }),
    onSuccess: (res) => {
      if (!res.ok) {
        toast.error(
          res.reason === "no_access"
            ? "Is team ka subscription active nahi hai."
            : "Agent run fail hua. Dobara try karo.",
        );
      } else {
        toast.success("Team ne kaam complete kar diya.");
        setTitle("");
        setBrief("");
        setOpenId(res.taskId);
      }
      qc.invalidateQueries({ queryKey: ["team-tasks"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["team-tasks"] }),
  });

  if (!activeTeam) {
    return (
      <section className="rounded-2xl border border-border p-8 text-center">
        <Lock className="mx-auto h-5 w-5 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">
          Koi team abhi active nahi hai. Ek team hire karo, phir yahan se unhe kaam de sakte ho.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="mb-1 flex items-baseline justify-between">
        <h2 className="font-display text-2xl">
          Brief your <span className="italic-serif">team</span>
        </h2>
        <span className="font-mono text-[11px] text-muted-foreground">
          {teams.length} team{teams.length > 1 ? "s" : ""} active
        </span>
      </div>

      <div className="card-noir space-y-4 rounded-2xl border border-border p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Team
            </span>
            <select
              value={activeTeam.slug}
              onChange={(e) => {
                setTeamSlug(e.target.value);
                setAgentName("");
              }}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-gold/50"
            >
              {teams.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Agent (optional)
            </span>
            <select
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-gold/50"
            >
              <option value="">Coordinator picks the best agent</option>
              {activeTeam.agents.map((a) => (
                <option key={a.name} value={a.name}>
                  {a.name} — {a.role}
                </option>
              ))}
            </select>
          </label>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title — e.g. Landing page ke liye new hero copy"
          className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-gold/50"
        />
        <textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          rows={4}
          placeholder="Brief likho — context, goal, constraints, kya deliver karna hai."
          className="w-full resize-y rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-gold/50"
        />

        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] text-muted-foreground">
            {activeTeam.agents.length} agents · {activeTeam.tagline}
          </p>
          <button
            disabled={runMutation.isPending || title.trim().length < 3 || brief.trim().length < 10}
            onClick={() => runMutation.mutate()}
            className="btn-ink disabled:opacity-40"
          >
            {runMutation.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Team kaam kar rahi hai…
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" /> Assign task
              </>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="grid place-items-center rounded-2xl border border-border p-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : !tasks || tasks.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Abhi tak koi task assign nahi hua.
          </p>
        ) : (
          tasks.map((t) => {
            const team = AI_TEAMS.find((x) => x.slug === t.team_slug);
            const open = openId === t.id;
            return (
              <motion.article
                key={t.id}
                layout
                className="card-noir rounded-2xl border border-border p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <button
                    onClick={() => setOpenId(open ? null : t.id)}
                    className="flex min-w-0 flex-1 items-start gap-4 text-left"
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-gold/30 bg-gold/5 text-gold">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        <TaskStatus status={t.status} />
                        <span className="rounded-full border border-border px-2 py-0.5">
                          {team?.name ?? t.team_slug}
                        </span>
                        {t.agent_name && <span>{t.agent_name}</span>}
                        <span>{new Date(t.created_at).toLocaleString()}</span>
                        {t.duration_ms != null && (
                          <span className="font-mono">{(t.duration_ms / 1000).toFixed(1)}s</span>
                        )}
                      </div>
                      <h3 className="mt-2 font-display text-lg leading-tight">{t.title}</h3>
                      {t.error && <p className="mt-2 text-xs text-rose-400">{t.error}</p>}
                    </div>
                  </button>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => deleteMutation.mutate(t.id)}
                      aria-label="Delete task"
                      className="rounded-lg border border-border p-1.5 text-muted-foreground transition hover:border-rose-500/40 hover:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    {open ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <AnimatePresence initial={false}>
                  {open && t.output && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="prose prose-invert prose-sm mt-5 max-w-none border-t border-border/60 pt-5">
                        <ReactMarkdown>{t.output}</ReactMarkdown>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            );
          })
        )}
      </div>
    </section>
  );
}

function TaskStatus({ status }: { status: string }) {
  const cfg =
    status === "done"
      ? { cls: "bg-emerald-500/10 text-emerald-400", label: "Done" }
      : status === "running"
        ? { cls: "bg-sky-500/10 text-sky-400", label: "Running" }
        : status === "error"
          ? { cls: "bg-rose-500/10 text-rose-400", label: "Error" }
          : { cls: "bg-muted text-muted-foreground", label: status };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}
