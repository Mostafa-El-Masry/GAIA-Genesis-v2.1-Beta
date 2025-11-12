"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Button from "@/app/DesignSystem/components/Button";
import BuildCard from "./BuildCard";
import { listBuilds } from "../lib/labs";

export default function LabsClient() {
  const [builds, setBuilds] = useState<ReturnType<typeof listBuilds>>([]);
  const [track, setTrack] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("systems");

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

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b gaia-border">
        <button
          onClick={() => setActiveTab("systems")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
            activeTab === "systems"
              ? "border-blue-500 text-blue-600"
              : "border-transparent gaia-muted hover:text-foreground"
          }`}
        >
          💻 Systems
        </button>
        <button
          onClick={() => setActiveTab("academy")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
            activeTab === "academy"
              ? "border-blue-500 text-blue-600"
              : "border-transparent gaia-muted hover:text-foreground"
          }`}
        >
          🎓 Academy Builds
        </button>
      </div>

      {/* Systems Tab */}
      {activeTab === "systems" && (
        <div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Link
              href="/labs/inventory"
              className="gaia-panel gaia-border rounded-lg border p-4 hover:shadow-md transition block"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-base">
                    📦 Inventory Management
                  </h3>
                  <p className="text-xs gaia-muted mt-2">
                    Multi-location stock tracking, POS terminals, sales
                    recording, and cost accounting with real-time inventory
                    management
                  </p>
                </div>
              </div>
              <div className="text-xs text-blue-600 mt-4 font-medium">
                Open System →
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Academy Builds Tab */}
      {activeTab === "academy" && (
        <div>
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <label className="text-sm">Track:</label>
              <select
                value={track}
                onChange={(e) => setTrack(e.target.value)}
                className="gaia-input rounded-md border px-3 py-2 text-sm focus:outline-none gaia-focus"
              >
                {tracks.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={refresh} className="shrink-0">
              Refresh
            </Button>
          </div>

          {filtered.length === 0 ? (
            <div className="gaia-panel gaia-muted rounded-lg border p-6 text-center text-sm">
              No builds yet. Finish a concept in the Academy (pass the quiz) and
              add a link in the Build step to see it here.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filtered.map((b) => (
                <BuildCard key={b.conceptId} b={b} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
