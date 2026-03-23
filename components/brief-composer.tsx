"use client";

import { startTransition, useState } from "react";
import type { FormEvent } from "react";

import { Badge } from "@/components/badge";

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

      setMessage(`Brief ${body.brief.id} is live for ${body.brief.domain}.`);
    }).catch((error: Error) => {
      setMessage(error.message);
    });

    startTransition(() => {
      void request;
    });
  };

  return (
    <form onSubmit={submitBrief} className="grid gap-6">
      <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-5">
          <label className="grid gap-2">
            <span className="mono-kicker">Domain</span>
            <div className="field-shell">
              <select name="domain" defaultValue="devops">
                <option value="devops">DevOps</option>
                <option value="financial_modeling_code">Financial modeling code</option>
                <option value="backend_debugging">Backend debugging</option>
                <option value="frontend_debugging">Frontend debugging</option>
              </select>
            </div>
          </label>
          <label className="grid gap-2">
            <span className="mono-kicker">Subcategories</span>
            <div className="field-shell">
              <input name="subcategories" defaultValue="release automation,deploy rollback" />
            </div>
          </label>
          <label className="grid gap-2">
            <span className="mono-kicker">Acceptance criteria</span>
            <div className="field-shell">
              <textarea
                name="acceptanceCriteria"
                defaultValue="Needs deterministic repro, accepted human fix, and enough context to benchmark a coding agent safely."
                rows={4}
              />
            </div>
          </label>
        </div>
        <div className="rounded-[1.7rem] bg-surface-container-high p-5">
          <p className="section-kicker">Target lane</p>
          <h3 className="mt-3 font-headline text-3xl italic text-on-surface">Research brief</h3>
          <p className="mt-3 text-sm leading-7 text-on-surface-variant">
            Structure the request tightly enough that reviewers can explain why a case belongs here in one sentence.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge tone="accent">novelty</Badge>
            <Badge tone="default">reproducible</Badge>
            <Badge tone="success">benchmark-ready</Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="mono-kicker">Languages</span>
          <div className="field-shell">
            <input name="languages" defaultValue="python,typescript" />
          </div>
        </label>
        <label className="grid gap-2">
          <span className="mono-kicker">Rights requested</span>
          <div className="field-shell">
            <input name="rights" defaultValue="evaluation" />
          </div>
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr_0.7fr]">
        <label className="grid gap-2">
          <span className="mono-kicker">Signals</span>
          <div className="field-shell">
            <input name="signals" defaultValue="ci_failure,deployment_guardrail" />
          </div>
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="mono-kicker">Min payout</span>
            <div className="field-shell">
              <input name="payoutMinUsd" type="number" defaultValue={500} />
            </div>
          </label>
          <label className="grid gap-2">
            <span className="mono-kicker">Max payout</span>
            <div className="field-shell">
              <input name="payoutMaxUsd" type="number" defaultValue={900} />
            </div>
          </label>
        </div>
        <label className="grid gap-2">
          <span className="mono-kicker">Case limit</span>
          <div className="field-shell">
            <input name="caseLimit" type="number" defaultValue={12} />
          </div>
        </label>
      </div>

      <div className="rounded-[1.7rem] bg-surface-container-low p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm leading-7 text-on-surface-variant">
            Structured briefs feed pricing recommendations and make reviewer matching legible to labs.
          </p>
          <button type="submit" className="ember-button px-6 py-4">
            Deploy research brief
          </button>
        </div>
        {message ? (
          <p className="mt-4 rounded-[1.2rem] bg-tertiary-fixed px-4 py-3 text-sm text-tertiary">
            {message}
          </p>
        ) : null}
      </div>
    </form>
  );
};
