// Server-only: auto-enriches opportunity listings (internships / jobs / hackathons)
// with eligibility, required skills, requirements, FAQ and a process timeline.
import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const STALE_DAYS = 21;

type Table = "internships" | "jobs" | "hackathons";

type Enriched = {
  eligibility: string[];
  skills: string[];
  requirements: string[];
  faq: { q: string; a: string }[];
  timeline: { label: string; date?: string | null; detail?: string | null }[];
};

const SYSTEM = `You are Tier2X's Opportunity Research Agent for Indian student developers.
Given a posting, produce realistic, specific, non-generic details.
Return STRICT JSON only, no markdown fences, exactly this shape:
{
  "eligibility": ["4-6 short criteria (year of study, CGPA, graduation batch, location/remote, prior experience)"],
  "skills": ["6-10 concrete skills/tools required, single words or short phrases"],
  "requirements": ["4-6 expectations / responsibilities, one line each"],
  "faq": [{"q":"question","a":"2-3 sentence answer"}],
  "timeline": [{"label":"stage name","date":null,"detail":"one line about this stage"}]
}
faq must have 4-6 items. timeline must have 3-5 stages (e.g. Apply, Online assessment, Interviews, Offer / for hackathons: Registration, Idea submission, Hack days, Demo day).
Never invent an exact date you cannot know — leave "date" as null unless a date is given in the input.`;

function safeJson(text: string): Enriched | null {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    const raw = JSON.parse(cleaned.slice(start, end + 1)) as Partial<Enriched>;
    const arr = (v: unknown) =>
      Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.trim() !== "").slice(0, 12) : [];
    return {
      eligibility: arr(raw.eligibility),
      skills: arr(raw.skills),
      requirements: arr(raw.requirements),
      faq: Array.isArray(raw.faq)
        ? raw.faq
            .filter((f) => f && typeof f.q === "string" && typeof f.a === "string")
            .slice(0, 8)
            .map((f) => ({ q: f.q, a: f.a }))
        : [],
      timeline: Array.isArray(raw.timeline)
        ? raw.timeline
            .filter((t) => t && typeof t.label === "string")
            .slice(0, 6)
            .map((t) => ({ label: t.label, date: t.date ?? null, detail: t.detail ?? null }))
        : [],
    };
  } catch {
    return null;
  }
}

function describe(table: Table, row: Record<string, unknown>): string {
  if (table === "hackathons") {
    return [
      `Hackathon: ${row.name}`,
      `Organiser: ${row.organiser ?? "unknown"}`,
      `Mode: ${row.mode} · Location: ${row.location ?? "online"}`,
      `Theme: ${row.theme ?? "open innovation"}`,
      `Prize pool: ${row.prize_pool ?? "TBA"} · Team size: ${row.team_size ?? "1-4"}`,
      `Starts: ${row.starts_at ?? "TBA"} · Ends: ${row.ends_at ?? "TBA"}`,
      `Tags: ${JSON.stringify(row.tags ?? [])}`,
    ].join("\n");
  }
  if (table === "jobs") {
    return [
      `Off-campus role: ${row.title} at ${row.company}`,
      `Type: ${row.role_type} · Experience: ${row.experience ?? "fresher"}`,
      `Location: ${row.location ?? "remote"} · CTC: ${row.salary ?? "not disclosed"}`,
      `Stack: ${JSON.stringify(row.tech_stack ?? [])}`,
      `Description: ${row.description ?? "n/a"}`,
    ].join("\n");
  }
  return [
    `Internship: ${row.title} at ${row.company}`,
    `Location: ${row.location ?? "remote"} · Stipend: ${row.stipend ?? "unpaid"} · Duration: ${row.duration ?? "3 months"}`,
    `Stack: ${JSON.stringify(row.tech_stack ?? [])}`,
    `Existing requirements: ${JSON.stringify(row.requirements ?? [])}`,
    `Description: ${row.description ?? "n/a"}`,
  ].join("\n");
}

export async function runOpportunityRefresh(opts: { limit?: number; force?: boolean } = {}) {
  const perTable = Math.max(1, Math.min(opts.limit ?? 4, 12));
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");
  const model = createLovableAiGatewayProvider(apiKey)("google/gemini-2.5-flash");

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const staleBefore = new Date(Date.now() - STALE_DAYS * 86400_000).toISOString();

  const { data: run } = await supabaseAdmin
    .from("opportunity_sync_runs")
    .insert({ kind: "auto-refresh", status: "running" })
    .select("id")
    .single();

  let enriched = 0;
  const notes: string[] = [];

  for (const table of ["internships", "jobs", "hackathons"] as Table[]) {
    let q = supabaseAdmin.from(table).select("*").limit(perTable);
    if (!opts.force) q = q.or(`enriched_at.is.null,enriched_at.lt.${staleBefore}`);
    const { data: rows, error } = await q;
    if (error) {
      notes.push(`${table}: ${error.message}`);
      continue;
    }
    for (const row of rows ?? []) {
      try {
        const { text } = await generateText({
          model,
          system: SYSTEM,
          prompt: describe(table, row as Record<string, unknown>),
          temperature: 0.6,
        });
        const parsed = safeJson(text);
        if (!parsed) {
          notes.push(`${table}/${(row as { id: string }).id}: unparseable AI output`);
          continue;
        }
        const keepRequirements =
          table === "internships" && ((row as { requirements?: string[] | null }).requirements ?? []).length > 0;
        const patch = {
          eligibility: parsed.eligibility,
          skills: parsed.skills,
          faq: parsed.faq,
          timeline: parsed.timeline,
          enriched_at: new Date().toISOString(),
          ...(keepRequirements ? {} : { requirements: parsed.requirements }),
        };
        const { error: upErr } = await supabaseAdmin
          .from(table)
          .update(patch)
          .eq("id", (row as { id: string }).id);

        if (upErr) notes.push(`${table}/${(row as { id: string }).id}: ${upErr.message}`);
        else enriched += 1;
      } catch (e) {
        notes.push(`${table}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  }

  if (run?.id) {
    await supabaseAdmin
      .from("opportunity_sync_runs")
      .update({
        status: notes.length && enriched === 0 ? "failed" : "done",
        enriched_count: enriched,
        note: notes.slice(0, 12).join(" | ") || `Enriched ${enriched} listings`,
        finished_at: new Date().toISOString(),
      })
      .eq("id", run.id);
  }

  return { enriched, notes };
}
