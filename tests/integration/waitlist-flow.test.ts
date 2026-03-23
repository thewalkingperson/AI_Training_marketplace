import { describe, expect, test } from "vitest";

import { createWaitlistEntry } from "@/lib/services/waitlist";

describe("waitlist flow", () => {
  test("creates a new contributor waitlist entry", async () => {
    const suffix = Date.now().toString(36);
    const entry = await createWaitlistEntry({
      email: `builder-${suffix}@example.com`,
      userType: "contributor",
      githubHandle: `builder${suffix}`,
      notes: "Focused on reproducible TypeScript workflow failures."
    });

    expect(entry.email).toContain("@example.com");
    expect(entry.userType).toBe("contributor");
    expect(entry.status).toBe("pending");
  });
});
