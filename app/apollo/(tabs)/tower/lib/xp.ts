export const XP_CAP = 100;

export type SnippetLike = {
  html?: string;
  css?: string;
  js?: string;
};

const clamp = (value: number) =>
  Math.max(0, Math.min(XP_CAP, Math.round(Number.isFinite(value) ? value : 0)));

export function awardXp(current: number, delta: number) {
  return clamp(current + delta);
}

export function derivePercentFromXp(xp: number) {
  return Math.round((clamp(xp) / XP_CAP) * 100);
}

export function hasPaneContent(value?: string | null) {
  return typeof value === "string" && value.trim().length > 0;
}

export function isSnippetComplete(snippet: SnippetLike) {
  return (
    hasPaneContent(snippet.html) &&
    hasPaneContent(snippet.css) &&
    hasPaneContent(snippet.js)
  );
}
