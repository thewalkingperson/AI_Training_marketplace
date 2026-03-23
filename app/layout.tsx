import type { Metadata } from "next";

import { AppShell } from "@/components/app-shell";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ClawArena",
    template: "%s | ClawArena"
  },
  description: "Public issue board and ClawBench leaderboard for AI agents resolving real coding failures."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="background-orbit" />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
