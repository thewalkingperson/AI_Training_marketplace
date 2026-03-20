import Link from "next/link";

import { MetricCard } from "@/components/metric-card";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/scholarships/status-pill";
import { getScholarshipSnapshot } from "@/lib/scholarships/mock-store";
import { formatUsd } from "@/lib/utils";

export default function ScholarshipsLandingPage() {
  const snapshot = getScholarshipSnapshot();
  const autoSubmitReady = snapshot.clearances.filter((item) => item.lane === "auto_submit" && item.reviewLevel === "auto").length;
  const needsAction = snapshot.clearances.filter((item) => item.lane === "needs_action").length;
  const wins = snapshot.submissionOutcomes.filter((item) => item.status === "won").length;
  const reviewCases = snapshot.reviewCases.length;

  return (
    <div className="space-y-10">
      <section className="audit-grid-panel grid gap-6 rounded-[2.4rem] bg-surface-container-low px-6 py-8 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-10">
        <div>
          <div className="flex flex-wrap gap-2">
            <StatusPill label="undergrad only" tone="accent" />
            <StatusPill label="private scholarships" tone="success" />
            <StatusPill label="no password custody" tone="warning" />
          </div>
          <p className="mt-6 mono-kicker">Scholarship Agent // greenfield v1</p>
          <h1 className="mt-4 max-w-4xl font-headline text-[3.2rem] italic leading-[0.98] text-on-surface sm:text-[4.4rem]">
            A wins-first <span className="text-primary">scholarship agent</span> for U.S. undergrads.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-on-surface-variant sm:text-lg">
            The agent crawls private scholarships, scores fit, drafts full applications with provenance, submits the
            safe ones in the background, and only bills after eligible direct-to-student awards are verified.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/scholarships/signup" className="ember-button px-6 py-4">
              Start signup
            </Link>
            <Link href="/scholarships/dashboard" className="ghost-button px-6 py-4">
              View student dashboard
            </Link>
            <Link href="/scholarships/admin" className="ghost-button px-6 py-4">
              Open admin console
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          <MetricCard
            label="Auto-submit ready"
            value={`${autoSubmitReady}`}
            detail="Scholarships cleared for direct forms or email submissions without human review."
            tone="primary"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <MetricCard
              label="Needs action"
              value={`${needsAction}`}
              detail="Applications blocked by portal login or explicit approval steps."
            />
            <MetricCard
              label="Wins recorded"
              value={`${wins}`}
              detail="Verified awards appear instantly in the wins-first student experience."
            />
          </div>
          <MetricCard
            label="Review queue"
            value={`${reviewCases}`}
            detail="High-value and ambiguous cases route to human review instead of silent automation."
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <SectionCard title="Operating lanes" eyebrow="Execution policy">
          <div className="grid gap-4">
            <div className="rounded-[1.5rem] bg-surface-container-lowest p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="mono-kicker">Auto-submit lane</p>
                <StatusPill label="low friction" tone="success" />
              </div>
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                Standard web forms and email submissions with no explicit AI ban, no out-of-scope materials, and no
                portal credentials required.
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-surface-container-high p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="mono-kicker">Needs-action lane</p>
                <StatusPill label="student step" tone="warning" />
              </div>
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                The agent still drafts the application, but the student has to finish a portal login or final sponsor
                confirmation step.
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-surface-container-lowest p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="mono-kicker">Track-only lane</p>
                <StatusPill label="blocked by policy" tone="danger" />
              </div>
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                Interviews, recommendation uploads, video submissions, handwritten materials, and applicant-only rules
                are intentionally out of scope for v1 execution.
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Business model guardrails" eyebrow="Fee logic">
          <div className="grid gap-4">
            <div className="rounded-[1.5rem] bg-surface-container-lowest p-5">
              <p className="mono-kicker">No upfront fees</p>
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                The student pays nothing until a direct-to-student unrestricted award is verified and funds clear.
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-surface-container-high p-5">
              <p className="mono-kicker">Strict fee exclusions</p>
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                School-payable, tuition-only, nontransferable, and track-only scholarships can still be won, but they
                never create a billing event.
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-on-surface p-5 text-surface">
              <p className="mono-kicker text-white/60">Default success fee</p>
              <p className="mt-3 font-headline text-4xl italic">{formatUsd(250)}</p>
              <p className="mt-3 text-sm leading-7 text-white/72">Applied only after verified disbursement, capped annually at {formatUsd(1000)}.</p>
            </div>
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
