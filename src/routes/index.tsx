import { createFileRoute } from "@tanstack/react-router";
import { Tier2xHome } from "@/components/tier2x-home";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tier2X — Your next move, beyond campus" },
      {
        name: "description",
        content:
          "Off-campus drives, alumni intros and proof-of-work for students at India's Tier-2 and Tier-3 engineering colleges.",
      },
      { name: "keywords", content: "off campus jobs India, tier 2 college placements, alumni referral, fresher jobs, Tier2X, Suman Kumar" },
      { property: "og:title", content: "Tier2X — Your next move, beyond campus" },
      { property: "og:description", content: "Off-campus drives, alumni intros and proof-of-work for the ~3,900 Indian engineering colleges that aren't IITs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://tier2x.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://tier2x.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Tier2X",
          url: "https://tier2x.lovable.app/",
          email: "campusx4@gmail.com",
          founder: { "@type": "Person", name: "Suman Kumar" },
          address: { "@type": "PostalAddress", addressLocality: "Purnia", addressRegion: "Bihar", postalCode: "854315", addressCountry: "IN" },
          description: "Off-campus jobs, alumni introductions and career support for students at India's Tier-2 and Tier-3 engineering colleges.",
        }),
      },
    ],
  }),
  component: Tier2xHome,
});

