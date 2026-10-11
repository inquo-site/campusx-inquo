import { describe, expect, test } from "bun:test";
import { createDemoMailto, demoRequestSchema } from "./demo-request";

const request = { focus: "Student workspace" as const, date: "2026-11-12", time: "12:00" as const, duration: 30, name: "Demo Visitor", email: "visitor@example.com", organisation: "Example College" };

describe("product demo requests", () => {
  test("rejects invalid email input", () => {
    expect(demoRequestSchema.safeParse({ ...request, email: "not-an-email" }).success).toBe(false);
  });
  test("rejects impossible calendar dates", () => {
    expect(demoRequestSchema.safeParse({ ...request, date: "2026-02-31" }).success).toBe(false);
  });
  test("encodes visitor input without changing the email recipient", () => {
    const url = createDemoMailto({ ...request, organisation: "College & Partners?subject=other" });
    expect(url.split("?")[0]).toBe("mailto:campusx4@gmail.com");
    expect(new URLSearchParams(url.split("?")[1]).get("body")).toContain("College & Partners?subject=other");
  });
});