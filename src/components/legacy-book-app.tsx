"use client";

import dynamic from "next/dynamic";

const LegacyBookApp = dynamic(() => import("@/legacy/App"), {
  ssr: false,
  loading: () => <main className="loading-page">Loading The Final Book Project...</main>
});

export function LegacyBookAppShell() {
  return <LegacyBookApp />;
}
