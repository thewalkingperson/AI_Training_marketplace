import { addCompetition, addCompetitionEntry, getSnapshot } from "@/lib/mock-store";
import { recordAuditEvent } from "@/lib/services/audit";
import { slugify } from "@/lib/utils";
import type {
  CompetitionCampaign,
  CompetitionEntry,
  CompetitionRun,
  CompetitionCaseSplit
} from "@/lib/types";

interface CreateCompetitionInput extends Omit<CompetitionCampaign, "id" | "slug" | "createdAt"> {
  publicCaseIds: string[];
  hiddenCaseIds: string[];
}

interface SubmitCompetitionEntryInput {
  competitionId: string;
  participantId: string;
  agentConfig: CompetitionEntry["agentConfig"];
}

export const createCompetition = (input: CreateCompetitionInput) => {
  const snapshot = getSnapshot();
  const competitionId = `comp_${slugify(`${input.title}-${Date.now()}`)}`;
  const competition: CompetitionCampaign = {
    buyerId: input.buyerId,
    title: input.title,
    slug: slugify(input.title),
    description: input.description,
    filters: input.filters,
    allowedModels: input.allowedModels,
    allowedTools: input.allowedTools,
    prizePoolUsd: input.prizePoolUsd,
    maxEntriesPerUser: input.maxEntriesPerUser,
    scoringVersion: input.scoringVersion,
    status: input.status,
    startAt: input.startAt,
    endAt: input.endAt,
    id: competitionId,
    createdAt: new Date().toISOString()
  };

  addCompetition(competition);

  const splits: CompetitionCaseSplit[] = [
    ...input.publicCaseIds.map((caseId) => ({
      id: crypto.randomUUID(),
      competitionId,
      caseId,
      split: "public_dev" as const
    })),
    ...input.hiddenCaseIds.map((caseId) => ({
      id: crypto.randomUUID(),
      competitionId,
      caseId,
      split: "hidden_holdout" as const
    }))
  ];

  snapshot.competitionSplits.unshift(...splits);

  recordAuditEvent({
    actorId: input.buyerId,
    entityType: "competition",
    entityId: competition.id,
    action: "competition.created",
    metadata: {
      publicCases: input.publicCaseIds.length,
      holdoutCases: input.hiddenCaseIds.length
    }
  });

  return competition;
};

const computeEntryScores = (entry: CompetitionEntry, competition: CompetitionCampaign) => {
  const toolCoverage =
    entry.agentConfig.allowedTools.filter((tool) => competition.allowedTools.includes(tool)).length /
    competition.allowedTools.length;
  const promptEfficiency = Math.max(0.4, 1 - entry.agentConfig.temperature * 0.2);
  const modelFit = competition.allowedModels.includes(entry.agentConfig.modelId) ? 1 : 0.6;

  const devScore = Number((toolCoverage * 0.4 + promptEfficiency * 0.25 + modelFit * 0.35).toFixed(3));
  const costScore = Number((entry.agentConfig.budgetLimitUsd * (1 + entry.agentConfig.temperature)).toFixed(2));
  const runtimeScore = entry.agentConfig.timeoutSeconds * Math.max(2, entry.agentConfig.maxTurns);

  return {
    devScore,
    costScore,
    runtimeScore
  };
};

export const submitCompetitionEntry = ({
  competitionId,
  participantId,
  agentConfig
}: SubmitCompetitionEntryInput) => {
  const snapshot = getSnapshot();
  const competition = snapshot.competitions.find((item) => item.id === competitionId);

  if (!competition) {
    throw new Error("Competition not found");
  }

  const currentEntries = snapshot.competitionEntries.filter(
    (entry) => entry.campaignId === competitionId && entry.participantId === participantId,
  );

  if (currentEntries.length >= competition.maxEntriesPerUser) {
    throw new Error("Competition entry limit reached");
  }

  const disallowedTools = agentConfig.allowedTools.filter((tool) => !competition.allowedTools.includes(tool));
  if (!competition.allowedModels.includes(agentConfig.modelId) || disallowedTools.length > 0) {
    throw new Error("Entry uses a disallowed model or tool");
  }

  const entry: CompetitionEntry = {
    id: crypto.randomUUID(),
    campaignId: competitionId,
    participantId,
    agentConfig,
    status: "scored",
    devScore: null,
    holdoutScore: null,
    costScore: null,
    runtimeScore: null,
    createdAt: new Date().toISOString()
  };

  const scores = computeEntryScores(entry, competition);
  entry.devScore = scores.devScore;
  entry.costScore = scores.costScore;
  entry.runtimeScore = scores.runtimeScore;

  addCompetitionEntry(entry);

  const run: CompetitionRun = {
    id: crypto.randomUUID(),
    entryId: entry.id,
    split: "public_dev",
    solvedCases: Math.round(scores.devScore * 10),
    totalCases: 10,
    totalCostUsd: scores.costScore,
    totalRuntimeMs: scores.runtimeScore * 10,
    reasonCodes: ["managed_runner_scored"],
    createdAt: new Date().toISOString()
  };

  snapshot.competitionRuns.unshift(run);

  recordAuditEvent({
    actorId: participantId,
    entityType: "competition_entry",
    entityId: entry.id,
    action: "competition.entry.scored",
    metadata: scores
  });

  return {
    entry,
    run
  };
};

export const rankCompetitionEntries = (competitionId: string) =>
  getSnapshot()
    .competitionEntries
    .filter((entry) => entry.campaignId === competitionId && entry.status === "scored")
    .sort((left, right) => {
      const devDelta = (right.devScore ?? 0) - (left.devScore ?? 0);
      if (devDelta !== 0) {
        return devDelta;
      }

      const costDelta = (left.costScore ?? Number.POSITIVE_INFINITY) - (right.costScore ?? Number.POSITIVE_INFINITY);
      if (costDelta !== 0) {
        return costDelta;
      }

      return (left.runtimeScore ?? Number.POSITIVE_INFINITY) - (right.runtimeScore ?? Number.POSITIVE_INFINITY);
    });
