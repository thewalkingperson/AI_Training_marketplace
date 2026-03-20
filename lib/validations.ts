import { z } from "zod";

export const rightsGrantSchema = z.object({
  evaluation: z.boolean(),
  competition: z.boolean(),
  training: z.boolean()
});

const chatLogMessageSchema = z.object({
  id: z.string().min(1),
  role: z.enum(["system", "user", "assistant", "tool"]),
  content: z.string().min(1),
  toolName: z.string().min(1).nullable().optional(),
  createdAt: z.string().datetime().nullable().optional()
});

const chatLogArtifactSchema = z.object({
  label: z.string().min(1),
  artifactType: z.enum(["log", "diff", "screenshot", "trace", "chat_log"]),
  url: z.string().url().nullable().optional(),
  content: z
    .object({
      messages: z.array(chatLogMessageSchema).min(1),
      redactionSummary: z.array(z.string().min(1)).default([]),
      source: z.string().min(1).optional()
    })
    .nullable()
    .optional()
}).superRefine((artifact, ctx) => {
  if (artifact.artifactType === "chat_log" && !artifact.content?.messages.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "chat_log artifacts require transcript messages.",
      path: ["content", "messages"]
    });
  }

  if (artifact.artifactType !== "chat_log" && !artifact.url) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Non-chat artifacts require a URL.",
      path: ["url"]
    });
  }
});

export const submissionInputSchema = z.object({
  contributorId: z.string().min(1).default("usr_contrib_1"),
  artifactType: z.enum(["code_repo", "spreadsheet", "notebook"]).default("code_repo"),
  sourceUrl: z.string().url(),
  taskUrl: z.string().url(),
  language: z.enum(["python", "typescript"]),
  toolName: z.string().min(2),
  modelName: z.string().min(2),
  promptSummary: z.string().min(20),
  failingRef: z.string().min(4),
  fixRef: z.string().min(4),
  reproSteps: z.array(z.string().min(1)).min(1),
  artifacts: z.array(chatLogArtifactSchema).default([]),
  chatLogConsent: z.boolean().default(false),
  rights: rightsGrantSchema,
  attestations: z.array(z.string().min(5)).min(1)
}).superRefine((submission, ctx) => {
  const includesChatLog = submission.artifacts.some((artifact) => artifact.artifactType === "chat_log");
  if (includesChatLog && !submission.chatLogConsent) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Explicit consent is required before storing a chat transcript.",
      path: ["chatLogConsent"]
    });
  }
});

export const reviewDecisionInputSchema = z.object({
  reviewerId: z.string().min(1).default("usr_reviewer_1"),
  decision: z.enum(["approved", "rejected"]),
  notes: z.string().min(8),
  rightsApproved: rightsGrantSchema
});

export const domainBriefInputSchema = z.object({
  buyerId: z.string().min(1).default("usr_lab_1"),
  domain: z.enum([
    "devops",
    "financial_modeling_code",
    "backend_debugging",
    "frontend_debugging",
    "data_pipeline",
    "test_repair",
    "refactor_navigation"
  ]),
  subcategoryFilters: z.array(z.string().min(1)).min(1),
  languageFilters: z.array(z.enum(["python", "typescript"])).min(1),
  requiredSignals: z.array(z.string().min(1)).min(1),
  rightsRequested: z.array(z.enum(["evaluation", "competition", "training"])).min(1),
  payoutMinUsd: z.number().int().positive(),
  payoutMaxUsd: z.number().int().positive(),
  caseLimit: z.number().int().positive(),
  acceptanceCriteria: z.string().min(20),
  status: z.enum(["draft", "active", "paused", "completed"]).default("draft")
}).refine((value) => value.payoutMaxUsd >= value.payoutMinUsd, {
  message: "payoutMaxUsd must be greater than or equal to payoutMinUsd",
  path: ["payoutMaxUsd"]
});

export const agentConfigSchema = z.object({
  modelId: z.string().min(2),
  systemPrompt: z.string().min(20),
  taskPromptTemplate: z.string().min(12),
  allowedTools: z.array(z.string().min(1)).min(1),
  maxTurns: z.number().int().min(1).max(50),
  temperature: z.number().min(0).max(2),
  budgetLimitUsd: z.number().positive(),
  timeoutSeconds: z.number().int().min(30)
});

export const competitionInputSchema = z.object({
  buyerId: z.string().min(1).default("usr_lab_1"),
  title: z.string().min(6),
  description: z.string().min(20),
  filters: z.array(z.string().min(1)).min(1),
  allowedModels: z.array(z.string().min(1)).min(1),
  allowedTools: z.array(z.string().min(1)).min(1),
  prizePoolUsd: z.number().int().positive(),
  maxEntriesPerUser: z.number().int().positive(),
  publicCaseIds: z.array(z.string().min(1)).min(1),
  hiddenCaseIds: z.array(z.string().min(1)).min(1),
  scoringVersion: z.string().min(3),
  startAt: z.string().datetime(),
  endAt: z.string().datetime()
}).refine((value) => new Date(value.endAt) > new Date(value.startAt), {
  message: "endAt must be after startAt",
  path: ["endAt"]
});

export const competitionEntryInputSchema = z.object({
  participantId: z.string().min(1).default("usr_player_1"),
  agentConfig: agentConfigSchema
});

export const packInputSchema = z.object({
  buyerId: z.string().min(1).default("usr_lab_1"),
  packType: z.enum(["eval_pack", "training_pack"]).default("eval_pack"),
  caseIds: z.array(z.string().min(1)).min(1)
});
