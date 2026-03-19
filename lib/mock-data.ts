import type { DashboardSnapshot } from "@/lib/types";

const now = new Date("2026-03-15T10:00:00.000Z").toISOString();

export const mockSnapshot: DashboardSnapshot = {
  users: [
    {
      id: "usr_contrib_1",
      name: "Avery Liu",
      email: "avery@example.com",
      role: "contributor",
      organizationId: null
    },
    {
      id: "usr_lab_1",
      name: "Northstar Models",
      email: "ops@northstar.example",
      role: "sponsor",
      organizationId: "org_lab_1"
    },
    {
      id: "usr_reviewer_1",
      name: "Riley Soto",
      email: "review@failure.exchange",
      role: "reviewer",
      organizationId: null
    },
    {
      id: "usr_player_1",
      name: "Case Runner",
      email: "case@example.com",
      role: "contributor",
      organizationId: null
    }
  ],
  profiles: [
    {
      userId: "usr_contrib_1",
      headline: "OSS maintainer focused on debugging and infra cleanup",
      bio: "Ships reproducible failure cases from Python and TS repos.",
      githubHandle: "averyliu",
      payoutReady: true
    }
  ],
  payoutAccounts: [
    {
      id: "pay_1",
      userId: "usr_contrib_1",
      provider: "stripe_connect",
      status: "ready",
      currency: "USD"
    }
  ],
  organizations: [
    {
      id: "org_lab_1",
      name: "Northstar Models",
      type: "lab"
    }
  ],
  submissions: [
    {
      id: "sub_1",
      contributorId: "usr_contrib_1",
      artifactType: "code_repo",
      sourceUrl: "https://github.com/acme/ci-templates",
      taskUrl: "https://github.com/acme/ci-templates/issues/418",
      language: "typescript",
      toolName: "Claude Code",
      modelName: "claude-sonnet",
      promptSummary: "Fix the failing release workflow without changing the package publishing contract.",
      failingRef: "2f6ad08",
      fixRef: "9f1d2b0",
      reproSteps: ["pnpm install", "pnpm test", "pnpm release:dry-run"],
      artifactIds: ["art_1", "art_2"],
      rights: {
        evaluation: true,
        competition: true,
        training: false
      },
      attestations: [
        "I own the submitted fix or have permission to license it.",
        "The repository is public and contains no private credentials."
      ],
      status: "approved",
      createdAt: now
    },
    {
      id: "sub_2",
      contributorId: "usr_contrib_1",
      artifactType: "code_repo",
      sourceUrl: "https://github.com/acme/risk-engine",
      taskUrl: "https://github.com/acme/risk-engine/issues/91",
      language: "python",
      toolName: "Codex",
      modelName: "gpt-4.1",
      promptSummary: "Repair the factor model loader without changing the daily batch contract.",
      failingRef: "5bc37e0",
      fixRef: "d1cc441",
      reproSteps: ["pip install -r requirements.txt", "pytest tests/test_factor_loader.py -q"],
      artifactIds: ["art_3"],
      rights: {
        evaluation: true,
        competition: false,
        training: true
      },
      attestations: [
        "The bug and fix are in a public repository.",
        "I understand training rights are separate from evaluation rights."
      ],
      status: "needs_review",
      createdAt: now
    }
  ],
  submissionArtifacts: [
    {
      id: "art_1",
      submissionId: "sub_1",
      label: "Workflow failure log",
      artifactType: "log",
      url: "https://example.com/logs/workflow.log"
    },
    {
      id: "art_2",
      submissionId: "sub_1",
      label: "Patch diff",
      artifactType: "diff",
      url: "https://example.com/diffs/release.diff"
    },
    {
      id: "art_3",
      submissionId: "sub_2",
      label: "Loader traceback",
      artifactType: "log",
      url: "https://example.com/logs/factor-loader.log"
    }
  ],
  validatedCases: [
    {
      id: "case_1",
      submissionId: "sub_1",
      artifactType: "code_repo",
      domain: "devops",
      subcategory: "release automation",
      reproStatus: "passed",
      reviewStatus: "approved",
      severity: 4,
      noveltyScore: 0.83,
      safetyFlags: [],
      reasonCodes: ["ci_failure", "deployment_guardrail"],
      evalEligibility: "eligible",
      competitionEligibility: "eligible",
      trainingEligibility: "ineligible",
      createdAt: now
    },
    {
      id: "case_2",
      submissionId: "sub_2",
      artifactType: "code_repo",
      domain: "financial_modeling_code",
      subcategory: "factor loading",
      reproStatus: "passed",
      reviewStatus: "pending",
      severity: 5,
      noveltyScore: 0.91,
      safetyFlags: ["manual_rights_review"],
      reasonCodes: ["numerical_error", "scenario_mismatch"],
      evalEligibility: "eligible",
      competitionEligibility: "ineligible",
      trainingEligibility: "pending",
      createdAt: now
    }
  ],
  reviews: [
    {
      id: "review_1",
      caseId: "case_1",
      reviewerId: "usr_reviewer_1",
      decision: "approved",
      notes: "Clean repro, no secrets found, good fit for DevOps brief and competition use.",
      rightsApproved: {
        evaluation: true,
        competition: true,
        training: false
      },
      createdAt: now
    }
  ],
  briefs: [
    {
      id: "brief_1",
      buyerId: "usr_lab_1",
      domain: "devops",
      subcategoryFilters: ["release automation", "deploy rollback"],
      languageFilters: ["typescript", "python"],
      requiredSignals: ["ci_failure", "deployment_guardrail"],
      rightsRequested: ["evaluation", "competition"],
      payoutMinUsd: 500,
      payoutMaxUsd: 900,
      caseLimit: 20,
      acceptanceCriteria: "Needs a reliable repro, accepted human fix, and a postmortem-quality summary.",
      status: "active",
      createdAt: now
    },
    {
      id: "brief_2",
      buyerId: "usr_lab_1",
      domain: "financial_modeling_code",
      subcategoryFilters: ["factor loading", "pricing engine"],
      languageFilters: ["python"],
      requiredSignals: ["numerical_error", "scenario_mismatch"],
      rightsRequested: ["evaluation", "training"],
      payoutMinUsd: 800,
      payoutMaxUsd: 1400,
      caseLimit: 10,
      acceptanceCriteria: "Must include deterministic regression coverage and rights for training review.",
      status: "active",
      createdAt: now
    }
  ],
  briefMatches: [
    {
      id: "match_1",
      briefId: "brief_1",
      caseId: "case_1",
      status: "matched",
      selectedPayoutUsd: 780,
      reviewerNotes: "Lands near the upper band because release workflows are scarce and reproducible.",
      createdAt: now
    }
  ],
  pricingRecommendations: [
    {
      id: "price_1",
      caseId: "case_1",
      briefId: "brief_1",
      suggestedMinUsd: 650,
      suggestedMaxUsd: 825,
      confidence: 0.79,
      reasonCodes: ["high_novelty", "active_buyer_demand", "clean_repro"],
      llmSummary: "This failure is especially useful because it demonstrates infrastructure-sensitive edits with a stable replay path.",
      createdAt: now
    }
  ],
  competitions: [
    {
      id: "comp_1",
      buyerId: "usr_lab_1",
      slug: "release-guardian-challenge",
      title: "Release Guardian Challenge",
      description: "Benchmark prompt and agent strategies on reproducible release engineering failures.",
      filters: ["devops", "typescript", "release automation"],
      allowedModels: ["gpt-4.1", "claude-sonnet"],
      allowedTools: ["terminal", "repo_search", "test_runner"],
      prizePoolUsd: 7500,
      maxEntriesPerUser: 5,
      scoringVersion: "2026-03-devops-v1",
      status: "active",
      startAt: now,
      endAt: "2026-04-01T10:00:00.000Z",
      createdAt: now
    }
  ],
  competitionSplits: [
    {
      id: "split_1",
      competitionId: "comp_1",
      caseId: "case_1",
      split: "public_dev"
    },
    {
      id: "split_2",
      competitionId: "comp_1",
      caseId: "case_2",
      split: "hidden_holdout"
    }
  ],
  competitionEntries: [
    {
      id: "entry_1",
      campaignId: "comp_1",
      participantId: "usr_player_1",
      agentConfig: {
        modelId: "gpt-4.1",
        systemPrompt: "You are a release engineer focused on minimal, test-backed changes.",
        taskPromptTemplate: "Repair the workflow failure with the smallest safe diff.",
        allowedTools: ["repo_search", "terminal", "test_runner"],
        maxTurns: 10,
        temperature: 0.1,
        budgetLimitUsd: 12,
        timeoutSeconds: 900
      },
      status: "scored",
      devScore: 1,
      holdoutScore: null,
      costScore: 7.5,
      runtimeScore: 480000,
      createdAt: now
    }
  ],
  competitionRuns: [
    {
      id: "run_1",
      entryId: "entry_1",
      split: "public_dev",
      solvedCases: 1,
      totalCases: 1,
      totalCostUsd: 7.5,
      totalRuntimeMs: 480000,
      reasonCodes: ["solved_public_case"],
      createdAt: now
    }
  ],
  packs: [
    {
      id: "pack_1",
      buyerId: "usr_lab_1",
      packType: "eval_pack",
      caseIds: ["case_1"],
      exportManifest: {
        version: "2026-03",
        caseCount: 1
      },
      createdAt: now
    }
  ],
  exports: [
    {
      id: "export_1",
      packId: "pack_1",
      status: "ready",
      downloadUrl: "https://example.com/exports/pack_1.zip",
      createdAt: now
    }
  ],
  auditEvents: [
    {
      id: "audit_1",
      actorId: "usr_reviewer_1",
      entityType: "validated_case",
      entityId: "case_1",
      action: "review.approved",
      metadata: {
        severity: 4,
        competitionEligibility: "eligible"
      },
      createdAt: now
    }
  ],
  disputes: []
};
