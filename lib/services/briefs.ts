import { prisma } from "@/lib/db";
import { isDemoMode } from "@/lib/env";
import { addBrief, addBriefMatch, getSnapshot } from "@/lib/mock-store";
import { hasRequiredRights } from "@/lib/permissions";
import { recordAuditEvent } from "@/lib/services/audit";
import { buildPricingRecommendation } from "@/lib/services/pricing";
import { slugify } from "@/lib/utils";
import type { BriefMatch, DomainBrief, PricingRecommendation, Submission, ValidatedCase } from "@/lib/types";

interface CreateBriefInput extends Omit<DomainBrief, "id" | "createdAt"> {}

const normalizeBrief = (brief: {
  id: string;
  buyerId: string;
  domain: string;
  subcategoryFilters: string[];
  languageFilters: string[];
  requiredSignals: string[];
  rightsRequested: string[];
  payoutMinUsd: number;
  payoutMaxUsd: number;
  caseLimit: number;
  acceptanceCriteria: string;
  status: string;
  createdAt: Date;
}): DomainBrief => ({
  ...brief,
  domain: brief.domain as DomainBrief["domain"],
  languageFilters: brief.languageFilters as Array<Submission["language"]>,
  rightsRequested: brief.rightsRequested as Array<keyof Submission["rights"]>,
  status: brief.status as DomainBrief["status"],
  createdAt: brief.createdAt.toISOString()
});

const briefMatchesCase = (brief: DomainBrief, caseRecord: ValidatedCase, submission: Submission) => {
  const subcategoryAllowed =
    brief.subcategoryFilters.length === 0 || brief.subcategoryFilters.includes(caseRecord.subcategory);
  const languageAllowed = brief.languageFilters.includes(submission.language);
  const rightsAllowed = hasRequiredRights(submission.rights, brief.rightsRequested);
  const signalsAllowed = brief.requiredSignals.every((signal) => caseRecord.reasonCodes.includes(signal));

  return (
    brief.status === "active" &&
    caseRecord.reviewStatus === "approved" &&
    brief.domain === caseRecord.domain &&
    subcategoryAllowed &&
    languageAllowed &&
    rightsAllowed &&
    signalsAllowed
  );
};

const createSuggestedMatch = (
  brief: DomainBrief,
  caseRecord: ValidatedCase,
  recommendation: PricingRecommendation,
): BriefMatch => ({
  id: crypto.randomUUID(),
  briefId: brief.id,
  caseId: caseRecord.id,
  status: "suggested",
  selectedPayoutUsd: Math.min(
    brief.payoutMaxUsd,
    Math.max(brief.payoutMinUsd, recommendation.suggestedMaxUsd),
  ),
  reviewerNotes: `Suggested from ${brief.domain} brief and pricing confidence ${recommendation.confidence.toFixed(2)}.`,
  createdAt: new Date().toISOString()
});

const backfillBriefMatches = async (brief: DomainBrief) => {
  const casesAndSubmissions = isDemoMode
    ? getSnapshot().validatedCases
        .map((caseRecord) => ({
          caseRecord,
          submission: getSnapshot().submissions.find((submission) => submission.id === caseRecord.submissionId) ?? null
        }))
        .filter(
          (item): item is { caseRecord: ValidatedCase; submission: Submission } => Boolean(item.submission),
        )
    : (
        await prisma.validatedCase.findMany({
          where: {
            reviewStatus: "approved",
            domain: brief.domain
          },
          include: {
            submission: true
          }
        })
      ).map((caseRecord) => ({
        caseRecord: {
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
        submission: {
          ...caseRecord.submission,
          artifactIds: [],
          rights: {
            evaluation: caseRecord.submission.rightsEvaluation,
            competition: caseRecord.submission.rightsCompetition,
            training: caseRecord.submission.rightsTraining
          },
          createdAt: caseRecord.submission.createdAt.toISOString()
        } as Submission
      }));

  for (const { caseRecord, submission } of casesAndSubmissions) {
    if (!briefMatchesCase(brief, caseRecord, submission)) {
      continue;
    }

    if (isDemoMode) {
      const snapshot = getSnapshot();
      const exists = snapshot.briefMatches.some((match) => match.briefId === brief.id && match.caseId === caseRecord.id);

      if (exists) {
        continue;
      }

      const recommendation = buildPricingRecommendation(caseRecord, submission, brief);
      const match = createSuggestedMatch(brief, caseRecord, recommendation);
      addBriefMatch(match);
      snapshot.pricingRecommendations.unshift(recommendation);
      continue;
    }

    const exists = await prisma.briefMatch.findFirst({
      where: {
        briefId: brief.id,
        caseId: caseRecord.id
      }
    });

    if (exists) {
      continue;
    }

    const recommendation = buildPricingRecommendation(caseRecord, submission, brief);
    const match = createSuggestedMatch(brief, caseRecord, recommendation);

    await prisma.$transaction(async (tx) => {
      await tx.briefMatch.create({
        data: {
          id: match.id,
          briefId: match.briefId,
          caseId: match.caseId,
          status: match.status,
          selectedPayoutUsd: match.selectedPayoutUsd,
          reviewerNotes: match.reviewerNotes
        }
      });

      await tx.pricingRecommendation.create({
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
    });
  }
};

export const createDomainBrief = async (input: CreateBriefInput) => {
  const brief: DomainBrief = {
    ...input,
    id: `brief_${slugify(`${input.domain}-${Date.now()}`)}`,
    createdAt: new Date().toISOString()
  };

  if (isDemoMode) {
    addBrief(brief);
  } else {
    await prisma.domainBrief.create({
      data: {
        id: brief.id,
        buyerId: brief.buyerId,
        domain: brief.domain,
        subcategoryFilters: brief.subcategoryFilters,
        languageFilters: brief.languageFilters,
        requiredSignals: brief.requiredSignals,
        rightsRequested: brief.rightsRequested,
        payoutMinUsd: brief.payoutMinUsd,
        payoutMaxUsd: brief.payoutMaxUsd,
        caseLimit: brief.caseLimit,
        acceptanceCriteria: brief.acceptanceCriteria,
        status: brief.status
      }
    });
  }

  await recordAuditEvent({
    actorId: input.buyerId,
    entityType: "domain_brief",
    entityId: brief.id,
    action: "domain_brief.created",
    metadata: {
      domain: brief.domain,
      caseLimit: brief.caseLimit
    }
  });

  if (brief.status === "active") {
    await backfillBriefMatches(brief);
  }

  return brief;
};

export const findMatchingBriefs = async (caseRecord: ValidatedCase, submission: Submission) => {
  const briefs = isDemoMode
    ? getSnapshot().briefs
    : (
        await prisma.domainBrief.findMany({
          where: {
            status: "active",
            domain: caseRecord.domain
          }
        })
      ).map((brief) =>
        normalizeBrief({
          ...brief,
          languageFilters: brief.languageFilters as Array<Submission["language"]>,
          rightsRequested: brief.rightsRequested as Array<keyof Submission["rights"]>
        }),
      );

  return briefs.filter((brief) => briefMatchesCase(brief, caseRecord, submission));
};

export const suggestBriefMatches = async (caseRecord: ValidatedCase, submission: Submission) => {
  const matches = await findMatchingBriefs(caseRecord, submission);
  const results = [];

  for (const brief of matches) {
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

    if (isDemoMode) {
      addBriefMatch(match);
    } else {
      await prisma.$transaction(async (tx) => {
        await tx.briefMatch.create({
          data: {
            id: match.id,
            briefId: match.briefId,
            caseId: match.caseId,
            status: match.status,
            selectedPayoutUsd: match.selectedPayoutUsd,
            reviewerNotes: match.reviewerNotes
          }
        });

        await tx.pricingRecommendation.create({
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
      });
    }

    results.push({
      brief,
      match,
      recommendation
    });
  }

  return results;
};

export const summarizeBriefOpportunity = (
  brief: DomainBrief,
  recommendation: PricingRecommendation,
) => `${brief.domain} wants ${brief.caseLimit} cases. Suggested band ${recommendation.suggestedMinUsd}-${recommendation.suggestedMaxUsd} USD.`;
