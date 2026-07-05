import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ADMIN_SECRET = "SUMAN@12suman";
function verifyAdmin(token: string) {
  if (token !== ADMIN_SECRET) throw new Error("Forbidden");
}

export const adminListAgentEvents = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; limit?: number }) =>
    z.object({ token: z.string(), limit: z.number().min(1).max(200).default(50) }).parse(d),
  )
  .handler(async ({ data }) => {
    verifyAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("agent_events")
      .select("id, event_type, source_table, source_id, payload, status, created_at, dispatched_at")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminListAgentRuns = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; limit?: number }) =>
    z.object({ token: z.string(), limit: z.number().min(1).max(200).default(50) }).parse(d),
  )
  .handler(async ({ data }) => {
    verifyAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("agent_runs")
      .select("id, event_id, agent_name, event_type, input, output, status, error, duration_ms, created_at")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminTriggerDailyAnalytics = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string }) => z.object({ token: z.string() }).parse(d))
  .handler(async ({ data }) => {
    verifyAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [users, blogs, projects, jobs] = await Promise.all([
      supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("blogs").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("projects").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("internships").select("*", { count: "exact", head: true }),
    ]);
    const { error } = await supabaseAdmin.from("agent_events").insert({
      event_type: "cron.analytics_daily",
      source_table: "cron",
      source_id: `manual-${Date.now()}`,
      payload: {
        users: users.count ?? 0,
        blogs: blogs.count ?? 0,
        projects: projects.count ?? 0,
        jobs: jobs.count ?? 0,
      },
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
