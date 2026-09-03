import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing-layout";
import { motion } from "motion/react";
import { Check, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
  head: () => ({
    meta: [
      { title: "Pricing — Tier2X" },
      {
        name: "description",
        content:
          "Free off-campus drive access for every student. Paid plans add alumni introductions, priority opportunities and career support.",
      },
      { property: "og:title", content: "Pricing — Tier2X" },
      {
        property: "og:description",
        content: "Start free with unlimited drive access. Upgrade for alumni intros and priority opportunities.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://campusx-inquo.lovable.app/pricing" }],
  }),
});

const plans = [
  {
    name: "Free",
    price: "₹0",
    cadence: "forever",
    tagline: "Start here. Unlimited drive access.",
    features: [
      "Unlimited off-campus drive listings",
      "Filter by college, branch and CGPA",
      "Application tracker",
      "Prep roadmap and peer rooms",
    ],
    cta: "Get early access",
    to: "/auth" as const,
    highlight: false,
  },
  {
    name: "Alumni Access",
    price: "₹299",
    cadence: "per month",
    tagline: "Warm intros beat cold applications.",
    features: [
      "Everything in Free",
      "Alumni introductions from your college",
      "Priority off-campus opportunities",
      "Referral request templates and follow-ups",
    ],
    cta: "Request access",
    to: "/for-alumni" as const,
    highlight: true,
  },
  {
    name: "Career Support",
    price: "₹599",
    cadence: "per month",
    tagline: "For final-year students in placement season.",
    features: [
      "Everything in Alumni Access",
      "Resume and LinkedIn optimisation reviews",
      "Mock interview prep tracks",
      "Priority support before drive deadlines",
    ],
    cta: "Talk to us",
    to: "/about" as const,
    highlight: false,
  },
];

function PricingPage() {
  return (
    <MarketingLayout>
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          <span className="h-px w-6 bg-gold/60" /> Pricing
        </div>
        <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[1.05] tracking-tight md:text-5xl">
          Free to find drives. Pay only for <span className="italic-serif">introductions.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Every Tier-2/3 student gets unlimited access to off-campus listings. Paid plans exist for the part that
          actually moves the needle — alumni intros and priority opportunities.
        </p>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`card-noir rounded-3xl border p-7 ${
                p.highlight ? "border-gold/40" : "border-border"
              }`}
            >
              <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">— {p.name}</div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-display text-4xl">{p.price}</span>
                <span className="text-xs text-muted-foreground">{p.cadence}</span>
              </div>
              <p className="mt-3 text-sm text-foreground/80">{p.tagline}</p>
              <ul className="mt-6 space-y-2.5 text-sm text-muted-foreground">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to={p.to} className="btn-ink group mt-8 w-full justify-center">
                {p.cta}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </MarketingLayout>
  );
}
