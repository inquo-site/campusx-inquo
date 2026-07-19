import React, { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  studioSuggestTopics,
  studioSeoResearch,
  studioWriteBlog,
  studioHumanize,
  studioGenerateCover,
} from "@/lib/blog-studio.functions";
import { adminUpsertBlog } from "@/lib/blog.functions";

type Topic = { title: string; angle: string; primary_keyword: string; why_it_works: string };
type Seo = Awaited<ReturnType<ReturnType<typeof useServerFn<typeof studioSeoResearch>>>>;

type Props = {
  token: string;
  onClose: () => void;
  onDone: (info: { id: string; slug: string; status: "draft" | "published" }) => void;
};

const WORD_OPTIONS = [500, 800, 1200, 1800] as const;

export function BlogStudioWizard({ token, onClose, onDone }: Props) {
  const suggestTopics = useServerFn(studioSuggestTopics);
  const seoResearch = useServerFn(studioSeoResearch);
  const writeBlog = useServerFn(studioWriteBlog);
  const humanize = useServerFn(studioHumanize);
  const genCover = useServerFn(studioGenerateCover);
  const upsert = useServerFn(adminUpsertBlog);

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [busy, setBusy] = useState<string>("");
  const [err, setErr] = useState<string>("");

  // step 1: topics
  const [niche, setNiche] = useState("");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [pickedTopic, setPickedTopic] = useState<Topic | null>(null);
  const [wordCount, setWordCount] = useState<number>(900);

  // step 2: seo
  const [seo, setSeo] = useState<Seo | null>(null);
  const [pickedTitle, setPickedTitle] = useState<string>("");

  // step 3: cover
  const [coverUrl, setCoverUrl] = useState<string>("");
  const [vibe, setVibe] = useState("");

  // step 4/5: content
  const [content, setContent] = useState<string>("");
  const [readMinutes, setReadMinutes] = useState<number>(5);

  const load = async <T,>(label: string, fn: () => Promise<T>): Promise<T | null> => {
    setErr(""); setBusy(label);
    try { return await fn(); }
    catch (e) { setErr((e as Error).message); return null; }
    finally { setBusy(""); }
  };

  const doTopics = async () => {
    const out = await load("Suggesting topics…", () =>
      suggestTopics({ data: { token, niche: niche || undefined, seed: Math.floor(Math.random() * 1e9) } }),
    );
    if (out) setTopics(out.topics);
  };

  const doSeo = async () => {
    if (!pickedTopic) return;
    const out = await load("Doing SEO research…", () =>
      seoResearch({ data: { token, topic: pickedTopic.title, primary_keyword: pickedTopic.primary_keyword } }),
    );
    if (out) {
      setSeo(out);
      setPickedTitle(out.suggested_titles[0] ?? pickedTopic.title);
      setStep(3);
    }
  };

  const doCover = async () => {
    const out = await load("Generating cover image…", () =>
      genCover({ data: { token, title: pickedTitle, vibe: vibe || undefined } }),
    );
    if (out) setCoverUrl(out.url);
  };

  const doWrite = async () => {
    if (!seo) return;
    const out = await load(`Writing ~${wordCount} words…`, () =>
      writeBlog({
        data: {
          token,
          title: pickedTitle,
          primary_keyword: seo.primary_keyword,
          secondary_keywords: seo.secondary_keywords,
          outline: seo.outline,
          word_count: wordCount,
        },
      }),
    );
    if (out) {
      setContent(out.content_markdown);
      setReadMinutes(out.read_minutes);
      setStep(5);
    }
  };

  const doHumanize = async () => {
    if (!content) return;
    const out = await load("Humanizing…", () => humanize({ data: { token, content } }));
    if (out) setContent(out.content_markdown);
  };

  const doPublish = async (status: "draft" | "published") => {
    if (!seo) return;
    const out = await load(status === "published" ? "Publishing…" : "Saving draft…", () =>
      upsert({
        data: {
          token,
          id: null,
          title: pickedTitle,
          slug: seo.suggested_slug,
          excerpt: seo.suggested_excerpt,
          content,
          content_format: "markdown" as const,
          cover_image: coverUrl || null,
          tags: seo.tags,
          status,
          is_featured: false,
          author_name: "Campus X Editor",
          read_minutes: readMinutes || 5,
          force: false,
        },
      }),
    );
    if (out) onDone({ id: out.id, slug: out.slug, status });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-3xl rounded-2xl border border-gold/30 bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gold">AI Blog Studio</p>
            <h2 className="text-lg font-semibold">Step {step} of 6 — {[
              "Pick a topic",
              "SEO & title",
              "Cover image",
              "Length & write",
              "Humanize & review",
              "Publish",
            ][step - 1]}</h2>
          </div>
          <button onClick={onClose} className="rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-accent">✕</button>
        </div>

        {(busy || err) && (
          <div className="border-b border-border/60 px-5 py-2 text-sm">
            {busy && <span className="text-muted-foreground">⏳ {busy}</span>}
            {err && <span className="text-red-400">{err}</span>}
          </div>
        )}

        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                <input
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="Niche (optional) e.g. off-campus jobs, DSA, AI for students"
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
                <button
                  onClick={doTopics}
                  disabled={!!busy}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                >
                  {topics.length ? "Refresh options" : "Suggest topics"}
                </button>
              </div>
              <div className="grid gap-2">
                {topics.map((t, i) => {
                  const active = pickedTopic?.title === t.title;
                  return (
                    <button
                      key={i}
                      onClick={() => setPickedTopic(t)}
                      className={`rounded-xl border p-3 text-left transition ${active ? "border-gold/60 bg-gold/10" : "border-border hover:bg-accent"}`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`mt-1 h-4 w-4 shrink-0 rounded-full border ${active ? "border-gold bg-gold" : "border-border"}`}>
                          {active && <span className="block h-full w-full rounded-full bg-background scale-50" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{t.title}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{t.angle}</p>
                          <div className="mt-1 flex flex-wrap gap-2 text-[10px]">
                            <span className="rounded bg-gold/10 px-1.5 py-0.5 font-mono text-gold">{t.primary_keyword}</span>
                            <span className="text-muted-foreground">{t.why_it_works}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {pickedTopic && (
                <div className="rounded-xl border border-border/60 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Word count</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {WORD_OPTIONS.map((w) => (
                      <button
                        key={w}
                        onClick={() => setWordCount(w)}
                        className={`rounded-md border px-3 py-1 text-xs ${wordCount === w ? "border-gold bg-gold/10 text-gold" : "border-border"}`}
                      >
                        {w} words
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end">
                <button
                  onClick={() => { setStep(2); doSeo(); }}
                  disabled={!pickedTopic || !!busy}
                  className="rounded-lg bg-gold px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
                >
                  Next: SEO research →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Researching keywords, intent and titles…</p>
              {seo && (
                <>
                  <InfoRow k="Primary keyword" v={seo.primary_keyword} />
                  <InfoRow k="Search intent" v={seo.search_intent} />
                  <InfoRow k="Secondary keywords" v={seo.secondary_keywords.join(" · ")} />
                </>
              )}
            </div>
          )}

          {step === 3 && seo && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Pick a title</p>
                <div className="mt-2 space-y-1.5">
                  {seo.suggested_titles.map((t, i) => (
                    <button
                      key={i}
                      onClick={() => setPickedTitle(t)}
                      className={`w-full rounded-md border px-3 py-2 text-left text-sm ${pickedTitle === t ? "border-gold bg-gold/10" : "border-border hover:bg-accent"}`}
                    >
                      {t} <span className="ml-1 text-[10px] text-muted-foreground">({t.length} ch)</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Cover image</p>
                <div className="mt-2 flex flex-col gap-2 md:flex-row">
                  <input
                    value={vibe}
                    onChange={(e) => setVibe(e.target.value)}
                    placeholder="Vibe (optional) e.g. cyberpunk, minimal, warm gradient"
                    className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  />
                  <button
                    onClick={doCover}
                    disabled={!!busy}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                  >
                    {coverUrl ? "Regenerate" : "Generate cover"}
                  </button>
                </div>
                {coverUrl && (
                  <img src={coverUrl} alt="cover" className="mt-3 max-h-64 w-full rounded-lg border border-border object-cover" />
                )}
              </div>
              <div className="flex justify-between">
                <button onClick={() => setStep(1)} className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent">← Back</button>
                <button
                  onClick={() => setStep(4)}
                  disabled={!pickedTitle}
                  className="rounded-lg bg-gold px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
                >
                  Next: Write blog →
                </button>
              </div>
            </div>
          )}

          {step === 4 && seo && (
            <div className="space-y-4">
              <InfoRow k="Title" v={pickedTitle} />
              <InfoRow k="Length" v={`${wordCount} words`} />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Outline</p>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
                  {seo.outline.map((o, i) => <li key={i}>{o}</li>)}
                </ol>
              </div>
              <div className="flex justify-between">
                <button onClick={() => setStep(3)} className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent">← Back</button>
                <button
                  onClick={doWrite}
                  disabled={!!busy}
                  className="rounded-lg bg-gold px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
                >
                  ✍️ Generate {wordCount}-word blog
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Draft ({content.split(/\s+/).filter(Boolean).length} words · ~{readMinutes} min read)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={doHumanize}
                    disabled={!!busy}
                    className="rounded-md border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold disabled:opacity-50"
                  >
                    🧑 Humanize
                  </button>
                </div>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={18}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-xs leading-relaxed"
              />
              <div className="flex justify-between">
                <button onClick={() => setStep(4)} className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent">← Back</button>
                <button
                  onClick={() => setStep(6)}
                  disabled={!content}
                  className="rounded-lg bg-gold px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
                >
                  Next: Publish →
                </button>
              </div>
            </div>
          )}

          {step === 6 && seo && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border/60 p-4">
                {coverUrl && <img src={coverUrl} alt="" className="mb-3 h-40 w-full rounded-lg object-cover" />}
                <h3 className="text-base font-semibold">{pickedTitle}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{seo.suggested_excerpt}</p>
                <div className="mt-2 flex flex-wrap gap-1 text-[10px]">
                  {seo.tags.map((t) => <span key={t} className="rounded bg-accent px-1.5 py-0.5">{t}</span>)}
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button onClick={() => setStep(5)} className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent">← Back</button>
                <div className="flex gap-2">
                  <button
                    onClick={() => doPublish("draft")}
                    disabled={!!busy}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium disabled:opacity-50"
                  >
                    Save as draft
                  </button>
                  <button
                    onClick={() => doPublish("published")}
                    disabled={!!busy}
                    className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-background disabled:opacity-50"
                  >
                    🚀 Publish now
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg border border-border/60 px-3 py-2 text-sm">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{k}:</span>{" "}
      <span>{v}</span>
    </div>
  );
}
