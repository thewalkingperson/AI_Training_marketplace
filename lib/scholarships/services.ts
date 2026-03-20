import { SCHOLARSHIP_POLICY_CONFIG, SCHOLARSHIP_PRICING_CONFIG } from "@/lib/scholarships/config";
import type {
  ApplicationPackage,
  AwardVerification,
  BillingEvent,
  MatchedScholarship,
  ReviewCase,
  RuleClearance,
  ScholarshipActivityEvent,
  ScholarshipOpportunity,
  ScholarshipSnapshot,
  StudentConsent,
  StudentProfile,
  SubmissionAttempt,
  SubmissionOutcome
} from "@/lib/scholarships/types";
import { validateStudentEnrollment } from "@/lib/scholarships/validations";

const isoTimestamp = (value: string) => new Date(value).toISOString();

const hasMajorMatch = (student: StudentProfile, opportunity: ScholarshipOpportunity) =>
  opportunity.eligibleMajors.length === 0 ||
  opportunity.eligibleMajors.some((major) => major.toLowerCase() === student.major.toLowerCase());

const hasStateMatch = (student: StudentProfile, opportunity: ScholarshipOpportunity) =>
  opportunity.eligibleStates.length === 0 ||
  student.statesOfResidence.some((state) => opportunity.eligibleStates.includes(state));

export const classifyOpportunityRules = (opportunity: ScholarshipOpportunity): RuleClearance => {
  const outOfScopeFlags: string[] = [];
  const reasonCodes: string[] = [];

  if (opportunity.requiresVideo) {
    outOfScopeFlags.push("video_required");
  }

  if (opportunity.requiresInterview) {
    outOfScopeFlags.push("interview_required");
  }

  if (opportunity.requiresRecommendationUpload) {
    outOfScopeFlags.push("recommendation_required");
  }

  if (opportunity.requiresHandwrittenMaterials) {
    outOfScopeFlags.push("handwritten_required");
  }

  if (opportunity.aiPolicy === "ban") {
    reasonCodes.push("explicit_ai_ban");
  }

  if (opportunity.thirdPartyAssistancePolicy === "ban") {
    reasonCodes.push("third_party_ban");
  }

  if (opportunity.applicantOnly) {
    reasonCodes.push("applicant_only");
  }

  let lane: RuleClearance["lane"] = "auto_submit";
  let reviewLevel: RuleClearance["reviewLevel"] = "auto";
  let draftAllowed = true;
  let submitAllowed = true;

  if (outOfScopeFlags.length > 0 || opportunity.aiPolicy === "ban" || opportunity.thirdPartyAssistancePolicy === "ban" || opportunity.applicantOnly) {
    lane = "track_only";
    reviewLevel = "track_only";
    draftAllowed = false;
    submitAllowed = false;
  } else if (opportunity.requiresPortalLogin || opportunity.submissionChannel === "portal") {
    lane = "needs_action";
    reviewLevel = "needs_action";
    submitAllowed = false;
    reasonCodes.push("portal_login_required");
  } else if (opportunity.awardAmountUsd >= SCHOLARSHIP_POLICY_CONFIG.highValueThresholdUsd) {
    reviewLevel = "human_review";
    reasonCodes.push("high_value_review");
  }

  if (opportunity.aiPolicy === "silent" && lane !== "track_only") {
    reasonCodes.push("ai_policy_silent");
  }

  if (opportunity.thirdPartyAssistancePolicy === "silent" && lane !== "track_only") {
    reasonCodes.push("third_party_policy_silent");
  }

  const feeEligible =
    opportunity.payoutMode === "direct_to_student" &&
    opportunity.awardRestriction === "unrestricted" &&
    opportunity.transferability !== "nontransferable" &&
    lane !== "track_only";

  if (!feeEligible) {
    reasonCodes.push("fee_ineligible");
  }

  return {
    opportunityId: opportunity.id,
    aiPolicy: opportunity.aiPolicy,
    thirdPartyAssistancePolicy: opportunity.thirdPartyAssistancePolicy,
    applicantOnly: opportunity.applicantOnly,
    submissionChannel: opportunity.submissionChannel,
    requiresPortalLogin: opportunity.requiresPortalLogin,
    payoutMode: opportunity.payoutMode,
    awardRestriction: opportunity.awardRestriction,
    transferability: opportunity.transferability,
    lane,
    reviewLevel,
    feeEligible,
    draftAllowed,
    submitAllowed,
    outOfScopeFlags,
    reasonCodes
  };
};

export const normalizeAndClassifyRules = (opportunities: ScholarshipOpportunity[]) =>
  opportunities.map((opportunity) => classifyOpportunityRules(opportunity));

export const studentIsEligible = (student: StudentProfile, opportunity: ScholarshipOpportunity) => {
  if (student.age < SCHOLARSHIP_POLICY_CONFIG.minimumStudentAge) {
    return false;
  }

  if (opportunity.minimumGpa && student.gpa < opportunity.minimumGpa) {
    return false;
  }

  if (!hasMajorMatch(student, opportunity)) {
    return false;
  }

  if (!hasStateMatch(student, opportunity)) {
    return false;
  }

  if (opportunity.firstGenerationOnly && !student.firstGenerationStudent) {
    return false;
  }

  if (!opportunity.openToInternationalStudents && student.citizenship === "international") {
    return false;
  }

  return true;
};

export const matchStudentToOpportunities = (
  student: StudentProfile,
  opportunities: ScholarshipOpportunity[],
  clearances: RuleClearance[],
): MatchedScholarship[] =>
  opportunities
    .filter((opportunity) => studentIsEligible(student, opportunity))
    .map((opportunity) => {
      const clearance = clearances.find((item) => item.opportunityId === opportunity.id);
      const reasonCodes: string[] = [];
      let fitScore = 0.5;

      if (opportunity.eligibleMajors.length > 0) {
        fitScore += 0.15;
        reasonCodes.push("major_match");
      }

      if (opportunity.firstGenerationOnly && student.firstGenerationStudent) {
        fitScore += 0.1;
        reasonCodes.push("first_gen_fit");
      }

      if (opportunity.minimumGpa && student.gpa >= opportunity.minimumGpa + 0.2) {
        fitScore += 0.08;
        reasonCodes.push("gpa_buffer");
      }

      if (clearance?.lane === "auto_submit") {
        fitScore += 0.12;
        reasonCodes.push("automation_ready");
      }

      if (clearance?.reviewLevel === "human_review") {
        fitScore -= 0.05;
        reasonCodes.push("review_before_submit");
      }

      return {
        id: `match_${student.id}_${opportunity.id}`,
        studentId: student.id,
        opportunityId: opportunity.id,
        fitScore: Math.min(Number(fitScore.toFixed(2)), 0.95),
        summary: `${opportunity.title} fits ${student.major} students with ${student.gpa.toFixed(2)} GPA.`,
        reasonCodes
      };
    })
    .sort((left, right) => right.fitScore - left.fitScore);

export const composeApplication = (
  student: StudentProfile,
  opportunity: ScholarshipOpportunity,
  clearance: RuleClearance,
): ApplicationPackage | null => {
  if (!clearance.draftAllowed) {
    return null;
  }

  const structuredAnswers = {
    biography: `${student.fullName} is a ${student.academicYear.replaceAll("_", " ")} studying ${student.major} at ${student.schoolName}.`,
    impact: student.achievements.slice(0, 2).join(" "),
    goals: `The scholarship would help ${student.fullName} continue work in ${student.interests.slice(0, 2).join(" and ")}.`
  };

  const essayDraft = opportunity.requiresEssay
    ? [
        `I am applying for ${opportunity.title} because my path through ${student.major} has been shaped by ${student.essayFacts[0]}.`,
        `At ${student.schoolName}, I have focused on ${student.interests.join(", ")} while maintaining a ${student.gpa.toFixed(2)} GPA.`,
        `This award would let me build on ${student.essayFacts[1]} and keep moving toward work that is both practical and community-minded.`
      ].join(" ")
    : undefined;

  const status = clearance.reviewLevel === "human_review" ? "ready_for_review" : "ready_for_submission";

  return {
    id: `pkg_${student.id}_${opportunity.id}`,
    studentId: student.id,
    opportunityId: opportunity.id,
    structuredAnswers,
    essayDraft,
    essayFactSources: student.essayFacts.slice(0, 3),
    policyDecisionSummary: `${clearance.reviewLevel} / ${clearance.lane} with reason codes: ${clearance.reasonCodes.join(", ") || "none"}.`,
    status
  };
};

export const composeApplications = (
  student: StudentProfile,
  opportunities: ScholarshipOpportunity[],
  clearances: RuleClearance[],
): ApplicationPackage[] =>
  opportunities
    .map((opportunity) => {
      const clearance = clearances.find((item) => item.opportunityId === opportunity.id);

      if (!clearance) {
        return null;
      }

      return composeApplication(student, opportunity, clearance);
    })
    .filter((item): item is ApplicationPackage => item !== null);

export const submitApplication = (
  applicationPackage: ApplicationPackage,
  clearance: RuleClearance,
  submittedAt: string,
): SubmissionAttempt => {
  let status: SubmissionAttempt["status"] = "submitted";
  let confirmationReference: string | undefined = `CONF-${applicationPackage.opportunityId.toUpperCase()}`;

  if (clearance.reviewLevel === "human_review") {
    status = "queued_review";
    confirmationReference = undefined;
  } else if (clearance.lane === "needs_action") {
    status = "needs_student_action";
    confirmationReference = undefined;
  } else if (clearance.lane === "track_only") {
    status = "blocked";
    confirmationReference = undefined;
  }

  return {
    id: `attempt_${applicationPackage.id}`,
    applicationPackageId: applicationPackage.id,
    studentId: applicationPackage.studentId,
    opportunityId: applicationPackage.opportunityId,
    lane: clearance.lane,
    status,
    confirmationReference,
    retries: 0,
    lastUpdatedAt: isoTimestamp(submittedAt)
  };
};

export const monitorOutcomes = (
  attempts: SubmissionAttempt[],
  opportunities: ScholarshipOpportunity[],
  updatedAt: string,
): SubmissionOutcome[] =>
  attempts.map((attempt) => {
    const opportunity = opportunities.find((item) => item.id === attempt.opportunityId);

    if (!opportunity) {
      throw new Error(`Missing opportunity for attempt ${attempt.id}`);
    }

    let status: SubmissionOutcome["status"] = "pending";
    let resultSummary = "Application is still in flight.";

    if (attempt.status === "needs_student_action") {
      status = "needs_follow_up";
      resultSummary = "Student login or approval is required before submission can continue.";
    } else if (attempt.status === "queued_review") {
      status = "needs_follow_up";
      resultSummary = "Human review is required before the agent can submit this application.";
    } else if (attempt.status === "submitted") {
      if (opportunity.resultHint === "won") {
        status = "won";
        resultSummary = `${opportunity.title} returned a winning notice.`;
      } else if (opportunity.resultHint === "rejected") {
        status = "rejected";
        resultSummary = `${opportunity.title} returned a rejection notice.`;
      } else if (opportunity.resultHint === "needs_follow_up") {
        status = "needs_follow_up";
        resultSummary = "The sponsor requested follow-up documentation.";
      }
    }

    return {
      id: `outcome_${attempt.id}`,
      submissionAttemptId: attempt.id,
      studentId: attempt.studentId,
      opportunityId: attempt.opportunityId,
      status,
      resultSummary,
      updatedAt: isoTimestamp(updatedAt)
    };
  });

export const verifyAward = (
  outcome: SubmissionOutcome,
  opportunity: ScholarshipOpportunity,
  verifiedAt: string,
): AwardVerification | null => {
  if (outcome.status !== "won") {
    return null;
  }

  const feeEligible =
    opportunity.payoutMode === "direct_to_student" &&
    opportunity.awardRestriction === "unrestricted" &&
    opportunity.transferability !== "nontransferable";

  return {
    id: `verification_${outcome.id}`,
    studentId: outcome.studentId,
    opportunityId: outcome.opportunityId,
    outcomeId: outcome.id,
    verified: true,
    fundsCleared: Boolean(opportunity.fundsClearedHint),
    feeEligible,
    verifiedAt: isoTimestamp(verifiedAt)
  };
};

export const createBillingEvent = (
  verification: AwardVerification,
  opportunity: ScholarshipOpportunity,
  createdAt: string,
): BillingEvent | null => {
  if (!verification.verified || !verification.fundsCleared || !verification.feeEligible) {
    return null;
  }

  return {
    id: `billing_${verification.id}`,
    studentId: verification.studentId,
    opportunityId: opportunity.id,
    awardVerificationId: verification.id,
    amountUsd: Math.min(SCHOLARSHIP_PRICING_CONFIG.successFeeUsd, SCHOLARSHIP_PRICING_CONFIG.annualCapUsd),
    status: "queued",
    createdAt: isoTimestamp(createdAt)
  };
};

export const buildReviewCases = (
  student: StudentProfile,
  opportunities: ScholarshipOpportunity[],
  clearances: RuleClearance[],
  requestedAt: string,
): ReviewCase[] =>
  opportunities
    .map((opportunity) => {
      const clearance = clearances.find((item) => item.opportunityId === opportunity.id);

      if (!clearance || clearance.reviewLevel !== "human_review") {
        return null;
      }

      return {
        id: `review_${student.id}_${opportunity.id}`,
        opportunityId: opportunity.id,
        studentId: student.id,
        reviewStatus: "open",
        reason: clearance.reasonCodes.join(", "),
        requestedAt: isoTimestamp(requestedAt)
      };
    })
    .filter((item): item is ReviewCase => item !== null);

export const buildActivityEvents = (
  student: StudentProfile,
  consent: StudentConsent,
  matches: MatchedScholarship[],
  applications: ApplicationPackage[],
  attempts: SubmissionAttempt[],
  outcomes: SubmissionOutcome[],
  verifications: AwardVerification[],
  billings: BillingEvent[],
): ScholarshipActivityEvent[] => {
  const events: ScholarshipActivityEvent[] = [
    {
      id: `evt_consent_${student.id}`,
      studentId: student.id,
      action: "consent_recorded",
      message: `Agent authority recorded for ${consent.scope.join(", ")} actions.`,
      createdAt: consent.signedAt
    }
  ];

  for (const match of matches) {
    events.push({
      id: `evt_match_${match.id}`,
      studentId: student.id,
      opportunityId: match.opportunityId,
      action: "match_created",
      message: `Matched with fit score ${Math.round(match.fitScore * 100)}%.`,
      createdAt: consent.signedAt
    });
  }

  for (const application of applications) {
    events.push({
      id: `evt_pkg_${application.id}`,
      studentId: student.id,
      opportunityId: application.opportunityId,
      action: "application_drafted",
      message: application.essayDraft ? "Generated a full application with essay provenance." : "Generated a structured application package.",
      createdAt: consent.signedAt
    });
  }

  for (const attempt of attempts) {
    const action =
      attempt.status === "needs_student_action"
        ? "student_action_needed"
        : attempt.status === "queued_review"
          ? "review_requested"
          : "application_submitted";

    events.push({
      id: `evt_attempt_${attempt.id}`,
      studentId: student.id,
      opportunityId: attempt.opportunityId,
      action,
      message:
        attempt.status === "submitted"
          ? "Application submitted in the background."
          : attempt.status === "queued_review"
            ? "Application sent to human review."
            : attempt.status === "needs_student_action"
              ? "Student approval is needed before submission."
              : "Application blocked by policy.",
      createdAt: attempt.lastUpdatedAt
    });
  }

  for (const outcome of outcomes) {
    const action =
      outcome.status === "won"
        ? "award_recorded"
        : outcome.status === "rejected"
          ? "application_rejected"
          : "student_action_needed";

    events.push({
      id: `evt_outcome_${outcome.id}`,
      studentId: student.id,
      opportunityId: outcome.opportunityId,
      action,
      message: outcome.resultSummary,
      createdAt: outcome.updatedAt
    });
  }

  for (const verification of verifications) {
    events.push({
      id: `evt_verification_${verification.id}`,
      studentId: student.id,
      opportunityId: verification.opportunityId,
      action: "award_recorded",
      message: verification.feeEligible
        ? "Award verified as fee-eligible."
        : "Award verified but marked fee-ineligible.",
      createdAt: verification.verifiedAt
    });
  }

  for (const billing of billings) {
    events.push({
      id: `evt_billing_${billing.id}`,
      studentId: student.id,
      opportunityId: billing.opportunityId,
      action: "billing_created",
      message: `Queued billing event for $${billing.amountUsd}.`,
      createdAt: billing.createdAt
    });
  }

  return events.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
};

export const buildScholarshipSnapshot = (input: {
  students: StudentProfile[];
  consents: StudentConsent[];
  parentConsents: ScholarshipSnapshot["parentConsents"];
  opportunities: ScholarshipOpportunity[];
}) => {
  const clearances = normalizeAndClassifyRules(input.opportunities);
  const matches: MatchedScholarship[] = [];
  const applicationPackages: ApplicationPackage[] = [];
  const submissionAttempts: SubmissionAttempt[] = [];
  const submissionOutcomes: SubmissionOutcome[] = [];
  const reviewCases: ReviewCase[] = [];
  const awardVerifications: AwardVerification[] = [];
  const billingEvents: BillingEvent[] = [];
  const activityEvents: ScholarshipActivityEvent[] = [];

  for (const student of input.students) {
    const consent = input.consents.find((item) => item.studentId === student.id);
    const parentConsent = input.parentConsents.find((item) => item.studentId === student.id) ?? null;

    if (!consent) {
      throw new Error(`Missing consent for student ${student.id}`);
    }

    validateStudentEnrollment({ student, consent, parentConsent });

    const studentMatches = matchStudentToOpportunities(student, input.opportunities, clearances);
    matches.push(...studentMatches);

    const matchedOpportunities = input.opportunities.filter((opportunity) =>
      studentMatches.some((match) => match.opportunityId === opportunity.id),
    );
    const studentPackages = composeApplications(student, matchedOpportunities, clearances);
    applicationPackages.push(...studentPackages);

    const studentAttempts = studentPackages.map((applicationPackage) => {
      const clearance = clearances.find((item) => item.opportunityId === applicationPackage.opportunityId);

      if (!clearance) {
        throw new Error(`Missing clearance for application package ${applicationPackage.id}`);
      }

      return submitApplication(applicationPackage, clearance, input.opportunities[0]?.deadlineAt ?? new Date().toISOString());
    });
    submissionAttempts.push(...studentAttempts);

    const studentOutcomes = monitorOutcomes(studentAttempts, input.opportunities, new Date("2026-03-16T15:30:00.000Z").toISOString());
    submissionOutcomes.push(...studentOutcomes);

    const studentReviewCases = buildReviewCases(student, matchedOpportunities, clearances, new Date("2026-03-14T14:00:00.000Z").toISOString());
    reviewCases.push(...studentReviewCases);

    const studentVerifications = studentOutcomes
      .map((outcome) => {
        const opportunity = input.opportunities.find((item) => item.id === outcome.opportunityId);

        if (!opportunity) {
          return null;
        }

        return verifyAward(outcome, opportunity, new Date("2026-03-17T12:00:00.000Z").toISOString());
      })
      .filter((item): item is AwardVerification => item !== null);
    awardVerifications.push(...studentVerifications);

    const studentBillingEvents = studentVerifications
      .map((verification) => {
        const opportunity = input.opportunities.find((item) => item.id === verification.opportunityId);

        if (!opportunity) {
          return null;
        }

        return createBillingEvent(verification, opportunity, new Date("2026-03-18T09:45:00.000Z").toISOString());
      })
      .filter((item): item is BillingEvent => item !== null);
    billingEvents.push(...studentBillingEvents);

    activityEvents.push(
      ...buildActivityEvents(
        student,
        consent,
        studentMatches,
        studentPackages,
        studentAttempts,
        studentOutcomes,
        studentVerifications,
        studentBillingEvents,
      ),
    );
  }

  return {
    students: input.students,
    consents: input.consents,
    parentConsents: input.parentConsents,
    opportunities: input.opportunities,
    clearances,
    matches,
    applicationPackages,
    submissionAttempts,
    submissionOutcomes,
    reviewCases,
    awardVerifications,
    billingEvents,
    activityEvents: activityEvents.sort((left, right) => right.createdAt.localeCompare(left.createdAt))
  };
};
