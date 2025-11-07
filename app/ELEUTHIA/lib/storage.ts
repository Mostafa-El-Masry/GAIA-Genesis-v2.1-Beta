'use client';

import type { EleuVault } from "../types";

const META_KEY = "eleu.meta";
const VAULT_KEY = "eleu.vault";

export type EleuMeta = {
  salt: string;      // base64
  iterations: number;
  ver: 1;
};

export function readMeta(): EleuMeta | null {
  try {
    const raw = localStorage.getItem(META_KEY);
    return raw ? (JSON.parse(raw) as EleuMeta) : null;
  } catch { return null; }
}

export function writeMeta(m: EleuMeta) {
  localStorage.setItem(META_KEY, JSON.stringify(m));
}

export function readVaultCipher(): { iv: string; ct: string } | null {
  try {
    const raw = localStorage.getItem(VAULT_KEY);
    return raw ? (JSON.parse(raw) as any) : null;
  } catch { return null; }
}

export function writeVaultCipher(payload: { iv: string; ct: string }) {
  localStorage.setItem(VAULT_KEY, JSON.stringify(payload));
}

export function hasVault(): boolean {
  return !!readMeta() && !!readVaultCipher();
}

export function clearAll() {
  localStorage.removeItem(META_KEY);
  localStorage.removeItem(VAULT_KEY);
}
