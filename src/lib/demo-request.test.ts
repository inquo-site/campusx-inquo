import { describe, it as test } from "node:test";
import assert from "node:assert/strict";
import { createDemoMailto, demoRequestSchema } from "./demo-request";

const request = { focus: "Student workspace" as const, date: "2026-11-12", time: "12:00" as const, duration: 30, name: "Demo Visitor", email: "visitor@example.com", organisation: "Example College" };

describe("product demo requests", () => {
  test("rejects invalid email input", () => {
    assert.equal(demoRequestSchema.safeParse({ ...request, email: "not-an-email" }).success, false);
  });
  test("rejects impossible calendar dates", () => {
    assert.equal(demoRequestSchema.safeParse({ ...request, date: "2026-02-31" }).success, false);
  });
  test("encodes visitor input without changing the email recipient", () => {
    const url = createDemoMailto({ ...request, organisation: "College & Partners?subject=other" });
    assert.equal(url.split("?")[0], "mailto:campusx4@gmail.com");
    assert.ok(new URLSearchParams(url.split("?")[1]).get("body")?.includes("College & Partners?subject=other"));
  });
});