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

        const AgentRoleSchema = z.enum(AGENT_ROLES);

        const tools = {
          listAgents: tool({
            description: "List every available agent role and what they do.",
            inputSchema: z.object({}),
            execute: async () => ({ agents: AGENT_BRIEFS }),
          }),

          getPlatformStats: tool({
            description: "Get platform counts (users, blogs, rooms, jobs, projects).",
            inputSchema: z.object({}),
            execute: async () => {
              const [users, blogs, rooms, msgs, jobs, projects] = await Promise.all([
                supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
                supabaseAdmin.from("blogs").select("*", { count: "exact", head: true }),
                supabaseAdmin.from("rooms").select("*", { count: "exact", head: true }),
                supabaseAdmin.from("room_messages").select("*", { count: "exact", head: true }),
                supabaseAdmin.from("internships").select("*", { count: "exact", head: true }),
                supabaseAdmin.from("projects").select("*", { count: "exact", head: true }),
              ]);
              return {
                users: users.count ?? 0,
                blogs: blogs.count ?? 0,
                rooms: rooms.count ?? 0,
                messages: msgs.count ?? 0,
                jobs: jobs.count ?? 0,
                projects: projects.count ?? 0,
              };
            },
          }),

          assignTask: tool({
            description:
              "CEO/Manager assigns a task to a specific agent role. Creates a new task row in status='planned'. Use this to delegate work. For each agent that must produce a plan, call assignTask AND then draftPlan.",
            inputSchema: z.object({
              agent_role: AgentRoleSchema,
              title: z.string().min(3).max(200),
              brief: z.string().min(3).max(4000),
              priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
              parent_id: z.string().uuid().optional(),
              tags: z.array(z.string()).max(10).default([]),
            }),
            execute: async (input) => {
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
                })
                .select("id")
                .single();
              if (error) return { ok: false, error: error.message };
              return { ok: true, task_id: data.id, agent_role: input.agent_role };
            },
          }),

          draftPlan: tool({
            description:
              "Attach a concrete step-by-step plan (markdown) to an existing task. The plan should include: goal, steps, deliverables, dependencies, risks. Use after assignTask.",
            inputSchema: z.object({
              task_id: z.string().uuid(),
              plan_markdown: z.string().min(20).max(20000),
            }),
            execute: async (input) => {
              const { error } = await supabaseAdmin
                .from("admin_agent_tasks")
                .update({ plan: input.plan_markdown, status: "planned" })
                .eq("id", input.task_id);
              if (error) return { ok: false, error: error.message };
              return { ok: true };
            },
          }),

          recordExecution: tool({
            description:
              "For agents whose work is text-only (writers, designers describing specs, marketers, SEO). Store the final deliverable and mark task done. For dev/build tasks that need real code changes, DO NOT call this — call queueForHuman instead.",
            inputSchema: z.object({
              task_id: z.string().uuid(),
              output_markdown: z.string().min(10).max(60000),
            }),
            execute: async (input) => {
              const { error } = await supabaseAdmin
                .from("admin_agent_tasks")
                .update({
                  execution_output: input.output_markdown,
                  status: "done",
                  completed_at: new Date().toISOString(),
                })
                .eq("id", input.task_id);
              if (error) return { ok: false, error: error.message };
              return { ok: true };
            },
          }),

          queueForHuman: tool({
            description:
              "For tasks the AI cannot execute directly (deploys, code changes, ad spend, external API calls). Marks the task as pending_email so the admin will send/apply it manually.",
            inputSchema: z.object({
              task_id: z.string().uuid(),
              reason: z.string().max(500).optional(),
            }),
            execute: async (input) => {
              const { error } = await supabaseAdmin
                .from("admin_agent_tasks")
                .update({
                  status: "pending_email",
                  email_to: NOTIFY_EMAIL,
                  metadata: { queued_reason: input.reason ?? "requires human execution" },
                })
                .eq("id", input.task_id);
              if (error) return { ok: false, error: error.message };
              return { ok: true, email_to: NOTIFY_EMAIL };
            },
          }),

          summarizeRun: tool({
            description:
              "Return a short overall summary of everything done in this run: how many tasks, per-agent breakdown, what's done, what's queued for the human.",
            inputSchema: z.object({}),
            execute: async () => {
              const { data } = await supabaseAdmin
                .from("admin_agent_tasks")
                .select("agent_role, status")
                .order("created_at", { ascending: false })
                .limit(100);
              const byStatus: Record<string, number> = {};
              const byRole: Record<string, number> = {};
              for (const r of data ?? []) {
                byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
                byRole[r.agent_role] = (byRole[r.agent_role] ?? 0) + 1;
              }
              return { last_100: { byStatus, byRole } };
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
