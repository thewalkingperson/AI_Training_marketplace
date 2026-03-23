"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
        },
      ) => void;
    };
  }
}

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

export const WaitlistForm = () => {
  const router = useRouter();
  const widgetRef = useRef<HTMLDivElement | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (!siteKey || !widgetRef.current || !window.turnstile) {
      return;
    }

    window.turnstile.render(widgetRef.current, {
      sitekey: siteKey,
      callback: (value: string) => setToken(value)
    });
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: String(formData.get("email") ?? "").trim(),
          userType: formData.get("userType"),
          githubHandle: String(formData.get("githubHandle") ?? "").trim() || null,
          company: String(formData.get("company") ?? "").trim() || null,
          notes: String(formData.get("notes") ?? "").trim() || null,
          turnstileToken: token
        })
      });

      const body = await response.json();
      if (!response.ok) {
        throw new Error(typeof body.error === "string" ? body.error : "Waitlist signup failed.");
      }

      router.push(`/waitlist/success?userType=${String(formData.get("userType") ?? "contributor")}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Waitlist signup failed.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      {siteKey ? (
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
      ) : null}
      <form onSubmit={handleSubmit} className="grid gap-5">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="mono-kicker">Email</span>
            <div className="field-shell">
              <input name="email" type="email" placeholder="you@company.com" required />
            </div>
          </label>
          <label className="grid gap-2">
            <span className="mono-kicker">Joining as</span>
            <div className="field-shell">
              <select name="userType" defaultValue="contributor">
                <option value="contributor">Contributor</option>
                <option value="sponsor">Sponsor</option>
              </select>
            </div>
          </label>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="mono-kicker">GitHub handle</span>
            <div className="field-shell">
              <input name="githubHandle" placeholder="octocat" />
            </div>
          </label>
          <label className="grid gap-2">
            <span className="mono-kicker">Company</span>
            <div className="field-shell">
              <input name="company" placeholder="Northstar Models" />
            </div>
          </label>
        </div>

        <label className="grid gap-2">
          <span className="mono-kicker">What should we know?</span>
          <div className="field-shell">
            <textarea
              name="notes"
              rows={4}
              placeholder="Tell us the domains you work on, the tooling you use, or what you want from the beta."
            />
          </div>
        </label>

        <div className="rounded-[1.6rem] bg-surface-container-low p-5">
          <p className="mono-kicker">Beta intake</p>
          <p className="mt-3 text-sm leading-7 text-on-surface-variant">
            Contributors are the first public cohort. Sponsors are onboarded founder-led after the initial supply side proves out.
          </p>
          <div ref={widgetRef} className="mt-4" />
          {!siteKey ? (
            <p className="mt-4 text-xs leading-6 text-on-surface-variant">
              Turnstile will activate automatically when the production site key is configured.
            </p>
          ) : null}
        </div>

        {message ? (
          <div className="rounded-[1.4rem] bg-surface-container-high px-4 py-3 text-sm text-primary">
            {message}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm leading-7 text-on-surface-variant">
            Invited already? Sign in with GitHub using the same email on your invite.
          </p>
          <button type="submit" disabled={isPending} className="ember-button px-6 py-4 disabled:opacity-50">
            {isPending ? "Joining..." : "Join the waitlist"}
          </button>
        </div>
      </form>
    </>
  );
};
