'use client';

import { useCallback, useEffect, useState } from "react";

type Progress = Record<string, boolean>;
const KEY = "gaia.tower.progress";

/**
 * Local-first progress store
 * - Zero-knowledge local storage of unlocked nodes
 * - Emits "gaia:tower:progress" on change
 */
function read(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Progress) : {};
  } catch {
    return {};
  }
}

function write(p: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {}
}

export function useTowerProgress() {
  const [progress, setProgress] = useState<Progress>({});

  useEffect(() => {
    setProgress(read());
  }, []);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === KEY) {
        setProgress(e.newValue ? (JSON.parse(e.newValue) as Progress) : {});
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const isUnlocked = useCallback((nodeId: string) => !!progress[nodeId], [progress]);

  const toggleNode = useCallback((nodeId: string, next?: boolean) => {
    setProgress((prev) => {
      const updated: Progress = { ...prev, [nodeId]: next ?? !prev[nodeId] };
      if (!updated[nodeId]) delete updated[nodeId];
      write(updated);
      window.dispatchEvent(new CustomEvent("gaia:tower:progress", { detail: { nodeId, unlocked: !!updated[nodeId] } }));
      return updated;
    });
  }, []);

  const countUnlocked = useCallback(() => Object.values(progress).filter(Boolean).length, [progress]);

  return { progress, isUnlocked, toggleNode, countUnlocked };
}
