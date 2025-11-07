'use client';

import { useEffect, useMemo, useState } from "react";
import Button from "@/app/DesignSystem/components/Button";
import BuildCard from "./BuildCard";
import { listBuilds } from "../lib/labs";

export default function LabsClient() {
  const [builds, setBuilds] = useState<ReturnType<typeof listBuilds>>([]);
  const [track, setTrack] = useState<string>("all");

  function refresh() {
    setBuilds(listBuilds());
  }

  useEffect(() => {
    refresh();
    function onAnyChange() {
      refresh();
    }
    window.addEventListener("storage", onAnyChange);
    window.addEventListener("gaia:tower:progress", onAnyChange as any);
    return () => {
      window.removeEventListener("storage", onAnyChange);
      window.removeEventListener("gaia:tower:progress", onAnyChange as any);
    };
  }, []);

  const tracks = useMemo(() => {
    const set = new Set<string>();
    builds.forEach((b) => set.add(b.trackId));
    return ["all", ...Array.from(set)];
  }, [builds]);

  const filtered = useMemo(() => {
    return track === "all" ? builds : builds.filter((b) => b.trackId === track);
  }, [builds, track]);

  if (!builds.length) {
    return (
      <div className="gaia-panel gaia-muted rounded-lg border p-6 text-center text-sm">
        No builds yet. Finish a concept in the Academy (pass the quiz) and add a link in the Build step to see it here.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm">Track:</label>
          <select
            value={track}
            onChange={(e) => setTrack(e.target.value)}
            className="gaia-input rounded-md border px-3 py-2 text-sm focus:outline-none gaia-focus"
          >
            {tracks.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <Button onClick={refresh} className="shrink-0">Refresh</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filtered.map((b) => (
          <BuildCard key={b.conceptId} b={b} />
        ))}
      </div>
    </div>
  );
}

