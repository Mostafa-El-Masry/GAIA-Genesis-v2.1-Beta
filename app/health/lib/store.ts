'use client';

import type {
  HealthRecord, Habit, HealthPrefs, InsulinEntry, BodyMetric,
  ExercisePlan, WorkoutEntry
} from './types';

export const REC_KEY   = 'gaia_health_v1_records';
export const HAB_KEY   = 'gaia_health_v1_habits';
export const PREF_KEY  = 'gaia_health_v1_prefs';
export const INS_KEY   = 'gaia_health_v1_insulin';
export const BODY_KEY  = 'gaia_health_v1_body';
export const PLANS_KEY = 'gaia_health_v1_exercise_plans';
export const LOGS_KEY  = 'gaia_health_v1_workout_entries';

export function todayLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
export function nid(): string {
  return (crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2,10)) + Math.random().toString(36).slice(2,10);
}

function get<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); if (raw) return JSON.parse(raw) as T; } catch {}
  return fallback;
}
function set<T>(key: string, value: T) { localStorage.setItem(key, JSON.stringify(value)); }

// Records
export function loadRecords(): HealthRecord[] { return get<HealthRecord[]>(REC_KEY, []); }
export function saveRecords(list: HealthRecord[]) { set(REC_KEY, list); }
export function upsertRecord(patch: Partial<HealthRecord> & {date: string}) {
  const list = loadRecords();
  const i = list.findIndex(r => r.date === patch.date);
  if (i >= 0) list[i] = { ...list[i], ...patch };
  else list.push({ ...patch });
  saveRecords(list);
  return list;
}

// Habits
export function loadHabits(): Habit[] { return get<Habit[]>(HAB_KEY, []); }
export function saveHabits(list: Habit[]) { set(HAB_KEY, list); }
export function ensureDefaultHabits() {
  const h = loadHabits();
  if (h.length) return h;
  const seeded: Habit[] = [
    { id: nid(), name: 'Walk 5-10 min', days: [1,3,6], history: {} },
    { id: nid(), name: 'Strength - 1 set each', days: [2,5], history: {} },
  ];
  saveHabits(seeded);
  return seeded;
}
export function toggleHabit(habitId: string, date: string, checked: boolean) {
  const h = loadHabits();
  const item = h.find(x => x.id === habitId);
  if (!item) return;
  item.history[date] = checked;
  saveHabits(h);
}

// Prefs
export function loadPrefs(): HealthPrefs {
  return get<HealthPrefs>(PREF_KEY, {
    units: { water: 'ml', weight: 'kg' },
    show: { weight: true, hr: false, bodyfat: false, waist: false },
    weekStart: 'sun'
  });
}
export function savePrefs(p: HealthPrefs) { set(PREF_KEY, p); }

// Insulin
export function loadInsulin(): InsulinEntry[] { return get<InsulinEntry[]>(INS_KEY, []); }
export function saveInsulin(list: InsulinEntry[]) { set(INS_KEY, list); }
export function addInsulin(e: Omit<InsulinEntry,'id'|'createdAt'>) {
  const list = loadInsulin();
  const item: InsulinEntry = { ...e, id: nid(), createdAt: new Date().toISOString() };
  list.push(item); saveInsulin(list); return item;
}
export function removeInsulin(id: string) {
  const list = loadInsulin().filter(x => x.id !== id);
  saveInsulin(list);
}

// Body metrics
export function loadBody(): BodyMetric[] { return get<BodyMetric[]>(BODY_KEY, []); }
export function saveBody(list: BodyMetric[]) { set(BODY_KEY, list); }
export function addBody(m: Omit<BodyMetric,'id'>) {
  const list = loadBody();
  const item: BodyMetric = { id: nid(), ...m };
  list.push(item); saveBody(list); return item;
}
export function removeBody(id: string) { saveBody(loadBody().filter(x => x.id !== id)); }

// Exercises
export function loadPlans(): ExercisePlan[] { return get<ExercisePlan[]>(PLANS_KEY, []); }
export function savePlans(list: ExercisePlan[]) { set(PLANS_KEY, list); }
export function ensureSeedPlan(): ExercisePlan[] {
  const cur = loadPlans(); if (cur.length) return cur;
  const seeded: ExercisePlan[] = [
    { id: nid(), name: 'Walk', unit: 'min', target: 5 },
    { id: nid(), name: 'Chair sit-to-stand', unit: 'reps', target: 5 },
    { id: nid(), name: 'Wall push-ups', unit: 'reps', target: 5 },
    { id: nid(), name: 'Curl-to-press (light)', unit: 'reps', target: 5 },
  ];
  savePlans(seeded); return seeded;
}
export function loadLogs(): WorkoutEntry[] { return get<WorkoutEntry[]>(LOGS_KEY, []); }
export function saveLogs(list: WorkoutEntry[]) { set(LOGS_KEY, list); }
export function addWorkoutEntry(entry: Omit<WorkoutEntry,'id'|'createdAt'>) {
  const list = loadLogs();
  const item: WorkoutEntry = { ...entry, id: nid(), createdAt: new Date().toISOString() };
  list.push(item); saveLogs(list); return item;
}

// Export/Import (photos excluded)
export function exportAll() {
  const payload = {
    records: loadRecords(),
    habits: loadHabits(),
    prefs: loadPrefs(),
    insulin: loadInsulin(),
    body: loadBody(),
    exercisePlans: loadPlans(),
    workoutEntries: loadLogs(),
    createdAt: new Date().toISOString(),
    note: 'GAIA Health export (photos stored in IndexedDB, not included)'
  };
  const blob = new Blob([JSON.stringify(payload,null,2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'gaia-health-export.json'; a.click();
  setTimeout(()=>URL.revokeObjectURL(url),0);
}
export async function importAll(apply:(data:any)=>void) {
  return new Promise<void>((resolve)=>{
    const inp = document.createElement('input');
    inp.type='file'; inp.accept='application/json';
    inp.onchange=async()=>{
      const f = inp.files?.[0]; if(!f) return resolve();
      const text = await f.text();
      try{
        const obj = JSON.parse(text);
        if (obj.records) localStorage.setItem(REC_KEY, JSON.stringify(obj.records));
        if (obj.habits) localStorage.setItem(HAB_KEY, JSON.stringify(obj.habits));
        if (obj.prefs) localStorage.setItem(PREF_KEY, JSON.stringify(obj.prefs));
        if (obj.insulin) localStorage.setItem(INS_KEY, JSON.stringify(obj.insulin));
        if (obj.body) localStorage.setItem(BODY_KEY, JSON.stringify(obj.body));
        if (obj.exercisePlans) localStorage.setItem(PLANS_KEY, JSON.stringify(obj.exercisePlans));
        if (obj.workoutEntries) localStorage.setItem(LOGS_KEY, JSON.stringify(obj.workoutEntries));
        apply(obj);
      }catch{}
      resolve();
    };
    inp.click();
  });
}
