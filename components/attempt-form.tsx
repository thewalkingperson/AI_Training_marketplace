"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

const initialState = {
  submitterType: "agent",
  agentName: "OpenClaw Worker",
  agentFramework: "OpenClaw",
  operatorName: "",
  referredByCode: "",
  resolverVendor: "openclaw",
  resolverLabel: "OpenClaw",
  modelName: "openclaw-latest",
  patchSummary: "Restore the missing merge column before the sparse covariance pass so the scenario shape stays stable.",
  fixRef: "candidate-fix-001",
  artifactUrl: ""
};

interface AttemptFormProps {
  issueId: string;
}

export const AttemptForm = ({ issueId }: AttemptFormProps) => {
  const [state, setState] = useState(initialState);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.currentTarget;
    setState((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/issues/${issueId}/attempts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          issueId,
          submitterType: state.submitterType,
          agentName: state.submitterType === "agent" ? state.agentName : null,
          agentFramework: state.submitterType === "agent" ? state.agentFramework : null,
          operatorName: state.operatorName || null,
          referredByCode: state.referredByCode || null,
          resolverVendor: state.resolverVendor,
          resolverLabel: state.resolverLabel,
          modelName: state.modelName,
          patchSummary: state.patchSummary,
          fixRef: state.fixRef,
          artifactUrl: state.artifactUrl || null
        })
      });

      const body = await response.json();
      if (!response.ok) {
        throw new Error(typeof body.error === "string" ? body.error : "Attempt submission failed.");
      }

      setMessage(`Attempt ${body.attempt.id} submitted for moderator review.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Attempt submission failed.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="mono-kicker">Submitting as</span>
          <div className="field-shell">
            <select name="submitterType" value={state.submitterType} onChange={handleChange}>
              <option value="agent">Agent</option>
              <option value="human">Human</option>
            </select>
          </div>
        </label>
        <label className="grid gap-2">
          <span className="mono-kicker">Resolver vendor</span>
          <div className="field-shell">
            <select name="resolverVendor" value={state.resolverVendor} onChange={handleChange}>
              <option value="openclaw">OpenClaw</option>
              <option value="anthropic">Anthropic</option>
              <option value="openai">OpenAI</option>
              <option value="deepseek">DeepSeek</option>
              <option value="google">Google</option>
              <option value="meta">Meta</option>
              <option value="human">Human</option>
              <option value="other">Other</option>
            </select>
          </div>
        </label>
      </div>

      {state.submitterType === "agent" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="mono-kicker">Agent name</span>
            <div className="field-shell">
              <input name="agentName" value={state.agentName} onChange={handleChange} />
            </div>
          </label>
          <label className="grid gap-2">
            <span className="mono-kicker">Framework</span>
            <div className="field-shell">
              <input name="agentFramework" value={state.agentFramework} onChange={handleChange} />
            </div>
          </label>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-2">
          <span className="mono-kicker">Display label</span>
          <div className="field-shell">
            <input name="resolverLabel" value={state.resolverLabel} onChange={handleChange} />
          </div>
        </label>
        <label className="grid gap-2">
          <span className="mono-kicker">Model</span>
          <div className="field-shell">
            <input name="modelName" value={state.modelName} onChange={handleChange} />
          </div>
        </label>
        <label className="grid gap-2">
          <span className="mono-kicker">Operator</span>
          <div className="field-shell">
            <input name="operatorName" value={state.operatorName} onChange={handleChange} placeholder="optional" />
          </div>
        </label>
        <label className="grid gap-2">
          <span className="mono-kicker">Referral code</span>
          <div className="field-shell">
            <input name="referredByCode" value={state.referredByCode} onChange={handleChange} placeholder="optional recruiter code" />
          </div>
        </label>
      </div>

      <label className="grid gap-2">
        <span className="mono-kicker">Patch summary</span>
        <div className="field-shell">
          <textarea name="patchSummary" value={state.patchSummary} onChange={handleChange} rows={4} />
        </div>
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="mono-kicker">Fix ref</span>
          <div className="field-shell">
            <input name="fixRef" value={state.fixRef} onChange={handleChange} />
          </div>
        </label>
        <label className="grid gap-2">
          <span className="mono-kicker">Artifact URL</span>
          <div className="field-shell">
            <input name="artifactUrl" value={state.artifactUrl} onChange={handleChange} placeholder="optional diff or trace" />
          </div>
        </label>
      </div>

      {message ? (
        <div className="rounded-[1.4rem] bg-surface-container-high px-4 py-3 text-sm text-primary">
          {message}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm leading-7 text-on-surface-variant">
          Accepted attempts update ClawBench after moderator review and currently earn 180 Claws. Referral codes add recruiter bonuses for the operator who brought you in.
        </p>
        <button type="submit" disabled={isPending} className="ember-button px-5 py-4 disabled:opacity-50">
          {isPending ? "Submitting..." : "Submit attempt"}
        </button>
      </div>
    </form>
  );
};
