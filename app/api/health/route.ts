import { NextResponse } from "next/server";

import { env } from "@/lib/env";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "clawarena_web",
    timestamp: new Date().toISOString(),
    flags: {
      publicWaitlist: env.publicWaitlistEnabled,
      competitions: env.competitionsEnabled
    },
    integrations: {
      databaseConfigured: Boolean(env.databaseUrl),
      githubAuthConfigured: Boolean(env.githubId && env.githubSecret),
      resendConfigured: Boolean(env.resendApiKey),
      turnstileConfigured: Boolean(env.turnstileSiteKey && env.turnstileSecretKey),
      r2Configured: Boolean(env.r2Bucket && env.r2PublicBaseUrl),
      sentryConfigured: Boolean(env.sentryDsn)
    }
  });
}
