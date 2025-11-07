"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DEFAULT_THEME, THEMES, type Theme } from "../theme";

export type { Theme } from "../theme";

export type ButtonStyle = "solid" | "outline" | "ghost";
export type SearchStyle = "rounded" | "pill" | "underline";

type DesignState = {
  theme: Theme;
  button: ButtonStyle;
  search: SearchStyle;
  setTheme: (t: Theme) => void;
  setButton: (b: ButtonStyle) => void;
  setSearch: (s: SearchStyle) => void;
};

export const Ctx = createContext<DesignState | null>(null);

const THEME_KEY = "gaia.theme";
const BTN_KEY = "gaia.ui.button";
const SRCH_KEY = "gaia.ui.search";

const VALID_THEMES: Theme[] = [...THEMES];
const VALID_BUTTONS: ButtonStyle[] = ["solid", "outline", "ghost"];
const VALID_SEARCHES: SearchStyle[] = ["rounded", "pill", "underline"];

function read<T extends string>(
  k: string,
  fallback: T,
  allowed?: readonly string[]
): T {
  try {
    const raw = localStorage.getItem(k);
    if (!raw) return fallback;
    if (
      (raw.startsWith('"') && raw.endsWith('"')) ||
      raw.startsWith("{") ||
      raw.startsWith("[")
    ) {
      try {
        const parsed = JSON.parse(raw);
        if (typeof parsed === "string") {
          if (!allowed || allowed.includes(parsed)) {
            return (parsed as T) ?? fallback;
          }
          return fallback;
        }
      } catch {
        // ignore JSON parse errors and fall back to raw value
      }
    }
    if (!allowed || allowed.includes(raw)) {
      return raw as T;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

function write<T extends string>(k: string, v: T) {
  try {
    localStorage.setItem(k, v);
  } catch {}
}

function persistTheme(value: Theme) {
  write(THEME_KEY, value);
  if (typeof document !== "undefined") {
    const root = document.documentElement;
    root.setAttribute("data-theme", value);
    root.setAttribute("data-gaia-theme", value);
  }
  try {
    document.cookie = `gaia.theme=${encodeURIComponent(
      value
    )}; path=/; max-age=31536000; samesite=lax`;
  } catch {}
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(
        new CustomEvent("gaia:theme", { detail: { theme: value } })
      );
    } catch {}
  }
}

export function DesignProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const [button, setButton] = useState<ButtonStyle>("solid");
  const [search, setSearch] = useState<SearchStyle>("rounded");

  useEffect(() => {
    setThemeState(read(THEME_KEY, DEFAULT_THEME, VALID_THEMES));
    setButton(read(BTN_KEY, "solid", VALID_BUTTONS));
    setSearch(read(SRCH_KEY, "rounded", VALID_SEARCHES));
  }, []);

  useEffect(() => {
    persistTheme(theme);
  }, [theme]);

  useEffect(() => {
    write(BTN_KEY, button);
  }, [button]);

  useEffect(() => {
    write(SRCH_KEY, search);
  }, [search]);

  const setTheme = useCallback((value: Theme) => {
    if (!VALID_THEMES.includes(value)) return;
    setThemeState(value);
  }, []);

  const value = useMemo<DesignState>(
    () => ({
      theme,
      button,
      search,
      setTheme,
      setButton,
      setSearch,
    }),
    [theme, button, search, setTheme]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDesign() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useDesign must be used within DesignProvider");
  return v;
}

export function useDesignSafe() {
  return useContext(Ctx) as DesignState | null;
}
