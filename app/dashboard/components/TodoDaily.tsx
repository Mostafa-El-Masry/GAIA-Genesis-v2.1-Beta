// app/Dashboard/components/TodoDaily.tsx
"use client";

import { useTodoDaily } from "../hooks/useTodoDaily";
import TodoSlot from "./TodoSlot";

export default function TodoDaily() {
  const {
    today,
    slotInfo,
    addQuickTask,
    markDone,
    skipTask,
    showNext,
    deleteTask,
    editTask,
  } = useTodoDaily();

  return (
    <section className="rounded-2xl border border-[var(--gaia-border)] bg-[var(--gaia-surface-soft)] p-6 shadow-lg">
      <header className="mb-6 flex items-center justify-between border-b border-[var(--gaia-border)] pb-4">
        <div>
          <p className="text-sm text-[var(--gaia-text-muted)]">
            {today} · Asia/Kuwait
          </p>
        </div>
        <div className="text-right">
          <span className="inline-block rounded-lg bg-[var(--gaia-contrast-bg)] px-3 py-1 text-sm font-semibold text-[var(--gaia-contrast-text)]">
            Today's Focus
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <TodoSlot
          category="life"
          task={slotInfo.life.task}
          hasAlternate={slotInfo.life.hasAlternate}
          onDone={markDone}
          onSkip={skipTask}
          onNext={showNext}
          onQuickAdd={addQuickTask}
          onDelete={deleteTask}
          onEdit={editTask}
        />
        <TodoSlot
          category="work"
          task={slotInfo.work.task}
          hasAlternate={slotInfo.work.hasAlternate}
          onDone={markDone}
          onSkip={skipTask}
          onNext={showNext}
          onQuickAdd={addQuickTask}
          onDelete={deleteTask}
          onEdit={editTask}
        />
        <TodoSlot
          category="distraction"
          task={slotInfo.distraction.task}
          hasAlternate={slotInfo.distraction.hasAlternate}
          onDone={markDone}
          onSkip={skipTask}
          onNext={showNext}
          onQuickAdd={addQuickTask}
          onDelete={deleteTask}
          onEdit={editTask}
        />
      </div>
    </section>
  );
}
