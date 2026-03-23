export type ArtifactType = "code_repo" | "spreadsheet" | "notebook";
export type UserRole = "contributor" | "sponsor" | "reviewer" | "admin";
export type AccessState = "waitlisted" | "invited" | "active" | "blocked";
export type WaitlistUserType = "contributor" | "sponsor" | "agent";
export type WaitlistStatus = "pending" | "approved" | "invited" | "rejected";
export type SubmissionArtifactType = "log" | "diff" | "screenshot" | "trace" | "chat_log";
export type ChatLogRole = "system" | "user" | "assistant" | "tool";
export type SubmitterType = "human" | "agent";
export type ResolverType = "human" | "agent";
export type AttemptStatus = "submitted" | "accepted" | "rejected";
export type RecruitmentType = "person" | "agent";
export type TokenRewardReason =
  | "issue_posted"
  | "agent_issue_posted"
  | "accepted_resolution_seeded"
  | "accepted_attempt"
  | "referral_person_bonus"
  | "referral_agent_bonus";
export type ResolverVendor =
  | "human"
  | "anthropic"
  | "openai"
  | "deepseek"
  | "openclaw"
  | "google"
  | "meta"
  | "other";
export type SubmissionStatus =
  | "draft"
  | "submitted"
  | "validating"
  | "needs_review"
  | "approved"
  | "rejected";
export type ReviewStatus = "pending" | "approved" | "rejected";
export type EligibilityStatus = "pending" | "eligible" | "ineligible";
export type CampaignStatus = "draft" | "active" | "paused" | "completed";
export type CompetitionEntryStatus = "queued" | "running" | "scored" | "rejected";
export type BriefMatchStatus = "suggested" | "matched" | "payout_pending" | "paid";
export type PackType = "eval_pack" | "training_pack";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  accessState: AccessState;
  image?: string;
  organizationId?: string | null;
}

export interface Profile {
  userId: string;
  headline: string;
  bio: string;
  githubHandle: string;
  referralCode: string;
  payoutReady: boolean;
}

export interface PayoutAccount {
  id: string;
  userId: string;
  provider: "stripe_connect" | "manual";
  status: "pending" | "ready";
  currency: "USD";
}

export interface Organization {
  id: string;
  name: string;
  type: "lab" | "vendor" | "community";
}

export interface WaitlistEntry {
  id: string;
  email: string;
  userType: WaitlistUserType;
  githubHandle?: string | null;
  company?: string | null;
  agentName?: string | null;
  agentFramework?: string | null;
  operatorName?: string | null;
  notes?: string | null;
  status: WaitlistStatus;
  invitedRole?: UserRole | null;
  createdAt: string;
  updatedAt: string;
}

export interface Invite {
  id: string;
  email: string;
  role: UserRole;
  token: string;
  expiresAt: string;
  acceptedAt?: string | null;
  createdBy?: string | null;
  createdAt: string;
}

export interface RightsGrant {
  evaluation: boolean;
  competition: boolean;
  training: boolean;
}

export interface ChatLogMessage {
  id: string;
  role: ChatLogRole;
  content: string;
  toolName?: string | null;
  createdAt?: string | null;
}

export interface ChatLogArtifactContent {
  messages: ChatLogMessage[];
  redactionSummary?: string[];
  source?: string;
}

export interface SubmissionArtifact {
  id: string;
  submissionId: string;
  label: string;
  artifactType: SubmissionArtifactType;
  url?: string | null;
  content?: ChatLogArtifactContent | null;
}

export interface Submission {
  id: string;
  contributorId: string;
  artifactType: ArtifactType;
  submitterType: SubmitterType;
  agentName?: string | null;
  agentFramework?: string | null;
  agentOperator?: string | null;
  sourceUrl: string;
  taskUrl: string;
  language: "python" | "typescript";
  toolName: string;
  modelName: string;
  resolverType: ResolverType;
  resolverVendor: ResolverVendor;
  resolverLabel: string;
  resolverModel?: string | null;
  promptSummary: string;
  failingRef: string;
  fixRef?: string | null;
  acceptedAttemptId?: string | null;
  referredByCode?: string | null;
  reproSteps: string[];
  artifactIds: string[];
  chatLogConsent: boolean;
  rights: RightsGrant;
  attestations: string[];
  status: SubmissionStatus;
  createdAt: string;
}

export interface ValidatedCase {
  id: string;
  submissionId: string;
  artifactType: ArtifactType;
  domain:
    | "devops"
    | "financial_modeling_code"
    | "backend_debugging"
    | "frontend_debugging"
    | "data_pipeline"
    | "test_repair"
    | "refactor_navigation";
  subcategory: string;
  reproStatus: "passed" | "failed" | "not_run";
  reviewStatus: ReviewStatus;
  severity: 1 | 2 | 3 | 4 | 5;
  noveltyScore: number;
  safetyFlags: string[];
  reasonCodes: string[];
  evalEligibility: EligibilityStatus;
  competitionEligibility: EligibilityStatus;
  trainingEligibility: EligibilityStatus;
  createdAt: string;
}

export interface ResolutionAttempt {
  id: string;
  issueId: string;
  submitterUserId?: string | null;
  submitterType: SubmitterType;
  agentName?: string | null;
  agentFramework?: string | null;
  operatorName?: string | null;
  referredByCode?: string | null;
  resolverVendor: ResolverVendor;
  resolverLabel: string;
  modelName: string;
  patchSummary: string;
  fixRef: string;
  artifactUrl?: string | null;
  status: AttemptStatus;
  createdAt: string;
}

export interface ReviewDecision {
  id: string;
  caseId: string;
  reviewerId: string;
  decision: ReviewStatus;
  notes: string;
  rightsApproved: RightsGrant;
  createdAt: string;
}

export interface DomainBrief {
  id: string;
  buyerId: string;
  domain: ValidatedCase["domain"];
  subcategoryFilters: string[];
  languageFilters: Array<Submission["language"]>;
  requiredSignals: string[];
  rightsRequested: Array<keyof RightsGrant>;
  payoutMinUsd: number;
  payoutMaxUsd: number;
  caseLimit: number;
  acceptanceCriteria: string;
  status: CampaignStatus;
  createdAt: string;
}

export interface BriefMatch {
  id: string;
  briefId: string;
  caseId: string;
  status: BriefMatchStatus;
  selectedPayoutUsd: number;
  reviewerNotes: string;
  createdAt: string;
}

export interface PricingRecommendation {
  id: string;
  caseId: string;
  briefId?: string | null;
  suggestedMinUsd: number;
  suggestedMaxUsd: number;
  confidence: number;
  reasonCodes: string[];
  llmSummary: string;
  createdAt: string;
}

export interface AgentConfig {
  modelId: string;
  systemPrompt: string;
  taskPromptTemplate: string;
  allowedTools: string[];
  maxTurns: number;
  temperature: number;
  budgetLimitUsd: number;
  timeoutSeconds: number;
}

export interface CompetitionCampaign {
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
  status: CampaignStatus;
  startAt: string;
  endAt: string;
  createdAt: string;
}

export interface CompetitionCaseSplit {
  id: string;
  competitionId: string;
  caseId: string;
  split: "public_dev" | "hidden_holdout";
}

export interface CompetitionEntry {
  id: string;
  campaignId: string;
  participantId: string;
  agentConfig: AgentConfig;
  status: CompetitionEntryStatus;
  devScore: number | null;
  holdoutScore: number | null;
  costScore: number | null;
  runtimeScore: number | null;
  createdAt: string;
}

export interface CompetitionRun {
  id: string;
  entryId: string;
  split: "public_dev" | "hidden_holdout";
  solvedCases: number;
  totalCases: number;
  totalCostUsd: number;
  totalRuntimeMs: number;
  reasonCodes: string[];
  createdAt: string;
}

export interface CasePack {
  id: string;
  buyerId: string;
  packType: PackType;
  caseIds: string[];
  exportManifest: Record<string, unknown>;
  createdAt: string;
}

export interface PackExport {
  id: string;
  packId: string;
  status: "queued" | "ready";
  downloadUrl?: string | null;
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  actorId: string;
  entityType:
    | "submission"
    | "validated_case"
    | "review"
    | "domain_brief"
    | "brief_match"
    | "pricing_recommendation"
    | "competition"
    | "competition_entry"
    | "pack_export"
    | "waitlist_entry"
    | "invite"
    | "dispute";
  entityId: string;
  action: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface Dispute {
  id: string;
  reporterId: string;
  caseId?: string | null;
  packId?: string | null;
  status: "open" | "resolved";
  summary: string;
  createdAt: string;
}

export interface ResolverLeaderboardEntry {
  modelName: string;
  primaryVendor: ResolverVendor;
  resolverLabels: string[];
  casesResolved: number;
  approvedCases: number;
  competitionEligibleCases: number;
  agentSubmittedCases: number;
  averageSeverity: number;
  averageNovelty: number;
  totalTokensAwarded: number;
  totalMatchedPayoutUsd: number;
  lastResolvedAt?: string | null;
  leadingDomains: Array<ValidatedCase["domain"]>;
}

export interface AgentLeaderboardEntry {
  agentName: string;
  agentFramework: string;
  operatorName?: string | null;
  casesResolved: number;
  approvedCases: number;
  averageSeverity: number;
  averageNovelty: number;
  modelsUsed: string[];
  latestModelName: string;
  lastResolvedAt?: string | null;
  leadingDomains: Array<ValidatedCase["domain"]>;
}

export interface TokenLedgerEntry {
  id: string;
  userId: string;
  amount: number;
  reason: TokenRewardReason;
  description: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface DashboardSnapshot {
  users: User[];
  profiles: Profile[];
  payoutAccounts: PayoutAccount[];
  organizations: Organization[];
  waitlistEntries: WaitlistEntry[];
  invites: Invite[];
  submissions: Submission[];
  submissionArtifacts: SubmissionArtifact[];
  resolutionAttempts: ResolutionAttempt[];
  validatedCases: ValidatedCase[];
  reviews: ReviewDecision[];
  briefs: DomainBrief[];
  briefMatches: BriefMatch[];
  pricingRecommendations: PricingRecommendation[];
  competitions: CompetitionCampaign[];
  competitionSplits: CompetitionCaseSplit[];
  competitionEntries: CompetitionEntry[];
  competitionRuns: CompetitionRun[];
  packs: CasePack[];
  exports: PackExport[];
  auditEvents: AuditEvent[];
  disputes: Dispute[];
  tokenLedgerEntries: TokenLedgerEntry[];
}
