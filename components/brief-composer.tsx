"use client";

import { startTransition, useState } from "react";
import type { FormEvent } from "react";

export const BriefComposer = () => {
  const [message, setMessage] = useState<string | null>(null);

  const submitBrief = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      domain: formData.get("domain"),
      subcategoryFilters: String(formData.get("subcategories") ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      languageFilters: String(formData.get("languages") ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      requiredSignals: String(formData.get("signals") ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      rightsRequested: String(formData.get("rights") ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      payoutMinUsd: Number(formData.get("payoutMinUsd")),
      payoutMaxUsd: Number(formData.get("payoutMaxUsd")),
      caseLimit: Number(formData.get("caseLimit")),
      acceptanceCriteria: formData.get("acceptanceCriteria"),
      status: "active"
    };

    const request = fetch("/api/domain-briefs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }).then(async (result) => {
      const body = await result.json();
      if (!result.ok) {
        throw new Error(body.error ?? "Brief creation failed");
      }

      setMessage(`Created ${body.brief.id} for ${body.brief.domain}.`);
    }).catch((error: Error) => {
      setMessage(error.message);
    });

    startTransition(() => {
      void request;
    });
  };

  return (
    <form onSubmit={submitBrief} className="grid gap-4 rounded-4xl border border-ink/10 bg-white/90 p-6 shadow-card">
      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-ink/70">Domain</span>
          <select name="domain" defaultValue="devops" className="rounded-2xl border border-ink/15 bg-canvas px-4 py-3">
            <option value="devops">DevOps</option>
            <option value="financial_modeling_code">Financial modeling code</option>
            <option value="backend_debugging">Backend debugging</option>
            <option value="frontend_debugging">Frontend debugging</option>
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-ink/70">Languages</span>
          <input name="languages" defaultValue="python,typescript" className="rounded-2xl border border-ink/15 bg-canvas px-4 py-3" />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-ink/70">Rights requested</span>
          <input name="rights" defaultValue="evaluation,competition" className="rounded-2xl border border-ink/15 bg-canvas px-4 py-3" />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-ink/70">Subcategories</span>
          <input name="subcategories" defaultValue="release automation,deploy rollback" className="rounded-2xl border border-ink/15 bg-canvas px-4 py-3" />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-ink/70">Signals</span>
          <input name="signals" defaultValue="ci_failure,deployment_guardrail" className="rounded-2xl border border-ink/15 bg-canvas px-4 py-3" />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-ink/70">Minimum payout</span>
          <input name="payoutMinUsd" type="number" defaultValue={500} className="rounded-2xl border border-ink/15 bg-canvas px-4 py-3" />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-ink/70">Maximum payout</span>
          <input name="payoutMaxUsd" type="number" defaultValue={900} className="rounded-2xl border border-ink/15 bg-canvas px-4 py-3" />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-ink/70">Case limit</span>
          <input name="caseLimit" type="number" defaultValue={12} className="rounded-2xl border border-ink/15 bg-canvas px-4 py-3" />
        </label>
      </div>
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-ink/70">Acceptance criteria</span>
        <textarea
          name="acceptanceCriteria"
          defaultValue="Needs deterministic repro, accepted human fix, and enough context to benchmark a coding agent safely."
          rows={3}
          className="rounded-3xl border border-ink/15 bg-canvas px-4 py-3"
        />
      </label>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-ink/60">Structured briefs power pricing suggestions and reviewer matching.</p>
        <button type="submit" className="rounded-full bg-sea px-5 py-3 text-sm font-semibold text-canvas">
          Publish brief
        </button>
      </div>
      {message ? <p className="rounded-2xl bg-canvas px-4 py-3 text-sm text-ink/70">{message}</p> : null}
    </form>
  );
};
