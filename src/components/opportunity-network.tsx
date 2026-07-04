import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import {
  Briefcase,
  Trophy,
  ClipboardList,
  Users2,
  MessagesSquare,
  Github,
  ArrowUpRight,
} from "lucide-react";

const opportunity = [
  {
    to: "/jobs",
    icon: Briefcase,
    tag: "Opportunity",
    title: "Off-Campus",
    italic: "job feed",
    body: "Curated + auto-fetched off-campus drives, filtered by your skill match — no more hunting Telegram groups.",
  },
  {
    to: "/hackathons",
    icon: Trophy,
    tag: "Opportunity",
    title: "Hackathon",
    italic: "radar",
    body: "Live listings pulled from Devfolio, Unstop, Hack2skill style sources — filtered to what fits your stack.",
  },
  {
    to: "/applications",
    icon: ClipboardList,
    tag: "Opportunity",
    title: "Application",
    italic: "tracker",
    body: "One dashboard for every application, deadline, round, and follow-up. Never miss a window again.",
  },
];

const network = [
  {
    to: "/alumni",
    icon: Users2,
    tag: "Network",
    title: "Alumni referral",
    italic: "network",
    body: "Match with alumni already at your target companies. Request → approve → warm intro. Your unfair advantage.",
  },
  {
    to: "/rooms",
    icon: MessagesSquare,
    tag: "Network",
    title: "Peer",
    italic: "rooms",
    body: "College-wise and interest-wise discussion rooms — text now, optional video later. Build with your people.",
  },
  {
    to: "/devprofile",
    icon: Github,
    tag: "Network",
    title: "Unified dev",
    italic: "profile",
    body: "GitHub + Codeforces auto-synced, LeetCode + LinkedIn manual — one public builder report card.",
  },
];

function Card({ item, index }: { item: typeof opportunity[number]; index: number }) {
  const Icon = item.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={item.to}
        className="card-noir card-noir-hover group relative flex h-full flex-col rounded-2xl p-7"
      >
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-gold">
            <Icon className="h-3 w-3" /> {item.tag}
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold" />
        </div>
        <h3 className="mt-6 font-display text-2xl leading-tight">
          {item.title} <span className="italic-serif">{item.italic}</span>
        </h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {item.body}
        </p>
      </Link>
    </motion.div>
  );
}

export function OpportunityNetworkSection() {
  return (
    <section id="layers" className="px-4 py-24 md:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Opportunity Layer */}
        <div className="mb-12 max-w-2xl">
          <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            — Layer 01 / Opportunity
          </div>
          <h2 className="mt-3 font-display text-4xl leading-[1.05] md:text-5xl">
            Every opening,{" "}
            <span className="italic-serif">in one feed.</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Off-campus drives, hackathons, internships — pulled together and
            filtered to what you can actually crack.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {opportunity.map((o, i) => (
            <Card key={o.to} item={o} index={i} />
          ))}
        </div>

        {/* Network Layer */}
        <div className="mb-12 mt-24 max-w-2xl">
          <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            — Layer 02 / Network
          </div>
          <h2 className="mt-3 font-display text-4xl leading-[1.05] md:text-5xl">
            The moat is{" "}
            <span className="italic-serif">who you know.</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Alumni referrals, peer rooms, and a public builder report card —
            proof of work meets proof of network.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {network.map((n, i) => (
            <Card key={n.to} item={n} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
