'use client';

import { tracks } from "../data/tracks";
import { useTowerProgress } from "../lib/progress";
import MiniMap from "./TowerMiniMap";

/**
 * Tower v1 (Week 4 + Week 6 anchors)
 * - Tier gating
 * - Reveal hint on next unlockable
 * - Each track has an anchor id for mini-map navigation
 */
export default function Tower() {
  const { isUnlocked, toggleNode, countUnlocked } = useTowerProgress();

  function canUnlock(trackId: string, tier: 1 | 2 | 3 | 4 | 5) {
    if (tier === 1) return true;
    for (let t = 1 as 1 | 2 | 3 | 4 | 5; t < tier; t = ((t + 1) as any)) {
      const id = `${trackId}-t${t}`;
      if (!isUnlocked(id)) return false;
    }
    return true;
  }

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium">Tower</h2>
          <p className="mt-1 text-xs gaia-muted">
            Unlock tiers in order per track. Tier 2 requires Tier 1, etc. The next unlockable node will gently pulse.
          </p>
        </div>
        <MiniMap />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {tracks.map((track) => {
          const nextId = track.nodes.find((n) => !isUnlocked(n.id) && canUnlock(track.id, n.tier))?.id;

          return (
            <div
              key={track.id}
              id={`track-${track.id}`}
              className="rounded-lg border gaia-border p-4 scroll-mt-20 bg-[linear-gradient(135deg,rgba(34,211,238,0.06),transparent)] ring-1 ring-cyan-500/10 hover:ring-cyan-300/20 transition"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">{track.title}</h3>
                <span className="text-xs gaia-muted">
                  {track.nodes.filter((n) => isUnlocked(n.id)).length}/5
                </span>
              </div>

              <ol className="space-y-2">
                {track.nodes.map((node) => {
                  const unlocked = isUnlocked(node.id);
                  const allowed = canUnlock(track.id, node.tier);
                  const unlockable = !unlocked && allowed;
                  const isNext = node.id === nextId;

                  const classes = [
                    "w-full rounded-md border p-3 text-left transition focus:outline-none",
                  ];
                  if (unlocked) {
                    classes.push(
                      "gaia-node-unlocked",
                      "border-cyan-400/50 bg-cyan-500/10 shadow-[0_0_0_1px_rgba(34,211,238,0.25)]"
                    );
                  } else if (unlockable) {
                    classes.push(
                      "gaia-border",
                      "gaia-hover-soft",
                      "gaia-ring-soft",
                      "hover:ring-1 hover:ring-cyan-400/40 hover:shadow-cyan-500/25 hover:bg-cyan-500/5"
                    );
                    if (isNext) classes.push("animate-pulse");
                  } else {
                    classes.push("gaia-border", "gaia-muted", "cursor-not-allowed");
                  }

                  return (
                    <li key={node.id}>
                      <button
                        onClick={() => {
                          if (unlocked) {
                            toggleNode(node.id, false);
                          } else if (allowed) {
                            toggleNode(node.id, true);
                          }
                        }}
                        aria-disabled={!unlocked && !allowed}
                        className={classes.join(" ")}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs gaia-muted">Tier {node.tier}</span>
                          <span className="text-xs">{unlocked ? "Unlocked" : allowed ? "Ready" : "Locked"}</span>
                        </div>
                        <div className="mt-1 font-medium">{node.title}</div>
                        {!unlocked && allowed && (
                          <div className="mt-2 text-[11px] gaia-muted">Click to unlock</div>
                        )}
                        {!allowed && !unlocked && (
                          <div className="mt-2 text-[11px] gaia-muted">
                            Requires previous tier in {track.title}
                          </div>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          );
        })}
      </div>

      <p className="text-xs gaia-muted">Total unlocked: {countUnlocked()}</p>
    </section>
  );
}
