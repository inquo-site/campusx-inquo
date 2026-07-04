import { createFileRoute } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import { FeatureShell } from "@/components/feature-shell";

export const Route = createFileRoute("/_authenticated/hackathons")({
  component: HackathonsPage,
});

function HackathonsPage() {
  return (
    <FeatureShell
      eyebrow="Opportunity / Hackathons"
      icon={Trophy}
      title="Hackathons worth"
      italic="your weekend."
      body="Live listings pulled from Devfolio, Unstop and Hack2skill-style sources — filtered to your stack, your city, and the prize pools that actually clear."
      highlights={[
        { label: "Aggregated", value: "Devfolio · Unstop · Hack2skill · MLH" },
        { label: "Filter", value: "Stack · location · prize · team size" },
        { label: "Team-up", value: "Find hackmates from your college" },
      ]}
    />
  );
}
