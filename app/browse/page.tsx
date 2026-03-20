import { Badge } from "@/components/badge";
import { getChatLogArtifact, getChatLogContent, getChatLogMessages } from "@/lib/chat-logs";
import { getSnapshot } from "@/lib/mock-store";
import { formatUsd } from "@/lib/utils";

const filterGroups = [
  {
    title: "Domain",
    values: ["devops", "financial_modeling_code", "backend_debugging"]
  },
  {
    title: "Rights",
    values: ["evaluation", "competition", "training"]
  },
  {
    title: "Eligibility",
    values: ["approved", "pending", "competition-ready"]
  }
];

export default function BrowsePage() {
  const snapshot = getSnapshot();
  const selectedCase = snapshot.validatedCases[0];
  const selectedSubmission = snapshot.submissions.find((item) => item.id === selectedCase?.submissionId);
  const selectedPricing = snapshot.pricingRecommendations.find((item) => item.caseId === selectedCase?.id);
  const selectedReview = snapshot.reviews.find((item) => item.caseId === selectedCase?.id);
  const selectedArtifacts = snapshot.submissionArtifacts.filter((item) => item.submissionId === selectedSubmission?.id);
  const selectedChatArtifact = getChatLogArtifact(selectedArtifacts);
  const selectedChatContent = getChatLogContent(selectedChatArtifact);
  const selectedChatMessages = getChatLogMessages(selectedChatArtifact);

  return (
    <div className="space-y-8">
      <div className="max-w-4xl">
        <p className="section-kicker">Validated archive</p>
        <h1 className="mt-3 font-headline text-[3.5rem] italic leading-[0.98] text-on-surface">
          Browse rights-aware cases like a benchmark analyst, not a spreadsheet clerk.
        </h1>
        <p className="mt-4 text-base leading-8 text-on-surface-variant">
          Search the archive by signal, rights, eligibility, model, or sponsor fit. Every case keeps its repro path, review notes, and payout rationale close at hand.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.28fr_0.44fr_0.28fr]">
        <aside className="surface-panel rounded-[2rem] p-6 xl:sticky xl:top-28 xl:h-fit">
          <p className="section-kicker">Filters</p>
          <div className="mt-4 field-shell">
            <input defaultValue="typescript release automation" aria-label="Search cases" />
          </div>
          <div className="mt-6 space-y-5">
            {filterGroups.map((group) => (
              <div key={group.title}>
                <p className="mono-kicker">{group.title}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {group.values.map((value) => (
                    <Badge key={value} tone={value === "competition" ? "accent" : "default"}>
                      {value.replaceAll("_", " ")}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-[1.5rem] bg-surface-container-high p-5">
            <p className="mono-kicker">Search stance</p>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">
              Use filters like a research brief: start from domain and rights, then tighten by signals and payout appetite.
            </p>
          </div>
        </aside>

        <section className="space-y-4">
          {snapshot.validatedCases.map((caseRecord) => {
            const submission = snapshot.submissions.find((item) => item.id === caseRecord.submissionId);
            const recommendation = snapshot.pricingRecommendations.find((item) => item.caseId === caseRecord.id);
            const artifacts = snapshot.submissionArtifacts.filter((item) => item.submissionId === submission?.id);
            const chatLogArtifact = getChatLogArtifact(artifacts);

            return (
              <article key={caseRecord.id} className="surface-card rounded-[2rem] px-5 py-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-xl">
                    <p className="mono-kicker">{submission?.sourceUrl.replace("https://github.com/", "")}</p>
                    <h2 className="mt-3 font-headline text-[2rem] italic leading-tight text-on-surface">
                      {caseRecord.subcategory}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                      {submission?.promptSummary}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="mono-kicker">Suggested payout</p>
                    <p className="mt-3 font-headline text-3xl italic text-primary">
                      {recommendation ? `${formatUsd(recommendation.suggestedMinUsd)}-${formatUsd(recommendation.suggestedMaxUsd)}` : "Pending"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Badge tone={caseRecord.reviewStatus === "approved" ? "success" : "warning"}>{caseRecord.reviewStatus}</Badge>
                  <Badge>{caseRecord.domain.replaceAll("_", " ")}</Badge>
                  <Badge>{submission?.language ?? "unknown"}</Badge>
                  <Badge>{submission?.toolName ?? "unknown tool"}</Badge>
                  {submission?.rights.evaluation ? <Badge tone="accent">eval</Badge> : null}
                  {submission?.rights.competition ? <Badge tone="success">competition</Badge> : null}
                  {submission?.rights.training ? <Badge tone="warning">training</Badge> : null}
                  {chatLogArtifact ? <Badge tone="accent">chat transcript</Badge> : null}
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-4">
                  <div className="rounded-[1.3rem] bg-surface-container-low p-4">
                    <p className="mono-kicker">Novelty</p>
                    <p className="mt-2 font-headline text-3xl italic text-on-surface">{caseRecord.noveltyScore.toFixed(2)}</p>
                  </div>
                  <div className="rounded-[1.3rem] bg-surface-container-low p-4">
                    <p className="mono-kicker">Severity</p>
                    <p className="mt-2 font-headline text-3xl italic text-on-surface">{caseRecord.severity}/5</p>
                  </div>
                  <div className="rounded-[1.3rem] bg-surface-container-low p-4">
                    <p className="mono-kicker">Signals</p>
                    <p className="mt-2 font-label text-[0.68rem] font-bold uppercase tracking-[0.16em] text-on-surface">
                      {caseRecord.reasonCodes.join(", ")}
                    </p>
                  </div>
                  <div className="rounded-[1.3rem] bg-surface-container-low p-4">
                    <p className="mono-kicker">Eligibility</p>
                    <p className="mt-2 font-label text-[0.68rem] font-bold uppercase tracking-[0.16em] text-tertiary">
                      {caseRecord.competitionEligibility}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <aside className="surface-panel rounded-[2rem] p-6 xl:sticky xl:top-28 xl:h-fit">
          <p className="section-kicker">Archive packet</p>
          <h2 className="mt-3 font-headline text-[2rem] italic leading-tight text-on-surface">
            {selectedCase?.subcategory}
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone="accent">{selectedCase?.domain.replaceAll("_", " ")}</Badge>
            <Badge>{selectedSubmission?.modelName}</Badge>
          </div>

          <div className="technical-grid-panel mt-6 rounded-[1.6rem] p-4">
            <p className="mono-kicker">Replay path</p>
            <div className="mt-3 space-y-2 font-mono text-xs leading-6 text-on-surface-variant">
              {(selectedSubmission?.reproSteps ?? []).map((step) => (
                <p key={step}>{step}</p>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-[1.6rem] bg-surface-container-low p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="mono-kicker">Transcript excerpt</p>
              <span className="font-label text-[0.68rem] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                {selectedSubmission?.chatLogConsent ? "consented" : "not included"}
              </span>
            </div>
            {selectedChatMessages.length > 0 ? (
              <div className="mt-4 space-y-3">
                {selectedChatMessages.slice(0, 4).map((message) => (
                  <div key={message.id} className="rounded-[1.2rem] bg-surface-container-high px-4 py-3">
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
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                No transcript excerpt is attached to this archive packet.
              </p>
            )}
            {selectedChatContent?.redactionSummary?.length ? (
              <div className="mt-4">
                <p className="mono-kicker">Redaction notes</p>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-on-surface-variant">
                  {selectedChatContent.redactionSummary.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="mt-5 rounded-[1.6rem] bg-surface-container-lowest p-4">
            <p className="mono-kicker">Review notes</p>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">
              {selectedReview?.notes ?? "No reviewer notes recorded yet."}
            </p>
          </div>

          <div className="mt-5 rounded-[1.6rem] bg-surface-container-high p-4">
            <p className="mono-kicker">Pricing rationale</p>
            <p className="mt-3 font-headline text-3xl italic text-primary">
              {selectedPricing ? formatUsd(selectedPricing.suggestedMaxUsd) : "Pending"}
            </p>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">
              {selectedPricing?.llmSummary ?? "Recommendation will appear after review and signal tagging."}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
