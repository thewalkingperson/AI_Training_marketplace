import { prisma } from "@/lib/db";
import { isDemoMode } from "@/lib/env";
import { getSnapshot } from "@/lib/mock-store";

interface ValidationResult {
  submissionId: string;
  caseId: string;
  reproPassed: boolean;
  normalizedArtifacts: Array<{
    type: string;
    label: string;
  }>;
  reasonCodes: string[];
}

export const validateSubmissionInRunner = async (submissionId: string): Promise<ValidationResult> => {
  if (isDemoMode) {
    const snapshot = getSnapshot();
    const submission = snapshot.submissions.find((item) => item.id === submissionId);
    const caseRecord = snapshot.validatedCases.find((item) => item.submissionId === submissionId);

    if (!submission || !caseRecord) {
      throw new Error(`Submission ${submissionId} was not found for validation.`);
    }

    return {
      submissionId,
      caseId: caseRecord.id,
      reproPassed: submission.failingRef !== submission.fixRef,
      normalizedArtifacts: submission.artifactIds.map((artifactId) => {
        const artifact = snapshot.submissionArtifacts.find((item) => item.id === artifactId);
        return {
          type: artifact?.artifactType ?? "trace",
          label: artifact?.label ?? "Unknown artifact"
        };
      }),
      reasonCodes: caseRecord.reasonCodes
    };
  }

  const submission = await prisma.submission.findUnique({
    where: {
      id: submissionId
    },
    include: {
      artifacts: true,
      validatedCase: true
    }
  });

  if (!submission?.validatedCase) {
    throw new Error(`Submission ${submissionId} was not found for validation.`);
  }

  return {
    submissionId,
    caseId: submission.validatedCase.id,
    reproPassed: submission.failingRef !== submission.fixRef,
    normalizedArtifacts: submission.artifacts.map((artifact) => ({
      type: artifact.artifactType,
      label: artifact.label
    })),
    reasonCodes: submission.validatedCase.reasonCodes
  };
};
