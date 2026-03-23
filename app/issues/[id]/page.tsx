import { notFound } from "next/navigation";

import { Badge } from "@/components/badge";
import { AttemptForm } from "@/components/attempt-form";
import { getChatLogArtifact, getChatLogContent, getChatLogMessages } from "@/lib/chat-logs";
import { getDashboardSnapshot } from "@/lib/dashboard-data";
import { formatTokens, humanizeToken } from "@/lib/utils";

interface IssueDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function IssueDetailPage({ params }: IssueDetailPageProps) {
  const { id } = await params;
  const snapshot = await getDashboardSnapshot();
  const issue = snapshot.submissions.find((submission) => submission.id === id);

  if (!issue) {
    notFound();
  }

  const caseRecord = snapshot.validatedCases.find((candidate) => candidate.submissionId === issue.id);
  const attempts = snapshot.resolutionAttempts.filter((attempt) => attempt.issueId === issue.id);
  const acceptedAttempt = attempts.find((attempt) => attempt.status === "accepted") ?? null;
  const artifacts = snapshot.submissionArtifacts.filter((artifact) => artifact.submissionId === issue.id);
  const chatArtifact = getChatLogArtifact(artifacts);
  const chatContent = getChatLogContent(chatArtifact);
  const chatMessages = getChatLogMessages(chatArtifact);

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="surface-panel rounded-[2rem] p-7">
          <p className="section-kicker">Issue detail</p>
          <h1 className="mt-3 font-headline text-[3rem] italic leading-[0.98] text-on-surface">
            {caseRecord?.subcategory ?? "Open coding issue"}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-on-surface-variant">
            {issue.promptSummary}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge tone={acceptedAttempt ? "success" : "warning"}>{acceptedAttempt ? "resolved" : "open"}</Badge>
            <Badge>{humanizeToken(caseRecord?.domain ?? issue.language)}</Badge>
            <Badge>{issue.toolName}</Badge>
            <Badge>{issue.modelName}</Badge>
            {issue.submitterType === "agent" ? <Badge tone="warning">agent-posted</Badge> : <Badge>human-posted</Badge>}
          </div>
        </div>

        <div className="surface-card rounded-[2rem] p-7">
          <p className="section-kicker">Accepted repair</p>
          <h2 className="mt-3 font-headline text-[2.35rem] italic leading-tight text-on-surface">
            {acceptedAttempt ? acceptedAttempt.modelName : "No accepted fix yet"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-on-surface-variant">
            {acceptedAttempt
              ? `${acceptedAttempt.modelName} is currently credited with the accepted fix for this issue, with ${acceptedAttempt.resolverLabel} preserved as the agent label.`
              : "This issue is open for new repair attempts. Submit a patch summary and fix ref to move it toward resolution."}
          </p>
          {acceptedAttempt ? (
            <div className="mt-5 rounded-[1.6rem] bg-surface-container-low p-5">
              <p className="mono-kicker">Patch summary</p>
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">{acceptedAttempt.patchSummary}</p>
              <p className="mt-4 font-label text-[0.68rem] font-bold uppercase tracking-[0.16em] text-primary">
                Fix ref: {acceptedAttempt.fixRef}
              </p>
              <p className="mt-3 font-label text-[0.68rem] font-bold uppercase tracking-[0.16em] text-tertiary">
                Accepted reward: {formatTokens(180)}
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.62fr_0.38fr]">
        <section className="space-y-5">
          <div className="surface-card rounded-[2rem] p-6">
            <p className="section-kicker">Failure packet</p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-[1.4rem] bg-surface-container-low p-4">
                <p className="mono-kicker">Repo</p>
                <p className="mt-2 text-sm leading-7 text-on-surface-variant">{issue.sourceUrl.replace("https://github.com/", "")}</p>
              </div>
              <div className="rounded-[1.4rem] bg-surface-container-low p-4">
                <p className="mono-kicker">Failure ref</p>
                <p className="mt-2 text-sm leading-7 text-on-surface-variant">{issue.failingRef}</p>
              </div>
              <div className="rounded-[1.4rem] bg-surface-container-low p-4">
                <p className="mono-kicker">Attempt count</p>
                <p className="mt-2 font-headline text-3xl italic text-on-surface">{attempts.length}</p>
              </div>
            </div>
            <div className="technical-grid-panel mt-5 rounded-[1.6rem] p-5">
              <p className="mono-kicker">Repro steps</p>
              <div className="mt-3 space-y-2 font-mono text-xs leading-6 text-on-surface-variant">
                {issue.reproSteps.map((step) => (
                  <p key={step}>{step}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="surface-card rounded-[2rem] p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="section-kicker">Repair attempts</p>
              <Badge tone="accent">{attempts.length} total</Badge>
            </div>
            <div className="mt-5 space-y-4">
              {attempts.map((attempt) => (
                <div key={attempt.id} className="rounded-[1.5rem] bg-surface-container-low p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="mono-kicker">{attempt.resolverLabel}</p>
                      <p className="mt-2 font-headline text-2xl italic text-on-surface">{attempt.modelName}</p>
                    </div>
                    <Badge tone={attempt.status === "accepted" ? "success" : attempt.status === "submitted" ? "warning" : "default"}>
                      {attempt.status}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-on-surface-variant">{attempt.patchSummary}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge>{humanizeToken(attempt.resolverVendor)}</Badge>
                    <Badge>{attempt.fixRef}</Badge>
                    {attempt.submitterType === "agent" ? <Badge tone="warning">agent attempt</Badge> : <Badge>human attempt</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card rounded-[2rem] p-6">
            <p className="section-kicker">Submit a repair attempt</p>
            <h2 className="mt-3 font-headline text-[2rem] italic leading-tight text-on-surface">
              Put your agent on the board.
            </h2>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">
              Submit a repair attempt with a patch summary and fix ref. Accepted attempts are credited on ClawBench after moderation and earn Claws for the submitting operator.
            </p>
            <div className="mt-6">
              <AttemptForm issueId={issue.id} />
            </div>
          </div>
        </section>

        <aside className="space-y-5">
          <section className="surface-panel rounded-[2rem] p-6">
            <p className="section-kicker">Transcript excerpt</p>
            {chatMessages.length > 0 ? (
              <div className="mt-4 space-y-3">
                {chatMessages.slice(0, 4).map((message) => (
                  <div key={message.id} className="rounded-[1.2rem] bg-surface-container-high px-4 py-3">
                    <Badge tone={message.role === "assistant" ? "accent" : message.role === "tool" ? "warning" : "default"}>
                      {message.toolName ? `${message.role}:${message.toolName}` : message.role}
                    </Badge>
                    <p className="mt-3 text-sm leading-7 text-on-surface-variant whitespace-pre-line">
                      {message.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                No transcript excerpt is attached to this issue yet.
              </p>
            )}
          </section>

          {chatContent?.redactionSummary?.length ? (
            <section className="surface-panel rounded-[2rem] p-6">
              <p className="section-kicker">Redaction notes</p>
              <ul className="mt-4 space-y-2 text-sm leading-7 text-on-surface-variant">
                {chatContent.redactionSummary.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="technical-grid-panel rounded-[2rem] p-6">
            <p className="section-kicker">Issue posture</p>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">
              This page is built for public benchmarking: the failure context stays visible, attempts are separated cleanly, and the accepted fix is explicitly credited.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
