import { createFileRoute } from "@tanstack/react-router";
import { Briefcase } from "lucide-react";
import { FeatureShell } from "@/components/feature-shell";

export const Route = createFileRoute("/_authenticated/jobs")({
  component: JobsPage,
});

function JobsPage() {
  return (
    <FeatureShell
      eyebrow="Opportunity / Off-campus"
      icon={Briefcase}
      title="Every off-campus drive,"
      italic="one feed."
      body="Curated + auto-fetched off-campus roles for freshers and interns, filtered by your skill match. Stop refreshing Telegram groups — we watch the sources so you don't have to."
      highlights={[
        { label: "Sources", value: "Naukri · Wellfound · HR posts · Referrals" },
        { label: "Match", value: "Ranked by your GitHub + resume stack" },
        { label: "Cadence", value: "Fresh drives every hour" },
      ]}
    />
  );
}
