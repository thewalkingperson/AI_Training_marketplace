import { describe, expect, test } from "vitest";

import { mockSnapshot } from "@/lib/mock-data";
import { buildPricingRecommendation } from "@/lib/services/pricing";

describe("pricing advisor", () => {
  test("builds a bounded recommendation with reason codes", () => {
    const caseRecord = mockSnapshot.validatedCases[0];
    const submission = mockSnapshot.submissions[0];
    const brief = mockSnapshot.briefs[0];

    const recommendation = buildPricingRecommendation(caseRecord, submission, brief);

    expect(recommendation.suggestedMaxUsd).toBeGreaterThan(recommendation.suggestedMinUsd);
    expect(recommendation.reasonCodes).toContain("clean_repro");
    expect(recommendation.llmSummary).toContain("Suggested band");
  });
});
