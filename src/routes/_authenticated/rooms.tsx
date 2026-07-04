import { createFileRoute } from "@tanstack/react-router";
import { MessagesSquare } from "lucide-react";
import { FeatureShell } from "@/components/feature-shell";

export const Route = createFileRoute("/_authenticated/rooms")({
  component: RoomsPage,
});

function RoomsPage() {
  return (
    <FeatureShell
      eyebrow="Network / Rooms"
      icon={MessagesSquare}
      title="Peer rooms that"
      italic="ship together."
      body="College-wise and interest-wise discussion rooms — text now, optional voice/video later. DSA grinders, GSoC hopefuls, ML tinkerers, indie hackers — find your people."
      highlights={[
        { label: "By college", value: "Private rooms per campus" },
        { label: "By interest", value: "DSA · ML · Web3 · Design · GSoC" },
        { label: "Live", value: "Optional voice/video rooms" },
      ]}
    />
  );
}
