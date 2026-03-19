import type { Metadata } from "next";

import { AppShell } from "@/components/app-shell";

import "./globals.css";

export const metadata: Metadata = {
  title: "Failure Exchange",
  description: "Marketplace and benchmark platform for reproducible AI coding failures."
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
