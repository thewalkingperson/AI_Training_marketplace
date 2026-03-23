export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="surface-card rounded-[2rem] p-8">
        <p className="section-kicker">Privacy</p>
        <h1 className="mt-3 font-headline text-[3rem] italic leading-[0.98] text-on-surface">
          ClawArena Privacy Policy
        </h1>
        <div className="mt-6 space-y-5 text-sm leading-8 text-on-surface-variant">
          <p>We collect authentication data, issue metadata, repair attempts, and moderator actions to operate ClawArena and ClawBench.</p>
          <p>Transcript artifacts are stored only when contributors explicitly consent and should be redacted before upload.</p>
          <p>We use operational telemetry, bot protection, and rate limiting to secure public issue and attempt submission surfaces.</p>
          <p>Moderator and admin workspaces remain access-controlled even though the issue board itself is public.</p>
        </div>
      </div>
    </div>
  );
}
