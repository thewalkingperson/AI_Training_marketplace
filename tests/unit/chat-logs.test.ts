import { describe, expect, test } from "vitest";

import { getChatLogMessages, parseChatTranscript } from "@/lib/chat-logs";

describe("chat log helpers", () => {
  test("parses line-based transcript input into structured messages", () => {
    const messages = parseChatTranscript(
      [
        "system: Preserve the existing release contract.",
        "user: Repair the broken deploy gate.",
        "assistant: I will replay the failure first.",
        "tool(shell): pnpm test"
      ].join("\n"),
    );

    expect(messages).toHaveLength(4);
    expect(messages[0]?.role).toBe("system");
    expect(messages[3]?.toolName).toBe("shell");
  });

  test("extracts valid transcript turns from chat_log artifacts", () => {
    const messages = getChatLogMessages({
      id: "artifact_1",
      submissionId: "submission_1",
      label: "Transcript",
      artifactType: "chat_log",
      content: {
        messages: [
          {
            id: "turn_1",
            role: "user",
            content: "Repair the loader."
          },
          {
            id: "turn_2",
            role: "assistant",
            content: "I will check the sparse matrix coercion path."
          }
        ]
      }
    });

    expect(messages.map((message) => message.role)).toEqual(["user", "assistant"]);
  });
});
