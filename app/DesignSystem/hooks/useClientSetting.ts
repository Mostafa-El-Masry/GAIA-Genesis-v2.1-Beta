'use client';

import { useEffect, useState } from "react";

/**
 * Simple hook to read a localStorage key (client-only) and update when it changes.
 */
export function useClientSetting<T = string>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        setValue(JSON.parse(raw));
      } else {
        setValue(fallback);
      }
    } catch {
      // Non-JSON values fallback to string
      const raw = window.localStorage.getItem(key) as unknown as T;
      setValue((raw ?? fallback) as T);
    }

    function onStorage(e: StorageEvent) {
      if (e.key === key) {
        try {
          setValue(e.newValue ? JSON.parse(e.newValue) : fallback);
        } catch {
          setValue((e.newValue as unknown as T) ?? fallback);
        }
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key, fallback]);

  return [value, (v: T) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(v));
    } catch {
      window.localStorage.setItem(key, String(v));
    }
    setValue(v);
  }] as const;
}
