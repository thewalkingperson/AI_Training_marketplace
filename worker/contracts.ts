export const jobNames = {
  validateSubmission: "validate-submission",
  priceCase: "price-case",
  scoreCompetitionEntry: "score-competition-entry",
  exportPack: "export-pack",
  updatePayoutStatus: "update-payout-status"
} as const;

export interface ValidateSubmissionPayload {
  submissionId: string;
}

export interface PriceCasePayload {
  caseId: string;
}

export interface ScoreCompetitionEntryPayload {
  competitionId: string;
  entryId: string;
}

export interface ExportPackPayload {
  packId: string;
}

export interface UpdatePayoutPayload {
  matchId: string;
}
