import { beforeEach, describe, expect, test } from "vitest";

import { getChatLogMessages } from "@/lib/chat-logs";
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
      artifacts: [
        {
          label: "Claude transcript",
          artifactType: "chat_log",
          content: {
            source: "manual_paste",
            messages: [
              {
                id: "turn_test_1",
                role: "user",
                content: "Repair the deploy gate without changing release ordering."
              },
              {
                id: "turn_test_2",
                role: "assistant",
                content: "I will start by replaying the failing workflow."
              }
            ],
            redactionSummary: ["Token and maintainer email removed before submission."]
          }
        }
      ],
      chatLogConsent: true,
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
    expect(submission?.chatLogConsent).toBe(true);

    const chatArtifact = snapshot.submissionArtifacts.find(
      (artifact) => artifact.submissionId === created.submission.id && artifact.artifactType === "chat_log",
    );
    expect(chatArtifact).toBeDefined();
    expect(getChatLogMessages(chatArtifact).length).toBe(2);

    const matches = suggestBriefMatches(caseRecord!, submission!);
    expect(matches.length).toBeGreaterThan(0);
  });
});
