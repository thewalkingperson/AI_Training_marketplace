import { env } from "@/lib/env";

interface TurnstileResponse {
  success: boolean;
  "error-codes"?: string[];
}

export const verifyTurnstileToken = async (token: string | null | undefined, ip?: string | null) => {
  if (!env.turnstileSecretKey) {
    return {
      success: true,
      skipped: true
    };
  }

  if (!token) {
    return {
      success: false,
      skipped: false,
      reason: "missing_token"
    };
  }

  const body = new URLSearchParams({
    secret: env.turnstileSecretKey,
    response: token
  });

  if (ip) {
    body.set("remoteip", ip);
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: body.toString(),
    cache: "no-store"
  });

  const result = (await response.json()) as TurnstileResponse;
  return {
    success: Boolean(result.success),
    skipped: false,
    reason: result["error-codes"]?.join(",") ?? null
  };
};
