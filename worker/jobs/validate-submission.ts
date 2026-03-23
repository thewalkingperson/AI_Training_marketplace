import { prisma } from "@/lib/db";
import { isDemoMode } from "@/lib/env";
import { getSnapshot } from "@/lib/mock-store";
import { recordAuditEvent } from "@/lib/services/audit";
import { validateSubmissionInRunner } from "@/worker/runner";

import type { ValidateSubmissionPayload } from "@/worker/contracts";

export const handleValidateSubmission = async ({ submissionId }: ValidateSubmissionPayload) => {
  const result = await validateSubmissionInRunner(submissionId);

  if (isDemoMode) {
    const snapshot = getSnapshot();
    const submission = snapshot.submissions.find((item) => item.id === submissionId);
    const caseRecord = snapshot.validatedCases.find((item) => item.id === result.caseId);

    if (!submission || !caseRecord) {
      throw new Error("Validation target disappeared");
    }

    submission.status = result.reproPassed ? "needs_review" : "rejected";
    caseRecord.reproStatus = result.reproPassed ? "passed" : "failed";
    caseRecord.reasonCodes = Array.from(new Set([...caseRecord.reasonCodes, ...result.reasonCodes]));
    caseRecord.safetyFlags = result.reproPassed
      ? caseRecord.safetyFlags.filter((flag) => flag !== "pending_validation" && flag !== "runner_failed")
      : Array.from(new Set([...caseRecord.safetyFlags.filter((flag) => flag !== "pending_validation"), "runner_failed"]));

    await recordAuditEvent({
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
  }

  const submission = await prisma.submission.findUnique({
    where: {
      id: submissionId
    }
  });
  const caseRecord = await prisma.validatedCase.findUnique({
    where: {
      id: result.caseId
    }
  });

  if (!submission || !caseRecord) {
    throw new Error("Validation target disappeared");
  }

  const mergedReasonCodes = Array.from(new Set([...caseRecord.reasonCodes, ...result.reasonCodes]));
  const nextSafetyFlags = result.reproPassed
    ? caseRecord.safetyFlags.filter((flag) => flag !== "pending_validation" && flag !== "runner_failed")
    : Array.from(new Set([...caseRecord.safetyFlags.filter((flag) => flag !== "pending_validation"), "runner_failed"]));

  await prisma.$transaction(async (tx) => {
    await tx.submission.update({
      where: {
        id: submissionId
      },
      data: {
        status: result.reproPassed ? "needs_review" : "rejected"
      }
    });

    await tx.validatedCase.update({
      where: {
        id: result.caseId
      },
      data: {
        reproStatus: result.reproPassed ? "passed" : "failed",
        reasonCodes: mergedReasonCodes,
        safetyFlags: nextSafetyFlags
      }
    });
  });

  await recordAuditEvent({
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
