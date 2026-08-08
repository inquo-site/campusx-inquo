import { createFileRoute, Link, ErrorComponent, useRouter } from "@tanstack/react-router";
// Route: /blog (index leaf). Parent path /blog has no layout file — sibling routes like /blog/$slug mount independently.
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { MarketingLayout } from "@/components/marketing-layout";
import { listPublishedBlogs } from "@/lib/blog.functions";
import { NewsletterBlock } from "@/components/blog/block-renderer";
import { ArrowUpRight, Clock, Search, Flame } from "lucide-react";

const blogsQO = () =>
  queryOptions({
    queryKey: ["blogs", "list"],
    queryFn: () => listPublishedBlogs(),
  });

export const Route = createFileRoute("/blog/")({
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

  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [tag, setTag] = useState<string>("all");
  const [series, setSeries] = useState<string>("all");
  const [sort, setSort] = useState<"latest" | "popular">("latest");

  const categories = useMemo(
    () => [...new Set(posts.map((p) => p.category).filter(Boolean))] as string[],
    [posts],
  );
  const seriesList = useMemo(
    () => [...new Set(posts.map((p) => p.series).filter(Boolean))] as string[],
    [posts],
  );
  const tags = useMemo(
    () => [...new Set(posts.flatMap((p) => (p.tags as string[]) ?? []))].sort(),
    [posts],
  );

  const featured = posts.find((p) => p.is_featured) ?? posts[0];
  const trending = useMemo(
    () => [...posts].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 5),
    [posts],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = posts.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (series !== "all" && p.series !== series) return false;
      if (tag !== "all" && !((p.tags as string[]) ?? []).includes(tag)) return false;
      if (!needle) return true;
      return `${p.title} ${p.excerpt ?? ""} ${((p.tags as string[]) ?? []).join(" ")}`
        .toLowerCase()
        .includes(needle);
    });
    return sort === "popular"
      ? [...list].sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
      : list;
  }, [posts, q, category, series, tag, sort]);

  const selectCls =
    "rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground";

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
            <>
              {featured && (
                <Link
                  to="/blog/$slug"
                  params={{ slug: featured.slug }}
                  className="card-noir card-noir-hover group mt-12 grid gap-0 overflow-hidden rounded-3xl md:grid-cols-2"
                >
                  {featured.cover_image ? (
                    <div className="aspect-[16/10] w-full overflow-hidden bg-muted">
                      <img
                        src={featured.cover_image}
                        alt={featured.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[16/10] w-full bg-gradient-to-br from-gold/10 via-surface to-background" />
                  )}
                  <div className="flex flex-col justify-center p-8">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-gold">Featured</div>
                    <h2 className="mt-3 font-display text-3xl leading-tight">{featured.title}</h2>
                    {featured.excerpt && (
                      <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{featured.excerpt}</p>
                    )}
                    <span className="mt-5 inline-flex items-center gap-1.5 text-xs text-gold">
                      Read the story <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              )}

              <div className="mt-12 flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search posts, topics, tags…"
                    aria-label="Search posts"
                    className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <select aria-label="Category" value={category} onChange={(e) => setCategory(e.target.value)} className={selectCls}>
                    <option value="all">All categories</option>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select aria-label="Tag" value={tag} onChange={(e) => setTag(e.target.value)} className={selectCls}>
                    <option value="all">All tags</option>
                    {tags.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {seriesList.length > 0 && (
                    <select aria-label="Series" value={series} onChange={(e) => setSeries(e.target.value)} className={selectCls}>
                      <option value="all">All series</option>
                      {seriesList.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  )}
                  <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as "latest" | "popular")} className={selectCls}>
                    <option value="latest">Latest</option>
                    <option value="popular">Most read</option>
                  </select>
                </div>
              </div>

              {trending.length > 1 && (
                <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 text-gold"><Flame className="h-3.5 w-3.5" /> Trending:</span>
                  {trending.map((p) => (
                    <Link key={p.id} to="/blog/$slug" params={{ slug: p.slug }} className="rounded-full border border-border px-2.5 py-1 transition hover:border-gold hover:text-gold">
                      {p.title.slice(0, 40)}
                    </Link>
                  ))}
                </div>
              )}

              {filtered.length === 0 ? (
                <div className="mx-auto mt-12 max-w-lg rounded-2xl border border-border bg-surface p-10 text-center">
                  <p className="text-sm text-muted-foreground">No posts match those filters.</p>
                </div>
              ) : (
                <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((p) => (
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
                        <div className="mb-3 flex flex-wrap gap-1.5">
                          {p.category && (
                            <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-gold">
                              {p.category}
                            </span>
                          )}
                          {((p.tags as string[]) ?? []).slice(0, 2).map((t) => (
                            <span key={t} className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                              {t}
                            </span>
                          ))}
                        </div>
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

              <div className="mt-16">
                <NewsletterBlock />
              </div>
            </>
          )}
        </div>
      </section>
    </MarketingLayout>
  );
}
