import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Building2, Megaphone, ListChecks, ArrowUpRight } from "lucide-react";
import { MarketingLayout } from "@/components/marketing-layout";

export const Route = createFileRoute("/colleges")({
  component: CollegesPage,
  head: () => ({
    meta: [
      { title: "Your college, on Tier2X" },
      {
        name: "description",
        content:
          "Add your college to the Tier2X directory so your placement cell can post off-campus drives directly to students.",
      },
      { property: "og:title", content: "Your college, on Tier2X" },
      {
        property: "og:description",
        content:
          "Add your college to the directory. Your placement cell can post drives directly.",
      },
      { property: "og:url", content: "https://campusx-inquo.lovable.app/colleges" },
    ],
    links: [{ rel: "canonical", href: "https://campusx-inquo.lovable.app/colleges" }],
  }),
});

const blocks = [
  {
    icon: Building2,
    title: "Join the",
    italic: "directory",
    body: "Every campus gets a home on Tier2X — students find their peers, seniors and alumni in one place.",
  },
  {
    icon: Megaphone,
    title: "Post drives",
    italic: "directly",
    body: "Your placement cell can publish drives and deadlines to students the moment they're confirmed.",
  },
  {
    icon: ListChecks,
    title: "Track",
    italic: "outcomes",
    body: "See which students applied and where things stand, without chasing spreadsheets or WhatsApp groups.",
  },
];

function CollegesPage() {
  return (
    <MarketingLayout>
      <section className="px-4 pb-16 pt-10 md:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            — For colleges
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mt-3 font-display text-5xl leading-tight md:text-6xl"
          >
            Your college, <span className="italic-serif">on Tier2X</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground"
          >
            Add your college to the directory. Your placement cell can post drives
            directly.
          </motion.p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="mailto:campusx4@gmail.com?subject=Add%20my%20college%20to%20Tier2X" className="btn-ink group">
              Add your college
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            <Link to="/how-it-works" className="btn-ghost">
              How it works
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {blocks.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={b.italic}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="card-noir card-noir-hover rounded-2xl p-7"
              >
                <Icon className="h-5 w-5 text-gold" />
                <h2 className="mt-5 font-display text-2xl leading-tight">
                  {b.title} <span className="italic-serif">{b.italic}</span>
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.body}</p>
              </motion.div>
            );
          })}
        </div>
      </section>
    </MarketingLayout>
  );
}
