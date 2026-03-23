import { prisma } from "@/lib/db";
import { isDemoMode } from "@/lib/env";

const inMemoryBuckets = new Map<string, { count: number; expiresAt: number }>();

interface RateLimitInput {
  key: string;
  scope: string;
  limit: number;
  windowMinutes: number;
}

export class RateLimitError extends Error {
  constructor(message = "Too many requests. Please try again in a few minutes.") {
    super(message);
    this.name = "RateLimitError";
  }
}

const getWindowStart = (windowMinutes: number) => {
  const now = new Date();
  const roundedMinutes = Math.floor(now.getUTCMinutes() / windowMinutes) * windowMinutes;

  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      roundedMinutes,
      0,
      0,
    ),
  );
};

export const getRequestKey = (request: Request) => {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "anonymous";
  }

  return request.headers.get("x-real-ip") ?? "anonymous";
};

export const enforceRateLimit = async ({ key, scope, limit, windowMinutes }: RateLimitInput) => {
  const normalizedKey = `${scope}:${key}`;
  const now = Date.now();

  if (isDemoMode) {
    const current = inMemoryBuckets.get(normalizedKey);
    if (!current || current.expiresAt <= now) {
      inMemoryBuckets.set(normalizedKey, {
        count: 1,
        expiresAt: now + windowMinutes * 60_000
      });
      return;
    }

    current.count += 1;
    if (current.count > limit) {
      throw new RateLimitError();
    }

    inMemoryBuckets.set(normalizedKey, current);
    return;
  }

  const windowStart = getWindowStart(windowMinutes);
  const record = await prisma.rateLimitEvent.upsert({
    where: {
      key_scope_windowStart: {
        key,
        scope,
        windowStart
      }
    },
    create: {
      key,
      scope,
      windowStart,
      count: 1
    },
    update: {
      count: {
        increment: 1
      }
    }
  });

  if (record.count > limit) {
    throw new RateLimitError();
  }
};
