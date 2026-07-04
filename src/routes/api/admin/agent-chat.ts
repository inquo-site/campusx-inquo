import { createFileRoute } from "@tanstack/react-router";
import {
  convertToModelMessages,
  generateText,
  streamText,
  tool,
  stepCountIs,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const ADMIN_SECRET = "SUMAN@12suman";

export const Route = createFileRoute("/api/admin/agent-chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { messages?: UIMessage[]; token?: string };
        if (body.token !== ADMIN_SECRET) {
          return new Response("Forbidden", { status: 403 });
        }
        if (!Array.isArray(body.messages)) {
          return new Response("messages required", { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const tools = {
          getPlatformStats: tool({
            description:
              "Get high-level platform counts (users, blogs, rooms, messages, jobs, dev profiles).",
            inputSchema: z.object({}),
            execute: async () => {
              const [users, blogs, rooms, msgs, jobs, devs] = await Promise.all([
                supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
                supabaseAdmin.from("blogs").select("*", { count: "exact", head: true }),
                supabaseAdmin.from("rooms").select("*", { count: "exact", head: true }),
                supabaseAdmin.from("room_messages").select("*", { count: "exact", head: true }),
                supabaseAdmin.from("internships").select("*", { count: "exact", head: true }),
                supabaseAdmin.from("dev_profiles").select("*", { count: "exact", head: true }),
              ]);
              return {
                users: users.count ?? 0,
                blogs: blogs.count ?? 0,
                rooms: rooms.count ?? 0,
                messages: msgs.count ?? 0,
                jobs: jobs.count ?? 0,
                dev_profiles: devs.count ?? 0,
              };
            },
          }),
          listRecentBlogs: tool({
            description: "List the most recent blog posts with their status and tags.",
            inputSchema: z.object({ limit: z.number().min(1).max(20).default(10) }),
            execute: async ({ limit }) => {
              const { data } = await supabaseAdmin
                .from("blogs")
                .select("id, title, slug, status, is_featured, tags, updated_at, published_at")
                .order("updated_at", { ascending: false })
                .limit(limit);
              return { blogs: data ?? [] };
            },
          }),
          listRecentUsers: tool({
            description: "List recent user profiles with basic public info.",
            inputSchema: z.object({ limit: z.number().min(1).max(50).default(20) }),
            execute: async ({ limit }) => {
              const { data } = await supabaseAdmin
                .from("profiles")
                .select("id, full_name, college, location, created_at")
                .order("created_at", { ascending: false })
                .limit(limit);
              return { users: data ?? [] };
            },
          }),
          listRecentJobs: tool({
            description: "List recently added internships/jobs.",
            inputSchema: z.object({ limit: z.number().min(1).max(50).default(20) }),
            execute: async ({ limit }) => {
              const { data } = await supabaseAdmin
                .from("internships")
                .select("id, title, company, location, is_featured, created_at")
                .order("created_at", { ascending: false })
                .limit(limit);
              return { jobs: data ?? [] };
            },
          }),
          draftBlogPost: tool({
            description:
              "Draft a new blog post (does NOT publish). Returns markdown content plus SEO metadata for the admin to review and save.",
            inputSchema: z.object({
              topic: z.string().min(4).max(400),
              tone: z.string().max(60).optional(),
              audience: z.string().max(200).optional(),
            }),
            execute: async ({ topic, tone, audience }) => {
              const prompt = `You are the Campus X editor. Write a blog post as MARKDOWN.
Topic: ${topic}
Tone: ${tone || "clear, practical, energetic"}
Audience: ${audience || "Indian student developers"}

Return an SEO title (30-65 chars), a slug (kebab-case, <60), a 140-160 char excerpt,
4-6 lowercase tags, an integer read_minutes, and content_markdown (700-1200 words, H2/H3, no H1).
Respond as JSON with keys: title, slug, excerpt, tags, read_minutes, content_markdown.`;
              const { text } = await generateText({ model, prompt });
              // Best-effort JSON extraction
              const match = text.match(/\{[\s\S]*\}$/m) || text.match(/\{[\s\S]*\}/);
              try {
                const json = JSON.parse(match ? match[0] : text);
                return { draft: json };
              } catch {
                return { draft: { content_markdown: text } };
              }
            },
          }),
        };

        const result = streamText({
          model,
          system: `You are the Campus X Admin Agent — a helpful analyst and editor for the platform's admin.
- Use tools to look up real data before making claims.
- When the admin asks for analysis, pull stats first, then summarize with concrete numbers.
- When asked to draft a blog, call draftBlogPost and present the result clearly (title, excerpt, then content).
- Be concise, use bullet points and short paragraphs. Never invent numbers.`,
          messages: await convertToModelMessages(body.messages as UIMessage[]),
          tools,
          stopWhen: stepCountIs(50),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: body.messages as UIMessage[],
        });
      },
    },
  },
});
