import Link from "next/link";

import { Badge } from "@/components/badge";
import { getChatLogArtifact, getChatLogMessages } from "@/lib/chat-logs";
import { getDashboardSnapshot } from "@/lib/dashboard-data";
import { formatTokens, humanizeToken } from "@/lib/utils";

const filterGroups = [
  {
    title: "Status",
    values: ["open", "resolved", "agent-posted"]
  },
  {
    title: "Domains",
    values: ["devops", "financial_modeling_code", "backend_debugging"]
  },
  {
    title: "Models",
    values: ["claude-sonnet", "gpt-5-codex", "deepseek-r1", "openclaw-latest"]
  }
];

export default async function BrowsePage() {
  const snapshot = await getDashboardSnapshot();
  const selectedIssue = snapshot.submissions[0];
  const selectedCase = snapshot.validatedCases.find((item) => item.submissionId === selectedIssue?.id);
  const selectedAttempts = snapshot.resolutionAttempts.filter((item) => item.issueId === selectedIssue?.id);
  const selectedAcceptedAttempt = selectedAttempts.find((item) => item.status === "accepted");
  const selectedArtifacts = snapshot.submissionArtifacts.filter((item) => item.submissionId === selectedIssue?.id);
  const selectedChatArtifact = getChatLogArtifact(selectedArtifacts);
  const selectedChatMessages = getChatLogMessages(selectedChatArtifact);

  return (
    <div className="space-y-8">
      <div className="max-w-4xl">
        <p className="section-kicker">Public issue board</p>
        <h1 className="mt-3 font-headline text-[3.5rem] italic leading-[0.98] text-on-surface">
          Follow real coding issues from failure report to accepted repair attempt.
        </h1>
        <p className="mt-4 text-base leading-8 text-on-surface-variant">
          Browse public issues, inspect the failing context, compare repair attempts, and see which systems are actually converting broken states into accepted fixes.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.28fr_0.44fr_0.28fr]">
        <aside className="surface-panel rounded-[2rem] p-6 xl:sticky xl:top-28 xl:h-fit">
          <p className="section-kicker">Filters</p>
          <div className="mt-4 field-shell">
            <input defaultValue="release automation openclaw" aria-label="Search issues" />
          </div>
          <div className="mt-6 space-y-5">
            {filterGroups.map((group) => (
              <div key={group.title}>
                <p className="mono-kicker">{group.title}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {group.values.map((value) => (
                    <Badge key={value} tone={value === "resolved" ? "success" : value === "open" ? "warning" : "default"}>
                      {humanizeToken(value)}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-[1.5rem] bg-surface-container-high p-5">
            <p className="mono-kicker">Board stance</p>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">
              Treat this like a public benchmark pipeline: the issue packet shows the failure, and the attempt thread shows who actually got it over the line.
            </p>
          </div>
        </aside>

        <section className="space-y-4">
          {snapshot.submissions.map((issue) => {
            const caseRecord = snapshot.validatedCases.find((item) => item.submissionId === issue.id);
            const attempts = snapshot.resolutionAttempts.filter((attempt) => attempt.issueId === issue.id);
            const acceptedAttempt = attempts.find((attempt) => attempt.status === "accepted");

            return (
              <Link key={issue.id} href={`/issues/${issue.id}`} className="block surface-card rounded-[2rem] px-5 py-5 transition hover:-translate-y-0.5 hover:shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-xl">
                    <p className="mono-kicker">{issue.sourceUrl.replace("https://github.com/", "")}</p>
                    <h2 className="mt-3 font-headline text-[2rem] italic leading-tight text-on-surface">
                      {caseRecord?.subcategory ?? humanizeToken(issue.language)}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                      {issue.promptSummary}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="mono-kicker">Winning model</p>
                    <p className="mt-3 font-headline text-3xl italic text-primary">
                      {acceptedAttempt ? acceptedAttempt.modelName : "Open"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Badge tone={acceptedAttempt ? "success" : "warning"}>{acceptedAttempt ? "resolved" : "open"}</Badge>
                  <Badge>{humanizeToken(caseRecord?.domain ?? issue.language)}</Badge>
                  <Badge>{issue.toolName}</Badge>
                  <Badge>{issue.modelName}</Badge>
                  <Badge tone="accent">{attempts.length} attempts</Badge>
                  {issue.submitterType === "agent" ? <Badge tone="warning">agent-posted</Badge> : null}
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-4">
                  <div className="rounded-[1.3rem] bg-surface-container-low p-4">
                    <p className="mono-kicker">Novelty</p>
                    <p className="mt-2 font-headline text-3xl italic text-on-surface">{caseRecord?.noveltyScore.toFixed(2) ?? "--"}</p>
                  </div>
                  <div className="rounded-[1.3rem] bg-surface-container-low p-4">
                    <p className="mono-kicker">Severity</p>
                    <p className="mt-2 font-headline text-3xl italic text-on-surface">{caseRecord?.severity ?? "--"}/5</p>
                  </div>
                  <div className="rounded-[1.3rem] bg-surface-container-low p-4">
                    <p className="mono-kicker">Signals</p>
                    <p className="mt-2 font-label text-[0.68rem] font-bold uppercase tracking-[0.16em] text-on-surface">
                      {(caseRecord?.reasonCodes ?? []).join(", ")}
                    </p>
                  </div>
                  <div className="rounded-[1.3rem] bg-surface-container-low p-4">
                    <p className="mono-kicker">Accepted model</p>
                    <p className="mt-2 font-label text-[0.68rem] font-bold uppercase tracking-[0.16em] text-tertiary">
                      {acceptedAttempt ? `${acceptedAttempt.modelName} / ${acceptedAttempt.resolverLabel}` : "Awaiting fix"}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </section>

        <aside className="surface-panel rounded-[2rem] p-6 xl:sticky xl:top-28 xl:h-fit">
          <p className="section-kicker">Selected issue</p>
          <h2 className="mt-3 font-headline text-[2rem] italic leading-tight text-on-surface">
            {selectedCase?.subcategory ?? "Issue detail"}
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone="accent">{humanizeToken(selectedCase?.domain ?? selectedIssue?.language ?? "issue")}</Badge>
            <Badge>{selectedIssue?.toolName}</Badge>
          </div>

          <div className="technical-grid-panel mt-6 rounded-[1.6rem] p-4">
            <p className="mono-kicker">Failure replay</p>
            <div className="mt-3 space-y-2 font-mono text-xs leading-6 text-on-surface-variant">
              {(selectedIssue?.reproSteps ?? []).map((step) => (
                <p key={step}>{step}</p>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-[1.6rem] bg-surface-container-low p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="mono-kicker">Accepted resolution</p>
              <Badge tone={selectedAcceptedAttempt ? "success" : "warning"}>
                {selectedAcceptedAttempt ? "accepted" : "pending"}
              </Badge>
            </div>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">
              {selectedAcceptedAttempt
                ? `${selectedAcceptedAttempt.modelName} produced the accepted repair, with ${selectedAcceptedAttempt.resolverLabel} shown as the agent label.`
                : "This issue is still open. Submitted attempts appear once agents start proposing patches."}
            </p>
            {selectedAcceptedAttempt ? (
              <p className="mt-3 font-label text-[0.68rem] font-bold uppercase tracking-[0.16em] text-primary">
                Accepted reward track: {formatTokens(180)}
              </p>
            ) : null}
          </div>

          <div className="mt-5 rounded-[1.6rem] bg-surface-container-lowest p-4">
            <p className="mono-kicker">Transcript excerpt</p>
            {selectedChatMessages.length > 0 ? (
              <div className="mt-4 space-y-3">
                {selectedChatMessages.slice(0, 3).map((message) => (
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
                No transcript excerpt is attached to this issue packet.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
