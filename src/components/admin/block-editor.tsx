import { useState } from "react";
import { ChevronDown, ChevronUp, GripVertical, Plus, Trash2, Copy } from "lucide-react";
import type { Block, BlockType, BlogTypography } from "@/lib/blog-blocks";
import { BLOCK_LIBRARY, createBlock, newBlockId } from "@/lib/blog-blocks";

const input =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold";
const label = "text-[10px] uppercase tracking-[0.16em] text-muted-foreground";

function T({ children }: { children: React.ReactNode }) {
  return <div className={label}>{children}</div>;
}

function Fields({ block, set }: { block: Block; set: (patch: Record<string, unknown>) => void }) {
  const d = block.data as Record<string, unknown>;
  const s = (k: string) => String(d[k] ?? "");

  switch (block.type) {
    case "paragraph":
      return <textarea rows={5} className={input} value={s("text")} placeholder="Markdown supported" onChange={(e) => set({ text: e.target.value })} />;

    case "heading":
      return (
        <div className="flex gap-2">
          <select className={`${input} w-24`} value={String(d.level ?? 2)} onChange={(e) => set({ level: Number(e.target.value) })}>
            <option value="2">H2</option>
            <option value="3">H3</option>
            <option value="4">H4</option>
          </select>
          <input className={input} value={s("text")} placeholder="Heading text" onChange={(e) => set({ text: e.target.value })} />
        </div>
      );

    case "image":
      return (
        <div className="grid gap-2 md:grid-cols-3">
          <input className={input} value={s("url")} placeholder="Image URL" onChange={(e) => set({ url: e.target.value })} />
          <input className={input} value={s("alt")} placeholder="Alt text (SEO)" onChange={(e) => set({ alt: e.target.value })} />
          <input className={input} value={s("caption")} placeholder="Caption" onChange={(e) => set({ caption: e.target.value })} />
        </div>
      );

    case "gallery": {
      const images = (d.images as Array<{ url: string; alt?: string }>) ?? [];
      return (
        <div className="space-y-2">
          {images.map((im, i) => (
            <div key={i} className="flex gap-2">
              <input className={input} value={im.url} placeholder="Image URL" onChange={(e) => {
                const next = [...images]; next[i] = { ...im, url: e.target.value }; set({ images: next });
              }} />
              <input className={input} value={im.alt ?? ""} placeholder="Alt" onChange={(e) => {
                const next = [...images]; next[i] = { ...im, alt: e.target.value }; set({ images: next });
              }} />
              <button type="button" onClick={() => set({ images: images.filter((_, j) => j !== i) })} className="rounded-lg border border-border px-2 text-xs">✕</button>
            </div>
          ))}
          <button type="button" onClick={() => set({ images: [...images, { url: "", alt: "" }] })} className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-accent">+ Image</button>
        </div>
      );
    }

    case "quote":
      return (
        <div className="space-y-2">
          <textarea rows={3} className={input} value={s("text")} placeholder="Quote" onChange={(e) => set({ text: e.target.value })} />
          <input className={input} value={s("author")} placeholder="Attribution" onChange={(e) => set({ author: e.target.value })} />
        </div>
      );

    case "callout":
      return (
        <div className="space-y-2">
          <div className="flex gap-2">
            <select className={`${input} w-36`} value={s("variant") || "info"} onChange={(e) => set({ variant: e.target.value })}>
              <option value="info">Info</option>
              <option value="tip">Tip</option>
              <option value="warning">Warning</option>
              <option value="success">Success</option>
            </select>
            <input className={input} value={s("title")} placeholder="Title" onChange={(e) => set({ title: e.target.value })} />
          </div>
          <textarea rows={3} className={input} value={s("text")} placeholder="Body" onChange={(e) => set({ text: e.target.value })} />
        </div>
      );

    case "table": {
      const headers = (d.headers as string[]) ?? [];
      const rows = (d.rows as string[][]) ?? [];
      return (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {headers.map((h, i) => (
              <input key={i} className={`${input} w-40`} value={h} placeholder={`Col ${i + 1}`} onChange={(e) => {
                const next = [...headers]; next[i] = e.target.value; set({ headers: next });
              }} />
            ))}
            <button type="button" className="rounded-lg border border-border px-3 text-xs" onClick={() => set({ headers: [...headers, ""], rows: rows.map((r) => [...r, ""]) })}>+ Col</button>
          </div>
          {rows.map((r, ri) => (
            <div key={ri} className="flex flex-wrap gap-2">
              {r.map((c, ci) => (
                <input key={ci} className={`${input} w-40`} value={c} onChange={(e) => {
                  const next = rows.map((row) => [...row]); next[ri][ci] = e.target.value; set({ rows: next });
                }} />
              ))}
              <button type="button" className="rounded-lg border border-border px-2 text-xs" onClick={() => set({ rows: rows.filter((_, j) => j !== ri) })}>✕</button>
            </div>
          ))}
          <button type="button" className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-accent" onClick={() => set({ rows: [...rows, headers.map(() => "")] })}>+ Row</button>
        </div>
      );
    }

    case "faq": {
      const items = (d.items as Array<{ q: string; a: string }>) ?? [];
      return (
        <div className="space-y-2">
          {items.map((it, i) => (
            <div key={i} className="space-y-1 rounded-lg border border-border p-2">
              <input className={input} value={it.q} placeholder="Question" onChange={(e) => {
                const next = [...items]; next[i] = { ...it, q: e.target.value }; set({ items: next });
              }} />
              <textarea rows={2} className={input} value={it.a} placeholder="Answer" onChange={(e) => {
                const next = [...items]; next[i] = { ...it, a: e.target.value }; set({ items: next });
              }} />
              <button type="button" className="text-xs text-destructive" onClick={() => set({ items: items.filter((_, j) => j !== i) })}>Remove</button>
            </div>
          ))}
          <button type="button" className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-accent" onClick={() => set({ items: [...items, { q: "", a: "" }] })}>+ Question</button>
        </div>
      );
    }

    case "accordion": {
      const items = (d.items as Array<{ title: string; body: string }>) ?? [];
      return (
        <div className="space-y-2">
          {items.map((it, i) => (
            <div key={i} className="space-y-1 rounded-lg border border-border p-2">
              <input className={input} value={it.title} placeholder="Section title" onChange={(e) => {
                const next = [...items]; next[i] = { ...it, title: e.target.value }; set({ items: next });
              }} />
              <textarea rows={2} className={input} value={it.body} placeholder="Section body" onChange={(e) => {
                const next = [...items]; next[i] = { ...it, body: e.target.value }; set({ items: next });
              }} />
              <button type="button" className="text-xs text-destructive" onClick={() => set({ items: items.filter((_, j) => j !== i) })}>Remove</button>
            </div>
          ))}
          <button type="button" className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-accent" onClick={() => set({ items: [...items, { title: "", body: "" }] })}>+ Section</button>
        </div>
      );
    }

    case "timeline": {
      const items = (d.items as Array<{ label: string; title: string; body: string }>) ?? [];
      return (
        <div className="space-y-2">
          {items.map((it, i) => (
            <div key={i} className="space-y-1 rounded-lg border border-border p-2">
              <div className="flex gap-2">
                <input className={`${input} w-36`} value={it.label} placeholder="Step / date" onChange={(e) => {
                  const next = [...items]; next[i] = { ...it, label: e.target.value }; set({ items: next });
                }} />
                <input className={input} value={it.title} placeholder="Title" onChange={(e) => {
                  const next = [...items]; next[i] = { ...it, title: e.target.value }; set({ items: next });
                }} />
              </div>
              <textarea rows={2} className={input} value={it.body} placeholder="Detail" onChange={(e) => {
                const next = [...items]; next[i] = { ...it, body: e.target.value }; set({ items: next });
              }} />
              <button type="button" className="text-xs text-destructive" onClick={() => set({ items: items.filter((_, j) => j !== i) })}>Remove</button>
            </div>
          ))}
          <button type="button" className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-accent" onClick={() => set({ items: [...items, { label: "", title: "", body: "" }] })}>+ Milestone</button>
        </div>
      );
    }

    case "button":
      return (
        <div className="grid gap-2 md:grid-cols-3">
          <input className={input} value={s("label")} placeholder="Label" onChange={(e) => set({ label: e.target.value })} />
          <input className={input} value={s("url")} placeholder="https://…" onChange={(e) => set({ url: e.target.value })} />
          <select className={input} value={s("variant") || "primary"} onChange={(e) => set({ variant: e.target.value })}>
            <option value="primary">Primary</option>
            <option value="ghost">Ghost</option>
          </select>
        </div>
      );

    case "divider":
      return <p className="text-xs text-muted-foreground">A horizontal rule renders here.</p>;

    case "code":
      return (
        <div className="space-y-2">
          <input className={`${input} w-40`} value={s("language")} placeholder="Language" onChange={(e) => set({ language: e.target.value })} />
          <textarea rows={6} className={`${input} font-mono`} value={s("code")} onChange={(e) => set({ code: e.target.value })} />
        </div>
      );

    case "html":
      return <textarea rows={6} className={`${input} font-mono`} value={s("html")} placeholder="<section>…</section> (sanitized on render)" onChange={(e) => set({ html: e.target.value })} />;

    case "youtube":
    case "video":
      return (
        <div className="grid gap-2 md:grid-cols-2">
          <input className={input} value={s("url")} placeholder={block.type === "youtube" ? "YouTube URL" : "MP4 / webm URL"} onChange={(e) => set({ url: e.target.value })} />
          <input className={input} value={s("caption")} placeholder="Caption" onChange={(e) => set({ caption: e.target.value })} />
        </div>
      );

    case "twitter":
    case "github":
      return <input className={input} value={s("url")} placeholder={block.type === "twitter" ? "https://x.com/…" : "https://github.com/owner/repo"} onChange={(e) => set({ url: e.target.value })} />;

    case "pdf":
    case "embed":
      return (
        <div className="grid gap-2 md:grid-cols-3">
          <input className={input} value={s("url")} placeholder="URL" onChange={(e) => set({ url: e.target.value })} />
          <input className={input} value={s("title")} placeholder="Title (a11y)" onChange={(e) => set({ title: e.target.value })} />
          <input type="number" className={input} value={String(d.height ?? 420)} placeholder="Height" onChange={(e) => set({ height: Number(e.target.value) })} />
        </div>
      );

    case "author":
      return (
        <div className="grid gap-2 md:grid-cols-2">
          <input className={input} value={s("name")} placeholder="Name" onChange={(e) => set({ name: e.target.value })} />
          <input className={input} value={s("avatar")} placeholder="Avatar URL" onChange={(e) => set({ avatar: e.target.value })} />
          <input className={input} value={s("link")} placeholder="Profile link" onChange={(e) => set({ link: e.target.value })} />
          <textarea rows={2} className={input} value={s("bio")} placeholder="Short bio" onChange={(e) => set({ bio: e.target.value })} />
        </div>
      );

    case "related":
      return (
        <input type="number" min={1} max={6} className={`${input} w-28`} value={String(d.limit ?? 3)} onChange={(e) => set({ limit: Number(e.target.value) })} />
      );

    case "newsletter":
      return (
        <div className="grid gap-2 md:grid-cols-2">
          <input className={input} value={s("title")} placeholder="Title" onChange={(e) => set({ title: e.target.value })} />
          <input className={input} value={s("text")} placeholder="Subtext" onChange={(e) => set({ text: e.target.value })} />
        </div>
      );

    case "cta":
      return (
        <div className="grid gap-2 md:grid-cols-2">
          <input className={input} value={s("title")} placeholder="Headline" onChange={(e) => set({ title: e.target.value })} />
          <input className={input} value={s("text")} placeholder="Supporting line" onChange={(e) => set({ text: e.target.value })} />
          <input className={input} value={s("label")} placeholder="Button label" onChange={(e) => set({ label: e.target.value })} />
          <input className={input} value={s("url")} placeholder="Button URL" onChange={(e) => set({ url: e.target.value })} />
        </div>
      );

    default:
      return null;
  }
}

export function TypographyPanel({
  value,
  onChange,
}: {
  value: BlogTypography;
  onChange: (v: BlogTypography) => void;
}) {
  const set = (patch: Partial<BlogTypography>) => onChange({ ...value, ...patch });
  return (
    <div className="grid gap-3 rounded-2xl border border-border p-4 md:grid-cols-3">
      <div className="md:col-span-3">
        <T>Typography (overrides site defaults for this post only)</T>
      </div>
      <div>
        <T>Body font</T>
        <select className={input} value={value.fontFamily ?? ""} onChange={(e) => set({ fontFamily: e.target.value || undefined })}>
          <option value="">Site default</option>
          <option value="Georgia, 'Times New Roman', serif">Georgia (serif)</option>
          <option value="system-ui, -apple-system, 'Segoe UI', sans-serif">System sans</option>
          <option value="ui-monospace, SFMono-Regular, Menlo, monospace">Monospace</option>
        </select>
      </div>
      <div>
        <T>Font size (px)</T>
        <input type="number" min={12} max={26} className={input} value={value.fontSize ?? ""} onChange={(e) => set({ fontSize: e.target.value ? Number(e.target.value) : undefined })} />
      </div>
      <div>
        <T>Font weight</T>
        <input type="number" min={300} max={800} step={100} className={input} value={value.fontWeight ?? ""} onChange={(e) => set({ fontWeight: e.target.value ? Number(e.target.value) : undefined })} />
      </div>
      <div>
        <T>Line height</T>
        <input type="number" step="0.05" min={1.2} max={2.2} className={input} value={value.lineHeight ?? ""} onChange={(e) => set({ lineHeight: e.target.value ? Number(e.target.value) : undefined })} />
      </div>
      <div>
        <T>Letter spacing (em)</T>
        <input type="number" step="0.005" min={-0.05} max={0.15} className={input} value={value.letterSpacing ?? ""} onChange={(e) => set({ letterSpacing: e.target.value ? Number(e.target.value) : undefined })} />
      </div>
      <div>
        <T>Alignment</T>
        <select className={input} value={value.align ?? ""} onChange={(e) => set({ align: (e.target.value || undefined) as BlogTypography["align"] })}>
          <option value="">Default</option>
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="justify">Justify</option>
        </select>
      </div>
      <div className="md:col-span-3">
        <button type="button" onClick={() => onChange({})} className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-accent">
          Reset to site typography
        </button>
      </div>
    </div>
  );
}

export function BlockEditor({ blocks, onChange }: { blocks: Block[]; onChange: (b: Block[]) => void }) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [picker, setPicker] = useState(false);

  const update = (i: number, patch: Record<string, unknown>) => {
    const next = [...blocks];
    next[i] = { ...next[i], data: { ...next[i].data, ...patch } };
    onChange(next);
  };
  const move = (from: number, to: number) => {
    if (to < 0 || to >= blocks.length) return;
    const next = [...blocks];
    const [b] = next.splice(from, 1);
    next.splice(to, 0, b);
    onChange(next);
  };
  const add = (type: BlockType) => {
    onChange([...blocks, createBlock(type)]);
    setPicker(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Content blocks</div>
          <p className="text-xs text-muted-foreground">Drag to reorder. Blocks render below the main body.</p>
        </div>
        <button type="button" onClick={() => setPicker((v) => !v)} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground">
          <Plus className="h-3.5 w-3.5" /> Add block
        </button>
      </div>

      {picker && (
        <div className="grid gap-2 rounded-2xl border border-border p-3 sm:grid-cols-3 lg:grid-cols-4">
          {BLOCK_LIBRARY.map((b) => (
            <button key={b.type} type="button" onClick={() => add(b.type)} className="rounded-lg border border-border px-3 py-2 text-left text-xs transition hover:border-gold hover:bg-accent">
              <div className="font-medium">{b.label}</div>
              <div className="text-[10px] text-muted-foreground">{b.hint}</div>
            </button>
          ))}
        </div>
      )}

      {blocks.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
          No blocks yet — the post renders just the main body.
        </p>
      )}

      {blocks.map((b, i) => (
        <div
          key={b.id}
          draggable
          onDragStart={() => setDragIndex(i)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            if (dragIndex !== null && dragIndex !== i) move(dragIndex, i);
            setDragIndex(null);
          }}
          className={`rounded-2xl border p-3 ${dragIndex === i ? "border-gold" : "border-border"}`}
        >
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground" />
            <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] uppercase tracking-wide">
              {BLOCK_LIBRARY.find((l) => l.type === b.type)?.label ?? b.type}
            </span>
            <div className="ml-auto flex items-center gap-1">
              <button type="button" aria-label="Move up" onClick={() => move(i, i - 1)} className="rounded border border-border p-1"><ChevronUp className="h-3 w-3" /></button>
              <button type="button" aria-label="Move down" onClick={() => move(i, i + 1)} className="rounded border border-border p-1"><ChevronDown className="h-3 w-3" /></button>
              <button
                type="button"
                aria-label="Duplicate block"
                onClick={() => {
                  const next = [...blocks];
                  next.splice(i + 1, 0, { ...b, id: newBlockId(), data: { ...b.data } });
                  onChange(next);
                }}
                className="rounded border border-border p-1"
              >
                <Copy className="h-3 w-3" />
              </button>
              <button type="button" aria-label="Delete block" onClick={() => onChange(blocks.filter((_, j) => j !== i))} className="rounded border border-destructive/40 p-1 text-destructive">
                <Trash2 className="h-3 w-3" />
              </button>
              <button type="button" onClick={() => setCollapsed((c) => ({ ...c, [b.id]: !c[b.id] }))} className="rounded border border-border px-2 py-1 text-[10px]">
                {collapsed[b.id] ? "Open" : "Hide"}
              </button>
            </div>
          </div>
          {!collapsed[b.id] && <div className="mt-3">{<Fields block={b} set={(patch) => update(i, patch)} />}</div>}
        </div>
      ))}
    </div>
  );
}
