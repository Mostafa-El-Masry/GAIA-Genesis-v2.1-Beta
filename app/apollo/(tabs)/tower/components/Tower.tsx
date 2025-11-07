"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { lessonsByModuleId } from "../data/lessons";
import type { Module as TrackModule } from "../data/tracks";
import { tracks } from "../data/tracks";
import { useTowerProgress } from "../lib/progress";
import LessonOutline from "./LessonOutline";

type ModuleState = TrackModule & {
  unlocked: boolean;
  ready: boolean;
  status: "Completed" | "Ready" | "Locked";
};

type TrackSummary = {
  id: string;
  title: string;
  description: string;
  modules: ModuleState[];
  unlockedCount: number;
  percent: number;
  totalLessons: number;
  totalProjects: number;
  nextAction: "Start" | "Continue" | "Open";
};

const pilotName = "GAIA Pilot";
const pilotGoal = "Shape your own Odin-style curriculum.";

export default function Tower() {
  const { isUnlocked, toggleNode, countUnlocked } = useTowerProgress();
  const router = useRouter();
  const [selectedTrackId, setSelectedTrackId] = useState<string>(
    () => tracks[0]?.id ?? ""
  );
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);

  const trackSummaries = useMemo<TrackSummary[]>(() => {
    return tracks.map((track) => {
      let previousComplete = true;
      const modulesWithState: ModuleState[] = track.modules.map(
        (module, index) => {
          const unlocked = isUnlocked(module.id);
          const ready = index === 0 || previousComplete;
          const status: ModuleState["status"] = unlocked
            ? "Completed"
            : ready
            ? "Ready"
            : "Locked";
          previousComplete = previousComplete && unlocked;
          return { ...module, unlocked, ready, status };
        }
      );

      const unlockedCount = modulesWithState.filter((m) => m.unlocked).length;
      const percent =
        modulesWithState.length > 0
          ? Math.round((unlockedCount / modulesWithState.length) * 100)
          : 0;
      const totalLessons = modulesWithState.reduce(
        (sum, m) => sum + m.lessons,
        0
      );
      const totalProjects = modulesWithState.reduce(
        (sum, m) => sum + m.projects,
        0
      );
      const nextAction =
        unlockedCount === 0
          ? "Start"
          : unlockedCount < modulesWithState.length
          ? "Continue"
          : "Open";

      return {
        id: track.id,
        title: track.title,
        description: track.description,
        modules: modulesWithState,
        unlockedCount,
        percent,
        totalLessons,
        totalProjects,
        nextAction,
      };
    });
  }, [isUnlocked]);

  const selectedTrack =
    trackSummaries.find((track) => track.id === selectedTrackId) ??
    trackSummaries[0];

  const totalModules = trackSummaries.reduce(
    (sum, track) => sum + track.modules.length,
    0
  );
  const totalLessons = trackSummaries.reduce(
    (sum, track) => sum + track.totalLessons,
    0
  );
  const totalProjects = trackSummaries.reduce(
    (sum, track) => sum + track.totalProjects,
    0
  );
  const unlockedTotal = countUnlocked();
  const overallPercent = totalModules
    ? Math.round((unlockedTotal / totalModules) * 100)
    : 0;

  useEffect(() => {
    setActiveModuleId(null);
  }, [selectedTrackId]);

  const [showSelectedPath, setShowSelectedPath] = useState(false);

  const handleSelectTrack = (trackId: string) => {
    setSelectedTrackId(trackId);
    setShowSelectedPath(true);
    if (typeof window !== "undefined") {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  };

  const focusModule = (moduleId: string) => {
    setActiveModuleId(moduleId);
    if (typeof window === "undefined") return;
    const el = document.getElementById(`tower-module-${moduleId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleOpenCourse = (module: ModuleState) => {
    if (!module.ready && !module.unlocked) return;
    setActiveModuleId(module.id);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("gaia:tower:open", {
          detail: { trackId: selectedTrack?.id, moduleId: module.id },
        })
      );
    }
    // Normalize the module ID before navigation to match the page's normalization
    const normalizedId = module.id.trim().replace(/\s+/g, "-").toLowerCase();
    router.push(`/apollo/tower/${encodeURIComponent(normalizedId)}`);
  };

  const handleModuleToggle = (module: ModuleState) => {
    if (module.unlocked) {
      toggleNode(module.id, false);
    } else if (module.ready) {
      toggleNode(module.id, true);
    }
  };

  return (
    <section
      className="space-y-8"
      aria-label="Apollo Tower learning dashboard styled like The Odin Project"
    >
      <div className="rounded-3xl border gaia-border bg-white/60 p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500/10 text-2xl font-semibold text-cyan-700">
              {pilotName.slice(0, 1)}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-700/70">
                Dashboard
              </p>
              <h2 className="text-2xl font-bold">{pilotName}</h2>
              <p className="text-sm gaia-muted">{pilotGoal}</p>
            </div>
          </div>
          <div className="text-right text-sm gaia-muted">
            <p>
              {unlockedTotal} of {totalModules} courses unlocked
            </p>
            <p>
              {totalLessons} lessons · {totalProjects} projects
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-8">
          {!showSelectedPath && (
            <section className="rounded-3xl border gaia-border bg-white/80 p-5 shadow-sm">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-cyan-700/80">
                    Skills Progress
                  </p>
                  <h3 className="text-2xl font-semibold">
                    Follow the learning path
                  </h3>
                  <p className="text-sm gaia-muted">
                    Start the next subject only when the current one is
                    complete—just like The Odin Project's dashboard flow.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <ProgressDonut value={overallPercent} size={86} />
                  <div className="text-xs uppercase tracking-[0.2em] text-cyan-700/70">
                    Overall
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {trackSummaries.map((track) => (
                  <article
                    key={track.id}
                    id={`track-${track.id}`}
                    className={clsx(
                      "rounded-3xl border px-5 py-4 shadow-sm transition",
                      selectedTrack?.id === track.id
                        ? "border-cyan-400/80 bg-white ring-2 ring-cyan-200"
                        : "gaia-border bg-white/70 hover:border-cyan-300/70"
                    )}
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                      <div className="flex flex-1 items-start gap-4">
                        <div className="mt-1 flex h-14 w-14 items-center justify-center rounded-full border border-cyan-200 bg-cyan-50 text-xl font-semibold text-cyan-700">
                          {track.title.slice(0, 1)}
                        </div>
                        <div>
                          <p className="text-[0.6rem] uppercase tracking-[0.35em] text-cyan-700/70">
                            Path
                          </p>
                          <h4 className="text-lg font-semibold">
                            {track.title}
                          </h4>
                          <p className="text-sm gaia-muted">
                            {track.description}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-4 text-xs gaia-muted">
                            <span>{track.modules.length} courses</span>
                            <span>{track.totalLessons} lessons</span>
                            <span>{track.totalProjects} projects</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3 text-sm">
                        <ProgressDonut value={track.percent} size={70} />
                        <button
                          type="button"
                          onClick={() => handleSelectTrack(track.id)}
                          className="rounded-full border border-cyan-500/60 px-4 py-1.5 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"
                        >
                          {track.nextAction}
                        </button>
                        <p className="text-xs gaia-muted">
                          {track.unlockedCount}/{track.modules.length} unlocked
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {showSelectedPath && selectedTrack && (
            <>
              <button
                onClick={() => setShowSelectedPath(false)}
                className="mb-4 flex items-center gap-2 text-sm text-cyan-600 hover:text-cyan-700"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to paths
              </button>
              <section
                id="tower-track-detail"
                className="rounded-3xl border gaia-border bg-white/90 p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-700">
                      Selected Path
                    </span>
                    <span className="text-sm font-semibold text-cyan-700">
                      {selectedTrack.percent}% complete
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold">
                      {selectedTrack.title}
                    </h3>
                    <p className="text-sm gaia-muted max-w-3xl">
                      {selectedTrack.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm gaia-muted">
                    <span>
                      {selectedTrack.unlockedCount}/
                      {selectedTrack.modules.length} courses unlocked
                    </span>
                    <span>{selectedTrack.totalLessons} lessons</span>
                    <span>{selectedTrack.totalProjects} projects</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-cyan-100">
                    <div
                      className="h-full rounded-full bg-cyan-600 transition-all"
                      style={{ width: `${selectedTrack.percent}%` }}
                      aria-label={`${selectedTrack.percent}% of ${selectedTrack.title} complete`}
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {selectedTrack.modules.map((module, index) => {
                    const moduleIsActive = activeModuleId === module.id;
                    const moduleLessons = lessonsByModuleId[module.id] ?? [];
                    const openLabel = module.unlocked
                      ? "Review course"
                      : module.ready
                      ? "Open course"
                      : "Locked";

                    return (
                      <article
                        key={module.id}
                        id={`tower-module-${module.id}`}
                        className={clsx(
                          "rounded-2xl border bg-white/80 p-4 shadow-sm transition",
                          moduleIsActive
                            ? "border-cyan-400 ring-2 ring-cyan-200"
                            : "gaia-border hover:border-cyan-200"
                        )}
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                          <div className="flex-1">
                            <ModuleStatusBadge
                              status={module.status}
                              order={index + 1}
                            />
                            <h4 className="mt-2 text-lg font-semibold">
                              {module.title}
                            </h4>
                            <p className="text-sm gaia-muted">
                              {module.summary}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2 text-right text-xs gaia-muted">
                            <div>{module.lessons} lessons</div>
                            <div>{module.projects} projects</div>
                            <div className="mt-1 flex flex-wrap justify-end gap-2">
                              <button
                                type="button"
                                disabled={!module.ready && !module.unlocked}
                                onClick={() => handleOpenCourse(module)}
                                className={clsx(
                                  "rounded-full border px-3 py-1 text-sm font-semibold transition",
                                  module.ready || module.unlocked
                                    ? "border-cyan-400 text-cyan-700 hover:bg-cyan-500/10"
                                    : "cursor-not-allowed border-slate-200 text-slate-400"
                                )}
                              >
                                {openLabel}
                              </button>
                              <button
                                type="button"
                                disabled={!module.ready && !module.unlocked}
                                onClick={() => handleModuleToggle(module)}
                                className={clsx(
                                  "rounded-full border px-3 py-1 text-sm font-semibold transition",
                                  module.unlocked
                                    ? "border-emerald-300 text-emerald-700 hover:bg-emerald-500/10"
                                    : module.ready
                                    ? "border-amber-300 text-amber-700 hover:bg-amber-500/10"
                                    : "cursor-not-allowed border-slate-200 text-slate-400"
                                )}
                              >
                                {module.unlocked
                                  ? "Mark incomplete"
                                  : "Mark complete"}
                              </button>
                            </div>
                          </div>
                        </div>
                        {moduleIsActive ? (
                          <div className="mt-4">
                            <LessonOutline lessons={moduleLessons} />
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              </section>
            </>
          )}
        </div>

        <aside className="lg:block">
          <div className="sticky top-4 space-y-4">
            <div className="rounded-3xl border gaia-border bg-white/80 p-4 text-center shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-700/70">
                Mission Status
              </p>
              <div className="mt-4 flex justify-center">
                <ProgressDonut value={overallPercent} size={96} />
              </div>
              <p className="mt-4 text-sm font-semibold">
                {unlockedTotal} / {totalModules} courses unlocked
              </p>
              <p className="text-xs gaia-muted">
                {totalLessons} lessons · {totalProjects} projects overall
              </p>
            </div>

            <div className="rounded-3xl border gaia-border bg-white/90 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-700/70">
                Path navigator
              </p>
              <ol className="mt-4 space-y-3">
                {trackSummaries.map((track) => (
                  <li key={`nav-${track.id}`}>
                    <button
                      type="button"
                      onClick={() => handleSelectTrack(track.id)}
                      className={clsx(
                        "w-full rounded-2xl border px-3 py-2 text-left transition",
                        selectedTrack?.id === track.id
                          ? "border-cyan-400 bg-white shadow"
                          : "gaia-border hover:border-cyan-200"
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[0.55rem] uppercase tracking-[0.35em] gaia-muted">
                            Path
                          </p>
                          <p className="text-sm font-semibold">{track.title}</p>
                        </div>
                        <div className="text-right text-xs">
                          <p className="font-semibold text-cyan-600">
                            {track.percent}%
                          </p>
                          <p className="gaia-muted">
                            {track.unlockedCount}/{track.modules.length}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 h-1.5 w-full rounded-full bg-cyan-100">
                        <div
                          className="h-full rounded-full bg-cyan-500 transition-all"
                          style={{ width: `${track.percent}%` }}
                        />
                      </div>
                    </button>
                  </li>
                ))}
              </ol>
            </div>

            {selectedTrack ? (
              <div className="rounded-3xl border gaia-border bg-white/90 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-700/70">
                  Lesson contents
                </p>
                <ol className="mt-4 space-y-1">
                  {selectedTrack.modules.map((module) => (
                    <li key={`toc-${module.id}`}>
                      <button
                        type="button"
                        onClick={() => focusModule(module.id)}
                        className={clsx(
                          "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition hover:bg-white",
                          module.unlocked
                            ? "text-cyan-700"
                            : module.ready
                            ? "text-slate-800"
                            : "text-slate-400"
                        )}
                      >
                        <span className="flex-1">{module.title}</span>
                        {module.unlocked ? (
                          <span className="text-xs font-semibold text-emerald-600">
                            ✓
                          </span>
                        ) : null}
                      </button>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </section>
  );
}

type ProgressDonutProps = {
  value: number;
  size?: number;
};

function ProgressDonut({ value, size = 80 }: ProgressDonutProps) {
  const clamped = Number.isFinite(value)
    ? Math.min(100, Math.max(0, Math.round(value)))
    : 0;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className="relative inline-flex"
      role="img"
      aria-label={`${clamped}% complete`}
    >
      <svg width={size} height={size}>
        <circle
          stroke="rgba(14,165,233,0.15)"
          strokeWidth={strokeWidth}
          fill="transparent"
          cx={size / 2}
          cy={size / 2}
          r={radius}
        />
        <circle
          stroke="rgb(6,182,212)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="transition-all duration-300 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-xs font-semibold text-cyan-700">
        <span>{clamped}%</span>
        <span className="text-[0.55rem] uppercase tracking-[0.3em] text-cyan-600">
          Done
        </span>
      </div>
    </div>
  );
}

function ModuleStatusBadge({
  status,
  order,
}: {
  status: ModuleState["status"];
  order: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold text-slate-500">
        #{order.toString().padStart(2, "0")}
      </span>
      <span
        className={clsx(
          "inline-flex items-center gap-1 rounded-full border px-3 py-0.5 text-xs font-semibold uppercase tracking-[0.2em]",
          status === "Completed" &&
            "border-emerald-200 bg-emerald-50 text-emerald-700",
          status === "Ready" && "border-amber-200 bg-amber-50 text-amber-700",
          status === "Locked" && "border-slate-200 bg-slate-50 text-slate-500"
        )}
      >
        {status}
      </span>
    </div>
  );
}
