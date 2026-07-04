import { createFileRoute, Link, notFound, ErrorComponent, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { MarketingLayout } from "@/components/marketing-layout";
import { getBlogBySlug } from "@/lib/blog.functions";
import { ArrowLeft, Clock } from "lucide-react";

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
    if (p?.cover_image) {
      meta.push({ property: "og:image", content: p.cover_image });
      meta.push({ name: "twitter:image", content: p.cover_image });
    }
    return { meta, links: [{ rel: "canonical", href: url }] };
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

function renderMarkdown(md: string): string {
  // Minimal, safe-ish markdown → HTML. Blocks: headings, lists, paragraphs, blockquotes, code fences.
  const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const inline = (s: string) =>
    s
      .replace(/`([^`]+)`/g, (_, c) => `<code>${escape(c)}</code>`)
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, u) => `<a href="${escape(u)}" target="_blank" rel="noopener noreferrer">${escape(t)}</a>`);

  const lines = md.replace(/\r/g, "").split("\n");
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^```/.test(line)) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
      i++;
      out.push(`<pre><code>${escape(buf.join("\n"))}</code></pre>`);
      continue;
    }
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const level = Math.min(6, Math.max(2, h[1].length)); // clamp to h2..h6
      out.push(`<h${level}>${inline(escape(h[2]))}</h${level}>`);
      i++; continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      out.push(`<ul>${buf.map((b) => `<li>${inline(escape(b))}</li>`).join("")}</ul>`);
      continue;
    }
    if (/^\s*>\s?/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*>\s?/, ""));
        i++;
      }
      out.push(`<blockquote>${inline(escape(buf.join(" ")))}</blockquote>`);
      continue;
    }
    if (line.trim() === "") { i++; continue; }
    const buf: string[] = [];
    while (i < lines.length && lines[i].trim() !== "" && !/^(#{1,6})\s+/.test(lines[i]) && !/^\s*[-*]\s+/.test(lines[i]) && !/^```/.test(lines[i])) {
      buf.push(lines[i]);
      i++;
    }
    out.push(`<p>${inline(escape(buf.join(" ")))}</p>`);
  }
  return out.join("\n");
}

function BlogDetail() {
  const params = Route.useParams();
  const { data: post } = useSuspenseQuery(blogQO(params.slug));
  if (!post) return null;
  const html = renderMarkdown(post.content || "");
  const dt = post.published_at ? new Date(post.published_at) : null;

  return (
    <MarketingLayout>
      <article className="mx-auto max-w-3xl px-4 pb-24 pt-4 md:px-8">
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition hover:text-gold">
          <ArrowLeft className="h-3.5 w-3.5" /> All posts
        </Link>
        <header className="mt-6">
          {post.tags && post.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {post.tags.map((t: string) => (
                <span key={t} className="rounded-full border border-gold/30 bg-gold/5 px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-gold">
                  {t}
                </span>
              ))}
            </div>
          )}
          <h1 className="font-display text-4xl leading-[1.08] tracking-tight md:text-5xl">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              {post.excerpt}
            </p>
          )}
          <div className="mt-5 flex items-center gap-4 text-xs text-muted-foreground">
            <span>{post.author_name || "Campus X"}</span>
            {dt && <span>{dt.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}</span>}
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {post.read_minutes} min read</span>
          </div>
        </header>

        {post.cover_image && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-border">
            <img src={post.cover_image} alt={post.title} className="w-full object-cover" />
          </div>
        )}

        <div
          className="prose-blog mt-10"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>
    </MarketingLayout>
  );
}
