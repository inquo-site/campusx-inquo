import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";

const RECRUITER_KEYWORDS: Record<string, string[]> = {
  "swe-frontend": [
    "React", "TypeScript", "Next.js", "Tailwind", "Redux", "GraphQL",
    "Accessibility", "Design systems", "Web performance", "Vite", "Testing",
    "Storybook", "Responsive", "State management",
  ],
  "swe-backend": [
    "Node.js", "Go", "Python", "PostgreSQL", "Redis", "Docker", "Kubernetes",
    "Microservices", "REST", "gRPC", "AWS", "CI/CD", "System design",
    "Distributed systems", "Message queues",
  ],
  "swe-fullstack": [
    "React", "Node.js", "TypeScript", "PostgreSQL", "REST APIs", "Docker",
    "AWS", "Next.js", "System design", "CI/CD", "Testing", "GraphQL",
  ],
  "data-ml": [
    "Python", "PyTorch", "TensorFlow", "scikit-learn", "SQL", "Pandas",
    "MLOps", "LLMs", "Transformers", "Feature engineering", "A/B testing",
    "Data pipelines", "Airflow", "Model deployment",
  ],
  "devops-sre": [
    "Kubernetes", "Terraform", "AWS", "GCP", "Docker", "CI/CD", "Observability",
    "Prometheus", "Grafana", "Linux", "Bash", "Incident response", "SLOs",
  ],
  "product": [
    "Roadmap", "Discovery", "Metrics", "A/B testing", "User research",
    "Stakeholder alignment", "PRDs", "SQL", "Prioritization", "OKRs",
    "Growth", "Retention",
  ],
  "design": [
    "Figma", "Design systems", "Prototyping", "User research", "Interaction design",
    "Accessibility", "Motion", "UX writing", "Handoff", "Component libraries",
  ],
};

export const linkedInRoleCategories = Object.keys(RECRUITER_KEYWORDS);

const InputSchema = z.object({
  role: z.string(),
  raw: z.string().min(20).max(20000),
});

const SectionSchema = z.object({
  name: z.string(),
  original: z.string(),
  rewrite: z.string(),
  reasoning: z.string(),
});

const ResultSchema = z.object({
  headline: SectionSchema,
  about: SectionSchema,
  experience: SectionSchema,
  matched_keywords: z.array(z.string()),
  missing_keywords: z.array(z.string()),
  score: z.number(),
  overall_advice: z.string(),
});

export type OptimizerResult = z.infer<typeof ResultSchema>;

function extractSections(raw: string) {
  const text = raw.replace(/\r/g, "").trim();
  const grab = (labels: string[]) => {
    for (const l of labels) {
      const re = new RegExp(`(?:^|\\n)\\s*${l}\\s*[:\\-\\n]+([\\s\\S]{0,4000}?)(?=\\n\\s*(?:headline|about|summary|experience|education|skills|projects)\\s*[:\\-\\n]|$)`, "i");
      const m = text.match(re);
      if (m) return m[1].trim();
    }
    return "";
  };
  const headline = grab(["headline", "title"]);
  const about = grab(["about", "summary"]);
  const experience = grab(["experience", "work experience", "employment"]);
  return {
    headline: headline || text.slice(0, 220),
    about: about || (headline ? "" : text.slice(0, 1200)),
    experience: experience || "",
  };
}

export const optimizeLinkedIn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI is not configured");

    const bank = RECRUITER_KEYWORDS[data.role] ?? RECRUITER_KEYWORDS["swe-fullstack"];
    const sections = extractSections(data.raw);

    const { createLovableAiGatewayProvider } = await import("@/lib/ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const prompt = `You are a LinkedIn profile coach for early-career software builders in India.
Target role category: ${data.role}
Recruiter keyword bank for this role: ${bank.join(", ")}

The user's current profile is split into three sections. For each section:
- Keep the same first-person voice.
- Rewrite it to be tight, specific, and outcome-focused.
- Weave in the most relevant keywords from the bank ONLY where they naturally fit — never keyword-stuff.
- Keep headline under 220 characters. Keep About under 1800 characters. Rewrite experience as 3-5 crisp bullet lines (use "•" prefix).
- In "reasoning", briefly explain in one sentence what you improved.

Also return:
- matched_keywords: keywords from the bank that already appear in the original text (case-insensitive).
- missing_keywords: bank keywords that are absent but would strengthen this profile if truthfully applicable (max 8).
- score: 0-100 estimate of current recruiter readiness for this role.
- overall_advice: 1-2 sentences of the single most impactful next move.

CURRENT HEADLINE:
${sections.headline || "(none)"}

CURRENT ABOUT:
${sections.about || "(none)"}

CURRENT EXPERIENCE:
${sections.experience || "(none)"}`;

    try {
      const { output } = await generateText({
        model,
        output: Output.object({ schema: ResultSchema }),
        prompt,
      });
      return output;
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        try {
          return ResultSchema.parse(JSON.parse(error.text ?? "{}"));
        } catch {
          throw new Error("The AI returned an unexpected response. Please try again.");
        }
      }
      throw error;
    }
  });
