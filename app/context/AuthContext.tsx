"use client";

import React, { useContext, useEffect, useState, ReactNode } from "react";
import { supabaseClient, onAuthStateChange } from "@/lib/supabase-client";

interface AuthContextType {
  user: any;
  loading: boolean;
  error: string | null;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial user
    supabaseClient.auth.getUser().then(({ data, error }) => {
      if (error) {
        setError(error.message);
      } else {
        setUser(data.user);
      }
      setLoading(false);
    });

    // Subscribe to auth changes
    const subscription = onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setError(null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
