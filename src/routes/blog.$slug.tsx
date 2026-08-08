import { createFileRoute, Link, notFound, ErrorComponent, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery, queryOptions } from "@tanstack/react-query";
import { MarketingLayout } from "@/components/marketing-layout";
import { getBlogBySlug, listRelatedBlogs } from "@/lib/blog.functions";
import { ArrowLeft, Clock, Link2, Twitter, Linkedin, ListTree } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
import { useState } from "react";
import type { Block, BlogTypography } from "@/lib/blog-blocks";
import { buildToc } from "@/lib/blog-blocks";
import { renderMarkdown, anchorHtmlHeadings } from "@/lib/blog-render";
import { BlocksRenderer, NewsletterBlock } from "@/components/blog/block-renderer";

const blogQO = (slug: string) =>
  queryOptions({
    queryKey: ["blog", slug],
    queryFn: () => getBlogBySlug({ data: { slug } }),
  });

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ context, params }) => {
    const post = await context.queryClient.ensureQueryData(blogQO(params.slug));
    if (!post) throw notFound();
    return post;
  },
  head: ({ loaderData }) => {
    const p = loaderData;
    const title = p ? `${p.title} — Campus X Blog` : "Campus X Blog";
    const desc = p?.excerpt || "Read on the Campus X blog.";
    const url = `https://campusx-inquo.lovable.app/blog/${p?.slug ?? ""}`;
    const meta: Array<Record<string, string>> = [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: p?.title ?? "Campus X Blog" },
      { property: "og:description", content: desc },
      { property: "og:type", content: "article" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
    ];
    const keywords = (p as { keywords?: string[] } | undefined)?.keywords;
    if (keywords && keywords.length > 0) meta.push({ name: "keywords", content: keywords.join(", ") });
    if (p?.cover_image) {
      meta.push({ property: "og:image", content: p.cover_image });
      meta.push({ name: "twitter:image", content: p.cover_image });
    }
    const faq = ((p as { faq?: Array<{ q: string; a: string }> } | undefined)?.faq ?? []).filter((f) => f?.q);
    const scripts: Array<Record<string, string>> = [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: p?.title,
          description: desc,
          image: p?.cover_image || undefined,
          datePublished: p?.published_at || undefined,
          author: { "@type": "Person", name: p?.author_name || "Campus X" },
          mainEntityOfPage: url,
        }),
      },
    ];
    if (faq.length > 0) {
      scripts.push({
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      });
    }
    return { meta, links: [{ rel: "canonical", href: url }], scripts };
  },
  component: BlogDetail,
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <MarketingLayout>
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="font-display text-3xl">Something went wrong</h1>
          <p className="mt-2 text-sm text-muted-foreground"><ErrorComponent error={error} /></p>
          <button onClick={() => { reset(); router.invalidate(); }} className="btn-ink mt-6">Retry</button>
        </div>
      </MarketingLayout>
    );
  },
  notFoundComponent: () => (
    <MarketingLayout>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl">Post not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">This story may have been unpublished.</p>
        <Link to="/blog" className="btn-ink mt-8">Back to Blog</Link>
      </div>
    </MarketingLayout>
  ),
});

function ShareBar({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";
  return (
    <div className="flex items-center gap-2">
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
        className="rounded-full border border-border p-2 transition hover:border-gold hover:text-gold"
      >
        <Twitter className="h-3.5 w-3.5" />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        className="rounded-full border border-border p-2 transition hover:border-gold hover:text-gold"
      >
        <Linkedin className="h-3.5 w-3.5" />
      </a>
      <button
        type="button"
        aria-label="Copy link"
        onClick={() => {
          navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="rounded-full border border-border p-2 transition hover:border-gold hover:text-gold"
      >
        <Link2 className="h-3.5 w-3.5" />
      </button>
      {copied && <span className="text-[10px] text-gold">Copied</span>}
    </div>
  );
}

function BlogDetail() {
  const params = Route.useParams();
  const { data: post } = useSuspenseQuery(blogQO(params.slug));
  const { data: related } = useQuery({
    queryKey: ["blog-related", params.slug],
    queryFn: () => listRelatedBlogs({ data: { slug: params.slug, limit: 3 } }),
    staleTime: 60_000,
  });

  if (!post) return null;
  const p = post as typeof post & {
    blocks?: Block[];
    typography?: BlogTypography;
    faq?: Array<{ q: string; a: string }>;
    show_toc?: boolean;
    category?: string | null;
    series?: string | null;
    image_alt?: string | null;
    image_caption?: string | null;
    author_bio?: string | null;
    author_avatar?: string | null;
  };
  const blocks = Array.isArray(p.blocks) ? p.blocks : [];
  const faq = Array.isArray(p.faq) ? p.faq.filter((f) => f?.q) : [];
  const isHtml = (post as { content_format?: string }).content_format === "html";
  const rendered = isHtml ? anchorHtmlHeadings(post.content || "") : renderMarkdown(post.content || "");
  const html = DOMPurify.sanitize(rendered, { USE_PROFILES: { html: true } });
  const dt = post.published_at ? new Date(post.published_at) : null;
  const toc = p.show_toc === false ? [] : buildToc(post.content || "", isHtml ? "html" : "markdown", blocks);

  const t = p.typography ?? {};
  const style: React.CSSProperties = {
    fontFamily: t.fontFamily || undefined,
    fontSize: t.fontSize ? `${t.fontSize}px` : undefined,
    fontWeight: t.fontWeight || undefined,
    lineHeight: t.lineHeight || undefined,
    letterSpacing: t.letterSpacing ? `${t.letterSpacing}em` : undefined,
    textAlign: t.align || undefined,
  };

  return (
    <MarketingLayout>
      <article className="mx-auto max-w-3xl px-4 pb-24 pt-4 md:px-8">
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition hover:text-gold">
          <ArrowLeft className="h-3.5 w-3.5" /> All posts
        </Link>
        <header className="mt-6">
          <div className="mb-4 flex flex-wrap items-center gap-1.5">
            {p.category && (
              <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gold">
                {p.category}
              </span>
            )}
            {post.tags?.map((tag: string) => (
              <span key={tag} className="rounded-full border border-gold/30 bg-gold/5 px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-gold">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="font-display text-4xl leading-[1.08] tracking-tight md:text-5xl">{post.title}</h1>
          {p.series && (
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">Part of the “{p.series}” series</p>
          )}
          {post.excerpt && (
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">{post.excerpt}</p>
          )}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{post.author_name || "Campus X"}</span>
              {dt && <span>{dt.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}</span>}
              <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {post.read_minutes} min read</span>
            </div>
            <ShareBar title={post.title} />
          </div>
        </header>

        {post.cover_image && (
          <figure className="mt-8">
            <div className="overflow-hidden rounded-2xl border border-border">
              <img src={post.cover_image} alt={p.image_alt || post.title} className="w-full object-cover" />
            </div>
            {p.image_caption && (
              <figcaption className="mt-2 text-center text-xs text-muted-foreground">{p.image_caption}</figcaption>
            )}
          </figure>
        )}

        {toc.length > 2 && (
          <nav aria-label="Table of contents" className="mt-10 rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              <ListTree className="h-3.5 w-3.5" /> On this page
            </div>
            <ul className="mt-3 space-y-1.5 text-sm">
              {toc.map((item, i) => (
                <li key={`${item.id}-${i}`} style={{ paddingLeft: (item.level - 2) * 14 }}>
                  <a href={`#${item.id}`} className="text-muted-foreground transition hover:text-gold">
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div style={style}>
          {post.content && <div className="prose-blog mt-10" dangerouslySetInnerHTML={{ __html: html }} />}
          <BlocksRenderer blocks={blocks} related={related ?? []} />
        </div>

        {faq.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-2xl">Frequently asked</h2>
            <div className="mt-4 space-y-3">
              {faq.map((f, i) => (
                <div key={i} className="rounded-2xl border border-border p-4">
                  <div className="text-sm font-semibold">{f.q}</div>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-14 flex items-center gap-4 rounded-2xl border border-border p-5">
          {p.author_avatar ? (
            <img src={p.author_avatar} alt={post.author_name || "Author"} className="h-14 w-14 rounded-full object-cover" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 font-display text-lg text-gold">
              {(post.author_name || "C")[0]}
            </div>
          )}
          <div>
            <div className="font-display text-lg">{post.author_name || "Campus X"}</div>
            <p className="text-sm text-muted-foreground">
              {p.author_bio || "Writing about building, shipping and landing roles as an Indian student developer."}
            </p>
          </div>
        </section>

        <div className="mt-8">
          <NewsletterBlock />
        </div>

        {(related ?? []).length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-2xl">Keep reading</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {(related ?? []).map((r) => (
                <Link key={r.id} to="/blog/$slug" params={{ slug: r.slug }} className="card-noir card-noir-hover rounded-2xl p-4">
                  <div className="font-display text-base leading-snug">{r.title}</div>
                  {r.excerpt && <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{r.excerpt}</p>}
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </MarketingLayout>
  );
}
