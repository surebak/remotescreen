"use client";

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import type { User, Auth } from "firebase/auth";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Lazy singleton - only initialized on client
let _auth: Auth | null = null;

async function getAuthLazy(): Promise<Auth> {
  if (_auth) return _auth;
  const [{ getAuth }, { app }] = await Promise.all([
    import("firebase/auth"),
    import("@/lib/firebase"),
  ]);
  _auth = getAuth(app);
  return _auth;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAuthLazy().then((auth) => {
      if (cancelled) return;
      import("firebase/auth").then(({ onAuthStateChanged }) => {
        unsubRef.current = onAuthStateChanged(auth, (u) => {
          setUser(u);
          setLoading(false);
        });
      });
    });
    return () => {
      cancelled = true;
      unsubRef.current?.();
    };
  }, []);

  const signInWithGoogle = async () => {
    const [{ signInWithPopup, GoogleAuthProvider }, auth] = await Promise.all([
      import("firebase/auth"),
      getAuthLazy(),
    ]);
    await signInWithPopup(auth, new GoogleAuthProvider());
  };

  const signOutUser = async () => {
    const [{ signOut }, auth] = await Promise.all([
      import("firebase/auth"),
      getAuthLazy(),
    ]);
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
