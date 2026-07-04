import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Linkedin,
  Github,
  FileText,
  MessagesSquare,
  Trophy,
  Briefcase,
  ClipboardList,
  Map,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { MarketingLayout } from "@/components/marketing-layout";

export const Route = createFileRoute("/features")({
  component: FeaturesPage,
  head: () => ({
    meta: [
      { title: "Features — Campus X" },
      { name: "description", content: "LinkedIn Optimizer, GitHub & Resume tools, peer rooms, dev report card, hackathons, off-campus jobs, application tracker, and a full prep roadmap." },
      { property: "og:title", content: "Features — Campus X" },
      { property: "og:description", content: "The full builder toolkit: LinkedIn/GitHub/Resume optimizer, peer rooms, dev report card, jobs, hackathons, and prep roadmap." },
    ],
  }),
});

type Feature = {
  tag?: "New" | "Live" | "Soon";
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  italic: string;
  body: string;
  to: string;
  bullets: string[];
};

const features: Feature[] = [
  {
    tag: "New",
    icon: Linkedin,
    title: "LinkedIn",
    italic: "Optimizer",
    body: "Paste your profile — get section-by-section rewrites tuned to a recruiter keyword bank for your target role.",
    to: "/linkedin-optimizer",
    bullets: [
      "Auto-splits Headline, About, and Experience",
      "Role-specific keyword match & gap analysis",
      "AI rewrites with a copy button on every section",
    ],
  },
  {
    tag: "Live",
    icon: Github,
    title: "Dev Report",
    italic: "Card",
    body: "Auto-synced GitHub + Codeforces stats on a shareable public profile at /u/your-handle.",
    to: "/devprofile",
    bullets: [
      "One-click GitHub & Codeforces sync",
      "Manual LinkedIn / LeetCode / portfolio fields",
      "Public URL you can drop in any application",
    ],
  },
  {
    tag: "Live",
    icon: FileText,
    title: "Resume",
    italic: "Builder",
    body: "AI-polished, ATS-friendly resume built from your project & internship history.",
    to: "/resume",
    bullets: [
      "Section-by-section AI polish",
      "Import from your Campus X projects",
      "Export a clean, ATS-ready PDF",
    ],
  },
  {
    tag: "Live",
    icon: MessagesSquare,
    title: "Peer",
    italic: "Rooms",
    body: "Text rooms per college or interest — join, chat, ship together in real time.",
    to: "/rooms",
    bullets: [
      "College-wise and interest-wise rooms",
      "Realtime messages, no reloads",
      "Anyone can spin up a new room",
    ],
  },
  {
    tag: "Live",
    icon: ClipboardList,
    title: "Application",
    italic: "Tracker",
    body: "Every internship, referral, and hackathon in one board with deadlines and status.",
    to: "/applications",
    bullets: [
      "Statuses: applied → interview → offer",
      "Deadline reminders",
      "Notes and next-action per row",
    ],
  },
  {
    tag: "Live",
    icon: Trophy,
    title: "Hackathon",
    italic: "Feed",
    body: "Curated hackathons pulled from Devfolio, Unstop, and partner drives — filtered to your skill match.",
    to: "/hackathons",
    bullets: [
      "One feed across major platforms",
      "Skill-match filters",
      "One-tap save to the tracker",
    ],
  },
  {
    tag: "Live",
    icon: Briefcase,
    title: "Off-Campus",
    italic: "Jobs",
    body: "Off-campus drives and internships surfaced daily and tagged by tech stack.",
    to: "/jobs",
    bullets: [
      "Fresh drives, deduped daily",
      "Stack tags (React, Go, ML, …)",
      "Apply links + tracker sync",
    ],
  },
  {
    tag: "Soon",
    icon: Map,
    title: "Prep",
    italic: "Roadmap",
    body: "Weekly roadmap for DSA, system design, and target-company prep — synced to your calendar.",
    to: "/features",
    bullets: [
      "Personalized by role & timeline",
      "DSA + system design tracks",
      "Weekly checkpoints",
    ],
  },
];

function TagBadge({ tag }: { tag: Feature["tag"] }) {
  if (!tag) return null;
  const styles =
    tag === "New"
      ? "border-gold/40 bg-gold/10 text-gold"
      : tag === "Soon"
        ? "border-border bg-muted/40 text-muted-foreground"
        : "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-widest ${styles}`}>
      {tag === "New" && <Sparkles className="h-2.5 w-2.5" />}
      {tag}
    </span>
  );
}

function FeaturesPage() {
  return (
    <MarketingLayout>
      <section className="px-4 pb-16 pt-8 md:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            — Everything inside Campus X
          </div>
          <h1 className="mt-4 font-display text-5xl leading-[1.02] tracking-tight md:text-6xl">
            The builder <span className="italic-serif">toolkit.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground">
            One workspace for the profile, the network, and the pipeline — from your LinkedIn
            headline to the offer letter.
          </p>
        </div>
      </section>

      <section className="px-4 pb-24 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="group relative flex flex-col rounded-3xl border border-border bg-card p-6 transition hover:border-gold/40"
              >
                <div className="flex items-start justify-between">
                  <Icon className="h-6 w-6 text-gold" />
                  <TagBadge tag={f.tag} />
                </div>
                <h2 className="mt-6 font-display text-2xl leading-tight">
                  {f.title} <span className="italic-serif">{f.italic}</span>
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                <ul className="mt-4 space-y-1.5">
                  {f.bullets.map((b) => (
                    <li key={b} className="flex gap-2 text-xs text-muted-foreground">
                      <span className="mt-1.5 h-1 w-1 flex-none rounded-full bg-gold" />
                      {b}
                    </li>
                  ))}
                </ul>
                <Link
                  to={f.to}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm text-gold transition group-hover:gap-2.5"
                >
                  {f.tag === "Soon" ? "Preview" : "Open"}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>
    </MarketingLayout>
  );
}
