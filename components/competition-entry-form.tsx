"use client";

import { startTransition, useState } from "react";
import type { FormEvent } from "react";

interface CompetitionEntryFormProps {
  competitionId: string;
}

export const CompetitionEntryForm = ({ competitionId }: CompetitionEntryFormProps) => {
  const [message, setMessage] = useState<string | null>(null);

  const submitEntry = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      agentConfig: {
        modelId: formData.get("modelId"),
        systemPrompt: formData.get("systemPrompt"),
        taskPromptTemplate: formData.get("taskPromptTemplate"),
        allowedTools: String(formData.get("allowedTools") ?? "")
          .split(",")
          .map((tool) => tool.trim())
          .filter(Boolean),
        maxTurns: Number(formData.get("maxTurns")),
        temperature: Number(formData.get("temperature")),
        budgetLimitUsd: Number(formData.get("budgetLimitUsd")),
        timeoutSeconds: Number(formData.get("timeoutSeconds"))
      }
    };

    const request = fetch(`/api/competitions/${competitionId}/entries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }).then(async (result) => {
      const body = await result.json();
      if (!result.ok) {
        throw new Error(body.error ?? "Competition entry failed");
      }

      setMessage(`Scored ${body.entry.id} with a dev score of ${body.entry.devScore}.`);
    }).catch((error: Error) => {
      setMessage(error.message);
    });

    startTransition(() => {
      void request;
    });
  };

  return (
    <form onSubmit={submitEntry} className="grid gap-4 rounded-4xl border border-ink/10 bg-white/90 p-6 shadow-card">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-ink/70">Model</span>
          <input name="modelId" defaultValue="gpt-4.1" className="rounded-2xl border border-ink/15 bg-canvas px-4 py-3" />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-ink/70">Allowed tools</span>
          <input name="allowedTools" defaultValue="repo_search,terminal,test_runner" className="rounded-2xl border border-ink/15 bg-canvas px-4 py-3" />
        </label>
      </div>
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-ink/70">System prompt</span>
        <textarea
          name="systemPrompt"
          rows={3}
          defaultValue="You are a release engineer who prefers the smallest safe diff and always reruns the failing workflow."
          className="rounded-3xl border border-ink/15 bg-canvas px-4 py-3"
        />
      </label>
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-ink/70">Task prompt template</span>
        <textarea
          name="taskPromptTemplate"
          rows={3}
          defaultValue="Repair the failure, keep external behavior stable, and explain the regression cause in one paragraph."
          className="rounded-3xl border border-ink/15 bg-canvas px-4 py-3"
        />
      </label>
      <div className="grid gap-4 md:grid-cols-4">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-ink/70">Max turns</span>
          <input name="maxTurns" type="number" defaultValue={8} className="rounded-2xl border border-ink/15 bg-canvas px-4 py-3" />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-ink/70">Temperature</span>
          <input name="temperature" type="number" step="0.1" defaultValue={0.2} className="rounded-2xl border border-ink/15 bg-canvas px-4 py-3" />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-ink/70">Budget cap</span>
          <input name="budgetLimitUsd" type="number" defaultValue={15} className="rounded-2xl border border-ink/15 bg-canvas px-4 py-3" />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-ink/70">Timeout seconds</span>
          <input name="timeoutSeconds" type="number" defaultValue={900} className="rounded-2xl border border-ink/15 bg-canvas px-4 py-3" />
        </label>
      </div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-ink/60">Entries are executed by the managed runner against the sponsor-approved tool policy.</p>
        <button type="submit" className="rounded-full bg-ember px-5 py-3 text-sm font-semibold text-canvas">
          Submit config
        </button>
      </div>
      {message ? <p className="rounded-2xl bg-canvas px-4 py-3 text-sm text-ink/70">{message}</p> : null}
    </form>
  );
};
