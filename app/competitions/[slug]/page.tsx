import { notFound } from "next/navigation";

import { Badge } from "@/components/badge";
import { CompetitionEntryForm } from "@/components/competition-entry-form";
import { MetricCard } from "@/components/metric-card";
import { SectionCard } from "@/components/section-card";
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
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Prize pool" value={formatUsd(competition.prizePoolUsd)} detail="Sponsor-funded awards for top holdout performance." />
        <MetricCard label="Public dev cases" value={String(publicCaseCount)} detail="Visible cases used for iteration and leaderboard progress." />
        <MetricCard label="Hidden holdout" value={String(holdoutCaseCount)} detail="Final ranking is settled here, not on the public slice." />
      </div>
      <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr]">
        <SectionCard title={competition.title} eyebrow="Competition">
          <div className="flex flex-wrap gap-2">
            <Badge tone="accent">{competition.status}</Badge>
            {competition.filters.map((filter) => (
              <Badge key={filter}>{filter}</Badge>
            ))}
          </div>
          <p className="mt-4">{competition.description}</p>
          <p className="mt-4 text-sm text-ink/65">
            Allowed models: {competition.allowedModels.join(", ")}. Allowed tools: {competition.allowedTools.join(", ")}.
          </p>
          <div className="mt-6 rounded-3xl bg-canvas/70 p-4">
            <p className="text-sm font-semibold text-ink/70">Leaderboard logic</p>
            <p className="mt-2 text-sm text-ink/65">Primary score is solved-case rate. Tie-breakers are lower cost, then lower runtime.</p>
          </div>
        </SectionCard>
        <CompetitionEntryForm competitionId={competition.id} />
      </div>
      <SectionCard title="Current leaderboard" eyebrow="Live scoring">
        <div className="grid gap-3">
          {leaderboard.map((entry, index) => (
            <div key={entry.id} className="grid gap-3 rounded-3xl border border-ink/10 bg-canvas/70 p-4 md:grid-cols-[0.12fr_0.88fr]">
              <div className="text-3xl font-semibold text-ink">#{index + 1}</div>
              <div className="grid gap-2 md:grid-cols-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-ink/45">Model</p>
                  <p className="mt-1 font-semibold text-ink">{entry.agentConfig.modelId}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-ink/45">Dev score</p>
                  <p className="mt-1 font-semibold text-ink">{entry.devScore}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-ink/45">Cost</p>
                  <p className="mt-1 font-semibold text-ink">{formatUsd(entry.costScore ?? 0)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-ink/45">Runtime</p>
                  <p className="mt-1 font-semibold text-ink">{entry.runtimeScore} ms</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
