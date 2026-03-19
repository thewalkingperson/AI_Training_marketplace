import { addPricingRecommendation, getSnapshot } from "@/lib/mock-store";
import { recordAuditEvent } from "@/lib/services/audit";
import { buildPricingRecommendation } from "@/lib/services/pricing";

import type { PriceCasePayload } from "@/worker/contracts";

export const handlePriceCase = async ({ caseId }: PriceCasePayload) => {
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

  recordAuditEvent({
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
