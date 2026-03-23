import { mockSnapshot } from "@/lib/mock-data";
import type {
  BriefMatch,
  CasePack,
  CompetitionCampaign,
  CompetitionEntry,
  DashboardSnapshot,
  DomainBrief,
  PackExport,
  PricingRecommendation,
  ResolutionAttempt,
  ReviewDecision,
  Submission,
  ValidatedCase
} from "@/lib/types";

let state: DashboardSnapshot = structuredClone(mockSnapshot);

export const getSnapshot = (): DashboardSnapshot => state;

export const resetMockStore = () => {
  state = structuredClone(mockSnapshot);
};

export const addSubmission = (submission: Submission) => {
  state.submissions.unshift(submission);
  return submission;
};

export const addValidatedCase = (caseRecord: ValidatedCase) => {
  state.validatedCases.unshift(caseRecord);
  return caseRecord;
};

export const addResolutionAttempt = (attempt: ResolutionAttempt) => {
  state.resolutionAttempts.unshift(attempt);
  return attempt;
};

export const addReview = (review: ReviewDecision) => {
  state.reviews.unshift(review);
  return review;
};

export const addBrief = (brief: DomainBrief) => {
  state.briefs.unshift(brief);
  return brief;
};

export const addBriefMatch = (match: BriefMatch) => {
  state.briefMatches.unshift(match);
  return match;
};

export const addPricingRecommendation = (recommendation: PricingRecommendation) => {
  state.pricingRecommendations.unshift(recommendation);
  return recommendation;
};

export const addCompetition = (competition: CompetitionCampaign) => {
  state.competitions.unshift(competition);
  return competition;
};

export const addCompetitionEntry = (entry: CompetitionEntry) => {
  state.competitionEntries.unshift(entry);
  return entry;
};

export const addPack = (pack: CasePack) => {
  state.packs.unshift(pack);
  return pack;
};

export const addExport = (packExport: PackExport) => {
  state.exports.unshift(packExport);
  return packExport;
};
