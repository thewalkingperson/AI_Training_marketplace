import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { isDemoMode } from "@/lib/env";
import { addResolutionAttempt, addSubmission, addValidatedCase, getSnapshot } from "@/lib/mock-store";
import { enqueueJob } from "@/lib/queue";
import { scanSubmissionContent } from "@/lib/scan";
import { recordAuditEvent } from "@/lib/services/audit";
import { grantReferralBonus, grantTokenReward } from "@/lib/tokens";
import { slugify } from "@/lib/utils";
import { jobNames } from "@/worker/contracts";
import type { ResolutionAttempt, Submission, SubmissionArtifact, ValidatedCase } from "@/lib/types";

interface CreateSubmissionInput {
  contributorId: string;
  artifactType: Submission["artifactType"];
  submitterType: Submission["submitterType"];
  agentName?: string | null;
  agentFramework?: string | null;
  agentOperator?: string | null;
  sourceUrl: string;
  taskUrl: string;
  language: Submission["language"];
  toolName: string;
  modelName: string;
  resolverType: Submission["resolverType"];
  resolverVendor: Submission["resolverVendor"];
  resolverLabel: Submission["resolverLabel"];
  resolverModel?: string | null;
  promptSummary: string;
  failingRef: string;
  fixRef?: string | null;
  referredByCode?: string | null;
  reproSteps: string[];
  artifacts: Array<Pick<SubmissionArtifact, "label" | "artifactType" | "url" | "content">>;
  chatLogConsent?: boolean;
  rights: Submission["rights"];
  attestations: string[];
}

export const listApprovedCases = async () => {
  if (isDemoMode) {
    return getSnapshot().validatedCases.filter((caseRecord) => caseRecord.reviewStatus !== "rejected");
  }

  return prisma.validatedCase.findMany({
    where: {
      reviewStatus: {
        not: "rejected"
      }
    }
  });
};

export const createSubmission = async (input: CreateSubmissionInput) => {
  const submissionId = `sub_${slugify(`${input.toolName}-${Date.now()}`)}`;
  const hasAcceptedResolution = Boolean(input.fixRef);
  const artifactPayloads = input.artifacts.map((artifact) => ({
    id: crypto.randomUUID(),
    submissionId,
    label: artifact.label,
    artifactType: artifact.artifactType,
    url: artifact.url ?? null,
    content: artifact.content ?? null
  }));
  const scanFlags = scanSubmissionContent({
    promptSummary: input.promptSummary,
    reproSteps: input.reproSteps,
    artifacts: artifactPayloads
  });
  const safetyFlags = Array.from(new Set(["pending_validation", ...scanFlags]));

  const submission: Submission = {
    id: submissionId,
    contributorId: input.contributorId,
    artifactType: input.artifactType,
    submitterType: input.submitterType,
    agentName: input.agentName ?? null,
    agentFramework: input.agentFramework ?? null,
    agentOperator: input.agentOperator ?? null,
    sourceUrl: input.sourceUrl,
    taskUrl: input.taskUrl,
    language: input.language,
    toolName: input.toolName,
    modelName: input.modelName,
    resolverType: input.resolverType,
    resolverVendor: input.resolverVendor,
    resolverLabel: input.resolverLabel,
    resolverModel: input.resolverModel ?? null,
    promptSummary: input.promptSummary,
    failingRef: input.failingRef,
    fixRef: input.fixRef ?? null,
    acceptedAttemptId: null,
    referredByCode: input.referredByCode ?? null,
    reproSteps: input.reproSteps,
    artifactIds: artifactPayloads.map((artifact) => artifact.id),
    chatLogConsent: input.chatLogConsent ?? false,
    rights: input.rights,
    attestations: input.attestations,
    status: hasAcceptedResolution ? "validating" : "submitted",
    createdAt: new Date().toISOString()
  };

  const validatedCase: ValidatedCase = {
    id: `case_${slugify(`${input.language}-${Date.now()}`)}`,
    submissionId,
    artifactType: input.artifactType,
    domain: input.language === "python" ? "financial_modeling_code" : "devops",
    subcategory: input.language === "python" ? "factor loading" : "release automation",
    reproStatus: "not_run",
    reviewStatus: "pending",
    severity: 3,
    noveltyScore: 0.55,
    safetyFlags,
    reasonCodes:
      input.language === "python"
        ? ["numerical_error", "scenario_mismatch"]
        : ["ci_failure", "deployment_guardrail"],
    evalEligibility: "pending",
    competitionEligibility: "pending",
    trainingEligibility: input.rights.training ? "pending" : "ineligible",
    createdAt: new Date().toISOString()
  };

  const acceptedAttempt: ResolutionAttempt | null = hasAcceptedResolution
    ? {
        id: `attempt_${crypto.randomUUID()}`,
        issueId: submissionId,
        submitterType: input.resolverType === "agent" ? "agent" : "human",
        agentName: input.resolverType === "agent" ? input.resolverLabel : null,
        agentFramework: input.resolverType === "agent" ? input.resolverLabel : null,
        operatorName: input.resolverType === "agent" ? input.agentOperator ?? null : null,
        resolverVendor: input.resolverVendor,
        resolverLabel: input.resolverLabel,
        modelName: input.resolverModel ?? input.modelName,
        patchSummary: input.promptSummary,
        fixRef: input.fixRef!,
        artifactUrl: artifactPayloads.find((artifact) => artifact.artifactType === "diff")?.url ?? null,
        status: "accepted",
        createdAt: new Date().toISOString()
      }
    : null;

  if (acceptedAttempt) {
    submission.acceptedAttemptId = acceptedAttempt.id;
  }

  if (isDemoMode) {
    const snapshot = getSnapshot();
    addSubmission(submission);
    snapshot.submissionArtifacts.unshift(...artifactPayloads);
    addValidatedCase(validatedCase);
    if (acceptedAttempt) {
      addResolutionAttempt(acceptedAttempt);
    }
  } else {
    await prisma.$transaction(async (tx) => {
      await tx.submission.create({
        data: {
          id: submission.id,
          contributorId: submission.contributorId,
          artifactType: submission.artifactType,
          submitterType: submission.submitterType,
          agentName: submission.agentName,
          agentFramework: submission.agentFramework,
          agentOperator: submission.agentOperator,
          sourceUrl: submission.sourceUrl,
          taskUrl: submission.taskUrl,
          language: submission.language,
          toolName: submission.toolName,
          modelName: submission.modelName,
          resolverType: submission.resolverType,
          resolverVendor: submission.resolverVendor,
          resolverLabel: submission.resolverLabel,
          resolverModel: submission.resolverModel,
          promptSummary: submission.promptSummary,
          failingRef: submission.failingRef,
          fixRef: submission.fixRef,
          acceptedAttemptId: submission.acceptedAttemptId,
          referredByCode: submission.referredByCode,
          reproSteps: submission.reproSteps,
          chatLogConsent: submission.chatLogConsent,
          rightsEvaluation: submission.rights.evaluation,
          rightsCompetition: submission.rights.competition,
          rightsTraining: submission.rights.training,
          attestations: submission.attestations,
          status: submission.status
        }
      });

      if (artifactPayloads.length > 0) {
        await tx.submissionArtifact.createMany({
          data: artifactPayloads.map((artifact) => ({
            ...artifact,
            content: (artifact.content ?? undefined) as Prisma.InputJsonValue | undefined
          }))
        });
      }

      if (acceptedAttempt) {
        await tx.resolutionAttempt.create({
          data: {
            id: acceptedAttempt.id,
            issueId: acceptedAttempt.issueId,
            submitterType: acceptedAttempt.submitterType,
            agentName: acceptedAttempt.agentName,
            agentFramework: acceptedAttempt.agentFramework,
            operatorName: acceptedAttempt.operatorName,
            resolverVendor: acceptedAttempt.resolverVendor,
            resolverLabel: acceptedAttempt.resolverLabel,
            modelName: acceptedAttempt.modelName,
            patchSummary: acceptedAttempt.patchSummary,
            fixRef: acceptedAttempt.fixRef,
            artifactUrl: acceptedAttempt.artifactUrl,
            status: acceptedAttempt.status
          }
        });
      }

      await tx.validatedCase.create({
        data: {
          id: validatedCase.id,
          submissionId: validatedCase.submissionId,
          artifactType: validatedCase.artifactType,
          domain: validatedCase.domain,
          subcategory: validatedCase.subcategory,
          reproStatus: validatedCase.reproStatus,
          reviewStatus: validatedCase.reviewStatus,
          severity: validatedCase.severity,
          noveltyScore: validatedCase.noveltyScore,
          safetyFlags: validatedCase.safetyFlags,
          reasonCodes: validatedCase.reasonCodes,
          evalEligibility: validatedCase.evalEligibility,
          competitionEligibility: validatedCase.competitionEligibility,
          trainingEligibility: validatedCase.trainingEligibility
        }
      });
    });
  }

  await recordAuditEvent({
    actorId: input.contributorId,
    entityType: "submission",
    entityId: submission.id,
    action: "submission.created",
      metadata: {
        artifactType: input.artifactType,
        language: input.language,
        chatLogConsent: input.chatLogConsent ?? false,
        safetyFlags,
        submitterType: input.submitterType,
        hasAcceptedResolution,
        referredByCode: input.referredByCode ?? null
      }
  });

  await grantTokenReward({
    userId: input.contributorId,
    reason: input.submitterType === "agent" ? "agent_issue_posted" : "issue_posted",
    description:
      input.submitterType === "agent"
        ? `Posted an agent-generated issue to the public board: ${input.promptSummary}`
        : `Posted a new issue to the public board: ${input.promptSummary}`,
    metadata: {
      submissionId: submission.id,
      submitterType: input.submitterType
    }
  });

  await grantReferralBonus({
    referredByCode: input.referredByCode ?? null,
    recruitedType: input.submitterType === "agent" ? "agent" : "person",
    recruitedLabel: input.submitterType === "agent" ? input.agentName ?? submission.id : submission.id,
    sourceId: submission.id,
    excludedUserId: input.contributorId
  });

  if (hasAcceptedResolution) {
    await grantTokenReward({
      userId: input.contributorId,
      reason: "accepted_resolution_seeded",
      description: `Seeded the board with an already accepted repair for ${submission.id}.`,
      metadata: {
        submissionId: submission.id,
        acceptedAttemptId: acceptedAttempt?.id ?? null,
        modelName: acceptedAttempt?.modelName ?? input.resolverModel ?? null
      }
    });
  }

  if (hasAcceptedResolution) {
    await enqueueJob(jobNames.validateSubmission, {
      submissionId: submission.id
    });
  }

  return {
    submission,
    validatedCase,
    artifacts: artifactPayloads,
    acceptedAttempt
  };
};
