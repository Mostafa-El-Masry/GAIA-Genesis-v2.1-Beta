'use client';

export type AcademyResult = {
  conceptId: string;
  score: number;
  total: number;
  notes?: string;
  completedAt: number;
};

const RESULT_KEY = "gaia.apollo.academy.results";
const BUILD_KEY = "gaia.apollo.academy.builds"; // simple note storage for 'build' step

export function readResults(): AcademyResult[] {
  try {
    const raw = localStorage.getItem(RESULT_KEY);
    return raw ? (JSON.parse(raw) as AcademyResult[]) : [];
  } catch { return []; }
}

export function writeResult(r: AcademyResult) {
  const all = readResults().filter(x => x.conceptId != r.conceptId);
  all.push(r);
  try { localStorage.setItem(RESULT_KEY, JSON.stringify(all)); } catch {}
}

export function readBuildNote(conceptId: string): string {
  try {
    const raw = localStorage.getItem(BUILD_KEY);
    const obj = raw ? JSON.parse(raw) as Record<string, string> : {};
    return obj[conceptId] ?? "";
  } catch { return ""; }
}

export function writeBuildNote(conceptId: string, note: string) {
  try {
    const raw = localStorage.getItem(BUILD_KEY);
    const obj = raw ? JSON.parse(raw) as Record<string, string> : {};
    obj[conceptId] = note;
    localStorage.setItem(BUILD_KEY, JSON.stringify(obj));
  } catch {}
}
