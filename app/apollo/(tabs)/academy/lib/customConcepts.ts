'use client';

export type CustomConcept = {
  id: string;
  trackId: string;
  trackTitle: string;
  nodeId: string;
  title: string;
  lesson: string;
  quiz: Array<{ q: string; choices: string[]; answer: number }>;
};

const CUSTOM_KEY = "gaia.citadel.customConcepts";

export function listCustomConcepts(): CustomConcept[] {
  try {
    const raw = localStorage.getItem(CUSTOM_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
