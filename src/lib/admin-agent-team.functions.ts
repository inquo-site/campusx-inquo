import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ADMIN_SECRET = "SUMAN@12suman";
function verifyAdmin(token: string) {
  if (token !== ADMIN_SECRET) throw new Error("Forbidden");
}

export const adminListAgentTasks = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; status?: string; agent_role?: string; limit?: number }) =>
    z
      .object({
        token: z.string(),
        status: z.string().optional(),
        agent_role: z.string().optional(),
        limit: z.number().min(1).max(500).default(200),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    verifyAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("admin_agent_tasks")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.status) q = q.eq("status", data.status);
    if (data.agent_role) q = q.eq("agent_role", data.agent_role);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminUpdateAgentTask = createServerFn({ method: "POST" })
  .inputValidator((d: {
    token: string;
    id: string;
    status?: string;
    execution_output?: string;
    emailed_at?: string | null;
  }) =>
    z
      .object({
        token: z.string(),
        id: z.string().uuid(),
        status: z.string().optional(),
        execution_output: z.string().optional(),
        emailed_at: z.string().nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    verifyAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patch: {
      status?: string;
      execution_output?: string;
      emailed_at?: string | null;
      completed_at?: string;
    } = {};
    if (data.status !== undefined) {
      patch.status = data.status;
      if (data.status === "done") patch.completed_at = new Date().toISOString();
    }
    if (data.execution_output !== undefined) patch.execution_output = data.execution_output;
    if (data.emailed_at !== undefined) patch.emailed_at = data.emailed_at;
    const { error } = await supabaseAdmin.from("admin_agent_tasks").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteAgentTask = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; id: string }) =>
    z.object({ token: z.string(), id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data }) => {
    verifyAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("admin_agent_tasks").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminAgentTaskStats = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string }) => z.object({ token: z.string() }).parse(d))
  .handler(async ({ data }) => {
    verifyAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("admin_agent_tasks")
      .select("status, agent_role");
    if (error) throw new Error(error.message);
    const byStatus: Record<string, number> = {};
    const byRole: Record<string, number> = {};
    for (const r of rows ?? []) {
      byStatus[r.status as string] = (byStatus[r.status as string] ?? 0) + 1;
      byRole[r.agent_role as string] = (byRole[r.agent_role as string] ?? 0) + 1;
    }
    return { total: rows?.length ?? 0, byStatus, byRole };
  });
