import { createFileRoute } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing-layout";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({
    meta: [
      { title: "Disclaimer — Campus X" },
      { name: "description", content: "Important information about the limitations and scope of content on Campus X." },
      { property: "og:title", content: "Disclaimer — Campus X" },
      { property: "og:url", content: "https://campusx-inquo.lovable.app/disclaimer" },
    ],
    links: [{ rel: "canonical", href: "https://campusx-inquo.lovable.app/disclaimer" }],
  }),
  component: Disclaimer,
});

function Disclaimer() {
  return (
    <MarketingLayout>
      <article className="mx-auto max-w-3xl px-4 pb-20 pt-10 md:px-8">
        <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">— Legal</div>
        <h1 className="mt-3 font-display text-5xl leading-tight md:text-6xl">
          Disclaimer
        </h1>
        <p className="mt-4 text-xs text-muted-foreground">Last updated: June 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-display text-2xl text-foreground">General information</h2>
            <p className="mt-3">
              The information provided on Campus X is for general informational
              and networking purposes only. While we strive to keep listings
              accurate and current, we make no representations or warranties of
              any kind, express or implied, about the completeness, accuracy,
              reliability, or availability of any information on the platform.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">No professional advice</h2>
            <p className="mt-3">
              Content on Campus X does not constitute legal, financial, career, or
              technical advice. Always consult qualified professionals before
              making important decisions about your career, startup, or projects.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">Third-party content</h2>
            <p className="mt-3">
              Projects, internships, and startup pitches are submitted by users.
              Campus X does not endorse or verify them. Any reliance you place on
              such information is strictly at your own risk.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">External links</h2>
            <p className="mt-3">
              The platform may contain links to external websites (GitHub
              repositories, live demos, company pages). We have no control over
              the content of these sites and accept no responsibility for them.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">Contact</h2>
            <p className="mt-3">
              Questions about this disclaimer? Email{" "}
              <a href="mailto:campusx4@gmail.com" className="text-gold hover:underline">campusx4@gmail.com</a>.
            </p>
          </section>
        </div>
      </article>
    </MarketingLayout>
  );
}
