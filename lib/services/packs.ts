import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { isDemoMode } from "@/lib/env";
import { addExport, addPack, getSnapshot } from "@/lib/mock-store";
import { enqueueJob } from "@/lib/queue";
import { hasRequiredRights } from "@/lib/permissions";
import { recordAuditEvent } from "@/lib/services/audit";
import { jobNames } from "@/worker/contracts";
import type { CasePack, PackExport, PackType, RightsGrant } from "@/lib/types";

const requiredRightsForPack = (packType: PackType): Array<keyof RightsGrant> =>
  packType === "training_pack" ? ["evaluation", "training"] : ["evaluation"];

export const createPack = async (buyerId: string, packType: PackType, caseIds: string[]) => {
  const snapshot = isDemoMode ? getSnapshot() : null;
  const requiredRights = requiredRightsForPack(packType);
  const allowedCaseIds: string[] = [];

  for (const caseId of caseIds) {
    if (isDemoMode) {
      const caseRecord = snapshot!.validatedCases.find((item) => item.id === caseId);
      const submission = snapshot!.submissions.find((item) => item.id === caseRecord?.submissionId);

      if (caseRecord && submission && hasRequiredRights(submission.rights, requiredRights)) {
        allowedCaseIds.push(caseId);
      }

      continue;
    }

    const caseRecord = await prisma.validatedCase.findUnique({
      where: {
        id: caseId
      }
    });

    if (!caseRecord) {
      continue;
    }

    const submission = await prisma.submission.findUnique({
      where: {
        id: caseRecord.submissionId
      }
    });

    if (!submission) {
      continue;
    }

    if (
      hasRequiredRights(
        {
          evaluation: submission.rightsEvaluation,
          competition: submission.rightsCompetition,
          training: submission.rightsTraining
        },
        requiredRights,
      )
    ) {
      allowedCaseIds.push(caseId);
    }
  }

  const pack: CasePack = {
    id: crypto.randomUUID(),
    buyerId,
    packType,
    caseIds: allowedCaseIds,
    exportManifest: {
      version: "v1",
      caseIds: allowedCaseIds,
      createdAt: new Date().toISOString()
    },
    createdAt: new Date().toISOString()
  };

  const packExport: PackExport = {
    id: crypto.randomUUID(),
    packId: pack.id,
    status: "queued",
    downloadUrl: null,
    createdAt: new Date().toISOString()
  };

  if (isDemoMode) {
    addPack(pack);
    addExport(packExport);
  } else {
    await prisma.$transaction(async (tx) => {
      await tx.casePack.create({
        data: {
          id: pack.id,
          buyerId: pack.buyerId,
          packType: pack.packType,
          caseIds: pack.caseIds,
          exportManifest: pack.exportManifest as Prisma.InputJsonValue
        }
      });

      await tx.packExport.create({
        data: {
          id: packExport.id,
          packId: packExport.packId,
          status: packExport.status,
          downloadUrl: packExport.downloadUrl
        }
      });
    });
  }

  await recordAuditEvent({
    actorId: buyerId,
    entityType: "pack_export",
    entityId: packExport.id,
    action: "pack.export.created",
    metadata: {
      packType,
      caseCount: allowedCaseIds.length
    }
  });

  await enqueueJob(jobNames.exportPack, {
    packId: pack.id
  });

  return {
    pack,
    packExport
  };
};
