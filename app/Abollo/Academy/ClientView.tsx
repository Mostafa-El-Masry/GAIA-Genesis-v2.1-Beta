"use client";

import { useRef, useState } from "react";
import LivePlayground from "./components/LivePlayground";
import { htmlCssPath } from "@/app/apollo/(tabs)/academy/data/academy";

type SelectedLesson = {
  sectionId: string;
  lessonId: string;
} | null;

function scrollWithOffset(element: HTMLElement, offset: number) {
  if (typeof window === "undefined") return;
  const rect = element.getBoundingClientRect();
  const targetY = window.scrollY + rect.top + offset;
  window.scrollTo({ top: targetY, behavior: "smooth" });
}

/**
 * Highlight inline code-like chunks such as <html>, <body>, etc.
 */
function renderWithInlineCode(text: string) {
  const parts = text.split(/(<[^>]+>)/g);
  return parts.map((part, idx) => {
    if (!part) return null;
    if (part.startsWith("<") && part.endsWith(">")) {
      return (
        <code
          key={idx}
          className="gaia-code rounded-md px-1.5 py-0.5 font-mono text-[0.8rem]"
        >
          {part}
        </code>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

function renderLessonBody(body: string) {
  const chunks = body.split("\n\n");
  return chunks.map((chunk, idx) => {
    if (!chunk.trim()) return null;

    if (chunk.includes("▶ Try in CodeBin:")) {
      const parts = chunk.split("▶ Try in CodeBin:");
      const rest = parts[1] ?? "";
      const lines = rest
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      const items = lines
        .filter((line) => line.startsWith("- "))
        .map((line) => line.slice(2));

      return (
        <div
          key={idx}
          className="gaia-ink-soft rounded-2xl p-3 sm:p-4 text-sm sm:text-[0.95rem] space-y-2"
        >
          <div className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] gaia-muted">
            Try in CodeBin
          </div>
          <ul className="list-disc pl-5 space-y-1">
            {items.map((item, i) => (
              <li key={i}>{renderWithInlineCode(item)}</li>
            ))}
          </ul>
        </div>
      );
    }

    return (
      <p
        key={idx}
        className="text-[0.95rem] sm:text-base leading-relaxed tracking-[0.01em]"
      >
        {renderWithInlineCode(chunk)}
      </p>
    );
  });
}

export default function ClientView() {
  const [selected, setSelected] = useState<SelectedLesson>(null);
  const topRef = useRef<HTMLDivElement | null>(null);
  const notesRef = useRef<HTMLDivElement | null>(null);

  const currentLesson = selected
    ? (() => {
        const section = htmlCssPath.sections.find(
          (s) => s.id === selected.sectionId
        );
        const lesson = section?.lessons.find((l) => l.id === selected.lessonId);
        if (!section || !lesson) return null;
        return { section, lesson };
      })()
    : null;

  function handleSelect(sectionId: string, lessonId: string) {
    setSelected({ sectionId, lessonId });
    if (notesRef.current) {
      // Scroll so that the actual lesson content is comfortably below the app bar
      scrollWithOffset(notesRef.current, -80);
    }
  }

  function scrollBackToTrack() {
    if (typeof window === "undefined") return;
    if (selected) {
      const cardId = `lesson-card-${selected.sectionId}-${selected.lessonId}`;
      const cardEl = document.getElementById(cardId);
      if (cardEl) {
        scrollWithOffset(cardEl as HTMLElement, -80);
        return;
      }
    }
    if (topRef.current) {
      scrollWithOffset(topRef.current, -80);
    }
  }

  return (
    <main className="min-h-screen gaia-surface">
      <div ref={topRef} className="mx-auto max-w-6xl space-y-10 px-4 py-12">
        <header className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] gaia-muted">
            Abollo → Academy
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold gaia-strong">
            {htmlCssPath.title}
          </h1>
          <p className="gaia-muted text-sm sm:text-base max-w-3xl">
            {htmlCssPath.overview}
          </p>
          <p className="gaia-muted text-xs sm:text-sm max-w-3xl">
            {htmlCssPath.description}
          </p>
        </header>

        {/* Tracks grid */}
        <section className="space-y-6">
          {htmlCssPath.sections.map((section) => (
            <div
              key={section.id}
              className="space-y-4 rounded-3xl gaia-panel-soft p-6 shadow-sm"
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] gaia-muted">
                    {section.level === "beginner"
                      ? "Beginner"
                      : section.level === "intermediate"
                      ? "Intermediate"
                      : "Advanced"}{" "}
                    track
                  </p>
                  <h2 className="text-xl sm:text-2xl font-semibold gaia-strong">
                    {section.title}
                  </h2>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {section.lessons.map((lesson) => {
                  const isActive =
                    selected &&
                    selected.sectionId === section.id &&
                    selected.lessonId === lesson.id;

                  return (
                    <article
                      key={lesson.id}
                      id={`lesson-card-${section.id}-${lesson.id}`}
                      className={`cursor-pointer rounded-2xl border gaia-border gaia-surface-soft p-4 shadow-sm transition hover:shadow-lg ${
                        isActive ? "ring-1 ring-emerald-400/70" : ""
                      }`}
                      onClick={() => handleSelect(section.id, lesson.id)}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold uppercase tracking-[0.25em] gaia-muted">
                        <span>
                          {lesson.type === "project" ? "Project" : "Lesson"}
                        </span>
                        <span className="gaia-chip inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.65rem] font-semibold">
                          {lesson.level}
                        </span>
                        {isActive && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.65rem] font-semibold text-emerald-600">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        )}
                      </div>
                      <h3 className="mt-2 text-base sm:text-lg font-semibold gaia-strong">
                        {lesson.title}
                      </h3>
                      <p className="mt-1 text-sm gaia-muted">
                        {lesson.summary}
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        {/* Lesson content */}
        <section
          ref={notesRef}
          className="space-y-4 rounded-3xl gaia-panel-soft p-6"
        >
          <div className="flex flex-col gap-3 border-b gaia-border pb-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">
                Lesson
              </p>
              <h2 className="text-xl sm:text-2xl font-semibold gaia-strong">
                {currentLesson ? currentLesson.lesson.title : "Pick a lesson"}
              </h2>
              <p className="mt-1 text-sm gaia-muted max-w-3xl">
                {currentLesson
                  ? currentLesson.lesson.summary
                  : "Click any card in the tracks above. This panel will show a full explanation, examples, and a mini checklist of things to try in the CodeBin."}
              </p>
            </div>
            <div className="flex gap-2">
              {currentLesson && (
                <span className="gaia-chip inline-flex items-center gap-2 rounded-full px-3 py-1 text-[0.7rem]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {currentLesson.section.title} · {currentLesson.lesson.level}
                </span>
              )}
              <button
                type="button"
                onClick={scrollBackToTrack}
                className="inline-flex items-center gap-2 rounded-full border gaia-border bg-transparent px-3 py-1 text-xs font-semibold gaia-muted hover:text-emerald-700 hover:border-emerald-400/70"
              >
                <span>Back to track</span>
                <span className="text-base leading-none">↑</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl gaia-panel-soft p-4 sm:p-5">
            {currentLesson ? (
              <div className="mx-auto max-w-4xl space-y-6">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] gaia-muted">
                    Step-by-step explanation
                  </p>
                  <p className="text-[0.9rem] sm:text-[0.95rem] gaia-muted">
                    {currentLesson.lesson.summary}
                  </p>
                </div>
                <div className="space-y-5 text-[0.95rem] sm:text-base leading-relaxed tracking-[0.01em]">
                  {renderLessonBody(currentLesson.lesson.body)}
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm gaia-muted">
                <p>
                  No lesson selected yet. Choose one of the cards above to load
                  a full beginner-friendly explanation here. Then scroll down to
                  the playground to practice.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Live playground below lesson, full width */}
        <section className="space-y-3 rounded-3xl gaia-panel-soft p-4 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">
            Live playground
          </p>
          <h2 className="text-lg sm:text-xl font-semibold gaia-strong">
            CodeBin — try what you just learned
          </h2>
          <p className="text-xs sm:text-sm gaia-muted max-w-3xl">
            Use the file tabs to add more pages or create extra files for
            experiments. Type the examples from the lesson above, or follow the
            "Try in CodeBin" checklist and see the result live.
          </p>
          <div className="mt-2 rounded-2xl gaia-panel-soft p-1 sm:p-2">
            <LivePlayground
              lessonId="academy-html-css"
              template="vanilla"
              starterKey="vanilla"
            />
          </div>
        </section>
      </div>
    </main>
  );
}
