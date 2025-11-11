"use client";

import { useEffect, useState } from "react";
import { DEFAULT_THEME, THEMES, type Theme } from "./theme";

/**
 * ThemeRoot
 * - Reads per-user theme from localStorage ("gaia_theme" then "gaia.theme").
 * - Applies it to <html data-theme="..."> for future theming.
 * - Emits "gaia:theme" CustomEvent when theme changes.
 */
export default function ThemeRoot({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);

  useEffect(() => {
    const allowed = new Set<string>(THEMES as readonly string[]);
    const parseTheme = (raw: string | null): Theme | null => {
      if (!raw) return null;
      const trimmed = raw.trim();
      if (allowed.has(trimmed)) {
        return trimmed as Theme;
      }
      try {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed === "string" && allowed.has(parsed)) {
          return parsed as Theme;
        }
      } catch {
        // ignore malformed cache entries
      }
      return null;
    };

    let storedTheme: Theme | null = null;
    if (typeof window !== "undefined" && window.localStorage) {
      const keys = ["gaia_theme", "gaia.theme"];
      for (const key of keys) {
        try {
          const parsed = parseTheme(window.localStorage.getItem(key));
          if (parsed) {
            storedTheme = parsed;
            if (key !== "gaia_theme") {
              window.localStorage.setItem("gaia_theme", parsed);
            }
            break;
          }
        } catch {
          // ignore storage access issues
        }
      }
    }

    const documentTheme =
      typeof document !== "undefined"
        ? parseTheme(
            document.documentElement.getAttribute("data-gaia-theme") ??
              document.documentElement.getAttribute("data-theme")
          )
        : null;

    const initial = storedTheme ?? documentTheme ?? DEFAULT_THEME;
    setTheme(initial);
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.setAttribute("data-theme", initial);
      root.setAttribute("data-gaia-theme", initial);
      // Add a class to indicate theme is loading
      root.classList.add("theme-loading");
      // Remove loading class after styles have had time to apply
      setTimeout(() => {
        root.classList.remove("theme-loading");
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
          document.documentElement.setAttribute("data-gaia-theme", next);
        }
      }
    }
    window.addEventListener("gaia:theme", onTheme as EventListener);
    return () =>
      window.removeEventListener("gaia:theme", onTheme as EventListener);
  }, []);

  return <>{children}</>;
}
