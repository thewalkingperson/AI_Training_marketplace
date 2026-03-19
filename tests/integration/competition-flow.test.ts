import { beforeEach, describe, expect, test } from "vitest";

import { resetMockStore } from "@/lib/mock-store";
import { createCompetition, rankCompetitionEntries, submitCompetitionEntry } from "@/lib/services/competitions";

describe("competition flow", () => {
  beforeEach(() => {
    resetMockStore();
  });

  test("creates a competition and scores a submitted config", () => {
    const competition = createCompetition({
      buyerId: "usr_lab_1",
      title: "Backend Bug Sprint",
      description: "Score agent configs on API regression repair tasks.",
      filters: ["backend_debugging", "python"],
      allowedModels: ["gpt-4.1"],
      allowedTools: ["repo_search", "terminal"],
      prizePoolUsd: 5000,
      maxEntriesPerUser: 3,
      scoringVersion: "backend-v1",
      status: "active",
      startAt: new Date().toISOString(),
      endAt: new Date(Date.now() + 86400000).toISOString(),
      publicCaseIds: ["case_1"],
      hiddenCaseIds: ["case_2"]
    });

    const result = submitCompetitionEntry({
      competitionId: competition.id,
      participantId: "usr_contrib_1",
      agentConfig: {
        modelId: "gpt-4.1",
        systemPrompt: "You fix backend regressions carefully.",
        taskPromptTemplate: "Repair the regression and rerun tests.",
        allowedTools: ["repo_search", "terminal"],
        maxTurns: 7,
        temperature: 0.2,
        budgetLimitUsd: 10,
        timeoutSeconds: 800
      }
    });

    expect(result.entry.devScore).not.toBeNull();
    expect(rankCompetitionEntries(competition.id)[0]?.id).toBe(result.entry.id);
  });
});
