import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Radar, Filter, BellRing, ArrowUpRight, GraduationCap } from "lucide-react";
import { MarketingLayout } from "@/components/marketing-layout";
import { HowItWorks } from "@/components/how-it-works";
import {
  useRadarData,
  RadarScope,
  LiveCounters,
  LiveFeed,
  CompanyMarquee,
} from "@/components/how-it-works-live";

export const Route = createFileRoute("/how-it-works")({
  component: HowItWorksPage,
  head: () => ({
    meta: [
      { title: "How the Tier2X Off-Campus Radar Works" },
      {
        name: "description",
        content:
          "Live off-campus job listings, filtered by your college, branch and CGPA — so you never miss a drive your placement cell didn't see.",
      },
      { property: "og:title", content: "How the Tier2X Off-Campus Radar Works" },
      {
        property: "og:description",
        content:
          "We pull live off-campus listings and filter them by college, branch and CGPA.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://tier2x.lovable.app/how-it-works" },
    ],
    links: [{ rel: "canonical", href: "https://tier2x.lovable.app/how-it-works" }],
  }),
});


const steps = [
  {
    icon: Radar,
    title: "We",
    italic: "scan",
    body: "Live off-campus drives, fresher roles and hackathons are pulled in continuously — not once a semester.",
  },
  {
    icon: Filter,
    title: "We",
    italic: "filter",
    body: "Every listing is matched against your college, branch and CGPA, so you only see what you can actually apply to.",
  },
  {
    icon: BellRing,
    title: "You",
    italic: "apply",
    body: "Track each application through one pipeline, and request an alumni intro where it counts.",
  },
];

function HowItWorksPage() {
  const { data, isLoading } = useRadarData();

  return (
    <MarketingLayout>

      <section className="px-4 pb-16 pt-10 md:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            — Off-Campus Radar
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mt-3 font-display text-5xl leading-tight md:text-6xl"
          >
            How the Tier2X <span className="italic-serif">Off-Campus Radar</span> works
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground"
          >
            We pull live off-campus job listings and filter them by your college,
            branch, and CGPA. No more missing opportunities because your placement
            cell didn't see them.
          </motion.p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/dashboard" className="btn-ink group">
              Get early access
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <Link to="/for-alumni" className="btn-ghost">
              For alumni
            </Link>
          </div>
        </div>
      </section>

      {/* Live radar + real counters */}
      <section className="px-4 pb-16 md:px-8">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <RadarScope data={data} />
          </motion.div>

          <div>
            <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              — Live right now
            </div>
            <h2 className="mt-3 font-display text-3xl leading-tight md:text-4xl">
              Everything on this page is <span className="italic-serif">real data</span>.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              These numbers come straight from the listings currently on Tier2X — no
              mockups, no placeholder logos.
            </p>
            <div className="mt-8">
              <LiveCounters data={data} loading={isLoading} />
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-6xl">
          <CompanyMarquee data={data} />
        </div>
      </section>

      <section className="px-4 pb-8 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">

          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.italic}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="card-noir card-noir-hover rounded-2xl p-7"
              >
                <Icon className="h-5 w-5 text-gold" />
                <h2 className="mt-5 font-display text-2xl leading-tight">
                  {s.title} <span className="italic-serif">{s.italic}</span>
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <HowItWorks />

      {/* Live feed of real listings */}
      <section className="px-4 pb-20 md:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              — Latest on the radar
            </div>
            <h2 className="mt-3 font-display text-3xl leading-tight md:text-4xl">
              What just <span className="italic-serif">landed</span>.
            </h2>
          </div>
          <LiveFeed data={data} loading={isLoading} />
          <div className="mt-8 text-center">
            <Link to="/jobs" className="btn-ghost">
              See every listing
            </Link>
          </div>
        </div>
      </section>



      <section className="px-4 py-20 md:px-8">
        <div className="ambient-glow mx-auto max-w-4xl rounded-3xl border border-gold/20 bg-surface p-12 text-center md:p-16">
          <GraduationCap className="mx-auto h-6 w-6 text-gold" />
          <h2 className="mt-6 font-display text-4xl leading-tight md:text-5xl">
            Your placement cell can't <span className="italic-serif">see everything.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-sm text-muted-foreground">
            Tier2X watches the off-campus market for you, every day.
          </p>
          <Link to="/dashboard" className="btn-ink group mt-8">
            Get early access
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
