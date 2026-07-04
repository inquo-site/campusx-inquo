import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase-for-user";

export default defineTool({
  name: "create_project",
  title: "Create a project",
  description: "Post a new project to the Campus X Project Hub, owned by the signed-in user.",
  inputSchema: {
    title: z.string().trim().min(2).max(120),
    description: z.string().trim().min(10).max(4000),
    tech_stack: z.array(z.string()).max(20).optional(),
    tag: z.string().max(40).optional(),
    github_url: z.string().url().optional(),
    live_url: z.string().url().optional(),
    roles_needed: z.array(z.string()).max(20).optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const { data, error } = await supabaseForUser(ctx)
      .from("projects")
      .insert({ ...input, owner_id: ctx.getUserId()! })
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Created project ${data.id}` }],
      structuredContent: { project: data },
    };
  },
});
