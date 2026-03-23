import Link from "next/link";
import { notFound } from "next/navigation";

import { getInvitePreview } from "@/lib/services/waitlist";

interface InvitePageProps {
  params: Promise<{
    token: string;
  }>;
}

const getCallbackUrl = (role: string) => {
  if (role === "sponsor") {
    return "/dashboard/sponsor";
  }

  if (role === "reviewer" || role === "admin") {
    return "/review";
  }

  return "/dashboard/contributor";
};

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  const invite = await getInvitePreview(token);

  if (!invite) {
    notFound();
  }

  const expired = new Date(invite.expiresAt) <= new Date();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="surface-panel rounded-[2rem] p-8">
        <p className="section-kicker">Beta invite</p>
        <h1 className="mt-3 font-headline text-[3rem] italic leading-[0.98] text-on-surface">
          Your invite is {expired ? "expired" : "ready"}.
        </h1>
        <p className="mt-4 text-base leading-8 text-on-surface-variant">
          Sign in with GitHub using <span className="font-semibold text-on-surface">{invite.email}</span> to activate your {invite.role} access.
        </p>
        <div className="mt-6 rounded-[1.6rem] bg-surface-container-low p-5">
          <p className="mono-kicker">Invite details</p>
          <div className="mt-3 space-y-2 text-sm leading-7 text-on-surface-variant">
            <p>Role: {invite.role}</p>
            <p>Expires: {new Date(invite.expiresAt).toLocaleString()}</p>
            <p>Status: {invite.acceptedAt ? "accepted" : expired ? "expired" : "pending acceptance"}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          {!expired ? (
            <Link
              href={`/api/auth/signin/github?callbackUrl=${encodeURIComponent(getCallbackUrl(invite.role))}`}
              className="ember-button px-6 py-4"
            >
              Continue with GitHub
            </Link>
          ) : null}
          <Link href="/" className="ghost-button px-6 py-4">
            Back to launch page
          </Link>
        </div>
      </div>
    </div>
  );
}
