'use client';

import { FormEvent, useEffect, useMemo, useState } from "react";
import Button from "@/app/DesignSystem/components/Button";

type Category = "life" | "programming" | "distraction";

type Todo = {
  id: string;
  text: string;
  category: Category;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
};

const STORAGE_KEY = "gaia.dashboard.todos";

const categories: { id: Category; label: string }[] = [
  { id: "life", label: "Life" },
  { id: "programming", label: "Programming" },
  { id: "distraction", label: "Distraction" },
];

const categoryAccents: Record<Category, string> = {
  life: "from-fuchsia-500/25 via-transparent to-transparent",
  programming: "from-sky-500/25 via-transparent to-transparent",
  distraction: "from-amber-500/25 via-transparent to-transparent",
};

function readTodos(): Todo[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Todo[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((todo) => ({
      ...todo,
      createdAt: Number(todo.createdAt) || Date.now(),
    }));
  } catch {
    return [];
  }
}

function writeTodos(next: Todo[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `todo-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

type EditingState = { id: string; text: string; category: Category };

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState("");
  const [category, setCategory] = useState<Category>("life");
  const [editing, setEditing] = useState<EditingState | null>(null);

  useEffect(() => {
    setTodos(readTodos());
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        setTodos(readTodos());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = (next: Todo[]) => {
    setTodos(next);
    writeTodos(next);
  };

  const visibleTodos = useMemo(() => {
    return categories
      .map(({ id }) => {
        return (
          todos
            .filter((todo) => todo.category === id && !todo.completed)
            .sort((a, b) => a.createdAt - b.createdAt)[0] || null
        );
      })
      .filter(Boolean) as Todo[];
  }, [todos]);

  const backlogCount = useMemo(() => {
    const pending = todos.filter((todo) => !todo.completed).length;
    return pending > visibleTodos.length ? pending - visibleTodos.length : 0;
  }, [todos, visibleTodos]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleaned = text.trim();
    if (!cleaned) return;
    const next: Todo = {
      id: makeId(),
      text: cleaned,
      category,
      completed: false,
      createdAt: Date.now(),
    };
    persist([next, ...todos]);
    setText("");
  };

  const completeTodo = (id: string) => {
    persist(
      todos.map((todo) =>
        todo.id === id
          ? { ...todo, completed: true, completedAt: Date.now() }
          : todo
      )
    );
    if (editing?.id === id) {
      setEditing(null);
    }
  };

  const startEdit = (todo: Todo) => {
    setEditing({ id: todo.id, text: todo.text, category: todo.category });
  };

  const saveEdit = () => {
    if (!editing) return;
    const trimmed = editing.text.trim();
    if (!trimmed) return;
    persist(
      todos.map((todo) =>
        todo.id === editing.id
          ? { ...todo, text: trimmed, category: editing.category }
          : todo
      )
    );
    setEditing(null);
  };

  return (
    <section className="space-y-6 rounded-2xl border border-white/5 bg-slate-950/60 p-6 shadow-2xl shadow-black/20">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Daily focus</p>
        <h2 className="text-2xl font-semibold text-white">Three-lane todo flow</h2>
        <p className="text-sm text-slate-400">
          Surface one Life, Programming, and Distraction task at a time. Finish it, watch it vanish, and the next item
          from that lane bubbles up.
        </p>
      </header>

      <form
        className="grid gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:grid-cols-[1fr_minmax(140px,170px)_auto]"
        onSubmit={handleSubmit}
      >
        <label className="flex flex-col text-xs font-semibold uppercase tracking-wide text-slate-400">
          Task
          <input
            className="mt-2 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none gaia-focus"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Add a todo"
          />
        </label>

        <label className="flex flex-col text-xs font-semibold uppercase tracking-wide text-slate-400">
          Category
          <select
            className="mt-2 rounded-xl border border-white/10 bg-slate-950/60 px-3 py-3 text-sm text-white focus:outline-none gaia-focus"
            value={category}
            onChange={(event) => setCategory(event.target.value as Category)}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </label>

        <Button type="submit" className="h-12 self-end px-6 text-sm sm:self-auto">
          Add task
        </Button>
      </form>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {visibleTodos.length === 0 && (
          <div className="md:col-span-3 rounded-2xl border border-dashed border-white/10 p-6 text-sm text-slate-400">
            Nothing pending. Add todos above to queue up each lane.
          </div>
        )}

        {visibleTodos.map((todo) => {
          const cat = categories.find((c) => c.id === todo.category);
          const isEditing = editing?.id === todo.id;
          return (
            <article
              key={todo.id}
              className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-white shadow-inner"
            >
              <div
                className={`pointer-events-none absolute inset-0 opacity-70 blur-2xl bg-gradient-to-br ${categoryAccents[todo.category]}`}
              />
              <div className="relative z-10 flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-slate-200">
                    {isEditing
                      ? categories.find((c) => c.id === editing.category)?.label
                      : cat?.label ?? todo.category}
                  </div>
                  {isEditing ? (
                    <div className="mt-3 space-y-2 text-slate-900">
                      <input
                        className="w-full rounded-xl border border-white/20 bg-white/90 px-3 py-2 text-sm text-slate-900 focus:outline-none"
                        value={editing.text}
                        onChange={(event) =>
                          setEditing((prev) => (prev ? { ...prev, text: event.target.value } : prev))
                        }
                      />
                      <select
                        className="w-full rounded-xl border border-white/20 bg-white/90 px-3 py-2 text-sm text-slate-900 focus:outline-none"
                        value={editing.category}
                        onChange={(event) =>
                          setEditing((prev) =>
                            prev ? { ...prev, category: event.target.value as Category } : prev
                          )
                        }
                      >
                        {categories.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <p className="mt-2 text-base font-medium text-white">{todo.text}</p>
                  )}
                </div>

                {!isEditing && (
                  <button
                    type="button"
                    className="rounded-full border border-white/20 px-3 py-1 text-[11px] uppercase tracking-wide text-white/80 transition hover:border-white/50 hover:text-white"
                    onClick={() => startEdit(todo)}
                    aria-label="Edit todo"
                    title="Edit todo"
                  >
                    Edit
                  </button>
                )}
              </div>

              <div className="relative z-10">
                {isEditing ? (
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" className="flex-1 text-sm" onClick={saveEdit}>
                      Save
                    </Button>
                    <Button
                      type="button"
                      className="flex-1 text-sm gaia-hover-soft"
                      onClick={() => setEditing(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button type="button" className="w-full text-sm" onClick={() => completeTodo(todo.id)}>
                    Mark complete
                  </Button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {backlogCount > 0 && (
        <p className="text-xs text-slate-500">
          {backlogCount} more queued in backlog. Complete current items to unlock the rest.
        </p>
      )}
    </section>
  );
}
