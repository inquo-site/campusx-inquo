import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ADMIN_SECRET = "SUMAN@12suman";
function verifyAdmin(token: string) {
  if (token !== ADMIN_SECRET) throw new Error("Forbidden");
}

const MODEL = "google/gemini-2.5-flash";

async function callJson<T>(system: string, user: string, schema: z.ZodType<T>): Promise<T> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("AI is not configured");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    if (res.status === 429) throw new Error("Rate limited. Try again shortly.");
    if (res.status === 402) throw new Error("AI credits exhausted.");
    throw new Error(`AI error: ${t.slice(0, 200)}`);
  }
  const json = await res.json();
  const raw = json.choices?.[0]?.message?.content ?? "{}";
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = JSON.parse(String(raw).replace(/```json|```/g, "").trim());
  }
  return schema.parse(parsed);
}

async function callText(system: string, user: string): Promise<string> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("AI is not configured");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    if (res.status === 429) throw new Error("Rate limited. Try again shortly.");
    if (res.status === 402) throw new Error("AI credits exhausted.");
    throw new Error(`AI error: ${t.slice(0, 200)}`);
  }
  const json = await res.json();
  return String(json.choices?.[0]?.message?.content ?? "").trim();
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
    .min(1),
});

export const studioSuggestTopics = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => TopicsIn.parse(i))
  .handler(async ({ data }) => {
    verifyAdmin(data.token);
    const system = `You are an SEO editor for Campus X (Indian student developer platform). Reply with ONLY valid JSON, no prose, no markdown fences.`;
    const user = `Suggest 6 FRESH blog topic ideas${data.niche ? ` around: ${data.niche}` : " (broad: careers, coding, internships, roadmaps, AI, startups)"}.
Seed variety: ${data.seed ?? Math.floor(Math.random() * 100000)}. Avoid clichés.

Return this JSON exactly:
{"topics":[{"title":"...","angle":"...","primary_keyword":"...","why_it_works":"..."}, ... 6 items]}`;
    return await callJson(system, user, TopicsOut);
  });

/* ============ 2) SEO RESEARCH ============ */
const SeoIn = z.object({
  token: z.string(),
  topic: z.string().min(3),
  primary_keyword: z.string().optional(),
});
const SeoOut = z.object({
  primary_keyword: z.string(),
  secondary_keywords: z.array(z.string()).min(1),
  search_intent: z.string(),
  suggested_titles: z.array(z.string()).min(1),
  suggested_slug: z.string(),
  suggested_excerpt: z.string(),
  outline: z.array(z.string()).min(1),
  tags: z.array(z.string()).min(1),
});

export const studioSeoResearch = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => SeoIn.parse(i))
  .handler(async ({ data }) => {
    verifyAdmin(data.token);
    const system = `You are an SEO strategist. Reply with ONLY valid JSON, no prose, no markdown fences.`;
    const user = `SEO research for this blog topic.
Topic: ${data.topic}
${data.primary_keyword ? `Preferred primary keyword: ${data.primary_keyword}` : ""}
Audience: Indian student developers.

Return JSON exactly:
{
 "primary_keyword": "2-4 words, high-intent",
 "secondary_keywords": ["5-8 supporting phrases"],
 "search_intent": "informational|navigational|transactional + 1-line description",
 "suggested_titles": ["5 headlines, 45-65 chars each"],
 "suggested_slug": "kebab-case-under-60-chars",
 "suggested_excerpt": "140-160 chars meta-description",
 "outline": ["5-8 H2 sections"],
 "tags": ["4-6 lowercase"]
}`;
    return await callJson(system, user, SeoOut);
  });

/* ============ 3) WRITE FULL BLOG ============ */
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
    const system = `You write blogs as markdown. Reply with ONLY valid JSON, no prose, no markdown fences. The markdown goes INSIDE the JSON string field.`;
    const user = `Write a full blog post as MARKDOWN.
Title: ${data.title}
Primary keyword (use naturally 4-8 times, in first 100 words + a H2): ${data.primary_keyword}
Secondary keywords: ${data.secondary_keywords.join(", ") || "—"}
Outline (H2 sections in order): ${data.outline.length ? data.outline.map((o, i) => `${i + 1}. ${o}`).join(" | ") : "(create your own)"}
Target length: ~${data.word_count} words (±10%).
Tone: ${data.tone || "clear, practical, energetic — Indian student developer audience"}.

Rules: No H1. Hook paragraph first. Short paragraphs. Bullets and code where relevant. Use Indian student examples. End with "What to do next" (3 action bullets).

Return JSON exactly:
{"content_markdown":"<markdown here>","read_minutes":<integer, 200 wpm>}`;
    return await callJson(system, user, WriteOut);
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
    const system = `Rewrite blogs to sound like a real Indian student developer wrote them — not an AI. Keep all facts, headings, code blocks, structure, and markdown. Vary sentence length. Use contractions. Add 2-4 personal-voice asides. Cut corporate filler (leverage/utilize/delve/in today's fast-paced world). Warm, direct, occasionally opinionated. No emojis. Return ONLY the rewritten markdown.`;
    const text = await callText(system, data.content);
    return { content_markdown: text };
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

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const filename = `cover-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
    const { error: upErr } = await supabaseAdmin.storage
      .from("blog-covers")
      .upload(filename, bytes, { contentType: "image/png", upsert: false });
    if (upErr) throw new Error(`Upload failed: ${upErr.message}`);

    const { data: signed, error: sErr } = await supabaseAdmin.storage
      .from("blog-covers")
      .createSignedUrl(filename, 60 * 60 * 24 * 365);
    if (sErr || !signed?.signedUrl) throw new Error(`Sign URL failed: ${sErr?.message ?? "unknown"}`);

    return { url: signed.signedUrl, path: filename };
  });
