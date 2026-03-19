import { describe, expect, test } from "vitest";

import { hasRequiredRights, resolveEligibility } from "@/lib/permissions";

describe("rights helpers", () => {
  test("requires all requested scopes", () => {
    expect(
      hasRequiredRights(
        {
          evaluation: true,
          competition: false,
          training: true
        },
        ["evaluation", "training"],
      ),
    ).toBe(true);

    expect(
      hasRequiredRights(
        {
          evaluation: true,
          competition: false,
          training: true
        },
        ["evaluation", "competition"],
      ),
    ).toBe(false);
  });

  test("maps review outcomes into eligibility states", () => {
    expect(resolveEligibility(true)).toBe("eligible");
    expect(resolveEligibility(false)).toBe("ineligible");
  });
});
