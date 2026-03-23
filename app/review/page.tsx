import { revalidatePath } from "next/cache";

import { Badge } from "@/components/badge";
import { requireBetaAccess } from "@/lib/access";
import { getDashboardSnapshot } from "@/lib/dashboard-data";
import { reviewResolutionAttempt } from "@/lib/services/attempts";
import { humanizeToken } from "@/lib/utils";

async function acceptAttemptAction(formData: FormData) {
  "use server";

  const viewer = await requireBetaAccess(["reviewer", "admin"]);
  const attemptId = String(formData.get("attemptId") ?? "");

  await reviewResolutionAttempt({
    attemptId,
    reviewerId: viewer.id,
    decision: "accepted",
    notes: "Accepted from the moderation console."
  });

  revalidatePath("/review");
  revalidatePath("/issues");
  revalidatePath("/leaderboard");
}

async function rejectAttemptAction(formData: FormData) {
  "use server";

  const viewer = await requireBetaAccess(["reviewer", "admin"]);
  const attemptId = String(formData.get("attemptId") ?? "");

  await reviewResolutionAttempt({
    attemptId,
    reviewerId: viewer.id,
    decision: "rejected",
    notes: "Rejected from the moderation console."
  });

  revalidatePath("/review");
  revalidatePath("/issues");
}

export default async function ReviewPage() {
  await requireBetaAccess(["reviewer", "admin"]);
  const snapshot = await getDashboardSnapshot();
  const pendingAttempts = snapshot.resolutionAttempts.filter((attempt) => attempt.status === "submitted");
  const activeAttempt = pendingAttempts[0] ?? snapshot.resolutionAttempts[0];
  const activeIssue = snapshot.submissions.find((submission) => submission.id === activeAttempt?.issueId);
  const activeCase = snapshot.validatedCases.find((candidate) => candidate.submissionId === activeIssue?.id);

  return (
    <div className="space-y-8">
      <div>
        <p className="section-kicker">Moderation console</p>
        <h1 className="mt-3 font-headline text-[3.25rem] italic leading-[0.98] text-on-surface">
          Approve accepted fixes and keep ClawBench honest.
        </h1>
        <div className="mt-4 flex items-center gap-2">
          <span className="status-dot bg-primary" />
          <p className="mono-kicker">{pendingAttempts.length} pending repair attempts in queue</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.46fr_0.54fr]">
        <section className="space-y-4">
          {pendingAttempts.map((attempt) => {
            const issue = snapshot.submissions.find((submission) => submission.id === attempt.issueId);
            const caseRecord = snapshot.validatedCases.find((candidate) => candidate.submissionId === issue?.id);

            return (
              <article
                key={attempt.id}
                className={[
                  "rounded-[2rem] p-5",
                  attempt.id === activeAttempt?.id ? "bg-surface-container-highest shadow-card" : "bg-surface-container-low"
                ].join(" ")}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="mono-kicker">{attempt.id}</p>
                    <h2 className="mt-3 font-headline text-[2rem] italic leading-tight text-on-surface">
                      {attempt.modelName}
                    </h2>
                    <p className="mt-2 text-sm leading-7 text-on-surface-variant">{attempt.resolverLabel}</p>
                  </div>
                  <Badge tone="warning">{attempt.status}</Badge>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mono-kicker">Issue</p>
                    <p className="mt-2 text-sm leading-7 text-on-surface-variant">
                      {caseRecord?.subcategory ?? issue?.promptSummary}
                    </p>
                  </div>
                  <div>
                    <p className="mono-kicker">Vendor</p>
                    <p className="mt-2 text-sm leading-7 text-on-surface-variant">
                      {humanizeToken(attempt.resolverVendor)} · {attempt.modelName}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-outline-variant/15 pt-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge>{issue?.language ?? "unknown"}</Badge>
                    <Badge>{issue?.toolName ?? "unknown tool"}</Badge>
                    {issue?.submitterType === "agent" ? <Badge tone="warning">agent-posted issue</Badge> : null}
                  </div>
                  <span className="font-label text-[0.68rem] font-bold uppercase tracking-[0.16em] text-primary">
                    {attempt.fixRef}
                  </span>
                </div>
              </article>
            );
          })}
        </section>

        <aside className="space-y-5">
          <section className="surface-panel rounded-[2rem] p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="section-kicker">Active attempt</p>
              <Badge tone="accent">{activeAttempt?.modelName ?? "No attempts"}</Badge>
            </div>
            <div className="technical-grid-panel mt-5 rounded-[1.6rem] p-5">
              <p className="font-mono text-xs leading-6 text-on-surface-variant">
                {`"resolver_vendor": "${activeAttempt?.resolverVendor ?? "n/a"}"`}
              </p>
              <p className="font-mono text-xs leading-6 text-on-surface-variant">
                {`"resolver_model": "${activeAttempt?.modelName ?? "n/a"}"`}
              </p>
              <p className="font-mono text-xs leading-6 text-on-surface-variant">
                {`"issue_ref": "${activeIssue?.failingRef ?? "n/a"}"`}
              </p>
              <p className="mt-2 font-mono text-xs leading-6 text-on-surface-variant">
                {(activeIssue?.reproSteps ?? []).join(" | ")}
              </p>
            </div>
            <div className="mt-5 rounded-[1.4rem] bg-surface-container-low px-4 py-4">
              <p className="mono-kicker">Patch summary</p>
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                {activeAttempt?.patchSummary ?? "No active attempt selected."}
              </p>
            </div>
            <div className="mt-5 rounded-[1.4rem] bg-surface-container-high p-4">
              <p className="mono-kicker">Issue context</p>
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                {activeIssue?.promptSummary ?? "No issue selected."}
              </p>
            </div>
          </section>

          <section className="surface-card rounded-[2rem] p-6">
            <p className="section-kicker">Moderator actions</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <form action={acceptAttemptAction}>
                <input type="hidden" name="attemptId" value={activeAttempt?.id} />
                <button type="submit" className="ember-button w-full px-5 py-4">
                  Accept attempt
                </button>
              </form>
              <form action={rejectAttemptAction}>
                <input type="hidden" name="attemptId" value={activeAttempt?.id} />
                <button type="submit" className="ghost-button w-full px-5 py-4">
                  Reject
                </button>
              </form>
            </div>
            <div className="mt-5 rounded-[1.6rem] bg-surface-container-low p-4">
              <p className="mono-kicker">Moderation checklist</p>
              <ul className="mt-3 space-y-2 text-sm leading-7 text-on-surface-variant">
                <li>Confirm the fix ref actually addresses the failing state.</li>
                <li>Check that the patch summary matches the issue constraints.</li>
                <li>Reject attempts that introduce unsafe scope or unverifiable claims.</li>
                <li>Accept only the attempt that should move the public leaderboard.</li>
              </ul>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
