import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText, Output, NoObjectGeneratedError } from "ai";

const ADMIN_SECRET = "SUMAN@12suman";
function verifyAdmin(token: string) {
  if (token !== ADMIN_SECRET) throw new Error("Forbidden");
}

async function getModel() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("AI is not configured");
  const { createLovableAiGatewayProvider } = await import("@/lib/ai-gateway.server");
  const gateway = createLovableAiGatewayProvider(key);
  return gateway("google/gemini-3-flash-preview");
}

/* ============ 1) TOPIC SUGGESTIONS ============ */
const TopicsIn = z.object({
  token: z.string(),
  niche: z.string().max(200).optional(),
  seed: z.number().optional(),
});
const TopicsOut = z.object({
  topics: z
    .array(
      z.object({
        title: z.string(),
        angle: z.string(),
        primary_keyword: z.string(),
        why_it_works: z.string(),
      }),
    )
    .min(4),
});

export const studioSuggestTopics = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => TopicsIn.parse(i))
  .handler(async ({ data }) => {
    verifyAdmin(data.token);
    const model = await getModel();
    const prompt = `You are an SEO editor for Campus X (Indian student developer platform).
Suggest 6 FRESH blog topic ideas${data.niche ? ` around: ${data.niche}` : " (broad: careers, coding, internships, roadmaps, AI, startups)"}.
Seed variety: ${data.seed ?? Math.floor(Math.random() * 100000)}. Do NOT repeat obvious clichés.
Return topics with title (working headline), angle (1 sentence unique take), primary_keyword (2-4 words, search-friendly), why_it_works (1 sentence).`;
    try {
      const { output } = await generateText({ model, output: Output.object({ schema: TopicsOut }), prompt });
      return output;
    } catch (e) {
      if (NoObjectGeneratedError.isInstance(e)) {
        try { return TopicsOut.parse(JSON.parse(e.text ?? "{}")); } catch { /* fall through */ }
      }
      throw e;
    }
  });

/* ============ 2) SEO RESEARCH + TITLE FINALIZE ============ */
const SeoIn = z.object({
  token: z.string(),
  topic: z.string().min(3),
  primary_keyword: z.string().optional(),
});
const SeoOut = z.object({
  primary_keyword: z.string(),
  secondary_keywords: z.array(z.string()).min(3),
  search_intent: z.string(),
  suggested_titles: z.array(z.string()).min(4),
  suggested_slug: z.string(),
  suggested_excerpt: z.string(),
  outline: z.array(z.string()).min(4),
  tags: z.array(z.string()).min(3),
});

export const studioSeoResearch = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => SeoIn.parse(i))
  .handler(async ({ data }) => {
    verifyAdmin(data.token);
    const model = await getModel();
    const prompt = `Do SEO research for this blog topic.
Topic: ${data.topic}
${data.primary_keyword ? `Preferred primary keyword: ${data.primary_keyword}` : ""}
Audience: Indian student developers.

Return:
- primary_keyword (2-4 words, high-intent)
- secondary_keywords (5-8 supporting phrases)
- search_intent (informational | navigational | transactional — plus 1-line description)
- suggested_titles (5 headlines, 45-65 chars, keyword-forward, not clickbait)
- suggested_slug (kebab-case, <60 chars)
- suggested_excerpt (140-160 chars, meta-description quality)
- outline (5-8 H2 sections)
- tags (4-6 lowercase)`;
    try {
      const { output } = await generateText({ model, output: Output.object({ schema: SeoOut }), prompt });
      return output;
    } catch (e) {
      if (NoObjectGeneratedError.isInstance(e)) {
        try { return SeoOut.parse(JSON.parse(e.text ?? "{}")); } catch { /* fall through */ }
      }
      throw e;
    }
  });

/* ============ 3) WRITE FULL BLOG (word-count aware) ============ */
const WriteIn = z.object({
  token: z.string(),
  title: z.string().min(3),
  primary_keyword: z.string(),
  secondary_keywords: z.array(z.string()).default([]),
  outline: z.array(z.string()).default([]),
  word_count: z.number().min(300).max(3500).default(900),
  tone: z.string().max(80).optional(),
});
const WriteOut = z.object({
  content_markdown: z.string(),
  read_minutes: z.number(),
});

export const studioWriteBlog = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => WriteIn.parse(i))
  .handler(async ({ data }) => {
    verifyAdmin(data.token);
    const model = await getModel();
    const prompt = `Write a full blog post as MARKDOWN.
Title: ${data.title}
Primary keyword (use naturally 4-8 times, in first 100 words + a H2): ${data.primary_keyword}
Secondary keywords (weave in): ${data.secondary_keywords.join(", ") || "—"}
Outline (use as H2 sections in order): ${data.outline.length ? data.outline.map((o, i) => `${i + 1}. ${o}`).join(" | ") : "(create your own)"}
Target length: ~${data.word_count} words (±10%).
Tone: ${data.tone || "clear, practical, energetic — Indian student developer audience"}.

Rules:
- No H1. Start with a hook paragraph, not a heading.
- Short paragraphs (2-4 lines). Use bullet lists and code blocks where relevant.
- Use concrete Indian student examples (IITs, tier-2/3 colleges, off-campus, HackerRank, LeetCode, Devfolio).
- End with a "What to do next" section (3 action bullets).
Return content_markdown and read_minutes (integer, based on 200 wpm).`;
    try {
      const { output } = await generateText({ model, output: Output.object({ schema: WriteOut }), prompt });
      return output;
    } catch (e) {
      if (NoObjectGeneratedError.isInstance(e)) {
        try { return WriteOut.parse(JSON.parse(e.text ?? "{}")); } catch { /* fall through */ }
      }
      throw e;
    }
  });

/* ============ 4) HUMANIZE ============ */
const HumanIn = z.object({
  token: z.string(),
  content: z.string().min(50).max(200000),
});
export const studioHumanize = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => HumanIn.parse(i))
  .handler(async ({ data }) => {
    verifyAdmin(data.token);
    const model = await getModel();
    const prompt = `Rewrite this blog to sound like a real Indian student developer wrote it — not an AI.
Keep all facts, headings, code blocks, and structure. Preserve markdown.

Do:
- Vary sentence length. Mix short punchy lines with longer ones.
- Use contractions ("you're", "don't", "it's").
- Add 2-4 personal-voice asides (e.g. "honestly", "look —", "here's the thing").
- Cut corporate filler ("in today's fast-paced world", "leverage", "utilize", "delve").
- Keep it warm, direct, occasionally opinionated. No emojis.

Return ONLY the rewritten markdown, no preamble.

---
${data.content}`;
    const { text } = await generateText({ model, prompt });
    return { content_markdown: text.trim() };
  });

/* ============ 5) GENERATE COVER IMAGE ============ */
const CoverIn = z.object({
  token: z.string(),
  title: z.string().min(3),
  vibe: z.string().max(200).optional(),
});

export const studioGenerateCover = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => CoverIn.parse(i))
  .handler(async ({ data }) => {
    verifyAdmin(data.token);
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI is not configured");

    const imagePrompt = `Blog cover art, 16:9, editorial illustration style. Topic: "${data.title}". ${data.vibe || "modern, warm, energetic, minimal, tech-forward, deep-navy background with amber-gold accents"}. Clean composition, no text, no watermark.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image",
        messages: [{ role: "user", content: imagePrompt }],
        modalities: ["image", "text"],
      }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(`Image generation failed: ${res.status} ${t.slice(0, 300)}`);
    }
    const json = (await res.json()) as { data?: Array<{ b64_json?: string }> };
    const b64 = json.data?.[0]?.b64_json;
    if (!b64) throw new Error("No image returned from provider.");

    // Upload to blog-covers bucket
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const filename = `cover-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
    const { error: upErr } = await supabaseAdmin.storage
      .from("blog-covers")
      .upload(filename, bytes, { contentType: "image/png", upsert: false });
    if (upErr) throw new Error(`Upload failed: ${upErr.message}`);

    // Signed URL — long expiry (~1 year)
    const { data: signed, error: sErr } = await supabaseAdmin.storage
      .from("blog-covers")
      .createSignedUrl(filename, 60 * 60 * 24 * 365);
    if (sErr || !signed?.signedUrl) throw new Error(`Sign URL failed: ${sErr?.message ?? "unknown"}`);

    return { url: signed.signedUrl, path: filename };
  });
