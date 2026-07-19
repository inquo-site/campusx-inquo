import { createFileRoute } from "@tanstack/react-router";
import {
  convertToModelMessages,
  streamText,
  tool,
  stepCountIs,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const ADMIN_SECRET = "SUMAN@12suman";
const NOTIFY_EMAIL = "cartooninverse5@gmail.com";

const AGENT_ROLES = [
  "ceo",
  "co_founder",
  "cto",
  "product_manager",
  "fullstack_developer",
  "system_designer",
  "ux_designer",
  "ui_designer",
  "bug_fixer",
  "feature_planner",
  "marketer",
  "digital_marketer",
  "seo_specialist",
  "content_writer",
  "copywriter",
] as const;

const AGENT_BRIEFS: Record<string, string> = {
  ceo: "Sets vision, prioritizes bets, breaks big goals into agent-specific tasks and delegates.",
  co_founder: "Sanity-checks strategy, spots gaps, argues trade-offs with CEO.",
  cto: "Owns architecture, tech choices, scale, and system risk.",
  product_manager: "Turns strategy into a shippable spec, user stories, acceptance criteria.",
  fullstack_developer: "Implements features end-to-end (React + TanStack + Supabase).",
  system_designer: "Designs data models, APIs, event flows, and reliability plans.",
  ux_designer: "Maps user journeys, IA, and interaction patterns.",
  ui_designer: "Defines visual design, layout, tokens, and micro-interactions.",
  bug_fixer: "Roots-causes issues from logs/repro, proposes minimal fixes.",
  feature_planner: "Discovers feature ideas from analytics/feedback and prioritizes.",
  marketer: "Positioning, messaging, launch plans, growth loops.",
  digital_marketer: "Paid + organic campaigns, funnels, retargeting.",
  seo_specialist: "Keyword strategy, on-page SEO, technical SEO, content briefs.",
  content_writer: "Long-form blog posts, guides, tutorials for the Campus X audience.",
  copywriter: "Landing copy, ad copy, email copy, CTAs, product microcopy.",
};

export const Route = createFileRoute("/api/admin/agent-team-chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { messages?: UIMessage[]; token?: string };
        if (body.token !== ADMIN_SECRET) return new Response("Forbidden", { status: 403 });
        if (!Array.isArray(body.messages))
          return new Response("messages required", { status: 400 });

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-2.5-flash");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Every request in this chat call = one "run". Tool calls get logged to it.
        const runId = crypto.randomUUID();

        // Roles whose tasks must be approved before execution/email
        const APPROVAL_REQUIRED_ROLES = new Set([
          "fullstack_developer",
          "cto",
          "system_designer",
          "bug_fixer",
        ]);

        async function logToolCall(
          toolName: string,
          input: unknown,
          output: unknown,
          error: string | null,
          durationMs: number,
          taskId?: string,
          agentRole?: string,
        ) {
          try {
            await supabaseAdmin.from("admin_agent_tool_calls").insert({
              run_id: runId,
              task_id: taskId ?? null,
              agent_role: agentRole ?? null,
              tool_name: toolName,
              input: (input ?? {}) as never,
              output: (output ?? null) as never,
              error,
              duration_ms: durationMs,
            });
          } catch {
            /* swallow logging errors */
          }
        }

        const AgentRoleSchema = z.enum(AGENT_ROLES);

        const tools = {
          listAgents: tool({
            description: "List every available agent role and what they do.",
            inputSchema: z.object({}),
            execute: async () => {
              const t0 = Date.now();
              const out = { agents: AGENT_BRIEFS };
              await logToolCall("listAgents", {}, out, null, Date.now() - t0);
              return out;
            },
          }),

          getPlatformStats: tool({
            description: "Get platform counts (users, blogs, rooms, jobs, projects).",
            inputSchema: z.object({}),
            execute: async () => {
              const t0 = Date.now();
              const [users, blogs, rooms, msgs, jobs, projects] = await Promise.all([
                supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
                supabaseAdmin.from("blogs").select("*", { count: "exact", head: true }),
                supabaseAdmin.from("rooms").select("*", { count: "exact", head: true }),
                supabaseAdmin.from("room_messages").select("*", { count: "exact", head: true }),
                supabaseAdmin.from("internships").select("*", { count: "exact", head: true }),
                supabaseAdmin.from("projects").select("*", { count: "exact", head: true }),
              ]);
              const out = {
                users: users.count ?? 0,
                blogs: blogs.count ?? 0,
                rooms: rooms.count ?? 0,
                messages: msgs.count ?? 0,
                jobs: jobs.count ?? 0,
                projects: projects.count ?? 0,
              };
              await logToolCall("getPlatformStats", {}, out, null, Date.now() - t0);
              return out;
            },
          }),

          assignTask: tool({
            description:
              "Assign a task to a specific agent role. Creates a task row. Dev/CTO/system_designer/bug_fixer tasks are automatically marked requires_approval — admin must approve before recordExecution or queueForHuman can send an email.",
            inputSchema: z.object({
              agent_role: AgentRoleSchema,
              title: z.string().min(3).max(200),
              brief: z.string().min(3).max(4000),
              priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
              parent_id: z.string().uuid().optional(),
              tags: z.array(z.string()).max(10).default([]),
            }),
            execute: async (input) => {
              const t0 = Date.now();
              const requiresApproval = APPROVAL_REQUIRED_ROLES.has(input.agent_role);
              const { data, error } = await supabaseAdmin
                .from("admin_agent_tasks")
                .insert({
                  agent_role: input.agent_role,
                  title: input.title,
                  brief: input.brief,
                  priority: input.priority,
                  parent_id: input.parent_id,
                  tags: input.tags,
                  status: "planned",
                  assigned_by: "ceo",
                  run_id: runId,
                  requires_approval: requiresApproval,
                  approval_status: requiresApproval ? "pending" : "auto",
                })
                .select("id")
                .single();
              const out = error
                ? { ok: false as const, error: error.message }
                : {
                    ok: true as const,
                    task_id: data.id,
                    agent_role: input.agent_role,
                    requires_approval: requiresApproval,
                  };
              await logToolCall(
                "assignTask",
                input,
                out,
                error?.message ?? null,
                Date.now() - t0,
                data?.id,
                input.agent_role,
              );
              return out;
            },
          }),

          draftPlan: tool({
            description:
              "Attach a step-by-step plan (markdown) to an existing task. Include: goal, steps, deliverables, dependencies, risks.",
            inputSchema: z.object({
              task_id: z.string().uuid(),
              plan_markdown: z.string().min(20).max(20000),
            }),
            execute: async (input) => {
              const t0 = Date.now();
              const { error } = await supabaseAdmin
                .from("admin_agent_tasks")
                .update({ plan: input.plan_markdown, status: "planned" })
                .eq("id", input.task_id);
              const out = error ? { ok: false, error: error.message } : { ok: true };
              await logToolCall(
                "draftPlan",
                { task_id: input.task_id, plan_length: input.plan_markdown.length },
                out,
                error?.message ?? null,
                Date.now() - t0,
                input.task_id,
              );
              return out;
            },
          }),

          recordExecution: tool({
            description:
              "Store final deliverable and mark task done. BLOCKED if task requires_approval and approval_status != 'approved'. Use only for text/spec/copy/design deliverables.",
            inputSchema: z.object({
              task_id: z.string().uuid(),
              output_markdown: z.string().min(10).max(60000),
            }),
            execute: async (input) => {
              const t0 = Date.now();
              const { data: task } = await supabaseAdmin
                .from("admin_agent_tasks")
                .select("requires_approval, approval_status")
                .eq("id", input.task_id)
                .maybeSingle();
              if (task?.requires_approval && task?.approval_status !== "approved") {
                const out = {
                  ok: false as const,
                  blocked: true as const,
                  reason: "Requires admin approval before execution.",
                };
                await logToolCall(
                  "recordExecution",
                  { task_id: input.task_id },
                  out,
                  "blocked_pending_approval",
                  Date.now() - t0,
                  input.task_id,
                );
                return out;
              }
              const { error } = await supabaseAdmin
                .from("admin_agent_tasks")
                .update({
                  execution_output: input.output_markdown,
                  status: "done",
                  completed_at: new Date().toISOString(),
                })
                .eq("id", input.task_id);
              const out = error ? { ok: false, error: error.message } : { ok: true };
              await logToolCall(
                "recordExecution",
                { task_id: input.task_id, output_length: input.output_markdown.length },
                out,
                error?.message ?? null,
                Date.now() - t0,
                input.task_id,
              );
              return out;
            },
          }),

          queueForHuman: tool({
            description:
              "For tasks the AI cannot execute (deploys, code, ad spend). Marks pending_email. Admin still has to approve before an actual send.",
            inputSchema: z.object({
              task_id: z.string().uuid(),
              reason: z.string().max(500).optional(),
            }),
            execute: async (input) => {
              const t0 = Date.now();
              // Force approval gate for anything queued for human hands
              const { error } = await supabaseAdmin
                .from("admin_agent_tasks")
                .update({
                  status: "pending_email",
                  email_to: NOTIFY_EMAIL,
                  requires_approval: true,
                  approval_status: "pending",
                  metadata: { queued_reason: input.reason ?? "requires human execution" },
                })
                .eq("id", input.task_id);
              const out = error
                ? { ok: false, error: error.message }
                : { ok: true, email_to: NOTIFY_EMAIL, pending_approval: true };
              await logToolCall(
                "queueForHuman",
                input,
                out,
                error?.message ?? null,
                Date.now() - t0,
                input.task_id,
              );
              return out;
            },
          }),

          summarizeRun: tool({
            description: "Summary of tasks in this run: counts, per-agent, done, pending approval.",
            inputSchema: z.object({}),
            execute: async () => {
              const t0 = Date.now();
              const { data } = await supabaseAdmin
                .from("admin_agent_tasks")
                .select("agent_role, status, approval_status")
                .eq("run_id", runId);
              const byStatus: Record<string, number> = {};
              const byRole: Record<string, number> = {};
              const byApproval: Record<string, number> = {};
              for (const r of data ?? []) {
                byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
                byRole[r.agent_role] = (byRole[r.agent_role] ?? 0) + 1;
                byApproval[r.approval_status ?? "auto"] = (byApproval[r.approval_status ?? "auto"] ?? 0) + 1;
              }
              const out = { run_id: runId, byStatus, byRole, byApproval, total: data?.length ?? 0 };
              await logToolCall("summarizeRun", {}, out, null, Date.now() - t0);
              return out;
            },
          }),
        };

        const system = `You are the CEO Agent orchestrating the Campus X AI product team.

Your team (call listAgents any time to see full briefs):
${Object.entries(AGENT_BRIEFS)
  .map(([r, b]) => `- ${r}: ${b}`)
  .join("\n")}

WORKFLOW for every admin request:
1. Understand the goal. If broad, break it into sub-goals across the right agents.
2. For EACH sub-goal call assignTask(agent_role, title, brief) — one task per agent.
3. Immediately call draftPlan(task_id, plan_markdown) with a concrete plan for that task.
4. If the agent's output is text/spec/copy the AI can produce right now (writer, copywriter, SEO brief, UX flow doc, UI spec, PM spec, system design doc, bug root-cause doc), also call recordExecution(task_id, output_markdown) with the finished deliverable.
5. If the task needs real code deploys, DB migrations, ad-spend, or anything the AI cannot perform, call queueForHuman(task_id, reason) — this queues it for ${NOTIFY_EMAIL}.
6. End with summarizeRun and a crisp bullet report to the admin: "Assigned X tasks. Y done. Z pending human. Details in admin panel."

Rules:
- Never invent metrics — call getPlatformStats first if you need numbers.
- Every agent you mention MUST have an assignTask + draftPlan call. No hand-wavy delegation.
- Deliverables in recordExecution must be complete, publish-ready content (not "TODO" stubs).
- Prefer Hinglish/casual tone in user-facing replies to the admin; keep task content professional.`;

        const result = streamText({
          model,
          system,
          messages: await convertToModelMessages(body.messages as UIMessage[]),
          tools,
          stopWhen: stepCountIs(80),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: body.messages as UIMessage[],
        });
      },
    },
  },
});
