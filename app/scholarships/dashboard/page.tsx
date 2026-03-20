import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/scholarships/status-pill";
import { getScholarshipSnapshot } from "@/lib/scholarships/mock-store";
import { formatUsd } from "@/lib/utils";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(new Date(value));

export default function ScholarshipDashboardPage() {
  const snapshot = getScholarshipSnapshot();
  const student = snapshot.students.find((item) => item.id === "student_maya")!;
  const outcomes = snapshot.submissionOutcomes.filter((item) => item.studentId === student.id);
  const wins = outcomes.filter((item) => item.status === "won");
  const needsAction = outcomes.filter((item) => item.status === "needs_follow_up");
  const activity = snapshot.activityEvents.filter((item) => item.studentId === student.id);
  const billing = snapshot.billingEvents.filter((item) => item.studentId === student.id);

  return (
    <div className="space-y-8">
      <section className="audit-grid-panel grid gap-6 rounded-[2.4rem] bg-surface-container-low px-6 py-8 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:px-10">
        <div>
          <p className="mono-kicker">Student dashboard</p>
          <h1 className="mt-4 font-headline text-[3.1rem] italic leading-tight text-on-surface">
            Wins first, the full audit trail when you need it.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-on-surface-variant">
            {student.fullName} sees won scholarships, active blockers, and billing status right away. The rest of the
            agent’s work stays available in the activity log without cluttering the main experience.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[1.6rem] bg-surface-container-lowest p-5">
            <p className="mono-kicker">Wins</p>
            <p className="mt-3 font-headline text-4xl italic text-on-surface">{wins.length}</p>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">Verified awards appear here immediately.</p>
          </div>
          <div className="rounded-[1.6rem] bg-surface-container-high p-5">
            <p className="mono-kicker">Needs action</p>
            <p className="mt-3 font-headline text-4xl italic text-on-surface">{needsAction.length}</p>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">Portal logins and review holds surface separately.</p>
          </div>
          <div className="rounded-[1.6rem] bg-surface-container-lowest p-5">
            <p className="mono-kicker">Applications drafted</p>
            <p className="mt-3 font-headline text-4xl italic text-on-surface">
              {snapshot.applicationPackages.filter((item) => item.studentId === student.id).length}
            </p>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">Every essay keeps source-fact provenance.</p>
          </div>
          <div className="rounded-[1.6rem] bg-on-surface p-5 text-surface">
            <p className="mono-kicker text-white/60">Queued billing</p>
            <p className="mt-3 font-headline text-4xl italic">{formatUsd(billing.reduce((sum, item) => sum + item.amountUsd, 0))}</p>
            <p className="mt-3 text-sm leading-7 text-white/72">Only fee-eligible direct awards create billing events.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.98fr]">
        <SectionCard title="Won scholarships" eyebrow="Primary feed">
          <div className="space-y-4">
            {wins.map((win) => {
              const opportunity = snapshot.opportunities.find((item) => item.id === win.opportunityId)!;
              const verification = snapshot.awardVerifications.find((item) => item.outcomeId === win.id);
              const feeEvent = snapshot.billingEvents.find((item) => item.opportunityId === opportunity.id && item.studentId === student.id);

              return (
                <div key={win.id} className="rounded-[1.5rem] bg-surface-container-lowest px-5 py-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="mono-kicker">{opportunity.sponsor}</p>
                      <h3 className="mt-2 font-label text-sm font-bold uppercase tracking-[0.12em] text-on-surface">
                        {opportunity.title}
                      </h3>
                    </div>
                    <StatusPill label={verification?.feeEligible ? "fee eligible" : "no fee"} tone={verification?.feeEligible ? "success" : "neutral"} />
                  </div>
                  <p className="mt-4 text-sm leading-7 text-on-surface-variant">{win.resultSummary}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-on-surface-variant">
                    <span>Award: {formatUsd(opportunity.awardAmountUsd)}</span>
                    <span>Verified: {verification?.fundsCleared ? "Funds cleared" : "Pending clearance"}</span>
                    <span>Billing: {feeEvent ? formatUsd(feeEvent.amountUsd) : "Not billable"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Needs action" eyebrow="Blockers">
          <div className="space-y-4">
            {needsAction.map((outcome) => {
              const opportunity = snapshot.opportunities.find((item) => item.id === outcome.opportunityId)!;
              const attempt = snapshot.submissionAttempts.find((item) => item.id === outcome.submissionAttemptId)!;

              return (
                <div key={outcome.id} className="rounded-[1.5rem] bg-surface-container-high p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="mono-kicker">{opportunity.sponsor}</p>
                      <h3 className="mt-2 font-label text-sm font-bold uppercase tracking-[0.12em] text-on-surface">
                        {opportunity.title}
                      </h3>
                    </div>
                    <StatusPill label={attempt.status === "queued_review" ? "review queue" : "student step"} tone="warning" />
                  </div>
                  <p className="mt-3 text-sm leading-7 text-on-surface-variant">{outcome.resultSummary}</p>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <SectionCard title="Activity log" eyebrow="Full audit">
          <div className="space-y-3">
            {activity.slice(0, 10).map((event) => (
              <div key={event.id} className="rounded-[1.3rem] bg-surface-container-lowest px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <StatusPill
                    label={event.action.replaceAll("_", " ")}
                    tone={
                      event.action === "award_recorded"
                        ? "success"
                        : event.action === "student_action_needed"
                          ? "warning"
                          : event.action === "application_rejected"
                            ? "danger"
                            : "neutral"
                    }
                  />
                  <p className="mono-kicker">{formatDate(event.createdAt)}</p>
                </div>
                <p className="mt-3 text-sm leading-7 text-on-surface-variant">{event.message}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Billing state" eyebrow="Performance fee only">
          <div className="space-y-4">
            {billing.map((event) => {
              const opportunity = snapshot.opportunities.find((item) => item.id === event.opportunityId)!;

              return (
                <div key={event.id} className="rounded-[1.5rem] bg-surface-container-lowest p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="mono-kicker">{opportunity.title}</p>
                      <p className="mt-2 font-headline text-3xl italic text-on-surface">{formatUsd(event.amountUsd)}</p>
                    </div>
                    <StatusPill label={event.status} tone="accent" />
                  </div>
                  <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                    Created only after award verification confirmed a direct-to-student unrestricted payout.
                  </p>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
