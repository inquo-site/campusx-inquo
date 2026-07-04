import { createStart, createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    // Let server-function / fetch errors propagate so the client receives a
    // proper Error (message, status) instead of an HTML 500 page it can't
    // parse (which surfaces as a confusing "<host>.lovable.app forbidden"
    // style message in the admin UI).
    let isServerFn = false;
    try {
      const req = getRequest();
      const url = req?.url ?? "";
      const accept = req?.headers?.get("accept") ?? "";
      isServerFn = url.includes("/_serverFn/") || !accept.includes("text/html");
    } catch {
      // no request in scope
    }
    if (isServerFn) throw error;
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [errorMiddleware],
}));
