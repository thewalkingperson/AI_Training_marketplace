import { describe, expect, test } from "vitest";

import { DOMAIN_TAXONOMY, getDomainDefinition } from "@/lib/taxonomy";

describe("domain taxonomy", () => {
  test("covers the initial sponsor-facing domains", () => {
    expect(DOMAIN_TAXONOMY.map((domain) => domain.id)).toEqual([
      "devops",
      "financial_modeling_code",
      "backend_debugging",
      "frontend_debugging",
      "data_pipeline",
      "test_repair",
      "refactor_navigation"
    ]);
  });

  test("retrieves metadata for a single domain", () => {
    expect(getDomainDefinition("devops")?.defaultSignals).toContain("ci_failure");
  });
});
