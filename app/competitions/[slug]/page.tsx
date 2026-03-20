import { notFound } from "next/navigation";

import { Badge } from "@/components/badge";
import { CompetitionEntryForm } from "@/components/competition-entry-form";
import { MetricCard } from "@/components/metric-card";
import { getSnapshot } from "@/lib/mock-store";
import { rankCompetitionEntries } from "@/lib/services/competitions";
import { formatUsd } from "@/lib/utils";

interface CompetitionPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CompetitionPage({ params }: CompetitionPageProps) {
  const { slug } = await params;
  const snapshot = getSnapshot();
  const competition = snapshot.competitions.find((item) => item.slug === slug);

  if (!competition) {
    notFound();
  }

  const leaderboard = rankCompetitionEntries(competition.id);
  const publicCaseCount = snapshot.competitionSplits.filter(
    (split) => split.competitionId === competition.id && split.split === "public_dev",
  ).length;
  const holdoutCaseCount = snapshot.competitionSplits.filter(
    (split) => split.competitionId === competition.id && split.split === "hidden_holdout",
  ).length;

  return (
    <div className="space-y-8">
      <section className="audit-grid-panel rounded-[2.2rem] bg-surface-container-low px-6 py-8 sm:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="success">live</Badge>
          <Badge>{competition.id}</Badge>
        </div>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <div>
            <h1 className="font-headline text-[3.3rem] italic leading-[0.98] text-on-surface">
              {competition.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-on-surface-variant">
              {competition.description}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {competition.filters.map((filter) => (
                <Badge key={filter} tone="accent">{filter}</Badge>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <MetricCard label="Prize pool" value={formatUsd(competition.prizePoolUsd)} detail="Sponsor-funded awards for top holdout performance." tone="primary" />
            <MetricCard label="Allowed models" value={String(competition.allowedModels.length)} detail={competition.allowedModels.join(", ")} />
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Public dev split" value={String(publicCaseCount)} detail="Visible cases for iteration and public scoring." />
        <MetricCard label="Hidden holdout" value={String(holdoutCaseCount)} detail="Final ranking happens here." />
        <MetricCard label="Entry cap" value={String(competition.maxEntriesPerUser)} detail="Maximum submissions per participant." />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.58fr_0.42fr]">
        <section className="space-y-5">
          <article className="surface-panel rounded-[2rem] p-6">
            <p className="section-kicker">How scoring works</p>
            <p className="mt-4 text-sm leading-7 text-on-surface-variant">
              Public dev scoring gives immediate feedback; the hidden holdout settles the competition. Primary metric is solved-case rate, then cost, then runtime.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.5rem] bg-surface-container-lowest p-4">
                <p className="mono-kicker">Allowed models</p>
                <p className="mt-2 font-mono text-xs leading-6 text-on-surface-variant">
                  {competition.allowedModels.join(", ")}
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-surface-container-lowest p-4">
                <p className="mono-kicker">Allowed tools</p>
                <p className="mt-2 font-mono text-xs leading-6 text-on-surface-variant">
                  {competition.allowedTools.join(", ")}
                </p>
              </div>
            </div>
          </article>

          <article className="surface-card rounded-[2rem] p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="section-kicker">Arena leaderboard</p>
                <h2 className="mt-3 font-headline text-[2.2rem] italic text-on-surface">Current standings</h2>
              </div>
              <p className="mono-kicker">Updated in real time</p>
            </div>
            <div className="mt-5 space-y-3">
              {leaderboard.map((entry, index) => (
                <div key={entry.id} className="rounded-[1.5rem] bg-surface-container-low px-4 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span className="font-headline text-3xl italic text-outline">{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <p className="font-label text-[0.74rem] font-bold uppercase tracking-[0.14em] text-on-surface">
                          {entry.participantId}
                        </p>
                        <p className="mt-1 font-mono text-[0.68rem] text-on-surface-variant">
                          {entry.agentConfig.modelId}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-label text-lg font-bold text-primary">{entry.devScore}</p>
                      <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-on-surface-variant">
                        {entry.holdoutScore ? "holdout scored" : "public split"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div>
                      <p className="mono-kicker">Dev score</p>
                      <p className="mt-1 text-sm text-on-surface-variant">{entry.devScore}</p>
                    </div>
                    <div>
                      <p className="mono-kicker">Cost</p>
                      <p className="mt-1 text-sm text-on-surface-variant">{formatUsd(entry.costScore ?? 0)}</p>
                    </div>
                    <div>
                      <p className="mono-kicker">Runtime</p>
                      <p className="mt-1 text-sm text-on-surface-variant">{entry.runtimeScore} ms</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <CompetitionEntryForm competitionId={competition.id} />
      </div>
    </div>
  );
}
