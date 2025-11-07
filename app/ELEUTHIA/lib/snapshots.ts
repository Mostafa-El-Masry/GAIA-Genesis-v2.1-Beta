'use client';

export type EncryptedPayload = { iv: string; ct: string };

const SNAP_KEY = "eleu.snapshots"; // array of { id, name, createdAt, payload }

export type Snapshot = {
  id: string;
  name: string;
  createdAt: number;
  payload: EncryptedPayload;
};

function read(): Snapshot[] {
  try {
    const raw = localStorage.getItem(SNAP_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function write(list: Snapshot[]) {
  localStorage.setItem(SNAP_KEY, JSON.stringify(list));
}

export function listSnapshots(): Snapshot[] {
  return read().sort((a, b) => b.createdAt - a.createdAt);
}

export function addSnapshot(s: Snapshot) {
  const list = read();
  list.unshift(s);
  write(list);
}

export function deleteSnapshot(id: string) {
  const list = read().filter(s => s.id !== id);
  write(list);
}
