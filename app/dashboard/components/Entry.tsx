'use client';

import Link from "next/link";
import Button from "@/app/DesignSystem/components/Button";

const entries = [
  {
    title: "Archives & Ask",
    desc: "Study transcripts, ask the assistant, and keep longform notes.",
    href: "/apollo",
    action: "Open Apollo",
    tag: "Research",
    accent: "from-fuchsia-500/30 via-transparent to-transparent",
  },
  {
    title: "Review builds",
    desc: "Private embeds, annotations, and build timelines.",
    href: "/Labs",
    action: "Open Labs",
    tag: "Labs",
    accent: "from-amber-400/30 via-transparent to-transparent",
  },
  {
    title: "Safety",
    desc: "Vault setup, backups, CSV import, and recovery tooling.",
    href: "/ELEUTHIA",
    action: "Open ELEUTHIA",
    tag: "Security",
    accent: "from-emerald-400/30 via-transparent to-transparent",
  },
  {
    title: "Appearance",
    desc: "Personal themes, primitives, and typography controls.",
    href: "/Settings",
    action: "Open Settings",
    tag: "Personalize",
    accent: "from-sky-400/30 via-transparent to-transparent",
  },
  {
    title: "Gallery",
    desc: "Online carousel with swipe-ready, curated drops.",
    href: "/Gallery",
    action: "Open Gallery",
    tag: "Showcase",
    accent: "from-rose-400/30 via-transparent to-transparent",
  },
  {
    title: "GAIA Intro",
    desc: "Phase 5 overview, placement, and onboarding materials.",
    href: "/Archives/GAIA/Intro",
    action: "Open Intro",
    tag: "Orientation",
    accent: "from-indigo-400/30 via-transparent to-transparent",
  },
];

export default function Entry() {
  return (
    <section className="space-y-6 rounded-2xl border border-white/5 bg-slate-950/60 p-6 shadow-2xl shadow-black/30">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Entry points</p>
        <h2 className="text-2xl font-semibold text-white">Choose your lane</h2>
        <p className="text-sm text-slate-400">
          Each surface is tuned for a different part of the workflow. Pick one to jump straight in.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {entries.map((entry) => (
          <article
            key={entry.href}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 p-5 transition hover:-translate-y-0.5 hover:border-white/30"
          >
            <div className={`pointer-events-none absolute inset-0 opacity-60 blur-2xl bg-gradient-to-br ${entry.accent}`} />
            <div className="relative z-10 flex flex-col gap-4">
              <div>
                <span className="inline-flex items-center rounded-full border border-white/20 px-3 py-1 text-[11px] uppercase tracking-wide text-slate-200">
                  {entry.tag}
                </span>
                <h3 className="mt-3 text-xl font-semibold text-white">{entry.title}</h3>
                <p className="text-sm text-slate-300">{entry.desc}</p>
              </div>
              <div>
                <Link href={entry.href}>
                  <Button className="w-full justify-between bg-white/10 text-white hover:bg-white/20">
                    <span>{entry.action}</span>
                    <span aria-hidden="true">{">"}</span>
                  </Button>
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      <p className="text-xs text-slate-500">Tip: use global search (Cmd+K / Ctrl+K) to hop anywhere instantly.</p>
    </section>
  );
}
