import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import LessonReader from "../components/LessonReader";
import { lessonsByModuleId } from "../data/lessons";
import type { Module, Track } from "../data/tracks";
import { tracks } from "../data/tracks";

type PageProps = {
  params: { moduleId: string };
};

export function generateMetadata({ params }: PageProps): Metadata {
  const meta = findModule(params.moduleId);
  if (!meta) {
    return {
      title: "Module not found - GAIA Apollo",
    };
  }
  return {
    title: `${meta.module.title} - ${meta.track.title} - GAIA Apollo`,
    description: meta.module.summary,
  };
}

export default function ModuleLessonsPage({ params }: PageProps) {
  console.log("[tower] module route hit", params.moduleId);
  const meta = findModule(params.moduleId);
  if (!meta) notFound();
  const lessons = lessonsByModuleId[meta.module.id] ?? [];

  return (
    <main className="min-h-screen gaia-surface-soft">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <Link
          href="/apollo"
          className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 transition hover:text-cyan-600"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Tower
        </Link>

        <section className="rounded-3xl border gaia-border bg-white/90 p-6 shadow-sm">
          <div className="flex flex-wrap items-start gap-5">
            <div className="rounded-full border border-cyan-200 bg-cyan-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-700">
              {meta.track.title}
            </div>
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-700/70">
              Course #{meta.order.toString().padStart(2, "0")} of{" "}
              {meta.track.modules.length}
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <h1 className="text-3xl font-semibold text-slate-900">
              {meta.module.title}
            </h1>
            <p className="text-sm gaia-muted">{meta.module.summary}</p>
            <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.3em] text-slate-500">
              <span>{meta.module.lessons} lessons</span>
              <span>{meta.module.projects} projects</span>
              <span>
                Track progress with{" "}
                <strong className="text-slate-700">{meta.track.title}</strong>
              </span>
            </div>
          </div>
        </section>

        <LessonReader lessons={lessons} />
      </div>
    </main>
  );
}

function findModule(moduleId: string):
  | {
      track: Track;
      module: Module;
      order: number;
    }
  | null {
  for (const track of tracks) {
    const index = track.modules.findIndex((mod) => mod.id === moduleId);
    if (index !== -1) {
      return {
        track,
        module: track.modules[index],
        order: index + 1,
      };
    }
  }
  return null;
}
