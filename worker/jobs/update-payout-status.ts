import { getSnapshot } from "@/lib/mock-store";
import { recordAuditEvent } from "@/lib/services/audit";

import type { UpdatePayoutPayload } from "@/worker/contracts";

export const handleUpdatePayoutStatus = async ({ matchId }: UpdatePayoutPayload) => {
  const snapshot = getSnapshot();
  const match = snapshot.briefMatches.find((item) => item.id === matchId);

  if (!match) {
    throw new Error("Brief match not found");
  }

  match.status = "paid";

  recordAuditEvent({
    actorId: "usr_reviewer_1",
    entityType: "brief_match",
    entityId: match.id,
    action: "payout.marked_paid",
    metadata: {
      selectedPayoutUsd: match.selectedPayoutUsd
    }
  });

  return match;
};
