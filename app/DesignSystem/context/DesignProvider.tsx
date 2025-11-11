"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "@/lib/supabase";
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
const THEME_CACHE_KEY = "gaia_theme";
const THEME_SETTING_KEY = "theme";
const BTN_KEY = "gaia.ui.button";
const SRCH_KEY = "gaia.ui.search";

const VALID_THEMES: Theme[] = [...THEMES];
const VALID_BUTTONS: ButtonStyle[] = ["solid", "outline", "ghost"];
const VALID_SEARCHES: SearchStyle[] = ["rounded", "pill", "underline"];
const VALID_THEME_SET = new Set<string>(VALID_THEMES);

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
  write(THEME_CACHE_KEY, value);
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

type ThemeCacheSource = typeof THEME_CACHE_KEY | typeof THEME_KEY | null;

function readCachedTheme(): { value: Theme | null; source: ThemeCacheSource } {
  const cache = getThemeFromKey(THEME_CACHE_KEY);
  if (cache) {
    return { value: cache, source: THEME_CACHE_KEY };
  }
  const legacy = getThemeFromKey(THEME_KEY);
  if (legacy) {
    return { value: legacy, source: THEME_KEY };
  }
  return { value: null, source: null };
}

function getThemeFromKey(key: string): Theme | null {
  if (typeof window === "undefined") return null;
  try {
    const storage = window.localStorage;
    if (!storage) return null;
    const raw = storage.getItem(key);
    return coerceThemeCandidate(raw);
  } catch {
    return null;
  }
}

function readDocumentTheme(): Theme | null {
  if (typeof document === "undefined") return null;
  const root = document.documentElement;
  const attr =
    root.getAttribute("data-gaia-theme") ?? root.getAttribute("data-theme");
  return coerceThemeCandidate(attr);
}

function coerceThemeCandidate(value: unknown): Theme | null {
  if (!value) return null;
  if (typeof value === "string") {
    const normalized = value.trim();
    if (VALID_THEME_SET.has(normalized)) {
      return normalized as Theme;
    }
    try {
      const parsed = JSON.parse(normalized);
      if (parsed !== value) {
        return coerceThemeCandidate(parsed);
      }
    } catch {
      // ignore parse errors
    }
    return null;
  }
  if (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Record<string, unknown>).name === "string"
  ) {
    const named = ((value as Record<string, unknown>).name as string).trim();
    return VALID_THEME_SET.has(named) ? (named as Theme) : null;
  }
  return null;
}

type ThemeSettingRow = {
  value: unknown;
} | null;

async function fetchSupabaseThemePreference(): Promise<Theme | null> {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error("Failed to read Supabase session for theme:", sessionError);
      return null;
    }
    const userId = sessionData?.session?.user?.id;
    if (!userId) return null;
    const { data, error } = await supabase
      .from("settings")
      .select("value")
      .eq("user_id", userId)
      .eq("key", THEME_SETTING_KEY)
      .maybeSingle();
    if (error) {
      if (error.code !== "PGRST116") {
        console.error("Failed to load theme from Supabase:", error);
      }
      return null;
    }
    return coerceThemeCandidate((data as ThemeSettingRow)?.value ?? null);
  } catch (error) {
    console.error("Unable to load theme from Supabase:", error);
    return null;
  }
}

async function saveSupabaseThemePreference(value: Theme) {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error("Failed to read Supabase session for theme save:", sessionError);
      return;
    }
    const userId = sessionData?.session?.user?.id;
    if (!userId) return;
    const { error } = await supabase
      .from("settings")
      .upsert(
        [{ user_id: userId, key: THEME_SETTING_KEY, value: { name: value } }],
        { onConflict: "user_id,key", returning: "minimal" }
      );
    if (error) {
      console.error("Failed to save theme to Supabase:", error);
    }
  } catch (error) {
    console.error("Unable to save theme to Supabase:", error);
  }
}

export function DesignProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const [button, setButton] = useState<ButtonStyle>("solid");
  const [search, setSearch] = useState<SearchStyle>("rounded");

  useEffect(() => {
    let isMounted = true;
    const cached = readCachedTheme();
    const fallback = readDocumentTheme();
    const initialTheme = cached.value ?? fallback ?? DEFAULT_THEME;
    setThemeState(initialTheme);
    setButton(read(BTN_KEY, "solid", VALID_BUTTONS));
    setSearch(read(SRCH_KEY, "rounded", VALID_SEARCHES));

    if (cached.source !== THEME_CACHE_KEY) {
      (async () => {
        const remoteTheme = await fetchSupabaseThemePreference();
        if (!isMounted || !remoteTheme) return;
        setThemeState((current) => (current === remoteTheme ? current : remoteTheme));
      })();
    }

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    persistTheme(theme);
    void saveSupabaseThemePreference(theme);
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
