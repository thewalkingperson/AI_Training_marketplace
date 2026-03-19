import { Prisma, PrismaClient } from "@prisma/client";

import { mockSnapshot } from "../lib/mock-data";

const prisma = new PrismaClient();

async function main() {
  await prisma.packExport.deleteMany();
  await prisma.casePack.deleteMany();
  await prisma.competitionRun.deleteMany();
  await prisma.competitionEntry.deleteMany();
  await prisma.competitionCaseSplit.deleteMany();
  await prisma.competitionCampaign.deleteMany();
  await prisma.pricingRecommendation.deleteMany();
  await prisma.briefMatch.deleteMany();
  await prisma.domainBrief.deleteMany();
  await prisma.reviewDecision.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.auditEvent.deleteMany();
  await prisma.validatedCase.deleteMany();
  await prisma.submissionArtifact.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.payoutAccount.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  await prisma.organization.createMany({
    data: mockSnapshot.organizations
  });

  await prisma.user.createMany({
    data: mockSnapshot.users.map((user) => ({
      ...user,
      image: user.image ?? null,
      organizationId: user.organizationId ?? null
    }))
  });

  await prisma.profile.createMany({
    data: mockSnapshot.profiles
  });

  await prisma.payoutAccount.createMany({
    data: mockSnapshot.payoutAccounts
  });

  await prisma.submission.createMany({
    data: mockSnapshot.submissions.map((submission) => ({
      id: submission.id,
      contributorId: submission.contributorId,
      artifactType: submission.artifactType,
      sourceUrl: submission.sourceUrl,
      taskUrl: submission.taskUrl,
      language: submission.language,
      toolName: submission.toolName,
      modelName: submission.modelName,
      promptSummary: submission.promptSummary,
      failingRef: submission.failingRef,
      fixRef: submission.fixRef,
      reproSteps: submission.reproSteps,
      rightsEvaluation: submission.rights.evaluation,
      rightsCompetition: submission.rights.competition,
      rightsTraining: submission.rights.training,
      attestations: submission.attestations,
      status: submission.status,
      createdAt: new Date(submission.createdAt)
    }))
  });

  await prisma.submissionArtifact.createMany({
    data: mockSnapshot.submissionArtifacts
  });

  await prisma.validatedCase.createMany({
    data: mockSnapshot.validatedCases.map((caseRecord) => ({
      ...caseRecord,
      createdAt: new Date(caseRecord.createdAt)
    }))
  });

  await prisma.reviewDecision.createMany({
    data: mockSnapshot.reviews.map((review) => ({
      id: review.id,
      caseId: review.caseId,
      reviewerId: review.reviewerId,
      decision: review.decision,
      notes: review.notes,
      rightsEvaluation: review.rightsApproved.evaluation,
      rightsCompetition: review.rightsApproved.competition,
      rightsTraining: review.rightsApproved.training,
      createdAt: new Date(review.createdAt)
    }))
  });

  await prisma.domainBrief.createMany({
    data: mockSnapshot.briefs.map((brief) => ({
      ...brief,
      createdAt: new Date(brief.createdAt)
    }))
  });

  await prisma.briefMatch.createMany({
    data: mockSnapshot.briefMatches.map((match) => ({
      ...match,
      createdAt: new Date(match.createdAt)
    }))
  });

  await prisma.pricingRecommendation.createMany({
    data: mockSnapshot.pricingRecommendations.map((recommendation) => ({
      ...recommendation,
      createdAt: new Date(recommendation.createdAt)
    }))
  });

  await prisma.competitionCampaign.createMany({
    data: mockSnapshot.competitions.map((competition) => ({
      ...competition,
      startAt: new Date(competition.startAt),
      endAt: new Date(competition.endAt),
      createdAt: new Date(competition.createdAt)
    }))
  });

  await prisma.competitionCaseSplit.createMany({
    data: mockSnapshot.competitionSplits
  });

  await prisma.competitionEntry.createMany({
    data: mockSnapshot.competitionEntries.map((entry) => ({
      id: entry.id,
      campaignId: entry.campaignId,
      participantId: entry.participantId,
      agentConfig: entry.agentConfig as unknown as Prisma.InputJsonValue,
      status: entry.status,
      devScore: entry.devScore,
      holdoutScore: entry.holdoutScore,
      costScore: entry.costScore,
      runtimeScore: entry.runtimeScore,
      createdAt: new Date(entry.createdAt)
    }))
  });

  await prisma.competitionRun.createMany({
    data: mockSnapshot.competitionRuns.map((run) => ({
      ...run,
      createdAt: new Date(run.createdAt)
    }))
  });

  await prisma.casePack.createMany({
    data: mockSnapshot.packs.map((pack) => ({
      ...pack,
      exportManifest: pack.exportManifest as unknown as Prisma.InputJsonValue,
      createdAt: new Date(pack.createdAt)
    }))
  });

  await prisma.packExport.createMany({
    data: mockSnapshot.exports.map((packExport) => ({
      ...packExport,
      createdAt: new Date(packExport.createdAt)
    }))
  });

  await prisma.auditEvent.createMany({
    data: mockSnapshot.auditEvents.map((event) => ({
      ...event,
      metadata: event.metadata as unknown as Prisma.InputJsonValue,
      createdAt: new Date(event.createdAt)
    }))
  });

  console.log("Seeded failure_exchange database with demo snapshot.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
