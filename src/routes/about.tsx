import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Mail, MapPin, Sparkles, Code2 } from "lucide-react";
import { MarketingLayout } from "@/components/marketing-layout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Campus X" },
      { name: "description", content: "Campus X is founded by Suman Kumar from Purnia, Bihar. Learn about the mission to give student builders a workspace of their own." },
      { property: "og:title", content: "About Us — Campus X" },
      { property: "og:description", content: "Founded by Suman Kumar from Purnia, Bihar — Campus X is a workspace for India's student builders." },
      { property: "og:url", content: "https://campusx-inquo.lovable.app/about" },
    ],
    links: [{ rel: "canonical", href: "https://campusx-inquo.lovable.app/about" }],
  }),
  component: About,
});

function About() {
  return (
    <MarketingLayout>
      <section className="px-4 pb-20 pt-10 md:px-8">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">— About us</div>
            <h1 className="mt-3 font-display text-5xl leading-[1.05] md:text-6xl">
              A workspace for India's <br />
              <span className="italic-serif">student builders.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Campus X exists because the best ideas in Indian tech are being
              built in hostel rooms, not boardrooms — and students deserve a
              workspace that takes them seriously.
            </p>
          </motion.div>

          {/* Mission */}
          <div className="mt-16 grid gap-6 md:grid-cols-2">
            <div className="card-noir rounded-2xl p-8">
              <Sparkles className="h-5 w-5 text-gold" />
              <h2 className="mt-5 font-display text-2xl">
                Our <span className="italic-serif">mission</span>
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                To connect every student technologist in India to the
                collaborators, opportunities, and co-founders they need to
                ship things that matter.
              </p>
            </div>
            <div className="card-noir rounded-2xl p-8">
              <Code2 className="h-5 w-5 text-gold" />
              <h2 className="mt-5 font-display text-2xl">
                Our <span className="italic-serif">belief</span>
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                You don't need permission, a degree, or a job title to build
                something great. You need the right people, the right
                workspace, and the will to ship.
              </p>
            </div>
          </div>

          {/* Founder */}
          <div className="mt-16">
            <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">— Founder</div>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">
              Meet the <span className="italic-serif">founder.</span>
            </h2>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="card-noir mt-8 overflow-hidden rounded-3xl p-8 md:p-12"
            >
              <div className="grid items-start gap-10 md:grid-cols-[auto_1fr]">
                <div className="grid h-32 w-32 place-items-center rounded-2xl border border-gold/30 bg-gold/10 font-display text-6xl italic text-gold">
                  S
                </div>
                <div>
                  <h3 className="font-display text-3xl">
                    Suman <span className="italic-serif">Kumar</span>
                  </h3>
                  <div className="mt-1 text-sm text-muted-foreground">Founder, Campus X</div>

                  <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                    Suman is a student builder from Purnia, Bihar. He started
                    Campus X after watching too many talented classmates ship
                    nothing because they couldn't find the right people to
                    build with. Campus X is his attempt to fix that — a
                    workspace where finding a co-founder, a teammate, or an
                    internship takes minutes, not months.
                  </p>

                  <div className="mt-7 grid gap-3 text-sm sm:grid-cols-2">
                    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3.5">
                      <Mail className="h-4 w-4 text-gold" />
                      <a href="mailto:campusx4@gmail.com" className="hover:text-gold">campusx4@gmail.com</a>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3.5">
                      <MapPin className="h-4 w-4 text-gold" />
                      <span>Purnia, Bihar 854315</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
