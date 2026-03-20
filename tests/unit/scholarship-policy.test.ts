import { describe, expect, test } from "vitest";

import {
  classifyOpportunityRules,
  composeApplication,
  matchStudentToOpportunities
} from "@/lib/scholarships/services";
import { scholarshipSnapshot } from "@/lib/scholarships/mock-data";
import type { ScholarshipOpportunity } from "@/lib/scholarships/types";

describe("scholarship policy engine", () => {
  test("blocks explicit AI bans and applicant-only opportunities", () => {
    const opportunity = scholarshipSnapshot.opportunities.find((item) => item.id === "opp_community_impact")!;

    const clearance = classifyOpportunityRules(opportunity);

    expect(clearance.lane).toBe("track_only");
    expect(clearance.draftAllowed).toBe(false);
    expect(clearance.feeEligible).toBe(false);
    expect(clearance.reasonCodes).toContain("explicit_ai_ban");
    expect(clearance.reasonCodes).toContain("applicant_only");
  });

  test("routes portal submissions into needs-action lane", () => {
    const opportunity = scholarshipSnapshot.opportunities.find((item) => item.id === "opp_pioneer_portal")!;

    const clearance = classifyOpportunityRules(opportunity);

    expect(clearance.lane).toBe("needs_action");
    expect(clearance.reviewLevel).toBe("needs_action");
    expect(clearance.submitAllowed).toBe(false);
  });

  test("routes high-value silent policies to human review", () => {
    const opportunity = scholarshipSnapshot.opportunities.find((item) => item.id === "opp_atlas_women_tech")!;

    const clearance = classifyOpportunityRules(opportunity);

    expect(clearance.lane).toBe("auto_submit");
    expect(clearance.reviewLevel).toBe("human_review");
    expect(clearance.reasonCodes).toContain("high_value_review");
    expect(clearance.reasonCodes).toContain("ai_policy_silent");
  });

  test("matches only students who satisfy obvious eligibility predicates", () => {
    const student = scholarshipSnapshot.students.find((item) => item.id === "student_maya")!;
    const opportunities: ScholarshipOpportunity[] = [
      {
        ...scholarshipSnapshot.opportunities.find((item) => item.id === "opp_future_coders")!,
        id: "opp_cs_fit",
        eligibleMajors: ["Computer Science"],
        minimumGpa: 3.0,
      },
      {
        ...scholarshipSnapshot.opportunities.find((item) => item.id === "opp_future_coders")!,
        id: "opp_me_only",
        eligibleMajors: ["Mechanical Engineering"],
        minimumGpa: 3.0,
      }
    ];
    const clearances = opportunities.map((opportunity) => classifyOpportunityRules(opportunity));

    const matches = matchStudentToOpportunities(student, opportunities, clearances);

    expect(matches.map((item) => item.opportunityId)).toEqual(["opp_cs_fit"]);
  });

  test("stores essay provenance when drafting a scholarship application", () => {
    const student = scholarshipSnapshot.students.find((item) => item.id === "student_maya")!;
    const opportunity = scholarshipSnapshot.opportunities.find((item) => item.id === "opp_future_coders")!;
    const clearance = classifyOpportunityRules(opportunity);

    const applicationPackage = composeApplication(student, opportunity, clearance);

    expect(applicationPackage?.essayDraft).toContain(opportunity.title);
    expect(applicationPackage?.essayFactSources.length).toBeGreaterThan(1);
    expect(applicationPackage?.policyDecisionSummary).toContain(clearance.lane);
  });
});
