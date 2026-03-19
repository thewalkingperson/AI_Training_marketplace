import { beforeEach, describe, expect, test } from "vitest";

import { getSnapshot, resetMockStore } from "@/lib/mock-store";
import { suggestBriefMatches } from "@/lib/services/briefs";
import { createReviewDecision } from "@/lib/services/reviews";
import { createSubmission } from "@/lib/services/submissions";

describe("submission to review flow", () => {
  beforeEach(() => {
    resetMockStore();
  });

  test("creates a submission, approves it, and suggests brief matches", () => {
    const created = createSubmission({
      contributorId: "usr_contrib_1",
      artifactType: "code_repo",
      sourceUrl: "https://github.com/acme/deployments",
      taskUrl: "https://github.com/acme/deployments/issues/12",
      language: "typescript",
      toolName: "Claude Code",
      modelName: "claude-sonnet",
      promptSummary: "Repair the broken deploy gate without changing release ordering.",
      failingRef: "abc1234",
      fixRef: "def5678",
      reproSteps: ["pnpm install", "pnpm test"],
      artifacts: [],
      rights: {
        evaluation: true,
        competition: true,
        training: false
      },
      attestations: ["public repo", "allowed to submit"]
    });

    createReviewDecision({
      caseId: created.validatedCase.id,
      reviewerId: "usr_reviewer_1",
      decision: "approved",
      notes: "Safe for evaluation and competition use.",
      rightsApproved: {
        evaluation: true,
        competition: true,
        training: false
      }
    });

    const snapshot = getSnapshot();
    const caseRecord = snapshot.validatedCases.find((item) => item.id === created.validatedCase.id);
    const submission = snapshot.submissions.find((item) => item.id === created.submission.id);

    expect(caseRecord?.reviewStatus).toBe("approved");
    expect(submission?.status).toBe("approved");

    const matches = suggestBriefMatches(caseRecord!, submission!);
    expect(matches.length).toBeGreaterThan(0);
  });
});
