import { createFileRoute } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing-layout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Campus X" },
      { name: "description", content: "The rules of the road for using Campus X — the workspace for India's student builders." },
      { property: "og:title", content: "Terms & Conditions — Campus X" },
      { property: "og:url", content: "https://campusx-inquo.lovable.app/terms" },
    ],
    links: [{ rel: "canonical", href: "https://campusx-inquo.lovable.app/terms" }],
  }),
  component: Terms,
});

function Terms() {
  return (
    <MarketingLayout>
      <article className="mx-auto max-w-3xl px-4 pb-20 pt-10 md:px-8">
        <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">— Legal</div>
        <h1 className="mt-3 font-display text-5xl leading-tight md:text-6xl">
          Terms & <span className="italic-serif">conditions</span>
        </h1>
        <p className="mt-4 text-xs text-muted-foreground">Last updated: June 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-display text-2xl text-foreground">1. Acceptance</h2>
            <p className="mt-3">By creating an account or using Campus X, you agree to these terms. If you don't agree, please don't use the platform.</p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-foreground">2. Eligibility</h2>
            <p className="mt-3">Campus X is intended for students, recent graduates, and people building in tech. You must be 16 or older to register.</p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-foreground">3. Your content</h2>
            <p className="mt-3">You own the projects, descriptions, and other content you post. By posting it, you grant Campus X a non-exclusive license to display it on the platform.</p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-foreground">4. Acceptable use</h2>
            <p className="mt-3">No spam, harassment, plagiarism, fake job postings, or illegal activity. We may suspend accounts that violate these rules.</p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-foreground">5. Internships & startups</h2>
            <p className="mt-3">Campus X is a discovery platform. We don't verify every listing — do your own due diligence before sharing personal information, accepting offers, or signing agreements.</p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-foreground">6. Limitation of liability</h2>
            <p className="mt-3">Campus X is provided "as is". To the maximum extent permitted by law, we are not liable for any indirect or consequential losses arising from your use of the platform.</p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-foreground">7. Changes</h2>
            <p className="mt-3">We may update these terms. Continued use of Campus X after changes means you accept the updated terms.</p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-foreground">8. Contact</h2>
            <p className="mt-3">For any questions: <a href="mailto:campusx4@gmail.com" className="text-gold hover:underline">campusx4@gmail.com</a>.</p>
          </section>
        </div>
      </article>
    </MarketingLayout>
  );
}
