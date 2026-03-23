import { prisma } from "@/lib/db";
import { env, isDemoMode } from "@/lib/env";
import { getSnapshot } from "@/lib/mock-store";
import { recordAuditEvent } from "@/lib/services/audit";

import type { ExportPackPayload } from "@/worker/contracts";

export const handleExportPack = async ({ packId }: ExportPackPayload) => {
  const downloadUrl = env.r2PublicBaseUrl
    ? `${env.r2PublicBaseUrl.replace(/\/$/, "")}/packs/${packId}.json`
    : `/api/packs/${packId}/download`;

  if (isDemoMode) {
    const snapshot = getSnapshot();
    const pack = snapshot.packs.find((item) => item.id === packId);
    const packExport = snapshot.exports.find((item) => item.packId === packId);

    if (!pack || !packExport) {
      throw new Error("Pack export target not found");
    }

    packExport.status = "ready";
    packExport.downloadUrl = downloadUrl;

    await recordAuditEvent({
      actorId: pack.buyerId,
      entityType: "pack_export",
      entityId: packExport.id,
      action: "pack.export.ready",
      metadata: {
        caseCount: pack.caseIds.length,
        downloadUrl
      }
    });

    return packExport;
  }

  const pack = await prisma.casePack.findUnique({
    where: {
      id: packId
    }
  });
  const packExport = await prisma.packExport.findFirst({
    where: {
      packId
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  if (!pack || !packExport) {
    throw new Error("Pack export target not found");
  }

  const updated = await prisma.packExport.update({
    where: {
      id: packExport.id
    },
    data: {
      status: "ready",
      downloadUrl
    }
  });

  await recordAuditEvent({
    actorId: pack.buyerId,
    entityType: "pack_export",
    entityId: updated.id,
    action: "pack.export.ready",
    metadata: {
      caseCount: pack.caseIds.length,
      downloadUrl
    }
  });

  return {
    id: updated.id,
    packId: updated.packId,
    status: updated.status,
    downloadUrl: updated.downloadUrl,
    createdAt: updated.createdAt.toISOString()
  };
};
