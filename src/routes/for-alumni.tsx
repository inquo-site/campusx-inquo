import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Clock, HeartHandshake, Users, ArrowUpRight, ShieldCheck } from "lucide-react";
import { MarketingLayout } from "@/components/marketing-layout";

export const Route = createFileRoute("/for-alumni")({
  component: ForAlumniPage,
  head: () => ({
    meta: [
      { title: "For Alumni — Mentor Tier-2 students | Tier2X" },
      {
        name: "description",
        content:
          "Help Tier-2 students in 15 minutes a month. Alumni from your college mentor juniors and make warm introductions — you decide who and when.",
      },
      { property: "og:title", content: "Help Tier-2 students. 15 minutes a month." },
      {
        property: "og:description",
        content:
          "Alumni from your college are looking for juniors to mentor. We match them. You decide.",
      },
      { property: "og:url", content: "https://campusx-inquo.lovable.app/for-alumni" },
    ],
    links: [{ rel: "canonical", href: "https://campusx-inquo.lovable.app/for-alumni" }],
  }),
});

const points = [
  {
    icon: Clock,
    title: "Fifteen",
    italic: "minutes",
    body: "One short call, a resume review, or a single referral note. That's the whole ask — no long-term commitment.",
  },
  {
    icon: Users,
    title: "Your own",
    italic: "juniors",
    body: "We match you with students from your college and branch, so the context is already there.",
  },
  {
    icon: ShieldCheck,
    title: "You stay in",
    italic: "control",
    body: "Every request comes to you first. Accept, decline, or pause any time — your inbox is never opened up.",
  },
];

function ForAlumniPage() {
  return (
    <MarketingLayout>
      <section className="px-4 pb-16 pt-10 md:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 text-xs text-gold">
            <HeartHandshake className="h-3 w-3" /> For alumni
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 font-display text-5xl leading-tight md:text-6xl"
          >
            Help Tier-2 students. <br />
            <span className="italic-serif">15 minutes a month.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground"
          >
            Alumni from your college at Google, Microsoft, startups — they're
            looking for juniors like you to mentor. We match them. You decide.
          </motion.p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/dashboard" className="btn-ink group">
              Become a Mentor
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <Link to="/how-it-works" className="btn-ghost">
              How Tier2X works
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {points.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.italic}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="card-noir card-noir-hover rounded-2xl p-7"
              >
                <Icon className="h-5 w-5 text-gold" />
                <h2 className="mt-5 font-display text-2xl leading-tight">
                  {p.title} <span className="italic-serif">{p.italic}</span>
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="px-4 py-20 md:px-8">
        <div className="ambient-glow mx-auto max-w-4xl rounded-3xl border border-gold/20 bg-surface p-12 text-center md:p-16">
          <HeartHandshake className="mx-auto h-6 w-6 text-gold" />
          <h2 className="mt-6 font-display text-4xl leading-tight md:text-5xl">
            One intro can change <br />
            <span className="italic-serif">a career.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-sm text-muted-foreground">
            Join as an alumni mentor and we'll route the right junior to you.
          </p>
          <Link to="/dashboard" className="btn-ink group mt-8">
            Become a Mentor
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
