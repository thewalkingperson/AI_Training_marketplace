import { Badge } from "@/components/badge";
import { SectionCard } from "@/components/section-card";
import { getSnapshot } from "@/lib/mock-store";

export default function ReviewPage() {
  const snapshot = getSnapshot();
  const pendingCases = snapshot.validatedCases.filter((item) => item.reviewStatus === "pending");

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sea">Reviewer queue</p>
        <h1 className="mt-2 text-5xl font-semibold text-ink">Approve rights, suggest pricing, and route supply into demand.</h1>
      </div>
      <div className="grid gap-6">
        {pendingCases.map((caseRecord) => {
          const submission = snapshot.submissions.find((item) => item.id === caseRecord.submissionId);
          return (
            <SectionCard key={caseRecord.id} title={caseRecord.subcategory} eyebrow={caseRecord.domain.replaceAll("_", " ")}>
              <div className="flex flex-wrap gap-2">
                <Badge tone="warning">Pending review</Badge>
                <Badge>{submission?.language ?? "unknown"}</Badge>
                {caseRecord.safetyFlags.map((flag) => (
                  <Badge key={flag}>{flag}</Badge>
                ))}
              </div>
              <p className="mt-4">{submission?.promptSummary}</p>
              <div className="mt-4 rounded-3xl bg-canvas/70 p-4">
                <p className="text-sm text-ink/65">Suggested next actions</p>
                <ul className="mt-3 space-y-2">
                  <li>Re-run the failing ref in the managed validation worker.</li>
                  <li>Confirm whether competition rights can be approved.</li>
                  <li>Match against the active financial-modeling or DevOps brief once pricing is ready.</li>
                </ul>
              </div>
            </SectionCard>
          );
        })}
      </div>
    </div>
  );
}
