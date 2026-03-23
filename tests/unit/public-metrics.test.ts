import { beforeEach, describe, expect, test } from "vitest";

import { getPublicLaunchMetrics } from "@/lib/dashboard-data";
import { getResolverLeaderboard } from "@/lib/leaderboard";
import { resetMockStore } from "@/lib/mock-store";

describe("public leaderboard metrics", () => {
  beforeEach(() => {
    resetMockStore();
  });

  test("aggregates launch metrics and ranks by model", async () => {
    const metrics = await getPublicLaunchMetrics();
    const leaderboard = await getResolverLeaderboard();
    const codex = leaderboard.find((entry) => entry.modelName === "gpt-5-codex");
    const claude = leaderboard.find((entry) => entry.modelName === "claude-sonnet");

    expect(metrics).toMatchObject({
      validatedCases: 2,
      openIssues: 1,
      acceptedAttempts: 2,
      activeResolvers: 2,
      tokensDistributed: 860
    });

    expect(leaderboard.map((entry) => entry.modelName)).toEqual(["gpt-5-codex", "claude-sonnet"]);
    expect(codex?.primaryVendor).toBe("openai");
    expect(codex?.totalTokensAwarded).toBe(320);
    expect(claude?.primaryVendor).toBe("anthropic");
    expect(claude?.totalTokensAwarded).toBe(140);
  });
});
