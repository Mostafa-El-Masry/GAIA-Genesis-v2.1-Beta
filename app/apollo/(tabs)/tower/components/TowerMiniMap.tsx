'use client';

import { useTowerProgress } from "../lib/progress";
import { tracks } from "../data/tracks";

/**
 * Mini-map (Week 6): clickable squares to jump to a track section.
 * Each square represents a node; clicking any square in a track scrolls to that track's panel.
 */
export default function MiniMap() {
  const { isUnlocked } = useTowerProgress();

  return (
    <div className="hidden items-center gap-2 md:flex">
      <div className="text-xs gaia-muted">Mini-map</div>
      <div className="grid grid-cols-5 gap-0.5 rounded border gaia-border p-1 ring-1 ring-cyan-500/20">
        {tracks.map((t) =>\n          t.modules.map((n) => (
            <button
              key={n.id}
              onClick={() => {
                const el = document.getElementById(`track-${t.id}`);
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="h-2 w-2 rounded focus:outline-none focus:ring focus:ring-cyan-400/40 transition-colors shadow-[0_0_6px_rgba(34,211,238,.35)]"
              style={{
                backgroundColor: isUnlocked(n.id)
                  ? "rgba(34,211,238,0.85)"
                  : "color-mix(in srgb, var(--gaia-border) 70%, transparent)",
                opacity: isUnlocked(n.id) ? 1 : 0.6,
              }}
              title={`${t.title} Â· Tier ${n.tier}`}
              aria-label={`${t.title} tier ${n.tier}`}
            />
          ))
        )}
      </div>
    </div>
  );
}

