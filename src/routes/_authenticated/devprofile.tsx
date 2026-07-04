import { createFileRoute } from "@tanstack/react-router";
import { Github } from "lucide-react";
import { FeatureShell } from "@/components/feature-shell";

export const Route = createFileRoute("/_authenticated/devprofile")({
  component: DevProfilePage,
});

function DevProfilePage() {
  return (
    <FeatureShell
      eyebrow="Network / Report card"
      icon={Github}
      title="Your public builder"
      italic="report card."
      body="Auto-synced GitHub + Codeforces, with LeetCode and LinkedIn added manually. One shareable URL that shows what you've actually built and solved — recruiters love it."
      highlights={[
        { label: "Auto-sync", value: "GitHub repos · stars · streak" },
        { label: "Auto-sync", value: "Codeforces rating + contests" },
        { label: "Manual", value: "LeetCode · LinkedIn · portfolio" },
      ]}
    />
  );
}
