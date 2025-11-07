"use client";

/**
 * Lightweight local auth/profile store.
 *
 * Persists the following under localStorage:
 * - Profiles map (`gaia.auth.profiles`): keyed by lowercase email.
 * - Auth status (`gaia.auth.status`): tracks active session metadata.
 *
 * All helpers are defensive against SSR/non-browser environments and
 * swallow storage exceptions so they never break rendering.
 */

export type AuthMode = "login" | "signup";

export type StoredProfile = {
  id: string;
  email: string;
  name?: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  lastLogoutAt?: string;
  lastMode?: AuthMode;
  sessionToken?: string | null;
};

export type AuthStatus = {
  email: string | null;
  session: string | null;
  loggedInAt?: string;
  loggedOutAt?: string;
};

const PROFILES_KEY = "gaia.auth.profiles";
const STATUS_KEY = "gaia.auth.status";

type ProfileMap = Record<string, StoredProfile>;

function getStorage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function readProfiles(storage: Storage | null = getStorage()): ProfileMap {
  if (!storage) return {};
  const parsed = safeParse<ProfileMap>(storage.getItem(PROFILES_KEY));
  return parsed && typeof parsed === "object" ? parsed : {};
}

function writeProfiles(map: ProfileMap, storage: Storage | null = getStorage()) {
  if (!storage) return;
  try {
    storage.setItem(PROFILES_KEY, JSON.stringify(map));
  } catch {
    // ignore quota/security errors
  }
}

function readStatus(storage: Storage | null = getStorage()): AuthStatus | null {
  if (!storage) return null;
  return safeParse<AuthStatus>(storage.getItem(STATUS_KEY));
}

function writeStatus(status: AuthStatus, storage: Storage | null = getStorage()) {
  if (!storage) return;
  try {
    storage.setItem(STATUS_KEY, JSON.stringify(status));
  } catch {
    // ignore storage failures
  }
}

function dispatch(name: string, detail: unknown) {
  try {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent(name, { detail }));
  } catch {
    // ignore dispatch errors
  }
}

function normaliseEmail(email: string | null | undefined): {
  original: string | null;
  key: string | null;
} {
  if (!email) return { original: null, key: null };
  const trimmed = email.trim();
  if (!trimmed) return { original: null, key: null };
  return { original: trimmed, key: trimmed.toLowerCase() };
}

export function recordUserLogin(input: {
  email: string | null;
  name?: string | null;
  mode: AuthMode;
  sessionToken?: string | null;
}): StoredProfile | null {
  const storage = getStorage();
  if (!storage) return null;

  const { original: email, key } = normaliseEmail(input.email);
  if (!email || !key) return null;

  const now = new Date().toISOString();
  const profiles = readProfiles(storage);
  const existing = profiles[key];

  const profile: StoredProfile = {
    id: existing?.id ?? key,
    email,
    name: input.name?.trim() || existing?.name || null,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    lastLoginAt: now,
    lastLogoutAt: existing?.lastLogoutAt,
    lastMode: input.mode,
    sessionToken: input.sessionToken ?? email,
  };

  profiles[key] = { ...existing, ...profile };
  writeProfiles(profiles, storage);

  const status: AuthStatus = {
    email,
    session: input.sessionToken ?? email,
    loggedInAt: now,
    loggedOutAt: undefined,
  };
  writeStatus(status, storage);

  dispatch("gaia:auth:login", { profile, status });
  dispatch("storage", { key: STATUS_KEY });
  return profile;
}

export function recordUserLogout(explicitEmail?: string | null): AuthStatus | null {
  const storage = getStorage();
  if (!storage) return null;

  const current = readStatus(storage);
  const { original: email, key } = normaliseEmail(
    explicitEmail ?? current?.email,
  );

  const now = new Date().toISOString();
  if (key) {
    const profiles = readProfiles(storage);
    const existing = profiles[key];
    if (existing) {
      profiles[key] = {
        ...existing,
        updatedAt: now,
        lastLogoutAt: now,
      };
      writeProfiles(profiles, storage);
    }
  }

  const status: AuthStatus = {
    email: null,
    session: null,
    loggedOutAt: now,
  };
  writeStatus(status, storage);

  dispatch("gaia:auth:logout", { previousEmail: email });
  dispatch("storage", { key: STATUS_KEY });
  return status;
}

export function getActiveStatus(): AuthStatus | null {
  return readStatus();
}

export function getActiveProfile(): StoredProfile | null {
  const status = readStatus();
  if (!status?.email) return null;
  const { key } = normaliseEmail(status.email);
  if (!key) return null;
  const profiles = readProfiles();
  return profiles[key] ?? null;
}

export function listProfiles(): StoredProfile[] {
  const profiles = readProfiles();
  return Object.values(profiles);
}

export function getProfileByEmail(email: string | null | undefined): StoredProfile | null {
  const { key } = normaliseEmail(email);
  if (!key) return null;
  const profiles = readProfiles();
  return profiles[key] ?? null;
}

export function isLoggedIn(): boolean {
  const status = readStatus();
  return !!(status && status.email && status.session);
}

export type UseAuthSnapshot = {
  profile: StoredProfile | null;
  status: AuthStatus | null;
};

/**
 * React hook to subscribe to auth state changes.
 * Can be used in client components to drive UI.
 */
export function useAuthSnapshot(): UseAuthSnapshot {
  const { useEffect, useState } = require("react") as typeof import("react");
  const [snapshot, setSnapshot] = useState<UseAuthSnapshot>(() => ({
    profile: getActiveProfile(),
    status: getActiveStatus(),
  }));

  useEffect(() => {
    function update() {
      setSnapshot({
        profile: getActiveProfile(),
        status: getActiveStatus(),
      });
    }

    if (typeof window === "undefined") return undefined;

    const handler = () => update();
    window.addEventListener("gaia:auth:login", handler);
    window.addEventListener("gaia:auth:logout", handler);
    window.addEventListener("storage", handler);
    update();
    return () => {
      window.removeEventListener("gaia:auth:login", handler);
      window.removeEventListener("gaia:auth:logout", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return snapshot;
}

