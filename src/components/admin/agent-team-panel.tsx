import { useState, useMemo } from "react";
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
  adminApproveTask,
  adminRejectTask,
  adminListToolCalls,
  adminSendTaskEmail,
  adminRetrySendTaskEmail,
  adminListTaskDeliveries,
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
  rejected: "bg-red-500/10 text-red-400 border-red-500/30",
};

const APPROVAL_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  rejected: "bg-red-500/10 text-red-400 border-red-500/30",
  auto: "bg-muted text-muted-foreground border-border",
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
  run_id: string | null;
  requires_approval: boolean;
  approval_status: string;
  approved_at: string | null;
  approved_by: string | null;
  email_status: string | null;
  email_attempts: number;
  email_last_error: string | null;
  email_last_attempt_at: string | null;
};

type ToolCall = {
  id: string;
  run_id: string | null;
  task_id: string | null;
  agent_role: string | null;
  tool_name: string;
  input: unknown;
  output: unknown;
  error: string | null;
  duration_ms: number | null;
  created_at: string;
};

type Delivery = {
  id: string;
  recipient: string;
  subject: string;
  status: string;
  attempts: number;
  provider: string | null;
  provider_message_id: string | null;
  last_error: string | null;
  created_at: string;
};

const NOTIFY_EMAIL = "cartooninverse5@gmail.com";

export function AgentTeamPanel({ token }: { token: string }) {
  const [prompt, setPrompt] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterApproval, setFilterApproval] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const qc = useQueryClient();

  const listFn = useServerFn(adminListAgentTasks);
  const updateFn = useServerFn(adminUpdateAgentTask);
  const deleteFn = useServerFn(adminDeleteAgentTask);
  const statsFn = useServerFn(adminAgentTaskStats);
  const approveFn = useServerFn(adminApproveTask);
  const rejectFn = useServerFn(adminRejectTask);
  const toolCallsFn = useServerFn(adminListToolCalls);
  const sendEmailFn = useServerFn(adminSendTaskEmail);
  const retryEmailFn = useServerFn(adminRetrySendTaskEmail);
  const deliveriesFn = useServerFn(adminListTaskDeliveries);

  const { data: tasks = [], refetch } = useQuery({
    queryKey: [
      "admin-agent-tasks",
      filterRole,
      filterStatus,
      filterApproval,
      search,
      dateFrom,
      dateTo,
    ],
    queryFn: () =>
      listFn({
        data: {
          token,
          agent_role: filterRole || undefined,
          status: filterStatus || undefined,
          approval_status: filterApproval || undefined,
          search: search || undefined,
          from: dateFrom ? new Date(dateFrom).toISOString() : undefined,
          to: dateTo ? new Date(dateTo + "T23:59:59").toISOString() : undefined,
        },
      }) as Promise<Task[]>,
  });

  const { data: stats } = useQuery({
    queryKey: ["admin-agent-task-stats"],
    queryFn: () => statsFn({ data: { token } }),
    refetchInterval: 5000,
  });

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ["admin-agent-tasks"] });
    qc.invalidateQueries({ queryKey: ["admin-agent-task-stats"] });
    if (selectedTask) {
      qc.invalidateQueries({ queryKey: ["task-tool-calls", selectedTask.id] });
      qc.invalidateQueries({ queryKey: ["task-deliveries", selectedTask.id] });
    }
  };

  const updateMut = useMutation({
    mutationFn: (v: { id: string; status?: string; emailed_at?: string | null }) =>
      updateFn({ data: { token, ...v } }),
    onSuccess: invalidateAll,
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { token, id } }),
    onSuccess: () => {
      invalidateAll();
      setSelectedTask(null);
    },
  });

  const approveMut = useMutation({
    mutationFn: (id: string) => approveFn({ data: { token, id } }),
    onSuccess: (_, id) => {
      invalidateAll();
      if (selectedTask?.id === id) {
        setSelectedTask((t) => (t ? { ...t, approval_status: "approved" } : t));
      }
    },
  });

  const rejectMut = useMutation({
    mutationFn: (v: { id: string; reason?: string }) => rejectFn({ data: { token, ...v } }),
    onSuccess: invalidateAll,
  });

  const sendEmailMut = useMutation({
    mutationFn: (id: string) => sendEmailFn({ data: { token, task_id: id } }),
    onSuccess: invalidateAll,
  });

  const retryEmailMut = useMutation({
    mutationFn: (delivery_id: string) => retryEmailFn({ data: { token, delivery_id } }),
    onSuccess: invalidateAll,
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

  const clearFilters = () => {
    setFilterRole("");
    setFilterStatus("");
    setFilterApproval("");
    setSearch("");
    setDateFrom("");
    setDateTo("");
  };

  const anyFilter = filterRole || filterStatus || filterApproval || search || dateFrom || dateTo;

  const pendingApprovalCount = stats?.byApproval?.pending ?? 0;

  return (
    <div className="space-y-6">
      {pendingApprovalCount > 0 && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-amber-300 flex items-center justify-between">
          <span>
            <strong>{pendingApprovalCount}</strong> task{pendingApprovalCount === 1 ? "" : "s"} waiting for your approval before the AI can execute or email them.
          </span>
          <button
            className="text-xs underline"
            onClick={() => {
              setFilterApproval("pending");
              setFilterRole("");
              setFilterStatus("");
              setSearch("");
            }}
          >
            Show pending
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        {/* CEO chat */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex items-baseline justify-between">
            <div>
              <h3 className="font-display text-xl">CEO Agent · Team Orchestrator</h3>
              <p className="text-xs text-muted-foreground">
                Dev / CTO / system-design / bug-fix tasks require your approval before the AI runs or emails them.
              </p>
            </div>
            {stats && (
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {stats.total} tasks · {stats.byStatus.done ?? 0} done · {pendingApprovalCount} pending
              </div>
            )}
          </div>

          <div className="h-[420px] overflow-y-auto rounded-lg border border-border/60 bg-background p-3 space-y-3">
            {chat.messages.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Try: "Ship a launch plan for the AI Autopilot feature — spec, landing copy, SEO brief, deploy checklist."
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
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {tasks.length} match{tasks.length === 1 ? "" : "es"}
            </div>
          </div>

          {/* Filters */}
          <div className="mb-3 grid grid-cols-2 gap-2">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title / brief / plan / output…"
              className="col-span-2 rounded-md border border-border bg-background px-3 py-1.5 text-xs"
            />
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
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={filterApproval}
              onChange={(e) => setFilterApproval(e.target.value)}
              className="rounded-md border border-border bg-background px-2 py-1 text-xs"
            >
              <option value="">All approval</option>
              <option value="pending">Pending approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="auto">Auto (no gate)</option>
            </select>
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
              />
              <span className="text-xs text-muted-foreground">→</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
              />
            </div>
            {anyFilter && (
              <button
                onClick={clearFilters}
                className="col-span-2 text-xs text-muted-foreground hover:text-foreground underline"
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="h-[460px] overflow-y-auto space-y-2">
            {tasks.length === 0 && (
              <p className="text-xs text-muted-foreground">No tasks match these filters.</p>
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
                  <div className="flex items-center gap-1">
                    {t.requires_approval && (
                      <span
                        className={`text-[10px] rounded-full border px-2 py-0.5 ${APPROVAL_STYLES[t.approval_status] ?? ""}`}
                      >
                        {t.approval_status}
                      </span>
                    )}
                    <span
                      className={`text-[10px] rounded-full border px-2 py-0.5 ${STATUS_STYLES[t.status] ?? "border-border text-muted-foreground"}`}
                    >
                      {t.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-sm font-medium line-clamp-1">{t.title}</p>
                <div className="mt-0.5 flex items-center justify-between gap-2">
                  {t.brief ? (
                    <p className="text-xs text-muted-foreground line-clamp-1 flex-1">{t.brief}</p>
                  ) : <span className="flex-1" />}
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {new Date(t.created_at).toLocaleDateString()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedTask && (
        <TaskDetail
          key={selectedTask.id}
          task={selectedTask}
          token={token}
          toolCallsFn={toolCallsFn}
          deliveriesFn={deliveriesFn}
          onClose={() => setSelectedTask(null)}
          onApprove={() => approveMut.mutate(selectedTask.id)}
          onReject={(reason) => rejectMut.mutate({ id: selectedTask.id, reason })}
          onSendEmail={() => sendEmailMut.mutate(selectedTask.id)}
          onRetryEmail={(delivery_id) => retryEmailMut.mutate(delivery_id)}
          onMarkStatus={(status) => updateMut.mutate({ id: selectedTask.id, status })}
          onDelete={() => {
            if (window.confirm("Delete this task?")) deleteMut.mutate(selectedTask.id);
          }}
          sending={sendEmailMut.isPending}
          retrying={retryEmailMut.isPending}
        />
      )}
    </div>
  );
}

function TaskDetail({
  task,
  token,
  toolCallsFn,
  deliveriesFn,
  onClose,
  onApprove,
  onReject,
  onSendEmail,
  onRetryEmail,
  onMarkStatus,
  onDelete,
  sending,
  retrying,
}: {
  task: Task;
  token: string;
  toolCallsFn: (a: { data: { token: string; task_id: string } }) => Promise<ToolCall[]>;
  deliveriesFn: (a: { data: { token: string; task_id: string } }) => Promise<Delivery[]>;
  onClose: () => void;
  onApprove: () => void;
  onReject: (reason?: string) => void;
  onSendEmail: () => void;
  onRetryEmail: (delivery_id: string) => void;
  onMarkStatus: (status: string) => void;
  onDelete: () => void;
  sending: boolean;
  retrying: boolean;
}) {
  const [tab, setTab] = useState<"content" | "timeline" | "email">("content");

  const { data: toolCalls = [] } = useQuery({
    queryKey: ["task-tool-calls", task.id],
    queryFn: () => toolCallsFn({ data: { token, task_id: task.id } }),
    enabled: tab === "timeline",
    refetchInterval: tab === "timeline" ? 5000 : false,
  });

  const { data: deliveries = [], refetch: refetchDeliveries } = useQuery({
    queryKey: ["task-deliveries", task.id],
    queryFn: () => deliveriesFn({ data: { token, task_id: task.id } }),
    enabled: tab === "email",
    refetchInterval: tab === "email" ? 5000 : false,
  });

  const isPending = task.approval_status === "pending";
  const isApproved = task.approval_status === "approved";

  const mailtoLink = useMemo(() => {
    const subject = encodeURIComponent(`[Agent Plan] ${ROLE_LABELS[task.agent_role] ?? task.agent_role}: ${task.title}`);
    const body = encodeURIComponent(
      `Agent: ${ROLE_LABELS[task.agent_role] ?? task.agent_role}\nStatus: ${task.status}\nPriority: ${task.priority}\n\nBRIEF:\n${task.brief ?? ""}\n\nPLAN:\n${task.plan ?? ""}\n\nEXECUTION:\n${task.execution_output ?? "(queued for human)"}`,
    );
    return `mailto:${task.email_to ?? NOTIFY_EMAIL}?subject=${subject}&body=${body}`;
  }, [task]);

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="max-w-4xl w-full max-h-[88vh] overflow-y-auto rounded-2xl border border-border bg-card p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-primary">
              {ROLE_LABELS[task.agent_role] ?? task.agent_role} · {task.priority}
            </div>
            <h4 className="font-display text-2xl mt-1">{task.title}</h4>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className={`text-xs rounded-full border px-2.5 py-1 ${STATUS_STYLES[task.status] ?? "border-border"}`}>
                {task.status.replace("_", " ")}
              </span>
              {task.requires_approval && (
                <span className={`text-xs rounded-full border px-2.5 py-1 ${APPROVAL_STYLES[task.approval_status] ?? ""}`}>
                  approval: {task.approval_status}
                </span>
              )}
              {task.email_status && (
                <span
                  className={`text-xs rounded-full border px-2.5 py-1 ${
                    task.email_status === "sent"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-red-500/10 text-red-400 border-red-500/30"
                  }`}
                >
                  email: {task.email_status}
                  {task.email_attempts > 1 ? ` · ${task.email_attempts} tries` : ""}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>

        {/* Approval banner */}
        {task.requires_approval && isPending && (
          <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-sm">
            <div className="font-medium text-amber-300">Approval required</div>
            <p className="text-xs text-muted-foreground mt-1">
              This is a {ROLE_LABELS[task.agent_role]} task — the AI won't execute or email it until you approve.
            </p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={onApprove}
                className="rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-3 py-1 text-xs hover:bg-emerald-500/30"
              >
                Approve
              </button>
              <button
                onClick={() => {
                  const reason = window.prompt("Reason for rejection (optional)?") ?? undefined;
                  onReject(reason);
                }}
                className="rounded-md bg-red-500/10 border border-red-500/40 text-red-300 px-3 py-1 text-xs hover:bg-red-500/20"
              >
                Reject
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mt-4 flex gap-1 border-b border-border">
          {(["content", "timeline", "email"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`px-3 py-1.5 text-xs uppercase tracking-widest border-b-2 -mb-px ${
                tab === k ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {k}
            </button>
          ))}
        </div>

        {tab === "content" && (
          <div className="mt-4 space-y-5">
            {task.brief && (
              <section>
                <h5 className="text-[10px] uppercase tracking-widest text-muted-foreground">Brief</h5>
                <p className="mt-1 text-sm whitespace-pre-wrap">{task.brief}</p>
              </section>
            )}
            {task.plan && (
              <section>
                <h5 className="text-[10px] uppercase tracking-widest text-muted-foreground">Plan</h5>
                <div className="mt-1 prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown>{task.plan}</ReactMarkdown>
                </div>
              </section>
            )}
            {task.execution_output && (
              <section>
                <h5 className="text-[10px] uppercase tracking-widest text-muted-foreground">Deliverable</h5>
                <div className="mt-1 prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown>{task.execution_output}</ReactMarkdown>
                </div>
              </section>
            )}
          </div>
        )}

        {tab === "timeline" && (
          <div className="mt-4">
            {toolCalls.length === 0 && (
              <p className="text-xs text-muted-foreground">No tool-call activity recorded for this task yet.</p>
            )}
            <ol className="relative border-l border-border ml-2 space-y-3">
              {toolCalls.map((c) => (
                <li key={c.id} className="ml-4">
                  <span
                    className={`absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border ${
                      c.error ? "bg-red-500 border-red-500" : "bg-primary border-primary"
                    }`}
                  />
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    {new Date(c.created_at).toLocaleString()} · {c.duration_ms ?? 0} ms
                    {c.agent_role ? ` · ${ROLE_LABELS[c.agent_role] ?? c.agent_role}` : ""}
                  </div>
                  <div className="mt-0.5 text-sm font-mono">🛠 {c.tool_name}</div>
                  {c.error && (
                    <div className="mt-1 text-xs text-red-400">Error: {c.error}</div>
                  )}
                  <details className="mt-1">
                    <summary className="text-[11px] text-muted-foreground cursor-pointer hover:text-foreground">
                      input / output
                    </summary>
                    <pre className="mt-1 text-[11px] bg-background border border-border rounded p-2 overflow-x-auto whitespace-pre-wrap">
{JSON.stringify({ input: c.input, output: c.output }, null, 2)}
                    </pre>
                  </details>
                </li>
              ))}
            </ol>
          </div>
        )}

        {tab === "email" && (
          <div className="mt-4 space-y-4">
            <div className="rounded-lg border border-border bg-background p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Recipient</div>
                  <div className="font-mono">{task.email_to ?? NOTIFY_EMAIL}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={sending || (task.requires_approval && !isApproved)}
                    onClick={onSendEmail}
                    className="rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-xs disabled:opacity-50"
                    title={task.requires_approval && !isApproved ? "Approve first" : ""}
                  >
                    {sending ? "Sending…" : "Send now"}
                  </button>
                  <a
                    href={mailtoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-accent"
                  >
                    mailto fallback
                  </a>
                </div>
              </div>
              {task.email_last_error && (
                <p className="mt-2 text-xs text-red-400">
                  Last error: {task.email_last_error}
                </p>
              )}
              <p className="mt-2 text-[11px] text-muted-foreground">
                Automatic delivery needs a <code>RESEND_API_KEY</code> secret. Without it the button records a failed attempt with the exact reason and you can still use the mailto fallback.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Delivery attempts ({deliveries.length})
                </h5>
                <button
                  onClick={() => refetchDeliveries()}
                  className="text-[11px] text-muted-foreground hover:text-foreground"
                >
                  Refresh
                </button>
              </div>
              {deliveries.length === 0 && (
                <p className="text-xs text-muted-foreground">No send attempts yet.</p>
              )}
              <ul className="space-y-2">
                {deliveries.map((d) => (
                  <li key={d.id} className="rounded-md border border-border bg-background p-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] ${
                          d.status === "sent"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : d.status === "failed"
                            ? "bg-red-500/10 text-red-400 border-red-500/30"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {d.status} · {d.attempts} attempt{d.attempts === 1 ? "" : "s"}
                      </span>
                      <span className="text-muted-foreground">{new Date(d.created_at).toLocaleString()}</span>
                    </div>
                    <div className="mt-1 text-muted-foreground">
                      Provider: {d.provider ?? "—"}
                      {d.provider_message_id ? ` · id: ${d.provider_message_id}` : ""}
                    </div>
                    {d.last_error && (
                      <div className="mt-1 text-red-400">Error: {d.last_error}</div>
                    )}
                    {d.status !== "sent" && (
                      <button
                        disabled={retrying}
                        onClick={() => onRetryEmail(d.id)}
                        className="mt-2 rounded-md border border-border px-2 py-1 text-[11px] hover:bg-accent disabled:opacity-50"
                      >
                        {retrying ? "Retrying…" : "Retry send"}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-4">
          {task.status !== "done" && (
            <button
              onClick={() => onMarkStatus("done")}
              className="rounded-lg border border-emerald-500/40 text-emerald-400 px-3 py-1.5 text-sm hover:bg-emerald-500/10"
            >
              Mark done
            </button>
          )}
          {task.status !== "in_progress" && (
            <button
              onClick={() => onMarkStatus("in_progress")}
              className="rounded-lg border border-amber-500/40 text-amber-400 px-3 py-1.5 text-sm hover:bg-amber-500/10"
            >
              In progress
            </button>
          )}
          <button
            onClick={onDelete}
            className="ml-auto rounded-lg border border-destructive/40 text-destructive px-3 py-1.5 text-sm hover:bg-destructive/10"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-3 py-1.5 text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
