export type ScholarshipAiPolicy = "allow" | "silent" | "ban";
export type ThirdPartyAssistancePolicy = "allow" | "silent" | "ban";
export type ScholarshipSubmissionChannel = "web_form" | "email" | "portal";
export type ScholarshipPayoutMode = "direct_to_student" | "school_payable";
export type ScholarshipAwardRestriction = "unrestricted" | "tuition_only";
export type ScholarshipTransferability = "transferable" | "nontransferable" | "unknown";
export type ScholarshipReviewLevel = "auto" | "human_review" | "needs_action" | "track_only";
export type ScholarshipExecutionLane = "auto_submit" | "needs_action" | "track_only";
export type ScholarshipAttemptStatus =
  | "draft_ready"
  | "queued_review"
  | "submitted"
  | "needs_student_action"
  | "blocked";
export type ScholarshipOutcomeStatus = "pending" | "won" | "rejected" | "needs_follow_up";
export type ScholarshipReviewStatus = "open" | "approved" | "blocked";
export type ScholarshipActionType =
  | "consent_recorded"
  | "match_created"
  | "application_drafted"
  | "review_requested"
  | "application_submitted"
  | "student_action_needed"
  | "award_recorded"
  | "application_rejected"
  | "billing_created";

export interface StudentProfile {
  id: string;
  fullName: string;
  email: string;
  age: number;
  schoolName: string;
  academicYear: "incoming_freshman" | "freshman" | "sophomore" | "junior" | "senior";
  major: string;
  gpa: number;
  citizenship: "us_citizen" | "permanent_resident" | "international";
  householdIncomeBand: "lt_50k" | "50k_100k" | "100k_200k" | "gt_200k";
  firstGenerationStudent: boolean;
  statesOfResidence: string[];
  interests: string[];
  achievements: string[];
  essayFacts: string[];
  preferences: {
    autoSubmitEligible: boolean;
    allowEssayAutomation: boolean;
    notificationChannel: "email" | "sms";
  };
}

export interface StudentConsent {
  id: string;
  studentId: string;
  scope: Array<"match" | "draft" | "submit" | "monitor" | "bill">;
  scholarshipClassAuthorization: Array<"direct_form" | "email_submission" | "essay_capable">;
  revoked: boolean;
  signedAt: string;
}

export interface ParentConsent {
  id: string;
  studentId: string;
  parentName: string;
  parentEmail: string;
  relation: string;
  signedAt: string;
}

export interface ScholarshipOpportunity {
  id: string;
  title: string;
  sponsor: string;
  description: string;
  sourceUrl: string;
  sourceType: "crawl" | "manual_review";
  deadlineAt: string;
  awardAmountUsd: number;
  payoutMode: ScholarshipPayoutMode;
  awardRestriction: ScholarshipAwardRestriction;
  transferability: ScholarshipTransferability;
  aiPolicy: ScholarshipAiPolicy;
  thirdPartyAssistancePolicy: ThirdPartyAssistancePolicy;
  applicantOnly: boolean;
  submissionChannel: ScholarshipSubmissionChannel;
  requiresPortalLogin: boolean;
  requiresEssay: boolean;
  essayPrompt?: string;
  requiresVideo: boolean;
  requiresInterview: boolean;
  requiresRecommendationUpload: boolean;
  requiresHandwrittenMaterials: boolean;
  eligibleMajors: string[];
  minimumGpa?: number | null;
  eligibleStates: string[];
  firstGenerationOnly: boolean;
  openToInternationalStudents: boolean;
  renewalEligible: boolean;
  resultHint: "pending" | "won" | "rejected" | "needs_follow_up";
  fundsClearedHint?: boolean;
}

export interface RuleClearance {
  opportunityId: string;
  aiPolicy: ScholarshipAiPolicy;
  thirdPartyAssistancePolicy: ThirdPartyAssistancePolicy;
  applicantOnly: boolean;
  submissionChannel: ScholarshipSubmissionChannel;
  requiresPortalLogin: boolean;
  payoutMode: ScholarshipPayoutMode;
  awardRestriction: ScholarshipAwardRestriction;
  transferability: ScholarshipTransferability;
  lane: ScholarshipExecutionLane;
  reviewLevel: ScholarshipReviewLevel;
  feeEligible: boolean;
  draftAllowed: boolean;
  submitAllowed: boolean;
  outOfScopeFlags: string[];
  reasonCodes: string[];
}

export interface MatchedScholarship {
  id: string;
  studentId: string;
  opportunityId: string;
  fitScore: number;
  summary: string;
  reasonCodes: string[];
}

export interface ApplicationPackage {
  id: string;
  studentId: string;
  opportunityId: string;
  structuredAnswers: Record<string, string>;
  essayDraft?: string;
  essayFactSources: string[];
  policyDecisionSummary: string;
  status: "drafted" | "ready_for_review" | "ready_for_submission";
}

export interface SubmissionAttempt {
  id: string;
  applicationPackageId: string;
  studentId: string;
  opportunityId: string;
  lane: ScholarshipExecutionLane;
  status: ScholarshipAttemptStatus;
  confirmationReference?: string;
  retries: number;
  lastUpdatedAt: string;
}

export interface SubmissionOutcome {
  id: string;
  submissionAttemptId: string;
  studentId: string;
  opportunityId: string;
  status: ScholarshipOutcomeStatus;
  resultSummary: string;
  updatedAt: string;
}

export interface ReviewCase {
  id: string;
  opportunityId: string;
  studentId: string;
  reviewStatus: ScholarshipReviewStatus;
  reason: string;
  requestedAt: string;
}

export interface AwardVerification {
  id: string;
  studentId: string;
  opportunityId: string;
  outcomeId: string;
  verified: boolean;
  fundsCleared: boolean;
  feeEligible: boolean;
  verifiedAt: string;
}

export interface BillingEvent {
  id: string;
  studentId: string;
  opportunityId: string;
  awardVerificationId: string;
  amountUsd: number;
  status: "queued" | "paid" | "waived";
  createdAt: string;
}

export interface ScholarshipActivityEvent {
  id: string;
  studentId: string;
  opportunityId?: string;
  action: ScholarshipActionType;
  message: string;
  createdAt: string;
}

export interface ScholarshipSnapshot {
  students: StudentProfile[];
  consents: StudentConsent[];
  parentConsents: ParentConsent[];
  opportunities: ScholarshipOpportunity[];
  clearances: RuleClearance[];
  matches: MatchedScholarship[];
  applicationPackages: ApplicationPackage[];
  submissionAttempts: SubmissionAttempt[];
  submissionOutcomes: SubmissionOutcome[];
  reviewCases: ReviewCase[];
  awardVerifications: AwardVerification[];
  billingEvents: BillingEvent[];
  activityEvents: ScholarshipActivityEvent[];
}
