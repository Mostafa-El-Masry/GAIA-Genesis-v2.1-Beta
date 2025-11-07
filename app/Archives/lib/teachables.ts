'use client';

import type { Lesson, Subject } from "../data/subjects";

const KEY = "gaia.academy.teachables"; // Record<lessonId, true>

function readObj(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function writeObj(obj: Record<string, boolean>) {
  localStorage.setItem(KEY, JSON.stringify(obj));
}

export function isTeachable(lessonId: string): boolean {
  const obj = readObj();
  return !!obj[lessonId];
}

export function toggleTeachable(lessonId: string, on: boolean) {
  const obj = readObj();
  if (on) obj[lessonId] = true; else delete obj[lessonId];
  writeObj(obj);
  window.dispatchEvent(new Event("storage")); // nudge listeners
}

// ---- Push to Academy custom concepts ----

const CUSTOM_KEY = "gaia.citadel.customConcepts";

export type CustomConcept = {
  id: string;
  trackId: string;
  trackTitle: string;
  nodeId: string; // map to Tier 1 for now
  title: string;
  lesson: string;
  quiz: Array<{ q: string; choices: string[]; answer: number }>;
};

function readCustom(): CustomConcept[] {
  try {
    const raw = localStorage.getItem(CUSTOM_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function writeCustom(list: CustomConcept[]) {
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(list));
}

export function addLessonToAcademy(subject: Subject, lesson: Lesson): CustomConcept {
  const id = `custom-${subject.id}-${lesson.id}`;
  const list = readCustom();
  if (list.some(c => c.id === id)) {
    return list.find(c => c.id === id)!;
  }
  const concept: CustomConcept = {
    id,
    trackId: subject.trackId,
    trackTitle: subject.trackTitle,
    nodeId: `${subject.trackId}-t1`, // Tier 1 mapping
    title: `${subject.title}: ${lesson.title}`,
    lesson: lesson.summary,
    quiz: [
      { q: `Which topic belongs to ${subject.title}?`, choices: [lesson.title, "Unrelated topic", "Neither"], answer: 0 },
      { q: "What is the focus of this lesson?", choices: [lesson.summary, "Styling only", "Databases"], answer: 0 },
      { q: "After learning, what do you do in Academy?", choices: ["Quiz then build", "Stop", "Ask a friend"], answer: 0 },
    ],
  };
  const next = [concept, ...list];
  writeCustom(next);
  window.dispatchEvent(new Event("storage"));
  return concept;
}

export function listCustomConcepts(): CustomConcept[] {
  return readCustom();
}
