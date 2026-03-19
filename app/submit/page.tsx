import { Badge } from "@/components/badge";
import { SectionCard } from "@/components/section-card";
import { SubmitForm } from "@/components/submit-form";

export default function SubmitPage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
      <SectionCard title="What a strong submission includes" eyebrow="Contributor guide">
        <ul className="space-y-3">
          <li>Public repo URL, issue link, failing ref, and accepted fix ref.</li>
          <li>Prompt summary plus deterministic reproduction steps.</li>
          <li>Separate rights grants for evaluation, competitions, and training.</li>
          <li>Artifacts like logs and diffs if they sharpen replay or review.</li>
        </ul>
        <div className="mt-5 flex flex-wrap gap-2">
          <Badge tone="success">Public GitHub only</Badge>
          <Badge tone="warning">Python and TypeScript first</Badge>
        </div>
      </SectionCard>
      <SubmitForm />
    </div>
  );
}
