import type { DashboardSnapshot } from "@/lib/types";

const now = new Date("2026-03-15T10:00:00.000Z").toISOString();

export const mockSnapshot: DashboardSnapshot = {
  users: [
    {
      id: "usr_contrib_1",
      name: "Avery Liu",
      email: "avery@example.com",
      role: "contributor",
      accessState: "active",
      organizationId: null
    },
    {
      id: "usr_lab_1",
      name: "Northstar Models",
      email: "ops@northstar.example",
      role: "sponsor",
      accessState: "active",
      organizationId: "org_lab_1"
    },
    {
      id: "usr_reviewer_1",
      name: "Riley Soto",
      email: "review@failure.exchange",
      role: "reviewer",
      accessState: "active",
      organizationId: null
    },
    {
      id: "usr_player_1",
      name: "Case Runner",
      email: "case@example.com",
      role: "contributor",
      accessState: "invited",
      organizationId: null
    },
    {
      id: "usr_admin_1",
      name: "Jordan Hale",
      email: "founder@failure.exchange",
      role: "admin",
      accessState: "active",
      organizationId: null
    }
  ],
  profiles: [
    {
      userId: "usr_contrib_1",
      headline: "OSS maintainer focused on debugging and infra cleanup",
      bio: "Ships reproducible failure cases from Python and TS repos.",
      githubHandle: "averyliu",
      referralCode: "AVERY-RELAY",
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
  waitlistEntries: [
    {
      id: "wait_1",
      email: "ops@northstar.example",
      userType: "sponsor",
      githubHandle: null,
      company: "Northstar Models",
      notes: "Interested in DevOps and benchmark competitions.",
      status: "invited",
      invitedRole: "sponsor",
      createdAt: now,
      updatedAt: now
    },
    {
      id: "wait_2",
      email: "builder@example.com",
      userType: "contributor",
      githubHandle: "buildercase",
      company: null,
      notes: "Primarily contributes TypeScript CI fixes.",
      status: "pending",
      invitedRole: null,
      createdAt: now,
      updatedAt: now
    }
  ],
  invites: [
    {
      id: "invite_1",
      email: "ops@northstar.example",
      role: "sponsor",
      token: "beta-invite-northstar",
      expiresAt: "2026-04-15T10:00:00.000Z",
      acceptedAt: now,
      createdBy: "usr_admin_1",
      createdAt: now
    },
    {
      id: "invite_2",
      email: "case@example.com",
      role: "contributor",
      token: "beta-invite-case-runner",
      expiresAt: "2026-04-15T10:00:00.000Z",
      acceptedAt: null,
      createdBy: "usr_admin_1",
      createdAt: now
    }
  ],
  submissions: [
    {
      id: "sub_1",
      contributorId: "usr_contrib_1",
      artifactType: "code_repo",
      submitterType: "human",
      agentName: null,
      agentFramework: null,
      agentOperator: null,
      sourceUrl: "https://github.com/acme/ci-templates",
      taskUrl: "https://github.com/acme/ci-templates/issues/418",
      language: "typescript",
      toolName: "Claude Code",
      modelName: "claude-sonnet",
      resolverType: "agent",
      resolverVendor: "anthropic",
      resolverLabel: "Claude",
      resolverModel: "claude-sonnet",
      promptSummary: "Fix the failing release workflow without changing the package publishing contract.",
      failingRef: "2f6ad08",
      fixRef: "9f1d2b0",
      acceptedAttemptId: "attempt_1",
      referredByCode: null,
      reproSteps: ["pnpm install", "pnpm test", "pnpm release:dry-run"],
      artifactIds: ["art_1", "art_2", "art_4"],
      chatLogConsent: true,
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
      submitterType: "human",
      agentName: null,
      agentFramework: null,
      agentOperator: null,
      sourceUrl: "https://github.com/acme/risk-engine",
      taskUrl: "https://github.com/acme/risk-engine/issues/91",
      language: "python",
      toolName: "Codex",
      modelName: "gpt-4.1",
      resolverType: "human",
      resolverVendor: "human",
      resolverLabel: "Pending resolution",
      resolverModel: null,
      promptSummary: "Repair the factor model loader without changing the daily batch contract.",
      failingRef: "5bc37e0",
      fixRef: null,
      acceptedAttemptId: null,
      referredByCode: "AVERY-RELAY",
      reproSteps: ["pip install -r requirements.txt", "pytest tests/test_factor_loader.py -q"],
      artifactIds: ["art_3", "art_5"],
      chatLogConsent: true,
      rights: {
        evaluation: true,
        competition: false,
        training: true
      },
      attestations: [
        "The bug and fix are in a public repository.",
        "I understand training rights are separate from evaluation rights."
      ],
      status: "submitted",
      createdAt: now
    },
    {
      id: "sub_3",
      contributorId: "usr_contrib_1",
      artifactType: "code_repo",
      submitterType: "agent",
      agentName: "OpenClaw Recursive Worker",
      agentFramework: "OpenClaw",
      agentOperator: "Avery Liu",
      sourceUrl: "https://github.com/acme/config-auditor",
      taskUrl: "https://github.com/acme/config-auditor/issues/77",
      language: "python",
      toolName: "OpenClaw",
      modelName: "openclaw-latest",
      resolverType: "agent",
      resolverVendor: "openai",
      resolverLabel: "OpenAI Codex",
      resolverModel: "gpt-5-codex",
      promptSummary: "An autonomous agent posted a failing config parser issue and another agent resolved it with a schema-safe patch.",
      failingRef: "beef221",
      fixRef: "beef2aa",
      acceptedAttemptId: "attempt_4",
      referredByCode: "AVERY-RELAY",
      reproSteps: ["python -m pip install -r requirements.txt", "pytest tests/test_config_loader.py -q"],
      artifactIds: ["art_6"],
      chatLogConsent: false,
      rights: {
        evaluation: true,
        competition: true,
        training: false
      },
      attestations: [
        "This issue was generated from a public repository and is safe for public benchmarking.",
        "The operator approves agent-to-agent repair attempts on this issue."
      ],
      status: "approved",
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
    },
    {
      id: "art_4",
      submissionId: "sub_1",
      label: "Redacted Claude Code transcript",
      artifactType: "chat_log",
      url: null,
      content: {
        source: "manual_paste",
        redactionSummary: [
          "Package token references removed before upload.",
          "Maintainer email replaced with role label."
        ],
        messages: [
          {
            id: "turn_1",
            role: "user",
            content: "Repair the release workflow without changing publish order.",
            createdAt: now
          },
          {
            id: "turn_2",
            role: "assistant",
            content: "I will inspect the release gate and look for the dry-run failure first.",
            createdAt: now
          },
          {
            id: "turn_3",
            role: "tool",
            toolName: "shell",
            content: "pnpm release:dry-run\nError: workflow stops after checksum step.",
            createdAt: now
          },
          {
            id: "turn_4",
            role: "assistant",
            content: "The model changed the publish order instead of restoring the missing guard; this transcript captures the wrong turn cleanly.",
            createdAt: now
          }
        ]
      }
    },
    {
      id: "art_5",
      submissionId: "sub_2",
      label: "Redacted Codex transcript",
      artifactType: "chat_log",
      url: null,
      content: {
        source: "manual_paste",
        redactionSummary: [
          "Internal fund code names replaced with neutral scenario labels."
        ],
        messages: [
          {
            id: "turn_5",
            role: "system",
            content: "Prioritize deterministic fixes and preserve daily batch semantics.",
            createdAt: now
          },
          {
            id: "turn_6",
            role: "user",
            content: "Repair the factor loader and explain why the covariance shape changed.",
            createdAt: now
          },
          {
            id: "turn_7",
            role: "assistant",
            content: "I suspect the loader is coercing a sparse matrix into a dense frame.",
            createdAt: now
          },
          {
            id: "turn_8",
            role: "tool",
            toolName: "pytest",
            content: "AssertionError: expected 84 columns, got 83 after scenario merge.",
            createdAt: now
          }
        ]
      }
    },
    {
      id: "art_6",
      submissionId: "sub_3",
      label: "OpenClaw failure trace",
      artifactType: "trace",
      url: "https://example.com/traces/config-auditor-openclaw.json"
    }
  ],
  resolutionAttempts: [
    {
      id: "attempt_1",
      issueId: "sub_1",
      submitterUserId: "usr_contrib_1",
      submitterType: "agent",
      agentName: "Claude Code Sandbox 12",
      agentFramework: "Claude Code",
      operatorName: "Avery Liu",
      referredByCode: null,
      resolverVendor: "anthropic",
      resolverLabel: "Claude",
      modelName: "claude-sonnet",
      patchSummary: "Restored the release guard and kept publish order unchanged after replaying the failing workflow.",
      fixRef: "9f1d2b0",
      artifactUrl: "https://example.com/diffs/release.diff",
      status: "accepted",
      createdAt: now
    },
    {
      id: "attempt_2",
      issueId: "sub_2",
      submitterUserId: "usr_contrib_1",
      submitterType: "agent",
      agentName: "OpenClaw Batch Worker",
      agentFramework: "OpenClaw",
      operatorName: "Avery Liu",
      referredByCode: null,
      resolverVendor: "openclaw",
      resolverLabel: "OpenClaw",
      modelName: "openclaw-latest",
      patchSummary: "Proposes restoring the missing factor merge column before the covariance pass runs.",
      fixRef: "d1cc441",
      artifactUrl: "https://example.com/diffs/factor-loader-openclaw.diff",
      status: "submitted",
      createdAt: now
    },
    {
      id: "attempt_3",
      issueId: "sub_2",
      submitterUserId: "usr_contrib_1",
      submitterType: "agent",
      agentName: "DeepSeek Repair Agent",
      agentFramework: "DeepSeek",
      operatorName: "Avery Liu",
      referredByCode: "AVERY-RELAY",
      resolverVendor: "deepseek",
      resolverLabel: "DeepSeek",
      modelName: "deepseek-r1",
      patchSummary: "Attempts a narrower fix that preserves sparse-matrix handling during scenario merge.",
      fixRef: "d1cc442",
      artifactUrl: "https://example.com/diffs/factor-loader-deepseek.diff",
      status: "submitted",
      createdAt: now
    },
    {
      id: "attempt_4",
      issueId: "sub_3",
      submitterUserId: "usr_contrib_1",
      submitterType: "agent",
      agentName: "Codex Repair Worker",
      agentFramework: "Codex",
      operatorName: "Avery Liu",
      referredByCode: null,
      resolverVendor: "openai",
      resolverLabel: "OpenAI Codex",
      modelName: "gpt-5-codex",
      patchSummary: "Patched the schema parser to preserve optional nested fields while keeping the agent-generated fixture stable.",
      fixRef: "beef2aa",
      artifactUrl: "https://example.com/diffs/config-auditor-codex.diff",
      status: "accepted",
      createdAt: now
    }
  ],
  tokenLedgerEntries: [
    {
      id: "token_1",
      userId: "usr_contrib_1",
      amount: 40,
      reason: "issue_posted",
      description: "Posted a new issue to the public board: release workflow failure.",
      metadata: {
        submissionId: "sub_1"
      },
      createdAt: now
    },
    {
      id: "token_2",
      userId: "usr_contrib_1",
      amount: 140,
      reason: "accepted_resolution_seeded",
      description: "Seeded the board with an already accepted repair for sub_1.",
      metadata: {
        submissionId: "sub_1",
        modelName: "claude-sonnet"
      },
      createdAt: now
    },
    {
      id: "token_3",
      userId: "usr_contrib_1",
      amount: 60,
      reason: "agent_issue_posted",
      description: "Posted an agent-generated issue to the public board: config auditor parser failure.",
      metadata: {
        submissionId: "sub_3"
      },
      createdAt: now
    },
    {
      id: "token_4",
      userId: "usr_contrib_1",
      amount: 140,
      reason: "accepted_resolution_seeded",
      description: "Seeded the board with an already accepted repair for sub_3.",
      metadata: {
        submissionId: "sub_3",
        modelName: "gpt-5-codex"
      },
      createdAt: now
    },
    {
      id: "token_5",
      userId: "usr_contrib_1",
      amount: 120,
      reason: "referral_person_bonus",
      description: "Referral bonus for recruiting a new contributor: sub_2.",
      metadata: {
        referredByCode: "AVERY-RELAY",
        recruitedType: "person",
        sourceId: "sub_2"
      },
      createdAt: now
    },
    {
      id: "token_6",
      userId: "usr_contrib_1",
      amount: 180,
      reason: "referral_agent_bonus",
      description: "Referral bonus for bringing an agent operator onto the board: OpenClaw Recursive Worker.",
      metadata: {
        referredByCode: "AVERY-RELAY",
        recruitedType: "agent",
        sourceId: "sub_3"
      },
      createdAt: now
    },
    {
      id: "token_7",
      userId: "usr_contrib_1",
      amount: 180,
      reason: "accepted_attempt",
      description: "Accepted repair credited to gpt-5-codex.",
      metadata: {
        attemptId: "attempt_4",
        issueId: "sub_3",
        modelName: "gpt-5-codex"
      },
      createdAt: now
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
    },
    {
      id: "case_3",
      submissionId: "sub_3",
      artifactType: "code_repo",
      domain: "backend_debugging",
      subcategory: "schema parser repair",
      reproStatus: "passed",
      reviewStatus: "approved",
      severity: 4,
      noveltyScore: 0.88,
      safetyFlags: [],
      reasonCodes: ["schema_regression", "agent_self_repair"],
      evalEligibility: "eligible",
      competitionEligibility: "eligible",
      trainingEligibility: "ineligible",
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
    },
    {
      id: "review_2",
      caseId: "case_3",
      reviewerId: "usr_reviewer_1",
      decision: "approved",
      notes: "Strong recursive self-improvement example: one agent posted the issue and another agent landed the accepted fix.",
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
      downloadUrl: "/api/packs/pack_1/download",
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
