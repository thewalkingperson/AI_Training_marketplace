import { PgBoss } from "pg-boss";

import { env } from "@/lib/env";

export const createBoss = () => {
  if (!env.databaseUrl) {
    throw new Error("DATABASE_URL is required to run the pg-boss worker.");
  }

  return new PgBoss(env.databaseUrl);
};
