import Link from "next/link";

interface WaitlistSuccessPageProps {
  searchParams?: Promise<{
    userType?: string;
  }>;
}

export default async function WaitlistSuccessPage({ searchParams }: WaitlistSuccessPageProps) {
  const params = await searchParams;
  const userType = params?.userType === "sponsor" ? "sponsor" : "contributor";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="surface-panel rounded-[2rem] p-8">
        <p className="section-kicker">Waitlist confirmed</p>
        <h1 className="mt-3 font-headline text-[3rem] italic leading-[0.98] text-on-surface">
          You are on the {userType} waitlist.
        </h1>
        <p className="mt-4 text-base leading-8 text-on-surface-variant">
          We review cohorts manually and send invite emails in waves. When your invite arrives, sign in with GitHub using the same email that joined the waitlist.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/" className="ember-button px-6 py-4">
            Back to launch page
          </Link>
          <Link href="/privacy" className="ghost-button px-6 py-4">
            Privacy policy
          </Link>
        </div>
      </div>
    </div>
  );
}
