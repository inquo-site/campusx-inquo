import { createFileRoute, Link, ErrorComponent, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { MarketingLayout } from "@/components/marketing-layout";
import { listPublishedBlogs } from "@/lib/blog.functions";
import { ArrowUpRight, Clock } from "lucide-react";

const blogsQO = () =>
  queryOptions({
    queryKey: ["blogs", "list"],
    queryFn: () => listPublishedBlogs(),
  });

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Campus X Blog — Guides for student builders" },
      { name: "description", content: "Essays, guides and playbooks from Campus X for Indian student developers: careers, projects, internships, and building in public." },
      { property: "og:title", content: "Campus X Blog" },
      { property: "og:description", content: "Guides, essays and playbooks for India's student developers." },
      { property: "og:url", content: "https://campusx-inquo.lovable.app/blog" },
    ],
    links: [{ rel: "canonical", href: "https://campusx-inquo.lovable.app/blog" }],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(blogsQO());
  },
  component: BlogIndex,
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <MarketingLayout>
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="font-display text-3xl">Something went wrong</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            <ErrorComponent error={error} />
          </p>
          <button
            onClick={() => { reset(); router.invalidate(); }}
            className="btn-ink mt-6"
          >
            Retry
          </button>
        </div>
      </MarketingLayout>
    );
  },
  notFoundComponent: () => (
    <MarketingLayout>
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl">Not found</h1>
      </div>
    </MarketingLayout>
  ),
});

function BlogIndex() {
  const { data } = useSuspenseQuery(blogsQO());
  const posts = data ?? [];

  return (
    <MarketingLayout>
      <section className="px-4 pb-16 pt-8 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">— Campus X Journal</div>
            <h1 className="mt-3 font-display text-5xl leading-[1.05] md:text-6xl">
              Stories for people who <span className="italic-serif">ship</span>.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-sm text-muted-foreground md:text-base">
              Essays, guides and playbooks for India's student builders.
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="mx-auto mt-16 max-w-lg rounded-2xl border border-border bg-surface p-10 text-center">
              <p className="text-sm text-muted-foreground">No posts yet. Come back soon.</p>
            </div>
          ) : (
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <Link
                  key={p.id}
                  to="/blog/$slug"
                  params={{ slug: p.slug }}
                  className="card-noir card-noir-hover group flex flex-col overflow-hidden rounded-2xl"
                >
                  {p.cover_image ? (
                    <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
                      <img
                        src={p.cover_image}
                        alt={p.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[16/9] w-full bg-gradient-to-br from-gold/10 via-surface to-background" />
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    {p.tags && p.tags.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-1.5">
                        {p.tags.slice(0, 3).map((t) => (
                          <span key={t} className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    <h2 className="font-display text-xl leading-snug">{p.title}</h2>
                    {p.excerpt && (
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                        {p.excerpt}
                      </p>
                    )}
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                      <span>{p.author_name || "Campus X"}</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {p.read_minutes} min
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </MarketingLayout>
  );
}
