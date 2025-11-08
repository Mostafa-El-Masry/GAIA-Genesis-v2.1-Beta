"use client";

import clsx from "clsx";
import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import type { LessonDetail } from "../../../data/lessons";
import type {
  LessonSeedPayload,
  PracticeLanguage,
} from "../../../lib/practiceStore";

type LessonPaneProps = {
  lessons: LessonDetail[];
  onSeedSnippet: (payload: LessonSeedPayload) => void;
};

type LessonSelection = {
  id: string;
  lessonId: string;
  lessonTitle: string;
  lang: PracticeLanguage;
  code: string;
};

export default function LessonPane({
  lessons,
  onSeedSnippet,
}: LessonPaneProps) {
  const [activeLessonId, setActiveLessonId] = useState<string>(
    () => lessons[0]?.id ?? ""
  );
  const [selectedBlocks, setSelectedBlocks] = useState<
    Record<string, LessonSelection>
  >({});

  const activeLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === activeLessonId) ?? lessons[0],
    [activeLessonId, lessons]
  );

  const selectedCount = Object.keys(selectedBlocks).length;

  const handleSelectLesson = (lessonId: string) => {
    setActiveLessonId(lessonId);
    setSelectedBlocks({});
  };

  const handleSendSelected = () => {
    if (!selectedCount || !activeLesson) return;
    const payload: LessonSeedPayload = {
      snippetId: activeLesson.id,
      label: `Lesson: ${activeLesson.title}`,
    };
    Object.values(selectedBlocks).forEach((block) => {
      const prev = payload[block.lang] ?? "";
      const next = prev ? `${prev.trimEnd()}\n\n${block.code}` : block.code;
      payload[block.lang] = next;
    });
    onSeedSnippet(payload);
    setSelectedBlocks({});
  };

  const handleSeedBlock = (block: LessonSelection) => {
    onSeedSnippet({
      snippetId: block.lessonId,
      label: `Lesson: ${block.lessonTitle}`,
      [block.lang]: block.code,
    });
  };

  const toggleBlock = (block: LessonSelection) => {
    setSelectedBlocks((prev) => {
      const next = { ...prev };
      if (next[block.id]) {
        delete next[block.id];
      } else {
        next[block.id] = block;
      }
      return next;
    });
  };

  return (
    <div className="flex h-full flex-col rounded-3xl border gaia-border bg-white/90 p-4 shadow-sm">
      <header className="flex flex-wrap items-center gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-700/70">
            Lesson
          </p>
          <h2 className="text-xl font-semibold text-slate-900">
            {activeLesson?.title ?? "Select a lesson"}
          </h2>
        </div>
        {selectedCount > 0 ? (
          <div className="ml-auto flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50/80 px-3 py-1 text-xs font-semibold text-cyan-700">
            {selectedCount} block{selectedCount > 1 ? "s" : ""} selected
            <button
              type="button"
              onClick={() => setSelectedBlocks({})}
              className="text-[0.75rem] uppercase tracking-[0.2em] text-cyan-500 transition hover:text-cyan-700"
            >
              Clear
            </button>
          </div>
        ) : null}
      </header>

      <div className="mt-4 grid gap-4 text-sm lg:grid-cols-[220px_minmax(0,1fr)]">
        {lessons.length ? (
          <ol className="space-y-2 rounded-2xl border border-slate-200 bg-white/80 p-3">
            {lessons.map((lesson, index) => (
              <li key={lesson.id}>
                <button
                  type="button"
                  onClick={() => handleSelectLesson(lesson.id)}
                  className={clsx(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition",
                    lesson.id === activeLesson?.id
                      ? "bg-cyan-100/60 text-cyan-800"
                      : "hover:bg-slate-100 text-slate-600"
                  )}
                >
                  <span className="text-xs font-semibold text-slate-400">
                    {(index + 1).toString().padStart(2, "0")}
                  </span>
                  <span className="flex-1 text-xs font-semibold">
                    {lesson.title}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-4 text-xs text-slate-500">
            Lessons will appear here once they are published for this topic.
          </div>
        )}

        <div className="space-y-6">
          {activeLesson?.body ? (
            <LessonBody
              lesson={activeLesson}
              selectedBlocks={selectedBlocks}
              onToggleBlock={toggleBlock}
              onSeedBlock={handleSeedBlock}
            />
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-sm text-slate-500">
              Lesson content is coming soon. Explore the outline meanwhile.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={!selectedCount}
              onClick={handleSendSelected}
              className={clsx(
                "inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold shadow-sm transition",
                selectedCount
                  ? "border-cyan-200 bg-cyan-600 text-white hover:bg-cyan-500"
                  : "border-slate-200 bg-slate-100 text-slate-400"
              )}
            >
              Send selected to Practice
            </button>
            <p className="text-xs text-slate-500">
              Pick multiple code blocks, then send them into the editor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LessonBody({
  lesson,
  selectedBlocks,
  onToggleBlock,
  onSeedBlock,
}: {
  lesson: LessonDetail;
  selectedBlocks: Record<string, LessonSelection>;
  onToggleBlock: (block: LessonSelection) => void;
  onSeedBlock: (block: LessonSelection) => void;
}) {
  let blockIndex = 0;
  const components: Components = {
    code({ inline, className, children, ...rest }: any) {
      if (inline) {
        return (
          <code className="rounded bg-slate-100 px-1 py-0.5 text-[0.9em]">
            {children}
          </code>
        );
      }
      const raw = String(children ?? "").replace(/\n$/, "");
      const langMatch = /language-(\w+)/.exec(className ?? "");
      const lang = (langMatch?.[1] ?? "text").toLowerCase();

      if (lang !== "html" && lang !== "css" && lang !== "js") {
        return (
          <pre className="rounded-2xl bg-slate-900/90 p-4 text-[0.85em] text-slate-50">
            <code>{raw}</code>
          </pre>
        );
      }

      const blockId = `${lesson.id}-code-${blockIndex++}`;
      const block: LessonSelection = {
        id: blockId,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        lang,
        code: raw,
      };
      const selected = Boolean(selectedBlocks[blockId]);

      return (
        <figure className="rounded-2xl border border-slate-200 bg-slate-950/95 text-[0.85em] text-slate-200 shadow-inner">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-[0.65rem] uppercase tracking-[0.3em] text-slate-400">
            <span>{lang.toUpperCase()}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onSeedBlock(block)}
                className="rounded-full border border-cyan-300/60 px-3 py-0.5 text-[0.65rem] font-semibold text-cyan-200 transition hover:border-cyan-200 hover:text-white"
              >
                Try in editor
              </button>
              <button
                type="button"
                onClick={() => onToggleBlock(block)}
                className={clsx(
                  "rounded-full border px-3 py-0.5 text-[0.65rem] font-semibold transition",
                  selected
                    ? "border-emerald-300/80 bg-emerald-400/20 text-emerald-100"
                    : "border-white/10 text-slate-400 hover:border-slate-100/40"
                )}
              >
                {selected ? "Selected" : "Queue"}
              </button>
            </div>
          </div>
          <pre className="overflow-auto px-4 py-3">
            <code className={className} {...rest}>
              {raw}
            </code>
          </pre>
        </figure>
      );
    },
    h3({ children }) {
      return (
        <h3 className="text-lg font-semibold text-slate-900">{children}</h3>
      );
    },
    p({ children }) {
      return <p className="leading-relaxed text-slate-600">{children}</p>;
    },
    ul({ children }) {
      return (
        <ul className="list-disc space-y-1 pl-5 text-slate-600">{children}</ul>
      );
    },
    ol({ children }) {
      return (
        <ol className="list-decimal space-y-1 pl-5 text-slate-600">
          {children}
        </ol>
      );
    },
    li({ children }) {
      return <li className="marker:text-slate-400">{children}</li>;
    },
    table({ children }) {
      return (
        <div className="overflow-auto rounded-2xl border border-slate-200">
          <table className="w-full border-collapse text-left text-sm text-slate-600">
            {children}
          </table>
        </div>
      );
    },
    thead({ children }) {
      return (
        <thead className="bg-slate-100/80 text-xs uppercase tracking-[0.2em] text-slate-500">
          {children}
        </thead>
      );
    },
    th({ children }) {
      return <th className="px-3 py-2">{children}</th>;
    },
    td({ children }) {
      return <td className="px-3 py-2">{children}</td>;
    },
  };

  return (
    <article className="prose prose-slate max-w-none space-y-4 text-sm">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {activeBody(lesson.body)}
      </ReactMarkdown>
    </article>
  );
}

function activeBody(body?: string) {
  if (!body) {
    return "Content coming soon.";
  }
  return body;
}
