import { createServerFn } from "@tanstack/react-start";

/** Last few auto-refresh runs, so the opportunity pages can show freshness. */
export const getOpportunityFreshness = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("opportunity_sync_runs")
    .select("id,status,enriched_count,note,created_at,finished_at")
    .order("created_at", { ascending: false })
    .limit(1);
  const last = data?.[0] ?? null;
  return {
    lastRunAt: last?.finished_at ?? last?.created_at ?? null,
    status: last?.status ?? null,
    enriched: last?.enriched_count ?? 0,
  };
});

/** Manual "update now" — enriches a small batch of stale listings on demand. */
export const refreshOpportunitiesNow = createServerFn({ method: "POST" }).handler(async () => {
  const { runOpportunityRefresh } = await import("@/lib/opportunity-enrich.server");
  const { enriched, notes } = await runOpportunityRefresh({ limit: 3 });
  return { enriched, notes: notes.slice(0, 3) };
});
