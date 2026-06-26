import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowUpRight,
  Sparkles,
  Users,
  FolderGit2,
  Briefcase,
  Rocket,
  Code2,
  Target,
  Zap,
  Heart,
  Quote,
} from "lucide-react";
import { MarketingLayout } from "@/components/marketing-layout";
import { HowItWorks } from "@/components/how-it-works";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Campus X — Where student builders ship real projects" },
      {
        name: "description",
        content:
          "Campus X is a collaborative platform for student developers, engineers and tech innovators in India to share live projects, find internships, and form startup teams.",
      },
      { name: "keywords", content: "student developers, college projects, startup co-founder, tech internships India, student community, Campus X, Suman Kumar" },
      { property: "og:title", content: "Campus X — Where student builders ship real projects" },
      { property: "og:description", content: "Share live projects, find internships, and form startup teams. Built for India's student technologists." },
      { property: "og:url", content: "https://campusx-inquo.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://campusx-inquo.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Campus X",
          url: "https://campusx-inquo.lovable.app/",
          email: "campusx4@gmail.com",
          founder: { "@type": "Person", name: "Suman Kumar" },
          address: { "@type": "PostalAddress", addressLocality: "Purnia", addressRegion: "Bihar", postalCode: "854315", addressCountry: "IN" },
          description: "Collaborative platform for student developers to share projects, find internships, and form startup teams.",
        }),
      },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Users, title: "Discover", italic: "peers", body: "Find collaborators by skill, college, and what they're shipping right now." },
  { icon: FolderGit2, title: "Project", italic: "hub", body: "Showcase live demos with GitHub repos. Recruit teammates in one click." },
  { icon: Briefcase, title: "Internship", italic: "board", body: "Curated opportunities from companies actually hiring students." },
  { icon: Rocket, title: "Startup", italic: "incubator", body: "Pitch ideas, find co-founders, ship before graduation." },
];




const why = [
  { icon: Target, title: "Built for", italic: "students", body: "Not LinkedIn. Not a job board. A workspace for people who actually want to build." },
  { icon: Zap, title: "Velocity over", italic: "vanity", body: "We celebrate shipped projects, not follower counts." },
  { icon: Heart, title: "Made in", italic: "India", body: "By a student, for students — from Purnia to every campus." },
];

const testimonials = [
  { name: "Priya R.", college: "NIT Trichy", quote: "Found my co-founder for our climate startup on Campus X within two weeks. We're now in YC's startup school." },
  { name: "Arjun S.", college: "IIIT Hyderabad", quote: "The internship board got me a paid SDE role at a YC-backed startup. The dual-pane view is so much better than emails." },
  { name: "Meera K.", college: "BITS Pilani", quote: "I posted a project and three frontend devs joined within 48 hours. We shipped to production in a month." },
  { name: "Rohan T.", college: "IIT Kharagpur", quote: "Finally a platform that treats students like the builders we are. The vibe here is unlike any other community." },
];

function Landing() {
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="relative px-4 pb-24 pt-16 md:px-8 md:pt-24">
        <div className="mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 text-xs text-gold"
          >
            <Sparkles className="h-3 w-3" /> India's student builder workspace
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 font-display text-5xl leading-[1.02] tracking-tight md:text-7xl lg:text-8xl"
          >
            Where students <br />
            <span className="italic-serif">ship things</span> that matter.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg"
          >
            Campus X is a workspace for student developers, engineers, and tech
            innovators to share live projects, find internships, and form
            startup teams.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-9 flex flex-wrap justify-center gap-3"
          >
            <Link
              to="/dashboard"
              className="group inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3.5 text-sm font-medium text-primary-foreground transition hover:brightness-110"
            >
              Enter the workspace
              <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-6 py-3.5 text-sm font-medium hover:border-gold/40"
            >
              About the founder
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">— What's inside</div>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">
              Four surfaces. One <span className="italic-serif">workspace.</span>
            </h2>
          </div>
          <div className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="card-noir-hover bg-surface p-7"
                >
                  <Icon className="h-5 w-5 text-gold" />
                  <h3 className="mt-6 font-display text-2xl">
                    {f.title} <span className="italic-serif">{f.italic}</span>
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How */}
      <HowItWorks />


      {/* Why */}
      <section className="px-4 py-20 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">— Why Campus X</div>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">
              Because shipping beats <span className="italic-serif">scrolling.</span>
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {why.map((w, i) => {
              const Icon = w.icon;
              return (
                <motion.div
                  key={w.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="card-noir card-noir-hover rounded-2xl p-7"
                >
                  <Icon className="h-5 w-5 text-gold" />
                  <h3 className="mt-5 font-display text-2xl leading-tight">
                    {w.title} <span className="italic-serif">{w.italic}</span>
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{w.body}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-20 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">— What builders say</div>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">
              Loved by people who <span className="italic-serif">ship.</span>
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {testimonials.map((t, i) => (
              <motion.figure
                key={t.name}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="card-noir card-noir-hover rounded-2xl p-8"
              >
                <Quote className="h-5 w-5 text-gold" />
                <blockquote className="mt-4 font-display text-xl leading-snug">
                  "{t.quote}"
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-gold font-display text-sm text-primary-foreground">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.college}</div>
                  </div>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 md:px-8">
        <div className="ambient-glow mx-auto max-w-4xl rounded-3xl border border-gold/20 bg-surface p-12 text-center md:p-16">
          <Code2 className="mx-auto h-6 w-6 text-gold" />
          <h2 className="mt-6 font-display text-4xl leading-tight md:text-5xl">
            Stop lurking. <br />
            <span className="italic-serif">Start shipping.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-sm text-muted-foreground">
            Join the workspace where India's next generation of builders meet.
          </p>
          <Link
            to="/dashboard"
            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-gold px-7 py-4 text-sm font-medium text-primary-foreground transition hover:brightness-110"
          >
            Enter Campus X
            <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
