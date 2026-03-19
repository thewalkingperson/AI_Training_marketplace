const parseBoolean = (value: string | undefined, fallback = false) => {
  if (value === undefined) {
    return fallback;
  }

  return value.toLowerCase() === "true";
};

export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  authSecret: process.env.AUTH_SECRET ?? "development-secret",
  databaseUrl: process.env.DATABASE_URL ?? "",
  githubId: process.env.AUTH_GITHUB_ID ?? "",
  githubSecret: process.env.AUTH_GITHUB_SECRET ?? "",
  allowNonCodeArtifacts: parseBoolean(process.env.FEATURE_ALLOW_NON_CODE_ARTIFACTS, false),
  llmPricingModel: process.env.LLM_PRICING_MODEL ?? "gpt-4.1-mini",
  defaultBaseModel: process.env.DEFAULT_BASE_MODEL ?? "gpt-4.1"
};

export const isDemoMode = env.databaseUrl.length === 0;
