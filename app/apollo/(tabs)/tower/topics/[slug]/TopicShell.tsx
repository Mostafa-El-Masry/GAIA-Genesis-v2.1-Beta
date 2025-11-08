"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LessonDetail } from "../../data/lessons";
import { composeDocument } from "../../lib/composeDocument";
import {
  LessonSeedPayload,
  PracticeLanguage,
  usePracticeTopic,
} from "../../lib/practiceStore";
import LessonPane from "./components/LessonPane";
import PracticePane from "./components/PracticePane";
import PreviewPane from "./components/PreviewPane";

type TopicShellProps = {
  topicId: string;
  moduleTitle: string;
  trackTitle: string;
  lessons: LessonDetail[];
};

type DraftState = Record<PracticeLanguage, string>;

export default function TopicShell({
  topicId,
  moduleTitle,
  trackTitle,
  lessons,
}: TopicShellProps) {
  const {
    topic,
    snippets,
    activeSnippet,
    setActiveSnippet,
    saveSnippet,
    seedSnippet,
    markPreviewSuccess,
  } = usePracticeTopic(topicId);

  const [draft, setDraft] = useState<DraftState>(() => ({
    html: activeSnippet.html,
    css: activeSnippet.css,
    js: activeSnippet.js,
  }));
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(
    activeSnippet.updatedAt || null
  );
  const [previewDoc, setPreviewDoc] = useState(() =>
    composeDocument({
      html: activeSnippet.html,
      css: activeSnippet.css,
      js: activeSnippet.js,
      title: moduleTitle,
    })
  );
  const [previewVersion, setPreviewVersion] = useState(0);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const saveTimer = useRef<number | null>(null);
  const previewTimer = useRef<number | null>(null);
  const lastPreviewSnippetId = useRef<string>(activeSnippet.id);
  const previewErrored = useRef(false);

  useEffect(() => {
    setDraft({
      html: activeSnippet.html,
      css: activeSnippet.css,
      js: activeSnippet.js,
    });
    setSavedAt(activeSnippet.updatedAt || null);
  }, [activeSnippet.id, activeSnippet.updatedAt]);

  const dirty =
    draft.html !== activeSnippet.html ||
    draft.css !== activeSnippet.css ||
    draft.js !== activeSnippet.js;

  const { id: activeSnippetId, label: activeSnippetLabel } = activeSnippet;

  const commitSave = useCallback(() => {
    if (!dirty) {
      setIsSaving(false);
      return;
    }
    saveSnippet({
      snippetId: activeSnippetId,
      label: activeSnippetLabel,
      html: draft.html,
      css: draft.css,
      js: draft.js,
    });
    setIsSaving(false);
    const timestamp = Date.now();
    setSavedAt(timestamp);
  }, [dirty, saveSnippet, activeSnippetId, activeSnippetLabel, draft]);

  useEffect(() => {
    if (saveTimer.current !== null) {
      window.clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    if (!dirty) {
      setIsSaving(false);
      return;
    }
    setIsSaving(true);
    saveTimer.current = window.setTimeout(commitSave, 600);
    return () => {
      if (saveTimer.current !== null) {
        window.clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
    };
  }, [dirty, commitSave]);

  const commitRef = useRef(commitSave);
  useEffect(() => {
    commitRef.current = commitSave;
  }, [commitSave]);

  useEffect(() => {
    return () => {
      if (saveTimer.current !== null) {
        window.clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
      commitRef.current();
    };
  }, []);

  const schedulePreview = useCallback(
    (immediate = false) => {
      if (previewTimer.current !== null) {
        window.clearTimeout(previewTimer.current);
        previewTimer.current = null;
      }
      const run = () => {
        setPreviewDoc(
          composeDocument({
            html: draft.html,
            css: draft.css,
            js: draft.js,
            title: moduleTitle,
          })
        );
        setPreviewVersion((prev) => prev + 1);
        lastPreviewSnippetId.current = activeSnippetId;
        previewErrored.current = false;
      };
      if (immediate) {
        run();
      } else {
        previewTimer.current = window.setTimeout(run, 250);
      }
    },
    [draft, activeSnippetId, moduleTitle]
  );

  useEffect(() => {
    schedulePreview(false);
    setPreviewError(null);
  }, [draft.html, draft.css, draft.js, schedulePreview]);

  const handleRun = () => {
    commitSave();
    schedulePreview(true);
  };

  const handleReset = () => {
    setDraft({
      html: activeSnippet.html,
      css: activeSnippet.css,
      js: activeSnippet.js,
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(previewDoc);
    } catch {
      // ignore clipboard errors
    }
  };

  const handleLessonSeed = (payload: LessonSeedPayload) => {
    seedSnippet(payload);
  };

  const handleChange = (lang: PracticeLanguage, value: string) => {
    setDraft((prev) => ({ ...prev, [lang]: value }));
  };

  const handlePreviewReady = () => {
    if (!previewErrored.current) {
      if (topic.activeSnippetId === lastPreviewSnippetId.current) {
        markPreviewSuccess();
      }
      setPreviewError(null);
    }
  };

  const handlePreviewError = (message: string) => {
    previewErrored.current = true;
    setPreviewError(message);
  };

  const statItems = [
    {
      label: "XP",
      value: `${topic.xp}/100`,
    },
    {
      label: "Completion",
      value: `${topic.percent}%`,
    },
    {
      label: "Last touched",
      value: topic.lastTouched
        ? new Date(topic.lastTouched).toLocaleString()
        : "Never",
    },
  ];

  return (
    <section className="space-y-6">
      <header className="rounded-3xl border gaia-border bg-white/90 p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-700/70">
          Abollo Tower
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {moduleTitle}
            </h1>
            <p className="text-sm text-slate-500">{trackTitle}</p>
          </div>
          <div className="ml-auto flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            {statItems.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-center"
              >
                <p>{item.label}</p>
                <p className="mt-1 text-base tracking-normal text-slate-900">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1fr)]">
        <LessonPane lessons={lessons} onSeedSnippet={handleLessonSeed} />
        <PracticePane
          snippets={snippets}
          activeSnippetId={topic.activeSnippetId}
          draft={draft}
          onChange={handleChange}
          onBlur={commitSave}
          onSelectSnippet={setActiveSnippet}
          onRun={handleRun}
          onReset={handleReset}
          onCopy={handleCopy}
          isSaving={isSaving}
          savedAt={savedAt ?? activeSnippet.updatedAt}
        />
        <PreviewPane
          documentHtml={previewDoc}
          version={previewVersion}
          error={previewError}
          onReady={handlePreviewReady}
          onError={handlePreviewError}
        />
      </div>
    </section>
  );
}
