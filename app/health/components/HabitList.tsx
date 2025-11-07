'use client';

import { useEffect, useState } from 'react';
import type { Habit } from '../lib/types';
import { ensureDefaultHabits, loadHabits, saveHabits, toggleHabit } from '../lib/store';

function daysOfWeek() {
  const base = new Date(); const out: string[] = [];
  for (let i=6;i>=0;i--){ const d = new Date(); d.setDate(base.getDate()-i);
    const y = d.getFullYear(); const m = String(d.getMonth()+1).padStart(2,'0'); const day = String(d.getDate()).padStart(2,'0');
    out.push(`${y}-${m}-${day}`);
  }
  return out;
}
const dayShort = (iso:string) => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(iso).getDay()];

export default function HabitList(){
  const [habits, setHabits] = useState<Habit[]>([]);
  const days = daysOfWeek();
  useEffect(()=>{ setHabits(ensureDefaultHabits()); }, []);

  function addHabit(){ const id = (crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2,10));
    const next = [...habits, { id, name:'New habit', days:[1,3,6], history: {} }]; setHabits(next); saveHabits(next); }
  function removeHabit(id:string){ const next = habits.filter(h=>h.id!==id); setHabits(next); saveHabits(next); }
  function setName(id:string, name:string){ const next = habits.map(h=>h.id===id? {...h, name}:h); setHabits(next); saveHabits(next); }
  const streak = (h:Habit)=>{ let s=0; const ds = days; for(let i=ds.length-1;i>=0;i--){ const d=ds[i]; if(h.history[d]) s++; else break; } return s; };

  return (
    <section className="gaia-panel rounded-xl border p-4 shadow-sm">
      <header className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-extrabold tracking-wide">Habits</h2>
        <button className="gaia-contrast rounded-lg border px-3 py-1.5 text-sm font-semibold" onClick={addHabit}>+ Add habit</button>
      </header>
      <div className="flex flex-col gap-3">
        {habits.map(h => (
          <div key={h.id} className="gaia-panel-soft rounded-lg border p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <input className="gaia-input w-full rounded-lg border px-3 py-1.5" value={h.name} onChange={e=>setName(h.id, e.target.value)} />
              <div className="gaia-muted text-sm">Streak: {streak(h)}</div>
              <button className="gaia-border rounded-lg border px-3 py-1.5 text-sm" onClick={()=>removeHabit(h.id)}>Delete</button>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {days.map(d => (
                <label key={d} className="flex flex-col items-center gap-1 text-xs">
                  <span className="gaia-muted">{dayShort(d)}</span>
                  <input type="checkbox" checked={!!h.history[d]} onChange={e=>{ toggleHabit(h.id, d, e.target.checked); setHabits(loadHabits()); }} />
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
