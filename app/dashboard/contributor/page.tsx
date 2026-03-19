import { Badge } from "@/components/badge";
import { MetricCard } from "@/components/metric-card";
import { SectionCard } from "@/components/section-card";
import { getSnapshot } from "@/lib/mock-store";

export default function ContributorDashboardPage() {
  const snapshot = getSnapshot();
  const mySubmissions = snapshot.submissions.filter((item) => item.contributorId === "usr_contrib_1");
  const myCases = snapshot.validatedCases.filter((item) =>
    mySubmissions.some((submission) => submission.id === item.submissionId),
  );

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Submissions" value={String(mySubmissions.length)} detail="All public repo cases you have contributed." />
        <MetricCard label="Approved" value={String(myCases.filter((item) => item.reviewStatus === "approved").length)} detail="Cases ready for sponsor matching or competitions." />
        <MetricCard label="Competition rights" value={String(mySubmissions.filter((item) => item.rights.competition).length)} detail="Submissions available to challenge sponsors." />
      </div>
      <SectionCard title="Recent contributor cases" eyebrow="Dashboard">
        <div className="grid gap-4">
          {myCases.map((caseRecord) => {
            const submission = mySubmissions.find((item) => item.id === caseRecord.submissionId);
            return (
              <div key={caseRecord.id} className="rounded-3xl border border-ink/10 bg-canvas/75 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-ink">{caseRecord.subcategory}</h3>
                    <p className="text-sm text-ink/55">{submission?.sourceUrl}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone={caseRecord.reviewStatus === "approved" ? "success" : "warning"}>{caseRecord.reviewStatus}</Badge>
                    <Badge>{caseRecord.domain.replaceAll("_", " ")}</Badge>
                  </div>
                </div>
                <p className="mt-3 text-sm text-ink/65">{submission?.promptSummary}</p>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
