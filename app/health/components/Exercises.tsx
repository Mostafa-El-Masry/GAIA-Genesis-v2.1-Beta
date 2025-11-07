'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ExercisePlan, WorkoutEntry, ExerciseUnit } from '../lib/types';
import { loadPlans, savePlans, loadLogs, addWorkoutEntry, todayLocal, ensureSeedPlan } from '../lib/store';

export default function Exercises() {
  const [plans, setPlans] = useState<ExercisePlan[]>([]);
  const [logs, setLogs]   = useState<WorkoutEntry[]>([]);
  const [date, setDate]   = useState<string>(todayLocal());
  const [showManage, setShowManage] = useState(false);

  useEffect(() => {
    const seeded = ensureSeedPlan();
    setPlans(seeded);
    setLogs(loadLogs());
  }, []);

  function updatePlan(id: string, patch: Partial<ExercisePlan>) {
    const next = plans.map(p => (p.id === id ? { ...p, ...patch } : p));
    setPlans(next); savePlans(next);
  }
  function addPlan() {
    const next: ExercisePlan = { id: crypto.randomUUID?.() ?? String(Math.random()), name: 'New exercise', unit: 'reps', target: 5 };
    const list = [...plans, next];
    setPlans(list); savePlans(list);
  }
  function removePlan(id: string) {
    const list = plans.filter(p => p.id !== id);
    setPlans(list); savePlans(list);
  }
  function logActual(p: ExercisePlan, value: number, note?: string) {
    if (!Number.isFinite(value) || value < 0) return;
    const item = addWorkoutEntry({ exerciseId: p.id, date, actual: value, note });
    setLogs(prev => [...prev, item]);
  }
  const todayTotals = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of logs) {
      if (e.date !== date) continue;
      map[e.exerciseId] = (map[e.exerciseId] || 0) + e.actual;
    }
    return map;
  }, [logs, date]);

  return (
    <section className="gaia-panel rounded-xl border p-4 shadow-sm">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-extrabold tracking-wide">Exercises - plan vs actual</h2>
        <div className="flex items-center gap-2">
          <input type="date" className="gaia-input rounded-lg border px-3 py-1.5" value={date} onChange={(e) => setDate(e.target.value)} />
          <button className="gaia-border inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold" onClick={() => setShowManage(s => !s)}>
            {showManage ? 'Hide plan' : 'Manage plan'}
          </button>
        </div>
      </header>

      {showManage && (
        <div className="gaia-panel-soft mt-3 rounded-lg border p-3">
          <div className="gaia-muted mb-2 text-sm font-semibold">Your plan (edit does not change past logs)</div>
          <div className="flex flex-col gap-2">
            {plans.map((p) => (
              <div key={p.id} className="grid grid-cols-1 gap-2 sm:grid-cols-5">
                <input className="gaia-input col-span-2 rounded-lg border px-3 py-1.5" value={p.name} onChange={(e) => updatePlan(p.id, { name: e.target.value })} />
                <select className="gaia-input rounded-lg border px-3 py-1.5" value={p.unit} onChange={(e) => updatePlan(p.id, { unit: e.target.value as ExerciseUnit })}>
                  <option value="min">min</option>
                  <option value="reps">reps</option>
                </select>
                <input type="number" className="gaia-input rounded-lg border px-3 py-1.5" value={p.target} min={0} onChange={(e) => updatePlan(p.id, { target: Number(e.target.value) || 0 })} />
                <div className="flex items-center justify-end gap-2">
                  <button className="gaia-border rounded-lg border px-3 py-1.5 text-sm font-semibold" onClick={() => removePlan(p.id)}>Delete</button>
                </div>
              </div>
            ))}
            <div className="pt-2">
              <button className="gaia-contrast rounded-lg border px-3 py-1.5 text-sm font-semibold" onClick={addPlan}>+ Add exercise</button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-3">
        {plans.map((p) => (
          <ExerciseRow key={p.id} plan={p} loggedToday={todayTotals[p.id] || 0} onLog={(val, note) => logActual(p, val, note)} />
        ))}
      </div>

      <div className="gaia-panel-soft mt-4 rounded-lg border p-3">
        <div className="gaia-muted mb-2 text-sm font-semibold">Summary for {date}</div>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((p) => (
            <li key={p.id} className="gaia-panel-soft rounded-lg border p-2">
              <div className="font-semibold">{p.name}</div>
              <div className="gaia-muted text-sm">Planned: {p.target} {p.unit} - Logged: {todayTotals[p.id] || 0} {p.unit}</div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ExerciseRow({ plan, loggedToday, onLog }:{ plan:ExercisePlan; loggedToday:number; onLog:(n:number, note?:string)=>void }){
  const [actual, setActual] = useState<number | ''>('');
  const [note, setNote] = useState('');
  return (
    <div className="gaia-panel-soft rounded-lg border p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-base font-bold">{plan.name}</div>
          <div className="gaia-muted text-sm">Planned: {plan.target} {plan.unit} - Logged today: {loggedToday} {plan.unit}</div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <input type="number" placeholder={`Actual (${plan.unit})`} className="gaia-input w-32 rounded-lg border px-3 py-1.5" value={actual} onChange={(e)=>setActual(e.target.value===''? '' : Number(e.target.value))} min={0} />
            <button className="gaia-border rounded-lg border px-3 py-1.5 text-sm font-semibold" onClick={()=>setActual(plan.target)}>= {plan.target}</button>
          </div>
          <input placeholder="Note (optional)" className="gaia-input min-w-[200px] rounded-lg border px-3 py-1.5" value={note} onChange={(e)=>setNote(e.target.value)} />
          <button className="gaia-contrast inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold" onClick={()=>{ if(actual===''||!Number.isFinite(actual as number)) return; onLog(actual as number, note||undefined); setActual(''); setNote(''); }}>Log</button>
        </div>
      </div>
    </div>
  );
}
