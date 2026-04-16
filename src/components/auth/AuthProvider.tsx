"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

type AuthState = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthState>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    try {
      unsub = onAuthStateChanged(
        auth,
        (u) => {
          setUser(u);
          setLoading(false);
        },
        (err) => {
          // Firebase auth observer error — log and unblock the tree.
          console.error("[AuthProvider] onAuthStateChanged error", err);
          setLoading(false);
        },
      );
    } catch (err) {
      // Subscribe-time failure (e.g. misconfigured auth, iframe URL issue in
      // Safari). Swallow so a broken auth layer can never white-screen the
      // whole app.
      console.error("[AuthProvider] subscribe failed", err);
      setLoading(false);
    }
    return () => {
      try {
        unsub?.();
      } catch {
        /* noop */
      }
    };
  }, []);

  const value = useMemo(() => ({ user, loading }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}