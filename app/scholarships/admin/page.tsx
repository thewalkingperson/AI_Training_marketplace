import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/scholarships/status-pill";
import { getScholarshipSnapshot } from "@/lib/scholarships/mock-store";

export default function ScholarshipAdminPage() {
  const snapshot = getScholarshipSnapshot();
  const autoSubmit = snapshot.clearances.filter((item) => item.lane === "auto_submit" && item.reviewLevel === "auto").length;
  const needsAction = snapshot.clearances.filter((item) => item.lane === "needs_action").length;
  const trackOnly = snapshot.clearances.filter((item) => item.lane === "track_only").length;

  const jobs = [
    {
      name: "crawl_opportunities",
      status: "healthy",
      detail: `${snapshot.opportunities.filter((item) => item.sourceType === "crawl").length} opportunities ingested from crawling.`
    },
    {
      name: "normalize_and_classify_rules",
      status: "healthy",
      detail: `${snapshot.clearances.length} rule clearances generated with policy reasons.`
    },
    {
      name: "match_student_to_opportunities",
      status: "healthy",
      detail: `${snapshot.matches.length} student-to-opportunity matches scored.`
    },
    {
      name: "compose_application",
      status: "healthy",
      detail: `${snapshot.applicationPackages.length} application packages drafted with essay provenance.`
    },
    {
      name: "submit_application",
      status: "warning",
      detail: `${snapshot.submissionAttempts.filter((item) => item.status === "needs_student_action").length} packages are waiting on a student step.`
    },
    {
      name: "monitor_outcomes",
      status: "healthy",
      detail: `${snapshot.submissionOutcomes.filter((item) => item.status === "won").length} wins and ${snapshot.submissionOutcomes.filter((item) => item.status === "rejected").length} rejections tracked.`
    },
    {
      name: "verify_award",
      status: "healthy",
      detail: `${snapshot.awardVerifications.length} awards verified.`
    },
    {
      name: "create_billing_event",
      status: "healthy",
      detail: `${snapshot.billingEvents.length} billing events created under the fixed-fee policy.`
    }
  ];

  return (
    <div className="space-y-8">
      <section className="surface-panel rounded-[2rem] p-7">
        <p className="section-kicker">Admin review</p>
        <h1 className="mt-4 font-headline text-[3rem] italic leading-tight text-on-surface">
          Human review only where automation gets expensive or ambiguous.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-8 text-on-surface-variant">
          The review console keeps the agent fast on low-risk lanes, then intercepts high-value or unclear applications
          before silent automation can drift outside the operating policy.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <SectionCard title="Policy mix" eyebrow="Clearance distribution">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.5rem] bg-surface-container-lowest p-5">
              <p className="mono-kicker">Auto-submit</p>
              <p className="mt-3 font-headline text-4xl italic text-on-surface">{autoSubmit}</p>
            </div>
            <div className="rounded-[1.5rem] bg-surface-container-high p-5">
              <p className="mono-kicker">Needs action</p>
              <p className="mt-3 font-headline text-4xl italic text-on-surface">{needsAction}</p>
            </div>
            <div className="rounded-[1.5rem] bg-on-surface p-5 text-surface">
              <p className="mono-kicker text-white/60">Track only</p>
              <p className="mt-3 font-headline text-4xl italic">{trackOnly}</p>
            </div>
          </div>
          <div className="mt-5 space-y-4">
            {snapshot.reviewCases.map((reviewCase) => {
              const opportunity = snapshot.opportunities.find((item) => item.id === reviewCase.opportunityId)!;
              const student = snapshot.students.find((item) => item.id === reviewCase.studentId)!;

              return (
                <div key={reviewCase.id} className="rounded-[1.4rem] bg-surface-container-lowest p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="mono-kicker">{student.fullName}</p>
                      <h3 className="mt-2 font-label text-sm font-bold uppercase tracking-[0.12em] text-on-surface">
                        {opportunity.title}
                      </h3>
                    </div>
                    <StatusPill label={reviewCase.reviewStatus} tone="warning" />
                  </div>
                  <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                    Review reason: {reviewCase.reason || "High-value or ambiguous rule bundle."}
                  </p>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Background jobs" eyebrow="Pipeline health">
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.name} className="rounded-[1.4rem] bg-surface-container-lowest p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="mono-kicker">{job.name}</p>
                  <StatusPill label={job.status} tone={job.status === "warning" ? "warning" : "success"} />
                </div>
                <p className="mt-3 text-sm leading-7 text-on-surface-variant">{job.detail}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>

      <SectionCard title="Compliance controls" eyebrow="Launch boundaries">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-[1.4rem] bg-surface-container-lowest p-5">
            <p className="mono-kicker">Age gating</p>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">
              Under 13 is hard-blocked. Under 18 requires a linked parent consent bundle before automation is active.
            </p>
          </div>
          <div className="rounded-[1.4rem] bg-surface-container-high p-5">
            <p className="mono-kicker">No password custody</p>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">
              Portal-required scholarships are drafted and surfaced to the student instead of silently logging in on
              their behalf.
            </p>
          </div>
          <div className="rounded-[1.4rem] bg-surface-container-lowest p-5">
            <p className="mono-kicker">Fee exclusions</p>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">
              School-payable, tuition-only, nontransferable, and track-only wins never create billing events.
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
