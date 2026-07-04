import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";
import { FeatureShell } from "@/components/feature-shell";

export const Route = createFileRoute("/_authenticated/applications")({
  component: ApplicationsPage,
});

function ApplicationsPage() {
  return (
    <FeatureShell
      eyebrow="Opportunity / Tracker"
      icon={ClipboardList}
      title="Every application,"
      italic="one dashboard."
      body="Track applied · in-review · interview · offer · rejected across jobs, internships and hackathons. Deadlines, follow-ups, and round notes in one place."
      highlights={[
        { label: "Pipeline", value: "Applied → OA → Interview → Offer" },
        { label: "Reminders", value: "Deadline + follow-up nudges" },
        { label: "Notes", value: "Per-round prep + questions asked" },
      ]}
    />
  );
}
