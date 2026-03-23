const parseBoolean = (value: string | undefined, fallback = false) => {
  if (value === undefined) {
    return fallback;
  }

  return value.toLowerCase() === "true";
};

const parseList = (value: string | undefined) =>
  (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  authSecret: process.env.AUTH_SECRET ?? "development-secret",
  databaseUrl: process.env.DATABASE_URL ?? "",
  githubId: process.env.AUTH_GITHUB_ID ?? "",
  githubSecret: process.env.AUTH_GITHUB_SECRET ?? "",
  allowNonCodeArtifacts: parseBoolean(process.env.FEATURE_ALLOW_NON_CODE_ARTIFACTS, false),
  publicWaitlistEnabled: parseBoolean(process.env.FEATURE_PUBLIC_WAITLIST, true),
  competitionsEnabled: parseBoolean(process.env.FEATURE_COMPETITIONS, false),
  llmPricingModel: process.env.LLM_PRICING_MODEL ?? "gpt-4.1-mini",
  defaultBaseModel: process.env.DEFAULT_BASE_MODEL ?? "gpt-4.1",
  adminEmails: parseList(process.env.ADMIN_EMAILS),
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  resendFromEmail: process.env.RESEND_FROM_EMAIL ?? "ClawArena <noreply@example.com>",
  resendAdminInbox: parseList(process.env.RESEND_ADMIN_INBOX),
  turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "",
  turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY ?? "",
  r2Bucket: process.env.R2_BUCKET ?? "",
  r2PublicBaseUrl: process.env.R2_PUBLIC_BASE_URL ?? "",
  sentryDsn: process.env.SENTRY_DSN ?? ""
};

export const isDemoMode = env.databaseUrl.length === 0;
