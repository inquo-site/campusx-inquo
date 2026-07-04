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
    // Only render the fallback HTML page for top-level GET page loads.
    // Server-function / fetch calls must receive the real error so the
    // client can surface a proper message instead of unparseable HTML
    // (which showed up in the admin UI as "<host>.lovable.app forbidden").
    let isPageLoad = false;
    try {
      const req = getRequest();
      const method = (req?.method ?? "GET").toUpperCase();
      const accept = req?.headers?.get("accept") ?? "";
      const url = req?.url ?? "";
      isPageLoad =
        method === "GET" &&
        accept.includes("text/html") &&
        !url.includes("/_serverFn/");
    } catch {
      // no request in scope — fall back to re-throw
    }
    if (!isPageLoad) throw error;
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
