"use client";

import { concepts } from "../../../apollo/data/academy";
import type { MicroConcept } from "../../../apollo/data/academy";

export type BuildEntry = {
  conceptId: string;
  nodeId: string;
  trackId: string;
  trackTitle: string;
  title: string;
  note: string;
  embedUrl?: string;
  score?: number;
  total?: number;
  completedAt?: number;
};

const RESULT_KEY = "gaia.apollo.academy.results";
const BUILD_KEY = "gaia.apollo.academy.builds";

function readResults(): Array<{
  conceptId: string;
  score: number;
  total: number;
  completedAt: number;
  notes?: string;
}> {
  try {
    const raw = localStorage.getItem(RESULT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function readBuildNotesObj(): Record<string, string> {
  try {
    const raw = localStorage.getItem(BUILD_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function parseFirstUrl(text: string): string | undefined {
  if (!text) return undefined;
  const m = text.match(/https?:\/\/[^\s)]+/i);
  return m ? m[0] : undefined;
}

export function listBuilds(): BuildEntry[] {
  const notes = readBuildNotesObj();
  const results = readResults();
  const mapResult = new Map(results.map((r) => [r.conceptId, r]));

  return concepts
    .map((c) => {
      const note = notes[c.id] || "";
      const r = mapResult.get(c.id);
      const embedUrl = parseFirstUrl(note);
      return {
        conceptId: c.id,
        nodeId: c.nodeId,
        trackId: c.trackId,
        trackTitle: c.trackTitle,
        title: c.title,
        note,
        embedUrl,
        score: r?.score,
        total: r?.total,
        completedAt: r?.completedAt,
      };
    })
    .filter((b) => typeof b.score === "number"); // show only completed concepts
}
