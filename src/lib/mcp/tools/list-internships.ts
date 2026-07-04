import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase-for-user";

export default defineTool({
  name: "list_internships",
  title: "Browse internships",
  description: "List available internships on Campus X, optionally filtered by keyword.",
  inputSchema: {
    query: z.string().max(120).optional().describe("Match against title/company/description."),
    limit: z.number().int().min(1).max(50).optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, limit }, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    let q = supabaseForUser(ctx)
      .from("internships")
      .select("id,title,company,location,duration,stipend,tech_stack,description,apply_url")
      .order("created_at", { ascending: false })
      .limit(limit ?? 20);
    if (query) q = q.or(`title.ilike.%${query}%,company.ilike.%${query}%,description.ilike.%${query}%`);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { internships: data ?? [] },
    };
  },
});
