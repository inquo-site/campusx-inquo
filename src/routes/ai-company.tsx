import { createFileRoute } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing-layout";
import {
  AiosHero,
  AiosArchitecture,
  AiosWorkflow,
  AiosTeamsPricing,
  AiosFaq,
} from "@/components/aios/aios-sections";

export const Route = createFileRoute("/ai-company")({
  component: AiCompanyPage,
  head: () => ({
    meta: [
      { title: "AI Company OS — Hire AI Teams | Campus X" },
      {
        name: "description",
        content:
          "Hire an entire AI company: an AI CEO, a coordinator and 16 specialised AI teams for engineering, design, QA, marketing, security and finance. INR pricing, UPI payment.",
      },
      { property: "og:title", content: "AI Company OS — Hire AI Teams | Campus X" },
      {
        property: "og:description",
        content:
          "An AI CEO plans, a coordinator assigns, and specialised AI teams execute. Team-based pricing in INR.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function AiCompanyPage() {
  return (
    <MarketingLayout>
      <AiosHero />
      <AiosArchitecture />
      <AiosWorkflow />
      <AiosTeamsPricing />
      <AiosFaq />
    </MarketingLayout>
  );
}
