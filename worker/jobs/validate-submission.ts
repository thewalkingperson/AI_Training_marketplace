import { getSnapshot } from "@/lib/mock-store";
import { recordAuditEvent } from "@/lib/services/audit";
import { validateSubmissionInRunner } from "@/worker/runner";

import type { ValidateSubmissionPayload } from "@/worker/contracts";

export const handleValidateSubmission = async ({ submissionId }: ValidateSubmissionPayload) => {
  const result = await validateSubmissionInRunner(submissionId);
  const snapshot = getSnapshot();
  const submission = snapshot.submissions.find((item) => item.id === submissionId);
  const caseRecord = snapshot.validatedCases.find((item) => item.id === result.caseId);

  if (!submission || !caseRecord) {
    throw new Error("Validation target disappeared");
  }

  submission.status = result.reproPassed ? "needs_review" : "rejected";
  caseRecord.reproStatus = result.reproPassed ? "passed" : "failed";
  caseRecord.reasonCodes = Array.from(new Set([...caseRecord.reasonCodes, ...result.reasonCodes]));
  caseRecord.safetyFlags = result.reproPassed ? [] : ["runner_failed"];

  recordAuditEvent({
    actorId: submission.contributorId,
    entityType: "validated_case",
    entityId: caseRecord.id,
    action: "validation.completed",
    metadata: {
      reproPassed: result.reproPassed,
      artifacts: result.normalizedArtifacts
    }
  });

  return result;
};
