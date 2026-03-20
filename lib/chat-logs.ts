import type { ChatLogArtifactContent, ChatLogMessage, ChatLogRole, SubmissionArtifact } from "@/lib/types";

const chatRoles = new Set<ChatLogRole>(["system", "user", "assistant", "tool"]);

const normalizeChatRole = (rawRole: string): ChatLogRole | null => {
  const normalized = rawRole.trim().toLowerCase();
  return chatRoles.has(normalized as ChatLogRole) ? (normalized as ChatLogRole) : null;
};

export const parseChatTranscript = (input: string): ChatLogMessage[] => {
  const messages: ChatLogMessage[] = [];

  for (const rawLine of input.split("\n")) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    const toolMatch = line.match(/^tool(?:\(([^)]+)\))?\s*:\s*(.+)$/i);
    if (toolMatch) {
      messages.push({
        id: crypto.randomUUID(),
        role: "tool",
        toolName: toolMatch[1]?.trim() || null,
        content: toolMatch[2].trim(),
        createdAt: null
      });
      continue;
    }

    const match = line.match(/^(system|user|assistant)\s*:\s*(.+)$/i);
    if (match) {
      const role = normalizeChatRole(match[1]);
      if (!role) {
        continue;
      }

      messages.push({
        id: crypto.randomUUID(),
        role,
        content: match[2].trim(),
        createdAt: null
      });
      continue;
    }

    const currentMessage = messages.at(-1);
    if (currentMessage) {
      currentMessage.content = `${currentMessage.content}\n${line}`;
    }
  }

  return messages;
};

export const getChatLogArtifact = (artifacts: SubmissionArtifact[]) =>
  artifacts.find((artifact) => artifact.artifactType === "chat_log") ?? null;

export const getChatLogContent = (
  artifact: SubmissionArtifact | null | undefined,
): ChatLogArtifactContent | null => {
  if (!artifact?.content || typeof artifact.content !== "object") {
    return null;
  }

  const candidate = artifact.content as {
    messages?: unknown;
    redactionSummary?: unknown;
    source?: unknown;
  };

  if (!Array.isArray(candidate.messages)) {
    return null;
  }

  const messages = candidate.messages.flatMap((message, index) => {
    if (!message || typeof message !== "object") {
      return [];
    }

    const payload = message as {
      id?: unknown;
      role?: unknown;
      content?: unknown;
      toolName?: unknown;
      createdAt?: unknown;
    };

    const role = typeof payload.role === "string" ? normalizeChatRole(payload.role) : null;
    if (!role || typeof payload.content !== "string" || !payload.content.trim()) {
      return [];
    }

    return [
      {
        id: typeof payload.id === "string" ? payload.id : `turn-${index + 1}`,
        role,
        content: payload.content,
        toolName: typeof payload.toolName === "string" ? payload.toolName : null,
        createdAt: typeof payload.createdAt === "string" ? payload.createdAt : null
      } satisfies ChatLogMessage
    ];
  });

  return {
    messages,
    redactionSummary: Array.isArray(candidate.redactionSummary)
      ? candidate.redactionSummary.filter((item): item is string => typeof item === "string")
      : [],
    source: typeof candidate.source === "string" ? candidate.source : undefined
  };
};

export const getChatLogMessages = (artifact: SubmissionArtifact | null | undefined) =>
  getChatLogContent(artifact)?.messages ?? [];
