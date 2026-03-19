"use client";

import { startTransition, useState } from "react";
import type { FormEvent } from "react";

import { Badge } from "@/components/badge";

const initialPayload = {
  sourceUrl: "https://github.com/acme/service-releases",
  taskUrl: "https://github.com/acme/service-releases/issues/42",
  language: "typescript",
  toolName: "Claude Code",
  modelName: "claude-sonnet",
  promptSummary: "Repair the release workflow without changing publish semantics.",
  failingRef: "c0ffee1",
  fixRef: "c0ffee2",
  reproSteps: "pnpm install\npnpm test\npnpm release:dry-run",
  rights: {
    evaluation: true,
    competition: true,
    training: false
  }
};

export const SubmitForm = () => {
  const [response, setResponse] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    const formData = new FormData(event.currentTarget);

    const payload = {
      sourceUrl: formData.get("sourceUrl"),
      taskUrl: formData.get("taskUrl"),
      language: formData.get("language"),
      toolName: formData.get("toolName"),
      modelName: formData.get("modelName"),
      promptSummary: formData.get("promptSummary"),
      failingRef: formData.get("failingRef"),
      fixRef: formData.get("fixRef"),
      reproSteps: String(formData.get("reproSteps") ?? "")
        .split("\n")
        .map((step) => step.trim())
        .filter(Boolean),
      artifacts: [],
      rights: {
        evaluation: formData.get("evaluation") === "on",
        competition: formData.get("competition") === "on",
        training: formData.get("training") === "on"
      },
      attestations: [
        "The repository is public and safe to review.",
        "I have permission to submit this failure and fix."
      ]
    };

    const request = fetch("/api/submissions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }).then(async (result) => {
      const body = await result.json();
      if (!result.ok) {
        throw new Error(body.error ?? "Submission failed");
      }

      setResponse(`Stored ${body.submission.id} and queued ${body.validatedCase.id} for review.`);
      setIsPending(false);
    }).catch((error: Error) => {
      setResponse(error.message);
      setIsPending(false);
    });

    startTransition(() => {
      void request;
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <Badge tone="accent">Developer-first intake</Badge>
        <Badge tone="warning">Public GitHub repos only</Badge>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-4 rounded-4xl border border-ink/10 bg-white/90 p-6 shadow-card">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink/70">Repository URL</span>
            <input name="sourceUrl" defaultValue={initialPayload.sourceUrl} className="rounded-2xl border border-ink/15 bg-canvas px-4 py-3 outline-none ring-0" />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink/70">Issue or task URL</span>
            <input name="taskUrl" defaultValue={initialPayload.taskUrl} className="rounded-2xl border border-ink/15 bg-canvas px-4 py-3 outline-none ring-0" />
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink/70">Language</span>
            <select name="language" defaultValue={initialPayload.language} className="rounded-2xl border border-ink/15 bg-canvas px-4 py-3">
              <option value="python">Python</option>
              <option value="typescript">TypeScript</option>
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink/70">Tool</span>
            <input name="toolName" defaultValue={initialPayload.toolName} className="rounded-2xl border border-ink/15 bg-canvas px-4 py-3" />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink/70">Model</span>
            <input name="modelName" defaultValue={initialPayload.modelName} className="rounded-2xl border border-ink/15 bg-canvas px-4 py-3" />
          </label>
          <div className="grid gap-2">
            <span className="text-sm font-semibold text-ink/70">Rights</span>
            <div className="flex flex-wrap gap-3 rounded-2xl border border-ink/15 bg-canvas px-4 py-3 text-sm">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" name="evaluation" defaultChecked={initialPayload.rights.evaluation} />
                Eval
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" name="competition" defaultChecked={initialPayload.rights.competition} />
                Competition
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" name="training" defaultChecked={initialPayload.rights.training} />
                Training
              </label>
            </div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink/70">Failing ref</span>
            <input name="failingRef" defaultValue={initialPayload.failingRef} className="rounded-2xl border border-ink/15 bg-canvas px-4 py-3" />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink/70">Fix ref</span>
            <input name="fixRef" defaultValue={initialPayload.fixRef} className="rounded-2xl border border-ink/15 bg-canvas px-4 py-3" />
          </label>
        </div>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-ink/70">Prompt summary</span>
          <textarea
            name="promptSummary"
            defaultValue={initialPayload.promptSummary}
            rows={3}
            className="rounded-3xl border border-ink/15 bg-canvas px-4 py-3"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-ink/70">Repro steps</span>
          <textarea name="reproSteps" defaultValue={initialPayload.reproSteps} rows={4} className="rounded-3xl border border-ink/15 bg-canvas px-4 py-3" />
        </label>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-ink/60">Submissions create a pending validated case and feed the review queue immediately.</p>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-canvas transition hover:bg-sea disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Submitting..." : "Create submission"}
          </button>
        </div>
        {response ? <p className="rounded-2xl bg-canvas px-4 py-3 text-sm text-ink/75">{response}</p> : null}
      </form>
    </div>
  );
};
