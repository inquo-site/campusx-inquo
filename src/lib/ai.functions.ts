import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const MENTOR_SYSTEM = `You are Campus X Mentor — a sharp, encouraging mentor for Indian CS undergrad builders (BTech, BCA, MTech). Be concrete, opinionated, and brief. Suggest projects, learning paths, internship strategy, resume bullets, startup co-founder fit. Prefer bullet points. Reference real tools (React, Postgres, Rust, FastAPI, Lovable, GitHub) when useful. Never invent links.`;

export const chatWithMentor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { message: string; history: { role: string; content: string }[] }) =>
    z.object({
      message: z.string().min(1).max(4000),
      history: z.array(z.object({ role: z.string(), content: z.string() })).max(40),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI gateway not configured");

    // Persist user message
    await context.supabase.from("ai_messages").insert({
      user_id: context.userId,
      role: "user",
      content: data.message,
    });

    const messages = [
      { role: "system", content: MENTOR_SYSTEM },
      ...data.history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: data.message },
    ];

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
      body: JSON.stringify({ model: "google/gemini-2.5-flash", messages }),
    });
    if (!res.ok) {
      const text = await res.text();
      if (res.status === 429) throw new Error("Rate limited. Try again shortly.");
      if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Settings.");
      throw new Error(`AI error: ${text.slice(0, 200)}`);
    }
    const json = await res.json();
    const reply: string = json.choices?.[0]?.message?.content ?? "(no response)";

    await context.supabase.from("ai_messages").insert({
      user_id: context.userId,
      role: "assistant",
      content: reply,
    });

    return { reply };
  });

export const polishResumeBullets = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { text: string; context?: string }) =>
    z.object({ text: z.string().min(1).max(2000), context: z.string().max(500).optional() }).parse(d),
  )
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI gateway not configured");
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Rewrite the user's resume content into 3-5 crisp, metric-driven bullet points starting with strong action verbs. Output only the bullets, one per line, prefixed with '• '. No preamble." },
          { role: "user", content: `Context: ${data.context ?? "Student CS project"}\n\nContent:\n${data.text}` },
        ],
      }),
    });
    if (!res.ok) throw new Error("AI request failed");
    const json = await res.json();
    return { bullets: (json.choices?.[0]?.message?.content ?? "").trim() };
  });
