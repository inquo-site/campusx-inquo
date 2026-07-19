import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const SYSTEM = `You are a world-class curriculum designer for Indian CS undergrads.
Given a goal, return a JSON roadmap with 4-6 phases. Each phase is a milestone with
3-6 concrete tasks. Every task must be short (max 8 words), actionable, and specific
(mention real tools/libraries). Include a difficulty per phase and an estimated
duration. Also return 3-5 curated resource picks per phase (name + type only, no URLs).

Return ONLY valid JSON, no markdown, no prose. Schema:
{
  "title": string,
  "tagline": string,          // one sharp sentence
  "totalWeeks": number,
  "phases": [
    {
      "name": string,          // e.g. "Foundations"
      "emoji": string,         // single emoji glyph
      "weeks": number,
      "difficulty": "beginner" | "intermediate" | "advanced",
      "outcome": string,       // 1-line "you will be able to..."
      "tasks": string[],
      "resources": [ { "name": string, "type": "book"|"course"|"video"|"docs"|"project" } ]
    }
  ],
  "finisher": string           // final capstone challenge, one sentence
}`;

export const generateRoadmap = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { goal: string; level?: string; hoursPerWeek?: number }) =>
    z.object({
      goal: z.string().min(3).max(240),
      level: z.string().max(40).optional(),
      hoursPerWeek: z.number().int().min(1).max(80).optional(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI gateway not configured");

    const userPrompt = `Goal: ${data.goal}
Current level: ${data.level ?? "unspecified"}
Hours/week available: ${data.hoursPerWeek ?? 10}
Design an efficient roadmap tuned to Indian CS students. Prefer free / high-signal resources.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      if (res.status === 429) throw new Error("Rate limited. Try again shortly.");
      if (res.status === 402) throw new Error("AI credits exhausted.");
      throw new Error(`AI error: ${text.slice(0, 200)}`);
    }
    const json = await res.json();
    const raw = json.choices?.[0]?.message?.content ?? "{}";
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // strip fences if any
      const cleaned = raw.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleaned);
    }
    return parsed as {
      title: string;
      tagline: string;
      totalWeeks: number;
      phases: Array<{
        name: string;
        emoji: string;
        weeks: number;
        difficulty: string;
        outcome: string;
        tasks: string[];
        resources: Array<{ name: string; type: string }>;
      }>;
      finisher: string;
    };
  });
