import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { api } from '@/src/services/api';
import type { RegistrationPayload, Role, User } from '@/src/types';

interface AuthValue {
  user: User | null;
  role: Role | null;
  booting: boolean;
  signingIn: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signOut: () => void;
  register: (payload: RegistrationPayload) => Promise<User>;
}

const AuthContext = createContext<AuthValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  const signIn = useCallback(async (email: string, password: string) => {
    setSigningIn(true);
    try {
      const signedIn = await api.login(email, password);
      setUser(signedIn);
      return signedIn;
    } finally {
      setSigningIn(false);
    }
  }, []);

  const register = useCallback(async (payload: RegistrationPayload) => {
    const { user: created } = await api.register(payload);
    setUser(created);
    return created;
  }, []);

  const signOut = useCallback(() => setUser(null), []);

  const value = useMemo<AuthValue>(
    () => ({ user, role: user?.role ?? null, booting: false, signingIn, signIn, signOut, register }),
    [user, signingIn, signIn, signOut, register],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
