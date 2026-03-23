import { prisma } from "@/lib/db";
import { isDemoMode } from "@/lib/env";
import { addPricingRecommendation, getSnapshot } from "@/lib/mock-store";
import { hasRequiredRights } from "@/lib/permissions";
import { recordAuditEvent } from "@/lib/services/audit";
import { buildPricingRecommendation } from "@/lib/services/pricing";
import type { DomainBrief, Submission, ValidatedCase } from "@/lib/types";

import type { PriceCasePayload } from "@/worker/contracts";

const canMatchBrief = (input: {
  domain: string;
  subcategory: string;
  reasonCodes: string[];
  reviewStatus: string;
  language: string;
  rights: Submission["rights"];
  brief: {
    domain: string;
    subcategoryFilters: string[];
    languageFilters: string[];
    requiredSignals: string[];
    rightsRequested: string[];
    status: string;
  } | null;
}) => {
  const { brief } = input;
  if (!brief || brief.status !== "active" || input.reviewStatus !== "approved") {
    return false;
  }

  const subcategoryAllowed =
    brief.subcategoryFilters.length === 0 || brief.subcategoryFilters.includes(input.subcategory);
  const languageAllowed = brief.languageFilters.includes(input.language);
  const signalsAllowed = brief.requiredSignals.every((signal) => input.reasonCodes.includes(signal));
  const rightsAllowed = hasRequiredRights(
    input.rights,
    brief.rightsRequested as Array<keyof Submission["rights"]>,
  );

  return brief.domain === input.domain && subcategoryAllowed && languageAllowed && signalsAllowed && rightsAllowed;
};

export const handlePriceCase = async ({ caseId }: PriceCasePayload) => {
  if (isDemoMode) {
    const snapshot = getSnapshot();
    const caseRecord = snapshot.validatedCases.find((item) => item.id === caseId);

    if (!caseRecord) {
      throw new Error("Case not found");
    }

    const submission = snapshot.submissions.find((item) => item.id === caseRecord.submissionId);

    if (!submission) {
      throw new Error("Submission not found");
    }

    const brief = snapshot.briefs.find((item) => item.domain === caseRecord.domain && item.status === "active");
    const recommendation = buildPricingRecommendation(caseRecord, submission, brief);
    addPricingRecommendation(recommendation);

    if (
      canMatchBrief({
        domain: caseRecord.domain,
        subcategory: caseRecord.subcategory,
        reasonCodes: caseRecord.reasonCodes,
        reviewStatus: caseRecord.reviewStatus,
        language: submission.language,
        rights: submission.rights,
        brief: brief
          ? {
              domain: brief.domain,
              subcategoryFilters: brief.subcategoryFilters,
              languageFilters: brief.languageFilters,
              requiredSignals: brief.requiredSignals,
              rightsRequested: brief.rightsRequested,
              status: brief.status
            }
          : null
      })
    ) {
      const exists = snapshot.briefMatches.some((match) => match.briefId === brief!.id && match.caseId === caseRecord.id);

      if (!exists) {
        snapshot.briefMatches.unshift({
          id: crypto.randomUUID(),
          briefId: brief!.id,
          caseId: caseRecord.id,
          status: "suggested",
          selectedPayoutUsd: Math.min(
            brief!.payoutMaxUsd,
            Math.max(brief!.payoutMinUsd, recommendation.suggestedMaxUsd),
          ),
          reviewerNotes: `Suggested from ${brief!.domain} brief and pricing confidence ${recommendation.confidence.toFixed(2)}.`,
          createdAt: new Date().toISOString()
        });
      }
    }

    await recordAuditEvent({
      actorId: submission.contributorId,
      entityType: "pricing_recommendation",
      entityId: recommendation.id,
      action: "pricing.recommended",
      metadata: {
        caseId,
        confidence: recommendation.confidence
      }
    });

    return recommendation;
  }

  const caseRecord = await prisma.validatedCase.findUnique({
    where: {
      id: caseId
    }
  });

  if (!caseRecord) {
    throw new Error("Case not found");
  }

  const submission = await prisma.submission.findUnique({
    where: {
      id: caseRecord.submissionId
    }
  });

  if (!submission) {
    throw new Error("Submission not found");
  }

  const brief = await prisma.domainBrief.findFirst({
    where: {
      domain: caseRecord.domain,
      status: "active"
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  const recommendation = buildPricingRecommendation(
    {
      ...caseRecord,
      artifactType: caseRecord.artifactType as ValidatedCase["artifactType"],
      domain: caseRecord.domain as ValidatedCase["domain"],
      reproStatus: caseRecord.reproStatus as ValidatedCase["reproStatus"],
      reviewStatus: caseRecord.reviewStatus as ValidatedCase["reviewStatus"],
      severity: caseRecord.severity as ValidatedCase["severity"],
      evalEligibility: caseRecord.evalEligibility as ValidatedCase["evalEligibility"],
      competitionEligibility: caseRecord.competitionEligibility as ValidatedCase["competitionEligibility"],
      trainingEligibility: caseRecord.trainingEligibility as ValidatedCase["trainingEligibility"],
      createdAt: caseRecord.createdAt.toISOString()
    },
    {
      ...submission,
      artifactType: submission.artifactType as Submission["artifactType"],
      language: submission.language as Submission["language"],
      artifactIds: [],
      rights: {
        evaluation: submission.rightsEvaluation,
        competition: submission.rightsCompetition,
        training: submission.rightsTraining
      },
      status: submission.status as Submission["status"],
      createdAt: submission.createdAt.toISOString()
    } as Submission,
    brief
      ? {
          ...brief,
          domain: brief.domain as DomainBrief["domain"],
          languageFilters: brief.languageFilters as Array<Submission["language"]>,
          rightsRequested: brief.rightsRequested as Array<keyof Submission["rights"]>,
          status: brief.status as DomainBrief["status"],
          createdAt: brief.createdAt.toISOString()
        }
      : null,
  );

  await prisma.pricingRecommendation.create({
    data: {
      id: recommendation.id,
      caseId: recommendation.caseId,
      briefId: recommendation.briefId,
      suggestedMinUsd: recommendation.suggestedMinUsd,
      suggestedMaxUsd: recommendation.suggestedMaxUsd,
      confidence: recommendation.confidence,
      reasonCodes: recommendation.reasonCodes,
      llmSummary: recommendation.llmSummary
    }
  });

  if (
    canMatchBrief({
      domain: caseRecord.domain,
      subcategory: caseRecord.subcategory,
      reasonCodes: caseRecord.reasonCodes,
      reviewStatus: caseRecord.reviewStatus,
      language: submission.language,
      rights: {
        evaluation: submission.rightsEvaluation,
        competition: submission.rightsCompetition,
        training: submission.rightsTraining
      },
      brief: brief
        ? {
            domain: brief.domain,
            subcategoryFilters: brief.subcategoryFilters,
            languageFilters: brief.languageFilters,
            requiredSignals: brief.requiredSignals,
            rightsRequested: brief.rightsRequested,
            status: brief.status
          }
        : null
    })
  ) {
    const existingMatch = await prisma.briefMatch.findFirst({
      where: {
        briefId: brief!.id,
        caseId
      }
    });

    if (!existingMatch) {
      await prisma.briefMatch.create({
        data: {
          id: crypto.randomUUID(),
          briefId: brief!.id,
          caseId,
          status: "suggested",
          selectedPayoutUsd: Math.min(
            brief!.payoutMaxUsd,
            Math.max(brief!.payoutMinUsd, recommendation.suggestedMaxUsd),
          ),
          reviewerNotes: `Suggested from ${brief!.domain} brief and pricing confidence ${recommendation.confidence.toFixed(2)}.`
        }
      });
    }
  }

  await recordAuditEvent({
    actorId: submission.contributorId,
    entityType: "pricing_recommendation",
    entityId: recommendation.id,
    action: "pricing.recommended",
    metadata: {
      caseId,
      confidence: recommendation.confidence
    }
  });

  return recommendation;
};
