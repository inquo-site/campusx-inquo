import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RefreshCw, Loader2, Radio } from "lucide-react";
import { toast } from "sonner";
import { getOpportunityFreshness, refreshOpportunitiesNow } from "@/lib/opportunities.functions";
import { timeAgo } from "@/lib/opportunity";

/** Freshness strip: shows when listings were last auto-updated + a manual trigger. */
export function OpportunityFreshness({ invalidateKey }: { invalidateKey: string }) {
  const qc = useQueryClient();
  const fetchFreshness = useServerFn(getOpportunityFreshness);
  const runRefresh = useServerFn(refreshOpportunitiesNow);

  const { data } = useQuery({
    queryKey: ["opportunity-freshness"],
    queryFn: () => fetchFreshness(),
    staleTime: 60_000,
  });

  const refresh = useMutation({
    mutationFn: () => runRefresh(),
    onSuccess: (r) => {
      toast.success(
        r.enriched > 0 ? `Updated ${r.enriched} listing${r.enriched > 1 ? "s" : ""}` : "Everything is already up to date",
      );
      qc.invalidateQueries({ queryKey: [invalidateKey] });
      qc.invalidateQueries({ queryKey: ["opportunity-freshness"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const ago = timeAgo(data?.lastRunAt);

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-2.5">
      <p className="inline-flex items-center gap-2 text-[11px] text-muted-foreground">
        <Radio className="h-3.5 w-3.5 text-gold" />
        Auto-updated daily — eligibility, skills, FAQ and timelines refresh on their own.
        {ago && <span className="text-foreground/70">Last update {ago}.</span>}
      </p>
      <button
        onClick={() => refresh.mutate()}
        disabled={refresh.isPending}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] text-foreground/80 transition hover:border-gold/40 hover:text-foreground disabled:opacity-60"
      >
        {refresh.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
        Update now
      </button>
    </div>
  );
}
