'use client';

import type { LabProject, LabCategory } from './types';

const PROJ_KEY = 'gaia_labs_projects_v1';
const DB_NAME = 'gaia_labs_covers';
const STORE = 'covers';

export function todayISO(): string {
  return new Date().toISOString();
}
export function nid(): string {
  return (crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2,10)) + Math.random().toString(36).slice(2,10);
}
export function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)+/g,'');
}

// LocalStorage helpers
function get<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); if (raw) return JSON.parse(raw) as T; } catch {}
  return fallback;
}
function set<T>(key: string, value: T) { localStorage.setItem(key, JSON.stringify(value)); }

export function loadProjects(): LabProject[] {
  return get<LabProject[]>(PROJ_KEY, []);
}
export function saveProjects(list: LabProject[]) {
  set(PROJ_KEY, list);
}
export function addProject(data: Omit<LabProject,'id'|'dateAdded'|'views'>): LabProject {
  const list = loadProjects();
  const item: LabProject = { ...data, id: nid(), dateAdded: todayISO(), views: 0 };
  list.push(item); saveProjects(list);
  return item;
}
export function updateProject(id: string, patch: Partial<LabProject>) {
  const list = loadProjects();
  const i = list.findIndex(p=>p.id===id);
  if (i>=0) { list[i] = { ...list[i], ...patch }; saveProjects(list); }
}
export function removeProject(id: string) {
  const list = loadProjects().filter(p=>p.id!==id);
  saveProjects(list);
}
export function bumpViews(id: string) {
  const list = loadProjects();
  const i = list.findIndex(p=>p.id===id);
  if (i>=0) { list[i].views = (list[i].views||0) + 1; saveProjects(list); }
}

// IndexedDB for covers
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
export async function saveCover(id: string, blob: Blob): Promise<void> {
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put({ id, blob });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
export async function getCover(id: string): Promise<Blob|null> {
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve((req.result && req.result.blob) || null);
    req.onerror = () => reject(req.error);
  });
}
export async function deleteCover(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
