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
    <section className="rounded-2xl border border-base-300 bg-gradient-to-br from-base-100 to-base-200 p-6 shadow-md">
      <header className="mb-6 flex items-center justify-between border-b border-base-300 pb-4">
        <div>
          <h2 className="text-2xl font-bold">Daily 3</h2>
          <p className="text-sm opacity-70">{today} · Asia/Kuwait</p>
        </div>
        <div className="text-right">
          <span className="badge badge-lg badge-primary">Today's Focus</span>
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
