import { createBoss } from "@/worker/boss";
import type {
  ExportPackPayload,
  PriceCasePayload,
  ScoreCompetitionEntryPayload,
  UpdatePayoutPayload,
  ValidateSubmissionPayload
} from "@/worker/contracts";
import { jobNames } from "@/worker/contracts";
import { handleExportPack } from "@/worker/jobs/export-pack";
import { handlePriceCase } from "@/worker/jobs/price-case";
import { handleScoreCompetitionEntry } from "@/worker/jobs/score-competition-entry";
import { handleUpdatePayoutStatus } from "@/worker/jobs/update-payout-status";
import { handleValidateSubmission } from "@/worker/jobs/validate-submission";

const firstJob = <T>(jobs: Array<{ data: T }>) => {
  const [job] = jobs;
  if (!job) {
    throw new Error("pg-boss delivered an empty job batch.");
  }

  return job.data;
};

async function main() {
  const boss = createBoss();
  await boss.start();

  await boss.work(jobNames.validateSubmission, async (jobs) =>
    handleValidateSubmission(firstJob<ValidateSubmissionPayload>(jobs as Array<{ data: ValidateSubmissionPayload }>)),
  );
  await boss.work(jobNames.priceCase, async (jobs) =>
    handlePriceCase(firstJob<PriceCasePayload>(jobs as Array<{ data: PriceCasePayload }>)),
  );
  await boss.work(jobNames.scoreCompetitionEntry, async (jobs) =>
    handleScoreCompetitionEntry(
      firstJob<ScoreCompetitionEntryPayload>(jobs as Array<{ data: ScoreCompetitionEntryPayload }>),
    ),
  );
  await boss.work(jobNames.exportPack, async (jobs) =>
    handleExportPack(firstJob<ExportPackPayload>(jobs as Array<{ data: ExportPackPayload }>)),
  );
  await boss.work(jobNames.updatePayoutStatus, async (jobs) =>
    handleUpdatePayoutStatus(firstJob<UpdatePayoutPayload>(jobs as Array<{ data: UpdatePayoutPayload }>)),
  );

  console.log("failure_exchange worker online");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
