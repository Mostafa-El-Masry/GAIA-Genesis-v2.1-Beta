"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ArchiveSidebar from "./components/ArchiveSidebar";
import SectionEditor from "./components/SectionEditor";
import SectionViewer from "./components/SectionViewer";
import AskPanel from "./components/AskPanel";
import Tower from "./(tabs)/tower/components/Tower";
import type { ApolloData, ApolloPrefs, Section } from "./lib/types";
import {
  getSectionById,
  getTopicById,
  loadData,
  loadPrefs,
  replaceSection,
  saveData,
  savePrefs,
} from "./lib/store";

const panelClasses =
  "gaia-surface rounded-3xl border gaia-border p-5 shadow-sm ring-1 ring-black/5";
const subtleButton =
  "inline-flex items-center justify-center rounded-2xl border gaia-border gaia-surface px-4 py-2 text-sm font-semibold shadow-sm transition hover:shadow focus:outline-none focus:ring-2 focus:ring-black/10";

export default function ApolloPage() {
  const [data, setData] = useState<ApolloData>({ topics: [] });
  const [prefs, setPrefs] = useState<ApolloPrefs>({});
  const [editing, setEditing] = useState(false);

  const topic = useMemo(
    () => getTopicById(data, prefs.topicId),
    [data, prefs.topicId]
  );

  const section = useMemo(
    () => getSectionById(topic, prefs.sectionId),
    [topic, prefs.sectionId]
  );

  useEffect(() => {
    const storedData = loadData();
    const storedPrefs = loadPrefs();
    setData(storedData);
    setPrefs(storedPrefs);
  }, []);

  useEffect(() => {
    function refreshFromStorage(event?: StorageEvent) {
      if (event && event.key && event.key !== "gaia_apollo_v1_notes") return;
      setData(loadData());
    }

    function onCustom() {
      refreshFromStorage();
    }

    window.addEventListener("storage", refreshFromStorage);
    window.addEventListener("gaia:apollo:data", onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", refreshFromStorage);
      window.removeEventListener("gaia:apollo:data", onCustom as EventListener);
    };
  }, []);

  const commitPrefs = useCallback((partial: Partial<ApolloPrefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...partial };
      savePrefs(next);
      return next;
    });
  }, []);

  const handleSave = useCallback(
    (sec: Section, text: string) => {
      replaceSection(sec, text);
      saveData(data);
      setData({ ...data });
      setEditing(false);
    },
    [data]
  );

  const handleDeleteActiveSection = useCallback(() => {
    if (!section || !prefs.topicId) return;
    const ok = window.confirm(
      `Delete section "${section.heading}"? This cannot be undone.`
    );
    if (!ok) return;
    setData((prev) => {
      const next = {
        ...prev,
        topics: prev.topics.map((t) =>
          t.id === prefs.topicId
            ? { ...t, sections: t.sections.filter((s) => s.id !== section.id) }
            : t
        ),
      } as typeof prev;
      saveData(next as any);
      return next;
    });
    // Clear active selection
    commitPrefs({ sectionId: undefined });
    setEditing(false);
  }, [section, prefs.topicId, commitPrefs]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (editing && section) {
          handleSave(section, section.blocks.join("\n\n"));
        }
      } else if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        setEditing(true);
      } else if (e.key === "Escape") {
        setEditing(false);
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editing, handleSave, section]);

  return (
    <main className="min-h-screen gaia-surface-soft">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
        <div className="space-y-6">
          <div className="border-b gaia-border pb-6 flex items-center justify-between">
            <h1 className="gaia-strong text-5xl sm:text-6xl font-extrabold tracking-tight">
              APOLLO
            </h1>
            <div className="flex gap-2">
              <Link
                href="/Archives"
                className="inline-flex items-center justify-center rounded-2xl border gaia-border gaia-surface px-4 py-2 text-sm font-semibold shadow-sm transition hover:shadow focus:outline-none focus:ring-2 focus:ring-black/10"
              >
                Archives →
              </Link>
              <Link
                href="/Abollo/Academy"
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-amber-400/60 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 shadow-sm transition hover:border-amber-500 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                Academy
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className={panelClasses}>
              <Tower />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className={panelClasses}>
                <AskPanel onChange={(updated) => setData(updated)} />
              </div>

              <div
                className={`${panelClasses} ${
                  section ? "flex flex-col gap-4" : ""
                }`}
              >
                {section ? (
                  <>
                    <div className="flex flex-wrap items-center gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] gaia-muted">
                          Active section
                        </p>
                        <h2 className="gaia-strong text-2xl font-semibold">
                          {section.heading}
                        </h2>
                      </div>
                      <div className="text-xs gaia-muted">
                        {new Date(section.editedAt).toLocaleString()}
                      </div>
                      <div className="ml-auto">
                        <button
                          className={subtleButton}
                          onClick={() => setEditing((prev) => !prev)}
                        >
                          {editing ? "Close editor" : "Edit"}
                        </button>
                        <button
                          className={`${subtleButton} ml-2`}
                          onClick={handleDeleteActiveSection}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {editing ? (
                      <SectionEditor
                        section={section}
                        onSave={(text) => handleSave(section, text)}
                      />
                    ) : (
                      <SectionViewer section={section} />
                    )}
                  </>
                ) : (
                  <ArchiveSidebar
                    data={data}
                    topicId={prefs.topicId}
                    setTopicId={(id) => commitPrefs({ topicId: id })}
                    sectionId={prefs.sectionId}
                    setSectionId={(id) => commitPrefs({ sectionId: id })}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
