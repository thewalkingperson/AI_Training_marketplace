import Link from "next/link";

import { Badge } from "@/components/badge";
import { BriefComposer } from "@/components/brief-composer";
import { MetricCard } from "@/components/metric-card";
import { getSnapshot } from "@/lib/mock-store";
import { formatUsd } from "@/lib/utils";

export default function SponsorDashboardPage() {
  const snapshot = getSnapshot();
  const recommendations = snapshot.briefMatches.map((match) => {
    const brief = snapshot.briefs.find((item) => item.id === match.briefId);
    const caseRecord = snapshot.validatedCases.find((item) => item.id === match.caseId);
    const recommendation = snapshot.pricingRecommendations.find((item) => item.caseId === match.caseId);
    const submission = snapshot.submissions.find((item) => item.id === caseRecord?.submissionId);

    return {
      match,
      brief,
      caseRecord,
      recommendation,
      submission
    };
  });

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="surface-panel rounded-[2rem] p-7">
          <p className="section-kicker">Sponsor control center</p>
          <h1 className="mt-3 font-headline text-[3rem] italic leading-[0.98] text-on-surface">
            Structure demand with enough clarity that pricing and matching become legible.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-on-surface-variant">
            Publish domain briefs, review matched cases, inspect pricing confidence, and launch benchmark competitions from one research-ops surface.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge tone="accent">platinum sponsor tier</Badge>
            <Badge tone="success">managed competitions</Badge>
            <Badge>eval + training packs</Badge>
          </div>
        </div>
        <MetricCard
          label="Prize pool allocated"
          value={formatUsd(snapshot.competitions.reduce((sum, item) => sum + item.prizePoolUsd, 0))}
          detail="Competition capital currently live across the benchmark layer."
          tone="primary"
        />
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Active briefs" value={String(snapshot.briefs.filter((item) => item.status === "active").length)} detail="Structured sponsor asks by domain." />
        <MetricCard label="Matched cases" value={String(snapshot.briefMatches.length)} detail="Reviewer-approved recommendations." />
        <MetricCard label="Pack exports" value={String(snapshot.exports.length)} detail="Rights-aware eval and training bundles." />
        <MetricCard label="Competitions" value={String(snapshot.competitions.length)} detail="Public arenas tied to archive supply." />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.58fr_0.42fr]">
        <section className="surface-card rounded-[2rem] p-7">
          <p className="section-kicker">Brief composer</p>
          <h2 className="mt-3 font-headline text-[2.35rem] italic leading-tight text-on-surface">
            Publish a strategic brief, not a vague request for “better data.”
          </h2>
          <p className="mt-4 text-sm leading-7 text-on-surface-variant">
            The tighter the structure, the easier it is for reviewers and the pricing advisor to align supply to your needs.
          </p>
          <div className="mt-6">
            <BriefComposer />
          </div>
        </section>

        <aside className="space-y-5">
          <section className="surface-panel rounded-[2rem] p-6">
            <p className="section-kicker">Pricing advisor</p>
            {snapshot.pricingRecommendations.slice(0, 1).map((recommendation) => (
              <div key={recommendation.id}>
                <p className="mt-3 font-headline text-4xl italic text-primary">
                  {formatUsd(recommendation.suggestedMinUsd)} - {formatUsd(recommendation.suggestedMaxUsd)}
                </p>
                <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                  {recommendation.llmSummary}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {recommendation.reasonCodes.map((code) => (
                    <Badge key={code} tone="accent">{code.replaceAll("_", " ")}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </section>
          <section className="technical-grid-panel rounded-[2rem] p-6">
            <p className="section-kicker">Pack exports</p>
            <div className="mt-4 space-y-3">
              {snapshot.exports.map((packExport) => (
                <div key={packExport.id} className="rounded-[1.3rem] bg-white/70 px-4 py-4">
                  <p className="mono-kicker">{packExport.id}</p>
                  <p className="mt-2 font-label text-[0.68rem] font-bold uppercase tracking-[0.16em] text-on-surface">
                    {packExport.status}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <section className="grid gap-6 xl:grid-cols-[0.64fr_0.36fr]">
        <div className="space-y-4">
          {recommendations.map(({ match, brief, caseRecord, recommendation, submission }) => (
            <article key={match.id} className="surface-card rounded-[2rem] p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="mono-kicker">{brief?.domain.replaceAll("_", " ")}</p>
                  <h2 className="mt-3 font-headline text-[2rem] italic text-on-surface">{caseRecord?.subcategory}</h2>
                </div>
                <Badge tone="success">{match.status.replaceAll("_", " ")}</Badge>
              </div>
              <p className="mt-4 text-sm leading-7 text-on-surface-variant">
                {submission?.promptSummary}
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-[1.4rem] bg-surface-container-low p-4">
                  <p className="mono-kicker">Selected payout</p>
                  <p className="mt-2 font-headline text-3xl italic text-primary">{formatUsd(match.selectedPayoutUsd)}</p>
                </div>
                <div className="rounded-[1.4rem] bg-surface-container-low p-4">
                  <p className="mono-kicker">Pricing confidence</p>
                  <p className="mt-2 font-label text-[0.7rem] font-bold uppercase tracking-[0.16em] text-on-surface">
                    {recommendation ? `${Math.round(recommendation.confidence * 100)}%` : "Pending"}
                  </p>
                </div>
                <div className="rounded-[1.4rem] bg-surface-container-low p-4">
                  <p className="mono-kicker">Why it matches</p>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">{match.reviewerNotes}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="space-y-5">
          <section className="surface-panel rounded-[2rem] p-6">
            <p className="section-kicker">Current competitions</p>
            <div className="mt-5 space-y-4">
              {snapshot.competitions.map((competition) => (
                <div key={competition.id} className="rounded-[1.5rem] bg-surface-container-lowest p-5">
                  <p className="mono-kicker">{competition.status}</p>
                  <h3 className="mt-3 font-headline text-3xl italic text-on-surface">{competition.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-on-surface-variant">{competition.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="font-headline text-3xl italic text-primary">{formatUsd(competition.prizePoolUsd)}</p>
                    <Link href={`/competitions/${competition.slug}`} className="ghost-button px-4 py-3">
                      View arena
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
