import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { streamText } from "ai";
import { AI_TEAMS, BUNDLE } from "@/lib/aios-teams";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const MODEL = "google/gemini-2.5-flash";

function findTeam(slug: string) {
  const team = AI_TEAMS.find((t) => t.slug === slug);
  if (!team) throw new Error("Unknown team");
  return team;
}

/** List the signed-in user's team tasks. */
export const listTeamTasks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { limit?: number }) =>
    z.object({ limit: z.number().min(1).max(100).default(30) }).parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("team_tasks")
      .select(
        "id, team_slug, agent_name, title, brief, status, plan, output, error, model, duration_ms, created_at, completed_at",
      )
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

/** Which teams the signed-in user actually has access to. */
export const listMyTeamAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: subs, error } = await context.supabase
      .from("ai_team_subscriptions")
      .select("team_slug, status, active_until")
      .eq("user_id", context.userId)
      .eq("status", "approved");
    if (error) throw new Error(error.message);
    const now = Date.now();
    const live = (subs ?? []).filter(
      (s) => !s.active_until || new Date(s.active_until).getTime() > now,
    );
    const hasBundle = live.some((s) => s.team_slug === BUNDLE.slug);
    const slugs = hasBundle ? AI_TEAMS.map((t) => t.slug) : live.map((s) => s.team_slug);
    return { hasBundle, slugs: Array.from(new Set(slugs)) };
  });

/**
 * Run a real task through a purchased AI team. The coordinator picks the right
 * agent (or uses the one the user chose) and produces a plan + deliverable.
 */
export const runTeamTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { teamSlug: string; agentName?: string; title: string; brief: string }) =>
    z
      .object({
        teamSlug: z.string(),
        agentName: z.string().optional(),
        title: z.string().min(3).max(200),
        brief: z.string().min(10).max(6000),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const team = findTeam(data.teamSlug);

    // Access gate — RLS-safe check as the signed-in user.
    const { data: allowed } = await context.supabase.rpc("has_team_access", {
      _user_id: context.userId,
      _team_slug: data.teamSlug,
    });
    if (!allowed) {
      return { ok: false as const, reason: "no_access" as const };
    }

    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not configured");

    const { data: task, error: insErr } = await context.supabase
      .from("team_tasks")
      .insert({
        user_id: context.userId,
        team_slug: team.slug,
        agent_name: data.agentName ?? null,
        title: data.title,
        brief: data.brief,
        status: "running",
        model: MODEL,
      })
      .select("id")
      .single();
    if (insErr || !task) throw new Error(insErr?.message ?? "Could not create task");

    const roster = team.agents
      .map((a) => `- ${a.name} (${a.role}): ${a.abilities.join("; ")}`)
      .join("\n");

    const system = `You are the coordinator of the "${team.name}" inside the Campus X AI Company OS.
Team focus: ${team.tagline}
Team capabilities: ${team.capabilities.join(", ")}

Agents on this team:
${roster}

Rules:
- ${data.agentName ? `The user asked for ${data.agentName} specifically — lead with that agent.` : "Pick the best-fit agent(s) for the brief and say who is doing what."}
- Output valid markdown with EXACTLY these sections:
  ## Assigned agents
  ## Plan
  ## Deliverable
  ## Next steps for you
- "Deliverable" must be real, finished work (code, copy, schema, spec, checklist) — never a TODO stub.
- Be concrete and practical for an Indian student-builder audience. Hinglish tone is fine in explanations, professional in the deliverable.`;

    const started = Date.now();
    try {
      // Streaming call consumed server-side: long runs must not sit buffered.
      const gateway = createLovableAiGatewayProvider(key);
      const result = streamText({
        model: gateway(MODEL),
        system,
        prompt: `Task title: ${data.title}\n\nBrief:\n${data.brief}`,
      });
      const text = await result.text;

      const planMatch = text.match(/## Plan\s+([\s\S]*?)(?=\n## |$)/);
      await context.supabase
        .from("team_tasks")
        .update({
          status: "done",
          output: text,
          plan: planMatch?.[1]?.trim() ?? null,
          duration_ms: Date.now() - started,
          completed_at: new Date().toISOString(),
        })
        .eq("id", task.id);

      return { ok: true as const, taskId: task.id, output: text };
    } catch (e) {
      const msg = (e as Error)?.message ?? "Unknown error";
      await context.supabase
        .from("team_tasks")
        .update({
          status: "error",
          error: msg.slice(0, 500),
          duration_ms: Date.now() - started,
        })
        .eq("id", task.id);
      return { ok: false as const, reason: "run_failed" as const, message: msg };
    }
  });

/** Delete one of the signed-in user's tasks. */
export const deleteTeamTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("team_tasks")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
