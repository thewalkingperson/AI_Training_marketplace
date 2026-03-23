import { env } from "@/lib/env";

interface LogMetadata {
  [key: string]: unknown;
}

const emit = (level: "info" | "warn" | "error", message: string, metadata: LogMetadata = {}) => {
  const payload = {
    level,
    message,
    metadata,
    sentryConfigured: Boolean(env.sentryDsn),
    timestamp: new Date().toISOString()
  };

  if (level === "error") {
    console.error(JSON.stringify(payload));
    return;
  }

  if (level === "warn") {
    console.warn(JSON.stringify(payload));
    return;
  }

  console.log(JSON.stringify(payload));
};

export const logInfo = (message: string, metadata?: LogMetadata) => emit("info", message, metadata);

export const logWarn = (message: string, metadata?: LogMetadata) => emit("warn", message, metadata);

export const logError = (message: string, metadata?: LogMetadata) => emit("error", message, metadata);

export const captureException = (error: unknown, metadata?: LogMetadata) => {
  const normalized =
    error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      : {
          message: String(error)
        };

  emit("error", "captured_exception", {
    ...normalized,
    ...metadata
  });
};
