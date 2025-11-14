// app/TODO/page.tsx
"use client";

import { useMemo } from "react";
import { useTodoDaily } from "../dashboard/hooks/useTodoDaily";

const LABELS: Record<string, string> = {
  life: "Life",
  work: "Work",
  distraction: "Distraction",
};

const HINTS: Record<string, string> = {
  life: "Use this for home, errands, relationships, errands, and anything that keeps your life moving.",
  work: "Tasks related to your job, GAIA building, study sessions, and deep work blocks.",
  distraction: "Things you want to deliberately enjoy or limit: games, scrolling, and time sinks.",
};

export default function TODOPage() {
  const { tasks, deleteTask } = useTodoDaily();

  const byCat = useMemo(() => {
    const map: Record<string, any[]> = { life: [], work: [], distraction: [] };
    for (const t of tasks) map[t.category].push(t);
    return map;
  }, [tasks]);

  return (
    <main className="mx-auto max-w-4xl p-4">
      <header className="mb-6 space-y-1">
        <h1 className="text-2xl font-bold">TODO · All Tasks</h1>
        <p className="max-w-2xl text-sm text-base-content/70">
          This is the full list backing the dashboard&apos;s &quot;Today&apos;s Focus&quot; panel.
          Tasks are grouped by Life, Work, and Distraction so you can see everything in one place.
        </p>
      </header>

      {(["life", "work", "distraction"] as const).map((cat) => (
        <section key={cat} className="mb-8">
          <header className="mb-2 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">{LABELS[cat]}</h2>
            <p className="text-xs text-base-content/60">{HINTS[cat]}</p>
          </header>
          <div className="rounded-xl border border-base-300 bg-base-100/60">
            {byCat[cat].length === 0 ? (
              <div className="space-y-1 p-4 text-sm text-base-content/60">
                <p>No tasks in this category yet.</p>
                <p>
                  Add one from the dashboard&apos;s &quot;Today&apos;s Focus&quot; cards using Quick Add,
                  or schedule tasks there and they will appear here automatically.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-base-300">
                {byCat[cat].map((t) => (
                  <li key={t.id} className="p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="font-medium">{t.title}</div>
                        {t.note && (
                          <p className="text-sm text-base-content/70">{t.note}</p>
                        )}
                        {t.repeat_rule && t.repeat_rule !== "none" && (
                          <p className="mt-1 text-xs uppercase tracking-wide text-base-content/60">
                            Repeats: {String(t.repeat_rule)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="rounded-lg border border-base-300 px-2 py-1 text-xs text-base-content/70 hover:bg-base-200"
                          onClick={() => deleteTask(t.id)}
                          title="Delete task"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      ))}
    </main>
  );
}
