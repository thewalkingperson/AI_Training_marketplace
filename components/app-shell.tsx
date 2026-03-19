import Link from "next/link";
import { Suspense } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse cases" },
  { href: "/submit", label: "Submit" },
  { href: "/dashboard/contributor", label: "Contributor" },
  { href: "/dashboard/sponsor", label: "Sponsor" },
  { href: "/review", label: "Review" }
];

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => (
  <div className="min-h-screen bg-canvas text-ink">
    <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10">
      <header className="rounded-full border border-ink/10 bg-white/80 px-5 py-3 shadow-card backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-ink text-sm font-bold text-canvas">
              FX
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/55">Failure Exchange</p>
              <p className="text-lg font-semibold text-ink">Reproducible AI failure markets</p>
            </div>
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-ink/70">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 transition hover:bg-ink hover:text-canvas"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="pb-12 pt-10">
        <Suspense>{children}</Suspense>
      </main>
    </div>
  </div>
);
