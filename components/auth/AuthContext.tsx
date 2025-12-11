// components/auth/AuthContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loginApi, resetPasswordApi, signupApi, type Session } from '../../services/authApi';
import * as authStorage from '../../services/authStorage';

type User = { id: string; email: string };
type Ctx = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthCtx = createContext<Ctx>({
  user: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
});

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const s = await authStorage.loadSession();
      if (s?.user) setUser(s.user);
      setLoading(false);
    })();
  }, []);

  async function applySession(s: Session) {
    await authStorage.saveSession(s);
    setUser(s.user);
  }

  const login  = async (email: string, password: string) => applySession(await loginApi(email, password));
  const signup = async (email: string, password: string) => applySession(await signupApi(email, password));
  const logout = async () => { await authStorage.clearSession(); setUser(null); };
  const resetPassword = async (email: string) => { await resetPasswordApi(email); };

  const value = useMemo(() => ({ user, loading, login, signup, logout, resetPassword }), [user, loading]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);