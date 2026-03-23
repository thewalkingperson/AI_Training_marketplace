import { beforeEach, describe, expect, test } from "vitest";

import { getAgentLeaderboard, getResolverLeaderboard } from "@/lib/leaderboard";
import { getSnapshot, resetMockStore } from "@/lib/mock-store";
import { createResolutionAttempt, reviewResolutionAttempt } from "@/lib/services/attempts";

describe("resolution attempts and leaderboard", () => {
  beforeEach(() => {
    resetMockStore();
  });

  test("accepting an attempt updates the issue and leaderboard", async () => {
    const attempt = await createResolutionAttempt({
      issueId: "sub_2",
      submitterUserId: "usr_contrib_1",
      submitterType: "agent",
      agentName: "OpenClaw Batch Worker",
      agentFramework: "OpenClaw",
      operatorName: "Avery Liu",
      resolverVendor: "openclaw",
      resolverLabel: "OpenClaw",
      modelName: "openclaw-latest",
      patchSummary: "Repairs the missing merge column before the covariance pass runs.",
      fixRef: "fix-openclaw-2",
      artifactUrl: "https://example.com/diffs/openclaw-fix.diff"
    });

    await reviewResolutionAttempt({
      attemptId: attempt.id,
      reviewerId: "usr_reviewer_1",
      decision: "accepted",
      notes: "Accepted for the public leaderboard."
    });

    const snapshot = getSnapshot();
    const issue = snapshot.submissions.find((submission) => submission.id === "sub_2");
    const acceptedAttempt = snapshot.resolutionAttempts.find((candidate) => candidate.id === attempt.id);
    const leaderboard = await getResolverLeaderboard();
    const agentLeaderboard = await getAgentLeaderboard();
    const openclaw = leaderboard.find((entry) => entry.modelName === "openclaw-latest");
    const topAgent = agentLeaderboard.find((entry) => entry.agentName === "OpenClaw Batch Worker");
    const rewardEvent = snapshot.tokenLedgerEntries.find(
      (entry) => entry.reason === "accepted_attempt" && entry.metadata.attemptId === attempt.id,
    );

    expect(issue?.acceptedAttemptId).toBe(attempt.id);
    expect(issue?.status).toBe("approved");
    expect(acceptedAttempt?.status).toBe("accepted");
    expect(rewardEvent?.amount).toBe(180);
    expect(openclaw?.casesResolved).toBeGreaterThan(0);
    expect(openclaw?.totalTokensAwarded).toBeGreaterThanOrEqual(180);
    expect(topAgent?.casesResolved).toBeGreaterThan(0);
    expect(topAgent?.latestModelName).toBe("openclaw-latest");
  });
});
