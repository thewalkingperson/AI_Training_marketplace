import { PgBoss } from "pg-boss";

import { env, isDemoMode } from "@/lib/env";
import { captureException } from "@/lib/observability";

export const enqueueJob = async <T extends object>(name: string, payload: T) => {
  if (isDemoMode || !env.databaseUrl) {
    return null;
  }

  const boss = new PgBoss(env.databaseUrl);

  try {
    await boss.start();
    const jobId = await boss.send(name, payload);
    return jobId;
  } catch (error) {
    captureException(error, {
      area: "queue.enqueue",
      jobName: name
    });
    throw error;
  } finally {
    await boss.stop();
  }
};
