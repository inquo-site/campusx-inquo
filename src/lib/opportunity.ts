// Shared, client-safe helpers for the opportunity pages
// (internships, off-campus jobs, hackathons).

export type FaqItem = { q: string; a: string };
export type TimelineItem = { label: string; date?: string | null; detail?: string | null };

export type OpportunityKind = "internship" | "job" | "hackathon";

export type Opportunity = {
  kind: OpportunityKind;
  id: string;
  title: string;
  org: string;
  /** short one-liner shown under the title */
  subtitle?: string | null;
  description?: string | null;
  /** key → value facts rendered as chips (stipend, duration, prize pool…) */
  facts: { label: string; value: string }[];
  eligibility: string[];
  skills: string[];
  requirements: string[];
  faq: FaqItem[];
  timeline: TimelineItem[];
  tags: string[];
  applyUrl?: string | null;
  deadline?: string | null;
  enrichedAt?: string | null;
  /** internal apply flow is only available for internships */
  canApplyInApp: boolean;
};

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.trim() !== "") : [];
}

export function parseFaq(v: unknown): FaqItem[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((it) => {
      const o = it as Record<string, unknown>;
      const q = typeof o?.q === "string" ? o.q : typeof o?.question === "string" ? o.question : "";
      const a = typeof o?.a === "string" ? o.a : typeof o?.answer === "string" ? o.answer : "";
      return { q, a };
    })
    .filter((f) => f.q && f.a);
}

export function parseTimeline(v: unknown): TimelineItem[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((it) => {
      const o = it as Record<string, unknown>;
      const label = typeof o?.label === "string" ? o.label : typeof o?.stage === "string" ? o.stage : "";
      return {
        label,
        date: typeof o?.date === "string" ? o.date : null,
        detail: typeof o?.detail === "string" ? o.detail : null,
      };
    })
    .filter((t) => t.label);
}

export function fmtDate(d?: string | null) {
  if (!d) return null;
  const iso = d.length === 10 ? `${d}T00:00:00` : d;
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function timeAgo(iso?: string | null) {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  const mins = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return days === 1 ? "yesterday" : `${days}d ago`;
}

/* ------------------------------------------------------------------ */
/* Row → Opportunity mappers                                          */
/* ------------------------------------------------------------------ */

type Row = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" && v.trim() !== "" ? v : null);

export function internshipToOpportunity(r: Row): Opportunity {
  return {
    kind: "internship",
    id: String(r.id),
    title: String(r.title ?? "Internship"),
    org: String(r.company ?? ""),
    subtitle: str(r.location),
    description: str(r.description),
    facts: [
      ...(str(r.stipend) ? [{ label: "Stipend", value: String(r.stipend) }] : []),
      ...(str(r.duration) ? [{ label: "Duration", value: String(r.duration) }] : []),
      ...(str(r.location) ? [{ label: "Location", value: String(r.location) }] : []),
    ],
    eligibility: asStringArray(r.eligibility),
    skills: asStringArray(r.skills).length ? asStringArray(r.skills) : asStringArray(r.tech_stack),
    requirements: asStringArray(r.requirements),
    faq: parseFaq(r.faq),
    timeline: parseTimeline(r.timeline),
    tags: asStringArray(r.tech_stack),
    applyUrl: str(r.apply_url),
    deadline: str(r.deadline),
    enrichedAt: str(r.enriched_at),
    canApplyInApp: true,
  };
}

export function jobToOpportunity(r: Row): Opportunity {
  return {
    kind: "job",
    id: String(r.id),
    title: String(r.title ?? "Role"),
    org: String(r.company ?? ""),
    subtitle: str(r.location),
    description: str(r.description),
    facts: [
      ...(str(r.salary) ? [{ label: "CTC", value: String(r.salary) }] : []),
      ...(str(r.experience) ? [{ label: "Experience", value: String(r.experience) }] : []),
      ...(str(r.location) ? [{ label: "Location", value: String(r.location) }] : []),
      ...(str(r.role_type) ? [{ label: "Type", value: String(r.role_type) }] : []),
    ],
    eligibility: asStringArray(r.eligibility),
    skills: asStringArray(r.skills).length ? asStringArray(r.skills) : asStringArray(r.tech_stack),
    requirements: asStringArray(r.requirements),
    faq: parseFaq(r.faq),
    timeline: parseTimeline(r.timeline),
    tags: asStringArray(r.tech_stack),
    applyUrl: str(r.apply_url),
    deadline: str(r.deadline),
    enrichedAt: str(r.enriched_at),
    canApplyInApp: false,
  };
}

export function hackathonToOpportunity(r: Row): Opportunity {
  const start = fmtDate(str(r.starts_at));
  const end = fmtDate(str(r.ends_at));
  return {
    kind: "hackathon",
    id: String(r.id),
    title: String(r.name ?? "Hackathon"),
    org: String(r.organiser ?? ""),
    subtitle: str(r.theme),
    description: str(r.description) ?? str(r.theme),
    facts: [
      ...(start ? [{ label: "Dates", value: end ? `${start} → ${end}` : start }] : []),
      ...(str(r.mode) ? [{ label: "Mode", value: String(r.mode) }] : []),
      ...(str(r.location) ? [{ label: "Venue", value: String(r.location) }] : []),
      ...(str(r.team_size) ? [{ label: "Team", value: String(r.team_size) }] : []),
      ...(str(r.prize_pool) ? [{ label: "Prizes", value: String(r.prize_pool) }] : []),
    ],
    eligibility: asStringArray(r.eligibility),
    skills: asStringArray(r.skills).length ? asStringArray(r.skills) : asStringArray(r.tags),
    requirements: asStringArray(r.requirements),
    faq: parseFaq(r.faq),
    timeline: parseTimeline(r.timeline),
    tags: asStringArray(r.tags),
    applyUrl: str(r.register_url),
    deadline: str(r.starts_at),
    enrichedAt: str(r.enriched_at),
    canApplyInApp: false,
  };
}
