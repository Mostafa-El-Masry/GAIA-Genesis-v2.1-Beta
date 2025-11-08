'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { listBuilds } from "@/app/labs/lib/labs";
import { hasVault } from "@/app/ELEUTHIA/lib/storage";

type Result = { conceptId: string; score: number; total: number; completedAt: number; notes?: string };

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function Active() {
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<Result[]>([]);
  const [vault, setVault] = useState<boolean>(false);
  const [buildCount, setBuildCount] = useState<number>(0);

  useEffect(() => {
    function load() {
      setProgress(readJSON("gaia.tower.progress", {}));
      setResults(readJSON<Result[]>("gaia.apollo.academy.results", []));
      setVault(hasVault());
      try {
        setBuildCount(listBuilds().length);
      } catch {
        setBuildCount(0);
      }
    }
    load();
    function onAny() {
      load();
    }
    window.addEventListener("storage", onAny);
    window.addEventListener("gaia:tower:progress", onAny as any);
    return () => {
      window.removeEventListener("storage", onAny);
      window.removeEventListener("gaia:tower:progress", onAny as any);
    };
  }, []);

  const unlocked = useMemo(() => Object.values(progress).filter(Boolean).length, [progress]);
  const last = useMemo(
    () => results.slice().sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0))[0],
    [results]
  );

  const cards = [
    {
      href: "/apollo",
      eyebrow: "Tower",
      value: unlocked,
      helper: "nodes unlocked",
      accent: "from-rose-500/30 via-transparent to-transparent text-rose-100",
    },
    {
      href: "/apollo/academy",
      eyebrow: "Last Academy score",
      value: last ? `${last.score}/${last.total}` : "\u2014",
      helper: last ? new Date(last.completedAt).toLocaleString() : "No sessions yet",
      accent: "from-sky-500/30 via-transparent to-transparent text-sky-100",
    },
    {
      href: "/Labs",
      eyebrow: "Labs builds",
      value: buildCount,
      helper: "completed concepts",
      accent: "from-amber-500/30 via-transparent to-transparent text-amber-100",
    },
    {
      href: "/ELEUTHIA",
      eyebrow: "ELEUTHIA",
      value: vault ? "Ready" : "Setup",
      helper: vault ? "Vault present" : "Create your vault",
      accent: "from-emerald-500/30 via-transparent to-transparent text-emerald-100",
    },
  ];

  return (
    <section className="space-y-6 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-950 via-slate-900/70 to-slate-950 p-6 shadow-2xl shadow-black/40">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Live snapshot</p>
          <h2 className="text-2xl font-semibold text-white">Active</h2>
        </div>
        <p className="text-sm text-slate-400 max-w-sm">
          Quick health check across the tower, academy, labs, and vault. Tap any tile to drill in.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-white transition hover:-translate-y-0.5 hover:border-white/30"
          >
            <div className={`pointer-events-none absolute inset-0 opacity-70 blur-2xl bg-gradient-to-br ${card.accent}`} />
            <div className="relative z-10">
              <div className="text-xs uppercase tracking-wide text-slate-300">{card.eyebrow}</div>
              <div className="mt-2 text-3xl font-semibold">{card.value}</div>
              <div className="text-xs text-slate-300">{card.helper}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
