"use client";

import { useEffect, useState } from "react";
import { DEFAULT_THEME, THEMES, type Theme } from "./theme";

/**
 * ThemeRoot
 * - Reads per-user theme from localStorage ("gaia.theme").
 * - Applies it to <html data-theme="..."> for future theming.
 * - Emits "gaia:theme" CustomEvent when theme changes.
 */
export default function ThemeRoot({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);

  useEffect(() => {
    const stored = (typeof window !== "undefined" &&
      window.localStorage.getItem("gaia.theme")) as Theme | null;
    const initial =
      stored && (THEMES as readonly string[]).includes(stored)
        ? stored
        : DEFAULT_THEME;
    setTheme(initial);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", initial);
      // Add a class to indicate theme is loading
      document.documentElement.classList.add("theme-loading");
      // Remove loading class after styles have had time to apply
      setTimeout(() => {
        document.documentElement.classList.remove("theme-loading");
      }, 100);
    }
  }, []);

  useEffect(() => {
    function onTheme(e: any) {
      const next = e?.detail?.theme as Theme | undefined;
      if (next && (THEMES as readonly string[]).includes(next)) {
        setTheme(next);
        if (typeof document !== "undefined") {
          document.documentElement.setAttribute("data-theme", next);
        }
      }
    }
    window.addEventListener("gaia:theme", onTheme as EventListener);
    return () =>
      window.removeEventListener("gaia:theme", onTheme as EventListener);
  }, []);

  return <>{children}</>;
}
