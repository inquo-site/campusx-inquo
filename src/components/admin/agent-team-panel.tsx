import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import ReactMarkdown from "react-markdown";
import {
  adminListAgentTasks,
  adminUpdateAgentTask,
  adminDeleteAgentTask,
  adminAgentTaskStats,
} from "@/lib/admin-agent-team.functions";

const ROLE_LABELS: Record<string, string> = {
  ceo: "CEO",
  co_founder: "Co-founder",
  cto: "CTO",
  product_manager: "PM",
  fullstack_developer: "Full-stack Dev",
  system_designer: "System Designer",
  ux_designer: "UX",
  ui_designer: "UI",
  bug_fixer: "Bug Fixer",
  feature_planner: "Feature Planner",
  marketer: "Marketer",
  digital_marketer: "Digital Marketer",
  seo_specialist: "SEO",
  content_writer: "Content Writer",
  copywriter: "Copywriter",
};

const STATUS_STYLES: Record<string, string> = {
  planned: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  in_progress: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  done: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  pending_email: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30",
  emailed: "bg-purple-500/10 text-purple-400 border-purple-500/30",
};

type Task = {
  id: string;
  parent_id: string | null;
  agent_role: string;
  assigned_by: string;
  title: string;
  brief: string | null;
  plan: string | null;
  execution_output: string | null;
  status: string;
  priority: string;
  email_to: string | null;
  emailed_at: string | null;
  tags: string[];
  created_at: string;
  completed_at: string | null;
};

export function AgentTeamPanel({ token }: { token: string }) {
  const [prompt, setPrompt] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filterRole, setFilterRole] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const qc = useQueryClient();

  const listFn = useServerFn(adminListAgentTasks);
  const updateFn = useServerFn(adminUpdateAgentTask);
  const deleteFn = useServerFn(adminDeleteAgentTask);
  const statsFn = useServerFn(adminAgentTaskStats);

  const { data: tasks = [], refetch } = useQuery({
    queryKey: ["admin-agent-tasks", filterRole, filterStatus],
    queryFn: () =>
      listFn({
        data: {
          token,
          agent_role: filterRole || undefined,
          status: filterStatus || undefined,
        },
      }) as Promise<Task[]>,
  });

  const { data: stats } = useQuery({
    queryKey: ["admin-agent-task-stats"],
    queryFn: () => statsFn({ data: { token } }),
    refetchInterval: 5000,
  });

  const updateMut = useMutation({
    mutationFn: (v: { id: string; status?: string; emailed_at?: string | null }) =>
      updateFn({ data: { token, ...v } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-agent-tasks"] });
      qc.invalidateQueries({ queryKey: ["admin-agent-task-stats"] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { token, id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-agent-tasks"] });
      setSelectedTask(null);
    },
  });

  const chat = useChat({
    transport: new DefaultChatTransport({
      api: "/api/admin/agent-team-chat",
      body: { token },
    }),
    onFinish: () => {
      refetch();
      qc.invalidateQueries({ queryKey: ["admin-agent-task-stats"] });
    },
  });

  const send = () => {
    const text = prompt.trim();
    if (!text || chat.status === "streaming" || chat.status === "submitted") return;
    chat.sendMessage({ text });
    setPrompt("");
  };

  const copyPlan = (t: Task) => {
    const body = `Task: ${t.title}\nAgent: ${ROLE_LABELS[t.agent_role] ?? t.agent_role}\nStatus: ${t.status}\n\n--- BRIEF ---\n${t.brief ?? ""}\n\n--- PLAN ---\n${t.plan ?? ""}\n\n--- OUTPUT ---\n${t.execution_output ?? "(pending)"}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(body).catch(() => {});
    }
    window.alert("Plan copied to clipboard. Paste into an email to cartooninverse5@gmail.com.");
  };

  const mailto = (t: Task) => {
    const subject = encodeURIComponent(`[Agent Plan] ${ROLE_LABELS[t.agent_role] ?? t.agent_role}: ${t.title}`);
    const body = encodeURIComponent(
      `Agent: ${ROLE_LABELS[t.agent_role] ?? t.agent_role}\nStatus: ${t.status}\nPriority: ${t.priority}\n\nBRIEF:\n${t.brief ?? ""}\n\nPLAN:\n${t.plan ?? ""}\n\nEXECUTION:\n${t.execution_output ?? "(queued for human)"}`,
    );
    window.open(`mailto:cartooninverse5@gmail.com?subject=${subject}&body=${body}`, "_blank");
    updateMut.mutate({ id: t.id, status: "emailed", emailed_at: new Date().toISOString() });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
      {/* CEO chat */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-3 flex items-baseline justify-between">
          <div>
            <h3 className="font-display text-xl">CEO Agent · Team Orchestrator</h3>
            <p className="text-xs text-muted-foreground">
              Assigns work to 15 specialist agents. Text deliverables execute in-line;
              build/deploy tasks queue for cartooninverse5@gmail.com.
            </p>
          </div>
          {stats && (
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {stats.total} tasks · {stats.byStatus.done ?? 0} done · {stats.byStatus.pending_email ?? 0} pending
            </div>
          )}
        </div>

        <div className="h-[420px] overflow-y-auto rounded-lg border border-border/60 bg-background p-3 space-y-3">
          {chat.messages.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Try: "Ship a launch plan for the AI Autopilot feature — spec, landing copy, SEO brief,
              deploy checklist." — CEO will delegate to PM, copywriter, SEO, CTO, and dev, plan each,
              and queue what needs human hands.
            </p>
          )}
          {chat.messages.map((m) => (
            <div
              key={m.id}
              className={`text-sm rounded-md p-2.5 ${
                m.role === "user"
                  ? "bg-primary/10 border border-primary/20"
                  : "bg-muted/40 border border-border/40"
              }`}
            >
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                {m.role === "user" ? "You" : "CEO Agent"}
              </div>
              {m.parts.map((p, i) => {
                if (p.type === "text") {
                  return (
                    <div key={i} className="prose prose-sm prose-invert max-w-none">
                      <ReactMarkdown>{p.text}</ReactMarkdown>
                    </div>
                  );
                }
                if (p.type.startsWith("tool-")) {
                  const toolName = p.type.replace("tool-", "");
                  return (
                    <div key={i} className="mt-1 text-[11px] text-muted-foreground italic">
                      🛠 {toolName}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          ))}
          {(chat.status === "streaming" || chat.status === "submitted") && (
            <div className="text-xs text-muted-foreground animate-pulse">Team working…</div>
          )}
        </div>

        <div className="mt-3 flex gap-2">
          <input
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
            placeholder="Give CEO Agent a goal…"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button
            onClick={send}
            disabled={chat.status === "streaming" || chat.status === "submitted"}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>

      {/* Task board */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-xl">Task Board</h3>
          <div className="flex gap-2">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="rounded-md border border-border bg-background px-2 py-1 text-xs"
            >
              <option value="">All agents</option>
              {Object.entries(ROLE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-md border border-border bg-background px-2 py-1 text-xs"
            >
              <option value="">All status</option>
              <option value="planned">Planned</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
              <option value="pending_email">Pending email</option>
              <option value="emailed">Emailed</option>
            </select>
          </div>
        </div>

        <div className="h-[500px] overflow-y-auto space-y-2">
          {tasks.length === 0 && (
            <p className="text-xs text-muted-foreground">No tasks yet. Ask the CEO agent to plan something.</p>
          )}
          {tasks.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTask(t)}
              className="w-full text-left rounded-lg border border-border bg-background p-3 hover:border-primary/40 transition"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-medium uppercase tracking-widest text-primary">
                  {ROLE_LABELS[t.agent_role] ?? t.agent_role}
                </span>
                <span
                  className={`text-[10px] rounded-full border px-2 py-0.5 ${STATUS_STYLES[t.status] ?? "border-border text-muted-foreground"}`}
                >
                  {t.status.replace("_", " ")}
                </span>
              </div>
              <p className="mt-1 text-sm font-medium line-clamp-1">{t.title}</p>
              {t.brief && (
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{t.brief}</p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Task detail modal */}
      {selectedTask && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedTask(null)}
        >
          <div
            className="max-w-3xl w-full max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-card p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-primary">
                  {ROLE_LABELS[selectedTask.agent_role] ?? selectedTask.agent_role} · {selectedTask.priority}
                </div>
                <h4 className="font-display text-2xl mt-1">{selectedTask.title}</h4>
              </div>
              <span
                className={`text-xs rounded-full border px-2.5 py-1 ${STATUS_STYLES[selectedTask.status] ?? "border-border"}`}
              >
                {selectedTask.status.replace("_", " ")}
              </span>
            </div>

            {selectedTask.brief && (
              <section className="mt-5">
                <h5 className="text-[10px] uppercase tracking-widest text-muted-foreground">Brief</h5>
                <p className="mt-1 text-sm whitespace-pre-wrap">{selectedTask.brief}</p>
              </section>
            )}

            {selectedTask.plan && (
              <section className="mt-5">
                <h5 className="text-[10px] uppercase tracking-widest text-muted-foreground">Plan</h5>
                <div className="mt-1 prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown>{selectedTask.plan}</ReactMarkdown>
                </div>
              </section>
            )}

            {selectedTask.execution_output && (
              <section className="mt-5">
                <h5 className="text-[10px] uppercase tracking-widest text-muted-foreground">Deliverable</h5>
                <div className="mt-1 prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown>{selectedTask.execution_output}</ReactMarkdown>
                </div>
              </section>
            )}

            <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-4">
              <button
                onClick={() => mailto(selectedTask)}
                className="rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground"
              >
                Email plan to admin
              </button>
              <button
                onClick={() => copyPlan(selectedTask)}
                className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-accent"
              >
                Copy plan
              </button>
              {selectedTask.status !== "done" && (
                <button
                  onClick={() => updateMut.mutate({ id: selectedTask.id, status: "done" })}
                  className="rounded-lg border border-emerald-500/40 text-emerald-400 px-3 py-1.5 text-sm hover:bg-emerald-500/10"
                >
                  Mark done
                </button>
              )}
              {selectedTask.status !== "in_progress" && (
                <button
                  onClick={() => updateMut.mutate({ id: selectedTask.id, status: "in_progress" })}
                  className="rounded-lg border border-amber-500/40 text-amber-400 px-3 py-1.5 text-sm hover:bg-amber-500/10"
                >
                  In progress
                </button>
              )}
              <button
                onClick={() => {
                  if (window.confirm("Delete this task?")) deleteMut.mutate(selectedTask.id);
                }}
                className="ml-auto rounded-lg border border-destructive/40 text-destructive px-3 py-1.5 text-sm hover:bg-destructive/10"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedTask(null)}
                className="rounded-lg border border-border px-3 py-1.5 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
