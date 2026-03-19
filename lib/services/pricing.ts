import { env } from "@/lib/env";
import { getSnapshot } from "@/lib/mock-store";
import { formatUsd } from "@/lib/utils";
import type { DomainBrief, PricingRecommendation, Submission, ValidatedCase } from "@/lib/types";

const roundToBand = (value: number) => Math.round(value / 25) * 25;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const deriveReasonCodes = (caseRecord: ValidatedCase, brief?: DomainBrief | null) => {
  const codes = new Set<string>();

  if (caseRecord.noveltyScore >= 0.8) {
    codes.add("high_novelty");
  }

  if (caseRecord.reproStatus === "passed") {
    codes.add("clean_repro");
  }

  if (brief && brief.caseLimit > 5) {
    codes.add("active_buyer_demand");
  }

  if (caseRecord.severity >= 4) {
    codes.add("high_severity");
  }

  if (caseRecord.safetyFlags.length === 0) {
    codes.add("low_review_friction");
  }

  return Array.from(codes);
};

const buildSummary = (caseRecord: ValidatedCase, recommendation: { min: number; max: number }, brief?: DomainBrief | null) =>
  [
    `Advisory summary generated for ${caseRecord.domain} using ${env.llmPricingModel}.`,
    `The case carries a novelty score of ${caseRecord.noveltyScore.toFixed(2)} and severity ${caseRecord.severity}/5.`,
    `Suggested band is ${formatUsd(recommendation.min)} to ${formatUsd(recommendation.max)}.`,
    brief
      ? `Buyer brief demand is elevated because ${brief.domain} remains active with ${brief.caseLimit} slots.`
      : "No active brief was provided, so pricing leans on intrinsic case quality."
  ].join(" ");

export const buildPricingRecommendation = (
  caseRecord: ValidatedCase,
  submission: Submission,
  brief?: DomainBrief | null,
): PricingRecommendation => {
  const base =
    200 +
    caseRecord.noveltyScore * 450 +
    caseRecord.severity * 80 +
    (caseRecord.reproStatus === "passed" ? 100 : 0) +
    (brief ? Math.min(brief.caseLimit, 20) * 12 : 60) +
    (submission.rights.training ? 140 : 0) +
    (submission.rights.competition ? 70 : 0) -
    caseRecord.safetyFlags.length * 40;

  const min = roundToBand(base * 0.88);
  const max = roundToBand(base * 1.08);
  const confidence = clamp(
    0.42 +
      caseRecord.noveltyScore * 0.25 +
      (caseRecord.reproStatus === "passed" ? 0.18 : -0.05) +
      (caseRecord.safetyFlags.length === 0 ? 0.1 : -0.08),
    0.35,
    0.94,
  );

  return {
    id: crypto.randomUUID(),
    caseId: caseRecord.id,
    briefId: brief?.id ?? null,
    suggestedMinUsd: min,
    suggestedMaxUsd: max,
    confidence,
    reasonCodes: deriveReasonCodes(caseRecord, brief),
    llmSummary: buildSummary(caseRecord, { min, max }, brief),
    createdAt: new Date().toISOString()
  };
};

export const getRecommendationForCase = (caseId: string) => {
  const snapshot = getSnapshot();
  const caseRecord = snapshot.validatedCases.find((item) => item.id === caseId);

  if (!caseRecord) {
    return null;
  }

  const submission = snapshot.submissions.find((item) => item.id === caseRecord.submissionId);

  if (!submission) {
    return null;
  }

  const brief = snapshot.briefs.find((item) => item.domain === caseRecord.domain && item.status === "active") ?? null;
  return buildPricingRecommendation(caseRecord, submission, brief);
};
