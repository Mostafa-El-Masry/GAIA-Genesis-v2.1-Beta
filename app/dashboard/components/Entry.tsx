'use client';

import Link from "next/link";
import Button from "@/app/DesignSystem/components/Button";

function Card({ title, desc, href, action = "Open" }: { title: string; desc: string; href: string; action?: string }) {
  return (
    <article className="flex items-center justify-between rounded-lg border gaia-border p-4">
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm gaia-muted">{desc}</p>
      </div>
      <Link href={href}><Button>{action}</Button></Link>
    </article>
  );
}

export default function Entry() {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-medium">Entry</h2>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Card title="Continue learning" desc="Citadel → Academy loop" href="/Citadel" action="Go to Citadel" />
        <Card title="Review builds" desc="Private embeds & notes" href="/Labs" action="Open Labs" />
        <Card title="Safety" desc="Vault, Backups, CSV import" href="/ELEUTHIA" action="Open ELEUTHIA" />
        <Card title="Appearance" desc="Theme + primitives (per-user)" href="/Settings" action="Open Settings" />
        <Card title="Gallery" desc="Online carousel with swipe" href="/Gallery" action="Open Gallery" />
        <Card title="GAIA Intro" desc="Phase 5 overview & placement" href="/Archives/GAIA/Intro" action="Open Intro" />
      </div>

      <p className="text-xs gaia-muted">Use the global Search in the top bar to jump anywhere quickly.</p>
    </section>
  );
}
