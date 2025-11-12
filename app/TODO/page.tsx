// app/TODO/page.tsx
"use client";

import { useMemo } from "react";
import { useTodoDaily } from "../dashboard/hooks/useTodoDaily";

export default function TODOPage() {
  const { tasks } = useTodoDaily();

  // Debug logging
  console.log("TODOPage - tasks loaded:", tasks);

  const byCat = useMemo(() => {
    const map: Record<string, any[]> = { life: [], work: [], distraction: [] };
    for (const t of tasks) map[t.category].push(t);
    console.log("TODOPage - tasks by category:", map);
    return map;
  }, [tasks]);

  return (
    <main className="mx-auto max-w-4xl p-4">
      <h1 className="mb-6 text-2xl font-bold">TODO · All Tasks</h1>

      {(["life", "work", "distraction"] as const).map((cat) => (
        <section key={cat} className="mb-8">
          <h2 className="mb-2 text-lg font-semibold capitalize">{cat}</h2>
          <div className="rounded-xl border border-base-300">
            {byCat[cat].length === 0 ? (
              <div className="p-4 text-sm opacity-60">No tasks yet.</div>
            ) : (
              <ul className="divide-y divide-base-300">
                {byCat[cat].map((t) => (
                  <li key={t.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{t.title}</div>
                        {t.note && (
                          <div className="text-sm opacity-70">{t.note}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {t.pinned && (
                          <span className="badge badge-primary badge-outline">
                            Pinned
                          </span>
                        )}
                        <span className="badge badge-outline">
                          P{t.priority}
                        </span>
                        {t.due_date && (
                          <span className="badge badge-ghost">
                            Due {t.due_date}
                          </span>
                        )}
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
