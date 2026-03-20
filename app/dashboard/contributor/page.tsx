import { Badge } from "@/components/badge";
import { MetricCard } from "@/components/metric-card";
import { getSnapshot } from "@/lib/mock-store";
import { formatUsd } from "@/lib/utils";

export default function ContributorDashboardPage() {
  const snapshot = getSnapshot();
  const mySubmissions = snapshot.submissions.filter((item) => item.contributorId === "usr_contrib_1");
  const myCases = snapshot.validatedCases.filter((item) =>
    mySubmissions.some((submission) => submission.id === item.submissionId),
  );
  const myMatches = snapshot.briefMatches.filter((match) =>
    myCases.some((caseRecord) => caseRecord.id === match.caseId),
  );
  const payoutReady = myMatches.reduce((sum, match) => sum + match.selectedPayoutUsd, 0);
  const activity = snapshot.auditEvents.filter((event) => event.actorId === "usr_contrib_1" || event.entityId.startsWith("case_"));

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="surface-panel rounded-[2rem] p-7">
          <p className="section-kicker">Contributor archive</p>
          <h1 className="mt-3 font-headline text-[3rem] italic leading-[0.98] text-on-surface">
            Your submissions, rights posture, and sponsor visibility in one place.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-on-surface-variant">
            Track each case from validation through pricing, review, and sponsor matching without losing the technical thread.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge tone="accent">public repo specialist</Badge>
            <Badge tone="success">competition-enabled</Badge>
          </div>
        </div>
        <MetricCard
          label="Payout-ready value"
          value={formatUsd(payoutReady)}
          detail="Matched cases already aligned to active sponsor briefs."
          tone="primary"
        />
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Submissions" value={String(mySubmissions.length)} detail="Total archive packets you have filed." />
        <MetricCard label="Approved" value={String(myCases.filter((item) => item.reviewStatus === "approved").length)} detail="Cases ready for sponsor use." />
        <MetricCard label="Competition rights" value={String(mySubmissions.filter((item) => item.rights.competition).length)} detail="Eligible for sponsored arenas." />
        <MetricCard label="Matches" value={String(myMatches.length)} detail="Reviewer-approved brief matches so far." />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.66fr_0.34fr]">
        <section className="space-y-4">
          {myCases.map((caseRecord) => {
            const submission = mySubmissions.find((item) => item.id === caseRecord.submissionId);
            const match = myMatches.find((item) => item.caseId === caseRecord.id);
            const recommendation = snapshot.pricingRecommendations.find((item) => item.caseId === caseRecord.id);

            return (
              <article key={caseRecord.id} className="surface-card rounded-[2rem] p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="mono-kicker">{submission?.sourceUrl.replace("https://github.com/", "")}</p>
                    <h2 className="mt-3 font-headline text-[2rem] italic text-on-surface">{caseRecord.subcategory}</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone={caseRecord.reviewStatus === "approved" ? "success" : "warning"}>{caseRecord.reviewStatus}</Badge>
                    {submission?.rights.competition ? <Badge tone="accent">competition</Badge> : null}
                    {submission?.rights.training ? <Badge tone="warning">training</Badge> : null}
                  </div>
                </div>

                <p className="mt-4 text-sm leading-7 text-on-surface-variant">{submission?.promptSummary}</p>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <div className="rounded-[1.4rem] bg-surface-container-low p-4">
                    <p className="mono-kicker">Suggested pricing</p>
                    <p className="mt-2 font-headline text-3xl italic text-primary">
                      {recommendation
                        ? `${formatUsd(recommendation.suggestedMinUsd)}-${formatUsd(recommendation.suggestedMaxUsd)}`
                        : "Pending"}
                    </p>
                  </div>
                  <div className="rounded-[1.4rem] bg-surface-container-low p-4">
                    <p className="mono-kicker">Sponsor match</p>
                    <p className="mt-2 font-label text-[0.7rem] font-bold uppercase tracking-[0.16em] text-on-surface">
                      {match ? formatUsd(match.selectedPayoutUsd) : "No active match"}
                    </p>
                  </div>
                  <div className="rounded-[1.4rem] bg-surface-container-low p-4">
                    <p className="mono-kicker">Rights summary</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {submission?.rights.evaluation ? <Badge tone="accent">eval</Badge> : null}
                      {submission?.rights.competition ? <Badge tone="success">competition</Badge> : null}
                      {submission?.rights.training ? <Badge tone="warning">training</Badge> : null}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <aside className="space-y-5">
          <section className="surface-panel rounded-[2rem] p-6">
            <p className="section-kicker">Activity feed</p>
            <div className="mt-5 space-y-4">
              {activity.slice(0, 5).map((event) => (
                <div key={event.id} className="flex gap-3">
                  <span className="mt-2 status-dot bg-primary" />
                  <div>
                    <p className="font-label text-[0.68rem] font-bold uppercase tracking-[0.16em] text-on-surface">
                      {event.action.replaceAll(".", " ")}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-on-surface-variant">{event.entityId}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="technical-grid-panel rounded-[2rem] p-6">
            <p className="section-kicker">Validation stance</p>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">
              Cases with tight repro steps and explicit competition rights move fastest through review and into sponsor briefs.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
