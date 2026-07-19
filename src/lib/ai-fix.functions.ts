import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const CONTEXT_HINTS: Record<string, string> = {
  name: "A person's full name. Fix capitalization (Title Case), remove extra spaces, keep it a real human name. Do NOT invent surnames.",
  college: "An Indian college / university name. Fix capitalization and expand common abbreviations only when obvious (IIT, NIT, VIT etc). Keep it factual.",
  location: "A city / state. Title Case, correct spelling, keep in India-friendly format (City, State).",
  bio: "A short 1-3 sentence self-intro for a student developer. Fix grammar, spelling, capitalization. Keep first person. Keep it under 240 chars. Do not add new facts.",
  skills: "A comma-separated list of tech skills. Fix casing (React, TypeScript, Node.js, PostgreSQL, Rust, etc.), dedupe, keep order. Return only the comma-separated list, no other text.",
  looking_for: "A comma-separated list of what the person is looking for (Co-founder, Internship, Hackathon team). Title Case, dedupe. Return only the comma-separated list.",
  url: "A URL. Trim, add https:// if missing, fix obvious typos in domain. Return only the URL.",
  title: "A short project / post / hackathon title. Sentence case or Title Case (whichever fits), fix typos. Keep it punchy, under 80 chars.",
  description: "A description for a project/post/hackathon. Fix grammar, spelling, capitalization, keep the author's meaning. 2-4 tight sentences max.",
  bullet: "A single resume bullet point. Start with a strong action verb, past tense, include a metric if the input has one, under 200 chars. Return only the bullet, no leading dot.",
  experience: "A resume experience block. Fix grammar, spelling, capitalize proper nouns.",
  message: "A chat / room message. Fix grammar, spelling, capitalization. Keep the tone the user used (casual Hinglish OK).",
  blog: "Blog body prose (markdown or HTML). Fix grammar, spelling, capitalization. Preserve markdown/HTML structure exactly.",
  generic: "Free-form text. Fix grammar, spelling and capitalization only. Preserve meaning and formatting.",
};

function systemPrompt(context: string) {
  const hint = CONTEXT_HINTS[context] ?? CONTEXT_HINTS.generic;
  return `You are Campus X's text-fix agent. Task: clean the user's input.
Rules:
- Fix spelling, grammar, and capitalization (uppercase/lowercase mistakes).
- Preserve the author's meaning and language mix (Hinglish is fine).
- Do NOT invent new facts, credentials, links, numbers, or names.
- Do NOT wrap the output in quotes, markdown code fences, or add commentary.
- If the input is already good, return it unchanged.
- Return ONLY the cleaned text, nothing else.

Field context: ${hint}`;
}

async function callGateway(system: string, userText: string) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("AI gateway not configured");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-lite",
      messages: [
        { role: "system", content: system },
        { role: "user", content: userText },
      ],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) throw new Error("AI rate limit — try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Add credits in workspace billing.");
    throw new Error(`AI error: ${text.slice(0, 200)}`);
  }
  const json = await res.json();
  let out: string = json.choices?.[0]?.message?.content ?? "";
  out = out.trim();
  // Strip surrounding quotes / code fences the model sometimes adds.
  out = out.replace(/^```[a-z]*\n?/i, "").replace(/```$/i, "").trim();
  if ((out.startsWith('"') && out.endsWith('"')) || (out.startsWith("'") && out.endsWith("'"))) {
    out = out.slice(1, -1);
  }
  return out;
}

export const aiFixText = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { text: string; context?: string }) =>
    z.object({
      text: z.string().min(1).max(6000),
      context: z.string().max(40).default("generic"),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const fixed = await callGateway(systemPrompt(data.context), data.text);
    return { fixed, changed: fixed.trim() !== data.text.trim() };
  });

export const aiFixFields = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { fields: { key: string; value: string; context: string }[] }) =>
    z.object({
      fields: z.array(z.object({
        key: z.string().min(1).max(60),
        value: z.string().max(6000),
        context: z.string().max(40),
      })).min(1).max(20),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const results = await Promise.all(
      data.fields.map(async (f) => {
        if (!f.value.trim()) return { key: f.key, fixed: f.value, changed: false };
        try {
          const fixed = await callGateway(systemPrompt(f.context), f.value);
          return { key: f.key, fixed, changed: fixed.trim() !== f.value.trim() };
        } catch {
          return { key: f.key, fixed: f.value, changed: false };
        }
      }),
    );
    return { results };
  });
