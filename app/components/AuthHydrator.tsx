"use client";

import { useEffect } from "react";

import { ensureAuthFromSupabaseSession } from "@/lib/auth-client";
import { supabase } from "@/lib/supabase";
import { hydrateUserStorage } from "@/lib/user-storage";

/**
 * Keeps the local auth cache (gaia.auth.*) in sync with Supabase.
 * Ensures a refresh or new tab after a browser restart still knows
 * whether the user has an active Supabase session.
 */
export default function AuthHydrator() {
  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (cancelled) return;
        if (error) {
          console.error("Failed to read Supabase session:", error);
          return;
        }
        const session = data?.session ?? null;
        ensureAuthFromSupabaseSession(session);
        await hydrateUserStorage(session);
      } catch (error) {
        console.error("Unable to hydrate auth session:", error);
      }
    }

    hydrate();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        ensureAuthFromSupabaseSession(session);
        void hydrateUserStorage(session);
      }
    );

    return () => {
      cancelled = true;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  return null;
}
