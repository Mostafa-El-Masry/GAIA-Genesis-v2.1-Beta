"use client";

import { useEffect, useState } from "react";
import { normaliseEmail } from "./strings";

const PERMISSION_KEYS = [
  "apollo",
  "archives",
  "classic",
  "dashboard",
  "eleuthia",
  "gallery",
  "health",
  "labs",
  "locked",
  "timeline",
  "wealth",
  "settings",
  "settingsAppearance",
  "settingsGallery",
  "settingsPermissions",
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];

export type PermissionSet = Record<PermissionKey, boolean>;

type PermissionMap = Record<string, PermissionSet>;

const STORAGE_KEY = "gaia.auth.permissions";
const DEFAULT_ADMIN_EMAIL = "mostafa.abdelfattah2021@gmail.com";
const ADMIN_EMAIL = (
  process.env.NEXT_PUBLIC_CREATOR_EMAIL ||
  process.env.NEXT_PUBLIC_CREATOR_ADMIN_EMAIL ||
  DEFAULT_ADMIN_EMAIL
)
  .trim()
  .toLowerCase();

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

function normaliseKey(email: string | null | undefined): string | null {
  const normalised = normaliseEmail(email);
  return normalised ? normalised.toLowerCase() : null;
}

function emptyPermissionSet(): PermissionSet {
  return PERMISSION_KEYS.reduce<PermissionSet>((acc, key) => {
    acc[key] = false;
    return acc;
  }, {} as PermissionSet);
}

function adminPermissionSet(): PermissionSet {
  return PERMISSION_KEYS.reduce<PermissionSet>((acc, key) => {
    acc[key] = true;
    return acc;
  }, {} as PermissionSet);
}

function ensureShape(input: Partial<PermissionSet> | null | undefined): PermissionSet {
  const base = emptyPermissionSet();
  if (!input) return base;
  for (const key of PERMISSION_KEYS) {
    base[key] = Boolean(input[key]);
  }
  return base;
}

function readPermissions(storage: Storage | null = getStorage()): PermissionMap {
  if (!storage) return {};
  const parsed = safeParse<PermissionMap>(storage.getItem(STORAGE_KEY));
  if (!parsed || typeof parsed !== "object") return {};
  const output: PermissionMap = {};
  for (const [key, value] of Object.entries(parsed)) {
    output[key] = ensureShape(value);
  }
  return output;
}

function writePermissions(
  map: PermissionMap,
  storage: Storage | null = getStorage(),
) {
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore storage quota or security errors
  }
}

function dispatchPermissionsEvent(detail: unknown) {
  try {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("gaia:permissions:update", { detail }));
  } catch {
    // ignore dispatch failures
  }
}

export function isCreatorAdmin(email: string | null | undefined): boolean {
  const key = normaliseKey(email);
  if (!key) return false;
  return key === ADMIN_EMAIL;
}

export function listPermissionMap(): PermissionMap {
  const map = readPermissions();
  map[ADMIN_EMAIL] = adminPermissionSet();
  return map;
}

export function getPermissionSet(email: string | null | undefined): PermissionSet {
  const key = normaliseKey(email);
  if (!key) return emptyPermissionSet();
  if (key === ADMIN_EMAIL) return adminPermissionSet();
  const permissions = readPermissions();
  return ensureShape(permissions[key]);
}

export function setPermissionSet(
  email: string | null | undefined,
  updates: PermissionSet,
) {
  const key = normaliseKey(email);
  if (!key || key === ADMIN_EMAIL) return;
  const storage = getStorage();
  const current = readPermissions(storage);
  current[key] = ensureShape(updates);
  writePermissions(current, storage);
  dispatchPermissionsEvent({ email: key, permissions: current[key] });
}

export function setPermissionFlag(
  email: string | null | undefined,
  permission: PermissionKey,
  value: boolean,
) {
  const key = normaliseKey(email);
  if (!key || key === ADMIN_EMAIL) return;
  const storage = getStorage();
  const current = readPermissions(storage);
  const existing = ensureShape(current[key]);
  existing[permission] = value;
  current[key] = existing;
  writePermissions(current, storage);
  dispatchPermissionsEvent({ email: key, permissions: existing });
}

export function getAdminEmail(): string {
  return ADMIN_EMAIL;
}

export function getAvailablePermissionKeys(): PermissionKey[] {
  return [...PERMISSION_KEYS];
}

export function createEmptyPermissionSet(): PermissionSet {
  return emptyPermissionSet();
}

export function createAdminPermissionSet(): PermissionSet {
  return adminPermissionSet();
}

export function usePermissionSnapshot(): PermissionMap {
  const [snapshot, setSnapshot] = useState<PermissionMap>(() => listPermissionMap());

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const update = () => setSnapshot(listPermissionMap());
    window.addEventListener("gaia:permissions:update", update);
    window.addEventListener("storage", update);
    update();
    return () => {
      window.removeEventListener("gaia:permissions:update", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return snapshot;
}
