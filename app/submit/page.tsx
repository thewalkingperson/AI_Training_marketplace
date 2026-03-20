import { Badge } from "@/components/badge";
import { SubmitForm } from "@/components/submit-form";

export default function SubmitPage() {
  return (
    <div className="space-y-6">
      <div className="max-w-4xl">
        <p className="section-kicker">Contributor intake</p>
        <h1 className="mt-3 font-headline text-[3.35rem] italic leading-[0.98] text-on-surface">
          Build a clean archive packet before the reviewer ever opens it.
        </h1>
        <p className="mt-4 text-base leading-8 text-on-surface-variant">
          The guided flow below turns a repo issue and accepted fix into something labs can actually benchmark, price, and buy.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Badge tone="success">public GitHub only</Badge>
          <Badge tone="accent">python + typescript</Badge>
          <Badge>rights separated by scope</Badge>
        </div>
      </div>
      <SubmitForm />
    </div>
  );
}
