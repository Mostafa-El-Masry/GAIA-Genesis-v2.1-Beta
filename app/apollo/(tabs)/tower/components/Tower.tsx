"use client";

import { useState } from "react";
import { tracks } from "../data/tracks";
import { useTowerProgress } from "../lib/progress";

export default function Tower() {
  const { isUnlocked, toggleNode, countUnlocked } = useTowerProgress();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-lg font-medium">Tower</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {tracks.map((track) => {
          const modules = track.modules;
          const completed = modules.filter((m) => isUnlocked(m.id)).length;
          const progress = Math.round((completed / modules.length) * 100);
          const isExpanded = expanded === track.id;

          return (
            <div
              key={track.id}
              className="rounded-3xl border gaia-border p-5 scroll-mt-20 bg-[linear-gradient(135deg,rgba(34,211,238,0.04),transparent)] shadow-sm ring-1 ring-cyan-500/10"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-12 w-12 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-500/5 font-semibold text-cyan-600">
                    {track.title.slice(0, 1)}
                  </div>
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-[0.3em] text-cyan-700/80">
                      Path
                    </p>
                    <h3 className="text-lg font-semibold">{track.title}</h3>
                    <p className="text-sm gaia-muted max-w-sm">
                      {track.description}
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs gaia-muted">
                  <div>{modules.length} modules</div>
                  <div>{completed} unlocked</div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3 text-sm">
                <button
                  className="rounded-full border border-cyan-500/40 px-4 py-1 font-medium text-cyan-600 hover:bg-cyan-500/10"
                  onClick={() => setExpanded(isExpanded ? null : track.id)}
                >
                  {isExpanded ? "Hide modules" : "View modules"}
                </button>
                <button
                  className="rounded-full border border-cyan-500/30 px-4 py-1 text-cyan-700/80 hover:bg-cyan-500/5"
                  onClick={() => setExpanded(track.id)}
                >
                  Select path
                </button>
              </div>

              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-cyan-500/10">
                <div
                  className="h-2 rounded-full bg-cyan-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <ol className="mt-4 space-y-3 transition-all">
                {modules.map((module, index) => {
                  const unlocked = isUnlocked(module.id);
                  const allowed =
                    index === 0 ||
                    modules.slice(0, index).every((m) => isUnlocked(m.id));

                  return (
                    <li key={module.id}>
                      <div
                        role="button"
                        tabIndex={0}
                        aria-disabled={!unlocked && !allowed}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            if (unlocked) toggleNode(module.id, false);
                            else if (allowed) toggleNode(module.id, true);
                          }
                        }}
                        onClick={() => {
                          if (unlocked) {
                            toggleNode(module.id, false);
                          } else if (allowed) {
                            toggleNode(module.id, true);
                          }
                        }}
                        className="rounded-2xl border p-4 transition"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.25em] gaia-muted">
                              {unlocked
                                ? "Completed"
                                : allowed
                                ? "Ready"
                                : "Locked"}
                            </p>
                            <h4 className="text-base font-semibold">
                              {module.title}
                            </h4>
                          </div>
                          <div className="text-right text-xs gaia-muted">
                            <div>{module.lessons} lessons</div>
                            <div>{module.projects} projects</div>
                          </div>
                        </div>
                        <p className="mt-2 text-sm gaia-muted">
                          {module.summary}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          );
        })}
      </div>

      <p className="text-xs gaia-muted">
        Total modules unlocked: {countUnlocked()}
      </p>
    </section>
  );
}
