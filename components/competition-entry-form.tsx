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

      setMessage(`Entry ${body.entry.id} scored ${body.entry.devScore} on the public split.`);
    }).catch((error: Error) => {
      setMessage(error.message);
    });

    startTransition(() => {
      void request;
    });
  };

  return (
    <form onSubmit={submitEntry} className="surface-panel rounded-[2rem] p-6">
      <p className="section-kicker">Agent config</p>
      <h3 className="mt-3 font-headline text-[2rem] italic leading-tight text-on-surface">
        Submit a prompt stack for managed evaluation.
      </h3>
      <p className="mt-3 text-sm leading-7 text-on-surface-variant">
        The runner executes your config against the sponsor-approved tool policy, then scores it on the public dev slice before holdout review.
      </p>

      <div className="mt-6 grid gap-5">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="mono-kicker">Model ID</span>
            <div className="field-shell">
              <input name="modelId" defaultValue="gpt-4.1" />
            </div>
          </label>
          <label className="grid gap-2">
            <span className="mono-kicker">Allowed tools</span>
            <div className="field-shell">
              <input name="allowedTools" defaultValue="repo_search,terminal,test_runner" />
            </div>
          </label>
        </div>

        <label className="grid gap-2">
          <span className="mono-kicker">System prompt</span>
          <div className="field-shell">
            <textarea
              name="systemPrompt"
              rows={4}
              defaultValue="You are a release engineer who prefers the smallest safe diff and always reruns the failing workflow."
            />
          </div>
        </label>

        <label className="grid gap-2">
          <span className="mono-kicker">Task prompt template</span>
          <div className="field-shell">
            <textarea
              name="taskPromptTemplate"
              rows={4}
              defaultValue="Repair the failure, keep external behavior stable, and explain the regression cause in one paragraph."
            />
          </div>
        </label>

        <div className="grid gap-5 md:grid-cols-4">
          <label className="grid gap-2">
            <span className="mono-kicker">Max turns</span>
            <div className="field-shell">
              <input name="maxTurns" type="number" defaultValue={8} />
            </div>
          </label>
          <label className="grid gap-2">
            <span className="mono-kicker">Temperature</span>
            <div className="field-shell">
              <input name="temperature" type="number" step="0.1" defaultValue={0.2} />
            </div>
          </label>
          <label className="grid gap-2">
            <span className="mono-kicker">Budget limit</span>
            <div className="field-shell">
              <input name="budgetLimitUsd" type="number" defaultValue={15} />
            </div>
          </label>
          <label className="grid gap-2">
            <span className="mono-kicker">Timeout seconds</span>
            <div className="field-shell">
              <input name="timeoutSeconds" type="number" defaultValue={900} />
            </div>
          </label>
        </div>
      </div>

      <div className="mt-6 rounded-[1.6rem] bg-surface-container-high p-5">
        <p className="mono-kicker">Scoring model</p>
        <p className="mt-3 text-sm leading-7 text-on-surface-variant">
          Primary score is solved-case rate. Tie-breakers favor lower cost and lower runtime to reward practical agents, not just brute-force ones.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-7 text-on-surface-variant">
          Public scoring happens immediately. Hidden holdout scoring remains sponsor-controlled.
        </p>
        <button type="submit" className="ember-button px-6 py-4">
          Submit config
        </button>
      </div>

      {message ? (
        <p className="mt-5 rounded-[1.2rem] bg-tertiary-fixed px-4 py-3 text-sm text-tertiary">
          {message}
        </p>
      ) : null}
    </form>
  );
};
