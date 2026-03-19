import { addBrief, addBriefMatch, getSnapshot } from "@/lib/mock-store";
import { hasRequiredRights } from "@/lib/permissions";
import { buildPricingRecommendation } from "@/lib/services/pricing";
import { slugify } from "@/lib/utils";
import type { DomainBrief, PricingRecommendation, Submission, ValidatedCase } from "@/lib/types";

interface CreateBriefInput extends Omit<DomainBrief, "id" | "createdAt"> {}

export const createDomainBrief = (input: CreateBriefInput) => {
  const brief: DomainBrief = {
    ...input,
    id: `brief_${slugify(`${input.domain}-${Date.now()}`)}`,
    createdAt: new Date().toISOString()
  };

  addBrief(brief);
  return brief;
};

export const findMatchingBriefs = (caseRecord: ValidatedCase, submission: Submission) =>
  getSnapshot().briefs.filter((brief) => {
    const subcategoryAllowed =
      brief.subcategoryFilters.length === 0 || brief.subcategoryFilters.includes(caseRecord.subcategory);
    const languageAllowed = brief.languageFilters.includes(submission.language);
    const rightsAllowed = hasRequiredRights(submission.rights, brief.rightsRequested);
    const signalsAllowed = brief.requiredSignals.every((signal) => caseRecord.reasonCodes.includes(signal));

    return (
      brief.status === "active" &&
      brief.domain === caseRecord.domain &&
      subcategoryAllowed &&
      languageAllowed &&
      rightsAllowed &&
      signalsAllowed
    );
  });

export const suggestBriefMatches = (caseRecord: ValidatedCase, submission: Submission) => {
  const matches = findMatchingBriefs(caseRecord, submission);

  return matches.map((brief) => {
    const recommendation = buildPricingRecommendation(caseRecord, submission, brief);
    const selectedPayoutUsd = Math.min(
      brief.payoutMaxUsd,
      Math.max(brief.payoutMinUsd, recommendation.suggestedMaxUsd),
    );

    const match = {
      id: crypto.randomUUID(),
      briefId: brief.id,
      caseId: caseRecord.id,
      status: "suggested" as const,
      selectedPayoutUsd,
      reviewerNotes: `Suggested from ${brief.domain} brief and pricing confidence ${recommendation.confidence.toFixed(2)}.`,
      createdAt: new Date().toISOString()
    };

    addBriefMatch(match);
    return {
      brief,
      match,
      recommendation
    };
  });
};

export const summarizeBriefOpportunity = (
  brief: DomainBrief,
  recommendation: PricingRecommendation,
) => `${brief.domain} wants ${brief.caseLimit} cases. Suggested band ${recommendation.suggestedMinUsd}-${recommendation.suggestedMaxUsd} USD.`;
