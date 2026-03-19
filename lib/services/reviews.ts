import { getSnapshot } from "@/lib/mock-store";
import { resolveEligibility } from "@/lib/permissions";
import { recordAuditEvent } from "@/lib/services/audit";
import type { ReviewDecision, RightsGrant } from "@/lib/types";

interface CreateReviewInput {
  caseId: string;
  reviewerId: string;
  decision: "approved" | "rejected";
  notes: string;
  rightsApproved: RightsGrant;
}

export const createReviewDecision = ({
  caseId,
  reviewerId,
  decision,
  notes,
  rightsApproved
}: CreateReviewInput) => {
  const snapshot = getSnapshot();
  const caseRecord = snapshot.validatedCases.find((item) => item.id === caseId);

  if (!caseRecord) {
    throw new Error("Case not found");
  }

  const review: ReviewDecision = {
    id: crypto.randomUUID(),
    caseId,
    reviewerId,
    decision,
    notes,
    rightsApproved,
    createdAt: new Date().toISOString()
  };

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

  recordAuditEvent({
    actorId: reviewerId,
    entityType: "review",
    entityId: review.id,
    action: `review.${decision}`,
    metadata: {
      caseId
    }
  });

  return review;
};
