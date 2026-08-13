import { createFileRoute } from "@tanstack/react-router";

// Scheduled endpoint (daily cron) that keeps the opportunity pages fresh:
// it fills in eligibility, required skills, requirements, FAQ and timeline
// for any listing that is new or older than the staleness window.
export const Route = createFileRoute("/api/public/hooks/refresh-opportunities")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as { limit?: number; force?: boolean };
        try {
          const { runOpportunityRefresh } = await import("@/lib/opportunity-enrich.server");
          const result = await runOpportunityRefresh({ limit: body.limit ?? 4, force: !!body.force });
          return Response.json({ ok: true, ...result });
        } catch (e) {
          return Response.json(
            { ok: false, error: e instanceof Error ? e.message : "refresh failed" },
            { status: 500 },
          );
        }
      },
      GET: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data } = await supabaseAdmin
          .from("opportunity_sync_runs")
          .select("id,kind,status,enriched_count,note,created_at,finished_at")
          .order("created_at", { ascending: false })
          .limit(5);
        return Response.json({ ok: true, runs: data ?? [] });
      },
    },
  },
});
