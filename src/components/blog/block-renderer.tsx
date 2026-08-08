import { useState } from "react";
import { Link } from "@tanstack/react-router";
import DOMPurify from "isomorphic-dompurify";
import { ChevronDown, Info, TriangleAlert, Lightbulb, CheckCircle2 } from "lucide-react";
import type { Block } from "@/lib/blog-blocks";
import { slugifyHeading, youtubeId } from "@/lib/blog-blocks";
import { renderMarkdown } from "@/lib/blog-render";

type RelatedPost = { id: string; title: string; slug: string; excerpt?: string | null };

function Html({ html }: { html: string }) {
  return (
    <div
      className="prose-blog"
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(html, { USE_PROFILES: { html: true }, ADD_TAGS: ["iframe"], ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "target"] }),
      }}
    />
  );
}

function Frame({ src, title, height = 420 }: { src: string; title: string; height?: number }) {
  if (!src) return null;
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <iframe
        src={src}
        title={title}
        height={height}
        className="w-full"
        style={{ height }}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function Accordion({ items }: { items: Array<{ title: string; body: string }> }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-border rounded-2xl border border-border">
      {items.map((it, i) => (
        <div key={i}>
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium hover:bg-accent/50"
          >
            {it.title}
            <ChevronDown className={`h-4 w-4 shrink-0 transition ${open === i ? "rotate-180" : ""}`} />
          </button>
          {open === i && <div className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">{it.body}</div>}
        </div>
      ))}
    </div>
  );
}

const CALLOUT_ICON = { info: Info, tip: Lightbulb, warning: TriangleAlert, success: CheckCircle2 } as const;

export function BlockView({ block, related }: { block: Block; related?: RelatedPost[] }) {
  const d = block.data as Record<string, never> & Record<string, unknown>;
  const s = (k: string) => String(d[k] ?? "");

  switch (block.type) {
    case "paragraph":
      return <Html html={renderMarkdown(s("text"))} />;

    case "heading": {
      const level = Number(d.level ?? 2);
      const Tag = (level === 4 ? "h4" : level === 3 ? "h3" : "h2") as "h2" | "h3" | "h4";
      const sizes = { h2: "text-2xl md:text-3xl", h3: "text-xl md:text-2xl", h4: "text-lg" };
      return (
        <Tag id={slugifyHeading(s("text"))} className={`font-display ${sizes[Tag]} leading-snug`}>
          {s("text")}
        </Tag>
      );
    }

    case "image":
      return s("url") ? (
        <figure>
          <img src={s("url")} alt={s("alt") || s("caption")} loading="lazy" className="w-full rounded-2xl border border-border object-cover" />
          {s("caption") && <figcaption className="mt-2 text-center text-xs text-muted-foreground">{s("caption")}</figcaption>}
        </figure>
      ) : null;

    case "gallery": {
      const imgs = (d.images as Array<{ url: string; alt?: string }>) ?? [];
      return (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {imgs.filter((im) => im?.url).map((im, i) => (
            <img key={i} src={im.url} alt={im.alt ?? ""} loading="lazy" className="aspect-square w-full rounded-xl border border-border object-cover" />
          ))}
        </div>
      );
    }

    case "quote":
      return (
        <blockquote className="border-l-2 border-gold/60 pl-5">
          <p className="font-display text-xl italic leading-snug">{s("text")}</p>
          {s("author") && <cite className="mt-2 block text-xs not-italic text-muted-foreground">— {s("author")}</cite>}
        </blockquote>
      );

    case "callout": {
      const variant = (s("variant") || "info") as keyof typeof CALLOUT_ICON;
      const Icon = CALLOUT_ICON[variant] ?? Info;
      return (
        <div className="flex gap-3 rounded-2xl border border-gold/30 bg-gold/5 p-4">
          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
          <div>
            {s("title") && <div className="text-sm font-semibold">{s("title")}</div>}
            <div className="text-sm leading-relaxed text-muted-foreground">{s("text")}</div>
          </div>
        </div>
      );
    }

    case "table": {
      const headers = (d.headers as string[]) ?? [];
      const rows = (d.rows as string[][]) ?? [];
      return (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>{headers.map((h, i) => <th key={i} className="px-4 py-2 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r, i) => (
                <tr key={i}>{r.map((c, j) => <td key={j} className="px-4 py-2">{c}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case "faq": {
      const items = (d.items as Array<{ q: string; a: string }>) ?? [];
      return (
        <div className="space-y-3">
          {items.filter((i) => i.q).map((it, i) => (
            <div key={i} className="rounded-2xl border border-border p-4">
              <div className="text-sm font-semibold">{it.q}</div>
              <div className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{it.a}</div>
            </div>
          ))}
        </div>
      );
    }

    case "accordion":
      return <Accordion items={((d.items as Array<{ title: string; body: string }>) ?? []).filter((i) => i.title)} />;

    case "timeline": {
      const items = (d.items as Array<{ label: string; title: string; body: string }>) ?? [];
      return (
        <ol className="relative space-y-6 border-l border-border pl-6">
          {items.map((it, i) => (
            <li key={i}>
              <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-gold" />
              {it.label && <div className="text-[10px] uppercase tracking-[0.18em] text-gold">{it.label}</div>}
              <div className="font-display text-lg">{it.title}</div>
              <p className="text-sm leading-relaxed text-muted-foreground">{it.body}</p>
            </li>
          ))}
        </ol>
      );
    }

    case "button":
      return s("url") ? (
        <div>
          <a href={s("url")} target="_blank" rel="noopener noreferrer" className={s("variant") === "ghost" ? "btn-ghost" : "btn-ink"}>
            {s("label") || "Open"}
          </a>
        </div>
      ) : null;

    case "divider":
      return <hr className="border-border" />;

    case "code":
      return (
        <pre className="overflow-x-auto rounded-2xl border border-border bg-surface p-4 text-xs">
          <code>{s("code")}</code>
        </pre>
      );

    case "html":
      return <Html html={s("html")} />;

    case "youtube": {
      const id = youtubeId(s("url"));
      if (!id) return null;
      return (
        <figure>
          <div className="aspect-video overflow-hidden rounded-2xl border border-border">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${id}`}
              title={s("caption") || "YouTube video"}
              className="h-full w-full"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
          {s("caption") && <figcaption className="mt-2 text-center text-xs text-muted-foreground">{s("caption")}</figcaption>}
        </figure>
      );
    }

    case "video":
      return s("url") ? (
        <figure>
          <video src={s("url")} controls className="w-full rounded-2xl border border-border" />
          {s("caption") && <figcaption className="mt-2 text-center text-xs text-muted-foreground">{s("caption")}</figcaption>}
        </figure>
      ) : null;

    case "twitter":
      return s("url") ? (
        <blockquote className="rounded-2xl border border-border p-4 text-sm">
          <a href={s("url")} target="_blank" rel="noopener noreferrer" className="text-gold underline">
            View post on X
          </a>
        </blockquote>
      ) : null;

    case "github": {
      const url = s("url");
      if (!url) return null;
      const repo = url.replace(/^https?:\/\/(www\.)?github\.com\//, "");
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="card-noir card-noir-hover block rounded-2xl p-4 text-sm">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">GitHub</div>
          <div className="mt-1 font-display text-lg">{repo}</div>
        </a>
      );
    }

    case "pdf":
      return <Frame src={s("url")} title="PDF document" height={Number(d.height ?? 640)} />;

    case "embed":
      return <Frame src={s("url")} title={s("title") || "Embedded content"} height={Number(d.height ?? 420)} />;

    case "author":
      return (
        <div className="flex items-center gap-4 rounded-2xl border border-border p-4">
          {s("avatar") ? (
            <img src={s("avatar")} alt={s("name")} className="h-14 w-14 rounded-full object-cover" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 font-display text-lg text-gold">
              {(s("name") || "C")[0]}
            </div>
          )}
          <div>
            <div className="font-display text-lg">{s("name") || "Campus X"}</div>
            <p className="text-sm text-muted-foreground">{s("bio")}</p>
            {s("link") && (
              <a href={s("link")} target="_blank" rel="noopener noreferrer" className="text-xs text-gold underline">
                More from this author
              </a>
            )}
          </div>
        </div>
      );

    case "related": {
      const posts = (related ?? []).slice(0, Number(d.limit ?? 3));
      if (posts.length === 0) return null;
      return (
        <div className="grid gap-3 md:grid-cols-3">
          {posts.map((p) => (
            <Link key={p.id} to="/blog/$slug" params={{ slug: p.slug }} className="card-noir card-noir-hover rounded-2xl p-4">
              <div className="font-display text-base leading-snug">{p.title}</div>
              {p.excerpt && <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{p.excerpt}</p>}
            </Link>
          ))}
        </div>
      );
    }

    case "newsletter":
      return <NewsletterBlock title={s("title")} text={s("text")} />;

    case "cta":
      return (
        <div className="rounded-2xl border border-gold/30 bg-gold/5 p-6 text-center">
          <div className="font-display text-2xl">{s("title")}</div>
          {s("text") && <p className="mt-2 text-sm text-muted-foreground">{s("text")}</p>}
          {s("url") && (
            <a href={s("url")} className="btn-ink mt-4 inline-flex">
              {s("label") || "Get started"}
            </a>
          )}
        </div>
      );

    default:
      return null;
  }
}

export function NewsletterBlock({ title, text }: { title?: string; text?: string }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="font-display text-xl">{title || "Get the next post in your inbox"}</div>
      <p className="mt-1 text-sm text-muted-foreground">{text || "No spam. Unsubscribe anytime."}</p>
      {done ? (
        <p className="mt-4 text-sm text-gold">Thanks — you're on the list.</p>
      ) : (
        <form
          className="mt-4 flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (email.includes("@")) setDone(true);
          }}
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@college.edu"
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <button type="submit" className="btn-ink">Subscribe</button>
        </form>
      )}
    </div>
  );
}

export function BlocksRenderer({ blocks, related }: { blocks: Block[]; related?: RelatedPost[] }) {
  if (!blocks || blocks.length === 0) return null;
  return (
    <div className="mt-10 space-y-6">
      {blocks.map((b) => (
        <BlockView key={b.id} block={b} related={related} />
      ))}
    </div>
  );
}
