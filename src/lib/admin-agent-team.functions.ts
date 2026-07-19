import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ADMIN_SECRET = "SUMAN@12suman";
const NOTIFY_EMAIL = "cartooninverse5@gmail.com";
function verifyAdmin(token: string) {
  if (token !== ADMIN_SECRET) throw new Error("Forbidden");
}

export const adminListAgentTasks = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      token: string;
      status?: string;
      agent_role?: string;
      approval_status?: string;
      search?: string;
      from?: string;
      to?: string;
      limit?: number;
    }) =>
      z
        .object({
          token: z.string(),
          status: z.string().optional(),
          agent_role: z.string().optional(),
          approval_status: z.string().optional(),
          search: z.string().optional(),
          from: z.string().optional(),
          to: z.string().optional(),
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
    if (data.approval_status) q = q.eq("approval_status", data.approval_status);
    if (data.from) q = q.gte("created_at", data.from);
    if (data.to) q = q.lte("created_at", data.to);
    if (data.search && data.search.trim()) {
      const s = data.search.trim().replace(/[%_]/g, "\\$&");
      q = q.or(`title.ilike.%${s}%,brief.ilike.%${s}%,plan.ilike.%${s}%,execution_output.ilike.%${s}%`);
    }
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
      .select("status, agent_role, approval_status");
    if (error) throw new Error(error.message);
    const byStatus: Record<string, number> = {};
    const byRole: Record<string, number> = {};
    const byApproval: Record<string, number> = {};
    for (const r of rows ?? []) {
      byStatus[r.status as string] = (byStatus[r.status as string] ?? 0) + 1;
      byRole[r.agent_role as string] = (byRole[r.agent_role as string] ?? 0) + 1;
      const a = (r.approval_status as string) ?? "auto";
      byApproval[a] = (byApproval[a] ?? 0) + 1;
    }
    return { total: rows?.length ?? 0, byStatus, byRole, byApproval };
  });

/* -------------------- Approval workflow -------------------- */

export const adminApproveTask = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; id: string; approver?: string }) =>
    z.object({ token: z.string(), id: z.string().uuid(), approver: z.string().optional() }).parse(d),
  )
  .handler(async ({ data }) => {
    verifyAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("admin_agent_tasks")
      .update({
        approval_status: "approved",
        approved_at: new Date().toISOString(),
        approved_by: data.approver ?? "admin",
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminRejectTask = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; id: string; approver?: string; reason?: string }) =>
    z
      .object({
        token: z.string(),
        id: z.string().uuid(),
        approver: z.string().optional(),
        reason: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    verifyAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: existing } = await supabaseAdmin
      .from("admin_agent_tasks")
      .select("metadata")
      .eq("id", data.id)
      .maybeSingle();
    const md = (existing?.metadata as Record<string, unknown> | null) ?? {};
    const { error } = await supabaseAdmin
      .from("admin_agent_tasks")
      .update({
        approval_status: "rejected",
        approved_at: new Date().toISOString(),
        approved_by: data.approver ?? "admin",
        status: "rejected",
        metadata: { ...md, rejection_reason: data.reason ?? null },
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* -------------------- Execution timeline -------------------- */

export const adminListToolCalls = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; task_id?: string; run_id?: string; limit?: number }) =>
    z
      .object({
        token: z.string(),
        task_id: z.string().uuid().optional(),
        run_id: z.string().uuid().optional(),
        limit: z.number().min(1).max(500).default(200),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    verifyAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("admin_agent_tool_calls")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(data.limit);
    if (data.task_id) q = q.eq("task_id", data.task_id);
    if (data.run_id) q = q.eq("run_id", data.run_id);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

/* -------------------- Email delivery -------------------- */

async function trySendEmail(
  recipient: string,
  subject: string,
  body: string,
): Promise<{ ok: boolean; provider: string; message_id?: string; error?: string }> {
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const from = process.env.RESEND_FROM || "Campus X Admin <onboarding@resend.dev>";
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [recipient],
          subject,
          text: body,
        }),
      });
      const j = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
      if (!res.ok) return { ok: false, provider: "resend", error: j.message || `HTTP ${res.status}` };
      return { ok: true, provider: "resend", message_id: j.id };
    } catch (e) {
      return { ok: false, provider: "resend", error: e instanceof Error ? e.message : String(e) };
    }
  }
  return {
    ok: false,
    provider: "none",
    error:
      "No email provider configured. Set RESEND_API_KEY (and optional RESEND_FROM) to enable automatic delivery. The plan can still be sent via the mailto fallback.",
  };
}

export const adminSendTaskEmail = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; task_id: string; recipient?: string }) =>
    z
      .object({
        token: z.string(),
        task_id: z.string().uuid(),
        recipient: z.string().email().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    verifyAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: task, error: tErr } = await supabaseAdmin
      .from("admin_agent_tasks")
      .select("*")
      .eq("id", data.task_id)
      .maybeSingle();
    if (tErr) throw new Error(tErr.message);
    if (!task) throw new Error("Task not found");

    const recipient = data.recipient ?? task.email_to ?? NOTIFY_EMAIL;
    const subject = `[Agent Plan] ${task.agent_role}: ${task.title}`;
    const body =
      `Agent: ${task.agent_role}\nStatus: ${task.status}\nPriority: ${task.priority}\n\n` +
      `BRIEF:\n${task.brief ?? ""}\n\nPLAN:\n${task.plan ?? ""}\n\n` +
      `EXECUTION:\n${task.execution_output ?? "(queued for human)"}`;

    // Create delivery row first
    const { data: delivery, error: dErr } = await supabaseAdmin
      .from("admin_email_deliveries")
      .insert({
        task_id: task.id,
        recipient,
        subject,
        body,
        status: "sending",
        attempts: 1,
      })
      .select("*")
      .single();
    if (dErr) throw new Error(dErr.message);

    const send = await trySendEmail(recipient, subject, body);
    await supabaseAdmin
      .from("admin_email_deliveries")
      .update({
        attempts: 1,
        provider: send.provider,
        provider_message_id: send.message_id ?? null,
        last_error: send.error ?? null,
        status: send.ok ? "sent" : "failed",
      })
      .eq("id", delivery.id);

    await supabaseAdmin
      .from("admin_agent_tasks")
      .update({
        email_to: recipient,
        email_status: send.ok ? "sent" : "failed",
        email_attempts: (task.email_attempts ?? 0) + 1,
        email_last_error: send.error ?? null,
        email_last_attempt_at: new Date().toISOString(),
        emailed_at: send.ok ? new Date().toISOString() : task.emailed_at,
        status: send.ok ? "emailed" : task.status,
      })
      .eq("id", task.id);

    return {
      ok: send.ok,
      provider: send.provider,
      message_id: send.message_id,
      error: send.error,
      delivery_id: delivery.id,
    };
  });

export const adminRetrySendTaskEmail = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; delivery_id: string }) =>
    z.object({ token: z.string(), delivery_id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data }) => {
    verifyAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: d, error } = await supabaseAdmin
      .from("admin_email_deliveries")
      .select("*")
      .eq("id", data.delivery_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!d) throw new Error("Delivery not found");

    const send = await trySendEmail(d.recipient, d.subject, d.body);
    const nextAttempts = (d.attempts ?? 0) + 1;
    await supabaseAdmin
      .from("admin_email_deliveries")
      .update({
        attempts: nextAttempts,
        provider: send.provider,
        provider_message_id: send.message_id ?? null,
        last_error: send.error ?? null,
        status: send.ok ? "sent" : "failed",
      })
      .eq("id", d.id);

    if (d.task_id) {
      await supabaseAdmin
        .from("admin_agent_tasks")
        .update({
          email_status: send.ok ? "sent" : "failed",
          email_attempts: nextAttempts,
          email_last_error: send.error ?? null,
          email_last_attempt_at: new Date().toISOString(),
          emailed_at: send.ok ? new Date().toISOString() : undefined,
          status: send.ok ? "emailed" : undefined,
        })
        .eq("id", d.task_id);
    }
    return { ok: send.ok, provider: send.provider, error: send.error };
  });

export const adminListTaskDeliveries = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; task_id: string }) =>
    z.object({ token: z.string(), task_id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data }) => {
    verifyAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("admin_email_deliveries")
      .select("*")
      .eq("task_id", data.task_id)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });
