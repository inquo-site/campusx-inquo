import { createFileRoute } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing-layout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Campus X" },
      { name: "description", content: "How Campus X collects, uses, and protects information shared by student builders on the platform." },
      { property: "og:title", content: "Privacy Policy — Campus X" },
      { property: "og:url", content: "https://campusx-inquo.lovable.app/privacy" },
    ],
    links: [{ rel: "canonical", href: "https://campusx-inquo.lovable.app/privacy" }],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <MarketingLayout>
      <article className="mx-auto max-w-3xl px-4 pb-20 pt-10 md:px-8">
        <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">— Legal</div>
        <h1 className="mt-3 font-display text-5xl leading-tight md:text-6xl">
          Privacy <span className="italic-serif">policy</span>
        </h1>
        <p className="mt-4 text-xs text-muted-foreground">Last updated: June 2026</p>

        <div className="prose prose-invert mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-display text-2xl text-foreground">1. Information we collect</h2>
            <p className="mt-3">
              When you create a Campus X profile we collect basic information you
              provide — your name, college, skills, project links, and contact
              email. We also collect usage data such as pages viewed and
              interactions to improve the platform.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">2. How we use it</h2>
            <p className="mt-3">
              Information is used to operate the platform: showing your profile to
              other students, matching you with relevant projects, internships and
              startup opportunities, and sending you relevant notifications.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">3. Sharing</h2>
            <p className="mt-3">
              We do not sell your personal data. Profile information you publish on
              Campus X is visible to other registered users. We may share aggregate,
              non-identifying analytics publicly.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">4. Cookies</h2>
            <p className="mt-3">
              We use cookies and local storage to keep you signed in and to
              remember your preferences. You can disable cookies in your browser
              settings, though parts of the platform may stop working.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">5. Your rights</h2>
            <p className="mt-3">
              You may request a copy, correction, or deletion of your personal data
              at any time by emailing us. We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">6. Contact</h2>
            <p className="mt-3">
              Questions about this policy? Reach out at{" "}
              <a href="mailto:campusx4@gmail.com" className="text-gold hover:underline">campusx4@gmail.com</a>{" "}
              or write to Campus X, Purnia, Bihar 854315, India.
            </p>
          </section>
        </div>
      </article>
    </MarketingLayout>
  );
}
