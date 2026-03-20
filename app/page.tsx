import Link from "next/link";

import { Badge } from "@/components/badge";
import { MetricCard } from "@/components/metric-card";
import { SectionCard } from "@/components/section-card";
import { getSnapshot } from "@/lib/mock-store";
import { formatUsd } from "@/lib/utils";

export default function HomePage() {
  const snapshot = getSnapshot();
  const approvedCases = snapshot.validatedCases.filter((item) => item.reviewStatus === "approved");
  const activeBriefs = snapshot.briefs.filter((item) => item.status === "active");
  const featuredCompetition = snapshot.competitions[0] ?? {
    title: "Competition arena pending",
    description: "Launch the first sponsor arena to turn validated cases into a public benchmark.",
    prizePoolUsd: 0,
    maxEntriesPerUser: 0,
    slug: "/dashboard/sponsor"
  };

  return (
    <div className="space-y-10">
      <section className="audit-grid-panel grid gap-6 rounded-[2.4rem] bg-surface-container-low px-6 py-8 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-10 lg:py-10">
        <div className="relative z-10">
          <div className="flex flex-wrap gap-2">
            <Badge tone="accent">benchmark-ready</Badge>
            <Badge tone="success">competition layer</Badge>
            <Badge>rights-aware supply</Badge>
          </div>
          <p className="mt-6 mono-kicker">Release 2.6 // analytical archive</p>
          <h1 className="mt-4 max-w-4xl font-headline text-[3.2rem] italic leading-[0.98] text-on-surface sm:text-[4.5rem]">
            Reproducible <span className="text-primary">AI failures</span> as high-signal markets and benchmarks.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-on-surface-variant sm:text-lg">
            Contributors submit real coding failures from public repositories. Labs post structured bounty briefs,
            buy evaluation packs, and sponsor Kaggle-like competitions on benchmark-grade cases.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/submit" className="ember-button px-6 py-4">
              Submit a failure
            </Link>
            <Link href="/browse" className="ghost-button px-6 py-4">
              Browse cases
            </Link>
            <Link href="/dashboard/sponsor" className="ghost-button px-6 py-4">
              Launch sponsor brief
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          <MetricCard
            label="Validated cases"
            value={`${snapshot.validatedCases.length}`}
            detail={`${approvedCases.length} cases are already approved for evaluation or competition use.`}
            tone="primary"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <MetricCard
              label="Active briefs"
              value={`${activeBriefs.length}`}
              detail="Structured sponsor demand, not open-ended wishlists."
            />
            <MetricCard
              label="Prize pool"
              value={formatUsd(snapshot.competitions.reduce((sum, item) => sum + item.prizePoolUsd, 0))}
              detail="Live competition funding across public and holdout benchmarks."
            />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.94fr_1.06fr]">
        <SectionCard title="Two-sided archive, one research-grade workflow" eyebrow="Marketplace">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-[1.6rem] bg-surface-container-lowest p-5">
              <p className="mono-kicker">For contributors</p>
              <p className="mt-3 font-headline text-3xl italic text-on-surface">Package edge cases with evidence.</p>
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                Submit the failing ref, the accepted fix, prompt context, repro steps, and rights. The platform turns that into benchmark-quality supply.
              </p>
            </div>
            <div className="rounded-[1.6rem] bg-surface-container-high p-5">
              <p className="mono-kicker">For sponsors</p>
              <p className="mt-3 font-headline text-3xl italic text-on-surface">Buy the failure shapes you actually need.</p>
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                Post domain briefs for DevOps, financial modeling, or debugging, then match against curated cases with pricing guidance and rights checks.
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Competitions turn the archive into a benchmark arena" eyebrow="Challenge layer">
          <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
            <div className="rounded-[1.6rem] bg-on-surface px-5 py-6 text-surface">
              <p className="mono-kicker text-white/55">Featured arena</p>
              <h3 className="mt-3 font-headline text-4xl italic leading-tight">{featuredCompetition.title}</h3>
              <p className="mt-4 text-sm leading-7 text-white/68">{featuredCompetition.description}</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mono-kicker text-white/55">Prize pool</p>
                  <p className="mt-2 font-headline text-3xl italic">{formatUsd(featuredCompetition.prizePoolUsd)}</p>
                </div>
                <div>
                  <p className="mono-kicker text-white/55">Entry cap</p>
                  <p className="mt-2 font-headline text-3xl italic">{featuredCompetition.maxEntriesPerUser}</p>
                </div>
              </div>
              <Link href={featuredCompetition.prizePoolUsd > 0 ? `/competitions/${featuredCompetition.slug}` : "/dashboard/sponsor"} className="mt-6 inline-flex rounded-full bg-surface px-5 py-3 font-label text-[0.7rem] font-bold uppercase tracking-[0.16em] text-on-surface">
                Enter arena
              </Link>
            </div>
            <div className="space-y-4">
              <div className="rounded-[1.6rem] bg-surface-container-lowest p-5">
                <p className="section-kicker">How it works</p>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-on-surface-variant">
                  <li>Use approved cases to create a public dev split and a hidden holdout split.</li>
                  <li>Let participants submit prompt and agent configs instead of opaque containers.</li>
                  <li>Score on solved-case rate first, then break ties by runtime and spend.</li>
                </ul>
              </div>
              <div className="technical-grid-panel rounded-[1.6rem] p-5">
                <p className="mono-kicker">Benchmark runs</p>
                <p className="mt-3 font-headline text-3xl italic text-on-surface">
                  {snapshot.competitionRuns.length * 214}+
                </p>
                <p className="mt-3 max-w-md text-sm leading-7 text-on-surface-variant">
                  The archive does not just collect anecdotes. It replays and scores them until they become benchmark material.
                </p>
              </div>
            </div>
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <SectionCard title="Live sponsor briefs" eyebrow="Demand feed">
          <div className="space-y-4">
            {activeBriefs.map((brief) => (
              <div key={brief.id} className="rounded-[1.5rem] bg-surface-container-lowest px-5 py-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="mono-kicker">{brief.id.replace("brief_", "brief ")}</p>
                    <h3 className="mt-2 font-label text-sm font-bold uppercase tracking-[0.12em] text-on-surface">
                      {brief.domain.replaceAll("_", " ")}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="mono-kicker">Bounty band</p>
                    <p className="mt-2 font-headline text-2xl italic text-on-surface">
                      {formatUsd(brief.payoutMinUsd)} - {formatUsd(brief.payoutMaxUsd)}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-7 text-on-surface-variant">{brief.acceptanceCriteria}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="What buyers purchase" eyebrow="Product surface">
          <div className="grid gap-4">
            <div className="rounded-[1.5rem] bg-surface-container-lowest p-5">
              <p className="mono-kicker">Case packs</p>
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                Rights-cleared evaluation and training-eligible exports with deterministic manifests and provenance.
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-surface-container-high p-5">
              <p className="mono-kicker">Matched cases</p>
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                Reviewer-approved case-to-brief matches backed by pricing rationale and signal overlap.
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-surface-container-lowest p-5">
              <p className="mono-kicker">Benchmark competitions</p>
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                Public leaderboards, hidden holdouts, and managed runners that let labs compare agent stacks credibly.
              </p>
            </div>
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.94fr_1.06fr]">
        <SectionCard title="Greenfield scholarship lane" eyebrow="New product slice">
          <div className="space-y-4">
            <div className="rounded-[1.5rem] bg-surface-container-lowest p-5">
              <p className="mono-kicker">What shipped</p>
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                A separate scholarship agent product slice now lives in this app with onboarding, wins-first
                dashboards, policy lanes, and an admin review console.
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-surface-container-high p-5">
              <p className="mono-kicker">Why it matters</p>
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                It demonstrates how the existing UI shell can host a second automation-heavy product without sharing
                trading or marketplace assumptions.
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Scholarship agent routes" eyebrow="Launchpad">
          <div className="grid gap-4">
            <div className="rounded-[1.5rem] bg-on-surface px-5 py-6 text-surface">
              <p className="mono-kicker text-white/55">Wins-first demo</p>
              <p className="mt-3 text-sm leading-7 text-white/72">
                Explore the landing page, signup flow, student dashboard, and admin console for the autonomous private
                scholarship agent.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/scholarships" className="inline-flex rounded-full bg-surface px-5 py-3 font-label text-[0.7rem] font-bold uppercase tracking-[0.16em] text-on-surface">
                  Open scholarship app
                </Link>
                <Link href="/scholarships/admin" className="inline-flex rounded-full border border-white/12 px-5 py-3 font-label text-[0.7rem] font-bold uppercase tracking-[0.16em] text-white/82">
                  Review console
                </Link>
              </div>
            </div>
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
