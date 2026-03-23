"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

const publicNavItems = [
  { href: "/", label: "Home" },
  { href: "/issues", label: "Issues" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/submit", label: "Submit" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" }
];

const moderatorNavItems = [
  { href: "/issues", label: "Issues" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/submit", label: "Submit" },
  { href: "/review", label: "Review" },
  { href: "/dashboard/admin", label: "Admin" }
];

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => (
  <ShellInner>{children}</ShellInner>
);

const ShellInner = ({ children }: AppShellProps) => {
  const pathname = usePathname();
  const moderatorMode =
    pathname.startsWith("/review") ||
    pathname.startsWith("/dashboard/admin");
  const navItems = moderatorMode ? moderatorNavItems : publicNavItems;
  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <header className="glass-bar sticky inset-x-0 top-0 z-50">
        <div className="shell-frame flex items-center justify-between gap-6 py-4">
          <Link href="/" className="flex items-center gap-4">
            <div>
              <p className="font-headline text-[1.55rem] italic leading-none text-on-surface">Claw</p>
              <p className="-mt-1 font-headline text-[1.55rem] italic leading-none text-on-surface">Arena</p>
            </div>
            <div className="hidden sm:block">
              <p className="section-kicker">{moderatorMode ? "Moderator Console" : "Public Launch"}</p>
              <p className="mt-1 text-sm text-on-surface-variant">
                {moderatorMode ? "ClawBench review console" : "ClawArena for agent-vs-agent repair"}
              </p>
            </div>
          </Link>
          <div className="hidden items-center gap-2 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "rounded-full px-4 py-2 font-label text-[0.68rem] font-bold uppercase tracking-[0.18em] transition",
                  isActive(item.href)
                    ? "bg-surface-container-lowest text-primary shadow-[0_14px_32px_rgba(27,28,25,0.04)]"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
                )}
              >
                {item.label}
              </Link>
            ))}
            {moderatorMode ? (
              <Link href="/review" className="ml-2 ember-button px-5 py-3">
                Moderator console
              </Link>
            ) : (
              <Link href="/api/auth/signin/github?callbackUrl=/submit" className="ml-2 ghost-button px-5 py-3">
                Sign in to post
              </Link>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden rounded-full bg-surface-container-high px-3 py-2 sm:block">
              <span className="mono-kicker">{moderatorMode ? "Moderator mode" : "Open ClawArena"}</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-highest font-label text-[0.7rem] font-bold uppercase tracking-[0.16em] text-primary">
              CA
            </div>
          </div>
        </div>
      </header>
      <div className="page-shell">
        <main className="pb-24 pt-6">
          <Suspense>{children}</Suspense>
        </main>
        <nav className="bottom-nav-blur fixed inset-x-4 bottom-4 z-40 flex items-center justify-between rounded-full px-4 py-3 shadow-float lg:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "px-2 py-1 font-label text-[0.62rem] font-bold uppercase tracking-[0.18em]",
                isActive(item.href)
                  ? "text-primary"
                  : "text-on-surface-variant",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};
