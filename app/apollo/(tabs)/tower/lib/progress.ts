"use client";

import { useCallback, useEffect, useState } from "react";
import { readJSON, subscribe, waitForUserStorage, writeJSON } from "@/lib/user-storage";

type Progress = Record<string, boolean>;
const KEY = "gaia.tower.progress";

/**
 * Local-first progress store
 * - Zero-knowledge local storage of unlocked nodes
 * - Emits "gaia:tower:progress" on change
 */
function read(): Progress {
  return readJSON<Progress>(KEY, {});
}

function write(p: Progress) {
  writeJSON(KEY, p);
}

export function useTowerProgress() {
  const [progress, setProgress] = useState<Progress>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await waitForUserStorage();
      if (cancelled) return;
      setProgress(read());
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === KEY) {
        setProgress(e.newValue ? (JSON.parse(e.newValue) as Progress) : {});
      }
    }
    const unsubscribe = subscribe(({ key, value }) => {
      if (key === KEY) {
        try {
          setProgress(value ? (JSON.parse(value) as Progress) : {});
        } catch {
          setProgress({});
        }
      }
    });
    window.addEventListener("storage", onStorage);
    return () => {
      unsubscribe();
      window.removeEventListener("storage", onStorage);
    };
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
