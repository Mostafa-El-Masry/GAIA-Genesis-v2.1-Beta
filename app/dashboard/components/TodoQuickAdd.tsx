// app/Dashboard/components/TodoQuickAdd.tsx
"use client";

import { useState } from "react";
import type { Category } from "../hooks/useTodoDaily";

type Props = {
  category: Category;
  onAdd: (category: Category, title: string, note?: string, priority?: 1|2|3, pinned?: boolean) => void;
  onClose?: () => void;
};

export default function TodoQuickAdd({ category, onAdd, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [priority, setPriority] = useState<1|2|3>(2);
  const [pinned, setPinned] = useState(false);

  return (
    <div className="mt-3 rounded-md border border-base-300 p-3">
      <div className="mb-2 text-sm opacity-70">Quick Add — {labelOf(category)}</div>
      <div className="flex flex-col gap-2">
        <input
          className="input input-bordered w-full"
          placeholder="Task title…"
          value={title}
          onChange={(e)=>setTitle(e.target.value)}
        />
        <textarea
          className="textarea textarea-bordered w-full"
          placeholder="Note (optional)…"
          value={note}
          onChange={(e)=>setNote(e.target.value)}
          rows={2}
        />
        <div className="flex items-center gap-3">
          <label className="label cursor-pointer gap-2">
            <span className="label-text">Priority</span>
            <select className="select select-bordered select-sm" value={priority} onChange={(e)=>setPriority(Number(e.target.value) as 1|2|3)}>
              <option value={3}>3 (High)</option>
              <option value={2}>2 (Med)</option>
              <option value={1}>1 (Low)</option>
            </select>
          </label>
          <label className="label cursor-pointer gap-2">
            <span className="label-text">Pinned</span>
            <input type="checkbox" className="toggle" checked={pinned} onChange={(e)=>setPinned(e.target.checked)} />
          </label>
          <div className="flex-1" />
          <button
            className="btn btn-primary btn-sm"
            disabled={!title.trim()}
            onClick={()=>{
              if (!title.trim()) return;
              onAdd(category, title, note || undefined, priority, pinned);
              setTitle(""); setNote(""); setPriority(2); setPinned(false);
              onClose?.();
            }}
          >
            Add
          </button>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function labelOf(c: Category) {
  if (c === "life") return "Life";
  if (c === "work") return "Work";
  return "Distraction";
}
