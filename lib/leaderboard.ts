import { getDashboardSnapshot } from "@/lib/dashboard-data";
import type { AgentLeaderboardEntry, ResolverLeaderboardEntry, ValidatedCase } from "@/lib/types";

const sortByCompetitiveRank = <T extends {
  casesResolved: number;
  approvedCases: number;
  averageSeverity: number;
  lastResolvedAt?: string | null;
}>(left: T, right: T) => {
  if (right.casesResolved !== left.casesResolved) {
    return right.casesResolved - left.casesResolved;
  }

  if (right.approvedCases !== left.approvedCases) {
    return right.approvedCases - left.approvedCases;
  }

  if (right.averageSeverity !== left.averageSeverity) {
    return right.averageSeverity - left.averageSeverity;
  }

  return new Date(right.lastResolvedAt ?? 0).getTime() - new Date(left.lastResolvedAt ?? 0).getTime();
};

export const getResolverLeaderboard = async (): Promise<ResolverLeaderboardEntry[]> => {
  const snapshot = await getDashboardSnapshot();
  const byKey = new Map<string, ResolverLeaderboardEntry>();

  for (const attempt of snapshot.resolutionAttempts.filter((item) => item.status === "accepted")) {
    const issue = snapshot.submissions.find((submission) => submission.id === attempt.issueId);
    const caseRecord = snapshot.validatedCases.find((candidate) => candidate.submissionId === attempt.issueId);

    if (!issue || !caseRecord) {
      continue;
    }

    const payout = snapshot.briefMatches
      .filter((match) => match.caseId === caseRecord.id)
      .reduce((sum, match) => sum + match.selectedPayoutUsd, 0);
    const tokenRewards = snapshot.tokenLedgerEntries
      .filter((entry) => entry.metadata.modelName === attempt.modelName)
      .reduce((sum, entry) => sum + entry.amount, 0);
    const key = attempt.modelName;
    const existing = byKey.get(key);
    const leadingDomains = new Set<ValidatedCase["domain"]>(existing?.leadingDomains ?? []);
    const resolverLabels = new Set<string>(existing?.resolverLabels ?? []);
    leadingDomains.add(caseRecord.domain);
    resolverLabels.add(attempt.resolverLabel);

    byKey.set(key, {
      modelName: attempt.modelName,
      primaryVendor: attempt.resolverVendor,
      resolverLabels: Array.from(resolverLabels).slice(0, 3),
      casesResolved: (existing?.casesResolved ?? 0) + 1,
      approvedCases: (existing?.approvedCases ?? 0) + (caseRecord.reviewStatus === "approved" ? 1 : 0),
      competitionEligibleCases:
        (existing?.competitionEligibleCases ?? 0) +
        (caseRecord.competitionEligibility === "eligible" ? 1 : 0),
      agentSubmittedCases:
        (existing?.agentSubmittedCases ?? 0) +
        (issue.submitterType === "agent" ? 1 : 0),
      averageSeverity:
        (((existing?.averageSeverity ?? 0) * (existing?.casesResolved ?? 0)) + caseRecord.severity) /
        ((existing?.casesResolved ?? 0) + 1),
      averageNovelty:
        (((existing?.averageNovelty ?? 0) * (existing?.casesResolved ?? 0)) + caseRecord.noveltyScore) /
        ((existing?.casesResolved ?? 0) + 1),
      totalTokensAwarded: tokenRewards,
      totalMatchedPayoutUsd: (existing?.totalMatchedPayoutUsd ?? 0) + payout,
      lastResolvedAt:
        !existing?.lastResolvedAt || new Date(attempt.createdAt) > new Date(existing.lastResolvedAt)
          ? attempt.createdAt
          : existing.lastResolvedAt,
      leadingDomains: Array.from(leadingDomains).slice(0, 3)
    });
  }

  return Array.from(byKey.values()).sort((left, right) => {
    if (right.casesResolved !== left.casesResolved) {
      return right.casesResolved - left.casesResolved;
    }

    if (right.approvedCases !== left.approvedCases) {
      return right.approvedCases - left.approvedCases;
    }

    if (right.totalTokensAwarded !== left.totalTokensAwarded) {
      return right.totalTokensAwarded - left.totalTokensAwarded;
    }

    return right.averageSeverity - left.averageSeverity;
  });
};

export const getAgentLeaderboard = async (): Promise<AgentLeaderboardEntry[]> => {
  const snapshot = await getDashboardSnapshot();
  const byKey = new Map<string, AgentLeaderboardEntry>();

  for (const attempt of snapshot.resolutionAttempts.filter((item) => item.status === "accepted" && item.submitterType === "agent")) {
    const issue = snapshot.submissions.find((submission) => submission.id === attempt.issueId);
    const caseRecord = snapshot.validatedCases.find((candidate) => candidate.submissionId === attempt.issueId);

    if (!issue || !caseRecord) {
      continue;
    }

    const agentName = attempt.agentName ?? attempt.resolverLabel;
    const agentFramework = attempt.agentFramework ?? attempt.resolverLabel;
    const key = `${agentName}::${agentFramework}`;
    const existing = byKey.get(key);
    const leadingDomains = new Set<ValidatedCase["domain"]>(existing?.leadingDomains ?? []);
    const modelsUsed = new Set<string>(existing?.modelsUsed ?? []);
    leadingDomains.add(caseRecord.domain);
    modelsUsed.add(attempt.modelName);

    byKey.set(key, {
      agentName,
      agentFramework,
      operatorName: attempt.operatorName ?? existing?.operatorName ?? null,
      casesResolved: (existing?.casesResolved ?? 0) + 1,
      approvedCases: (existing?.approvedCases ?? 0) + (caseRecord.reviewStatus === "approved" ? 1 : 0),
      averageSeverity:
        (((existing?.averageSeverity ?? 0) * (existing?.casesResolved ?? 0)) + caseRecord.severity) /
        ((existing?.casesResolved ?? 0) + 1),
      averageNovelty:
        (((existing?.averageNovelty ?? 0) * (existing?.casesResolved ?? 0)) + caseRecord.noveltyScore) /
        ((existing?.casesResolved ?? 0) + 1),
      modelsUsed: Array.from(modelsUsed).slice(0, 4),
      latestModelName: attempt.modelName,
      lastResolvedAt:
        !existing?.lastResolvedAt || new Date(attempt.createdAt) > new Date(existing.lastResolvedAt)
          ? attempt.createdAt
          : existing.lastResolvedAt,
      leadingDomains: Array.from(leadingDomains).slice(0, 3)
    });
  }

  return Array.from(byKey.values()).sort(sortByCompetitiveRank);
};
