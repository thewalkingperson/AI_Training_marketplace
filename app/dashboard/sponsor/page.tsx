import Link from "next/link";

import { Badge } from "@/components/badge";
import { BriefComposer } from "@/components/brief-composer";
import { MetricCard } from "@/components/metric-card";
import { SectionCard } from "@/components/section-card";
import { getSnapshot } from "@/lib/mock-store";
import { formatUsd } from "@/lib/utils";

export default function SponsorDashboardPage() {
  const snapshot = getSnapshot();

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Active briefs" value={String(snapshot.briefs.filter((item) => item.status === "active").length)} detail="Structured campaigns by domain and acceptance criteria." />
        <MetricCard label="Matched cases" value={String(snapshot.briefMatches.length)} detail="Reviewer-approved suggestions mapped into sponsor demand." />
        <MetricCard label="Prize pools" value={formatUsd(snapshot.competitions.reduce((sum, item) => sum + item.prizePoolUsd, 0))} detail="Active competition funding across the benchmark layer." />
      </div>
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <SectionCard title="Publish a domain brief" eyebrow="Sponsor controls">
            <p className="mb-5">Use fixed payout bands and clear signals so reviewers and the pricing advisor can align supply to demand.</p>
            <BriefComposer />
          </SectionCard>
          <SectionCard title="Open competitions" eyebrow="Challenge layer">
            <div className="grid gap-4">
              {snapshot.competitions.map((competition) => (
                <div key={competition.id} className="rounded-3xl border border-ink/10 bg-canvas/75 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold text-ink">{competition.title}</h3>
                      <p className="text-sm text-ink/55">{competition.description}</p>
                    </div>
                    <Badge tone="accent">{formatUsd(competition.prizePoolUsd)}</Badge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {competition.filters.map((filter) => (
                      <Badge key={filter}>{filter}</Badge>
                    ))}
                  </div>
                  <Link href={`/competitions/${competition.slug}`} className="mt-4 inline-flex text-sm font-semibold text-sea">
                    View competition
                  </Link>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
        <SectionCard title="Why sponsors use the platform" eyebrow="Demand thesis">
          <ul className="space-y-3">
            <li>Domain briefs let labs ask for the exact failure shapes they are missing, from DevOps drift to financial-modeling bugs.</li>
            <li>The pricing advisor keeps payout bands defensible without removing human judgment.</li>
            <li>Competitions create a public benchmark loop without exposing hidden holdout cases.</li>
            <li>Pack exports stay rights-aware, so training and evaluation use are split cleanly.</li>
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
