"use client";

import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { LessonDetail } from "../data/lessons";

type LessonReaderProps = {
  lessons: LessonDetail[];
};

type LessonContentState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; body: string }
  | { status: "error"; message: string }
  | { status: "external"; message: string };

const BLOBS_BASE = "https://github.com/TheOdinProject/curriculum/blob/main/";
const RAW_BASE =
  "https://raw.githubusercontent.com/TheOdinProject/curriculum/main/";

export default function LessonReader({ lessons }: LessonReaderProps) {
  function toRawUrl(url?: string | null) {
    if (!url) return null;
    if (!url.startsWith(BLOBS_BASE)) return null;
    return url.replace(BLOBS_BASE, RAW_BASE);
  }

  function toAssetBase(url?: string | null) {
    if (!url || !url.startsWith(BLOBS_BASE)) return null;
    const path = url.slice(BLOBS_BASE.length);
    const parts = path.split("/");
    parts.pop();
    return `${RAW_BASE}${parts.join("/")}`;
  }

  const [activeLessonId, setActiveLessonId] = useState<string | null>(
    lessons[0]?.id ?? null
  );
  const [content, setContent] = useState<Record<string, LessonContentState>>(
    {}
  );

  const activeLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === activeLessonId) ?? null,
    [activeLessonId, lessons]
  );

  const rawUrl = activeLesson ? toRawUrl(activeLesson.url) : null;
  const assetBase = activeLesson ? toAssetBase(activeLesson.url) : null;

  useEffect(() => {
    if (!activeLessonId || !activeLesson) return;

    if (!rawUrl) {
      setContent((prev) => {
        if (prev[activeLessonId]?.status === "external") return prev;
        return {
          ...prev,
          [activeLessonId]: {
            status: "external",
            message:
              "This lesson links to an external reference. Use the link below to open it in a new tab.",
          },
        };
      });
      return;
    }

    let shouldFetch = false;
    setContent((prev) => {
      const existing = prev[activeLessonId];
      if (
        existing &&
        (existing.status === "ready" || existing.status === "loading")
      ) {
        return prev;
      }
      shouldFetch = true;
      return { ...prev, [activeLessonId]: { status: "loading" } };
    });
    if (!shouldFetch) return;

    let aborted = false;
    fetch(rawUrl)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Lesson fetch failed (${res.status})`);
        }
        return res.text();
      })
      .then((body) => {
        if (aborted) return;
        setContent((prev) => ({
          ...prev,
          [activeLessonId]: { status: "ready", body },
        }));
      })
      .catch((error) => {
        if (aborted) return;
        setContent((prev) => ({
          ...prev,
          [activeLessonId]: {
            status: "error",
            message: error instanceof Error ? error.message : "Unknown error",
          },
        }));
      });

    return () => {
      aborted = true;
    };
  }, [activeLessonId, activeLesson, rawUrl]);

  if (!lessons.length) {
    return (
      <section className="rounded-2xl border border-dashed gaia-border bg-white/90 p-6 text-center text-sm gaia-muted">
        Lesson details for this module are coming soon. For now, follow the
        outline on the Tower page to keep your progress moving.
      </section>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      <section className="rounded-2xl border gaia-border bg-white/90 p-4 shadow-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-700/70">
          Lesson playlist
        </p>
        <ol className="mt-3 space-y-1">
          {lessons.map((lesson, index) => {
            const isActive = lesson.id === activeLessonId;
            return (
              <li key={lesson.id}>
                <button
                  type="button"
                  onClick={() => setActiveLessonId(lesson.id)}
                  className={clsx(
                    "w-full rounded-xl px-3 py-2 text-left text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400",
                    isActive
                      ? "bg-cyan-600 text-white shadow"
                      : "hover:bg-cyan-50 text-slate-700"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{lesson.title}</span>
                    <span className="text-[0.55rem] uppercase tracking-[0.2em] text-current/70">
                      {(index + 1).toString().padStart(2, "0")}
                    </span>
                  </div>
                  <p className="text-xs text-current/80">{lesson.summary}</p>
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="rounded-2xl border gaia-border bg-white/95 p-5 shadow-sm">
        {activeLesson ? (
          <>
            <header className="space-y-2 border-b border-slate-100 pb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-700/70">
                Lesson #{getLessonNumber(lessons, activeLesson.id)}
              </p>
              <h2 className="text-2xl font-semibold text-slate-900">
                {activeLesson.title}
              </h2>
              <p className="text-sm gaia-muted">{activeLesson.summary}</p>
              <div className="flex flex-wrap gap-2 text-xs">
                {activeLesson.url ? (
                  <a
                    href={activeLesson.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-cyan-200 bg-white px-3 py-1 font-semibold text-cyan-700 transition hover:border-cyan-400"
                  >
                    View source
                    <span aria-hidden="true">↗</span>
                  </a>
                ) : null}
                {activeLesson.resources?.map((resource) => (
                  <a
                    key={`${activeLesson.id}-${resource.label}`}
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300"
                  >
                    {resource.label}
                  </a>
                ))}
              </div>
            </header>
            <article className="prose prose-slate mt-4 max-w-none text-sm">
              <LessonBody
                state={content[activeLesson.id]}
                assetBase={assetBase}
              />
            </article>
          </>
        ) : (
          <div className="text-sm gaia-muted">
            Select a lesson on the left to start reading its content.
          </div>
        )}
      </section>
    </div>
  );
}

function LessonBody({
  state,
  assetBase,
}: {
  state?: LessonContentState;
  assetBase: string | null;
}) {
  if (!state || state.status === "idle") {
    return <p className="gaia-muted">Pick a lesson from the list.</p>;
  }
  if (state.status === "loading") {
    return <p className="gaia-muted">Loading lesson content…</p>;
  }
  if (state.status === "external") {
    return <p className="gaia-muted">{state.message}</p>;
  }
  if (state.status === "error") {
    return (
      <p className="text-rose-600">
        Could not load this lesson: {state.message}
      </p>
    );
  }
  const CodeRenderer = (props: any) => {
    const { inline, className, children, ...rest } = props;
    return (
      <code
        {...rest}
        className={clsx(
          className,
          inline
            ? "rounded bg-slate-100 px-1 py-0.5 text-[0.9em]"
            : "block rounded-lg bg-slate-900/90 p-4 text-[0.85em] text-slate-50"
        )}
      >
        {children}
      </code>
    );
  };

  const ImgRenderer = (props: any) => {
    const { src, alt } = props;
    let resolved = "";
    if (typeof src === "string") {
      resolved =
        src && assetBase && !/^https?:\/\//.test(src)
          ? new URL(
              src,
              assetBase.endsWith("/") ? assetBase : `${assetBase}/`
            ).toString()
          : src;
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolved || (typeof src === "string" ? src : "")}
        alt={alt ?? ""}
        className="rounded-lg border"
        loading="lazy"
      />
    );
  };

  const AnchorRenderer = (props: any) => (
    <a
      {...props}
      target="_blank"
      rel="noreferrer"
      className="text-cyan-700 underline decoration-dotted transition hover:text-cyan-600"
    />
  );

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: AnchorRenderer,
        code: CodeRenderer,
        img: ImgRenderer,
      }}
    >
      {state.body}
    </ReactMarkdown>
  );
}

function getLessonNumber(lessons: LessonDetail[], id: string) {
  const index = lessons.findIndex((lesson) => lesson.id === id);
  return index === -1 ? "--" : (index + 1).toString().padStart(2, "0");
}
