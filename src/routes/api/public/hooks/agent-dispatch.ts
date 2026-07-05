import { createFileRoute } from "@tanstack/react-router";
import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

// Agent registry: map event_type -> { agent, system prompt, user prompt builder }
const AGENTS: Record<
  string,
  { name: string; system: string; buildPrompt: (p: Record<string, unknown>) => string }
> = {
  "blog.published": {
    name: "Growth Agent",
    system:
      "You are Campus X Growth Agent. When a new blog is published, generate promo copy: (1) 2 tweets, (2) 1 LinkedIn post, (3) 1 short Instagram caption, (4) 3 SEO keywords. Be concrete, energetic, Hinglish-friendly. Output as markdown with headings.",
    buildPrompt: (p) =>
      `New blog published on Campus X.\nTitle: ${p.title}\nExcerpt: ${p.excerpt}\nTags: ${JSON.stringify(p.tags)}\nSlug: ${p.slug}`,
  },
  "blog.unpublished": {
    name: "QA Agent",
    system:
      "You are Campus X QA Agent. A blog was just unpublished. In 3 bullets, note likely reasons (SEO fail, quality, duplicate) and 2 next actions.",
    buildPrompt: (p) => `Unpublished blog: ${p.title} (${p.slug}).`,
  },
  "user.signup": {
    name: "Lead-Gen Agent",
    system:
      "You are Campus X Lead-Gen Agent. Draft a warm 90-word welcome email for a new Indian student developer. Personalize using their name and college. Include 3 next-step CTAs (complete profile, join a room, post a project). Hinglish tone, no emojis in the subject.",
    buildPrompt: (p) =>
      `New signup:\nName: ${p.full_name || "there"}\nCollege: ${p.college || "unspecified"}`,
  },
  "project.created": {
    name: "Feature-Discovery Agent",
    system:
      "You are Campus X Feature-Discovery Agent. Analyse a new user project and output: (1) 1-line hook, (2) suggested collaborator roles, (3) 3 growth ideas, (4) recommended tags. Markdown.",
    buildPrompt: (p) =>
      `New project posted.\nTitle: ${p.title}\nDescription: ${p.description}\nTech: ${JSON.stringify(p.tech_stack)}\nTag: ${p.tag}`,
  },
  "internship.created": {
    name: "Lead-Gen Agent",
    system:
      "You are Campus X Lead-Gen Agent. A new internship is live. Draft: (1) a 1-line notification banner, (2) 2 tweet variants, (3) a 60-word WhatsApp broadcast for student groups. Hinglish OK.",
    buildPrompt: (p) =>
      `New internship: ${p.title} at ${p.company} (${p.location || "remote"}).`,
  },
  "cron.analytics_daily": {
    name: "Analytics Agent",
    system:
      "You are Campus X Analytics Agent. Given today's platform counts, write a 5-bullet daily digest: what moved, what to watch, one action for tomorrow. Concise, numeric.",
    buildPrompt: (p) => `Today's Campus X stats: ${JSON.stringify(p)}`,
  },
};

export const Route = createFileRoute("/api/public/hooks/agent-dispatch")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as {
          event_id?: string;
          cron?: string;
          secret?: string;
        };

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Cron path: create the event first
        let eventId = body.event_id;
        if (!eventId && body.cron === "analytics_daily") {
          const [users, blogs, projects, jobs] = await Promise.all([
            supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
            supabaseAdmin.from("blogs").select("*", { count: "exact", head: true }),
            supabaseAdmin.from("projects").select("*", { count: "exact", head: true }),
            supabaseAdmin.from("internships").select("*", { count: "exact", head: true }),
          ]);
          const { data: created, error: cErr } = await supabaseAdmin
            .from("agent_events")
            .insert({
              event_type: "cron.analytics_daily",
              source_table: "cron",
              source_id: new Date().toISOString().slice(0, 10),
              payload: {
                users: users.count ?? 0,
                blogs: blogs.count ?? 0,
                projects: projects.count ?? 0,
                jobs: jobs.count ?? 0,
              },
            })
            .select("id")
            .single();
          if (cErr || !created) return Response.json({ error: "create_failed" }, { status: 500 });
          // The trigger will call us again with event_id; return early.
          return Response.json({ ok: true, event_id: created.id });
        }

        if (!eventId) return Response.json({ error: "missing_event_id" }, { status: 400 });

        // Fetch + mark dispatched (idempotency guard)
        const { data: event, error: evErr } = await supabaseAdmin
          .from("agent_events")
          .select("*")
          .eq("id", eventId)
          .maybeSingle();
        if (evErr || !event) return Response.json({ error: "not_found" }, { status: 404 });
        if (event.status !== "pending") return Response.json({ ok: true, skipped: true });

        const agentDef = AGENTS[event.event_type];
        if (!agentDef) {
          await supabaseAdmin
            .from("agent_events")
            .update({ status: "done", dispatched_at: new Date().toISOString() })
            .eq("id", eventId);
          return Response.json({ ok: true, no_agent: true });
        }

        // Gate: only run agents for owners with an active autopilot subscription.
        // System-wide cron events (owner_id is null) always run.
        if (event.owner_id) {
          const { data: active } = await supabaseAdmin.rpc("has_active_autopilot", {
            _user_id: event.owner_id,
          });
          if (!active) {
            await supabaseAdmin
              .from("agent_events")
              .update({ status: "skipped_no_subscription", dispatched_at: new Date().toISOString() })
              .eq("id", eventId);
            return Response.json({ ok: true, skipped: "no_active_subscription" });
          }
        }

        await supabaseAdmin
          .from("agent_events")
          .update({ status: "dispatched", dispatched_at: new Date().toISOString() })
          .eq("id", eventId);

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return Response.json({ error: "no_ai_key" }, { status: 500 });

        const { data: runRow } = await supabaseAdmin
          .from("agent_runs")
          .insert({
            event_id: eventId,
            agent_name: agentDef.name,
            event_type: event.event_type,
            input: event.payload,
            status: "running",
          })
          .select("id")
          .single();

        const started = Date.now();
        try {
          const gateway = createLovableAiGatewayProvider(key);
          const model = gateway("google/gemini-2.5-flash");
          const { text } = await generateText({
            model,
            system: agentDef.system,
            prompt: agentDef.buildPrompt((event.payload ?? {}) as Record<string, unknown>),
          });
          await supabaseAdmin
            .from("agent_runs")
            .update({
              output: text,
              status: "success",
              duration_ms: Date.now() - started,
            })
            .eq("id", runRow!.id);
          await supabaseAdmin.from("agent_events").update({ status: "done" }).eq("id", eventId);
          return Response.json({ ok: true, agent: agentDef.name });
        } catch (e) {
          const msg = (e as Error)?.message || "unknown";
          await supabaseAdmin
            .from("agent_runs")
            .update({
              status: "error",
              error: msg.slice(0, 500),
              duration_ms: Date.now() - started,
            })
            .eq("id", runRow!.id);
          await supabaseAdmin.from("agent_events").update({ status: "error" }).eq("id", eventId);
          return Response.json({ error: msg }, { status: 500 });
        }
      },
    },
  },
});
