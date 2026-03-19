import { getSnapshot } from "@/lib/mock-store";
import { recordAuditEvent } from "@/lib/services/audit";

import type { ScoreCompetitionEntryPayload } from "@/worker/contracts";

export const handleScoreCompetitionEntry = async ({
  competitionId,
  entryId
}: ScoreCompetitionEntryPayload) => {
  const snapshot = getSnapshot();
  const competition = snapshot.competitions.find((item) => item.id === competitionId);
  const entry = snapshot.competitionEntries.find((item) => item.id === entryId);

  if (!competition || !entry) {
    throw new Error("Competition or entry not found");
  }

  entry.status = "scored";
  entry.holdoutScore = Number((((entry.devScore ?? 0) * 0.92) + 0.03).toFixed(3));

  recordAuditEvent({
    actorId: entry.participantId,
    entityType: "competition_entry",
    entityId: entry.id,
    action: "competition.entry.holdout_scored",
    metadata: {
      competitionId,
      holdoutScore: entry.holdoutScore
    }
  });

  return entry;
};
