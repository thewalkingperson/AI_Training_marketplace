import { addExport, addPack, getSnapshot } from "@/lib/mock-store";
import { recordAuditEvent } from "@/lib/services/audit";
import { hasRequiredRights } from "@/lib/permissions";
import type { CasePack, PackExport, PackType, RightsGrant } from "@/lib/types";

const requiredRightsForPack = (packType: PackType): Array<keyof RightsGrant> =>
  packType === "training_pack" ? ["evaluation", "training"] : ["evaluation"];

export const createPack = (buyerId: string, packType: PackType, caseIds: string[]) => {
  const snapshot = getSnapshot();
  const allowedCaseIds = caseIds.filter((caseId) => {
    const caseRecord = snapshot.validatedCases.find((item) => item.id === caseId);
    const submission = snapshot.submissions.find((item) => item.id === caseRecord?.submissionId);

    if (!caseRecord || !submission) {
      return false;
    }

    return hasRequiredRights(submission.rights, requiredRightsForPack(packType));
  });

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

  addPack(pack);

  const packExport: PackExport = {
    id: crypto.randomUUID(),
    packId: pack.id,
    status: "ready",
    downloadUrl: `https://example.com/exports/${pack.id}.zip`,
    createdAt: new Date().toISOString()
  };

  addExport(packExport);

  recordAuditEvent({
    actorId: buyerId,
    entityType: "pack_export",
    entityId: packExport.id,
    action: "pack.export.created",
    metadata: {
      packType,
      caseCount: allowedCaseIds.length
    }
  });

  return {
    pack,
    packExport
  };
};
