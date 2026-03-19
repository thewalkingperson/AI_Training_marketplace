import { beforeEach, describe, expect, test } from "vitest";

import { resetMockStore } from "@/lib/mock-store";
import { rankCompetitionEntries, submitCompetitionEntry } from "@/lib/services/competitions";

describe("competition scoring", () => {
  beforeEach(() => {
    resetMockStore();
  });

  test("scores entries and ranks by score, then cost, then runtime", () => {
    const lowTemp = submitCompetitionEntry({
      competitionId: "comp_1",
      participantId: "usr_player_1",
      agentConfig: {
        modelId: "gpt-4.1",
        systemPrompt: "You are careful and test-first.",
        taskPromptTemplate: "Repair the bug with the smallest safe diff.",
        allowedTools: ["repo_search", "terminal", "test_runner"],
        maxTurns: 8,
        temperature: 0,
        budgetLimitUsd: 5,
        timeoutSeconds: 400
      }
    });

    const highTemp = submitCompetitionEntry({
      competitionId: "comp_1",
      participantId: "usr_contrib_1",
      agentConfig: {
        modelId: "gpt-4.1",
        systemPrompt: "You are exploratory.",
        taskPromptTemplate: "Fix the bug aggressively.",
        allowedTools: ["repo_search", "terminal", "test_runner"],
        maxTurns: 8,
        temperature: 0.8,
        budgetLimitUsd: 12,
        timeoutSeconds: 600
      }
    });

    const ranked = rankCompetitionEntries("comp_1");

    expect(lowTemp.entry.devScore).toBeGreaterThanOrEqual(highTemp.entry.devScore ?? 0);
    expect(ranked[0].id).toBe(lowTemp.entry.id);
  });
});
