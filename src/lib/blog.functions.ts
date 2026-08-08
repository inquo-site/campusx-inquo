import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText, Output, NoObjectGeneratedError } from "ai";

const ADMIN_SECRET = "SUMAN@12suman";
function verifyAdmin(token: string) {
  if (token !== ADMIN_SECRET) throw new Error("Forbidden");
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

// ============ PUBLIC ============
const LIST_COLS =
  "id, title, slug, excerpt, cover_image, tags, author_name, read_minutes, published_at, is_featured, category, subcategory, series, views";

const DETAIL_COLS =
  "id, title, slug, excerpt, content, content_format, blocks, typography, faq, keywords, show_toc, cover_image, image_alt, image_caption, tags, category, subcategory, series, author_name, author_bio, author_avatar, read_minutes, published_at, views";

async function publicClient() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const listPublishedBlogs = createServerFn({ method: "GET" })
  .handler(async () => {
    const sb = await publicClient();
    const { data, error } = await sb
      .from("blogs")
      .select(LIST_COLS)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listFeaturedBlogs = createServerFn({ method: "GET" })
  .handler(async () => {
    const sb = await publicClient();
    const { data, error } = await sb
      .from("blogs")
      .select(LIST_COLS)
      .eq("status", "published")
      .eq("is_featured", true)
      .order("published_at", { ascending: false })
      .limit(3);
    if (error) throw new Error(error.message);
    if ((data ?? []).length > 0) return data!;
    // fallback: latest 3
    const { data: recent } = await sb
      .from("blogs")
      .select(LIST_COLS)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(3);
    return recent ?? [];
  });

export const getBlogBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const sb = await publicClient();
    const { data: row, error } = await sb
      .from("blogs")
      .select(DETAIL_COLS)
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

/** Posts related by category / shared tags, excluding the current slug. */
export const listRelatedBlogs = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string; limit?: number }) => data)
  .handler(async ({ data }) => {
    const sb = await publicClient();
    const { data: current } = await sb
      .from("blogs")
      .select("id, tags, category")
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    const { data: rows } = await sb
      .from("blogs")
      .select(LIST_COLS)
      .eq("status", "published")
      .neq("slug", data.slug)
      .order("published_at", { ascending: false })
      .limit(60);
    const all = rows ?? [];
    const tags: string[] = (current?.tags as string[]) ?? [];
    const scored = all
      .map((p) => {
        const overlap = ((p.tags as string[]) ?? []).filter((t) => tags.includes(t)).length;
        const cat = current?.category && p.category === current.category ? 2 : 0;
        return { p, score: overlap + cat };
      })
      .sort((a, b) => b.score - a.score);
    return scored.slice(0, data.limit ?? 3).map((s) => s.p);
  });

/** Categories, series and tags across published posts — powers /blog filters. */
export const listBlogTaxonomy = createServerFn({ method: "GET" }).handler(async () => {
  const sb = await publicClient();
  const { data } = await sb.from("blogs").select("category, series, tags").eq("status", "published").limit(500);
  const rows = data ?? [];
  const categories = [...new Set(rows.map((r) => r.category).filter(Boolean))] as string[];
  const series = [...new Set(rows.map((r) => r.series).filter(Boolean))] as string[];
  const tags = [...new Set(rows.flatMap((r) => ((r.tags as string[]) ?? [])))].sort();
  return { categories: categories.sort(), series: series.sort(), tags };
});

// ============ ADMIN ============
export const adminListBlogs = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string }) => data)
  .handler(async ({ data }) => {
    verifyAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("blogs")
      .select("id, title, slug, excerpt, status, is_featured, author_name, read_minutes, tags, category, subcategory, series, views, scheduled_at, cover_image, content_format, published_at, updated_at")

      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminGetBlog = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string; id: string }) => data)
  .handler(async ({ data }) => {
    verifyAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("blogs")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

// ============ SEO VALIDATION ============
export type SeoIssue = { level: "error" | "warn"; field: string; message: string };

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function validateBlogSeoInput(input: {
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string;
  content: string;
  content_format?: "markdown" | "html";
  tags: string[];
}): SeoIssue[] {
  const issues: SeoIssue[] = [];
  const title = input.title.trim();
  if (title.length < 20) issues.push({ level: "error", field: "title", message: "Title is too short — aim for 30-65 characters." });
  else if (title.length < 30) issues.push({ level: "warn", field: "title", message: "Title under 30 chars. 30-65 is best for search." });
  if (title.length > 65) issues.push({ level: "warn", field: "title", message: `Title is ${title.length} chars — Google truncates around 60-65.` });

  const slug = (input.slug || "").trim();
  if (!slug) issues.push({ level: "error", field: "slug", message: "Slug is empty. Set a clean, hyphen-separated URL." });
  else if (!/^[a-z0-9-]+$/.test(slug)) issues.push({ level: "error", field: "slug", message: "Slug must be lowercase letters, numbers and hyphens only." });
  else if (slug.length > 80) issues.push({ level: "warn", field: "slug", message: "Slug is long — shorten to under 80 chars." });

  const excerpt = (input.excerpt || "").trim();
  if (!excerpt) issues.push({ level: "error", field: "excerpt", message: "Meta description (excerpt) is missing." });
  else {
    if (excerpt.length < 80) issues.push({ level: "warn", field: "excerpt", message: `Excerpt is ${excerpt.length} chars — 120-160 is ideal.` });
    if (excerpt.length > 200) issues.push({ level: "warn", field: "excerpt", message: `Excerpt is ${excerpt.length} chars — over 200 gets truncated.` });
  }

  const cover = (input.cover_image || "").trim();
  if (!cover) issues.push({ level: "error", field: "cover_image", message: "Cover image URL is required for OpenGraph / Twitter share previews." });
  else if (!/^https?:\/\//.test(cover)) issues.push({ level: "error", field: "cover_image", message: "Cover image must be an absolute https URL." });

  const bodyText = input.content_format === "html" ? stripHtml(input.content) : input.content;
  const wordCount = bodyText.split(/\s+/).filter(Boolean).length;
  if (wordCount < 250) issues.push({ level: "error", field: "content", message: `Only ${wordCount} words. Aim for 400+ for real search value.` });
  else if (wordCount < 400) issues.push({ level: "warn", field: "content", message: `${wordCount} words — a bit thin. 600-1200 is a sweet spot.` });

  if (!input.tags || input.tags.length === 0) issues.push({ level: "warn", field: "tags", message: "No tags — add 3-6 topical tags for discovery." });
  else if (input.tags.length > 8) issues.push({ level: "warn", field: "tags", message: "Over 8 tags dilutes topical focus." });

  return issues;
}

export const validateBlogSeo = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      token: string;
      title: string;
      slug: string;
      excerpt: string;
      cover_image: string;
      content: string;
      content_format?: "markdown" | "html";
      tags: string[];
    }) => data,
  )
  .handler(async ({ data }) => {
    verifyAdmin(data.token);
    return { issues: validateBlogSeoInput(data) };
  });

const BlockSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.record(z.string(), z.unknown()).default({}),
});

const UpsertSchema = z.object({
  token: z.string(),
  id: z.string().nullable().optional(),
  title: z.string().min(3).max(200),
  slug: z.string().max(120).optional().nullable(),
  excerpt: z.string().max(500).nullable().optional(),
  content: z.string().max(200000).default(""),
  content_format: z.enum(["markdown", "html"]).default("markdown"),
  blocks: z.array(BlockSchema).default([]),
  typography: z.record(z.string(), z.unknown()).default({}),
  faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
  keywords: z.array(z.string()).default([]),
  show_toc: z.boolean().default(true),
  cover_image: z.string().url().nullable().optional().or(z.literal("")),
  image_alt: z.string().max(300).nullable().optional(),
  image_caption: z.string().max(300).nullable().optional(),
  tags: z.array(z.string()).default([]),
  category: z.string().max(80).nullable().optional(),
  subcategory: z.string().max(80).nullable().optional(),
  series: z.string().max(120).nullable().optional(),
  status: z.enum(["draft", "published", "scheduled"]),
  scheduled_at: z.string().nullable().optional(),
  is_featured: z.boolean().default(false),
  author_name: z.string().max(120).nullable().optional(),
  author_bio: z.string().max(600).nullable().optional(),
  author_avatar: z.string().max(500).nullable().optional(),
  read_minutes: z.number().int().min(1).max(120).default(3),
  force: z.boolean().default(false),
});

export const adminUpsertBlog = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => UpsertSchema.parse(input))
  .handler(async ({ data }) => {
    verifyAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const finalSlug = (data.slug && data.slug.trim()) || slugify(data.title);

    // Enforce SEO validation when publishing or scheduling (unless explicitly forced)
    if ((data.status === "published" || data.status === "scheduled") && !data.force) {
      const blockText = data.blocks
        .map((b) => Object.values(b.data).filter((v) => typeof v === "string").join(" "))
        .join(" ");
      const issues = validateBlogSeoInput({
        title: data.title,
        slug: finalSlug,
        excerpt: data.excerpt ?? "",
        cover_image: data.cover_image ?? "",
        content: `${data.content} ${blockText}`,
        content_format: data.content_format,
        tags: data.tags,
      });
      const errors = issues.filter((i) => i.level === "error");
      if (errors.length > 0) {
        const err = new Error(
          "SEO validation failed. Fix these before publishing:\n" +
            errors.map((e) => `• ${e.field}: ${e.message}`).join("\n"),
        );
        (err as Error & { seoIssues?: SeoIssue[] }).seoIssues = issues;
        throw err;
      }
    }

    const payload = {
      title: data.title,
      slug: finalSlug,
      excerpt: data.excerpt ?? null,
      content: data.content,
      content_format: data.content_format,
      blocks: data.blocks,
      typography: data.typography,
      faq: data.faq,
      keywords: data.keywords,
      show_toc: data.show_toc,
      cover_image: data.cover_image || null,
      image_alt: data.image_alt ?? null,
      image_caption: data.image_caption ?? null,
      tags: data.tags,
      category: data.category || null,
      subcategory: data.subcategory || null,
      series: data.series || null,
      status: data.status,
      scheduled_at: data.status === "scheduled" ? data.scheduled_at ?? null : null,
      is_featured: data.is_featured,
      author_name: data.author_name ?? null,
      author_bio: data.author_bio ?? null,
      author_avatar: data.author_avatar ?? null,
      read_minutes: data.read_minutes,
      published_at:
        data.status === "published" ? new Date().toISOString() : null,
    };
    if (data.id) {
      // preserve published_at if already published and staying published
      if (data.status === "published") {
        const { data: prev } = await supabaseAdmin
          .from("blogs")
          .select("published_at, status")
          .eq("id", data.id)
          .maybeSingle();
        if (prev?.published_at && prev.status === "published") {
          payload.published_at = prev.published_at;
        }
      }
      const { error } = await supabaseAdmin
        .from("blogs")
        .update(payload as never)
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: data.id, slug: finalSlug };
    }
    const { data: inserted, error } = await supabaseAdmin
      .from("blogs")
      .insert(payload as never)
      .select("id, slug")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: inserted.id, slug: inserted.slug };
  });

/** Duplicate an existing post as a fresh draft. */
export const adminDuplicateBlog = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string; id: string }) => data)
  .handler(async ({ data }) => {
    verifyAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin.from("blogs").select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Post not found");
    const copy = { ...(row as Record<string, unknown>) };
    delete copy.id;
    delete copy.created_at;
    delete copy.updated_at;
    copy.title = `${row.title} (copy)`;
    copy.slug = `${row.slug}-copy-${Math.random().toString(36).slice(2, 6)}`;
    copy.status = "draft";
    copy.published_at = null;
    copy.scheduled_at = null;
    copy.is_featured = false;
    copy.views = 0;
    const { data: inserted, error: insErr } = await supabaseAdmin.from("blogs").insert(copy as never).select("id").single();
    if (insErr) throw new Error(insErr.message);
    return { ok: true, id: inserted.id };
  });

// ============ TEMPLATES ============
export const adminListBlogTemplates = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string }) => data)
  .handler(async ({ data }) => {
    verifyAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("blog_templates")
      .select("id, name, description, data, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminSaveBlogTemplate = createServerFn({ method: "POST" })
  .inputValidator(
    (input: unknown) =>
      z
        .object({
          token: z.string(),
          name: z.string().min(2).max(120),
          description: z.string().max(300).optional(),
          data: z.record(z.string(), z.unknown()),
        })
        .parse(input),
  )
  .handler(async ({ data }) => {
    verifyAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("blog_templates")
      .insert({ name: data.name, description: data.description ?? null, data: data.data as never });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteBlogTemplate = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string; id: string }) => data)
  .handler(async ({ data }) => {
    verifyAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("blog_templates").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteBlog = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string; id: string }) => data)
  .handler(async ({ data }) => {
    verifyAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("blogs").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminToggleBlogFeatured = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string; id: string; featured: boolean }) => data)
  .handler(async ({ data }) => {
    verifyAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("blogs")
      .update({ is_featured: data.featured })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminSetBlogStatus = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { token: string; id: string; status: "draft" | "published" | "scheduled"; scheduled_at?: string | null }) =>
      data,
  )
  .handler(async ({ data }) => {
    verifyAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patch: Record<string, unknown> = { status: data.status };
    if (data.status === "published") {
      patch.published_at = new Date().toISOString();
      patch.scheduled_at = null;
    }
    if (data.status === "scheduled") patch.scheduled_at = data.scheduled_at ?? null;
    if (data.status === "draft") patch.published_at = null;
    const { error } = await supabaseAdmin.from("blogs").update(patch as never).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });


// ============ AI ============
const AiWriteSchema = z.object({
  token: z.string(),
  topic: z.string().min(4).max(400),
  audience: z.string().max(200).optional(),
  tone: z.string().max(60).optional(),
});

const AiWriteResult = z.object({
  title: z.string(),
  slug: z.string(),
  excerpt: z.string(),
  tags: z.array(z.string()),
  read_minutes: z.number(),
  content_markdown: z.string(),
});

export const adminAiWriteBlog = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AiWriteSchema.parse(input))
  .handler(async ({ data }) => {
    verifyAdmin(data.token);
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI is not configured");
    const { createLovableAiGatewayProvider } = await import("@/lib/ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const prompt = `You are a senior editor writing for Campus X, a workspace for Indian student developers.
Write a full blog post as MARKDOWN based on the topic below.

Topic: ${data.topic}
Audience: ${data.audience || "Indian student developers and early-career engineers"}
Tone: ${data.tone || "clear, practical, energetic — not corporate"}

Requirements:
- Return an SEO title (max 65 chars), a url slug (kebab-case, max 60 chars), a 1-2 sentence excerpt (max 280 chars),
  4-6 lowercase tags, an integer read_minutes estimate, and content_markdown.
- content_markdown must be 700-1200 words, use H2/H3 headings, short paragraphs, bullet lists where useful,
  and include a brief conclusion. Do NOT include an H1 (the title renders separately).
- Prefer concrete Indian student examples where relevant.`;

    try {
      const { output } = await generateText({
        model,
        output: Output.object({ schema: AiWriteResult }),
        prompt,
      });
      return output;
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        try {
          return AiWriteResult.parse(JSON.parse(error.text ?? "{}"));
        } catch {
          throw new Error("The AI returned an unexpected response. Please try again.");
        }
      }
      throw error;
    }
  });

const AiOptimizeSchema = z.object({
  token: z.string(),
  title: z.string().min(3),
  content: z.string().min(50).max(200000),
});

const AiOptimizeResult = z.object({
  seo_title: z.string(),
  seo_excerpt: z.string(),
  suggested_tags: z.array(z.string()),
  score: z.number(),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  rewritten_intro: z.string(),
});

export const adminAiOptimizeBlog = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AiOptimizeSchema.parse(input))
  .handler(async ({ data }) => {
    verifyAdmin(data.token);
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI is not configured");
    const { createLovableAiGatewayProvider } = await import("@/lib/ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const prompt = `You are a blog SEO coach. Analyze the post below and return:
- seo_title (max 65 chars, compelling, keyword-forward)
- seo_excerpt (max 280 chars, meta-description quality)
- suggested_tags (4-7 lowercase tags)
- score (0-100 reader + SEO readiness)
- strengths (2-4 bullets)
- improvements (3-6 bullets, specific and actionable)
- rewritten_intro (a punchier first paragraph, 2-4 sentences)

Post title: ${data.title}
Post content:
${data.content.slice(0, 12000)}`;

    try {
      const { output } = await generateText({
        model,
        output: Output.object({ schema: AiOptimizeResult }),
        prompt,
      });
      return output;
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        try {
          return AiOptimizeResult.parse(JSON.parse(error.text ?? "{}"));
        } catch {
          throw new Error("The AI returned an unexpected response. Please try again.");
        }
      }
      throw error;
    }
  });

// ============ SUMMARY ============
const SummarizeSchema = z.object({
  token: z.string(),
  title: z.string().min(3),
  content: z.string().min(20).max(200000),
});

export const adminAiSummarizeBlog = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SummarizeSchema.parse(input))
  .handler(async ({ data }) => {
    verifyAdmin(data.token);
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI is not configured");
    const { createLovableAiGatewayProvider } = await import("@/lib/ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");
    const bodyPlain = data.content.replace(/<[^>]+>/g, " ").slice(0, 15000);
    const prompt = `Summarize this blog post in ONE compelling meta-description sentence, 140-160 characters, active voice, no clickbait, no emojis, no quotes.
Title: ${data.title}
Content:
${bodyPlain}

Return ONLY the summary sentence with no preamble.`;
    const { text } = await generateText({ model, prompt });
    return { summary: text.trim().replace(/^["']|["']$/g, "").slice(0, 240) };
  });

// ============ AI SEO KIT (keywords / tags / FAQ / meta / improvements) ============
const SeoKitSchema = z.object({
  token: z.string(),
  title: z.string().min(3),
  content: z.string().min(20).max(200000),
});

function extractJson(text: string): unknown {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("The AI returned an unexpected response. Please try again.");
  return JSON.parse(cleaned.slice(start, end + 1));
}

export const adminAiSeoKit = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SeoKitSchema.parse(input))
  .handler(async ({ data }) => {
    verifyAdmin(data.token);
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI is not configured");
    const { createLovableAiGatewayProvider } = await import("@/lib/ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-2.5-flash");
    const body = data.content.replace(/<[^>]+>/g, " ").slice(0, 14000);
    const prompt = `You are an SEO editor for an Indian student-developer blog.
Return STRICT JSON only, no prose, with this exact shape:
{
  "meta_title": "max 65 chars",
  "meta_description": "120-160 chars",
  "keywords": ["6-10 search keywords"],
  "tags": ["4-7 lowercase tags"],
  "faq": [{"q": "question", "a": "2-3 sentence answer"}],
  "outline": ["H2 headings that would improve structure"],
  "improvements": ["4-7 specific, actionable fixes"],
  "score": 0
}
Give 4-6 FAQ entries. score is 0-100 SEO readiness.

Title: ${data.title}
Content:
${body}`;
    const { text } = await generateText({ model, prompt });
    const parsed = extractJson(text) as Record<string, unknown>;
    return {
      meta_title: String(parsed.meta_title ?? ""),
      meta_description: String(parsed.meta_description ?? ""),
      keywords: (parsed.keywords as string[]) ?? [],
      tags: (parsed.tags as string[]) ?? [],
      faq: (parsed.faq as Array<{ q: string; a: string }>) ?? [],
      outline: (parsed.outline as string[]) ?? [],
      improvements: (parsed.improvements as string[]) ?? [],
      score: Number(parsed.score ?? 0),
    };
  });
