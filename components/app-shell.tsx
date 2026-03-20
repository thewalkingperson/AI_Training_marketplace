import Link from "next/link";
import { Suspense } from "react";

const navItems = [
  { href: "/", label: "Archive" },
  { href: "/scholarships", label: "Scholarships" },
  { href: "/browse", label: "Cases" },
  { href: "/submit", label: "Submit" },
  { href: "/dashboard/sponsor", label: "Sponsor" },
  { href: "/review", label: "Review" }
];

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => (
  <div className="min-h-screen bg-surface text-on-surface">
    <header className="glass-bar fixed inset-x-0 top-0 z-50">
      <div className="page-shell flex items-center justify-between gap-6 py-4">
        <Link href="/" className="flex items-center gap-4">
          <div>
            <p className="font-headline text-[1.55rem] italic leading-none text-on-surface">Failure</p>
            <p className="font-headline -mt-1 text-[1.55rem] italic leading-none text-on-surface">Exchange</p>
          </div>
          <div className="hidden sm:block">
            <p className="section-kicker">Analytical Archive</p>
            <p className="mt-1 text-sm text-on-surface-variant">Reproducible AI failure markets</p>
          </div>
        </Link>
        <div className="hidden items-center gap-2 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 font-label text-[0.68rem] font-bold uppercase tracking-[0.18em] text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
            >
              {item.label}
            </Link>
          ))}
          <div className="ml-2 rounded-full bg-surface-container-high px-4 py-2">
            <p className="mono-kicker">Console v2.6</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden rounded-full bg-surface-container-high px-3 py-2 sm:block">
            <span className="mono-kicker">Research-ready</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-highest font-label text-[0.7rem] font-bold uppercase tracking-[0.16em] text-primary">
            FX
          </div>
        </div>
      </div>
    </header>
    <div className="page-shell pt-24">
      <main className="pb-24 pt-6">
        <Suspense>{children}</Suspense>
      </main>
      <nav className="bottom-nav-blur fixed inset-x-4 bottom-4 z-40 flex items-center justify-between rounded-full px-4 py-3 shadow-float lg:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="px-2 py-1 font-label text-[0.62rem] font-bold uppercase tracking-[0.18em] text-on-surface-variant"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  </div>
);
