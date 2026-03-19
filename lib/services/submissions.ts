import { addSubmission, addValidatedCase, getSnapshot } from "@/lib/mock-store";
import { recordAuditEvent } from "@/lib/services/audit";
import { slugify } from "@/lib/utils";
import type { Submission, SubmissionArtifact, ValidatedCase } from "@/lib/types";

interface CreateSubmissionInput {
  contributorId: string;
  artifactType: Submission["artifactType"];
  sourceUrl: string;
  taskUrl: string;
  language: Submission["language"];
  toolName: string;
  modelName: string;
  promptSummary: string;
  failingRef: string;
  fixRef: string;
  reproSteps: string[];
  artifacts: Array<Pick<SubmissionArtifact, "label" | "artifactType" | "url">>;
  rights: Submission["rights"];
  attestations: string[];
}

export const listApprovedCases = () =>
  getSnapshot().validatedCases.filter((caseRecord) => caseRecord.reviewStatus !== "rejected");

export const createSubmission = (input: CreateSubmissionInput) => {
  const submissionId = `sub_${slugify(`${input.toolName}-${Date.now()}`)}`;
  const snapshot = getSnapshot();

  const submission: Submission = {
    id: submissionId,
    contributorId: input.contributorId,
    artifactType: input.artifactType,
    sourceUrl: input.sourceUrl,
    taskUrl: input.taskUrl,
    language: input.language,
    toolName: input.toolName,
    modelName: input.modelName,
    promptSummary: input.promptSummary,
    failingRef: input.failingRef,
    fixRef: input.fixRef,
    reproSteps: input.reproSteps,
    artifactIds: [],
    rights: input.rights,
    attestations: input.attestations,
    status: "submitted",
    createdAt: new Date().toISOString()
  };

  const artifacts = input.artifacts.map((artifact) => ({
    id: crypto.randomUUID(),
    submissionId,
    ...artifact
  }));

  submission.artifactIds = artifacts.map((artifact) => artifact.id);

  addSubmission(submission);
  snapshot.submissionArtifacts.unshift(...artifacts);

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
    safetyFlags: ["pending_validation"],
    reasonCodes:
      input.language === "python"
        ? ["numerical_error", "scenario_mismatch"]
        : ["ci_failure", "deployment_guardrail"],
    evalEligibility: "pending",
    competitionEligibility: "pending",
    trainingEligibility: input.rights.training ? "pending" : "ineligible",
    createdAt: new Date().toISOString()
  };

  addValidatedCase(validatedCase);

  recordAuditEvent({
    actorId: input.contributorId,
    entityType: "submission",
    entityId: submission.id,
    action: "submission.created",
    metadata: {
      artifactType: input.artifactType,
      language: input.language
    }
  });

  return {
    submission,
    validatedCase,
    artifacts
  };
};
