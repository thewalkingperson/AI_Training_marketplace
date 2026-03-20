"use client";

import { startTransition, useMemo, useState } from "react";
import type { ChangeEvent } from "react";

import { Badge } from "@/components/badge";
import { parseChatTranscript } from "@/lib/chat-logs";
import { formatUsd } from "@/lib/utils";

const steps = [
  {
    id: "source",
    label: "Source and task",
    subtitle: "Anchor the failure to a public repo and the exact work request."
  },
  {
    id: "refs",
    label: "Failure and fix refs",
    subtitle: "Point to the exact divergence and the accepted human repair."
  },
  {
    id: "prompting",
    label: "Prompt and repro",
    subtitle: "Give reviewers enough context to replay the failure quickly."
  },
  {
    id: "rights",
    label: "Rights and attestations",
    subtitle: "Separate evaluation, competition, and training permissions clearly."
  },
  {
    id: "artifacts",
    label: "Artifacts and sponsor fit",
    subtitle: "Add links that sharpen review, pricing, and sponsor matching."
  },
  {
    id: "review",
    label: "Review and submit",
    subtitle: "Check the archive packet before the case enters validation."
  }
] as const;

const initialState = {
  sourceUrl: "https://github.com/acme/service-releases",
  taskUrl: "https://github.com/acme/service-releases/issues/42",
  language: "typescript",
  toolName: "Claude Code",
  modelName: "claude-sonnet",
  failingRef: "c0ffee1",
  fixRef: "c0ffee2",
  promptSummary: "Repair the release workflow without changing publish semantics.",
  reproSteps: "pnpm install\npnpm test\npnpm release:dry-run",
  artifactUrl: "https://example.com/logs/release-run.log",
  artifactLabel: "Release workflow log",
  artifactType: "log",
  chatTranscript: [
    "user: Repair the release workflow without changing publish order.",
    "assistant: I will inspect the workflow and rerun the dry-run release path first.",
    "tool(shell): pnpm release:dry-run",
    "assistant: The failing branch removes the guard instead of restoring it."
  ].join("\n"),
  chatLogConsent: true,
  evaluation: true,
  competition: true,
  training: false,
  attestationPublic: true,
  attestationRights: true
};

const getPayoutPreview = (language: string, training: boolean) => {
  const base = language === "python" ? [800, 1400] : [550, 900];
  return training ? [base[0] + 150, base[1] + 250] : base;
};

export const SubmitForm = () => {
  const [step, setStep] = useState(0);
  const [state, setState] = useState(initialState);
  const [response, setResponse] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const payoutPreview = useMemo(
    () => getPayoutPreview(state.language, state.training),
    [state.language, state.training],
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = event.currentTarget;
    setState((current) => ({
      ...current,
      [name]: type === "checkbox" ? (event.currentTarget as HTMLInputElement).checked : value
    }));
  };

  const submit = async () => {
    setIsPending(true);
    const transcriptMessages = parseChatTranscript(state.chatTranscript);
    const artifacts = [];

    if (state.artifactUrl) {
      artifacts.push({
        label: state.artifactLabel || "Attached artifact",
        artifactType: state.artifactType as "log" | "diff" | "screenshot" | "trace",
        url: state.artifactUrl
      });
    }

    if (transcriptMessages.length > 0) {
      artifacts.push({
        label: `${state.toolName} transcript`,
        artifactType: "chat_log" as const,
        content: {
          messages: transcriptMessages,
          redactionSummary: [
            "Contributor provided a redacted transcript excerpt for review.",
            "Secrets and proprietary identifiers must be removed before submission."
          ],
          source: "manual_paste"
        }
      });
    }

    const payload = {
      sourceUrl: state.sourceUrl,
      taskUrl: state.taskUrl,
      language: state.language,
      toolName: state.toolName,
      modelName: state.modelName,
      promptSummary: state.promptSummary,
      failingRef: state.failingRef,
      fixRef: state.fixRef,
      reproSteps: state.reproSteps
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      artifacts,
      chatLogConsent: state.chatLogConsent,
      rights: {
        evaluation: state.evaluation,
        competition: state.competition,
        training: state.training
      },
      attestations: [
        state.attestationPublic ? "The repository is public and safe to review." : "",
        state.attestationRights ? "I have permission to submit this failure and fix." : ""
      ].filter(Boolean)
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
        throw new Error(
          typeof body.error === "string" ? body.error : "Submission failed",
        );
      }

      setResponse(`Archived ${body.submission.id}. Validation packet ${body.validatedCase.id} is now queued.`);
      setIsPending(false);
    }).catch((error: Error) => {
      setResponse(error.message);
      setIsPending(false);
    });

    startTransition(() => {
      void request;
    });
  };

  const canAdvance =
    (step === 0 && state.sourceUrl && state.taskUrl && state.toolName && state.modelName) ||
    (step === 1 && state.failingRef && state.fixRef) ||
    (step === 2 && state.promptSummary.length > 20 && state.reproSteps.length > 0) ||
    (step === 3 && state.attestationPublic && state.attestationRights) ||
    (step === 4 && (!state.chatTranscript.trim() || state.chatLogConsent)) ||
    step === 5;

  return (
    <div className="grid gap-6 lg:grid-cols-[0.36fr_0.64fr]">
      <aside className="surface-panel audit-grid-panel rounded-[2rem] p-6">
        <p className="section-kicker">Protocol</p>
        <h2 className="mt-3 font-headline text-[2.5rem] italic leading-[1.02] text-on-surface">
          Submit a failure the way a lab would want to receive it.
        </h2>
        <p className="mt-4 text-sm leading-7 text-on-surface-variant">
          The archive favors clean repros, stable refs, and rights that are explicit instead of implied.
        </p>
        <div className="mt-8 space-y-3">
          {steps.map((item, index) => (
            <div
              key={item.id}
              className={[
                "rounded-[1.4rem] px-4 py-4 transition",
                index === step ? "bg-surface-container-highest" : "bg-transparent"
              ].join(" ")}
            >
              <div className="flex items-center gap-3">
                <span className={index === step ? "status-dot bg-primary" : "status-dot bg-outline/40"} />
                <p className="font-label text-[0.68rem] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                  Step {index + 1}
                </p>
              </div>
              <p className="mt-2 font-headline text-2xl italic text-on-surface">{item.label}</p>
              <p className="mt-1 text-sm leading-6 text-on-surface-variant">{item.subtitle}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-[1.6rem] bg-surface-container-high p-5">
          <p className="mono-kicker">Potential payout band</p>
          <p className="mt-3 font-headline text-4xl italic text-primary">
            {formatUsd(payoutPreview[0])} - {formatUsd(payoutPreview[1])}
          </p>
          <p className="mt-3 text-sm leading-6 text-on-surface-variant">
            Estimated from language, rights scope, and the current sponsor appetite in the archive.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge tone="accent">{state.language}</Badge>
            <Badge tone={state.competition ? "success" : "default"}>competition</Badge>
            <Badge tone={state.training ? "warning" : "default"}>training</Badge>
          </div>
        </div>
      </aside>

      <section className="surface-card rounded-[2rem] p-6 sm:p-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="section-kicker">Step {step + 1} of {steps.length}</p>
            <h3 className="mt-3 font-headline text-[2.35rem] italic leading-tight text-on-surface">
              {steps[step].label}
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-on-surface-variant">
              {steps[step].subtitle}
            </p>
          </div>
          <div className="hidden rounded-full bg-surface-container-low px-4 py-2 md:block">
            <span className="mono-kicker">Archive packet</span>
          </div>
        </div>

        <div className="mt-8 h-1.5 rounded-full bg-surface-container-high">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="mt-8 space-y-6">
          {step === 0 ? (
            <div className="grid gap-5">
              <label className="grid gap-2">
                <span className="mono-kicker">Public GitHub repo</span>
                <div className="field-shell">
                  <input name="sourceUrl" value={state.sourceUrl} onChange={handleChange} />
                </div>
              </label>
              <label className="grid gap-2">
                <span className="mono-kicker">Issue or task URL</span>
                <div className="field-shell">
                  <input name="taskUrl" value={state.taskUrl} onChange={handleChange} />
                </div>
              </label>
              <div className="grid gap-5 md:grid-cols-3">
                <label className="grid gap-2">
                  <span className="mono-kicker">Language</span>
                  <div className="field-shell">
                    <select name="language" value={state.language} onChange={handleChange}>
                      <option value="python">Python</option>
                      <option value="typescript">TypeScript</option>
                    </select>
                  </div>
                </label>
                <label className="grid gap-2">
                  <span className="mono-kicker">Tool</span>
                  <div className="field-shell">
                    <input name="toolName" value={state.toolName} onChange={handleChange} />
                  </div>
                </label>
                <label className="grid gap-2">
                  <span className="mono-kicker">Model</span>
                  <div className="field-shell">
                    <input name="modelName" value={state.modelName} onChange={handleChange} />
                  </div>
                </label>
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="grid gap-5">
              <label className="grid gap-2">
                <span className="mono-kicker">Failure reference</span>
                <div className="field-shell">
                  <input name="failingRef" value={state.failingRef} onChange={handleChange} />
                </div>
                <p className="text-xs text-on-surface-variant">Use a commit SHA, CI run link, or reproducible failing branch.</p>
              </label>
              <label className="grid gap-2">
                <span className="mono-kicker">Resolution reference</span>
                <div className="field-shell">
                  <input name="fixRef" value={state.fixRef} onChange={handleChange} />
                </div>
                <p className="text-xs text-on-surface-variant">Point to the accepted fix, not an abandoned attempt.</p>
              </label>
              <div className="rounded-[1.6rem] bg-surface-container-low p-5">
                <p className="section-kicker">Contributor tip</p>
                <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                  The strongest submissions make the broken state and repaired state feel like two clean snapshots of the same problem.
                </p>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="grid gap-5">
              <label className="grid gap-2">
                <span className="mono-kicker">Prompt summary</span>
                <div className="field-shell">
                  <textarea
                    name="promptSummary"
                    value={state.promptSummary}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>
              </label>
              <label className="grid gap-2">
                <span className="mono-kicker">Reproduction steps</span>
                <div className="field-shell">
                  <textarea
                    name="reproSteps"
                    value={state.reproSteps}
                    onChange={handleChange}
                    rows={6}
                  />
                </div>
              </label>
              <div className="technical-grid-panel rounded-[1.6rem] p-5">
                <p className="mono-kicker">Replay preference</p>
                <p className="mt-3 font-mono text-xs leading-6 text-on-surface-variant">
                  Aim for a one-command repro path whenever possible. Labs reward cases that feel benchmark-ready on first inspection.
                </p>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="grid gap-5">
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { name: "evaluation", label: "Evaluation rights", checked: state.evaluation },
                  { name: "competition", label: "Competition rights", checked: state.competition },
                  { name: "training", label: "Training rights", checked: state.training }
                ].map(({ name, label, checked }) => (
                  <label key={name} className="surface-panel flex items-start gap-3 rounded-[1.6rem] p-5">
                    <input
                      type="checkbox"
                      name={name}
                      checked={Boolean(checked)}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 accent-[color:#a3380f]"
                    />
                    <div>
                      <p className="font-label text-[0.72rem] font-bold uppercase tracking-[0.16em] text-on-surface">
                        {label}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                        {name === "training"
                          ? "Explicitly allow inclusion in training-eligible packs."
                          : "Allow this case to be sold into sponsor workflows for this scope."}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="space-y-4 rounded-[1.6rem] bg-surface-container-low p-5">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="chatLogConsent"
                    checked={state.chatLogConsent}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 accent-[color:#a3380f]"
                  />
                  <span className="text-sm leading-6 text-on-surface-variant">
                    I explicitly allow a redacted transcript excerpt to be stored with this case for reviewer context and sponsor-side evaluation.
                  </span>
                </label>
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="attestationPublic"
                    checked={state.attestationPublic}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 accent-[color:#a3380f]"
                  />
                  <span className="text-sm leading-6 text-on-surface-variant">
                    I confirm the repository is public and does not disclose private credentials or internal code.
                  </span>
                </label>
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="attestationRights"
                    checked={state.attestationRights}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 accent-[color:#a3380f]"
                  />
                  <span className="text-sm leading-6 text-on-surface-variant">
                    I have the rights needed to submit this failure and the accepted fix for marketplace review.
                  </span>
                </label>
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="grid gap-5">
              <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
                <div className="grid gap-5">
                  <label className="grid gap-2">
                    <span className="mono-kicker">Artifact label</span>
                    <div className="field-shell">
                      <input name="artifactLabel" value={state.artifactLabel} onChange={handleChange} />
                    </div>
                  </label>
                  <label className="grid gap-2">
                    <span className="mono-kicker">Artifact URL</span>
                    <div className="field-shell">
                      <input name="artifactUrl" value={state.artifactUrl} onChange={handleChange} />
                    </div>
                  </label>
                  <label className="grid gap-2">
                    <span className="mono-kicker">Artifact type</span>
                    <div className="field-shell">
                      <select name="artifactType" value={state.artifactType} onChange={handleChange}>
                        <option value="log">Log</option>
                        <option value="diff">Diff</option>
                        <option value="trace">Trace</option>
                        <option value="screenshot">Screenshot</option>
                      </select>
                    </div>
                  </label>
                  <label className="grid gap-2">
                    <span className="mono-kicker">Redacted chat transcript</span>
                    <div className="field-shell">
                      <textarea
                        name="chatTranscript"
                        value={state.chatTranscript}
                        onChange={handleChange}
                        rows={8}
                      />
                    </div>
                    <p className="text-xs leading-6 text-on-surface-variant">
                      Paste one turn per line using <span className="font-mono">user:</span>, <span className="font-mono">assistant:</span>, or <span className="font-mono">tool(shell):</span>.
                    </p>
                  </label>
                </div>
                <div className="rounded-[1.6rem] bg-surface-container-high p-5">
                  <p className="section-kicker">Sponsor fit preview</p>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-on-surface-variant">Likely domain</span>
                      <span className="font-label text-[0.68rem] font-bold uppercase tracking-[0.16em] text-on-surface">
                        {state.language === "python" ? "Financial modeling code" : "DevOps"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-on-surface-variant">Competition-ready</span>
                      <span className="font-label text-[0.68rem] font-bold uppercase tracking-[0.16em] text-tertiary">
                        {state.competition ? "Likely yes" : "Not requested"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-on-surface-variant">Review friction</span>
                      <span className="font-label text-[0.68rem] font-bold uppercase tracking-[0.16em] text-primary">
                        Low if repro is clean
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-on-surface-variant">Transcript included</span>
                      <span className="font-label text-[0.68rem] font-bold uppercase tracking-[0.16em] text-on-surface">
                        {parseChatTranscript(state.chatTranscript).length > 0 ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-5 rounded-[1.4rem] bg-surface-container-low p-4">
                    <p className="mono-kicker">Transcript handling</p>
                    <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                      Reviewers see transcript turns only when explicit consent is on. Keep the excerpt tight and redact secrets, emails, or private identifiers before submitting.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {step === 5 ? (
            <div className="grid gap-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.6rem] bg-surface-container-low p-5">
                  <p className="mono-kicker">Case packet</p>
                  <p className="mt-3 font-headline text-3xl italic text-on-surface">{state.toolName} on {state.language}</p>
                  <p className="mt-3 text-sm leading-7 text-on-surface-variant">{state.promptSummary}</p>
                </div>
                <div className="technical-grid-panel rounded-[1.6rem] p-5">
                  <p className="mono-kicker">Validation summary</p>
                  <div className="mt-3 space-y-2 font-mono text-xs leading-6 text-on-surface-variant">
                    <p>FAIL_REF: {state.failingRef}</p>
                    <p>FIX_REF: {state.fixRef}</p>
                    <p>RIGHTS: {state.evaluation ? "E" : "-"} / {state.competition ? "C" : "-"} / {state.training ? "T" : "-"}</p>
                    <p>ARTIFACT: {state.artifactType.toUpperCase()}</p>
                    <p>CHAT_LOG: {parseChatTranscript(state.chatTranscript).length > 0 ? "INCLUDED" : "NONE"}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[1.6rem] bg-surface-container-highest p-5">
                <p className="section-kicker">What happens next</p>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-on-surface-variant">
                  <li>The validation worker replays the failing ref and checks the fix ref.</li>
                  <li>A reviewer approves rights and pricing guidance before any sponsor match.</li>
                  <li>Sponsors see the case only if its rights and domain fit their active briefs.</li>
                </ul>
              </div>
              {response ? (
                <div className="rounded-[1.6rem] bg-tertiary-fixed p-5 text-sm leading-7 text-tertiary">
                  {response}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-outline-variant/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep((current) => Math.max(0, current - 1))}
              disabled={step === 0}
              className="ghost-button px-5 py-3 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Back
            </button>
            <button
              type="button"
              className="ghost-button px-5 py-3"
              onClick={() => setResponse("Draft preserved locally in the current session.")}
            >
              Save draft
            </button>
          </div>
          {step < steps.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((current) => Math.min(steps.length - 1, current + 1))}
              disabled={!canAdvance}
              className="ember-button px-6 py-4 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={isPending}
              className="ember-button px-6 py-4 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isPending ? "Submitting..." : "Submit to archive"}
            </button>
          )}
        </div>
      </section>
    </div>
  );
};
