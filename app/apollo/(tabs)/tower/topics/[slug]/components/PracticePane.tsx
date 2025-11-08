"use client";

import clsx from "clsx";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type {
  PracticeLanguage,
  PracticeSnippet,
} from "../../../lib/practiceStore";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-xs text-slate-500">
      Loading editor…
    </div>
  ),
});

type PracticePaneProps = {
  snippets: PracticeSnippet[];
  activeSnippetId: string;
  draft: Record<PracticeLanguage, string>;
  onChange: (lang: PracticeLanguage, value: string) => void;
  onBlur: () => void;
  onSelectSnippet: (id: string) => void;
  onRun: () => void;
  onReset: () => void;
  onCopy: () => void;
  isSaving: boolean;
  savedAt?: number | null;
};

export default function PracticePane({
  snippets,
  activeSnippetId,
  draft,
  onChange,
  onBlur,
  onSelectSnippet,
  onRun,
  onReset,
  onCopy,
  isSaving,
  savedAt,
}: PracticePaneProps) {
  const snippet = useMemo(
    () => snippets.find((item) => item.id === activeSnippetId),
    [snippets, activeSnippetId]
  );

  const savedLabel = useMemo(() => {
    if (isSaving) return "Saving…";
    if (!savedAt) return "Unsaved changes";
    const delta = Date.now() - savedAt;
    if (delta < 5000) return "Saved just now";
    if (delta < 60000) return "Saved moments ago";
    return `Saved ${new Date(savedAt).toLocaleTimeString()}`;
  }, [isSaving, savedAt]);

  return (
    <div className="flex h-full flex-col rounded-3xl border gaia-border bg-white/95 p-4 shadow-sm">
      <header className="flex flex-wrap items-center gap-3 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-700/70">
            Practice
          </p>
          <h2 className="text-xl font-semibold text-slate-900">
            {snippet?.label ?? "Starter snippet"}
          </h2>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2 text-xs">
          <span
            className={clsx(
              "inline-flex items-center gap-1 rounded-full px-3 py-1 font-semibold",
              isSaving
                ? "bg-amber-100 text-amber-700"
                : "bg-emerald-50 text-emerald-700"
            )}
          >
            <span aria-hidden="true">✔</span>
            {savedLabel}
          </span>
        </div>
      </header>

      <SnippetTabs
        snippets={snippets}
        activeId={activeSnippetId}
        onSelect={onSelectSnippet}
      />

      <Toolbar onRun={onRun} onReset={onReset} onCopy={onCopy} />

      <div className="mt-4 flex-1 space-y-4 overflow-y-auto pr-1">
        {(["html", "css", "js"] as PracticeLanguage[]).map((lang) => (
          <CodeEditorField
            key={lang}
            label={lang.toUpperCase()}
            language={lang}
            value={draft[lang]}
            onChange={(value) => onChange(lang, value)}
            onBlur={onBlur}
          />
        ))}
      </div>
    </div>
  );
}

function SnippetTabs({
  snippets,
  activeId,
  onSelect,
}: {
  snippets: PracticeSnippet[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  if (!snippets.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {snippets.map((snippet) => (
        <button
          key={snippet.id}
          type="button"
          onClick={() => onSelect(snippet.id)}
          className={clsx(
            "rounded-2xl border px-3 py-1 text-xs font-semibold transition",
            snippet.id === activeId
              ? "border-cyan-300 bg-cyan-600 text-white shadow"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
          )}
        >
          {snippet.label}
        </button>
      ))}
    </div>
  );
}

function Toolbar({
  onRun,
  onReset,
  onCopy,
}: {
  onRun: () => void;
  onReset: () => void;
  onCopy: () => void;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/60 p-2 text-sm">
      <button
        type="button"
        onClick={onRun}
        className="inline-flex items-center gap-2 rounded-2xl border border-cyan-200 bg-cyan-600 px-4 py-1.5 font-semibold text-white shadow hover:bg-cyan-500"
      >
        Run preview
      </button>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-1.5 font-semibold text-slate-600 hover:text-slate-900"
      >
        Reset
      </button>
      <button
        type="button"
        onClick={onCopy}
        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-1.5 font-semibold text-slate-600 hover:text-slate-900"
      >
        Copy code
      </button>
      <p className="ml-auto text-xs text-slate-500">
        Auto-saves when you pause typing or leave the field.
      </p>
    </div>
  );
}

function CodeEditorField({
  label,
  language,
  value,
  onChange,
  onBlur,
}: {
  label: string;
  language: PracticeLanguage;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  const [useMonaco, setUseMonaco] = useState(false);

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-900/95 text-slate-50 shadow-inner">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-[0.65rem] uppercase tracking-[0.3em] text-slate-400">
        <span>{label}</span>
        <button
          type="button"
          onClick={() => setUseMonaco(true)}
          className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-cyan-300 hover:text-white"
        >
          {useMonaco ? "Monaco ready" : "Use Monaco editor"}
        </button>
      </div>
      <div
        className="min-h-[160px] rounded-b-3xl"
        onFocus={() => setUseMonaco(true)}
      >
        {useMonaco ? (
          <MonacoEditor
            value={value}
            language={language === "js" ? "javascript" : language}
            onChange={(next) => onChange(next ?? "")}
            onMount={(editor) => {
              editor.onDidBlurEditorWidget(() => onBlur());
            }}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              roundedSelection: false,
              wordWrap: "on",
            }}
            height="220px"
          />
        ) : (
          <textarea
            value={value}
            spellCheck={false}
            onChange={(event) => onChange(event.target.value)}
            onBlur={onBlur}
            className="h-56 w-full resize-none rounded-b-3xl bg-transparent p-4 font-mono text-sm focus:outline-none"
            placeholder={`Write ${label} here`}
          />
        )}
      </div>
    </div>
  );
}
