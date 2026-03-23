import { prisma } from "@/lib/db";
import { env, isDemoMode } from "@/lib/env";
import { getSnapshot } from "@/lib/mock-store";
import type {
  AuditEvent,
  CasePack,
  CompetitionCampaign,
  CompetitionCaseSplit,
  CompetitionEntry,
  CompetitionRun,
  DashboardSnapshot,
  Dispute,
  DomainBrief,
  Invite,
  Organization,
  PackExport,
  PayoutAccount,
  PricingRecommendation,
  Profile,
  ResolutionAttempt,
  ReviewDecision,
  Submission,
  SubmissionArtifact,
  TokenLedgerEntry,
  User,
  ValidatedCase,
  WaitlistEntry
} from "@/lib/types";

const cloneDemoSnapshot = (): DashboardSnapshot => {
  const snapshot = structuredClone(getSnapshot());

  if (!env.competitionsEnabled) {
    snapshot.competitions = [];
    snapshot.competitionSplits = [];
    snapshot.competitionEntries = [];
    snapshot.competitionRuns = [];
  }

  return snapshot;
};

const mapUser = (user: {
  id: string;
  name: string;
  email: string;
  role: User["role"];
  accessState: User["accessState"];
  image: string | null;
  organizationId: string | null;
}): User => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  accessState: user.accessState,
  image: user.image ?? undefined,
  organizationId: user.organizationId
});

const mapProfile = (profile: {
  userId: string;
  headline: string;
  bio: string;
  githubHandle: string;
  referralCode: string;
  payoutReady: boolean;
}): Profile => profile;

const mapPayoutAccount = (account: {
  id: string;
  userId: string;
  provider: string;
  status: string;
  currency: string;
}): PayoutAccount => ({
  id: account.id,
  userId: account.userId,
  provider: account.provider as PayoutAccount["provider"],
  status: account.status as PayoutAccount["status"],
  currency: account.currency as PayoutAccount["currency"]
});

const mapOrganization = (organization: {
  id: string;
  name: string;
  type: Organization["type"];
}): Organization => organization;

const mapWaitlistEntry = (entry: {
  id: string;
  email: string;
  userType: WaitlistEntry["userType"];
  githubHandle: string | null;
  company: string | null;
  agentName: string | null;
  agentFramework: string | null;
  operatorName: string | null;
  notes: string | null;
  status: WaitlistEntry["status"];
  invitedRole: WaitlistEntry["invitedRole"];
  createdAt: Date;
  updatedAt: Date;
}): WaitlistEntry => ({
  id: entry.id,
  email: entry.email,
  userType: entry.userType,
  githubHandle: entry.githubHandle,
  company: entry.company,
  agentName: entry.agentName,
  agentFramework: entry.agentFramework,
  operatorName: entry.operatorName,
  notes: entry.notes,
  status: entry.status,
  invitedRole: entry.invitedRole ?? null,
  createdAt: entry.createdAt.toISOString(),
  updatedAt: entry.updatedAt.toISOString()
});

const mapInvite = (invite: {
  id: string;
  email: string;
  role: Invite["role"];
  token: string;
  expiresAt: Date;
  acceptedAt: Date | null;
  createdBy: string | null;
  createdAt: Date;
}): Invite => ({
  id: invite.id,
  email: invite.email,
  role: invite.role,
  token: invite.token,
  expiresAt: invite.expiresAt.toISOString(),
  acceptedAt: invite.acceptedAt?.toISOString() ?? null,
  createdBy: invite.createdBy,
  createdAt: invite.createdAt.toISOString()
});

const mapSubmission = (submission: {
  id: string;
  contributorId: string;
  artifactType: string;
  submitterType: Submission["submitterType"];
  agentName: string | null;
  agentFramework: string | null;
  agentOperator: string | null;
  sourceUrl: string;
  taskUrl: string;
  language: string;
  toolName: string;
  modelName: string;
  resolverType: Submission["resolverType"];
  resolverVendor: Submission["resolverVendor"];
  resolverLabel: string;
  resolverModel: string | null;
  promptSummary: string;
  failingRef: string;
  fixRef: string | null;
  acceptedAttemptId: string | null;
  referredByCode: string | null;
  reproSteps: string[];
  chatLogConsent: boolean;
  rightsEvaluation: boolean;
  rightsCompetition: boolean;
  rightsTraining: boolean;
  attestations: string[];
  status: string;
  createdAt: Date;
  artifacts?: Array<{ id: string }>;
}): Submission => ({
  id: submission.id,
  contributorId: submission.contributorId,
  artifactType: submission.artifactType as Submission["artifactType"],
  submitterType: submission.submitterType,
  agentName: submission.agentName,
  agentFramework: submission.agentFramework,
  agentOperator: submission.agentOperator,
  sourceUrl: submission.sourceUrl,
  taskUrl: submission.taskUrl,
  language: submission.language as Submission["language"],
  toolName: submission.toolName,
  modelName: submission.modelName,
  resolverType: submission.resolverType,
  resolverVendor: submission.resolverVendor,
  resolverLabel: submission.resolverLabel,
  resolverModel: submission.resolverModel,
  promptSummary: submission.promptSummary,
  failingRef: submission.failingRef,
  fixRef: submission.fixRef,
  acceptedAttemptId: submission.acceptedAttemptId,
  referredByCode: submission.referredByCode,
  reproSteps: submission.reproSteps,
  artifactIds: submission.artifacts?.map((artifact) => artifact.id) ?? [],
  chatLogConsent: submission.chatLogConsent,
  rights: {
    evaluation: submission.rightsEvaluation,
    competition: submission.rightsCompetition,
    training: submission.rightsTraining
  },
  attestations: submission.attestations,
  status: submission.status as Submission["status"],
  createdAt: submission.createdAt.toISOString()
});

const mapSubmissionArtifact = (artifact: {
  id: string;
  submissionId: string;
  label: string;
  artifactType: string;
  url: string | null;
  content: unknown;
}): SubmissionArtifact => ({
  id: artifact.id,
  submissionId: artifact.submissionId,
  label: artifact.label,
  artifactType: artifact.artifactType as SubmissionArtifact["artifactType"],
  url: artifact.url ?? null,
  content: (artifact.content as SubmissionArtifact["content"]) ?? null
});

const mapResolutionAttempt = (attempt: {
  id: string;
  issueId: string;
  submitterUserId: string | null;
  submitterType: ResolutionAttempt["submitterType"];
  agentName: string | null;
  agentFramework: string | null;
  operatorName: string | null;
  referredByCode: string | null;
  resolverVendor: ResolutionAttempt["resolverVendor"];
  resolverLabel: string;
  modelName: string;
  patchSummary: string;
  fixRef: string;
  artifactUrl: string | null;
  status: ResolutionAttempt["status"];
  createdAt: Date;
}): ResolutionAttempt => ({
  id: attempt.id,
  issueId: attempt.issueId,
  submitterUserId: attempt.submitterUserId,
  submitterType: attempt.submitterType,
  agentName: attempt.agentName,
  agentFramework: attempt.agentFramework,
  operatorName: attempt.operatorName,
  referredByCode: attempt.referredByCode,
  resolverVendor: attempt.resolverVendor,
  resolverLabel: attempt.resolverLabel,
  modelName: attempt.modelName,
  patchSummary: attempt.patchSummary,
  fixRef: attempt.fixRef,
  artifactUrl: attempt.artifactUrl,
  status: attempt.status,
  createdAt: attempt.createdAt.toISOString()
});

const mapValidatedCase = (caseRecord: {
  id: string;
  submissionId: string;
  artifactType: string;
  domain: string;
  subcategory: string;
  reproStatus: string;
  reviewStatus: string;
  severity: number;
  noveltyScore: number;
  safetyFlags: string[];
  reasonCodes: string[];
  evalEligibility: string;
  competitionEligibility: string;
  trainingEligibility: string;
  createdAt: Date;
}): ValidatedCase => ({
  id: caseRecord.id,
  submissionId: caseRecord.submissionId,
  artifactType: caseRecord.artifactType as ValidatedCase["artifactType"],
  domain: caseRecord.domain as ValidatedCase["domain"],
  subcategory: caseRecord.subcategory,
  reproStatus: caseRecord.reproStatus as ValidatedCase["reproStatus"],
  reviewStatus: caseRecord.reviewStatus as ValidatedCase["reviewStatus"],
  severity: caseRecord.severity as ValidatedCase["severity"],
  noveltyScore: caseRecord.noveltyScore,
  safetyFlags: caseRecord.safetyFlags,
  reasonCodes: caseRecord.reasonCodes,
  evalEligibility: caseRecord.evalEligibility as ValidatedCase["evalEligibility"],
  competitionEligibility: caseRecord.competitionEligibility as ValidatedCase["competitionEligibility"],
  trainingEligibility: caseRecord.trainingEligibility as ValidatedCase["trainingEligibility"],
  createdAt: caseRecord.createdAt.toISOString()
});

const mapReview = (review: {
  id: string;
  caseId: string;
  reviewerId: string;
  decision: string;
  notes: string;
  rightsEvaluation: boolean;
  rightsCompetition: boolean;
  rightsTraining: boolean;
  createdAt: Date;
}): ReviewDecision => ({
  id: review.id,
  caseId: review.caseId,
  reviewerId: review.reviewerId,
  decision: review.decision as ReviewDecision["decision"],
  notes: review.notes,
  rightsApproved: {
    evaluation: review.rightsEvaluation,
    competition: review.rightsCompetition,
    training: review.rightsTraining
  },
  createdAt: review.createdAt.toISOString()
});

const mapBrief = (brief: {
  id: string;
  buyerId: string;
  domain: string;
  subcategoryFilters: string[];
  languageFilters: string[];
  requiredSignals: string[];
  rightsRequested: string[];
  payoutMinUsd: number;
  payoutMaxUsd: number;
  caseLimit: number;
  acceptanceCriteria: string;
  status: string;
  createdAt: Date;
}): DomainBrief => ({
  ...brief,
  domain: brief.domain as DomainBrief["domain"],
  languageFilters: brief.languageFilters as Array<Submission["language"]>,
  rightsRequested: brief.rightsRequested as Array<keyof Submission["rights"]>,
  status: brief.status as DomainBrief["status"],
  createdAt: brief.createdAt.toISOString()
});

const mapPricingRecommendation = (recommendation: {
  id: string;
  caseId: string;
  briefId: string | null;
  suggestedMinUsd: number;
  suggestedMaxUsd: number;
  confidence: number;
  reasonCodes: string[];
  llmSummary: string;
  createdAt: Date;
}): PricingRecommendation => ({
  ...recommendation,
  briefId: recommendation.briefId,
  createdAt: recommendation.createdAt.toISOString()
});

const mapCompetition = (competition: {
  id: string;
  buyerId: string;
  slug: string;
  title: string;
  description: string;
  filters: string[];
  allowedModels: string[];
  allowedTools: string[];
  prizePoolUsd: number;
  maxEntriesPerUser: number;
  scoringVersion: string;
  status: string;
  startAt: Date;
  endAt: Date;
  createdAt: Date;
}): CompetitionCampaign => ({
  ...competition,
  status: competition.status as CompetitionCampaign["status"],
  startAt: competition.startAt.toISOString(),
  endAt: competition.endAt.toISOString(),
  createdAt: competition.createdAt.toISOString()
});

const mapCompetitionSplit = (split: {
  id: string;
  competitionId: string;
  caseId: string;
  split: string;
}): CompetitionCaseSplit => ({
  ...split,
  split: split.split as CompetitionCaseSplit["split"]
});

const mapCompetitionEntry = (entry: {
  id: string;
  campaignId: string;
  participantId: string;
  agentConfig: unknown;
  status: string;
  devScore: number | null;
  holdoutScore: number | null;
  costScore: number | null;
  runtimeScore: number | null;
  createdAt: Date;
}): CompetitionEntry => ({
  ...entry,
  agentConfig: entry.agentConfig as CompetitionEntry["agentConfig"],
  status: entry.status as CompetitionEntry["status"],
  createdAt: entry.createdAt.toISOString()
});

const mapCompetitionRun = (run: {
  id: string;
  entryId: string;
  split: string;
  solvedCases: number;
  totalCases: number;
  totalCostUsd: number;
  totalRuntimeMs: number;
  reasonCodes: string[];
  createdAt: Date;
}): CompetitionRun => ({
  ...run,
  split: run.split as CompetitionRun["split"],
  createdAt: run.createdAt.toISOString()
});

const mapPack = (pack: {
  id: string;
  buyerId: string;
  packType: CasePack["packType"];
  caseIds: string[];
  exportManifest: unknown;
  createdAt: Date;
}): CasePack => ({
  ...pack,
  exportManifest: pack.exportManifest as Record<string, unknown>,
  createdAt: pack.createdAt.toISOString()
});

const mapExport = (packExport: {
  id: string;
  packId: string;
  status: string;
  downloadUrl: string | null;
  createdAt: Date;
}): PackExport => ({
  ...packExport,
  status: packExport.status as PackExport["status"],
  downloadUrl: packExport.downloadUrl,
  createdAt: packExport.createdAt.toISOString()
});

const mapAuditEvent = (event: {
  id: string;
  actorId: string;
  entityType: string;
  entityId: string;
  action: string;
  metadata: unknown;
  createdAt: Date;
}): AuditEvent => ({
  ...event,
  entityType: event.entityType as AuditEvent["entityType"],
  metadata: event.metadata as Record<string, unknown>,
  createdAt: event.createdAt.toISOString()
});

const mapDispute = (dispute: {
  id: string;
  reporterId: string;
  caseId: string | null;
  packId: string | null;
  status: string;
  summary: string;
  createdAt: Date;
}): Dispute => ({
  ...dispute,
  status: dispute.status as Dispute["status"],
  caseId: dispute.caseId,
  packId: dispute.packId,
  createdAt: dispute.createdAt.toISOString()
});

const mapTokenLedgerEntry = (entry: {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  description: string;
  metadata: unknown;
  createdAt: Date;
}): TokenLedgerEntry => ({
  id: entry.id,
  userId: entry.userId,
  amount: entry.amount,
  reason: entry.reason as TokenLedgerEntry["reason"],
  description: entry.description,
  metadata: (entry.metadata as TokenLedgerEntry["metadata"]) ?? {},
  createdAt: entry.createdAt.toISOString()
});

export const getDashboardSnapshot = async (): Promise<DashboardSnapshot> => {
  if (isDemoMode) {
    return cloneDemoSnapshot();
  }

  const [
    users,
    profiles,
    payoutAccounts,
    organizations,
    waitlistEntries,
    invites,
    submissions,
    submissionArtifacts,
    resolutionAttempts,
    validatedCases,
    reviews,
    briefs,
    briefMatches,
    pricingRecommendations,
    competitions,
    competitionSplits,
    competitionEntries,
    competitionRuns,
    packs,
    exports,
    auditEvents,
    disputes,
    tokenLedgerEntries
  ] = await Promise.all([
    prisma.user.findMany({ orderBy: { email: "asc" } }),
    prisma.profile.findMany({ orderBy: { userId: "asc" } }),
    prisma.payoutAccount.findMany({ orderBy: { id: "asc" } }),
    prisma.organization.findMany({ orderBy: { name: "asc" } }),
    prisma.waitlistEntry.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.invite.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.submission.findMany({ include: { artifacts: true }, orderBy: { createdAt: "desc" } }),
    prisma.submissionArtifact.findMany({ orderBy: { id: "asc" } }),
    prisma.resolutionAttempt.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.validatedCase.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.reviewDecision.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.domainBrief.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.briefMatch.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.pricingRecommendation.findMany({ orderBy: { createdAt: "desc" } }),
    env.competitionsEnabled
      ? prisma.competitionCampaign.findMany({ orderBy: { createdAt: "desc" } })
      : Promise.resolve([]),
    env.competitionsEnabled
      ? prisma.competitionCaseSplit.findMany({ orderBy: { id: "asc" } })
      : Promise.resolve([]),
    env.competitionsEnabled
      ? prisma.competitionEntry.findMany({ orderBy: { createdAt: "desc" } })
      : Promise.resolve([]),
    env.competitionsEnabled
      ? prisma.competitionRun.findMany({ orderBy: { createdAt: "desc" } })
      : Promise.resolve([]),
    prisma.casePack.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.packExport.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.auditEvent.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.dispute.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.tokenLedgerEntry.findMany({ orderBy: { createdAt: "desc" } })
  ]);

  return {
    users: users.map(mapUser),
    profiles: profiles.map(mapProfile),
    payoutAccounts: payoutAccounts.map(mapPayoutAccount),
    organizations: organizations.map(mapOrganization),
    waitlistEntries: waitlistEntries.map(mapWaitlistEntry),
    invites: invites.map(mapInvite),
    submissions: submissions.map(mapSubmission),
    submissionArtifacts: submissionArtifacts.map(mapSubmissionArtifact),
    resolutionAttempts: resolutionAttempts.map(mapResolutionAttempt),
    validatedCases: validatedCases.map(mapValidatedCase),
    reviews: reviews.map(mapReview),
    briefs: briefs.map(mapBrief),
    briefMatches: briefMatches.map((match) => ({
      ...match,
      createdAt: match.createdAt.toISOString()
    })),
    pricingRecommendations: pricingRecommendations.map(mapPricingRecommendation),
    competitions: competitions.map(mapCompetition),
    competitionSplits: competitionSplits.map(mapCompetitionSplit),
    competitionEntries: competitionEntries.map(mapCompetitionEntry),
    competitionRuns: competitionRuns.map(mapCompetitionRun),
    packs: packs.map(mapPack),
    exports: exports.map(mapExport),
    auditEvents: auditEvents.map(mapAuditEvent),
    disputes: disputes.map(mapDispute),
    tokenLedgerEntries: tokenLedgerEntries.map(mapTokenLedgerEntry)
  };
};

export const getPublicLaunchMetrics = async () => {
  const snapshot = await getDashboardSnapshot();
  const validatedCases = snapshot.validatedCases.filter((item) => item.reviewStatus === "approved").length;
  const openIssues = snapshot.submissions.filter((item) => !item.acceptedAttemptId).length;
  const acceptedAttempts = snapshot.resolutionAttempts.filter((item) => item.status === "accepted").length;
  const activeResolvers = new Set(
    snapshot.resolutionAttempts
      .filter((item) => item.status === "accepted")
      .map((item) => item.modelName),
  ).size;
  const tokensDistributed = snapshot.tokenLedgerEntries.reduce((sum, entry) => sum + entry.amount, 0);

  return {
    validatedCases,
    openIssues,
    acceptedAttempts,
    activeResolvers,
    tokensDistributed
  };
};
