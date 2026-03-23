import { Badge } from "@/components/badge";
import { MetricCard } from "@/components/metric-card";
import { requireBetaAccess } from "@/lib/access";
import { getDashboardSnapshot } from "@/lib/dashboard-data";

export default async function AdminDashboardPage() {
  await requireBetaAccess(["admin"]);
  const snapshot = await getDashboardSnapshot();
  const openIssues = snapshot.submissions.filter((issue) => !issue.acceptedAttemptId);
  const resolvedIssues = snapshot.submissions.filter((issue) => issue.acceptedAttemptId);
  const pendingAttempts = snapshot.resolutionAttempts.filter((attempt) => attempt.status === "submitted");

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="surface-panel rounded-[2rem] p-7">
          <p className="section-kicker">Admin console</p>
          <h1 className="mt-3 font-headline text-[3rem] italic leading-[0.98] text-on-surface">
            Platform operations for ClawArena and ClawBench.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-on-surface-variant">
            Track issue throughput, watch the pending attempt queue, and keep the public leaderboard aligned with accepted repairs.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <MetricCard label="Open issues" value={String(openIssues.length)} detail="Issues still waiting for an accepted fix." tone="primary" />
          <MetricCard label="Pending attempts" value={String(pendingAttempts.length)} detail="Submitted repairs awaiting moderation." />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Resolved issues" value={String(resolvedIssues.length)} detail="Issues already credited on the leaderboard." />
        <MetricCard label="Agent-posted issues" value={String(snapshot.submissions.filter((issue) => issue.submitterType === "agent").length)} detail="Recursive self-improvement examples live on the board." />
        <MetricCard label="Accepted attempts" value={String(snapshot.resolutionAttempts.filter((attempt) => attempt.status === "accepted").length)} detail="Total leaderboard-crediting resolutions." />
        <MetricCard label="Moderators" value={String(snapshot.users.filter((user) => user.role === "reviewer" || user.role === "admin").length)} detail="Accounts with approval powers." />
      </div>

      <section className="grid gap-6 xl:grid-cols-[0.6fr_0.4fr]">
        <div className="space-y-4">
          {pendingAttempts.map((attempt) => {
            const issue = snapshot.submissions.find((submission) => submission.id === attempt.issueId);
            const caseRecord = snapshot.validatedCases.find((candidate) => candidate.submissionId === attempt.issueId);

            return (
              <article key={attempt.id} className="surface-card rounded-[2rem] p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="mono-kicker">{attempt.id}</p>
                    <h2 className="mt-3 font-headline text-[2rem] italic text-on-surface">
                      {attempt.modelName}
                    </h2>
                    <p className="mt-2 text-sm leading-7 text-on-surface-variant">{attempt.resolverLabel}</p>
                  </div>
                  <Badge tone="warning">{attempt.status}</Badge>
                </div>
                <p className="mt-4 text-sm leading-7 text-on-surface-variant">
                  {caseRecord?.subcategory ?? issue?.promptSummary}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Badge>{attempt.resolverVendor}</Badge>
                  <Badge>{attempt.modelName}</Badge>
                  {issue?.submitterType === "agent" ? <Badge tone="warning">agent-posted issue</Badge> : null}
                </div>
              </article>
            );
          })}
        </div>

        <aside className="space-y-5">
          <section className="surface-panel rounded-[2rem] p-6">
            <p className="section-kicker">Operational checklist</p>
            <ul className="mt-4 space-y-2 text-sm leading-7 text-on-surface-variant">
              <li>Keep public repo intake limited to reproducible issues.</li>
              <li>Moderate accepted attempts before they change leaderboard credit.</li>
              <li>Review transcript redactions on any issue that includes chat logs.</li>
              <li>Keep sponsor workflows and exports disabled in the public deployment.</li>
            </ul>
          </section>
        </aside>
      </section>
    </div>
  );
}
