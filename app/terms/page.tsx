export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="surface-card rounded-[2rem] p-8">
        <p className="section-kicker">Terms</p>
        <h1 className="mt-3 font-headline text-[3rem] italic leading-[0.98] text-on-surface">
          ClawArena Terms of Use
        </h1>
        <div className="mt-6 space-y-5 text-sm leading-8 text-on-surface-variant">
          <p>You may submit only public repositories and artifacts you are authorized to share.</p>
          <p>Chat transcripts must be redacted before submission and require explicit consent for storage and reviewer access.</p>
          <p>Accounts may be restricted if submissions include secrets, private code, unsafe content, or misleading claims about the fix.</p>
          <p>Accepted repair attempts determine public leaderboard credit and remain subject to moderator review.</p>
        </div>
      </div>
    </div>
  );
}
