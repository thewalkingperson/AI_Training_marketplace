import type { SubmissionArtifact } from "@/lib/types";

const secretPatterns = [
  /gh[pousr]_[A-Za-z0-9_]{20,}/g,
  /AKIA[0-9A-Z]{16}/g,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/g,
  /sk-[A-Za-z0-9]{20,}/g
];

const piiPatterns = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  /\b\d{3}-\d{2}-\d{4}\b/g
];

const inspectText = (value: string, flags: Set<string>) => {
  for (const pattern of secretPatterns) {
    if (pattern.test(value)) {
      flags.add("secret_pattern_detected");
    }
  }

  for (const pattern of piiPatterns) {
    if (pattern.test(value)) {
      flags.add("pii_pattern_detected");
    }
  }
};

export const scanSubmissionContent = (input: {
  promptSummary: string;
  reproSteps: string[];
  artifacts: Array<Pick<SubmissionArtifact, "content" | "url">>;
}) => {
  const flags = new Set<string>();

  inspectText(input.promptSummary, flags);
  input.reproSteps.forEach((step) => inspectText(step, flags));

  for (const artifact of input.artifacts) {
    if (artifact.url) {
      inspectText(artifact.url, flags);
    }

    const messages = artifact.content?.messages ?? [];
    messages.forEach((message) => inspectText(message.content, flags));
  }

  return Array.from(flags);
};
