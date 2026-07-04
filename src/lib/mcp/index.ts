import { auth, defineMcp } from "@lovable.dev/mcp-js";
import whoami from "./tools/whoami";
import listProjects from "./tools/list-projects";
import createProject from "./tools/create-project";
import listInternships from "./tools/list-internships";
import getResume from "./tools/get-resume";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "campus-x-mcp",
  title: "Campus X",
  version: "0.1.0",
  instructions:
    "Campus X tools for student builders. Read the signed-in user's projects, resume, and internships; create new projects on their behalf.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [whoami, listProjects, createProject, listInternships, getResume],
});
