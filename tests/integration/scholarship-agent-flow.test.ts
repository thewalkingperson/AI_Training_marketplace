import { beforeEach, describe, expect, test } from "vitest";

import { getScholarshipSnapshot, resetScholarshipStore } from "@/lib/scholarships/mock-store";

describe("scholarship agent pipeline", () => {
  beforeEach(() => {
    resetScholarshipStore();
  });

  test("creates wins, needs-action work, review cases, and a fee only for eligible awards", () => {
    const snapshot = getScholarshipSnapshot();

    const futureCodersAttempt = snapshot.submissionAttempts.find((item) => item.opportunityId === "opp_future_coders");
    const pioneerAttempt = snapshot.submissionAttempts.find((item) => item.opportunityId === "opp_pioneer_portal");
    const atlasReview = snapshot.reviewCases.find((item) => item.opportunityId === "opp_atlas_women_tech");
    const futureCodersBilling = snapshot.billingEvents.find((item) => item.opportunityId === "opp_future_coders");
    const brightpathBilling = snapshot.billingEvents.find((item) => item.opportunityId === "opp_brightpath_relief");

    expect(futureCodersAttempt?.status).toBe("submitted");
    expect(pioneerAttempt?.status).toBe("needs_student_action");
    expect(atlasReview?.reviewStatus).toBe("open");
    expect(snapshot.submissionOutcomes.some((item) => item.status === "won")).toBe(true);
    expect(futureCodersBilling?.amountUsd).toBe(250);
    expect(brightpathBilling).toBeUndefined();
  });
});
