"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "@/app/DesignSystem/components/Button";
import {
  DailyStore,
  DailyTask,
  DailyTrioByDate,
  DailyStoreEvent,
  Category,
  ensureDate,
  getNextActionableDay,
  getStore,
  toggleDone,
  upsertTask,
  updateTaskNotes,
} from "@/scripts/store";
import { formatKey, shiftDate, todayKey } from "@/utils/dates";

type CategoryMeta = { id: Category; label: string; accent: string };

const CATEGORY_META: CategoryMeta[] = [
  {
    id: "life",
    label: "Life",
    accent: "from-rose-500/20 via-transparent to-transparent",
  },
  {
    id: "programming",
    label: "Programming",
    accent: "from-sky-500/20 via-transparent to-transparent",
  },
  {
    id: "distraction",
    label: "Distraction",
    accent: "from-amber-400/20 via-transparent to-transparent",
  },
];

type DraftPayload = { title: string; notes: string };

const createEmptyDrafts = (): Record<Category, DraftPayload> => ({
  life: { title: "", notes: "" },
  programming: { title: "", notes: "" },
  distraction: { title: "", notes: "" },
});

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `daily-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function TodoList() {
  const [store, setStore] = useState<DailyStore>({});
  const [currentDay, setCurrentDay] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<Category, DraftPayload>>(
    createEmptyDrafts()
  );
  const [ready, setReady] = useState(false);

  const syncStore = useCallback(() => {
    setStore(getStore());
  }, []);

  const hydrate = useCallback(() => {
    const today = todayKey();
    const defaultDay = getNextActionableDay(today) ?? today;
    ensureDate(defaultDay);
    syncStore();
    setCurrentDay(defaultDay);
    setReady(true);
  }, [syncStore]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    hydrate();
    const handleStorage = () => syncStore();
    const handleCustom: EventListener = () => syncStore();
    window.addEventListener("storage", handleStorage);
    window.addEventListener(DailyStoreEvent, handleCustom);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(DailyStoreEvent, handleCustom);
    };
  }, [hydrate, syncStore]);

  useEffect(() => {
    if (!currentDay) return;
    ensureDate(currentDay);
    syncStore();
    setDrafts(createEmptyDrafts());
  }, [currentDay, syncStore]);

  const dayData: DailyTrioByDate = useMemo(() => {
    if (!currentDay) return {};
    return store[currentDay] ?? {};
  }, [currentDay, store]);

  const pendingCount = useMemo(() => {
    if (!currentDay) return CATEGORY_META.length;
    return CATEGORY_META.reduce((count, cat) => {
      const task = (dayData && dayData[cat.id]) as DailyTask | undefined;
      if (!task || !task.done) return count + 1;
      return count;
    }, 0);
  }, [currentDay, dayData]);

  const allDone = pendingCount === 0;

  const jumpToDay = (target: string) => {
    ensureDate(target);
    syncStore();
    setCurrentDay(target);
  };

  const handlePrev = () => {
    if (!currentDay) return;
    jumpToDay(shiftDate(currentDay, -1));
  };

  const handleNext = () => {
    if (!currentDay) return;
    const immediate = shiftDate(currentDay, 1);
    const actionable = getNextActionableDay(immediate);
    jumpToDay(actionable ?? immediate);
  };

  const handleToday = () => {
    const today = todayKey();
    const target = getNextActionableDay(today) ?? today;
    jumpToDay(target);
  };

  const handleAdd = (category: Category, payload: DraftPayload) => {
    if (!currentDay) return;
    const title = payload.title.trim();
    const notes = payload.notes.trim();
    if (!title) return;
    const task: DailyTask = {
      id: makeId(),
      category,
      date: currentDay,
      title,
      notes: notes ? notes : undefined,
      done: false,
    };
    upsertTask(task);
    syncStore();
    setDrafts((prev) => ({ ...prev, [category]: { title: "", notes: "" } }));
  };

  const handleToggle = (category: Category, done: boolean) => {
    if (!currentDay) return;
    toggleDone(currentDay, category, done);
    syncStore();
  };

  const handleUpdateNotes = (category: Category, value: string) => {
    if (!currentDay) return;
    updateTaskNotes(currentDay, category, value);
    syncStore();
  };

  if (!ready || !currentDay) {
    return (
      <section className="space-y-4 rounded-2xl border border-white/5 bg-slate-950/60 p-6 shadow-2xl shadow-black/20">
        <div className="h-5 w-40 animate-pulse rounded bg-slate-800/60" />
        <div className="h-24 animate-pulse rounded-xl border border-white/5 bg-slate-900/40" />
      </section>
    );
  }

  return (
    <section className="space-y-6 rounded-2xl border border-white/5 bg-slate-950/60 p-6 shadow-2xl shadow-black/20">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
          Daily focus
        </p>
        <h2 className="text-2xl font-semibold text-white">
          Daily trio tracker
        </h2>
        <p className="text-sm text-slate-400">
          Track one Life, Programming, and Distraction task per date. Navigate
          day-by-day to keep momentum without noise.
        </p>
      </header>

      <DayNavigator
        date={currentDay}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-900/50 p-4 text-sm text-slate-200">
        <div>
          Pending:{" "}
          <span className="font-semibold text-white">
            {pendingCount} / {CATEGORY_META.length}
          </span>
        </div>
        {allDone ? (
          <span className="text-emerald-300">
            All done for {formatKey(currentDay)}
          </span>
        ) : (
          <span className="text-slate-400">
            Work in progress for {formatKey(currentDay)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {CATEGORY_META.map((category) => (
          <CategoryCard
            key={`${category.id}-${currentDay}`}
            category={category}
            date={currentDay}
            task={(dayData && dayData[category.id]) as DailyTask | undefined}
            drafts={drafts[category.id]}
            onDraftChange={(draft) =>
              setDrafts((prev) => ({
                ...prev,
                [category.id]: draft,
              }))
            }
            onAdd={handleAdd}
            onToggle={handleToggle}
            onUpdateNotes={handleUpdateNotes}
          />
        ))}
      </div>
    </section>
  );
}

function DayNavigator({
  date,
  onPrev,
  onNext,
  onToday,
}: {
  date: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center justify-between gap-3">
        <button
          type="button"
          className="rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white/80 transition hover:border-white/40 hover:text-white"
          onClick={onPrev}
        >
          ← Yesterday
        </button>
        <div className="text-center text-lg font-semibold text-white">
          {formatKey(date)}
        </div>
        <button
          type="button"
          className="rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white/80 transition hover:border-white/40 hover:text-white"
          onClick={onNext}
        >
          Tomorrow →
        </button>
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onToday}
          className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-100 transition hover:border-emerald-400"
        >
          Today
        </button>
      </div>
    </div>
  );
}

function CategoryCard({
  category,
  task,
  date,
  drafts,
  onDraftChange,
  onAdd,
  onToggle,
  onUpdateNotes,
}: {
  category: CategoryMeta;
  task?: DailyTask;
  date: string;
  drafts: DraftPayload;
  onDraftChange: (draft: DraftPayload) => void;
  onAdd: (category: Category, draft: DraftPayload) => void;
  onToggle: (category: Category, done: boolean) => void;
  onUpdateNotes: (category: Category, notes: string) => void;
}) {
  const [noteDraft, setNoteDraft] = useState(task?.notes ?? "");
  const [saveState, setSaveState] = useState<"idle" | "saving">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setNoteDraft(task?.notes ?? "");
    setError(null);
  }, [task?.id, task?.notes, date]);

  const handleAdd = (event: React.FormEvent) => {
    event.preventDefault();
    if (!drafts.title.trim()) {
      setError("Title is required.");
      return;
    }
    onAdd(category.id, drafts);
    setError(null);
  };

  const handleSaveNotes = () => {
    if (saveState === "saving") return;
    setSaveState("saving");
    onUpdateNotes(category.id, noteDraft);
    setTimeout(() => setSaveState("idle"), 200);
  };

  const badgeColor = category.accent;

  return (
    <article className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-white shadow-inner">
      <div
        className={`pointer-events-none absolute inset-0 opacity-60 blur-2xl bg-gradient-to-br ${badgeColor}`}
      />
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-200">
            {category.label}
          </p>
          <p className="text-xs text-slate-400">Date: {formatKey(date)}</p>
        </div>
        {task?.done && task.doneAt && (
          <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-100">
            Done on {formatKey(task.doneAt)}
          </span>
        )}
      </div>

      <div className="relative z-10 space-y-3">
        {task ? (
          <>
            <div>
              <p className="text-lg font-semibold text-white">{task.title}</p>
              {task.notes && (
                <p className="mt-1 text-sm text-slate-200 whitespace-pre-wrap break-words">
                  {task.notes}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                Notes
                <textarea
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none"
                  rows={3}
                  value={noteDraft}
                  onChange={(event) => setNoteDraft(event.target.value)}
                  placeholder="Add context or reminders"
                />
              </label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  className="flex-1 text-sm"
                  disabled={
                    noteDraft === (task.notes ?? "") || saveState === "saving"
                  }
                  onClick={handleSaveNotes}
                >
                  {saveState === "saving" ? "Saving..." : "Save notes"}
                </Button>
                <Button
                  type="button"
                  className="flex-1 text-sm gaia-hover-soft"
                  onClick={() => onToggle(category.id, !task.done)}
                >
                  {task.done ? "Mark pending" : "Mark done"}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <form className="space-y-3" onSubmit={handleAdd}>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">
              Title
              <input
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none"
                value={drafts.title}
                onChange={(event) =>
                  onDraftChange({
                    ...drafts,
                    title: event.target.value,
                  })
                }
                placeholder={`Add ${category.label} task`}
              />
            </label>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">
              Notes
              <textarea
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none"
                rows={3}
                value={drafts.notes}
                onChange={(event) =>
                  onDraftChange({
                    ...drafts,
                    notes: event.target.value,
                  })
                }
                placeholder="Optional context"
              />
            </label>
            {error && <p className="text-xs text-rose-300">{error}</p>}
            <Button type="submit" className="w-full text-sm">
              Save
            </Button>
          </form>
        )}
      </div>
    </article>
  );
}
