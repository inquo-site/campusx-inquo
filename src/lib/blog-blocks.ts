// Shared, client-safe block model for the blog editor + public renderer.

export type BlockType =
  | "paragraph"
  | "heading"
  | "image"
  | "gallery"
  | "quote"
  | "callout"
  | "table"
  | "faq"
  | "accordion"
  | "timeline"
  | "button"
  | "divider"
  | "code"
  | "html"
  | "youtube"
  | "video"
  | "twitter"
  | "github"
  | "pdf"
  | "embed"
  | "author"
  | "related"
  | "newsletter"
  | "cta";

export type Block = {
  id: string;
  type: BlockType;
  data: Record<string, unknown>;
};

export type BlogTypography = {
  fontFamily?: string;
  fontSize?: number; // px
  fontWeight?: number;
  lineHeight?: number;
  letterSpacing?: number; // em
  align?: "left" | "center" | "right" | "justify";
  headingFont?: string;
};

export const FONT_CHOICES: Array<{ label: string; value: string }> = [
  { label: "Site default (display)", value: "var(--font-display, inherit)" },
  { label: "Site default (body)", value: "inherit" },
  { label: "Georgia (serif)", value: "Georgia, 'Times New Roman', serif" },
  { label: "Inter / system sans", value: "system-ui, -apple-system, 'Segoe UI', sans-serif" },
  { label: "Monospace", value: "ui-monospace, SFMono-Regular, Menlo, monospace" },
  { label: "Custom…", value: "__custom__" },
];

export const BLOCK_LIBRARY: Array<{ type: BlockType; label: string; hint: string }> = [
  { type: "paragraph", label: "Paragraph", hint: "Rich text / markdown" },
  { type: "heading", label: "Heading", hint: "H2 / H3 / H4" },
  { type: "image", label: "Image", hint: "URL + alt + caption" },
  { type: "gallery", label: "Image gallery", hint: "Grid of images" },
  { type: "quote", label: "Quote", hint: "Pull quote + author" },
  { type: "callout", label: "Callout", hint: "Info / tip / warning" },
  { type: "table", label: "Table", hint: "Rows and columns" },
  { type: "faq", label: "FAQ", hint: "Question & answer list" },
  { type: "accordion", label: "Accordion", hint: "Collapsible sections" },
  { type: "timeline", label: "Timeline", hint: "Ordered milestones" },
  { type: "button", label: "Button", hint: "Label + link" },
  { type: "divider", label: "Divider", hint: "Section break" },
  { type: "code", label: "Code", hint: "Syntax block" },
  { type: "html", label: "Custom HTML", hint: "Sanitized raw HTML" },
  { type: "youtube", label: "YouTube", hint: "Video embed" },
  { type: "video", label: "Video file", hint: "MP4 / webm URL" },
  { type: "twitter", label: "X / Twitter", hint: "Post embed" },
  { type: "github", label: "GitHub", hint: "Repo or gist" },
  { type: "pdf", label: "PDF", hint: "Inline document" },
  { type: "embed", label: "Custom embed", hint: "Any iframe URL" },
  { type: "author", label: "Author", hint: "Bio card" },
  { type: "related", label: "Related posts", hint: "Auto-picked posts" },
  { type: "newsletter", label: "Newsletter", hint: "Subscribe block" },
  { type: "cta", label: "CTA", hint: "Headline + button" },
];

export function newBlockId() {
  return `b_${Math.random().toString(36).slice(2, 10)}`;
}

export function createBlock(type: BlockType): Block {
  const defaults: Record<string, Record<string, unknown>> = {
    paragraph: { text: "" },
    heading: { level: 2, text: "" },
    image: { url: "", alt: "", caption: "" },
    gallery: { images: [] },
    quote: { text: "", author: "" },
    callout: { variant: "info", title: "", text: "" },
    table: { headers: ["Column A", "Column B"], rows: [["", ""]] },
    faq: { items: [{ q: "", a: "" }] },
    accordion: { items: [{ title: "", body: "" }] },
    timeline: { items: [{ label: "", title: "", body: "" }] },
    button: { label: "Read more", url: "", variant: "primary" },
    divider: {},
    code: { language: "ts", code: "" },
    html: { html: "" },
    youtube: { url: "", caption: "" },
    video: { url: "", caption: "" },
    twitter: { url: "" },
    github: { url: "" },
    pdf: { url: "", height: 640 },
    embed: { url: "", height: 420, title: "Embedded content" },
    author: { name: "", bio: "", avatar: "", link: "" },
    related: { limit: 3 },
    newsletter: { title: "Get the next post in your inbox", text: "No spam. Unsubscribe anytime." },
    cta: { title: "", text: "", label: "Get started", url: "" },
  };
  return { id: newBlockId(), type, data: { ...(defaults[type] ?? {}) } };
}

export function youtubeId(url: string): string | null {
  const m =
    url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/) ?? null;
  return m ? m[1] : null;
}

export function slugifyHeading(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

/** Headings extracted from markdown/html content + heading blocks, for the TOC. */
export function buildToc(content: string, format: "markdown" | "html", blocks: Block[]) {
  const items: Array<{ id: string; text: string; level: number }> = [];
  if (format === "markdown") {
    for (const line of content.split("\n")) {
      const m = line.match(/^(#{2,4})\s+(.*)$/);
      if (m) items.push({ level: m[1].length, text: m[2].trim(), id: slugifyHeading(m[2]) });
    }
  } else {
    const re = /<h([2-4])[^>]*>([\s\S]*?)<\/h\1>/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(content))) {
      const text = m[2].replace(/<[^>]+>/g, "").trim();
      if (text) items.push({ level: Number(m[1]), text, id: slugifyHeading(text) });
    }
  }
  for (const b of blocks) {
    if (b.type === "heading") {
      const text = String(b.data.text ?? "").trim();
      if (text) items.push({ level: Number(b.data.level ?? 2), text, id: slugifyHeading(text) });
    }
  }
  return items;
}

export function estimateReadMinutes(content: string, blocks: Block[]) {
  const blockText = blocks
    .map((b) => Object.values(b.data).filter((v) => typeof v === "string").join(" "))
    .join(" ");
  const words = `${content} ${blockText}`.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
