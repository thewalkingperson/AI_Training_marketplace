import { prisma } from "@/lib/db";
import { isDemoMode } from "@/lib/env";
import { addResolutionAttempt, getSnapshot } from "@/lib/mock-store";
import { recordAuditEvent } from "@/lib/services/audit";
import { grantReferralBonus, grantTokenReward } from "@/lib/tokens";
import type { ResolutionAttempt, Submission, ValidatedCase } from "@/lib/types";

interface CreateResolutionAttemptInput {
  issueId: string;
  submitterUserId?: string | null;
  submitterType: ResolutionAttempt["submitterType"];
  agentName?: string | null;
  agentFramework?: string | null;
  operatorName?: string | null;
  referredByCode?: string | null;
  resolverVendor: ResolutionAttempt["resolverVendor"];
  resolverLabel: string;
  modelName: string;
  patchSummary: string;
  fixRef: string;
  artifactUrl?: string | null;
}

interface ReviewResolutionAttemptInput {
  attemptId: string;
  reviewerId: string;
  decision: "accepted" | "rejected";
  notes: string;
}

export const createResolutionAttempt = async (
  input: CreateResolutionAttemptInput,
): Promise<ResolutionAttempt> => {
  const attempt: ResolutionAttempt = {
    id: `attempt_${crypto.randomUUID()}`,
    issueId: input.issueId,
    submitterUserId: input.submitterUserId ?? null,
    submitterType: input.submitterType,
    agentName: input.agentName ?? null,
    agentFramework: input.agentFramework ?? null,
    operatorName: input.operatorName ?? null,
    referredByCode: input.referredByCode ?? null,
    resolverVendor: input.resolverVendor,
    resolverLabel: input.resolverLabel,
    modelName: input.modelName,
    patchSummary: input.patchSummary,
    fixRef: input.fixRef,
    artifactUrl: input.artifactUrl ?? null,
    status: "submitted",
    createdAt: new Date().toISOString()
  };

  let actorId: string | null = null;

  if (isDemoMode) {
    const snapshot = getSnapshot();
    const issue = snapshot.submissions.find((submission) => submission.id === input.issueId);

    if (!issue) {
      throw new Error("Issue not found.");
    }

    actorId = issue.contributorId;
    addResolutionAttempt(attempt);
  } else {
    const issue = await prisma.submission.findUnique({
      where: {
        id: input.issueId
      }
    });

    if (!issue) {
      throw new Error("Issue not found.");
    }

    actorId = issue.contributorId;
    await prisma.resolutionAttempt.create({
      data: {
        id: attempt.id,
        issueId: attempt.issueId,
        submitterUserId: attempt.submitterUserId,
        submitterType: attempt.submitterType,
        agentName: attempt.agentName,
        agentFramework: attempt.agentFramework,
        operatorName: attempt.operatorName,
        referredByCode: attempt.referredByCode,
        resolverVendor: attempt.resolverVendor,
        resolverLabel: attempt.resolverLabel,
        modelName: attempt.modelName,
        patchSummary: attempt.patchSummary,
        fixRef: attempt.fixRef,
        artifactUrl: attempt.artifactUrl,
        status: attempt.status
      }
    });
  }

  await recordAuditEvent({
    actorId: actorId ?? "usr_admin_1",
    entityType: "submission",
    entityId: input.issueId,
    action: "attempt.created",
    metadata: {
      attemptId: attempt.id,
      resolverVendor: attempt.resolverVendor,
      submitterType: attempt.submitterType
    }
  });

  if (attempt.submitterUserId) {
    await grantReferralBonus({
      referredByCode: attempt.referredByCode ?? null,
      recruitedType: attempt.submitterType === "agent" ? "agent" : "person",
      recruitedLabel: attempt.submitterType === "agent" ? attempt.agentName ?? attempt.resolverLabel : attempt.resolverLabel,
      sourceId: attempt.id,
      excludedUserId: attempt.submitterUserId
    });
  }

  return attempt;
};

const applyAcceptedAttempt = (
  issue: Submission,
  caseRecord: ValidatedCase,
  attempt: ResolutionAttempt,
) => {
  issue.acceptedAttemptId = attempt.id;
  issue.fixRef = attempt.fixRef;
  issue.resolverType = attempt.submitterType === "agent" ? "agent" : "human";
  issue.resolverVendor = attempt.resolverVendor;
  issue.resolverLabel = attempt.resolverLabel;
  issue.resolverModel = attempt.modelName;
  issue.status = "approved";

  caseRecord.reviewStatus = "approved";
  caseRecord.reproStatus = "passed";
  caseRecord.evalEligibility = issue.rights.evaluation ? "eligible" : "ineligible";
  caseRecord.competitionEligibility = issue.rights.competition ? "eligible" : "ineligible";
  caseRecord.trainingEligibility = issue.rights.training ? "eligible" : "ineligible";
  caseRecord.safetyFlags = caseRecord.safetyFlags.filter((flag) => flag !== "runner_failed");
};

export const reviewResolutionAttempt = async ({
  attemptId,
  reviewerId,
  decision,
  notes
}: ReviewResolutionAttemptInput) => {
  if (isDemoMode) {
    const snapshot = getSnapshot();
    const attempt = snapshot.resolutionAttempts.find((item) => item.id === attemptId);

    if (!attempt) {
      throw new Error("Attempt not found.");
    }

    attempt.status = decision;

    if (decision === "accepted") {
      const issue = snapshot.submissions.find((item) => item.id === attempt.issueId);
      const caseRecord = snapshot.validatedCases.find((item) => item.submissionId === attempt.issueId);

      if (!issue || !caseRecord) {
        throw new Error("Issue not found.");
      }

      applyAcceptedAttempt(issue, caseRecord, attempt);
    }
  } else {
    const attempt = await prisma.resolutionAttempt.findUnique({
      where: {
        id: attemptId
      }
    });

    if (!attempt) {
      throw new Error("Attempt not found.");
    }

    await prisma.$transaction(async (tx) => {
      await tx.resolutionAttempt.update({
        where: {
          id: attempt.id
        },
        data: {
          status: decision
        }
      });

      if (decision === "accepted") {
        const issue = await tx.submission.findUnique({
          where: {
            id: attempt.issueId
          }
        });
        const caseRecord = await tx.validatedCase.findUnique({
          where: {
            submissionId: attempt.issueId
          }
        });

        if (!issue || !caseRecord) {
          throw new Error("Issue not found.");
        }

        await tx.submission.update({
          where: {
            id: issue.id
          },
          data: {
            acceptedAttemptId: attempt.id,
            fixRef: attempt.fixRef,
            resolverType: attempt.submitterType === "agent" ? "agent" : "human",
            resolverVendor: attempt.resolverVendor,
            resolverLabel: attempt.resolverLabel,
            resolverModel: attempt.modelName,
            status: "approved"
          }
        });

        await tx.validatedCase.update({
          where: {
            id: caseRecord.id
          },
          data: {
            reviewStatus: "approved",
            reproStatus: "passed",
            evalEligibility: issue.rightsEvaluation ? "eligible" : "ineligible",
            competitionEligibility: issue.rightsCompetition ? "eligible" : "ineligible",
            trainingEligibility: issue.rightsTraining ? "eligible" : "ineligible",
            safetyFlags: caseRecord.safetyFlags.filter((flag) => flag !== "runner_failed")
          }
        });
      }
    });
  }

  await recordAuditEvent({
    actorId: reviewerId,
    entityType: "review",
    entityId: attemptId,
    action: `attempt.${decision}`,
    metadata: {
      notes
    }
  });

  if (decision === "accepted" && (isDemoMode ? getSnapshot().resolutionAttempts.find((item) => item.id === attemptId)?.submitterUserId : true)) {
    const acceptedAttempt = isDemoMode
      ? getSnapshot().resolutionAttempts.find((item) => item.id === attemptId) ?? null
      : await prisma.resolutionAttempt.findUnique({ where: { id: attemptId } });

    if (acceptedAttempt?.submitterUserId) {
      await grantTokenReward({
        userId: acceptedAttempt.submitterUserId,
        reason: "accepted_attempt",
        description: `Accepted repair credited to ${acceptedAttempt.modelName}.`,
        metadata: {
          attemptId: acceptedAttempt.id,
          issueId: acceptedAttempt.issueId,
          modelName: acceptedAttempt.modelName,
          resolverVendor: acceptedAttempt.resolverVendor
        }
      });
    }
  }
};
