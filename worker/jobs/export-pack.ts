import { getSnapshot } from "@/lib/mock-store";
import { recordAuditEvent } from "@/lib/services/audit";

import type { ExportPackPayload } from "@/worker/contracts";

export const handleExportPack = async ({ packId }: ExportPackPayload) => {
  const snapshot = getSnapshot();
  const pack = snapshot.packs.find((item) => item.id === packId);
  const packExport = snapshot.exports.find((item) => item.packId === packId);

  if (!pack || !packExport) {
    throw new Error("Pack export target not found");
  }

  packExport.status = "ready";

  recordAuditEvent({
    actorId: pack.buyerId,
    entityType: "pack_export",
    entityId: packExport.id,
    action: "pack.export.ready",
    metadata: {
      caseCount: pack.caseIds.length
    }
  });

  return packExport;
};
