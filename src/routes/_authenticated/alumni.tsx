import { createFileRoute } from "@tanstack/react-router";
import { Users2 } from "lucide-react";
import { FeatureShell } from "@/components/feature-shell";

export const Route = createFileRoute("/_authenticated/alumni")({
  component: AlumniPage,
});

function AlumniPage() {
  return (
    <FeatureShell
      eyebrow="Network / Referrals"
      icon={Users2}
      title="Warm intros,"
      italic="not cold DMs."
      body="Match with alumni already at your target companies. Send a structured referral request, they approve, you skip the resume-black-hole. Your unfair advantage."
      highlights={[
        { label: "Match", value: "By college · company · role" },
        { label: "Flow", value: "Request → Approve → Intro" },
        { label: "Trust", value: "Verified alumni only" },
      ]}
    />
  );
}
