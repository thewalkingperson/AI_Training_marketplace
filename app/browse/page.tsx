import { Badge } from "@/components/badge";
import { SectionCard } from "@/components/section-card";
import { getSnapshot } from "@/lib/mock-store";
import { formatUsd } from "@/lib/utils";

export default function BrowsePage() {
  const snapshot = getSnapshot();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sea">Browse validated cases</p>
        <h1 className="mt-2 text-5xl font-semibold text-ink">Rights-aware cases for evals, competitions, and curated packs</h1>
      </div>
      <div className="grid gap-6">
        {snapshot.validatedCases.map((caseRecord) => {
          const submission = snapshot.submissions.find((item) => item.id === caseRecord.submissionId);
          const recommendation = snapshot.pricingRecommendations.find((item) => item.caseId === caseRecord.id);

          return (
            <SectionCard key={caseRecord.id} title={caseRecord.subcategory} eyebrow={caseRecord.domain.replaceAll("_", " ")}>
              <div className="flex flex-wrap gap-2">
                <Badge tone={caseRecord.reviewStatus === "approved" ? "success" : "warning"}>
                  {caseRecord.reviewStatus}
                </Badge>
                <Badge>{submission?.language ?? "unknown"}</Badge>
                <Badge>{submission?.toolName ?? "unknown tool"}</Badge>
                <Badge>{caseRecord.reasonCodes.join(", ")}</Badge>
              </div>
              <p className="mt-4">
                {submission?.promptSummary}
              </p>
              <div className="mt-5 grid gap-3 md:grid-cols-4">
                <div className="rounded-3xl bg-canvas/70 p-4">
                  <p className="text-xs uppercase tracking-[0.15em] text-ink/45">Novelty</p>
                  <p className="mt-2 text-2xl font-semibold text-ink">{caseRecord.noveltyScore.toFixed(2)}</p>
                </div>
                <div className="rounded-3xl bg-canvas/70 p-4">
                  <p className="text-xs uppercase tracking-[0.15em] text-ink/45">Severity</p>
                  <p className="mt-2 text-2xl font-semibold text-ink">{caseRecord.severity}/5</p>
                </div>
                <div className="rounded-3xl bg-canvas/70 p-4">
                  <p className="text-xs uppercase tracking-[0.15em] text-ink/45">Evaluation</p>
                  <p className="mt-2 text-2xl font-semibold text-ink">{caseRecord.evalEligibility}</p>
                </div>
                <div className="rounded-3xl bg-canvas/70 p-4">
                  <p className="text-xs uppercase tracking-[0.15em] text-ink/45">Suggested band</p>
                  <p className="mt-2 text-2xl font-semibold text-ink">
                    {recommendation ? `${formatUsd(recommendation.suggestedMinUsd)}-${formatUsd(recommendation.suggestedMaxUsd)}` : "Pending"}
                  </p>
                </div>
              </div>
            </SectionCard>
          );
        })}
      </div>
    </div>
  );
}
