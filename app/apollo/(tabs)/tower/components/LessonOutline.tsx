import clsx from "clsx";
import type { LessonDetail } from "../data/lessons";

type LessonOutlineProps = {
  lessons: LessonDetail[];
};

export default function LessonOutline({ lessons }: LessonOutlineProps) {
  const count = lessons.length;

  if (!count) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
          Lesson outline
        </p>
        <p className="mt-2 text-xs gaia-muted">
          Lesson details for this course are on the way. Track progress meanwhile
          and check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-cyan-100 bg-cyan-50/40 p-4">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-cyan-700/80">
        <span>Lesson outline</span>
        <span>{count} items</span>
      </div>
      <ol className="mt-3 space-y-3">
        {lessons.map((lesson, index) => (
          <li key={lesson.id} className="flex gap-3 rounded-xl px-3 py-2">
            <div className="text-xs font-semibold text-cyan-600">
              {(index + 1).toString().padStart(2, "0")}
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-slate-900">
                  {lesson.title}
                </p>
                <span
                  className={clsx(
                    "rounded-full border px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.2em]",
                    lesson.type === "project"
                      ? "border-emerald-200 bg-white text-emerald-600"
                      : "border-cyan-200 bg-white text-cyan-600"
                  )}
                >
                  {lesson.type === "project" ? "Project" : "Lesson"}
                </span>
                {lesson.duration ? (
                  <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    {lesson.duration}
                  </span>
                ) : null}
              </div>
              <p className="text-xs gaia-muted">{lesson.summary}</p>
              <div className="flex flex-wrap gap-2 text-xs">
                {lesson.url ? (
                  <a
                    href={lesson.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-cyan-200 bg-white px-2 py-0.5 font-semibold text-cyan-600 transition hover:border-cyan-400 hover:text-cyan-700"
                  >
                    Open
                    <span aria-hidden="true">↗</span>
                  </a>
                ) : null}
                {lesson.resources?.map((resource) => (
                  <a
                    key={`${lesson.id}-${resource.label}`}
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 font-semibold text-slate-600 transition hover:border-slate-300"
                  >
                    {resource.label}
                  </a>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
