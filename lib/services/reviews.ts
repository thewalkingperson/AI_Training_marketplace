import { prisma } from "@/lib/db";
import { isDemoMode } from "@/lib/env";
import { getSnapshot } from "@/lib/mock-store";
import { enqueueJob } from "@/lib/queue";
import { resolveEligibility } from "@/lib/permissions";
import { recordAuditEvent } from "@/lib/services/audit";
import { jobNames } from "@/worker/contracts";
import type { ReviewDecision, RightsGrant } from "@/lib/types";

interface CreateReviewInput {
  caseId: string;
  reviewerId: string;
  decision: "approved" | "rejected";
  notes: string;
  rightsApproved: RightsGrant;
}

export const createReviewDecision = async ({
  caseId,
  reviewerId,
  decision,
  notes,
  rightsApproved
}: CreateReviewInput) => {
  const review: ReviewDecision = {
    id: crypto.randomUUID(),
    caseId,
    reviewerId,
    decision,
    notes,
    rightsApproved,
    createdAt: new Date().toISOString()
  };

  if (isDemoMode) {
    const snapshot = getSnapshot();
    const caseRecord = snapshot.validatedCases.find((item) => item.id === caseId);

    if (!caseRecord) {
      throw new Error("Case not found");
    }

    snapshot.reviews.unshift(review);
    caseRecord.reviewStatus = decision;
    caseRecord.evalEligibility = resolveEligibility(decision === "approved" && rightsApproved.evaluation);
    caseRecord.competitionEligibility = resolveEligibility(
      decision === "approved" && rightsApproved.competition,
    );
    caseRecord.trainingEligibility = resolveEligibility(decision === "approved" && rightsApproved.training);
    caseRecord.reproStatus = decision === "approved" ? "passed" : "failed";
    caseRecord.safetyFlags = decision === "approved" ? [] : ["review_rejected"];

    const submission = snapshot.submissions.find((item) => item.id === caseRecord.submissionId);
    if (submission) {
      submission.status = decision === "approved" ? "approved" : "rejected";
      submission.rights = rightsApproved;
    }
  } else {
    const caseRecord = await prisma.validatedCase.findUnique({
      where: {
        id: caseId
      }
    });

    if (!caseRecord) {
      throw new Error("Case not found");
    }

    await prisma.$transaction(async (tx) => {
      await tx.reviewDecision.create({
        data: {
          id: review.id,
          caseId,
          reviewerId,
          decision,
          notes,
          rightsEvaluation: rightsApproved.evaluation,
          rightsCompetition: rightsApproved.competition,
          rightsTraining: rightsApproved.training
        }
      });

      await tx.validatedCase.update({
        where: {
          id: caseId
        },
        data: {
          reviewStatus: decision,
          evalEligibility: resolveEligibility(decision === "approved" && rightsApproved.evaluation),
          competitionEligibility: resolveEligibility(decision === "approved" && rightsApproved.competition),
          trainingEligibility: resolveEligibility(decision === "approved" && rightsApproved.training),
          reproStatus: decision === "approved" ? "passed" : "failed",
          safetyFlags: decision === "approved" ? [] : ["review_rejected"]
        }
      });

      await tx.submission.update({
        where: {
          id: caseRecord.submissionId
        },
        data: {
          status: decision === "approved" ? "approved" : "rejected",
          rightsEvaluation: rightsApproved.evaluation,
          rightsCompetition: rightsApproved.competition,
          rightsTraining: rightsApproved.training
        }
      });
    });
  }

  await recordAuditEvent({
    actorId: reviewerId,
    entityType: "review",
    entityId: review.id,
    action: `review.${decision}`,
    metadata: {
      caseId
    }
  });

  if (decision === "approved") {
    await enqueueJob(jobNames.priceCase, {
      caseId
    });
  }

  return review;
};
