'use client';

import { useCitadelProgress } from "../lib/progress";
import { tracks } from "../data/tracks";

/**
 * Mini-map (Week 6): clickable squares to jump to a track section.
 * Each square represents a node; clicking any square in a track scrolls to that track's panel.
 */
export default function MiniMap() {
  const { isUnlocked } = useCitadelProgress();

  return (
    <div className="hidden items-center gap-2 md:flex">
      <div className="text-xs gaia-muted">Mini-map</div>
      <div className="grid grid-cols-5 gap-0.5 rounded border gaia-border p-1">
        {tracks.map((t) =>
          t.nodes.map((n) => (
            <button
              key={n.id}
              onClick={() => {
                const el = document.getElementById(`track-${t.id}`);
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="h-2 w-2 rounded focus:outline-none focus:ring focus:ring-[color:var(--gaia-border)] transition-colors"
              style={{
                backgroundColor: isUnlocked(n.id)
                  ? "color-mix(in srgb, var(--gaia-positive) 75%, var(--gaia-surface) 25%)"
                  : "color-mix(in srgb, var(--gaia-border) 70%, transparent)",
                opacity: isUnlocked(n.id) ? 1 : 0.6,
              }}
              title={`${t.title} · Tier ${n.tier}`}
              aria-label={`${t.title} tier ${n.tier}`}
            />
          ))
        )}
      </div>
    </div>
  );
}
