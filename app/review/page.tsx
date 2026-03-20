import { Badge } from "@/components/badge";
import { getChatLogArtifact, getChatLogContent, getChatLogMessages } from "@/lib/chat-logs";
import { getSnapshot } from "@/lib/mock-store";
import { formatUsd } from "@/lib/utils";

const tabs = [
  "pending",
  "approved",
  "rejected",
  "disputes",
  "payouts"
];

export default function ReviewPage() {
  const snapshot = getSnapshot();
  const pendingCases = snapshot.validatedCases.filter((item) => item.reviewStatus === "pending");
  const activeCase = pendingCases[0] ?? snapshot.validatedCases[0];
  const activeSubmission = snapshot.submissions.find((item) => item.id === activeCase?.submissionId);
  const activePricing = snapshot.pricingRecommendations.find((item) => item.caseId === activeCase?.id);
  const activeArtifacts = snapshot.submissionArtifacts.filter((item) => item.submissionId === activeSubmission?.id);
  const activeChatArtifact = getChatLogArtifact(activeArtifacts);
  const activeChatContent = getChatLogContent(activeChatArtifact);
  const activeChatMessages = getChatLogMessages(activeChatArtifact);

  return (
    <div className="space-y-8">
      <div>
        <p className="section-kicker">Reviewer console</p>
        <h1 className="mt-3 font-headline text-[3.25rem] italic leading-[0.98] text-on-surface">
          Mission control for rights, trust, pricing, and sponsor routing.
        </h1>
        <div className="mt-4 flex items-center gap-2">
          <span className="status-dot bg-primary" />
          <p className="mono-kicker">{pendingCases.length} pending reports in queue</p>
        </div>
      </div>

      <nav className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            type="button"
            className={[
              "rounded-full px-5 py-3 font-label text-[0.68rem] font-bold uppercase tracking-[0.16em]",
              index === 0 ? "bg-surface-container-highest text-primary" : "bg-transparent text-on-surface-variant"
            ].join(" ")}
          >
            {tab}
          </button>
        ))}
      </nav>

      <div className="grid gap-6 xl:grid-cols-[0.46fr_0.54fr]">
        <section className="space-y-4">
          {pendingCases.map((caseRecord) => {
            const submission = snapshot.submissions.find((item) => item.id === caseRecord.submissionId);
            return (
              <article
                key={caseRecord.id}
                className={[
                  "rounded-[2rem] p-5",
                  caseRecord.id === activeCase?.id ? "bg-surface-container-highest shadow-card" : "bg-surface-container-low"
                ].join(" ")}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="mono-kicker">{caseRecord.id}</p>
                    <h2 className="mt-3 font-headline text-[2rem] italic leading-tight text-on-surface">
                      {caseRecord.subcategory}
                    </h2>
                  </div>
                  {caseRecord.safetyFlags.length > 0 ? <Badge tone="danger">safety flag</Badge> : <Badge>clean data</Badge>}
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mono-kicker">Rights requested</p>
                    <p className="mt-2 text-sm leading-7 text-on-surface-variant">
                      {[
                        submission?.rights.evaluation ? "commercial evaluation" : null,
                        submission?.rights.competition ? "competition use" : null,
                        submission?.rights.training ? "training review" : null
                      ].filter(Boolean).join(" + ")}
                    </p>
                  </div>
                  <div>
                    <p className="mono-kicker">Reproducibility</p>
                    <p className="mt-2 text-sm leading-7 text-on-surface-variant">
                      {caseRecord.reproStatus === "passed" ? "High confidence" : "Pending validation"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-outline-variant/15 pt-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge>{submission?.language ?? "unknown"}</Badge>
                    <Badge>{submission?.toolName ?? "unknown tool"}</Badge>
                    {submission?.chatLogConsent ? <Badge tone="accent">chat log included</Badge> : null}
                  </div>
                  <button type="button" className="font-label text-[0.68rem] font-bold uppercase tracking-[0.16em] text-primary">
                    Expand detail
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        <aside className="space-y-5">
          <section className="surface-panel rounded-[2rem] p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="section-kicker">Transcript and artifacts</p>
              <Badge tone={activeSubmission?.chatLogConsent ? "accent" : "default"}>
                {activeSubmission?.chatLogConsent ? "consented" : "no transcript"}
              </Badge>
            </div>
            <div className="technical-grid-panel mt-5 rounded-[1.6rem] p-5">
              <p className="font-mono text-xs leading-6 text-on-surface-variant">
                {`"model_id": "${activeSubmission?.modelName}"`}
              </p>
              <p className="font-mono text-xs leading-6 text-on-surface-variant">
                {`"tool_name": "${activeSubmission?.toolName}"`}
              </p>
              <p className="font-mono text-xs leading-6 text-on-surface-variant">
                {`"failure_mode": "${activeCase?.reasonCodes.join(", ")}"`}
              </p>
              <p className="mt-2 font-mono text-xs leading-6 text-on-surface-variant">
                {(activeSubmission?.reproSteps ?? []).join(" | ")}
              </p>
            </div>
            {activeChatMessages.length > 0 ? (
              <div className="mt-5 space-y-3">
                {activeChatMessages.map((message) => (
                  <div key={message.id} className="rounded-[1.4rem] bg-surface-container-low px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Badge tone={message.role === "assistant" ? "accent" : message.role === "tool" ? "warning" : "default"}>
                        {message.toolName ? `${message.role}:${message.toolName}` : message.role}
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-on-surface-variant whitespace-pre-line">
                      {message.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-sm leading-7 text-on-surface-variant">
                No transcript artifact has been provided for this case yet.
              </p>
            )}
            {activeChatContent?.redactionSummary?.length ? (
              <div className="mt-5 rounded-[1.4rem] bg-surface-container-high p-4">
                <p className="mono-kicker">Redaction notes</p>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-on-surface-variant">
                  {activeChatContent.redactionSummary.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>

          <section className="surface-card rounded-[2rem] p-6">
            <p className="section-kicker">Pricing rationale</p>
            <p className="mt-3 font-headline text-4xl italic text-primary">
              {activePricing ? formatUsd(activePricing.suggestedMaxUsd) : "$450"}
            </p>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">
              {activePricing?.llmSummary ?? "Suggested from novelty, reproducibility, and sponsor appetite."}
            </p>
          </section>

          <section className="surface-panel rounded-[2rem] p-6">
            <p className="section-kicker">Review actions</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button type="button" className="ember-button px-5 py-4">
                Approve to archive
              </button>
              <button type="button" className="ghost-button px-5 py-4">
                Reject
              </button>
            </div>
            <div className="mt-5 rounded-[1.6rem] bg-surface-container-low p-4">
              <p className="mono-kicker">Suggested next actions</p>
              <ul className="mt-3 space-y-2 text-sm leading-7 text-on-surface-variant">
                <li>Confirm competition rights.</li>
                <li>Validate the clean repro path.</li>
                <li>Check transcript redactions before sponsor exposure.</li>
                <li>Match to the strongest active brief.</li>
              </ul>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
