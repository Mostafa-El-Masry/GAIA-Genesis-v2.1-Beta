// app/Dashboard/components/TodoSlot.tsx
"use client";

import { useMemo, useState } from "react";
import type { Category, Task } from "../hooks/useTodoDaily";
import TodoQuickAdd from "./TodoQuickAdd";

type Props = {
  category: Category;
  task: Task | null;
  hasAlternate: boolean;
  onDone: (c: Category) => void;
  onSkip: (c: Category) => void;
  onNext: (c: Category) => void;
  onQuickAdd: (
    c: Category,
    title: string,
    note?: string,
    priority?: 1 | 2 | 3,
    pinned?: boolean
  ) => void;
  onDelete: (taskId: string) => void;
  onEdit: (
    taskId: string,
    patch: Partial<
      Pick<
        Task,
        "title" | "note" | "priority" | "pinned" | "due_date" | "repeat"
      >
    >
  ) => void;
};

export default function TodoSlot(props: Props) {
  const {
    category,
    task,
    hasAlternate,
    onDone,
    onSkip,
    onNext,
    onQuickAdd,
    onDelete,
    onEdit,
  } = props;
  const [showAdd, setShowAdd] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const catStyle = useMemo(() => styleForCategory(category), [category]);

  return (
    <div
      className={`rounded-xl border-2 border-base-300 p-5 shadow-sm transition-all hover:shadow-md hover:border-base-400 ${catStyle.bg}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`font-bold text-lg ${catStyle.text}`}>
            {labelOf(category)}
          </span>
          <span className="badge badge-ghost badge-sm">Today</span>
        </div>
        <div className="relative">
          <button
            className="btn btn-ghost btn-xs hover:bg-base-300"
            onClick={() => setMenuOpen((x) => !x)}
          >
            ⋯
          </button>
          {menuOpen && task && (
            <div className="absolute right-0 z-10 mt-1 w-56 rounded-lg border border-base-300 bg-base-100 p-2 shadow-lg">
              <button
                className="btn btn-ghost btn-sm w-full justify-start"
                onClick={() => {
                  onEdit(task.id, { pinned: !task.pinned });
                  setMenuOpen(false);
                }}
              >
                {task.pinned ? "Unpin" : "Pin"}
              </button>
              <button
                className="btn btn-ghost btn-sm w-full justify-start"
                onClick={() => {
                  onEdit(task.id, {
                    priority: Math.min(
                      3,
                      (task.priority + 1) as 1 | 2 | 3
                    ) as any,
                  });
                  setMenuOpen(false);
                }}
              >
                Increase priority
              </button>
              <button
                className="btn btn-ghost btn-sm w-full justify-start text-error"
                onClick={() => {
                  onDelete(task.id);
                  setMenuOpen(false);
                }}
              >
                Delete task
              </button>
            </div>
          )}
        </div>
      </div>

      {task ? (
        <div>
          <div className="mb-2 line-clamp-1 text-lg font-bold">
            {task.title}
          </div>
          {task.note && (
            <div className="mb-3 line-clamp-2 text-sm opacity-75">
              {task.note}
            </div>
          )}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {task.pinned && (
              <span className="badge badge-primary badge-lg">★ Pinned</span>
            )}
            <span className={`badge badge-lg font-bold ${catStyle.text}`}>
              P{task.priority}
            </span>
            {task.due_date && (
              <span className="badge badge-ghost badge-lg">
                📅 {task.due_date}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="btn btn-success btn-sm w-full"
              onClick={() => onDone(category)}
            >
              ✓ Done
            </button>
            <button
              className="btn btn-warning btn-sm"
              onClick={() => onSkip(category)}
            >
              Skip
            </button>
            {hasAlternate && (
              <button
                className="btn btn-outline btn-sm"
                onClick={() => onNext(category)}
              >
                Next ▸
              </button>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-3 text-center text-sm opacity-60 py-2">
            {labelOf(category)} — No task today
          </div>
          {!showAdd ? (
            <button
              className="btn btn-primary btn-sm w-full"
              onClick={() => setShowAdd(true)}
            >
              + Quick Add
            </button>
          ) : (
            <TodoQuickAdd
              category={category}
              onAdd={onQuickAdd}
              onClose={() => setShowAdd(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}

function labelOf(c: Category) {
  if (c === "life") return "Life";
  if (c === "work") return "Work";
  return "Distraction";
}

function styleForCategory(c: Category) {
  switch (c) {
    case "life":
      return { bg: "bg-base-100", text: "text-teal-500" };
    case "work":
      return { bg: "bg-base-100", text: "text-indigo-500" };
    case "distraction":
      return { bg: "bg-base-100", text: "text-amber-500" };
  }
}
