import { prisma } from "@/lib/db";
import { isDemoMode } from "@/lib/env";
import { getSnapshot } from "@/lib/mock-store";
import { recordAuditEvent } from "@/lib/services/audit";

import type { UpdatePayoutPayload } from "@/worker/contracts";

export const handleUpdatePayoutStatus = async ({ matchId }: UpdatePayoutPayload) => {
  if (isDemoMode) {
    const snapshot = getSnapshot();
    const match = snapshot.briefMatches.find((item) => item.id === matchId);

    if (!match) {
      throw new Error("Brief match not found");
    }

    match.status = "paid";

    await recordAuditEvent({
      actorId: "usr_reviewer_1",
      entityType: "brief_match",
      entityId: match.id,
      action: "payout.marked_paid",
      metadata: {
        selectedPayoutUsd: match.selectedPayoutUsd
      }
    });

    return match;
  }

  const match = await prisma.briefMatch.findUnique({
    where: {
      id: matchId
    },
    include: {
      brief: true
    }
  });

  if (!match) {
    throw new Error("Brief match not found");
  }

  const updated = await prisma.briefMatch.update({
    where: {
      id: matchId
    },
    data: {
      status: "paid"
    }
  });

  await recordAuditEvent({
    actorId: match.brief.buyerId,
    entityType: "brief_match",
    entityId: updated.id,
    action: "payout.marked_paid",
    metadata: {
      selectedPayoutUsd: updated.selectedPayoutUsd
    }
  });

  return {
    ...updated,
    createdAt: updated.createdAt.toISOString()
  };
};
