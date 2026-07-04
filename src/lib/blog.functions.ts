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
export const listPublishedBlogs = createServerFn({ method: "GET" })
  .handler(async () => {
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await sb
      .from("blogs")
      .select("id, title, slug, excerpt, cover_image, tags, author_name, read_minutes, published_at, is_featured")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listFeaturedBlogs = createServerFn({ method: "GET" })
  .handler(async () => {
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await sb
      .from("blogs")
      .select("id, title, slug, excerpt, cover_image, tags, author_name, read_minutes, published_at")
      .eq("status", "published")
      .eq("is_featured", true)
      .order("published_at", { ascending: false })
      .limit(3);
    if (error) throw new Error(error.message);
    if ((data ?? []).length > 0) return data!;
    // fallback: latest 3
    const { data: recent } = await sb
      .from("blogs")
      .select("id, title, slug, excerpt, cover_image, tags, author_name, read_minutes, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(3);
    return recent ?? [];
  });

export const getBlogBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: row, error } = await sb
      .from("blogs")
      .select("id, title, slug, excerpt, content, content_format, cover_image, tags, author_name, read_minutes, published_at")
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

// ============ ADMIN ============
export const adminListBlogs = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string }) => data)
  .handler(async ({ data }) => {
    verifyAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("blogs")
      .select("id, title, slug, excerpt, status, is_featured, author_name, read_minutes, tags, cover_image, content_format, published_at, updated_at")

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

const UpsertSchema = z.object({
  token: z.string(),
  id: z.string().nullable().optional(),
  title: z.string().min(3).max(200),
  slug: z.string().max(120).optional().nullable(),
  excerpt: z.string().max(500).nullable().optional(),
  content: z.string().max(200000).default(""),
  content_format: z.enum(["markdown", "html"]).default("markdown"),
  cover_image: z.string().url().nullable().optional().or(z.literal("")),
  tags: z.array(z.string()).default([]),
  status: z.enum(["draft", "published"]),
  is_featured: z.boolean().default(false),
  author_name: z.string().max(120).nullable().optional(),
  read_minutes: z.number().int().min(1).max(120).default(3),
  force: z.boolean().default(false),
});

export const adminUpsertBlog = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => UpsertSchema.parse(input))
  .handler(async ({ data }) => {
    verifyAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const finalSlug = (data.slug && data.slug.trim()) || slugify(data.title);
    const payload = {
      title: data.title,
      slug: finalSlug,
      excerpt: data.excerpt ?? null,
      content: data.content,
      content_format: data.content_format,
      cover_image: data.cover_image || null,
      tags: data.tags,
      status: data.status,
      is_featured: data.is_featured,
      author_name: data.author_name ?? null,
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
        .update(payload)
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: data.id, slug: finalSlug };
    }
    const { data: inserted, error } = await supabaseAdmin
      .from("blogs")
      .insert(payload)
      .select("id, slug")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: inserted.id, slug: inserted.slug };
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
  .inputValidator((data: { token: string; id: string; status: "draft" | "published" }) => data)
  .handler(async ({ data }) => {
    verifyAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patch: { status: "draft" | "published"; published_at?: string } = { status: data.status };
    if (data.status === "published") patch.published_at = new Date().toISOString();
    const { error } = await supabaseAdmin.from("blogs").update(patch).eq("id", data.id);
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
