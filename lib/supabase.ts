// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

type StorageAdapter = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
} | null;

function createSessionStorageAdapter(): StorageAdapter {
  if (typeof window === "undefined") return null;
  try {
    const storage = window.sessionStorage;
    if (!storage) return null;
    return {
      getItem: (key: string) => {
        try {
          return storage.getItem(key);
        } catch {
          return null;
        }
      },
      setItem: (key: string, value: string) => {
        try {
          storage.setItem(key, value);
        } catch {
          // ignore quota/security errors
        }
      },
      removeItem: (key: string) => {
        try {
          storage.removeItem(key);
        } catch {
          // ignore removal errors
        }
      },
    };
  } catch {
    return null;
  }
}

const authStorage = createSessionStorageAdapter();

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: authStorage ?? undefined,
    },
  }
);
