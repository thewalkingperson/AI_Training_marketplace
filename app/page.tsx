import Link from "next/link";

import { Badge } from "@/components/badge";
import { MetricCard } from "@/components/metric-card";
import { SectionCard } from "@/components/section-card";
import { getSnapshot } from "@/lib/mock-store";
import { formatUsd } from "@/lib/utils";

export default function HomePage() {
  const snapshot = getSnapshot();
  const approvedCases = snapshot.validatedCases.filter((item) => item.reviewStatus === "approved");

  return (
    <div className="space-y-10">
      <section className="grid gap-8 lg:grid-cols-[1.35fr_0.9fr]">
        <div className="fade-up rounded-[2.5rem] border border-ink/10 bg-grid-fade p-8 shadow-card">
          <div className="flex flex-wrap gap-2">
            <Badge tone="accent">Public repo intake</Badge>
            <Badge tone="success">Competition-ready cases</Badge>
            <Badge>Advisory pricing</Badge>
          </div>
          <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[1.05] text-ink md:text-7xl">
            Turn real AI coding failures into reproducible markets and benchmarks.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/70">
            Contributors submit failures from public GitHub repos. Labs publish domain briefs, buy case packs,
            and sponsor Kaggle-style competitions judged by a managed runner.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/submit" className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-canvas">
              Submit a failure
            </Link>
            <Link href="/dashboard/sponsor" className="rounded-full border border-ink/15 bg-white/85 px-5 py-3 text-sm font-semibold text-ink">
              Launch a sponsor brief
            </Link>
          </div>
        </div>
        <div className="grid gap-4">
          <MetricCard
            label="Validated supply"
            value={String(snapshot.validatedCases.length)}
            detail={`${approvedCases.length} approved cases with rights-aware eligibility.`}
          />
          <MetricCard
            label="Active demand"
            value={String(snapshot.briefs.filter((item) => item.status === "active").length)}
            detail="Structured sponsor briefs target repeatable failure domains, not vague RFPs."
          />
          <MetricCard
            label="Prize pool live"
            value={formatUsd(snapshot.competitions.reduce((sum, competition) => sum + competition.prizePoolUsd, 0))}
            detail="Competitions add benchmark pressure on top of one-off case payouts."
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="For contributors" eyebrow="Supply">
          <p>Submit a public repo issue, failing ref, accepted fix, and rights grants for evaluation, competition, or training use.</p>
        </SectionCard>
        <SectionCard title="For sponsors" eyebrow="Demand">
          <p>Post domain briefs like DevOps or financial-modeling code with fixed payout bands and acceptance criteria.</p>
        </SectionCard>
        <SectionCard title="For benchmark players" eyebrow="Competitions">
          <p>Upload prompt and agent configs. The managed runner scores them on public dev cases and a hidden holdout split.</p>
        </SectionCard>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <SectionCard title="What buyers actually purchase" eyebrow="Product">
          <ul className="space-y-3">
            <li>Curated eval packs with deterministic manifests and rights checks.</li>
            <li>Matched bounty cases against structured domain briefs.</li>
            <li>Sponsored competitions with public leaderboards and holdout scoring.</li>
          </ul>
        </SectionCard>
        <SectionCard title="Current highlights" eyebrow="Snapshot">
          <div className="grid gap-3">
            {snapshot.briefs.slice(0, 2).map((brief) => (
              <div key={brief.id} className="rounded-3xl border border-ink/10 bg-canvas/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-semibold text-ink">{brief.domain.replaceAll("_", " ")}</h3>
                  <Badge tone="warning">{formatUsd(brief.payoutMinUsd)} - {formatUsd(brief.payoutMaxUsd)}</Badge>
                </div>
                <p className="mt-2 text-sm text-ink/65">{brief.acceptanceCriteria}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
